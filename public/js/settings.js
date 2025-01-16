const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {

    // Управление вкладками
    $(".account-settings-links a").on("click", function (e) {
        e.preventDefault();
        $(".account-settings-links a").removeClass("active");
        $(this).addClass("active");
        $(".tab-content .tab-pane").removeClass("active show");
        $($(this).attr("href")).addClass("active show");
    });

    // Проверка активности чекбоксов (например, для уведомлений)
    $(".switcher-input").on("change", function () {
        const isChecked = $(this).is(":checked");
        const label = $(this).closest(".form-group").find(".switcher-label").text();

        console.log(`${label} is now ${isChecked ? "enabled" : "disabled"}`);
    });

    loadUserProfile();

    document.querySelector('#changepassword').addEventListener('click', (e) => {
        e.preventDefault();
        changePass();
    });

    document.querySelector('#goBack').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './dashboard.html';
    });

    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = './login';
}


async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const user = await response.json();

        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');

        userName.textContent = `${user.user.fullname}`;
        userEmail.textContent = `${user.user.email}`;

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}



async function changePass() {
    const oldPass = document.getElementById('current_pass').value;
    const newPass = document.getElementById('new_pass').value;
    const repeatNewPass = document.getElementById('repeat_new_pass').value;
    if (newPass !== repeatNewPass) {
        showErrorPopup('Password does not match')
        return
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/change_password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
        });
        if (response.ok) {
            showSuccessPopup('Password changed successfully');
        } else {
            showErrorPopup('Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
    }
}


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