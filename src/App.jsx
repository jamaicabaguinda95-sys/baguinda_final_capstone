
import { useEffect, useMemo, useState } from "react";
import "./index.css";

const starterProjects = [
  { id: 1, name: "Website Development" },
  { id: 2, name: "Office Operations" },
];

const starterTasks = [
  {
    id: 1,
    title: "Design the homepage",
    projectId: 1,
    assignee: "Alex",
    priority: "High",
    status: "In Progress",
    dueDate: "2026-11-05",
  },
  {
    id: 2,
    title: "Prepare project proposal",
    projectId: 2,
    assignee: "Jamie",
    priority: "Medium",
    status: "To Do",
    dueDate: "2026-11-10",
  },
  {
    id: 3,
    title: "Review requirements",
    projectId: 1,
    assignee: "Taylor",
    priority: "Low",
    status: "Completed",
    dueDate: "2026-10-25",
  },
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [projects, setProjects] = useState(() =>
    readStorage("ptm-projects", starterProjects)
  );

  const [tasks, setTasks] = useState(() =>
    readStorage("ptm-tasks", starterTasks)
  );

  const [projectName, setProjectName] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    title: "",
    projectId: projects[0]?.id ?? "",
    assignee: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("ptm-projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("ptm-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => ({
    projects: projects.length,
    total: tasks.length,
    completed: tasks.filter(t => t.status === "Completed").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    pending: tasks.filter(t => t.status === "To Do").length,
  }), [projects, tasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filter === "All" || task.status === filter;

    const matchesProject =
      projectFilter === "All" ||
      String(task.projectId) === projectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  function addProject(event) {
    event.preventDefault();
    const name = projectName.trim();

    if (!name) return;

    const project = { id: Date.now(), name };
    setProjects(current => [...current, project]);
    setProjectName("");
  }

  function openNewTask() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      projectId: projects[0]?.id ?? "",
    });
    setShowForm(true);
  }

  function editTask(task) {
    setEditingId(task.id);
    setForm({ ...task });
    setShowForm(true);
  }

  function saveTask(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.projectId) return;

    const task = {
      ...form,
      id: editingId ?? Date.now(),
      projectId: Number(form.projectId),
      title: form.title.trim(),
      assignee: form.assignee.trim() || "Unassigned",
    };

    if (editingId !== null) {
      setTasks(current =>
        current.map(item => item.id === editingId ? task : item)
      );
    } else {
      setTasks(current => [task, ...current]);
    }

    setShowForm(false);
    setEditingId(null);
  }

  function deleteTask(id) {
    if (window.confirm("Delete this task?")) {
      setTasks(current => current.filter(task => task.id !== id));
    }
  }

  function updateStatus(id, status) {
    setTasks(current =>
      current.map(task =>
        task.id === id ? { ...task, status } : task
      )
    );
  }

  function projectNameFor(id) {
    return projects.find(project => project.id === Number(id))?.name
      ?? "Deleted project";
  }

  function formatDate(date) {
    if (!date) return "No deadline";
    return new Date(date + "T00:00:00").toLocaleDateString();
  }

  const completion = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">P</span>
          <span>ProjectFlow</span>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <a className="nav-item active" href="#dashboard">▦ Dashboard</a>
        <a className="nav-item" href="#projects">▤ Projects</a>
        <a className="nav-item" href="#tasks">✓ Tasks</a>

        <div className="sidebar-bottom">
          <div className="avatar">AD</div>
          <div>
            <strong>Administrator</strong>
            <small>Project Manager</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">WORKSPACE / OVERVIEW</span>
            <h1 id="dashboard">Project Dashboard</h1>
            <p className="muted">Manage your team's projects and daily tasks.</p>
          </div>
          <button className="primary-btn" onClick={openNewTask}>
            + Create Task
          </button>
        </header>

        <section className="stats-grid">
          <StatCard label="Total Projects" value={stats.projects} icon="▤" />
          <StatCard label="Total Tasks" value={stats.total} icon="☷" />
          <StatCard label="In Progress" value={stats.inProgress} icon="◷" />
          <StatCard label="Completed" value={stats.completed} icon="✓" />
        </section>

        <section className="content-grid">
          <div className="panel progress-panel">
            <div className="panel-heading">
              <div>
                <h2>Overall Progress</h2>
                <p className="muted">Completion across all tasks</p>
              </div>
              <span className="progress-number">{completion}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="progress-footer">
              <span>{stats.completed} completed</span>
              <span>{stats.pending} to do</span>
            </div>
          </div>

          <div className="panel project-panel" id="projects">
            <div className="panel-heading">
              <div>
                <h2>Projects</h2>
                <p className="muted">Your active workspaces</p>
              </div>
            </div>

            <form className="project-form" onSubmit={addProject}>
              <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="New project name"
                aria-label="New project name"
                required
              />
              <button className="primary-btn" type="submit">Add</button>
            </form>

            <div className="project-list">
              {projects.map(project => {
                const count = tasks.filter(
                  task => task.projectId === project.id
                ).length;

                return (
                  <div className="project-row" key={project.id}>
                    <span className="project-icon">▤</span>
                    <div className="project-details">
                      <strong>{project.name}</strong>
                      <small>{count} tasks</small>
                    </div>
                    <span className="project-dot" />
                  </div>
                );
              })}
              {projects.length === 0 && (
                <p className="muted">Add your first project above.</p>
              )}
            </div>
          </div>
        </section>

        <section className="panel tasks-panel" id="tasks">
          <div className="panel-heading tasks-heading">
            <div>
              <h2>Task Management</h2>
              <p className="muted">Create, assign, and track team tasks.</p>
            </div>
            <span className="task-count">{filteredTasks.length} tasks</span>
          </div>

          <div className="filters">
            <input
              className="search-input"
              placeholder="Search tasks or assignees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              aria-label="Filter by project"
            >
              <option value="All">All projects</option>
              {projects.map(project => (
                <option key={project.id} value={String(project.id)}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option>All</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Due date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <strong className="task-title">{task.title}</strong>
                    </td>
                    <td>{projectNameFor(task.projectId)}</td>
                    <td>
                      <span className="assignee">
                        {task.assignee.slice(0, 1).toUpperCase()}
                      </span>
                      {task.assignee}
                    </td>
                    <td>
                      <span className={`priority ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{formatDate(task.dueDate)}</td>
                    <td>
                      <select
                        className={`status-select ${task.status.toLowerCase().replace(" ", "-")}`}
                        value={task.status}
                        onChange={e => updateStatus(task.id, e.target.value)}
                        aria-label={`Status for ${task.title}`}
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-btn"
                          title="Edit task"
                          aria-label="Edit task"
                          onClick={() => editTask(task)}
                        >✎</button>
                        <button
                          className="icon-btn delete-btn"
                          title="Delete task"
                          aria-label="Delete task"
                          onClick={() => deleteTask(task.id)}
                        >×</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTasks.length === 0 && (
              <div className="empty-state">
                <span>☷</span>
                <strong>No tasks found</strong>
                <p>Try another filter or create a new task.</p>
                <button className="primary-btn" onClick={openNewTask}>
                  Create your first task
                </button>
              </div>
            )}
          </div>
        </section>

        <footer>ProjectFlow · Project and Task Management System</footer>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={e => {
          if (e.target === e.currentTarget) setShowForm(false);
        }}>
          <form className="task-modal" onSubmit={saveTask}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">TASK MANAGEMENT</span>
                <h2>{editingId !== null ? "Edit Task" : "Create New Task"}</h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >×</button>
            </div>

            <label>
              Task title *
              <input
                required
                autoFocus
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Prepare project report"
              />
            </label>

            <label>
              Project *
              <select
                required
                value={form.projectId}
                onChange={e => setForm({ ...form, projectId: e.target.value })}
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Assigned to
              <input
                value={form.assignee}
                onChange={e => setForm({ ...form, assignee: e.target.value })}
                placeholder="Team member name"
              />
            </label>

            <div className="form-row">
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </label>
            </div>

            <label>
              Due date
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowForm(false)}
              >Cancel</button>
              <button className="primary-btn" type="submit">
                {editingId !== null ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

export default App;
