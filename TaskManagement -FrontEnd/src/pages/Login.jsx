import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      const tokenParts = res.data.token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      localStorage.setItem("role", role);

      navigate("/task");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <button className="register-btn inside-login" onClick={() => navigate("/register")}>
          Register
        </button>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
