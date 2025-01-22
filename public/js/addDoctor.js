const API_BASE_URL = '';


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login__form')
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = document.getElementById('emailInput').value
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor/addDoctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (response.ok) {
        showSuccessPopup('Doctor added successfully')
        document.getElementById('emailInput').value = ' '
      } else {
        showErrorPopup(data.message)
        console.error('Not added', data.message)
      }
    } catch (error) {
      console.error('Error:', error)
      showErrorPopup('An unexpected error occurred.')
    }
  })
})

function showErrorPopup(message) {
  const popup = document.createElement('div')
  popup.classList.add('error-popup')
  popup.textContent = message
  document.body.appendChild(popup)

  setTimeout(() => {
    popup.remove()
  }, 3000)
}

function showSuccessPopup(message) {
  const popup = document.createElement('div')
  popup.classList.add('success-popup')
  popup.textContent = message
  document.body.appendChild(popup)

  setTimeout(() => {
    popup.remove()
  }, 3000)
}

function handleLogout(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  window.location.href = './login';
}

function errorHandler(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name}:`, error);
      showErrorPopup(`An error occurred in ${fn.name}. Please try again.`);
    }
  };
}