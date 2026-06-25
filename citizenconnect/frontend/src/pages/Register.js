import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", role: "CITIZEN", departmentId: "" });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // departments list is public-ish for registration purposes; fetch only if needed
    api.get("/departments").then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = { ...form };
      if (form.role !== "DEPARTMENT_STAFF") delete payload.departmentId;
      else payload.departmentId = Number(form.departmentId);
      await register(payload);
      setSuccess("Registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>CitizenConnect</h2>
        <h3>Register</h3>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <input style={styles.input} name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input style={styles.input} name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
        <input style={styles.input} name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input style={styles.input} name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
        <select style={styles.input} name="role" value={form.role} onChange={handleChange}>
          <option value="CITIZEN">Citizen</option>
          <option value="DEPARTMENT_STAFF">Department Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        {form.role === "DEPARTMENT_STAFF" && (
          <select style={styles.input} name="departmentId" value={form.departmentId} onChange={handleChange} required>
            <option value="">Select Department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        <button style={styles.button} type="submit">Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f4f8" },
  form: { background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "320px" },
  input: { display: "block", width: "100%", padding: "10px", margin: "10px 0", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" },
  button: { width: "100%", padding: "10px", background: "#0f766e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red" },
  success: { color: "green" },
};
