import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
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

  useEffect(() => {
    // Fetch tasks from the backend here
    axios.get('http://localhost:5000/api/tasks')
    .then(response => {
      // response.data is the array of tasks
      setTasks(response.data);
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });
  }, []);

  // Sending new task data to the backend
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
      setTasks([...tasks, response.data]); // add the new task to the list
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

  // Function for completing tasks
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

  // Function for deleting the task
  const handleDelete = (id) => {

    axios.delete(`http://localhost:5000/api/tasks/${id}`)
    .then(() => {
      setTasks(tasks.filter(t => t.id !== id));
    })
    .catch(error => {
      console.error('Error deleting task:', error);
    })

  }

  // Function for saving an edit
  const handleSaveEdit = (id) => {
    axios.put(`http://localhost:5000/api/tasks/${id}`, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
      priority: editPriority
    })
    .then(response => {
      // Update the task in state
      setTasks(tasks.map(t =>
        t.id === id ? response.data : t
      ));

      // Exit edit mode
      setEditingId(null);
    })
    .catch(error => {
      console.error('Error updating task:', error)
    });
  }

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
    if (priorityValue >= 5) return 'bg-rose-500/15 text-rose-700 ring-rose-300';
    if (priorityValue >= 4) return 'bg-orange-500/15 text-orange-700 ring-orange-300';
    if (priorityValue >= 3) return 'bg-amber-500/15 text-amber-700 ring-amber-300';
    if (priorityValue >= 2) return 'bg-emerald-500/15 text-emerald-700 ring-emerald-300';
    return 'bg-sky-500/15 text-sky-700 ring-sky-300';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No due date';
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return 'No due date';
    return parsedDate.toLocaleDateString();
  };

  // Return statement
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_#fde68a_0%,_#fef3c7_30%,_#f8fafc_70%)] text-slate-800">
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />

      <main className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-10 lg:py-12">
        <section className="space-y-6">
          <header className="animate-fade-up rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_20px_65px_-40px_rgba(2,132,199,0.5)] backdrop-blur-md sm:p-8">
            <p className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Focus Mode
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Daily Tracker
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Organize tasks with a bright, clean workflow. Track priorities, due dates, and completion status in one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-700">
                {tasks.length} total tasks
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
                {tasks.filter(task => task.completed).length} completed
              </span>
              <span className="rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-700">
                {tasks.filter(task => !task.completed).length} pending
              </span>
            </div>
          </header>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 p-8 text-center text-slate-500 shadow-sm backdrop-blur-sm">
                No tasks yet. Add your first one to get started.
              </div>
            ) : (
              tasks.map(task => (
                <article
                  key={task.id}
                  className="animate-fade-up rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_14px_40px_-28px_rgba(2,132,199,0.55)] transition hover:shadow-[0_18px_45px_-24px_rgba(14,165,233,0.4)]"
                >
                  {task.id === editingId ? (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2"
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm font-medium text-slate-600">
                          Due Date
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value) }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-300 focus:ring-2"
                          />
                        </label>

                        <div className="space-y-2 text-sm font-medium text-slate-600">
                          <p>
                            Priority: <span className="font-semibold">{Number(editPriority)}</span>
                          </p>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-sky-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{task.description || 'No description provided.'}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityStyles(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1">Due: {formatDate(task.dueDate)}</span>
                        <span className={`rounded-full px-3 py-1 ${task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        {task.category ? (
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">{task.category}</span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className="rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
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
                          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="rounded-xl bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
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

        <aside className="animate-fade-up h-fit rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_65px_-38px_rgba(2,132,199,0.45)] backdrop-blur sm:p-8 lg:sticky lg:top-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add New Task</h2>
          <p className="mt-2 text-sm text-slate-600">Capture details fast, then prioritize what matters most.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2"
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2"
            />

            <input
              type="text"
              placeholder="Category"
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none ring-sky-300 placeholder:text-slate-400 focus:ring-2"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Due Date
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none ring-sky-300 focus:ring-2"
                />
              </label>

              <div className="space-y-2 text-sm font-medium text-slate-700">
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
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
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