// completed.js
const API_URL = 'http://localhost:5000/api';

// Check token and redirect to login if missing
const token = localStorage.getItem('token');
if (!token) {
  alert('Please log in first!');
  window.location.href = 'login.html';
}

// helper for headers
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

// render tasks
function displayTasks(tasks) {
  tasksContainer.innerHTML = '';
  if (!tasks.length) {
    tasksContainer.innerHTML = '<p>No completed tasks found.</p>';
    return;
  }

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'item-card';
    // mark completed visually
    div.classList.add('completed');

    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description || ''}</p>
      <p><strong>Due:</strong> ${task.dueDate ? task.dueDate.slice(0,10) : 'N/A'}</p>
      <p><strong>Status:</strong> ✅ Completed</p>
      <div class="btn-group">
        <button class="btn-toggle" data-id="${task._id}" data-completed="${task.completed}">
          Mark Incomplete
        </button>
        <button class="btn-delete" data-id="${task._id}">Delete</button>
      </div>
    `;
    tasksContainer.appendChild(div);
  });

  // attach delegated listeners for toggle & delete
  tasksContainer.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      const completed = btn.dataset.completed === 'true';
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: 'PUT',
          headers: makeHeaders(),
          body: JSON.stringify({ completed: !completed }),
        });
        if (res.ok) await loadCompletedTasks();
        else alert('Failed to update task');
      } catch (err) {
        console.error(err);
        alert('Server error');
      }
    });
  });

  tasksContainer.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('Delete this task?')) return;
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: 'DELETE',
          headers: makeHeaders(),
        });
        if (res.ok) await loadCompletedTasks();
        else alert('Failed to delete task');
      } catch (err) {
        console.error(err);
        alert('Server error');
      }
    });
  });
}

// load completed tasks (fetch all then filter client-side)
async function loadCompletedTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`, { headers: makeHeaders() });
    const data = await res.json();
    const completed = Array.isArray(data) ? data.filter(t => t.completed) : [];
    displayTasks(completed);
  } catch (err) {
    console.error('Error loading tasks:', err);
    tasksContainer.innerHTML = '<p style="color:red;">Failed to load tasks.</p>';
  }
}

// initial load
loadCompletedTasks();
