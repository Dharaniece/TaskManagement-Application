import React, { useState, useEffect } from "react";
import API from "../api";
import "../App.css";

export default function TaskModal({ mode, initial, onClose, onSaved }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "Pending",
    priority: "Medium",
    dueDate: "",
    createdBy: localStorage.getItem("role") === "Admin" ? "Admin" : "",
  });

  useEffect(() => {
    if (initial) setTask(initial);
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: task.title?.trim(),
        description: task.description?.trim() || "",
        assignedTo: task.assignedTo?.trim() || "",
        status: task.status || "Pending",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || null,
        createdBy: task.createdBy || "Admin",
      };

      if (!payload.title) {
        alert("Title is required!");
        return;
      }

      if (mode === "create") {
        await API.post("/tasks", payload);
      } else if (mode === "edit") {
        await API.put(`/tasks/${task.id}`, payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      alert("Save failed! Check console for details.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="task-modal-container">
        <div className="task-modal-header">
          <h3>
            {mode === "create"
              ? "Create New Task"
              : mode === "edit"
              ? "Edit Task"
              : "View Task"}
          </h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="task-modal-body">
          <div className="modal-row">
            <div>
              <label>Title</label>
              <input
                name="title"
                value={task.title || ""}
                onChange={handleChange}
                disabled={mode === "read"}
              />
            </div>

            <div>
              <label>Assigned To</label>
              <input
                name="assignedTo"
                value={task.assignedTo || ""}
                onChange={handleChange}
                disabled={mode === "read"}
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            name="description"
            value={task.description || ""}
            onChange={handleChange}
            disabled={mode === "read"}
          />

          <div className="modal-row">
            <div>
              <label>Status</label>
              <select
                name="status"
                value={task.status || "Pending"}
                onChange={handleChange}
                disabled={mode === "read"}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select
                name="priority"
                value={task.priority || "Medium"}
                onChange={handleChange}
                disabled={mode === "read"}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div className="modal-row">
            <div>
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                onChange={handleChange}
                disabled={mode === "read"}
              />
            </div>

            <div>
              <label>Created By</label>
              <input
                name="createdBy"
                value={task.createdBy || ""}
                onChange={handleChange}
                disabled={mode === "read"}
              />
            </div>
          </div>

          <div className="modal-row">
            <div>
              <label>Created Date</label>
              <input
                type="text"
                value={
                  task.createdDate
                    ? new Date(task.createdDate).toLocaleString()
                    : "—"
                }
                disabled
              />
            </div>

            <div>
              <label>Updated Date</label>
              <input
                type="text"
                value={
                  task.updatedDate
                    ? new Date(task.updatedDate).toLocaleString()
                    : "—"
                }
                disabled
              />
            </div>
          </div>
        </div>

        {(mode === "create" || mode === "edit") && (
          <div className="task-modal-footer">
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
