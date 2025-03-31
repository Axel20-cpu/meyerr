document.addEventListener("DOMContentLoaded", () => {
    const scanQRButton = document.getElementById("scan-qr-button");
    const trackingTableBody = document.getElementById("tracking-table-body");

    // Obtener lista de movimientos desde localStorage
    let trackingList = JSON.parse(localStorage.getItem("trackingList")) || [];

    // Función para renderizar la lista de movimientos
    function renderTrackingList() {
        trackingTableBody.innerHTML = "";

        if (trackingList.length === 0) {
            trackingTableBody.innerHTML = `<tr><td colspan="5">No hay movimientos registrados.</td></tr>`;
            return;
        }

        trackingList.forEach((movement) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${movement.id}</td>
                <td>${movement.name}</td>
                <td>${movement.location}</td>
                <td>${movement.timestamp}</td>
                <td>${movement.status}</td>
            `;
            trackingTableBody.appendChild(row);
        });
    }

    // Simulación de escaneo QR/Barras
    scanQRButton.addEventListener("click", () => {
        const id = `EQ${Math.floor(Math.random() * 1000)}`;
        const name = `Equipo ${Math.floor(Math.random() * 10)}`;
        const location = prompt("Ingrese la ubicación del equipo escaneado:");
        const timestamp = new Date().toLocaleString();
        const status = "Escaneado";

        if (!location) {
            alert("Ubicación no ingresada. Escaneo cancelado.");
            return;
        }

        const newMovement = { id, name, location, timestamp, status };
        trackingList.push(newMovement);
        localStorage.setItem("trackingList", JSON.stringify(trackingList));

        renderTrackingList();
    });

    // Renderizar la lista de movimientos al cargar la página
    renderTrackingList();
});
