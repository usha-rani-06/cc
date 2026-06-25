import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { title: "", description: "", category: "", location: "" };

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [assignDept, setAssignDept] = useState({});

  const loadComplaints = async () => {
    const res = await api.get("/complaints");
    setComplaints(res.data);
  };

  useEffect(() => {
    loadComplaints();
    api.get("/departments").then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/complaints", form);
      setForm(emptyForm);
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to file complaint");
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    const res = await api.get(`/complaints/${id}/updates`);
    setUpdates(res.data);
    setUpdateMsg("");
    setUpdateStatus("");
  };

  const handleAssign = async (id) => {
    const deptId = assignDept[id];
    if (!deptId) return;
    await api.put(`/complaints/${id}/assign`, { departmentId: Number(deptId) });
    loadComplaints();
  };

  const handlePostUpdate = async (id) => {
    const body = { message: updateMsg };
    if (updateStatus) body.status = updateStatus;
    await api.post(`/complaints/${id}/updates`, body);
    const res = await api.get(`/complaints/${id}/updates`);
    setUpdates(res.data);
    setUpdateMsg("");
    setUpdateStatus("");
    loadComplaints();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    await api.delete(`/complaints/${id}`);
    loadComplaints();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Complaints</h2>

        {user?.role === "CITIZEN" && (
          <form style={styles.form} onSubmit={handleSubmit}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h3>File a New Complaint</h3>
            <input style={styles.input} name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
            <div style={styles.row}>
              <input style={styles.input} name="category" placeholder="Category (e.g. Roads, Water)" value={form.category} onChange={handleChange} />
              <input style={styles.input} name="location" placeholder="Location" value={form.location} onChange={handleChange} />
            </div>
            <textarea style={styles.textarea} name="description" placeholder="Describe the issue" value={form.description} onChange={handleChange} required />
            <button style={styles.button} type="submit">Submit Complaint</button>
          </form>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Status</th><th>Department</th><th>Citizen</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <React.Fragment key={c.id}>
                <tr>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{c.status}</td>
                  <td>{c.department?.name || "-"}</td>
                  <td>{c.citizen?.username}</td>
                  <td>
                    <button style={styles.smallButton} onClick={() => toggleExpand(c.id)}>
                      {expandedId === c.id ? "Hide" : "View"}
                    </button>
                    {user?.role === "ADMIN" && (
                      <button style={styles.smallDeleteButton} onClick={() => handleDelete(c.id)}>Delete</button>
                    )}
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr>
                    <td colSpan={6} style={styles.detailCell}>
                      <p><strong>Description:</strong> {c.description}</p>
                      <p><strong>Location:</strong> {c.location}</p>

                      {user?.role === "ADMIN" && (
                        <div style={styles.assignRow}>
                          <select
                            value={assignDept[c.id] || ""}
                            onChange={(e) => setAssignDept({ ...assignDept, [c.id]: e.target.value })}
                          >
                            <option value="">Assign to department...</option>
                            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <button style={styles.smallButton} onClick={() => handleAssign(c.id)}>Assign</button>
                        </div>
                      )}

                      <h4>Updates</h4>
                      <ul>
                        {updates.map((u) => (
                          <li key={u.id}>
                            <strong>{u.author?.username}</strong> ({u.statusAtUpdate}): {u.message}
                          </li>
                        ))}
                      </ul>

                      {(user?.role === "ADMIN" || user?.role === "DEPARTMENT_STAFF") && (
                        <div style={styles.updateForm}>
                          <input
                            style={styles.input}
                            placeholder="Add a comment/update"
                            value={updateMsg}
                            onChange={(e) => setUpdateMsg(e.target.value)}
                          />
                          <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                            <option value="">Keep status</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                          <button style={styles.smallButton} onClick={() => handlePostUpdate(c.id)}>Post</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px" },
  form: { background: "white", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  row: { display: "flex", gap: "1rem" },
  input: { flex: 1, padding: "8px", margin: "6px 0", borderRadius: "4px", border: "1px solid #ccc" },
  textarea: { width: "100%", padding: "8px", margin: "6px 0", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px", boxSizing: "border-box" },
  button: { padding: "8px 16px", background: "#0f766e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  smallButton: { marginRight: "6px", padding: "4px 10px", background: "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  smallDeleteButton: { padding: "4px 10px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  detailCell: { background: "#f9fafb", padding: "1rem" },
  assignRow: { display: "flex", gap: "8px", margin: "10px 0", alignItems: "center" },
  updateForm: { display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" },
};
