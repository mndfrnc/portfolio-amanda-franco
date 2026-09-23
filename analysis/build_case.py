import json
import sqlite3
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parent
SQL_PATH = ROOT / "sql" / "business_analysis.sql"


def _records(frame):
    return json.loads(frame.to_json(orient="records", date_format="iso"))


def _prepare(raw_dir):
    accounts = pd.read_csv(raw_dir / "accounts.csv")
    products = pd.read_csv(raw_dir / "products.csv")
    pipeline = pd.read_csv(raw_dir / "sales_pipeline.csv")
    teams = pd.read_csv(raw_dir / "sales_teams.csv")

    accounts["sector"] = accounts["sector"].replace({"technolgy": "technology"})
    accounts["office_location"] = accounts["office_location"].replace({"Philipines": "Philippines"})
    pipeline["product"] = pipeline["product"].replace({"GTXPro": "GTX Pro"})
    pipeline["engage_date"] = pd.to_datetime(pipeline["engage_date"], errors="coerce")
    pipeline["close_date"] = pd.to_datetime(pipeline["close_date"], errors="coerce")
    pipeline["close_value"] = pd.to_numeric(pipeline["close_value"], errors="coerce")

    opportunities = (
        pipeline.merge(products, on="product", how="left")
        .merge(teams, on="sales_agent", how="left")
        .merge(accounts, on="account", how="left")
    )
    as_of = opportunities["close_date"].max()
    opportunities["open_age_days"] = (as_of - opportunities["engage_date"]).dt.days
    return accounts, products, teams, opportunities, as_of


def _priority_queue(opportunities):
    queue = opportunities[opportunities["deal_stage"].eq("Engaging")].copy()

    def priority(row):
        if row["open_age_days"] >= 180:
            return "Crítica"
        if row["open_age_days"] >= 90 or pd.isna(row["account"]):
            return "Alta"
        return "Monitorar"

    def reason(row):
        reasons = []
        if row["open_age_days"] >= 180:
            reasons.append("180+ dias sem fechamento")
        elif row["open_age_days"] >= 90:
            reasons.append("90+ dias sem fechamento")
        if pd.isna(row["account"]):
            reasons.append("conta não associada")
        return " · ".join(reasons) or "acompanhar evolução"

    queue["priority"] = queue.apply(priority, axis=1)
    queue["action_reason"] = queue.apply(reason, axis=1)
    queue["account"] = queue["account"].fillna("Conta não informada")
    priority_order = pd.Categorical(queue["priority"], ["Crítica", "Alta", "Monitorar"], ordered=True)
    queue = queue.assign(_priority_order=priority_order).sort_values(
        ["_priority_order", "open_age_days", "sales_price"], ascending=[True, False, False]
    )
    fields = [
        "opportunity_id",
        "priority",
        "action_reason",
        "open_age_days",
        "sales_agent",
        "manager",
        "regional_office",
        "product",
        "series",
        "account",
        "sector",
        "sales_price",
        "engage_date",
    ]
    return queue[fields]


def build_case(raw_dir, output_dir):
    raw_dir = Path(raw_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    accounts, products, teams, opportunities, as_of = _prepare(raw_dir)
    unmatched_products = int(opportunities["sales_price"].isna().sum())
    unmatched_agents = int(opportunities["manager"].isna().sum())
    unmatched_accounts = int(opportunities.loc[opportunities["account"].notna(), "sector"].isna().sum())
    if unmatched_products or unmatched_agents or unmatched_accounts:
        raise ValueError("Relacionamentos não reconciliados após a limpeza")

    database_path = output_dir / "analysis.sqlite"
    connection = sqlite3.connect(database_path)
    try:
        accounts.to_sql("accounts", connection, if_exists="replace", index=False)
        products.to_sql("products", connection, if_exists="replace", index=False)
        teams.to_sql("sales_teams", connection, if_exists="replace", index=False)
        opportunities.to_sql("opportunities", connection, if_exists="replace", index=False)
        connection.executescript(SQL_PATH.read_text(encoding="utf-8"))
        query_results = {
            name: pd.read_sql_query(f"SELECT * FROM {name}", connection)
            for name in [
                "monthly_performance",
                "product_performance",
                "team_performance",
                "sector_performance",
                "engaging_age_buckets",
                "region_backlog",
            ]
        }
    finally:
        connection.close()

    closed = opportunities[opportunities["deal_stage"].isin(["Won", "Lost"])]
    engaging = opportunities[opportunities["deal_stage"].eq("Engaging")]
    queue = _priority_queue(opportunities)
    kpis = {
        "source_opportunities": int(len(opportunities)),
        "closed_deals": int(len(closed)),
        "won_deals": int((closed["deal_stage"] == "Won").sum()),
        "win_rate": round(float((closed["deal_stage"] == "Won").mean()), 4),
        "revenue": int(closed["close_value"].sum()),
        "median_cycle_days": int((closed["close_date"] - closed["engage_date"]).dt.days.median()),
        "engaging_deals": int(len(engaging)),
        "engaging_90_plus": int((engaging["open_age_days"] >= 90).sum()),
        "engaging_180_plus": int((engaging["open_age_days"] >= 180).sum()),
        "engaging_missing_account": int(engaging["account"].isna().sum()),
        "engaging_reference_value": int(engaging["sales_price"].sum()),
    }
    dashboard = {
        "meta": {
            "title": "Pipeline Health",
            "subtitle": "CRM & Revenue Operations",
            "as_of": as_of.date().isoformat(),
            "source_period": "2016-10-20 a 2017-12-31",
        },
        "provenance": {
            "data_type": "dataset fornecido para o case",
            "analysis": "execução local com SQL e Python",
            "crm_actions": "recomendações e automações desenhadas, não ativadas em sistema real",
            "external_actions_performed": False,
        },
        "kpis": kpis,
        "findings": [
            {
                "title": "Backlog envelhecido",
                "value": "93%",
                "detail": "1.479 de 1.589 oportunidades em Engaging estavam abertas há pelo menos 90 dias.",
            },
            {
                "title": "Contexto incompleto",
                "value": "68,5%",
                "detail": "1.088 oportunidades em Engaging não tinham uma conta associada.",
            },
            {
                "title": "Concentração operacional",
                "value": "West",
                "detail": "A região reunia 748 oportunidades em Engaging; 679 estavam abertas há 90+ dias.",
            },
        ],
        "monthly": _records(query_results["monthly_performance"]),
        "products": _records(query_results["product_performance"]),
        "teams": _records(query_results["team_performance"]),
        "sectors": _records(query_results["sector_performance"]),
        "age_buckets": _records(query_results["engaging_age_buckets"]),
        "region_backlog": _records(query_results["region_backlog"]),
        "priority_queue": _records(queue),
        "filters": {
            "regions": sorted(queue["regional_office"].dropna().unique().tolist()),
            "managers": sorted(queue["manager"].dropna().unique().tolist()),
            "agents": sorted(queue["sales_agent"].dropna().unique().tolist()),
            "products": sorted(queue["product"].dropna().unique().tolist()),
            "priorities": ["Crítica", "Alta", "Monitorar"],
        },
        "solution": {
            "crm_views": [
                "Engaging 180+ dias",
                "Engaging 90–179 dias",
                "Conta não associada",
                "Fila por responsável e região",
            ],
            "automations": [
                "Ao completar 90 dias em Engaging, criar tarefa de revisão para o responsável.",
                "Sem conta associada, direcionar primeiro para enriquecimento antes do follow-up personalizado.",
            ],
        },
    }

    (output_dir / "dashboard.json").write_text(
        json.dumps(dashboard, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    result_dir = output_dir / "query_results"
    result_dir.mkdir(exist_ok=True)
    for name, frame in query_results.items():
        frame.to_csv(result_dir / f"{name}.csv", index=False)

    return {
        "source_rows": int(len(opportunities)),
        "unmatched_products": unmatched_products,
        "unmatched_agents": unmatched_agents,
        "unmatched_accounts": unmatched_accounts,
    }


if __name__ == "__main__":
    analysis_output = ROOT / "output"
    public_output = ROOT.parent / "public" / "pipeline-health" / "data"
    result = build_case(ROOT / "data" / "raw", analysis_output)
    public_output.mkdir(parents=True, exist_ok=True)
    (public_output / "dashboard.json").write_text(
        (analysis_output / "dashboard.json").read_text(encoding="utf-8"), encoding="utf-8"
    )
    print(json.dumps(result, ensure_ascii=False))
