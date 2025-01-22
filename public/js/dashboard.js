const API_BASE_URL = 'http://localhost:3000';

// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

let allCards = [];
let isLoading = false;
let initialized = false;

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};


document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './login';
    return;
  }

  $(document).ready(() => {
    initializeDashboardPanel();
  });

  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

async function initializeDashboardPanel() {
  try {
    await loadCards();
    await loadCardsTable();
    await loadDoctorsTable();
    await getUserStatus();
  } catch (error) {
    console.error('Failed to initialize dashboard panel:', error);
    showErrorPopup('Failed to load dashboard panel. Please refresh the page.');
  }
}

async function getUserStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/getUserStatus`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    const data = await response.json();

    if (data.success) {
      const who = data.who;
      const add_doctor = document.getElementById('add_doctor')
      if(who !== 'admin'){
        add_doctor.style.display="none"
      }
    } else {
      showErrorPopup(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error', error);
  }
}

function handleLogout(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  window.location.href = './login';
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

async function loadCards() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/cards`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    const data = await response.json();

    if (data.success) {
      allCards = data.cards; // Store fetched cards
      console.log('Cards loaded:', allCards);
    } else {
      showErrorPopup(`Error: ${data.message}`);
      console.error('Failed to load cards:', data.message);
    }
  } catch (error) {
    console.error('Error fetching cards:', error);
    showErrorPopup('An unexpected error occurred while fetching cards.');
  }
}

async function loadCardsTable() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/cards`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    const cardsTableBody = document.querySelector('.order_table');

    const data = await response.json();
    if (data.success) {
      data.cards.forEach(card => {
        const newCard = document.createElement('tr');

        const statusClass = getStatusClass(card.status);

        newCard.innerHTML = `
                  <td>${sanitizeHTML(card.fullName)}</td>
                  <td>${sanitizeHTML(card.patient_id)}</td>
                  <td>${formatDate(card.appoinment_date)}</td>
                  <td>${sanitizeHTML(card.add_info)}</td>
                  <td><span class="${statusClass}">${sanitizeHTML(card.status)}</span></td>
              `;

        cardsTableBody.appendChild(newCard);
      });
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorPopup('Failed to load orders');
  }
};

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'waiting':
      return 'status-waiting';
    case 'control':
      return 'status-control';
    case 'done':
      return 'status-done';
    default:
      return 'status-unknown'; // Класс по умолчанию
  }
}

async function loadDoctorsTable() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/doctors`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    const doctorsTableBody = document.querySelector('.doctor_table');

    const data = await response.json();
    if (data.success) {
      data.doctor.forEach(doctor => {
        const newDoctor = document.createElement('tr');

        newDoctor.innerHTML = `
                  <td>
                    <h4>${sanitizeHTML(doctor.fullname)} <br> <span>${sanitizeHTML(doctor.profession)}</span></h4>
                  </td>
              `;

        doctorsTableBody.appendChild(newDoctor);
      });
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorPopup('Failed to load doctors');
  }
}



// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Updated sanitizeHTML function
function sanitizeHTML(str) {
  if (!str) return '';
  return str.toString().replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}
