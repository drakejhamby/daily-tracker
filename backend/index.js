const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Needed later so we can receive JSON from React

// Full path to the tasks file
const tasksFilePath = path.join(__dirname, 'tasks.json');

// Helper 1: Read the tasks
function getTasks() {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
}

// Helper 2: Save the tasks
function saveTasks(tasks) {
    const data = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(tasksFilePath, data);
}

// Get the tasks
app.get('/api/tasks', (req,res) => {
    const tasks = getTasks();
    res.json(tasks);
});

// Post a new task
app.post('/api/tasks', (req, res) => {
    // 1. Get the current list of tasks
    const tasks = getTasks();

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

// Update an existing task
app.put('/api/tasks/:id', (req, res) => {
    const tasks = getTasks();
    const id = req.params.id; // This comes from the URL

    // Find the task
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

    saveTasks(tasks)
    return res.status(200).json(updatedTask);


})

// DELETE a task


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});