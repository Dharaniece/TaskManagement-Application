import React from "react";
import "../App.css";

export default function TaskTable({ tasks, onRowClick, onEdit, onDelete, role }) {
  return (
    <div className="task-table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Description</th>
            <th className="assigned-column">Assigned To</th>
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
            <tr
              key={task.id}
              onClick={() => onRowClick(task)}
              className="task-row"
            >
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>{task.description}</td>

              <td className="assigned-to-cell">
                {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                  task.assignedTo.map((email, index) => (
                    <div key={index} className="assigned-email">
                      {email}
                    </div>
                  ))
                ) : (
                  <span className="no-assignee">—</span>
                )}
              </td>

              {/* ✅ Status with color */}
              <td>
                <span
                  className={`status-badge ${
                    task.status === "Completed"
                      ? "status-completed"
                      : task.status === "In Progress"
                      ? "status-progress"
                      : "status-pending"
                  }`}
                >
                  {task.status}
                </span>
              </td>

              <td>{task.priority}</td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
              <td>{task.createdBy}</td>
              <td>{task.createdDate ? new Date(task.createdDate).toLocaleDateString() : "—"}</td>
              <td>{task.updatedDate ? new Date(task.updatedDate).toLocaleDateString() : "—"}</td>

              <td className="action-buttons">
                <button
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  Edit
                </button>

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task);
                    }}
                  >
                    Delete
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
