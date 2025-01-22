const API_BASE_URL = '';

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
    const fullname = document.getElementById('fullname').value
    const profession = document.getElementById('profession').value
    const enable2FA = document.getElementById('enable2FA').checked;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullname, profession, enable2FA })
      })

      const data = await response.json()
      if (response.ok) {
        if (data.requiresOTP) {
          showOTPSetupModal(data.qrCode, data.user.id);
        } else {
          localStorage.setItem('token', data.token);
          window.location.href = './dashboard.html';
        }
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

function showOTPSetupModal(qrCode, userId) {
  // Remove any existing modal
  const existingModal = document.getElementById('otpSetupModal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalHtml = `
      <div class="modal fade" id="otpSetupModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Set Up Two-Factor Authentication</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body text-center">
                      <p>1. Install an authenticator app like Google Authenticator or Authy</p>
                      <p>2. Scan this QR code with your app:</p>
                      <img src="${qrCode}" class="img-fluid mb-3" style="max-width: 200px;">
                      <div class="form-group">
                          <label class="form-label">3. Enter the 6-digit code from your app:</label>
                          <input type="text" class="form-control" id="otpCode" maxlength="6" pattern="[0-9]*">
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" id="cancel" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" class="btn btn-primary" id="verifyOTP">Verify</button>
                  </div>
              </div>
          </div>
      </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = new bootstrap.Modal(document.getElementById('otpSetupModal'), {
    backdrop: 'static',
    keyboard: false
  });

  modal.show();

  document.getElementById('cancel').addEventListener('click', async () => {
    modal.hide();
  })

  document.getElementById('verifyOTP').addEventListener('click', async () => {
    const token = document.getElementById('otpCode').value;
    if (!token || token.length !== 6) {
      showErrorPopup('Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify2fa`, {
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
        showErrorPopup(data.msg || 'Invalid code');
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorPopup('An unexpected error occurred.');
    }
  });
}
