import { useState } from "react";
import API from "../api";

export default function TaskForm({ refresh }) {
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [priority,setPriority]=useState("Medium");

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", { title, description, priority, status: "Open" });
      setTitle(""); setDescription(""); setPriority("Medium");
      refresh();
    } catch (err) {
      alert(err.response?.data || "Error adding task");
    }
  };

  return (
    <form onSubmit={addTask} className="task-form">
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required/>
      <input placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      <select value={priority} onChange={e=>setPriority(e.target.value)}>
        <option>Low</option><option>Medium</option><option>High</option>
      </select>
      <button type="submit" className="add-btn">Add Task</button>
    </form>
  );
}
