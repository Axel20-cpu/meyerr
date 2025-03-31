document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM para clientes
    const addClientButton = document.getElementById("add-client-button");
    const addClientModal = document.getElementById("add-client-modal");
    const closeModalButton = document.getElementById("close-modal");
    const addClientForm = document.getElementById("add-client-form");
    const clientsTableBody = document.getElementById("clients-table-body");
    const exportButton = document.getElementById("export-button");

    // Elementos del DOM para contratos
    const contractsModal = document.getElementById("contracts-modal");
    const contractsTableBody = document.getElementById("contracts-table-body");
    const contractsClientInfo = document.getElementById("contracts-client-info");
    const closeContractsModalButton = document.getElementById("close-contracts-modal");
    const addContractButton = document.getElementById("add-contract-button");

    const contractFormModal = document.getElementById("contract-form-modal");
    const contractFormTitle = document.getElementById("contract-form-title");
    const contractForm = document.getElementById("contract-form");
    const closeContractFormButton = document.getElementById("close-contract-form");
    const contractStartInput = document.getElementById("contract-start");
    const contractEndInput = document.getElementById("contract-end");
    const contractDescriptionInput = document.getElementById("contract-description");
    const contractStatusSelect = document.getElementById("contract-status");

    // Obtener datos desde localStorage
    let clientsList = JSON.parse(localStorage.getItem("clientsList")) || [];
    let contractsList = JSON.parse(localStorage.getItem("contractsList")) || [];

    // Función para renderizar clientes
    function renderClientsList() {
        clientsTableBody.innerHTML = "";

        if (clientsList.length === 0) {
            clientsTableBody.innerHTML = `<tr><td colspan="6">No hay clientes registrados.</td></tr>`;
            return;
        }

        clientsList.forEach((client, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${client.id}</td>
                <td>${client.name}</td>
                <td>${client.company}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>
                    <button class="contracts-btn" data-index="${index}">Ver Contratos</button>
                    <button class="delete-btn" data-index="${index}">🗑 Eliminar</button>
                </td>
            `;
            clientsTableBody.appendChild(row);
        });

        // Funcionalidad para eliminar cliente (y sus contratos asociados)
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                const clientId = clientsList[index].id;
                clientsList.splice(index, 1);
                contractsList = contractsList.filter(contract => contract.clientId !== clientId);
                localStorage.setItem("clientsList", JSON.stringify(clientsList));
                localStorage.setItem("contractsList", JSON.stringify(contractsList));
                renderClientsList();
            });
        });

        // Funcionalidad para ver contratos
        document.querySelectorAll(".contracts-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                const client = clientsList[index];
                openContractsModal(client);
            });
        });
    }

    // Modal de cliente
    function openClientModal() {
        addClientModal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
    function closeClientModal() {
        addClientModal.style.display = "none";
        document.body.style.overflow = "auto";
        addClientForm.reset();
    }
    addClientButton.addEventListener("click", openClientModal);
    closeModalButton.addEventListener("click", closeClientModal);
    window.addEventListener("click", (event) => {
        if (event.target === addClientModal) {
            closeClientModal();
        }
    });
    addClientForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Genera un ID corto (4 dígitos) aleatorio para el cliente
        const randomId = Math.floor(Math.random() * 10000);
        const paddedId = String(randomId).padStart(4, '0');
        const id = `CL${paddedId}`;

        const name = document.getElementById("client-name").value.trim();
        const company = document.getElementById("client-company").value.trim();
        const email = document.getElementById("client-email").value.trim();
        const phone = document.getElementById("client-phone").value.trim();

        if (!name || !company || !email || !phone) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        clientsList.push({ id, name, company, email, phone });
        localStorage.setItem("clientsList", JSON.stringify(clientsList));
        renderClientsList();
        closeClientModal();
    });
    exportButton.addEventListener("click", () => {
        if (clientsList.length === 0) {
            alert("No hay clientes para exportar.");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(clientsList);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Clientes");
        XLSX.writeFile(wb, "Clientes_Rigging.xlsx");
    });

    // Funciones para contratos
    function openContractsModal(client) {
        contractsClientInfo.innerHTML = `<p><strong>Cliente:</strong> ${client.name} (${client.company})</p>`;
        contractsModal.dataset.clientId = client.id;
        renderContracts(client.id);
        contractsModal.style.display = "block";
    }
    function closeContractsModal() {
        contractsModal.style.display = "none";
    }
    closeContractsModalButton.addEventListener("click", closeContractsModal);

    function renderContracts(clientId) {
        contractsTableBody.innerHTML = "";
        const clientContracts = contractsList.filter(contract => contract.clientId === clientId);
        if (clientContracts.length === 0) {
            contractsTableBody.innerHTML = `<tr><td colspan="6">No hay contratos registrados.</td></tr>`;
            return;
        }
        clientContracts.forEach((contract, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${contract.id}</td>
                <td>${contract.startDate}</td>
                <td>${contract.endDate}</td>
                <td>${contract.description}</td>
                <td>${contract.status}</td>
                <td>
                    <button class="delete-contract-btn" data-index="${index}" data-clientid="${clientId}">🗑 Eliminar</button>
                </td>
            `;
            contractsTableBody.appendChild(row);
        });
        document.querySelectorAll(".delete-contract-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const clientId = e.target.dataset.clientid;
                const clientContracts = contractsList.filter(c => c.clientId === clientId);
                const indexInClientContracts = e.target.dataset.index;
                const contractToDelete = clientContracts[indexInClientContracts];
                contractsList = contractsList.filter(c => c.id !== contractToDelete.id);
                localStorage.setItem("contractsList", JSON.stringify(contractsList));
                renderContracts(clientId);
            });
        });
    }

    function openContractFormModal(clientId) {
        contractFormTitle.textContent = "Agregar Contrato";
        contractForm.reset();
        contractFormModal.dataset.clientId = clientId;
        contractFormModal.dataset.contractId = "";
        contractFormModal.style.display = "block";
    }
    function closeContractFormModal() {
        contractFormModal.style.display = "none";
    }
    addContractButton.addEventListener("click", () => {
        const clientId = contractsModal.dataset.clientId;
        openContractFormModal(clientId);
    });
    closeContractFormButton.addEventListener("click", closeContractFormModal);
    contractForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const clientId = contractFormModal.dataset.clientId;
        let contractId = contractFormModal.dataset.contractId;
        const startDate = document.getElementById("contract-start").value;
        const endDate = document.getElementById("contract-end").value;
        const description = document.getElementById("contract-description").value.trim();
        const status = document.getElementById("contract-status").value;
        if (!startDate || !endDate || !description || !status) {
            alert("Todos los campos son obligatorios.");
            return;
        }
        if (!contractId) {
            contractId = `CT${Date.now()}`;
            contractsList.push({ id: contractId, clientId, startDate, endDate, description, status });
        } else {
            contractsList = contractsList.map(contract => {
                if (contract.id === contractId) {
                    return { ...contract, startDate, endDate, description, status };
                }
                return contract;
            });
        }
        localStorage.setItem("contractsList", JSON.stringify(contractsList));
        renderContracts(clientId);
        closeContractFormModal();
    });

    // Renderizar la lista de clientes
    renderClientsList();
});
