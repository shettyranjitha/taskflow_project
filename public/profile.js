// profile.js
const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileJoined = document.getElementById('profileJoined');
const editModal = document.getElementById('editModal');
const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEdit = document.getElementById('cancelEdit');
const editForm = document.getElementById('editForm');

// Redirect if not logged in
if (!token) {
  alert('Please log in first!');
  window.location.href = 'login.html';
}

// ---------- FETCH PROFILE ----------
async function loadProfile() {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      alert('Session expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return (window.location.href = 'login.html');
    }

    const data = await res.json();
    const user = data.user || data; // support both formats

    profileName.textContent = user.name || 'No name';
    profileEmail.textContent = `Email: ${user.email || 'N/A'}`;
    profileJoined.textContent = `Joined: ${
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }`;

    // Pre-fill modal
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editEmail').value = user.email || '';
  } catch (err) {
    console.error('Error loading profile:', err);
    alert('Failed to load profile');
  }
}

// ---------- OPEN MODAL ----------
editProfileBtn.addEventListener('click', () => {
  editModal.style.display = 'flex';
});

// ---------- CLOSE MODAL ----------
cancelEdit.addEventListener('click', () => {
  editModal.style.display = 'none';
});

// ---------- UPDATE PROFILE ----------
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const password = document.getElementById('editPassword').value.trim();

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT', // use PATCH if your backend expects that
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Profile update failed');
    }

    const updated = await res.json();
    const user = updated.user || updated;

    alert('Profile updated successfully!');
    localStorage.setItem('user', JSON.stringify(user));
    editModal.style.display = 'none';
    loadProfile();
  } catch (err) {
    console.error('Error updating profile:', err);
    alert(err.message || 'Error updating profile');
  }
});

// ---------- LOGOUT ----------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Logged out successfully!');
    window.location.href = 'login.html';
  });
}

// ---------- INITIALIZE ----------
loadProfile();
