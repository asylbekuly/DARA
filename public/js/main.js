const API_BASE_URL = 'http://localhost:3000';

// Показать popup для добавления карточек
document.getElementById('showCardPopup').addEventListener('click', () => {
  const popup = document.getElementById('cardPopup');
  popup.style.display = 'flex';
});

// Закрыть popup
document.getElementById('closePopupButton').addEventListener('click', () => {
  const popup = document.getElementById('cardPopup');
  popup.style.display = 'none';
});

let allCards = [];
let isLoading = false;
let initialized = false;

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

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './login';
    return;
  }

  $(document).ready(() => {
    initializeAdminPanel();
  });

  $('.selectpicker').selectpicker({
    actionsBox: true,
    liveSearch: true,
    selectedTextFormat: 'count > 2'
  });
});

// Initialize admin panel
async function initializeAdminPanel() {
  try {
    await loadCards();
    await loadCardsTable();
    initializeEventListeners();
  } catch (error) {
    console.error('Failed to initialize admin panel:', error);
    showErrorPopup('Failed to load admin panel. Please refresh the page.');
  }
}

// Initialize event listeners
function initializeEventListeners() {
  const createCardForm = document.querySelector('.createCardForm');
  if (createCardForm) {
    createCardForm.addEventListener('submit', handleCardSubmit);
  }

  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// Handle course submission
async function handleCardSubmit(e) {
  e.preventDefault();
  if (isLoading) return;

  const fullNameInput = document.getElementById('fioInput')
  const patientIdInput = document.getElementById('iinInput')
  const doctorInput = document.getElementById('doctorInput')
  const appointmentDateInput = document.getElementById('dateInput')
  const additionalInfoInput = document.getElementById('additionalInfoInput')

  if (!fullNameInput || !patientIdInput || !doctorInput || !appointmentDateInput) {
    showErrorPopup('Form inputs not found');
    return;
  }

  const fullName = fullNameInput.value.trim();
  const patient_id = patientIdInput.value.trim();
  const doctor = doctorInput.value.trim();
  const appoinment_date = appointmentDateInput.value.trim();
  const add_info = additionalInfoInput.value.trim();

  if (!fullName || !patient_id || !doctor || !appoinment_date) {
    showErrorPopup('All fields except additional information are required!');
    return;
  }

  isLoading = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/main/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ fullName, patient_id, doctor, appoinment_date, add_info })
    });

    const data = await response.json();
    if (data.success) {
      e.target.reset();
      await Promise.all([
        showSuccessPopup('Card created successfully!'),
        loadCardsTable(),
        loadCards()
      ]);
    } else {
      showErrorPopup(data.message || 'Failed to create card');
    }
  } catch (error) {
    console.error('Error creating card:', error);
    showErrorPopup('Failed to create card. Please try again.');
  } finally {
    isLoading = false;
  }
}

// Handle logout
function handleLogout(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  window.location.href = './login';
}

// Error handler wrapper
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

// Wrap existing functions with error handler
const safeLoadCards = errorHandler(loadCards);
const safeLoadCardsTable = errorHandler(loadCardsTable);

// Add course management functions
// async function createCard(fullName, patient_id, doctor, appoinment_date, add_info) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/main/cards`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-auth-token': localStorage.getItem('token')
//       },
//       body: JSON.stringify({ fullName, patient_id, doctor, appoinment_date, add_info })
//     });

//     const data = await response.json();
//     if (data.success) {
//       showSuccessPopup('Course created successfully');
//       loadCardsTable();
//       loadCards();
//     } else {
//       showErrorPopup(data.message || 'Failed to create card');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     showErrorPopup('Failed to create card');
//   }
// }

// Function to fetch all courses
async function loadCards() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/main/cards`, {
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

// Update loadCoursesTable function
async function loadCardsTable() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/main/cards`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    const data = await response.json();
    if (data.success) {
      const cardsTableBody = document.getElementById('waiting');
      cardsTableBody.innerHTML = '';
      const cardsTableBody2 = document.getElementById('control');
      cardsTableBody2.innerHTML = '';
      const cardsTableBody3 = document.getElementById('done');
      cardsTableBody3.innerHTML = '';

      data.cards.forEach(card => {
        const newCard = document.createElement('div');
        newCard.setAttribute('draggable', 'true');
        newCard.setAttribute('id', card._id);
        newCard.classList.add('kanban-card');

        newCard.innerHTML = `
                  <p>Full Name: ${sanitizeHTML(card.fullName)}</p>
                  <p>Patient ID: ${sanitizeHTML(card.patient_id)}</p>
                  <p>Doctor: ${sanitizeHTML(card.doctor)}</p>
                  <p>Appointment Date: ${formatDate(card.appoinment_date)}</p>
                  <button class="btn btn-sm btn-warning edit-btn">Edit</button>
                  <button class="btn btn-sm btn-danger delete-btn">Delete</button>
              `;

        newCard.addEventListener('dragstart', handleDragStart);

        if (card.status === "waiting") {
          cardsTableBody.appendChild(newCard);
        } else if (card.status === "control") {
          cardsTableBody2.appendChild(newCard);
        } else if (card.status === "done") {
          cardsTableBody3.appendChild(newCard);
        }


        // Initialize tooltip
        const edt = newCard.querySelector('.edit-btn');
        const delBtn = newCard.querySelector('.delete-btn');

        edt.addEventListener('click', () => {
          editCard(card._id);
        });

        delBtn.addEventListener('click', () => {
          deleteCard(card._id)
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
    showErrorPopup('Failed to load cards');
  }
};

// Add course management functions
async function editCard(cardId) {
  const card = allCards.find(c => c._id === cardId);
  if (!card) return;

  const popup = document.getElementById('editPopup');
  const form = document.getElementById('editCardForm');

  document.getElementById('editFullName').value = card.fullName;
  document.getElementById('editPatientId').value = card.patient_id;
  document.getElementById('editDoctor').value = card.doctor;
  document.getElementById('editAppointmentDate').value = card.appoinment_date;
  document.getElementById('editAdditionalInfo').value = card.add_info;

  popup.style.display = 'flex';

  form.onsubmit = async (e) => {
    e.preventDefault();

    const newFullName = document.getElementById('editFullName').value.trim();
    const newPatientId = document.getElementById('editPatientId').value.trim();
    const newDoctor = document.getElementById('editDoctor').value.trim();
    const newAppointmentDate = document.getElementById('editAppointmentDate').value.trim();
    const newAddInfo = document.getElementById('editAdditionalInfo').value.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/api/main/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({
          fullName: newFullName,
          patient_id: newPatientId,
          doctor: newDoctor,
          appoinment_date: newAppointmentDate,
          add_info: newAddInfo,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showSuccessPopup('Card updated successfully');
        popup.style.display = 'none';
        await loadCardsTable();
        await loadCards();
      } else {
        showErrorPopup(data.message || 'Failed to update card');
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorPopup('Failed to update card');
    }
  };

  document.getElementById('closeEditPopup').addEventListener('click', () => {
    popup.style.display = 'none';
  });
}


// Delete cards
async function deleteCard(cardId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/main/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    const data = await response.json();

    if (data.success) {
      showSuccessPopup('Card deleted successfully');
      loadCardsTable();
    } else {
      showErrorPopup(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    showErrorPopup('An unexpected error occurred while deleting the card.');
  }
}

// Function to logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = './login';
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


document.addEventListener('DOMContentLoaded', () => {
  const columns = document.querySelectorAll('.kanban-column'); // Все колонки
  const cards = document.querySelectorAll('.kanban-card'); // Все карточки

  // Добавление обработчиков событий для колонок
  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
  });

  // Добавление обработчиков событий для карточек
  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
  });
});

let draggedCard = null;

// Начало перетаскивания
function handleDragStart(e) {
  if (!this.classList.contains('kanban-card')) return;
  draggedCard = this; // Карточка, которую перетаскивают
  setTimeout(() => {
    this.style.display = 'none'; // Скрыть карточку
  }, 0);
}

// Разрешение сброса
function handleDragOver(e) {
  e.preventDefault(); // Разрешить сброс
}

// Сброс карточки
async function handleDrop(e) {
  e.preventDefault();

  // Поместить карточку в новую колонку
  this.querySelector('.kanban-cards').appendChild(draggedCard);
  draggedCard.style.display = 'block'; // Сделать карточку видимой снова

  const cardId = draggedCard.getAttribute('id'); // Получить ID карточки
  const newStatus = this.getAttribute('data-status'); // Новый статус из атрибута колонки

  // Отправить запрос на бэкенд для обновления статуса
  try {
    const response = await fetch(`${API_BASE_URL}/api/main/cards/status/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ newStatus })
    });

    const data = await response.json();
    if (data.success) {
      console.log('Card status updated successfully:', data);
    } else {
      console.error('Failed to update card status:', data.message);
      showErrorPopup(data.message || 'Failed to update card status');
    }
  } catch (error) {
    console.error('Error updating card status:', error);
    showErrorPopup('An error occurred while updating card status.');
  }

  draggedCard = null; // Сбросить ссылку на перетаскиваемую карточку
}
