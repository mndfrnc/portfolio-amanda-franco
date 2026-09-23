import json
import tempfile
import unittest
from pathlib import Path

from analysis.build_case import build_case


ROOT = Path(__file__).resolve().parents[1]


class BuildCaseTests(unittest.TestCase):
    def test_builds_reconciled_dashboard_data(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            result = build_case(ROOT / "data" / "raw", Path(temp_dir))
            dashboard = json.loads((Path(temp_dir) / "dashboard.json").read_text(encoding="utf-8"))

        self.assertEqual(result["source_rows"], 8800)
        self.assertEqual(result["unmatched_products"], 0)
        self.assertEqual(dashboard["kpis"]["closed_deals"], 6711)
        self.assertEqual(dashboard["kpis"]["won_deals"], 4238)
        self.assertEqual(dashboard["kpis"]["engaging_deals"], 1589)
        self.assertEqual(dashboard["kpis"]["engaging_90_plus"], 1479)
        self.assertEqual(dashboard["kpis"]["engaging_missing_account"], 1088)

    def test_priority_queue_keeps_action_reason_and_provenance(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            build_case(ROOT / "data" / "raw", Path(temp_dir))
            dashboard = json.loads((Path(temp_dir) / "dashboard.json").read_text(encoding="utf-8"))

        queue = dashboard["priority_queue"]
        self.assertEqual(len(queue), 1589)
        self.assertTrue(all(item["priority"] in {"Crítica", "Alta", "Monitorar"} for item in queue))
        self.assertTrue(all(item["action_reason"] for item in queue))
        self.assertEqual(dashboard["provenance"]["data_type"], "dataset fornecido para o case")
        self.assertFalse(dashboard["provenance"]["external_actions_performed"])


if __name__ == "__main__":
    unittest.main()
