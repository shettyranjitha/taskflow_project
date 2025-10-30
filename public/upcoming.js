// upcoming.js
const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
if (!token) {
  alert('Please log in first!');
  window.location.href = 'login.html';
}

function makeHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

const tasksContainer = document.getElementById('tasksContainer');
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Logged out successfully!');
    window.location.href = 'login.html';
  });
}

// display upcoming tasks
function displayTasks(tasks) {
  tasksContainer.innerHTML = '';
  if (!tasks.length) {
    tasksContainer.innerHTML = '<p>No upcoming tasks found.</p>';
    return;
  }

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'item-card';

    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description || ''}</p>
      <p><strong>Due:</strong> ${task.dueDate ? task.dueDate.slice(0,10) : 'N/A'}</p>
      <p><strong>Status:</strong> ❌ Pending</p>
      <div class="btn-group">
        <button class="btn-toggle" data-id="${task._id}" data-completed="${task.completed}">
          Mark Complete
        </button>
        <button class="btn-delete" data-id="${task._id}">Delete</button>
      </div>
    `;
    tasksContainer.appendChild(div);
  });

  // mark complete handler
  tasksContainer.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: 'PUT',
          headers: makeHeaders(),
          body: JSON.stringify({ completed: true }),
        });
        if (res.ok) await loadUpcomingTasks();
        else alert('Failed to update task');
      } catch (err) {
        console.error(err);
        alert('Server error');
      }
    });
  });

  // delete handler
  tasksContainer.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('Delete this task?')) return;
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: 'DELETE',
          headers: makeHeaders(),
        });
        if (res.ok) await loadUpcomingTasks();
        else alert('Failed to delete task');
      } catch (err) {
        console.error(err);
        alert('Server error');
      }
    });
  });
}

// fetch and show only upcoming (not completed) tasks
async function loadUpcomingTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`, { headers: makeHeaders() });
    const data = await res.json();
    const today = new Date();

    const upcoming = Array.isArray(data)
      ? data.filter(
          t =>
            t.dueDate &&
            new Date(t.dueDate) > today &&
            t.completed === false
        )
      : [];

    displayTasks(upcoming);
  } catch (err) {
    console.error('Error loading tasks:', err);
    tasksContainer.innerHTML = '<p style="color:red;">Failed to load tasks.</p>';
  }
}

loadUpcomingTasks();
