const toggleBtn = document.getElementById('themeToggle');
const body = document.body;

// Load saved mode from localStorage
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
}

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  const theme = body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});
