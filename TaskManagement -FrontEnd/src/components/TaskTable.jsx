import React from "react";
import "../App.css";

export default function TaskTable({ tasks, onRead, onEdit, onDelete, role }) {
  if (!tasks || tasks.length === 0) {
    return <p className="no-tasks-text">No tasks available.</p>;
  }

  return (
    <div className="task-table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Description</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Created By</th>
            <th>Created Date</th>
            <th>Updated Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>{task.description || "—"}</td>
              <td>{task.assignedTo || "—"}</td>

              <td>
                <span
                  className={`status-badge ${
                    task.status === "Completed"
                      ? "completed"
                      : task.status === "In Progress"
                      ? "in-progress"
                      : "pending"
                  }`}
                >
                  {task.status}
                </span>
              </td>

              <td>{task.priority}</td>
              <td>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "—"}
              </td>
              <td>{task.createdBy || "—"}</td>
              <td>
                {task.createdDate
                  ? new Date(task.createdDate).toLocaleString()
                  : "—"}
              </td>
              <td>
                {task.updatedDate
                  ? new Date(task.updatedDate).toLocaleString()
                  : "—"}
              </td>

              <td style={{ whiteSpace: "nowrap" }}>
                <button className="read-btn" onClick={() => onRead(task)}>
                  View
                </button>
                <button className="edit-btn" onClick={() => onEdit(task)}>
                  Edit
                </button>
                {role === "Admin" && (
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(task)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
