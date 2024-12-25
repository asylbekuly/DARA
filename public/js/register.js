const API_BASE_URL = 'http://localhost:3000';

// Show/Hide pass. Register
const passwordRegister = (loginPass, loginEye) => {
  const input = document.getElementById(loginPass),
    iconEye = document.getElementById(loginEye)

  iconEye.addEventListener('click', () => {
    // Change password to text
    input.type === 'password' ? input.type = 'text'
      : input.type = 'password'
    // Icon change
    iconEye.classList.toggle('ri-eye-fill')
    iconEye.classList.toggle('ri-eye-off-fill')
  })
}
passwordRegister('passwordCreate', 'loginPasswordCreate')

// Error popup message
function showErrorPopup(message) {
  const popup = document.createElement('div')
  popup.classList.add('error-popup')
  popup.textContent = message
  document.body.appendChild(popup)

  setTimeout(() => {
    popup.remove()
  }, 3000)
}


document.addEventListener('DOMContentLoaded', () => {

  const registerForm = document.querySelector('.login__form')

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('passwordCreate').value

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password })
      })

      const data = await response.json()
      if (response.ok) {
        console.log('Registration successful', data);
        localStorage.setItem('token', data.token);
        window.location.href = './dashboard.html';
      } else {
        showErrorPopup(data.msg);
        console.error('Registration failed', data.msg);
      }
    } catch (error) {
      console.error('Error:', error)
      showErrorPopup('An unexpected error occurred.')
    }
  })
})