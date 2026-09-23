from pathlib import Path

import numpy as np
import pandas as pd

from analysis.build_case import _prepare


ROOT = Path(__file__).resolve().parent
_, _, _, deals, as_of = _prepare(ROOT / "data" / "raw")
closed = deals[deals["deal_stage"].isin(["Won", "Lost"])].copy()
closed["is_won"] = closed["deal_stage"].eq("Won")
closed["cycle_days"] = (closed["close_date"] - closed["engage_date"]).dt.days
closed["month"] = closed["close_date"].dt.to_period("M").astype(str)
closed["price_realization"] = closed["close_value"] / closed["sales_price"]


def summary(frame, groups):
    return (
        frame.groupby(groups, dropna=False)
        .agg(
            deals=("opportunity_id", "count"),
            wins=("is_won", "sum"),
            win_rate=("is_won", "mean"),
            revenue=("close_value", "sum"),
            median_cycle=("cycle_days", "median"),
        )
        .reset_index()
    )


print("CYCLE_QUANTILES")
for label, frame in [("closed", closed), ("won", closed[closed["is_won"]]), ("lost", closed[~closed["is_won"]])]:
    print(label, frame["cycle_days"].quantile([0.25, 0.5, 0.75, 0.9, 0.95]).round(1).to_dict())

closed["cycle_bucket"] = pd.cut(
    closed["cycle_days"], [-1, 29, 59, 89, 119, np.inf], labels=["0–29", "30–59", "60–89", "90–119", "120+"]
)
print("\nOUTCOME_BY_CYCLE")
print(summary(closed, ["cycle_bucket"]).to_string(index=False))

print("\nMONTH_PRODUCT_MIX")
month_product = (
    closed.groupby(["month", "series"])
    .agg(deals=("opportunity_id", "count"), wins=("is_won", "sum"), revenue=("close_value", "sum"))
    .reset_index()
)
month_totals = month_product.groupby("month")["deals"].transform("sum")
month_product["deal_share"] = month_product["deals"] / month_totals
print(month_product.to_string(index=False))

print("\nACCOUNT_SIZE")
account_size = pd.cut(
    closed["employees"], [-1, 499, 1999, 4999, np.inf], labels=["<500", "500–1.999", "2.000–4.999", "5.000+"]
)
print(summary(closed.assign(account_size=account_size), ["account_size"]).to_string(index=False))

print("\nAGENT_BENCHMARK")
agents = summary(closed, ["sales_agent", "manager", "regional_office"])
agents["win_rate_gap_pp"] = (agents["win_rate"] - closed["is_won"].mean()) * 100
print(agents.sort_values("win_rate").to_string(index=False))

print("\nOPEN_VS_HISTORICAL")
engaging = deals[deals["deal_stage"].eq("Engaging")].copy()
engaging["open_age_days"] = (as_of - engaging["engage_date"]).dt.days
historical_p90 = float(closed["cycle_days"].quantile(0.9))
print(
    {
        "historical_closed_cycle_p90": historical_p90,
        "engaging_above_closed_p90": int((engaging["open_age_days"] > historical_p90).sum()),
        "engaging_above_closed_p90_rate": round(float((engaging["open_age_days"] > historical_p90).mean()), 4),
        "engaging_median_age": float(engaging["open_age_days"].median()),
        "engaging_missing_account_rate": round(float(engaging["account"].isna().mean()), 4),
    }
)

print("\nWON_PRICE_REALIZATION")
won = closed[closed["is_won"]]
print(
    won.groupby("product")
    .agg(wins=("opportunity_id", "count"), median_realization=("price_realization", "median"), p10=("price_realization", lambda x: x.quantile(0.1)), p90=("price_realization", lambda x: x.quantile(0.9)))
    .reset_index()
    .to_string(index=False)
)

print("\nDATA_LIMITS")
print(
    {
        "has_activity_history": False,
        "has_stage_history": False,
        "has_lead_source": False,
        "has_campaign_data": False,
        "has_contacts": False,
        "has_cost_or_margin": False,
        "has_quantity": False,
    }
)
