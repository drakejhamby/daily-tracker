const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Allows the frontend to send JSON bodies for create/update requests.

// file path for the JSON data store used by the app
const tasksFilePath = path.join(__dirname, 'tasks.json');

// Read the current task list from disk.
function getTasks() {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
}

// Write the task list back to disk after mutations.
function saveTasks(tasks) {
    const data = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(tasksFilePath, data);
}

// Return all tasks sorted by priority so the most urgent items appear first.
app.get('/api/tasks', (req,res) => {
    const tasks = getTasks();
    tasks.sort((a, b) => a.priority - b.priority);
    res.json(tasks);
});

// Fetch a single task by its id for detail or edit workflows.
app.get('/api/tasks/:id', (req, res) => {
    const tasks = getTasks();
    const id = req.params.id;
    const chosenTask = tasks.find(task => task.id === Number(id));

    if (!chosenTask) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(chosenTask);
});

// Create a new task from the frontend form data.
app.post('/api/tasks', (req, res) => {
    // 1. Get the current list of tasks
    const tasks = getTasks();

    if(!req.body.title || req.body.title.trim() === '') {
        return res.status(400).json({message: 'Title is required.'});
    }

    // Generate the next ID
    let newId = 1;
    if (tasks.length > 0) {
        const maxId = Math.max(...tasks.map(task => Number(task.id)));
        newId = maxId + 1;
    }

    // 2. Create the new task object using the correct fields
    const newTask = {
        id: newId,
        title: req.body.title,
        description: req.body.description || '', // in case there is no description
        completed: false, // new tasks start as not completed.
        dueDate: req.body.dueDate || null,
        priority: req.body.priority || 1,
        category: req.body.category || ''
    };

    tasks.push(newTask);
    saveTasks(tasks);

    return res.status(201).json(newTask);

    
})

// Update an existing task, merging in any submitted changes while keeping the id fixed.
app.put('/api/tasks/:id', (req, res) => {
    const tasks = getTasks();
    const id = req.params.id; // This comes from the URL.

    const taskIndex = tasks.findIndex(task => task.id === Number(id));

    if (taskIndex === -1) {
        return res.status(404).json({message: 'Task not found'});
    }

    const existingTask = tasks[taskIndex];

    let updatedTask = {
        
        ...existingTask,        // keep all the old values
        ...req.body,            // overwrite only the ones that were sent
        id: existingTask.id     // always protect the id so it can’t be changed
    }
    
    tasks[taskIndex] = updatedTask;

    saveTasks(tasks);
    return res.status(200).json(updatedTask);


})

// Remove a task from storage after confirming it exists.
app.delete('/api/tasks/:id', (req, res) => {
    const tasks = getTasks();
    const id = req.params.id;

    const taskIndex = tasks.findIndex(task => task.id === Number(id));

    if (taskIndex === -1) {
        return res.status(404).json({message: 'Task not found'});
    }

    tasks.splice(taskIndex, 1);
    saveTasks(tasks);

    return res.status(200).json(tasks);
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});