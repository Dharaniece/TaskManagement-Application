import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", { email, password });

      // ✅ Store JWT token
      const token = res.data.token;
      localStorage.setItem("token", token);

      // ✅ Decode the JWT payload
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      // ✅ Extract user role (from JWT claim)
      const role =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // ✅ Save role & email for later (used in user icon dropdown)
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      // ✅ Redirect to task page
      navigate("/task");
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          <p>
            Don’t have an account?{" "}
            <Link to="/register" className="register-link">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
