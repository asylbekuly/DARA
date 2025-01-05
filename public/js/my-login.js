const API_BASE_URL = 'http://localhost:3000';

// Show/Hide pass. Login
const passwordAccess = (loginPass, loginEye) => {
	const input = document.getElementById(loginPass)
	iconEye = document.getElementById(loginEye)

	iconEye.addEventListener('click', () => {
		// Change password to text
		input.type === 'password' ? input.type = 'text' : input.type = 'password'

		// Icon change
		iconEye.classList.toggle('ri-eye-fill')
		iconEye.classList.toggle('ri-eye-off-fill')
	})
}
passwordAccess('password', 'loginPassword')

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
	// Login form submission
	const loginForm = document.querySelector('.login__form')

	loginForm.addEventListener('submit', async (event) => {
			event.preventDefault()

			const email = document.getElementById('email').value
			const password = document.getElementById('password').value

			try {
					const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
							method: 'POST',
							headers: {
									'Content-Type': 'application/json'
							},
							body: JSON.stringify({ email, password })
					})

					const data = await response.json()
					if (response.ok) {
							console.log('Login successful', data)
							localStorage.setItem('token', data.token)
							if(data.who === 'admin'){
									window.location.href = './dashboard.html'
							} 
							else{
									window.location.href = './dashboard.html'
							}
					} else {
							showErrorPopup(data.msg)
							console.error('Login failed', data.msg)
					}
			} catch (error) {
					console.error('Error:', error)
					showErrorPopup('An unexpected error occurred.')
			}
	})
})

