// script.js

// --- Elementos do DOM ---
const currentDateElement = document.getElementById('current-date');
const taskList = document.querySelector('.task-list');
const addEventButton = document.querySelector('.add-button'); // Botão "+ Adicionar"
const eventModal = document.getElementById('eventModal'); // A modal
const closeModalButton = eventModal.querySelector('.close-button'); // Botão "X" da modal
const cancelButton = eventModal.querySelector('.cancel-button'); // Botão "Cancelar" da modal
const eventForm = document.getElementById('eventForm'); // O formulário dentro da modal

// Campos do formulário
const itemIdInput = document.getElementById('itemId');
const itemDateInput = document.getElementById('itemDate');
const itemTypeSelect = document.getElementById('itemType');
const itemTitleInput = document.getElementById('itemTitle');
const itemTimeStartInput = document.getElementById('itemTimeStart');
const itemTimeEndInput = document.getElementById('itemTimeEnd');
const itemAllDayCheckbox = document.getElementById('itemAllDay');
const itemLocationInput = document.getElementById('itemLocation');
const itemDescriptionInput = document.getElementById('itemDescription');
const itemCompletedCheckbox = document.getElementById('itemCompleted');

// Grupos de campos para alternar visibilidade (referência para adicionar/remover classes)
const itemTimeGroup = document.getElementById('itemTimeGroup');
const itemLocationGroup = document.getElementById('itemLocationGroup');
const itemCompletedGroup = document.getElementById('itemCompletedGroup');

// --- Variáveis de Estado ---
let currentDate = new Date();
let allEvents = {}; // Estrutura para armazenar todos os eventos e tarefas

// --- Funções de Utilitário ---

// Salva os eventos no localStorage
function saveEvents() {
    localStorage.setItem('allEvents', JSON.stringify(allEvents));
}

// Carrega os eventos do localStorage
function loadEvents() {
    const storedEvents = localStorage.getItem('allEvents');
    if (storedEvents) {
        allEvents = JSON.parse(storedEvents);
    } else {
        // Dados iniciais se não houver nada no localStorage (apenas para o primeiro acesso)
        // Ajustei os IDs para serem consistentes com generateUniqueId
        allEvents = {
            '2025-06-17': [
                {
                    id: 'e-' + Date.now(),
                    type: 'event',
                    title: 'Reunião de Equipe',
                    timeStart: '09:00',
                    timeEnd: '10:00',
                    allDay: false,
                    location: 'Sala de Reuniões 3',
                    description: 'Discussão sobre o projeto X e próximos passos.',
                },
                {
                    id: 't-' + (Date.now() + 1), // Garante ID único
                    type: 'task',
                    title: 'Revisar relatório do Projeto Alpha',
                    timeStart: '',
                    timeEnd: '',
                    allDay: true,
                    completed: false,
                    description: '',
                }
            ],
            '2025-06-18': [
                {
                    id: 'e-' + (Date.now() + 2),
                    type: 'event',
                    title: 'Workshop de Acessibilidade',
                    timeStart: '14:00',
                    timeEnd: '16:00',
                    allDay: false,
                    location: 'Auditório Principal',
                    description: 'Aprenda sobre as melhores práticas de acessibilidade web.',
                }
            ]
        };
        saveEvents(); // Salva os dados iniciais no localStorage
    }
}

// Formata uma data para ser usada como chave no objeto allEvents (AAAA-MM-DD)
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Gera um ID único para cada item
function generateUniqueId(type) {
    // Usamos o prefixo 'e-' para evento e 't-' para tarefa, seguido do timestamp
    return `${type[0]}-${Date.now()}`;
}

// --- Funções da UI ---

// Abre a modal
function openModal(item = null) {
    eventForm.reset(); // Limpa o formulário

    // Remove as classes de visibilidade e de all-day antes de reajustar
    itemLocationGroup.classList.remove('visible');
    itemCompletedGroup.classList.remove('visible');
    itemTimeGroup.classList.remove('all-day');

    itemTimeStartInput.setAttribute('required', 'true');
    itemTimeEndInput.setAttribute('required', 'true');

    eventModal.classList.add('is-visible');
    eventModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open'); // Adiciona classe para desabilitar scroll do body

    if (item) { // Modo de Edição
        document.getElementById('modalTitle').textContent = 'Editar Item';
        itemIdInput.value = item.id;
        itemDateInput.value = formatDateKey(currentDate); // Guarda a data atual do item
        itemTypeSelect.value = item.type;
        itemTitleInput.value = item.title;
        itemTimeStartInput.value = item.timeStart;
        itemTimeEndInput.value = item.timeEnd;
        itemAllDayCheckbox.checked = item.allDay;
        itemLocationInput.value = item.location || '';
        itemDescriptionInput.value = item.description || '';
        itemCompletedCheckbox.checked = item.completed || false;

        toggleFormFields(item.type); // Ajusta campos baseados no tipo do item
        handleAllDayToggle(); // Ajusta os campos de hora se for dia todo
    } else { // Modo de Adição
        document.getElementById('modalTitle').textContent = 'Adicionar Novo Item';
        itemIdInput.value = ''; // Limpa o ID
        itemDateInput.value = formatDateKey(currentDate); // Preenche a data com o dia atual do widget
        itemTypeSelect.value = 'event'; // Padrão para evento
        toggleFormFields('event'); // Ajusta campos para o tipo padrão (Evento)
        handleAllDayToggle(); // Garante que os campos de tempo estejam visíveis por padrão
    }

    itemTitleInput.focus(); // Coloca o foco no primeiro campo para acessibilidade
}

// Fecha a modal
function closeModal() {
    eventModal.classList.remove('is-visible');
    eventModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    // Retorna o foco ao botão que abriu a modal (melhora a acessibilidade)
    if (document.activeElement && document.activeElement.classList.contains('add-button') || document.activeElement.classList.contains('edit-button')) {
        document.activeElement.focus();
    } else {
        addEventButton.focus(); // Foca no botão de adicionar como fallback
    }
}

// Alterna a visibilidade dos campos do formulário baseados no tipo (Evento/Tarefa)
function toggleFormFields(type) {
    if (type === 'event') {
        itemLocationGroup.classList.add('visible');
        itemCompletedGroup.classList.remove('visible');
    } else { // type === 'task'
        itemLocationGroup.classList.remove('visible');
        itemCompletedGroup.classList.add('visible');
    }
}

// Lida com o checkbox "Dia todo"
function handleAllDayToggle() {
    if (itemAllDayCheckbox.checked) {
        itemTimeGroup.classList.add('all-day');
        itemTimeStartInput.removeAttribute('required');
        itemTimeEndInput.removeAttribute('required');
        itemTimeStartInput.value = ''; // Limpa valores
        itemTimeEndInput.value = '';
    } else {
        itemTimeGroup.classList.remove('all-day');
        itemTimeStartInput.setAttribute('required', 'true');
        itemTimeEndInput.setAttribute('required', 'true');
    }
}

// Renderiza os itens da agenda para a data atual
function renderAgendaItems(date) {
    taskList.innerHTML = ''; // Limpa a lista atual

    const dateKey = formatDateKey(date);
    const eventsForDay = allEvents[dateKey] || [];

    if (eventsForDay.length === 0) {
        const noItems = document.createElement('li');
        noItems.className = 'no-items';
        noItems.setAttribute('role', 'listitem');
        noItems.setAttribute('aria-live', 'polite');
        noItems.textContent = 'Nenhum evento ou tarefa agendada para hoje. Aproveite o seu dia!';
        taskList.appendChild(noItems);
        return;
    }

    // Ordena eventos: dia todo primeiro, depois por horário
    eventsForDay.sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        if (a.timeStart && b.timeStart) {
            return a.timeStart.localeCompare(b.timeStart);
        }
        return 0;
    });

    eventsForDay.forEach((item) => { // Removi o 'index' pois não estava sendo usado e podemos simplificar
        const listItem = document.createElement('li');
        listItem.className = `agenda-item ${item.type}`;
        listItem.setAttribute('role', 'listitem');

        if (item.type === 'task' && item.completed) {
            listItem.classList.add('completed-task');
        }

        let timeDisplay = '';
        if (item.allDay) {
            timeDisplay = 'Todo o dia';
        } else if (item.timeStart && item.timeEnd) {
            timeDisplay = `${item.timeStart} - ${item.timeEnd}`;
        } else if (item.timeStart) {
            timeDisplay = item.timeStart; // Se só tiver hora de início
        }

        let itemHtml = `
            <div class="item-header">
                <h3 class="item-title">
                    <span class="visually-hidden">${item.type === 'event' ? 'Título do Evento:' : 'Título da Tarefa:'}</span> ${item.title}
                </h3>
                <div class="item-actions">
                    <button class="action-button edit-button" aria-label="Editar ${item.title}" data-item-id="${item.id}">Editar</button>
                    <button class="action-button delete-button" aria-label="Excluir ${item.title}" data-item-id="${item.id}">Excluir</button>
                </div>
            </div>
            <div class="item-details">
                <div class="item-time">
                    <span class="visually-hidden">Horário:</span> ${timeDisplay}
                </div>
        `;

        if (item.type === 'event' && item.location) {
            // Removi a imagem externa e usei um ícone SVG inline para evitar problemas de carregamento
            itemHtml += `
                <p class="item-location">
                    <span class="visually-hidden">Local:</span> ${item.location}
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}" target="_blank" aria-label="Ver ${item.location} no mapa" title="Ver no mapa">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16" style="vertical-align: middle;">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                    </a>
                </p>`;
        }

        if (item.description) {
            const descId = `desc-${item.id}`;
            // Mudei o estado inicial para "Detalhes" (colapsado) para descrições longas
            itemHtml += `
                <p class="item-description" id="${descId}" style="display: none;">
                    ${item.description}
                </p>
                <button class="action-button toggle-description"
                        aria-controls="${descId}"
                        aria-expanded="false"
                        aria-label="Expandir detalhes da ${item.title}">
                    Detalhes
                </button>`;
        }

        if (item.type === 'task') {
            itemHtml += `
                <div class="task-status">
                    <input type="checkbox" id="task-checkbox-${item.id}" ${item.completed ? 'checked' : ''}
                           aria-label="Marcar tarefa '${item.title}' como ${item.completed ? 'não ' : ''}concluída"
                           data-item-id="${item.id}">
                    <label for="task-checkbox-${item.id}">
                        ${item.completed ? 'Concluída' : 'Pendente'}
                    </label>
                </div>
            `;
        }

        itemHtml += `</div>`; // Fecha item-details
        listItem.innerHTML = itemHtml;
        taskList.appendChild(listItem);
    });

    // CRÍTICO: ADICIONA OS EVENT LISTENERS DEPOIS QUE OS ITENS SÃO RENDERIZADOS
    addEventListenersToItems();
}

// Atualiza a exibição da data e renderiza os itens
function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = currentDate.toLocaleDateString('pt-BR', options);
    currentDateElement.setAttribute('aria-live', 'assertive');
    setTimeout(() => currentDateElement.setAttribute('aria-live', 'polite'), 500);
    renderAgendaItems(currentDate);
}

// --- Funções CRUD ---

// Adiciona ou atualiza um item na agenda
function saveItem(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const id = itemIdInput.value || generateUniqueId(itemTypeSelect.value);
    const dateKey = itemDateInput.value;
    const type = itemTypeSelect.value;
    const title = itemTitleInput.value.trim();

    if (!title) {
        alert('O título é obrigatório!'); // Feedback simples
        itemTitleInput.focus();
        return;
    }

    let item = {
        id: id,
        type: type,
        title: title,
        description: itemDescriptionInput.value.trim(),
    };

    if (itemAllDayCheckbox.checked) {
        item.allDay = true;
        item.timeStart = '';
        item.timeEnd = '';
    } else {
        item.allDay = false;
        item.timeStart = itemTimeStartInput.value;
        item.timeEnd = itemTimeEndInput.value;
        // Validação básica de horário se não for dia todo
        if (!item.timeStart || !item.timeEnd) {
            alert('Por favor, preencha o horário de início e fim, ou marque "Dia todo".');
            return;
        }
    }

    if (type === 'event') {
        item.location = itemLocationInput.value.trim();
    } else { // type === 'task'
        item.completed = itemCompletedCheckbox.checked;
    }

    // Garante que o array para a data exista
    if (!allEvents[dateKey]) {
        allEvents[dateKey] = [];
    }

    // Verifica se é uma edição ou adição
    const itemIndex = allEvents[dateKey].findIndex(i => i.id === id);
    if (itemIndex > -1) {
        // Edição: Substitui o item existente
        allEvents[dateKey][itemIndex] = item;
    } else {
        // Adição: Adiciona o novo item
        allEvents[dateKey].push(item);
    }

    saveEvents(); // Salva no localStorage
    updateDateDisplay(); // Atualiza a exibição
    closeModal(); // Fecha a modal
}

// Lida com a exclusão de um item
function deleteItem(itemId) {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
        return;
    }

    const dateKey = formatDateKey(currentDate); // Assume que a exclusão é do dia atual
    if (allEvents[dateKey]) {
        allEvents[dateKey] = allEvents[dateKey].filter(item => item.id !== itemId);
        if (allEvents[dateKey].length === 0) {
            delete allEvents[dateKey]; // Remove a data do objeto se não houver mais itens
        }
        saveEvents();
        updateDateDisplay();
    }
}

// Lida com a mudança de status de uma tarefa (concluída/pendente)
function toggleTaskCompleted(taskId) {
    const dateKey = formatDateKey(currentDate);
    if (allEvents[dateKey]) {
        const task = allEvents[dateKey].find(item => item.id === taskId && item.type === 'task');
        if (task) {
            task.completed = !task.completed;
            saveEvents();
            updateDateDisplay(); // Re-renderiza para atualizar o estilo e o texto
        }
    }
}

// --- Event Listeners Globais e Funções de Init ---

// Navegação entre dias
document.querySelector('.agenda-header button:first-child').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    currentDateElement.focus();
});

document.querySelector('.agenda-header button:last-child').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    currentDateElement.focus();
});

// Abre a modal quando o botão "+ Adicionar" é clicado
addEventButton.addEventListener('click', () => openModal());

// Fecha a modal
closeModalButton.addEventListener('click', closeModal);
cancelButton.addEventListener('click', closeModal);

// Fecha a modal ao clicar fora dela (no overlay)
eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        closeModal();
    }
});

// Fecha a modal ao pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && eventModal.classList.contains('is-visible')) {
        closeModal();
    }
});

// Lida com a submissão do formulário
eventForm.addEventListener('submit', saveItem);

// Alterna campos do formulário com base no tipo de item
itemTypeSelect.addEventListener('change', (e) => toggleFormFields(e.target.value));

// Lida com o checkbox "Dia todo"
itemAllDayCheckbox.addEventListener('change', handleAllDayToggle);

// Função para adicionar listeners aos botões de edição/exclusão/toggle de descrição/checkbox da tarefa
// Esta função é chamada CADA VEZ que a agenda é renderizada (renderAgendaItems)
function addEventListenersToItems() {
    // Edit buttons
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            const dateKey = formatDateKey(currentDate);
            const itemToEdit = allEvents[dateKey]?.find(item => item.id === itemId);
            if (itemToEdit) {
                openModal(itemToEdit);
            }
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            deleteItem(itemId);
        });
    });

    // Toggle description buttons
    document.querySelectorAll('.toggle-description').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = button.getAttribute('aria-controls');
            const targetElement = document.getElementById(targetId);
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            button.setAttribute('aria-expanded', !isExpanded);
            if (isExpanded) {
                targetElement.style.display = 'none';
                button.textContent = 'Detalhes';
                button.setAttribute('aria-label', `Expandir detalhes da ${button.parentElement.querySelector('.item-title').textContent.replace(/^(Título do Evento:|Título da Tarefa:)\s*/, '').trim()}`);
            } else {
                targetElement.style.display = 'block';
                button.textContent = 'Colapsar';
                button.setAttribute('aria-label', `Colapsar detalhes da ${button.parentElement.querySelector('.item-title').textContent.replace(/^(Título do Evento:|Título da Tarefa:)\s*/, '').trim()}`);
            }
        });
    });

    // Task completion checkboxes
    document.querySelectorAll('input[type="checkbox"][id^="task-checkbox-"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.dataset.itemId;
            toggleTaskCompleted(taskId);
        });
    });
}

// --- Funções de Acessibilidade (exemplo) ---
function toggleHighContrast() {
    const widget = document.querySelector('.agenda-widget');
    widget.classList.toggle('high-contrast');
    document.querySelectorAll('.agenda-item').forEach(item => {
        item.classList.toggle('high-contrast');
    });
}

// Event listener para o botão de configurações (apenas um exemplo)
document.querySelector('.settings-button').addEventListener('click', () => {
    alert('Aqui seria a modal de configurações de acessibilidade! (Ex: tema, tamanho da fonte)');
    toggleHighContrast(); // Demonstra a mudança de contraste
});


// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    loadEvents(); // Carrega os eventos ao iniciar
    updateDateDisplay(); // Renderiza a agenda para a data atual
});