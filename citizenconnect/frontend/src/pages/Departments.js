import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

const emptyForm = { name: "", description: "", contactEmail: "" };

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
      } else {
        await api.post("/departments", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save department");
    }
  };

  const handleEdit = (dept) => {
    setForm({ ...dept });
    setEditingId(dept.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    await api.delete(`/departments/${id}`);
    loadDepartments();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Departments</h2>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={styles.row}>
            <input style={styles.input} name="name" placeholder="Department Name" value={form.name} onChange={handleChange} required />
            <input style={styles.input} name="contactEmail" placeholder="Contact Email" value={form.contactEmail} onChange={handleChange} />
          </div>
          <input style={styles.input} name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <button style={styles.button} type="submit">{editingId ? "Update Department" : "Add Department"}</button>
          {editingId && (
            <button type="button" style={styles.cancelButton} onClick={() => { setForm(emptyForm); setEditingId(null); }}>
              Cancel
            </button>
          )}
        </form>

        <table style={styles.table}>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Contact Email</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.description}</td>
                <td>{d.contactEmail}</td>
                <td>
                  <button style={styles.smallButton} onClick={() => handleEdit(d)}>Edit</button>
                  <button style={styles.smallDeleteButton} onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
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
  button: { padding: "8px 16px", background: "#0f766e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "8px" },
  cancelButton: { padding: "8px 16px", background: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  smallButton: { marginRight: "6px", padding: "4px 10px", background: "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  smallDeleteButton: { padding: "4px 10px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
};
