import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(1);
  const [category, setCategory] = useState('');

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

  return (
    <div>
      <h1>Daily Tracker</h1>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>{task.completed? 'Completed' : 'Pending'}</p>
        </div>
      ))}

      <h2>Submit a New Task</h2>
      <form onSubmit={handleSubmit}>
      
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          list="category-list" 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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

        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          placeholder="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <label>Priority: {priority}</label>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />

        <button type="submit">Add Task</button>
      </form>
    </div>
  );
}

export default App;