import React, { useEffect, useState } from "react";
import API from "../api";
import TaskModal from "../components/TaskModal";
import TaskTable from "../components/TaskTable";
import { FaUserCircle } from "react-icons/fa";
import "../App.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // ✅ status filter
  const [showStatusDropdown, setShowStatusDropdown] = useState(false); // ✅ toggle dropdown
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("read");
  const [selectedTask, setSelectedTask] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    setUserRole(role);
    setUserEmail(email || "Unknown User");
    loadTasks();

    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-menu-container")) setShowMenu(false);
      if (!e.target.closest(".status-filter-container")) setShowStatusDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const loadTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  // 🔹 Filter tasks by search and status
  const applyFilters = (searchText = search, status = statusFilter) => {
    let filteredTasks = tasks;

    if (searchText) {
      filteredTasks = filteredTasks.filter((t) =>
        t.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (status) {
      filteredTasks = filteredTasks.filter(
        (t) => t.status.toLowerCase() === status.toLowerCase()
      );
    }

    setFiltered(filteredTasks);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    applyFilters(value, statusFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters(search, status);
  };

  const openModal = (mode, task = null, isUserEdit = false) => {
    setModalMode(mode);
    setSelectedTask(task ? { ...task, userCanEditStatusOnly: isUserEdit } : null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaved = () => loadTasks();

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;
    try {
      await API.delete(`/tasks/${task.id}`);
      loadTasks();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="tasks-page-container">
      <h2 className="tasks-page-title">Task Management</h2>

      {/* 🔹 Top Bar */}
      <div className="tasks-topbar">
        <button className="create-btn" onClick={() => openModal("create")}>
          + Create Task
        </button>

        <input
          type="text"
          placeholder="🔍 Search tasks"
          className="search-box"
          value={search}
          onChange={handleSearch}
        />

        {/* ✅ Status Filter */}
        <div className="status-filter-container">
          <input
            type="text"
            readOnly
            placeholder="Task Status"
            value={statusFilter}
            className="status-box"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          />
          {showStatusDropdown && (
            <div className="status-dropdown">
              {["Pending", "In Progress", "Completed"].map((status) => (
                <div
                  key={status}
                  className="status-item"
                  onClick={() => handleStatusFilter(status)}
                >
                  {status}
                </div>
              ))}
              <div className="status-item" onClick={() => handleStatusFilter("")}>
                All
              </div>
            </div>
          )}
        </div>

        {/* 👤 User Menu */}
        <div className="user-menu-container">
          <FaUserCircle
            className="user-icon"
            size={34}
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="user-dropdown">
              <div className="user-email">{userEmail}</div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Task Table */}
      <TaskTable
        tasks={filtered}
        onRowClick={(task) => openModal("read", task)}
        onEdit={(task) => openModal("edit", task)}
        onDelete={(task) => handleDelete(task)}
        role={userRole}
      />

      {/* 🔹 Task Modal */}
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
