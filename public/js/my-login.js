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
				if (data.requiresOTP) {
					showLoginOTPModal(data.userId);
				} else {
					console.log('Login successful', data)
					localStorage.setItem('token', data.token)
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

function showLoginOTPModal(userId) {
	const modalHtml = `
			<div class="modal fade" id="otpLoginModal" tabindex="-1" aria-hidden="true">
					<div class="modal-dialog">
							<div class="modal-content">
									<div class="modal-header">
											<h5 class="modal-title">Two-Factor Authentication</h5>
									</div>
									<div class="modal-body text-center">
											<p>Enter the 6-digit code from your authenticator app:</p>
											<input type="text" class="form-control" id="loginOtpCode" maxlength="6" pattern="[0-9]*">
									</div>
									<div class="modal-footer">
											<button type="button" class="btn btn-primary" id="verifyLoginOTP">Verify</button>
									</div>
							</div>
					</div>
			</div>
	`;

	document.body.insertAdjacentHTML('beforeend', modalHtml);

	const modal = new bootstrap.Modal(document.getElementById('otpLoginModal'), {
		backdrop: 'static',
		keyboard: false
	});

	modal.show();

	document.getElementById('verifyLoginOTP').addEventListener('click', async () => {
		const token = document.getElementById('loginOtpCode').value;
		if (!token || token.length !== 6) {
			showErrorPopup('Please enter a valid 6-digit code');
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/api/auth/verify2fa-login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ userId, token })
			});

			const data = await response.json();
			if (response.ok) {
				modal.hide();
				localStorage.setItem('token', data.token);
				window.location.href = './dashboard.html';
			} else {
				showErrorPopup(data.msg);
			}
		} catch (error) {
			console.error('Error:', error);
			showErrorPopup('An unexpected error occurred.');
		}
	});
}