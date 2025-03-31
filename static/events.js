document.addEventListener("DOMContentLoaded", () => {
    const eventsTableBody = document.getElementById("events-table-body");
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
    const addEventForm = document.getElementById("add-event-form");
    const addEventButton = document.getElementById("add-event-button");
    const addEventModal = document.getElementById("add-event-modal");
    const closeModalButton = document.getElementById("close-modal");
    const exportButton = document.getElementById("export-button");

    const editEventModal = document.getElementById("edit-event-modal");
    const editEventForm = document.getElementById("edit-event-form");
    const closeEditModalButton = document.getElementById("close-edit-modal");
    const editChecklistBtn = document.getElementById("edit-checklist-btn");

    const checklistModal = document.getElementById("checklist-modal");
    const checklistForm = document.getElementById("checklist-form");
    const checklistText = document.getElementById("checklist-text");
    const closeChecklistModalBtn = document.getElementById("close-checklist-modal");

    const viewEventModal = document.getElementById("view-event-modal");
    const closeViewModalButton = document.getElementById("close-view-modal");
    // Elementos para la vista detallada
    const detailEventId = document.getElementById("detail-event-id");
    const detailEventName = document.getElementById("detail-event-name");
    const detailEventClient = document.getElementById("detail-event-client");
    const detailEventDatetime = document.getElementById("detail-event-datetime");
    const detailEventLocation = document.getElementById("detail-event-location");
    const detailEventRecurrence = document.getElementById("detail-event-recurrence");
    const detailEventChecklist = document.getElementById("detail-event-checklist");
    const detailEventStatus = document.getElementById("detail-event-status");
    const detailEventWeather = document.getElementById("detail-event-weather");

    let eventsList = JSON.parse(localStorage.getItem("eventsList")) || [];
    let currentChecklistIndex = null;
    let currentSortColumn = ""; // Columna actual para ordenar
    let currentSortOrder = "asc"; // "asc" o "desc"

    // Función para formatear la fecha y hora: separamos la fecha en DD/MM/YYYY y dejamos la hora
    function formatEventDateTime(dtStr) {
        if (!dtStr) return { formattedDate: "", formattedTime: "" };
        const parts = dtStr.split("T");
        if (parts.length < 2) return { formattedDate: dtStr, formattedTime: "" };
        const [year, month, day] = parts[0].split("-");
        const formattedDate = `${day}/${month}/${year}`;
        const formattedTime = parts[1]; // Puede tener formato HH:mm o HH:mm:ss
        return { formattedDate, formattedTime };
    }

    // Función para obtener clima usando OpenWeatherMap (reemplaza TU_API_KEY_WEATHER)
    function fetchWeather(location) {
        const apiKey = "707ee9c64ec592cb18b66f8138c42afb"; // Reemplaza con tu API key
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Paraná,AR&appid=707ee9c64ec592cb18b66f8138c42afb&units=metric&lang=es`;
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod !== 200) {
                    throw new Error(data.message);
                }
                return data;
            });
    }

    // Función para ordenar la lista según la columna seleccionada
    function sortEvents(list) {
        if (!currentSortColumn) return list;
        return list.sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];
            if (currentSortColumn === "dateTime") {
                return currentSortOrder === "asc" ? new Date(valA) - new Date(valB) : new Date(valB) - new Date(valA);
            } else {
                valA = valA.toString().toLowerCase();
                valB = valB.toString().toLowerCase();
                if (valA < valB) return currentSortOrder === "asc" ? -1 : 1;
                if (valA > valB) return currentSortOrder === "asc" ? 1 : -1;
                return 0;
            }
        });
    }

    // Funciones para Drag & Drop (solo se activan si no hay filtros ni orden)
    let draggedEventId = null;

    function handleDragStart(e) {
        draggedEventId = this.dataset.eventId;
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    function handleDrop(e) {
        e.stopPropagation();
        const targetId = this.dataset.eventId;
        if (draggedEventId === targetId) return;
        const draggedIndex = eventsList.findIndex(ev => ev.id === draggedEventId);
        const targetIndex = eventsList.findIndex(ev => ev.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return;
        const [draggedEvent] = eventsList.splice(draggedIndex, 1);
        eventsList.splice(targetIndex, 0, draggedEvent);
        localStorage.setItem("eventsList", JSON.stringify(eventsList));
        renderEvents();
    }

    // Función para renderizar eventos en la tabla
    function renderEvents() {
        eventsTableBody.innerHTML = "";

        if (eventsList.length === 0) {
            eventsTableBody.innerHTML = `<tr><td colspan="8">No hay eventos registrados.</td></tr>`;
            return;
        }

        let filteredList = eventsList.filter(event => {
            const matchesSearch = !searchInput.value ||
                event.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                event.client.toLowerCase().includes(searchInput.value.toLowerCase());
            const matchesStatus = !statusFilter.value || event.status === statusFilter.value;
            return matchesSearch && matchesStatus;
        });

        filteredList = sortEvents(filteredList);

        if (filteredList.length === 0) {
            eventsTableBody.innerHTML = `<tr><td colspan="8">No hay eventos con esos criterios.</td></tr>`;
            return;
        }

        filteredList.forEach((event, index) => {
            const row = document.createElement("tr");
            row.dataset.eventId = event.id;
            const { formattedDate, formattedTime } = formatEventDateTime(event.dateTime);
            const locationLink = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}" target="_blank">${event.location}</a>`;
            row.innerHTML = `
                <td>${event.id}</td>
                <td>${event.name}</td>
                <td>${event.client}</td>
                <td>${formattedDate}<br>${formattedTime}</td>
                <td>${locationLink}</td>
                <td><button class="checklist-btn" data-index="${index}">Ver Tareas</button></td>
                <td>${event.status}</td>
                <td>
                    <button class="view-btn" data-index="${index}">👁️ Detalles</button>
                    <button class="edit-btn" data-index="${index}">✏️ Editar</button>
                    <button class="delete-btn" data-index="${index}">🗑 Eliminar</button>
                </td>
            `;
            eventsTableBody.appendChild(row);

            if (!searchInput.value && !statusFilter.value && currentSortColumn === "") {
                row.draggable = true;
                row.addEventListener("dragstart", handleDragStart);
                row.addEventListener("dragover", handleDragOver);
                row.addEventListener("drop", handleDrop);
            }
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                eventsList.splice(index, 1);
                localStorage.setItem("eventsList", JSON.stringify(eventsList));
                renderEvents();
                if (window.calendar) {
                    window.calendar.refetchEvents();
                }
            });
        });

        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                const event = eventsList[index];
                document.getElementById("edit-event-name").value = event.name;
                document.getElementById("edit-event-client").value = event.client;
                document.getElementById("edit-event-datetime").value = event.dateTime;
                document.getElementById("edit-event-location").value = event.location;
                document.getElementById("edit-event-recurrence").value = event.recurrence || "Ninguno";
                document.getElementById("edit-event-status").value = event.status;
                editEventForm.dataset.index = index;
                editEventModal.style.display = "block";
            });
        });

        document.querySelectorAll(".checklist-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                currentChecklistIndex = index;
                const event = eventsList[index];
                checklistText.value = event.checklist || "";
                checklistModal.style.display = "block";
            });
        });

        // Al hacer clic en "Detalles", se muestran los datos y se consulta el clima
        document.querySelectorAll(".view-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                const event = eventsList[index];
                detailEventId.textContent = event.id;
                detailEventName.textContent = event.name;
                detailEventClient.textContent = event.client;
                const { formattedDate, formattedTime } = formatEventDateTime(event.dateTime);
                detailEventDatetime.innerHTML = formattedDate + "<br>" + formattedTime;
                detailEventLocation.textContent = event.location;
                detailEventRecurrence.textContent = event.recurrence;
                detailEventChecklist.textContent = event.checklist;
                detailEventStatus.textContent = event.status;
                detailEventWeather.textContent = "Cargando...";
                // Consulta el clima para la ubicación
                fetchWeather(event.location)
                    .then(data => {
                        const temp = data.main.temp;
                        const description = data.weather[0].description;
                        detailEventWeather.textContent = `${temp}°C, ${description}`;
                    })
                    .catch(err => {
                        console.error("Error obteniendo clima:", err);
                        detailEventWeather.textContent = "No disponible";
                    });
                viewEventModal.style.display = "block";
            });
        });
    }

    addEventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const randomId = Math.floor(Math.random() * 1000000);
        const paddedId = String(randomId).padStart(6, '0');
        const id = `EV${paddedId}`;

        const name = document.getElementById("event-name").value;
        const client = document.getElementById("event-client").value;
        const dateTime = document.getElementById("event-datetime").value;
        const location = document.getElementById("event-location").value;
        const recurrence = document.getElementById("event-recurrence").value;
        const checklist = document.getElementById("event-checklist").value;
        const status = document.getElementById("event-status").value;

        eventsList.push({ id, name, client, dateTime, location, recurrence, checklist, status });
        localStorage.setItem("eventsList", JSON.stringify(eventsList));
        renderEvents();
        addEventForm.reset();
        addEventModal.style.display = "none";
        if (window.calendar) {
            setTimeout(() => { window.calendar.refetchEvents(); }, 100);
        }
    });

    addEventButton.addEventListener("click", () => {
        addEventModal.style.display = "block";
    });

    closeModalButton.addEventListener("click", () => {
        addEventModal.style.display = "none";
    });

    editEventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const index = editEventForm.dataset.index;
        eventsList[index].name = document.getElementById("edit-event-name").value;
        eventsList[index].client = document.getElementById("edit-event-client").value;
        eventsList[index].dateTime = document.getElementById("edit-event-datetime").value;
        eventsList[index].location = document.getElementById("edit-event-location").value;
        eventsList[index].recurrence = document.getElementById("edit-event-recurrence").value;
        eventsList[index].status = document.getElementById("edit-event-status").value;
        localStorage.setItem("eventsList", JSON.stringify(eventsList));
        renderEvents();
        editEventModal.style.display = "none";
        if (window.calendar) {
            window.calendar.refetchEvents();
        }
    });

    closeEditModalButton.addEventListener("click", () => {
        editEventModal.style.display = "none";
    });

    checklistForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (currentChecklistIndex !== null) {
            eventsList[currentChecklistIndex].checklist = checklistText.value;
            localStorage.setItem("eventsList", JSON.stringify(eventsList));
            checklistModal.style.display = "none";
            currentChecklistIndex = null;
            renderEvents();
            if (window.calendar) {
                window.calendar.refetchEvents();
            }
        }
    });

    closeChecklistModalBtn.addEventListener("click", () => {
        checklistModal.style.display = "none";
    });

    closeViewModalButton.addEventListener("click", () => {
        viewEventModal.style.display = "none";
    });

    searchInput.addEventListener("input", renderEvents);
    statusFilter.addEventListener("change", renderEvents);

    document.querySelectorAll("th[data-column]").forEach(th => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const column = th.getAttribute("data-column");
            if (currentSortColumn === column) {
                currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
            } else {
                currentSortColumn = column;
                currentSortOrder = "asc";
            }
            renderEvents();
        });
    });

    renderEvents();
});
