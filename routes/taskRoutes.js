const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* -------------------------------------------------
   🟢 Add new task
--------------------------------------------------*/
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body; // include dueDate if needed
    const newTask = new Task({
      userId: req.user.id,
      title,
      description,
      dueDate
    });
    await newTask.save();
    res.status(201).json({ message: 'Task added ✅', task: newTask });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* -------------------------------------------------
   🟢 Get all tasks for logged-in user
--------------------------------------------------*/
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* -------------------------------------------------
   🟡 Search & Filter Tasks
   Example:
   GET /api/tasks/search?keyword=work&completed=false&fromDate=2025-10-15&toDate=2025-10-25
--------------------------------------------------*/
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { keyword, completed, fromDate, toDate } = req.query;
    const query = { userId: req.user.id };

    // Search by title or description
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') }
      ];
    }

    // Filter by completion
    if (completed !== undefined) query.completed = completed === 'true';

    // Filter by due date range
    if (fromDate && toDate) {
      query.dueDate = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    } else if (fromDate) {
      query.dueDate = { $gte: new Date(fromDate) };
    } else if (toDate) {
      query.dueDate = { $lte: new Date(toDate) };
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* -------------------------------------------------
   🔔 Due Date Reminders
   - Shows tasks due in next 3 days or overdue
--------------------------------------------------*/
router.get('/due-reminders', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const upcoming = new Date();
    upcoming.setDate(now.getDate() + 3); // next 3 days

    const tasks = await Task.find({
      userId: req.user.id,
      dueDate: { $lte: upcoming },
      completed: false
    }).sort({ dueDate: 1 });

    res.status(200).json({
      message: 'Upcoming / Overdue tasks ⏰',
      tasks
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* -------------------------------------------------
   🟠 Update a task by ID
--------------------------------------------------*/
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, completed } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    res.status(200).json({ message: 'Task updated ✅', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* -------------------------------------------------
   🔴 Delete a task by ID
--------------------------------------------------*/
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted ✅' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
