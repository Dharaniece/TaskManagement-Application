import React, { useEffect, useState } from "react";
import API from "../api";
import TaskModal from "../components/TaskModal";
import "../App.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("read");
  const [selectedTask, setSelectedTask] = useState(null);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Load failed:", err);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(tasks.filter((t) => t.title.toLowerCase().includes(value)));
  };

  const openModal = (mode, task = null) => {
    setModalMode(mode);
    setSelectedTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaved = () => loadTasks();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="tasks-page-container">
      <h2 className="tasks-page-title">Task Management</h2>

      <div className="tasks-topbar">
        {userRole === "Admin" && (
          <button className="create-btn" onClick={() => openModal("create")}>
            + Create New Task
          </button>
        )}

        <input
          type="text"
          placeholder="🔍 Search Task"
          className="search-box"
          value={search}
          onChange={handleSearch}
        />

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="task-table-card">
        <table className="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>AssignedTo</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Updated Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.title}</td>
                  <td>{t.description}</td>
                  <td>{t.assignedTo}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        t.status === "Completed"
                          ? "completed"
                          : t.status === "In Progress"
                          ? "in-progress"
                          : "pending"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{t.priority}</td>
                  <td>{t.dueDate?.split("T")[0]}</td>
                  <td>{t.createdBy}</td>
                  <td>{t.createdDate?.split("T")[0]}</td>
                  <td>{t.updatedDate?.split("T")[0]}</td>

                  <td className="action-buttons" >
                    <button
                      className="read-btn"
                      onClick={() => openModal("read", t)}
                    >
                      View
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => openModal("edit", t)}
                    >
                      Edit
                    </button>
                    {userRole === "Admin" && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(t.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <TaskModal
          mode={modalMode}
          initial={selectedTask}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
