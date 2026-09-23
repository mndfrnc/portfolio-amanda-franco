DROP VIEW IF EXISTS monthly_performance;
CREATE VIEW monthly_performance AS
SELECT
  substr(close_date, 1, 7) AS month,
  COUNT(*) AS closed_deals,
  SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) AS won_deals,
  ROUND(1.0 * SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) / COUNT(*), 4) AS win_rate,
  SUM(COALESCE(close_value, 0)) AS revenue
FROM opportunities
WHERE deal_stage IN ('Won', 'Lost')
GROUP BY substr(close_date, 1, 7)
ORDER BY month;

DROP VIEW IF EXISTS product_performance;
CREATE VIEW product_performance AS
SELECT
  product,
  series,
  COUNT(*) AS closed_deals,
  SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) AS won_deals,
  ROUND(1.0 * SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) / COUNT(*), 4) AS win_rate,
  SUM(COALESCE(close_value, 0)) AS revenue,
  ROUND(AVG(CASE WHEN deal_stage = 'Won' THEN close_value / sales_price END), 4) AS avg_price_realization
FROM opportunities
WHERE deal_stage IN ('Won', 'Lost')
GROUP BY product, series
ORDER BY revenue DESC;

DROP VIEW IF EXISTS team_performance;
CREATE VIEW team_performance AS
SELECT
  regional_office AS region,
  manager,
  sales_agent AS agent,
  COUNT(*) AS closed_deals,
  SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) AS won_deals,
  ROUND(1.0 * SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) / COUNT(*), 4) AS win_rate,
  SUM(COALESCE(close_value, 0)) AS revenue,
  ROUND(AVG(julianday(close_date) - julianday(engage_date)), 1) AS avg_cycle_days
FROM opportunities
WHERE deal_stage IN ('Won', 'Lost')
GROUP BY regional_office, manager, sales_agent
ORDER BY revenue DESC;

DROP VIEW IF EXISTS sector_performance;
CREATE VIEW sector_performance AS
SELECT
  COALESCE(sector, 'Conta não informada') AS sector,
  COUNT(*) AS closed_deals,
  SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) AS won_deals,
  ROUND(1.0 * SUM(CASE WHEN deal_stage = 'Won' THEN 1 ELSE 0 END) / COUNT(*), 4) AS win_rate,
  SUM(COALESCE(close_value, 0)) AS revenue
FROM opportunities
WHERE deal_stage IN ('Won', 'Lost')
GROUP BY COALESCE(sector, 'Conta não informada')
ORDER BY revenue DESC;

DROP VIEW IF EXISTS engaging_age_buckets;
CREATE VIEW engaging_age_buckets AS
SELECT
  CASE
    WHEN open_age_days < 30 THEN '0–29'
    WHEN open_age_days < 60 THEN '30–59'
    WHEN open_age_days < 90 THEN '60–89'
    WHEN open_age_days < 180 THEN '90–179'
    ELSE '180+'
  END AS age_bucket,
  COUNT(*) AS opportunities,
  SUM(CASE WHEN account IS NULL OR account = '' THEN 1 ELSE 0 END) AS missing_accounts,
  SUM(sales_price) AS reference_value
FROM opportunities
WHERE deal_stage = 'Engaging'
GROUP BY age_bucket;

DROP VIEW IF EXISTS region_backlog;
CREATE VIEW region_backlog AS
SELECT
  regional_office AS region,
  COUNT(*) AS opportunities,
  SUM(CASE WHEN open_age_days >= 90 THEN 1 ELSE 0 END) AS opportunities_90_plus,
  SUM(CASE WHEN account IS NULL OR account = '' THEN 1 ELSE 0 END) AS missing_accounts,
  SUM(sales_price) AS reference_value
FROM opportunities
WHERE deal_stage = 'Engaging'
GROUP BY regional_office
ORDER BY opportunities DESC;
