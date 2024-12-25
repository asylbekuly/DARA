let columnId = 1;

// Показать поле ввода при нажатии кнопки "Create Section"
document.getElementById('showInputButton').addEventListener('click', () => {
  const inputGroup = document.getElementById('sectionInputGroup');
  inputGroup.style.display = inputGroup.style.display === 'flex' ? 'none' : 'flex';
});

// Добавление разделов
document.getElementById('addColumnButton').addEventListener('click', () => {
  const sectionNameInput = document.getElementById('sectionNameInput');
  const columnName = sectionNameInput.value.trim();
  if (!columnName) {
    alert("Please enter a section name.");
    return;
  }

  const newColumn = document.createElement('div');
  newColumn.className = 'kanban-column';
  newColumn.setAttribute('id', `column-${columnId}`);
  columnId++;
  newColumn.innerHTML = `
                <h3>
                    ${columnName}
                    <img src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png" alt="Delete" onclick="deleteColumn(this)">
                </h3>
                <div class="kanban-cards"></div>
            `;

  document.getElementById('kanbanBoard').appendChild(newColumn);
  sectionNameInput.value = ''; // Очистить поле ввода
  document.getElementById('sectionInputGroup').style.display = 'none'; // Скрыть поле ввода
});

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

let cardIdCounter = 0;

document.getElementById('addCardButton').addEventListener('click', () => {
  const fio = document.getElementById('fioInput').value.trim();
  const iin = document.getElementById('iinInput').value.trim();
  const doctor = document.getElementById('doctorInputHidden').value.trim();
  const date = document.getElementById('dateInput').value;
  const additionalInfo = document.getElementById('additionalInfoInput').value.trim();

  if (!fio || !iin || !doctor || !date) {
    alert("All fields except additional information are required!");
    return;
  }

  const column = document.querySelector('.kanban-column');
  if (!column) {
    alert("Please create a section before adding cards.");
    return;
  }

  const cardId = `card-${cardIdCounter++}`; // Уникальный идентификатор карточки

  const newCard = document.createElement('div');
  newCard.className = 'kanban-card';
  newCard.setAttribute('data-id', cardId);
  newCard.dataset.additionalInfo = additionalInfo; // Сохранение описания в data-атрибуте
  const formattedDate = new Date().toLocaleString();
  newCard.innerHTML = `
        <p>ФИО: ${fio}</p>
        <p>ИИН: ${iin}</p>
        <p>Доктор: ${doctor}</p>
        <p>Дата приема: ${new Date(date).toLocaleString()}</p>
        <button class="edit-btn" onclick="editCard('${cardId}')">Edit</button>
        <button class="delete-btn" onclick="deleteCard(this)">Delete</button>
    `;

  column.querySelector('.kanban-cards').appendChild(newCard);

  // Очистка полей и закрытие popup
  document.getElementById('fioInput').value = '';
  document.getElementById('iinInput').value = '';
  document.getElementById('doctorInputHidden').value = '';
  document.querySelector('.dropdown-selected').innerHTML = 'Select a doctor';
  document.getElementById('dateInput').value = '';
  document.getElementById('additionalInfoInput').value = '';
  document.getElementById('cardPopup').style.display = 'none';
});

function editCard(cardId) {
  const card = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
  const fio = card.querySelector('p:nth-child(1)').textContent.replace('ФИО: ', '');
  const iin = card.querySelector('p:nth-child(2)').textContent.replace('ИИН: ', '');
  const doctor = card.querySelector('p:nth-child(3)').textContent.replace('Доктор: ', '');
  const date = new Date().toISOString().slice(0, 16); // Текущее время
  const additionalInfo = card.dataset.additionalInfo || '';

  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.style.display = 'flex';
  popup.innerHTML = `
    <label for="editFio">ФИО:</label>
    <input type="text" id="editFio" value="${fio}">
    <label for="editIin">ИИН:</label>
    <input type="text" id="editIin" value="${iin}">
    <label for="editDoctor">Доктор:</label>
    <div class="dropdown" id="editDoctorDropdown">
      <div class="dropdown-selected" onclick="toggleEditDropdown()">
        ${doctor ? `<img src="img/${doctor.toLowerCase().replace(' ', '')}.jpg" alt="${doctor}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;"> ${doctor}` : "Select a doctor"}
      </div>
      <ul class="dropdown-menu">
        <li onclick="selectEditDoctor('Dr. Smith', 'img/customer01.jpg')">
          <img src="img/customer01.jpg" alt="Dr. Smith"> Dr. Smith
        </li>
        <li onclick="selectEditDoctor('Dr. Johnson', 'img/customer02.jpg')">
          <img src="img/customer02.jpg" alt="Dr. Johnson"> Dr. Johnson
        </li>
        <li onclick="selectEditDoctor('Dr. Taylor', 'img/customer01.jpg')">
          <img src="img/customer01.jpg" alt="Dr. Taylor"> Dr. Taylor
        </li>
        <li onclick="selectEditDoctor('Dr. Brown', 'img/customer02.jpg')">
          <img src="img/customer02.jpg" alt="Dr. Brown"> Dr. Brown
        </li>
      </ul>
    </div>
    <label for="editDate">Дата приема:</label>
    <input type="datetime-local" id="editDate" value="${new Date(date).toISOString().slice(0, 16)}">
    <label for="editAdditionalInfo">Описание:</label>
    <textarea id="editAdditionalInfo">${additionalInfo}</textarea>
    <button onclick="saveEdit('${cardId}', this)">Save</button>
    <button onclick="closePopup(this)">Cancel</button>
  `;

  document.body.appendChild(popup);
}




function saveEdit(cardId, button) {
  const popup = button.parentElement;
  const fio = popup.querySelector('#editFio').value.trim();
  const iin = popup.querySelector('#editIin').value.trim();
  const doctor = document.querySelector('#editDoctorDropdown .dropdown-selected').textContent.trim();
  const date = popup.querySelector('#editDate').value;
  const additionalInfo = popup.querySelector('#editAdditionalInfo').value.trim();

  const card = document.querySelector(`.kanban-card[data-id="${cardId}"]`);

  if (!fio || !iin || !doctor || !date) {
    alert("All fields except additional information are required!");
    return;
  }

  // Обновление данных карточки
  card.querySelector('p:nth-child(1)').textContent = `ФИО: ${fio}`;
  card.querySelector('p:nth-child(2)').textContent = `ИИН: ${iin}`;
  card.querySelector('p:nth-child(3)').textContent = `Доктор: ${doctor}`;
  card.querySelector('p:nth-child(4)').textContent = `Дата приема: ${new Date(date).toLocaleString()}`;
  card.dataset.additionalInfo = additionalInfo;

  closePopup(button); // Закрытие popup
}



function closePopup(button) {
  const popup = button.parentElement;
  popup.remove();
}


function deleteCard(button) {
  button.parentElement.remove();
}

function deleteColumn(icon) {
  const column = icon.closest('.kanban-column');
  column.remove();
}

function toggleDropdown() {
  console.log("toggleDropdown called");

  const dropdown = document.getElementById('doctorDropdown');
  const dropdownMenu = dropdown.querySelector('.dropdown-menu');


  if (dropdown.classList.contains('open')) {
    dropdown.classList.remove('open');
    dropdownMenu.style.display = 'none';
  } else {
    dropdown.classList.add('open');
    dropdownMenu.style.display = 'block';
  }
}


function toggleEditDropdown() {
  const dropdownMenu = document.querySelector('#editDoctorDropdown .dropdown-menu');
  dropdownMenu.classList.toggle('open');
}

function selectEditDoctor(name, imgSrc) {
  const selected = document.querySelector('#editDoctorDropdown .dropdown-selected');
  selected.innerHTML = `<img src="${imgSrc}" alt="${name}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;"> ${name}`;
  document.getElementById('editDoctorDropdown').dataset.selectedDoctor = name; // Сохраняем выбранного врача
  toggleEditDropdown();
}




function selectDoctor(name, imgSrc) {
  const selected = document.querySelector('.dropdown-selected');
  selected.innerHTML = `<img src="${imgSrc}" alt="${name}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;"> ${name}`;
  
  // Устанавливаем значение в скрытое поле
  const hiddenInput = document.getElementById('doctorInputHidden');
  hiddenInput.value = name;

  // Закрываем меню
  const dropdown = document.getElementById('doctorDropdown');
  dropdown.classList.remove('open');
  const dropdownMenu = dropdown.querySelector('.dropdown-menu');
  dropdownMenu.style.display = 'none';
}



