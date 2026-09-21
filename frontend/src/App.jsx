import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './App.module.css';

function App() {
  // Main app state:
  // - tasks: the full list coming from the backend
  // - form fields: values for creating a new task
  // - edit fields: values used while editing an existing task
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(1);
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState(1);

  // Load the task list from the backend when the component first mounts.
  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks')
    .then(response => {
      setTasks(response.data);
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });
  }, []);

  // Create a new task and send it to the backend.
  const handleSubmit = (e) => {
    e.preventDefault();

    const newTask = {
      title: title,
      description: description,
      dueDate: dueDate || null,
      priority: Number(priority) || 1,
      category: category
    }

    axios.post('http://localhost:5000/api/tasks', newTask)
    .then(response => {
      setTasks([...tasks, response.data].sort((a, b) => Number(b.priority || 1) - Number(a.priority || 1)));
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority(1);
      setCategory('');
    })
    .catch(error => {
      console.error('Error creating task:', error);
    });

  }

  // Toggle the completed flag for a task and update the local list.
  const handleToggleComplete = (task) => {

    axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
      completed: !task.completed
    })
    .then(response => {
      setTasks(tasks.map(t =>
        t.id === task.id ? response.data : t
      ));
    })
    .catch(error => {
      console.error('Error updating task:', error)
    });

  }

  // Remove a task from the backend and the current UI list.
  const handleDelete = (id) => {

    axios.delete(`http://localhost:5000/api/tasks/${id}`)
    .then(() => {
      setTasks(tasks.filter(t => t.id !== id));
    })
    .catch(error => {
      console.error('Error deleting task:', error);
    })

  }

  // Save changes made in the edit form and close edit mode.
  const handleSaveEdit = (id) => {
    axios.put(`http://localhost:5000/api/tasks/${id}`, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
      priority: editPriority
    })
    .then(response => {
      setTasks(tasks.map(t =>
        t.id === id ? response.data : t
      ));

      setEditingId(null);
    })
    .catch(error => {
      console.error('Error updating task:', error)
    });
  }

  // Helper functions for turning a numeric priority into a readable label and CSS style.
  const getPriorityLabel = (value) => {
    const priorityValue = Number(value) || 1;
    if (priorityValue >= 5) return 'Critical';
    if (priorityValue >= 4) return 'High';
    if (priorityValue >= 3) return 'Medium';
    if (priorityValue >= 2) return 'Low';
    return 'Very Low';
  };

  const getPriorityStyles = (value) => {
    const priorityValue = Number(value) || 1;
    if (priorityValue >= 5) return styles.priorityCritical;
    if (priorityValue >= 4) return styles.priorityHigh;
    if (priorityValue >= 3) return styles.priorityMedium;
    if (priorityValue >= 2) return styles.priorityLow;
    return styles.priorityVeryLow;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No due date';
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return 'No due date';
    return parsedDate.toLocaleDateString();
  };

  // Render the dashboard layout:
  // - top stats summary
  // - task list area with edit/delete actions
  // - form for adding a new task
  return (
    <div className={styles.app}>
      <div className={`${styles.orb} ${styles.orbLeft}`} />
      <div className={`${styles.orb} ${styles.orbRight}`} />

      <main className={styles.layout}>
        <section className={styles.taskSection}>
          <header className={`${styles.surface} ${styles.header}`}>
            <p className={styles.eyebrow}>
              Focus Mode
            </p>
            <h1 className={styles.title}>
              Daily Tracker
            </h1>
            <p className={styles.intro}>
              Organize tasks with a bright, clean workflow. Track priorities, due dates, and completion status in one place.
            </p>
            <div className={styles.stats}>
              <span className={`${styles.stat} ${styles.statTotal}`}>
                {tasks.length} total tasks
              </span>
              <span className={`${styles.stat} ${styles.statCompleted}`}>
                {tasks.filter(task => task.completed).length} completed
              </span>
              <span className={`${styles.stat} ${styles.statPending}`}>
                {tasks.filter(task => !task.completed).length} pending
              </span>
            </div>
          </header>

          {/* Task list section: either show an empty state or render each task card. */}
          <div className={styles.taskList}>
            {tasks.length === 0 ? (
              <div className={styles.emptyState}>
                No tasks yet. Add your first one to get started.
              </div>
            ) : (
              tasks.map(task => (
                <article
                  key={task.id}
                  className={`${styles.surface} ${styles.taskCard}`}
                >
                  {task.id === editingId ? (
                    <div className={styles.editForm}>
                      <div className={styles.formGrid}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={styles.input}
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGrid}>
                        <label className={styles.fieldLabel}>
                          Due Date
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value) }
                            className={styles.input}
                          />
                        </label>

                        <div className={styles.fieldLabel}>
                          <p>
                            Priority: <span className={styles.priorityValue}>{Number(editPriority)}</span>
                          </p>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                            className={styles.range}
                          />
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className={`${styles.button} ${styles.primaryButton}`}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={`${styles.button} ${styles.secondaryButton}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={styles.taskHeader}>
                        <div>
                          <h3 className={styles.taskTitle}>{task.title}</h3>
                          <p className={styles.description}>{task.description || 'No description provided.'}</p>
                        </div>
                        <span className={`${styles.priorityBadge} ${getPriorityStyles(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>

                      <div className={styles.metadata}>
                        <span className={`${styles.badge} ${styles.dueBadge}`}>Due: {formatDate(task.dueDate)}</span>
                        <span className={`${styles.badge} ${task.completed ? styles.completedBadge : styles.pendingBadge}`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        {task.category ? (
                          <span className={`${styles.badge} ${styles.categoryBadge}`}>{task.category}</span>
                        ) : null}
                      </div>

                      <div className={styles.actions}>
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={`${styles.button} ${styles.completeButton}`}
                        >
                          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(task.id);
                            setEditTitle(task.title);
                            setEditDescription(task.description || '');
                            setEditDueDate(task.dueDate || '');
                            setEditPriority(task.priority || 1);
                          }}
                          className={`${styles.button} ${styles.secondaryButton}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className={`${styles.button} ${styles.deleteButton}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        {/* Panel for creating a new task and assigning its metadata. */}
        <aside className={`${styles.surface} ${styles.formPanel}`}>
          <h2 className={styles.panelTitle}>Add New Task</h2>
          <p className={styles.panelIntro}>Capture details fast, then prioritize what matters most.</p>

          <form onSubmit={handleSubmit} className={styles.newTaskForm}>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
            />

            <input
              type="text"
              placeholder="Category"
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.input}
            />
            <datalist id="category-list">
              <option value="Work" />
              <option value="Personal" />
              <option value="School" />
              <option value="Health & Fitness" />
              <option value="Home" />
              <option value="Finance" />
              <option value="Shopping" />
              <option value="Errands" />
              <option value="Travel" />
              <option value="Hobbies" />
            </datalist>

            <div className={styles.formGrid}>
              <label className={styles.fieldLabelDark}>
                Due Date
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.input}
                />
              </label>

              <div className={styles.fieldLabelDark}>
                <p>
                  Priority: <span className="font-semibold">{Number(priority)}</span>
                </p>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={styles.range}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton} ${styles.fullButton}`}
            >
              Add Task
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
}

export default App;