import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Reports() {
  const [statusSummary, setStatusSummary] = useState({});
  const [deptSummary, setDeptSummary] = useState({});

  useEffect(() => {
    api.get("/complaints/reports/status-summary").then((res) => setStatusSummary(res.data));
    api.get("/complaints/reports/department-summary").then((res) => setDeptSummary(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Reports</h2>

        <div style={styles.section}>
          <h3>Complaints by Status</h3>
          <table style={styles.table}>
            <thead><tr><th>Status</th><th>Count</th></tr></thead>
            <tbody>
              {Object.entries(statusSummary).map(([status, count]) => (
                <tr key={status}><td>{status}</td><td>{count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <h3>Complaints by Department</h3>
          <table style={styles.table}>
            <thead><tr><th>Department</th><th>Count</th></tr></thead>
            <tbody>
              {Object.entries(deptSummary).map(([dept, count]) => (
                <tr key={dept}><td>{dept}</td><td>{count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px" },
  section: { marginBottom: "2rem" },
  table: { width: "100%", maxWidth: "400px", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
};
