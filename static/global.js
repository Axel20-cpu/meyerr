// ====== TOGGLE DEL MENÚ LATERAL ======
function toggleMenu() {
    document.querySelector(".sidebar").classList.toggle("active");
}

// ====== GRÁFICOS ======
document.addEventListener("DOMContentLoaded", () => {
    new Chart(document.getElementById("equipmentChart"), {
        type: "doughnut",
        data: {
            labels: ["Disponibles", "En Mantenimiento"],
            datasets: [{
                data: [42, 5],
                backgroundColor: ["#00ff00", "#ff0000"] // Verde y Rojo
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    new Chart(document.getElementById("eventsChart"), {
        type: "bar",
        data: {
            labels: ["Eventos Activos"],
            datasets: [{
                data: [3],
                backgroundColor: "#00ff00" // Verde
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});

// ====== BOTÓN DE EXPORTACIÓN (SIMULACIÓN) ======
document.querySelectorAll(".export-button").forEach(button => {
    button.addEventListener("click", () => {
        alert("Funcionalidad de exportación en desarrollo...");
    });
});

// ====== MODALES ======
document.querySelectorAll(".modal").forEach(modal => {
    const closeModal = modal.querySelector(".close-modal");
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
});

// ====== MANEJO DE BUSQUEDA EN TABLAS ======
document.querySelectorAll(".search-input").forEach(input => {
    input.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tableId = e.target.dataset.table;
        const table = document.getElementById(tableId);

        if (table) {
            table.querySelectorAll("tbody tr").forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? "" : "none";
            });
        }
    });
});
