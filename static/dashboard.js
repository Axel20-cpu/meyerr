    document.addEventListener("DOMContentLoaded", () => {
        // Obtener datos reales de localStorage
        const equipmentList = JSON.parse(localStorage.getItem("equipmentList")) || [];
        const eventsList = JSON.parse(localStorage.getItem("eventsList")) || [];
        const clientsList = JSON.parse(localStorage.getItem("clientsList")) || [];
    
        // Calcular contadores
        const availableEquipments = equipmentList.filter(eq => eq.status === "Disponible").length;
        const maintenanceEquipments = equipmentList.filter(eq => eq.status === "Mantenimiento").length;
        const activeEvents = eventsList.filter(ev => ev.status === "Activo").length;
        const clientsCount = clientsList.length;
    
        // Actualizar contadores en el DOM
        document.getElementById("available-equipments").textContent = availableEquipments;
        document.getElementById("maintenance-equipments").textContent = maintenanceEquipments;
        document.getElementById("active-events").textContent = activeEvents;
        document.getElementById("clients-count").textContent = clientsCount;
    
        // Variable global para el gráfico de equipos (para poder actualizarlo)
        let equipmentChart;
    
        // Función para crear el gráfico de equipos
        function createEquipmentChart(data) {
        // Si ya existe un gráfico, destrúyelo
        if (equipmentChart) {
            equipmentChart.destroy();
        }
        equipmentChart = new Chart(document.getElementById("equipmentChart"), {
            type: "doughnut",
            data: {
            labels: ["Disponibles", "En Mantenimiento"],
            datasets: [{
                data: data,
                backgroundColor: ["#00ff00", "#ff0000"]
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: false, // El contenedor cuadrado controla la proporción
            plugins: {
                legend: {
                labels: { color: "#d3d3d3" }
                }
            },
            cutout: "60%"
            }
        });
        }
    
        // Crear el gráfico de equipos con datos por defecto
        createEquipmentChart([availableEquipments, maintenanceEquipments]);
    
        // Gráfico de Eventos (Bar)
        new Chart(document.getElementById("eventsChart"), {
        type: "bar",
        data: {
            labels: ["Eventos Activos"],
            datasets: [{
            data: [activeEvents],
            backgroundColor: "#00ff00"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
            x: {
                ticks: { color: "#d3d3d3" },
                grid: { color: "#444" }
            },
            y: {
                ticks: { color: "#d3d3d3" },
                grid: { color: "#444" }
            }
            },
            plugins: { legend: { display: false } }
        }
        });
    
        // Función para restablecer el gráfico de equipos
        function resetEquipmentChart() {
        createEquipmentChart([availableEquipments, maintenanceEquipments]);
        }
    
        // Vincular eventos a las tarjetas
        const cardAvailable = document.getElementById("card-available");
        const cardMaintenance = document.getElementById("card-maintenance");
        const cardEvents = document.getElementById("card-events");
        const cardClients = document.getElementById("card-clients");
    
        // Al hacer clic en la tarjeta de Equipos Disponibles se muestra solo ese dato
        cardAvailable.addEventListener("click", () => {
        // Si el gráfico ya está filtrado, se resetea
        if (equipmentChart.data.datasets[0].data[1] === 0) {
            resetEquipmentChart();
        } else {
            createEquipmentChart([availableEquipments, 0]);
        }
        });
    
        // Al hacer clic en la tarjeta de Equipos en Mantenimiento se muestra solo ese dato
        cardMaintenance.addEventListener("click", () => {
        if (equipmentChart.data.datasets[0].data[0] === 0) {
            resetEquipmentChart();
        } else {
            createEquipmentChart([0, maintenanceEquipments]);
        }
        });
    
        // Las tarjetas de Eventos y Clientes redirigen o muestran mensajes
        cardEvents.addEventListener("click", () => {
        alert("El gráfico de eventos ya muestra los datos de eventos activos.");
        });
    
        cardClients.addEventListener("click", () => {
        window.location.href = "clients.html";
        });
    });
    