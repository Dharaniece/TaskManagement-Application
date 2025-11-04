import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Task from "./pages/Task";
import "./App.css";

function App() {
  return (
    <Router>
  
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/task" element={<Task/>} />
      </Routes>
    </Router>
  );
}

export default App;
