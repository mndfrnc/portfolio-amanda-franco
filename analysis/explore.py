from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parent
RAW = ROOT / "data" / "raw"


accounts = pd.read_csv(RAW / "accounts.csv")
products = pd.read_csv(RAW / "products.csv")
pipeline = pd.read_csv(RAW / "sales_pipeline.csv")
teams = pd.read_csv(RAW / "sales_teams.csv")

pipeline["product_clean"] = pipeline["product"].replace({"GTXPro": "GTX Pro"})
pipeline["engage_date"] = pd.to_datetime(pipeline["engage_date"], errors="coerce")
pipeline["close_date"] = pd.to_datetime(pipeline["close_date"], errors="coerce")
pipeline["close_value"] = pd.to_numeric(pipeline["close_value"], errors="coerce")

deals = (
    pipeline.merge(products, left_on="product_clean", right_on="product", how="left", suffixes=("", "_catalog"))
    .merge(teams, on="sales_agent", how="left")
    .merge(accounts, on="account", how="left")
)
deals["is_closed"] = deals["deal_stage"].isin(["Won", "Lost"])
deals["is_won"] = deals["deal_stage"].eq("Won")
deals["cycle_days"] = (deals["close_date"] - deals["engage_date"]).dt.days
deals["price_realization"] = deals["close_value"] / deals["sales_price"]

as_of = deals["close_date"].max()
deals["open_age_days"] = (as_of - deals["engage_date"]).dt.days


def closed_summary(group_columns):
    closed = deals[deals["is_closed"]].copy()
    return (
        closed.groupby(group_columns, dropna=False)
        .agg(
            closed_deals=("opportunity_id", "count"),
            won_deals=("is_won", "sum"),
            win_rate=("is_won", "mean"),
            revenue=("close_value", "sum"),
            median_cycle_days=("cycle_days", "median"),
            avg_price_realization=("price_realization", lambda value: value[closed.loc[value.index, "is_won"]].mean()),
        )
        .reset_index()
        .sort_values("revenue", ascending=False)
    )


print("DIMENSIONS")
print({"accounts": len(accounts), "products": len(products), "pipeline": len(pipeline), "sales_teams": len(teams)})
print("\nQUALITY")
print(
    {
        "duplicate_opportunity_ids": int(pipeline["opportunity_id"].duplicated().sum()),
        "missing_accounts": int(pipeline["account"].isna().sum()),
        "raw_product_mismatches": int((pipeline["product"] == "GTXPro").sum()),
        "unmatched_products_after_cleaning": int(deals["sales_price"].isna().sum()),
        "unmatched_agents": int(deals["manager"].isna().sum()),
        "unmatched_populated_accounts": int(deals.loc[deals["account"].notna(), "sector"].isna().sum()),
    }
)

closed = deals[deals["is_closed"]]
print("\nOVERALL")
print(
    {
        "closed_deals": len(closed),
        "won_deals": int(closed["is_won"].sum()),
        "win_rate": round(float(closed["is_won"].mean()), 4),
        "revenue": float(closed["close_value"].sum()),
        "median_cycle_days": float(closed["cycle_days"].median()),
        "open_engaging": int((deals["deal_stage"] == "Engaging").sum()),
        "median_open_age_days": float(deals.loc[deals["deal_stage"] == "Engaging", "open_age_days"].median()),
        "as_of": as_of.date().isoformat(),
    }
)

for title, columns in [
    ("PRODUCT", ["product_clean", "series"]),
    ("REGION", ["regional_office"]),
    ("MANAGER", ["manager", "regional_office"]),
    ("AGENT", ["sales_agent", "manager", "regional_office"]),
    ("SECTOR", ["sector"]),
]:
    print(f"\n{title}")
    print(closed_summary(columns).to_string(index=False))

print("\nOPEN_ENGAGING_BY_AGENT")
print(
    deals[deals["deal_stage"] == "Engaging"]
    .groupby(["sales_agent", "manager", "regional_office"], dropna=False)
    .agg(open_deals=("opportunity_id", "count"), median_age_days=("open_age_days", "median"), oldest_age_days=("open_age_days", "max"))
    .reset_index()
    .sort_values(["open_deals", "oldest_age_days"], ascending=False)
    .head(15)
    .to_string(index=False)
)

print("\nMISSING_ACCOUNT_BY_STAGE")
print(
    deals.assign(account_missing=deals["account"].isna())
    .groupby("deal_stage")
    .agg(deals=("opportunity_id", "count"), missing_accounts=("account_missing", "sum"), missing_rate=("account_missing", "mean"))
    .reset_index()
    .to_string(index=False)
)

monthly = (
    closed.assign(month=closed["close_date"].dt.to_period("M").astype(str))
    .groupby("month")
    .agg(closed_deals=("opportunity_id", "count"), won_deals=("is_won", "sum"), win_rate=("is_won", "mean"), revenue=("close_value", "sum"))
    .reset_index()
)
print("\nMONTHLY")
print(monthly.to_string(index=False))

engaging = deals[deals["deal_stage"] == "Engaging"].copy()
engaging["age_bucket"] = pd.cut(
    engaging["open_age_days"],
    bins=[-1, 29, 59, 89, 179, float("inf")],
    labels=["0–29", "30–59", "60–89", "90–179", "180+"],
)
print("\nENGAGING_AGE_BUCKETS")
print(
    engaging.groupby("age_bucket", observed=False)
    .agg(
        opportunities=("opportunity_id", "count"),
        missing_accounts=("account", lambda value: value.isna().sum()),
        reference_value=("sales_price", "sum"),
    )
    .reset_index()
    .to_string(index=False)
)

print("\nENGAGING_REGION")
print(
    engaging.groupby("regional_office")
    .agg(
        opportunities=("opportunity_id", "count"),
        median_age_days=("open_age_days", "median"),
        opportunities_90_plus=("open_age_days", lambda value: (value >= 90).sum()),
        missing_accounts=("account", lambda value: value.isna().sum()),
        reference_value=("sales_price", "sum"),
    )
    .reset_index()
    .to_string(index=False)
)

account_revenue = (
    deals[deals["is_won"] & deals["account"].notna()]
    .groupby("account", as_index=False)
    .agg(revenue=("close_value", "sum"), won_deals=("opportunity_id", "count"))
    .sort_values("revenue", ascending=False)
)
print("\nCONCENTRATION")
print(
    {
        "top_5_accounts_revenue_share": round(float(account_revenue.head(5)["revenue"].sum() / account_revenue["revenue"].sum()), 4),
        "top_10_accounts_revenue_share": round(float(account_revenue.head(10)["revenue"].sum() / account_revenue["revenue"].sum()), 4),
        "engaging_90_plus": int((engaging["open_age_days"] >= 90).sum()),
        "engaging_180_plus": int((engaging["open_age_days"] >= 180).sum()),
        "engaging_180_plus_missing_account": int(((engaging["open_age_days"] >= 180) & engaging["account"].isna()).sum()),
        "engaging_reference_value": float(engaging["sales_price"].sum()),
    }
)
