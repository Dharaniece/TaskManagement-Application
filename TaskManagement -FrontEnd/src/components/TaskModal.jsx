import React, { useState, useEffect } from "react";
import Select from "react-select";
import API from "../api";
import "../App.css";

export default function TaskModal({ mode, initial, onClose, onSaved }) {
  const role = localStorage.getItem("role");
  const isUser = role === "User";

  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: [],
    status: "Pending",
    priority: "Medium",
    dueDate: "",
    createdBy: role === "Admin" ? "Admin" : "",
  });

  const [emailOptions, setEmailOptions] = useState([]);

  // 🧠 Load all users for email suggestions
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await API.get("/auth/users");
        const formatted = res.data.map((u) => ({
          label: u.email,
          value: u.email,
        }));
        setEmailOptions(formatted);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (initial) setTask(initial);
  }, [initial]);

  const handleSave = async () => {
  try {
    const role = localStorage.getItem("role");
    const isUser = role === "User";

    const payload = mode === "create"
      ? {
          title: task.title?.trim(),
          description: task.description?.trim() || "",
          assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
          status: task.status || "Pending",
          priority: task.priority || "Medium",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
          createdBy: task.createdBy || "Admin",
        }
      : isUser
      ? { status: task.status } // User only updates status
      : {
          title: task.title?.trim(),
          description: task.description?.trim() || "",
          assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
          status: task.status || "Pending",
          priority: task.priority || "Medium",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        };

    if (mode === "create") {
      if (!payload.title) {
        alert("Title is required!");
        return;
      }
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
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                disabled={mode === "read" || (mode === "edit" && isUser)}
              />
            </div>

            <div>
              <label>Assigned To (Multiple)</label>
              <Select
                isMulti
                name="assignedTo"
                value={(task.assignedTo || []).map((email) => ({
                  label: email,
                  value: email,
                }))}
                onChange={(selected) => {
                  setTask((prev) => ({
                    ...prev,
                    assignedTo: selected.map((opt) => opt.value),
                  }));
                }}
                isDisabled={mode === "read" || (mode === "edit" && isUser)}
                options={emailOptions}
                placeholder="Type to search emails..."
                className="email-select"
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            name="description"
            value={task.description || ""}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            disabled={mode === "read" || (mode === "edit" && isUser)}
          />

          <div className="modal-row">
            <div>
              <label>Status</label>
              <select
                name="status"
                value={task.status || "Pending"}
                onChange={(e) => setTask({ ...task, status: e.target.value })}
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
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                disabled={mode === "read" || (mode === "edit" && isUser)}
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
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                disabled={mode === "read" || (mode === "edit" && isUser)}
              />
            </div>

            <div>
              <label>Created By</label>
              <input name="createdBy" value={task.createdBy || ""} disabled />
            </div>
          </div>

          <div className="modal-row">
            <div>
              <label>Created Date</label>
              <input
                type="text"
                value={
                  task.createdDate
                    ? new Date(task.createdDate).toLocaleDateString()
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
                    ? new Date(task.updatedDate).toLocaleDateString()
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
