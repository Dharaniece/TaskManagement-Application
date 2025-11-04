import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [role, setRole] = useState("User");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, passwordHash, role });
      alert(" Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || " Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={passwordHash} onChange={(e) => setPasswordHash(e.target.value)} required />
          <label>Role</label>
          <select value={role} placeholder="Select Role" onChange={(e) => setRole(e.target.value)} >

            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
