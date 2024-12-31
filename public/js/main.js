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
    alert('Failed to load admin panel. Please refresh the page.');
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
    alert('Form inputs not found');
    return;
  }

  const fullName = fullNameInput.value.trim();
  const patient_id = patientIdInput.value.trim();
  const doctor = doctorInput.value.trim();
  const appoinment_date = appointmentDateInput.value.trim();
  const add_info = additionalInfoInput.value.trim();

  if (!fullName || !patient_id || !doctor || !appoinment_date) {
    alert('All fields except additional information are required!');
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
        loadCardsTable(),
        loadCards()
      ]);
    } else {
      alert(data.message || 'Failed to create card');
    }
  } catch (error) {
    console.error('Error creating card:', error);
    alert('Failed to create card. Please try again.');
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
      alert(`An error occurred in ${fn.name}. Please try again.`);
    }
  };
}

// Wrap existing functions with error handler
const safeLoadCards = errorHandler(loadCards);
const safeLoadCardsTable = errorHandler(loadCardsTable);

// Add course management functions
async function createCard(fullName, patient_id, doctor, appoinment_date, add_info) {
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
      alert('Course created successfully');
      loadCardsTable();
      loadCards();
    } else {
      alert(data.message || 'Failed to create card');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create card');
  }
}

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
      alert(`Error: ${data.message}`);
      console.error('Failed to load cards:', data.message);
    }
  } catch (error) {
    console.error('Error fetching cards:', error);
    alert('An unexpected error occurred while fetching cards.');
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
    alert('Failed to load cards');
  }
};

// Add course management functions
async function editCard(cardId) {
  const card = allCards.find(c => c._id === cardId);
  if (!card) return;

  const newFullName = prompt('Enter new full name:', card.fullName);
  const newPatientId = prompt('Enter new ID:', card.patient_id);
  const newDoctor = prompt('Enter new doctor(Dr. Smith, Dr. Johnson, Dr. Taylor, Dr. Brown):', card.doctor);
  const newAppointmentDate = prompt('Enter new date:', card.appoinment_date);
  const newAddInfo = prompt('Enter new additional info:', card.add_info);

  if (!newFullName) return;
  if (!newPatientId) return;
  if (!newDoctor) return;
  if (!newAppointmentDate) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/main/cards/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({
        fullName: newFullName,
        patient_id: newPatientId,
        doctor: newDoctor,
        appoinment_date: newAppointmentDate,
        add_info: newAddInfo,
      })
    });

    const data = await response.json();
    if (data.success) {
      alert('Card updated successfully');
      loadCardsTable();
      loadCards();
    } else {
      alert(data.message || 'Failed to update card');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to update card');
  }
}

// Delete cards
async function deleteCard(cardId) {
  if (!confirm('Are you sure you want to delete this card?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/main/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('card deleted successfully');
      loadCardsTable();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    alert('An unexpected error occurred while deleting the card.');
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


// // Draggable
// document.addEventListener('DOMContentLoaded', () => {
//   const kanbanColumns = document.querySelectorAll('.kanban-column');

//   kanbanColumns.forEach(column => {
//     column.addEventListener('dragover', handleDragOver);
//     column.addEventListener('drop', handleDrop);
//   });

//   document.addEventListener('dragstart', handleDragStart);
//   document.addEventListener('dragend', handleDragEnd);
// });

// let draggedCard = null;

// function handleDragStart(event) {
//   if (event.target.classList.contains('kanban-card')) {
//     draggedCard = event.target;
//     event.dataTransfer.effectAllowed = 'move';
//     setTimeout(() => draggedCard.classList.add('hidden'), 0);
//   }
// }

// function handleDragOver(event) {
//   event.preventDefault();
//   event.dataTransfer.dropEffect = 'move';
// }

// function handleDrop(event) {
//   event.preventDefault();
//   if (draggedCard) {
//     const column = event.currentTarget.querySelector('.kanban-cards');
//     column.appendChild(draggedCard);
//     draggedCard.classList.remove('hidden');
//     draggedCard = null;
//   }
// }

// function handleDragEnd() {
//   if (draggedCard) {
//     draggedCard.classList.remove('hidden');
//     draggedCard = null;
//   }
// }






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
      alert(data.message || 'Failed to update card status');
    }
  } catch (error) {
    console.error('Error updating card status:', error);
    alert('An error occurred while updating card status.');
  }

  draggedCard = null; // Сбросить ссылку на перетаскиваемую карточку
}
