import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get("/complaints").then((res) => setComplaints(res.data)).catch(() => {});
  }, []);

  const counts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Welcome, {user?.username}</h2>
        <p>Role: {user?.role}</p>
        <div style={styles.cards}>
          <div style={styles.card}><h3>{complaints.length}</h3><p>Total Complaints</p></div>
          <div style={styles.card}><h3>{counts.SUBMITTED || 0}</h3><p>Submitted</p></div>
          <div style={styles.card}><h3>{counts.IN_PROGRESS || 0}</h3><p>In Progress</p></div>
          <div style={styles.card}><h3>{counts.RESOLVED || 0}</h3><p>Resolved</p></div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px" },
  cards: { display: "flex", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap" },
  card: { background: "white", padding: "1.5rem 2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", textAlign: "center", minWidth: "150px" },
};
