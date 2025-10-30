const API_URL = 'http://localhost:5000/api';

/* --------------------------------------------------
   🟢 LOGIN FUNCTIONALITY
-------------------------------------------------- */
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageEl = document.getElementById('message');

    if (!email || !password) {
      messageEl.textContent = 'Please fill in all fields.';
      messageEl.style.color = 'red';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // ✅ Save token in localStorage
        localStorage.setItem('token', data.token);
        // Optional: Save user info if needed
        localStorage.setItem('user', JSON.stringify(data.user));

        messageEl.textContent = 'Login successful! Redirecting...';
        messageEl.style.color = 'green';

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);
      } else {
        messageEl.textContent = data.message || 'Invalid credentials.';
        messageEl.style.color = 'red';
      }
    } catch (error) {
      console.error('Error:', error);
      messageEl.textContent = 'Server error. Please try again later.';
      messageEl.style.color = 'red';
    }
  });
}

/* --------------------------------------------------
   🟣 REGISTER FUNCTIONALITY
-------------------------------------------------- */
if (document.getElementById('registerForm')) {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageEl = document.getElementById('message');

    if (!name || !email || !password) {
      messageEl.textContent = 'Please fill in all fields.';
      messageEl.style.color = 'red';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        messageEl.textContent = 'Registration successful! Redirecting to login...';
        messageEl.style.color = 'green';

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } else {
        messageEl.textContent = data.message || 'Registration failed.';
        messageEl.style.color = 'red';
      }
    } catch (error) {
      console.error('Error:', error);
      messageEl.textContent = 'Server error. Try again later.';
      messageEl.style.color = 'red';
    }
  });
}

/* --------------------------------------------------
   🟡 DASHBOARD FUNCTIONALITY
-------------------------------------------------- */
if (document.getElementById('addTaskForm')) {
  // ✅ Check token
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in first!');
    window.location.href = 'login.html';
  }

  // Helper to always include token
  function makeHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  const addTaskForm = document.getElementById('addTaskForm');
  const tasksContainer = document.getElementById('tasksContainer');
  const logoutBtn = document.getElementById('logoutBtn');
  const searchBtn = document.getElementById('searchBtn');

  /* 🔴 LOGOUT FUNCTION */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Logged out successfully!');
      window.location.href = 'login.html';
    });
  }

  /* 🟢 FETCH TASKS FUNCTION */
  async function fetchTasks(query = '') {
    try {
      const res = await fetch(`${API_URL}/tasks${query}`, {
        headers: makeHeaders(),
      });
      const data = await res.json();

      tasksContainer.innerHTML = '';

      if (!data.length) {
        tasksContainer.innerHTML = '<p>No tasks found.</p>';
        return;
      }

      data.forEach((task) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        if (new Date(task.dueDate) < new Date() && !task.completed)
          div.classList.add('overdue');
        if (task.completed) div.classList.add('completed');

        div.innerHTML = `
          <h3>${task.title}</h3>
          <p>${task.description || ''}</p>
          <p><strong>Due:</strong> ${task.dueDate ? task.dueDate.slice(0, 10) : 'N/A'}</p>
          <p><strong>Status:</strong> ${task.completed ? '✅ Completed' : '❌ Pending'}</p>
          <div class="btn-group">
            <button onclick="toggleComplete('${task._id}', ${task.completed})" class="btn-toggle">
              ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button onclick="deleteTask('${task._id}')" class="btn-delete">Delete</button>
          </div>
        `;
        tasksContainer.appendChild(div);
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      tasksContainer.innerHTML =
        '<p style="color:red;">Failed to load tasks. Please try again later.</p>';
    }
  }

  /* 🟠 ADD TASK */
  addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDesc').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;

    if (!title) {
      alert('Please enter a task title');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: makeHeaders(),
        body: JSON.stringify({ title, description, dueDate }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Task added successfully!');
        addTaskForm.reset();
        // fetchTasks();
        window.location.href ='dashboard.html';
      } else {
        alert(data.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Server error. Please try again later.');
    }
  });

  /* 🔍 SEARCH / FILTER TASKS */
  searchBtn.addEventListener('click', () => {
    const keyword = document.getElementById('searchKeyword').value.trim();
    // const fromDate = document.getElementById('filterFrom').value;
    // const toDate = document.getElementById('filterTo').value;
    // const completed = document.getElementById('filterCompleted').value;

    let query = '/search?';
    if (keyword) query += `keyword=${keyword}&`;
    // if (fromDate) query += `fromDate=${fromDate}&`;
    // if (toDate) query += `toDate=${toDate}&`;
    // if (completed) query += `completed=${completed}&`;

    fetchTasks(query);
  });

  /* ✅ TOGGLE COMPLETE STATUS */
  window.toggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: makeHeaders(),
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) fetchTasks();
      else alert('Failed to update task status');
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  /* ❌ DELETE TASK */
  window.deleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: makeHeaders(),
      });
      if (res.ok) fetchTasks();
      else alert('Failed to delete task');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  /* ⏰ AUTO REMINDER CHECK */
  setInterval(async () => {
    try {
      const res = await fetch(`${API_URL}/tasks/due-reminders`, {
        headers: makeHeaders(),
      });
      const data = await res.json();
      if (data.tasks?.length) {
        console.log('⏰ Upcoming / Overdue tasks:', data.tasks);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }, 60000);


  // ********************###############******************************

  // 🔄 Load tasks initially
  fetchTasks();
}
