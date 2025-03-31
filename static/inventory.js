document.addEventListener("DOMContentLoaded", () => {
    const addEquipmentButton = document.getElementById("add-equipment-button");
    const addEquipmentModal = document.getElementById("add-equipment-modal");
    const closeModalButton = document.getElementById("close-modal");
    const addEquipmentForm = document.getElementById("add-equipment-form");
    const equipmentTableBody = document.getElementById("equipment-table-body");
    const exportButton = document.getElementById("export-button");
    const scanButton = document.getElementById("scan-button");
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
  
    // Elementos para el modal de editar equipo
    const editEquipmentModal = document.getElementById("edit-equipment-modal");
    const editEquipmentForm = document.getElementById("edit-equipment-form");
    const closeEditModalButton = document.getElementById("close-edit-modal");
  
    // Elementos para el modal de QR
    const qrModal = document.getElementById("qr-modal");
    const qrCodeContainer = document.getElementById("qr-code-container");
    const closeQrModalButton = document.getElementById("close-qr-modal");
  
    // Elementos para el modal de escaneo
    const scanModal = document.getElementById("scan-modal");
    const qrVideo = document.getElementById("qr-video");
    const qrCanvas = document.getElementById("qr-canvas");
    const scanStatus = document.getElementById("scan-status");
    const closeScanModalButton = document.getElementById("close-scan-modal");
    let videoStream = null;
  
    let equipmentList = JSON.parse(localStorage.getItem("equipmentList")) || [];
    let currentEditIndex = null;
  
    // Función para renderizar la lista de equipos
    function renderEquipmentList(filter = "", status = "") {
      equipmentTableBody.innerHTML = "";
  
      const filteredList = equipmentList.filter(equipment => {
        const matchesFilter = !filter || equipment.name.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = !status || equipment.status === status;
        return matchesFilter && matchesStatus;
      });
  
      if (filteredList.length === 0) {
        equipmentTableBody.innerHTML = `<tr><td colspan="7">No hay equipos registrados.</td></tr>`;
        return;
      }
  
      let totalEquipos = 0;
      let currentCategory = null;
      let categoryCount = 0;
  
      filteredList.forEach((equipment, index) => {
        if (equipment.category !== currentCategory) {
          if (currentCategory !== null) {
            const subtotalRow = document.createElement("tr");
            subtotalRow.innerHTML = `
              <td colspan="5" style="text-align: right; font-weight: bold;">Subtotal:</td>
              <td colspan="2" style="font-weight: bold;">${categoryCount}</td>
            `;
            equipmentTableBody.appendChild(subtotalRow);
            categoryCount = 0;
          }
          currentCategory = equipment.category;
          const headerRow = document.createElement("tr");
          headerRow.classList.add("category-header");
          headerRow.innerHTML = `<td colspan="7">${currentCategory}</td>`;
          equipmentTableBody.appendChild(headerRow);
        }
  
        const statusClass =
          equipment.status === "Disponible" ? "status-disponible" :
          equipment.status === "En Uso" ? "status-en-uso" :
          "status-mantenimiento";
  
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${equipment.id}</td>
          <td>${equipment.name}</td>
          <td>${equipment.category}</td>
          <td class="${statusClass}">${equipment.status}</td>
          <td><input type="text" class="edit-observations" data-index="${index}" value="${equipment.observations || ''}"></td>
          <td>${equipment.addedAt ? new Date(equipment.addedAt).toLocaleDateString() : '—'}</td>
          <td>
            <button class="edit-btn" data-index="${index}">✏️ Editar</button>
            <button class="delete-btn" data-index="${index}">🗑 Eliminar</button>
            <button class="qr-btn" data-index="${index}">QR</button>
          </td>
        `;
        equipmentTableBody.appendChild(row);
        totalEquipos++;
        categoryCount++;
      });
  
      const subtotalRow = document.createElement("tr");
      subtotalRow.innerHTML = `
        <td colspan="5" style="text-align: right; font-weight: bold;">Subtotal:</td>
        <td colspan="2" style="font-weight: bold;">${categoryCount}</td>
      `;
      equipmentTableBody.appendChild(subtotalRow);
  
      const totalRow = document.createElement("tr");
      totalRow.innerHTML = `
        <td colspan="5" style="text-align: right; font-weight: bold;">Total de Equipos:</td>
        <td colspan="2" style="font-weight: bold;">${totalEquipos}</td>
      `;
      equipmentTableBody.appendChild(totalRow);
  
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", (e) => {
          const index = e.target.dataset.index;
          equipmentList.splice(index, 1);
          saveAndRender();
        });
      });
  
      document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", (e) => {
          currentEditIndex = parseInt(e.target.dataset.index);
          const eq = equipmentList[currentEditIndex];
          document.getElementById("edit-name").value = eq.name;
          document.getElementById("edit-category").value = eq.category;
          document.getElementById("edit-status").value = eq.status;
          document.getElementById("edit-observations").value = eq.observations || "";
          editEquipmentModal.style.display = "block";
        });
      });
  
      document.querySelectorAll(".qr-btn").forEach(button => {
        button.addEventListener("click", (e) => {
          const index = e.target.dataset.index;
          const equipment = equipmentList[index];
          showQRCode(equipment.id);
        });
      });
    }
  
    function saveAndRender() {
      localStorage.setItem("equipmentList", JSON.stringify(equipmentList));
      renderEquipmentList(searchInput.value, statusFilter.value);
    }
  
    // Función para mostrar el código QR en el modal
    function showQRCode(equipmentId) {
      qrCodeContainer.innerHTML = "";
      new QRCode(qrCodeContainer, {
        text: equipmentId,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
      qrModal.style.display = "block";
    }
  
    closeQrModalButton.addEventListener("click", () => {
      qrModal.style.display = "none";
    });
  
    // Funcionalidad para escanear código QR
    function startScanning() {
      scanModal.style.display = "block";
      scanStatus.textContent = "Buscando código...";
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          videoStream = stream;
          qrVideo.srcObject = stream;
          qrVideo.setAttribute("playsinline", true);
          qrVideo.play();
          requestAnimationFrame(tick);
        })
        .catch(err => {
          console.error("Error accediendo a la cámara:", err);
          scanStatus.textContent = "Error accediendo a la cámara.";
        });
    }
  
    function tick() {
      if (qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
        qrCanvas.height = qrVideo.videoHeight;
        qrCanvas.width = qrVideo.videoWidth;
        const ctx = qrCanvas.getContext("2d");
        ctx.drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);
        const imageData = ctx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if (code) {
          scanStatus.textContent = "Código detectado: " + code.data;
          const equipmentIndex = equipmentList.findIndex(eq => eq.id === code.data);
          if (equipmentIndex !== -1) {
            equipmentList[equipmentIndex].status = "En Uso";
            equipmentList[equipmentIndex].lastScanned = new Date().toISOString();
            saveAndRender();
            // Registrar el movimiento en tracking
            const movement = {
              idEquipo: equipmentList[equipmentIndex].id,
              nombre: equipmentList[equipmentIndex].name,
              timestamp: new Date().toISOString(),
              estado: "En Uso"
            };
            let trackingList = JSON.parse(localStorage.getItem("trackingList")) || [];
            trackingList.push(movement);
            localStorage.setItem("trackingList", JSON.stringify(trackingList));
            stopScanning();
            alert("Equipo " + code.data + " marcado como 'En Uso' y registrado en seguimiento.");
          } else {
            scanStatus.textContent = "Equipo no encontrado.";
          }
          return;
        } else {
          scanStatus.textContent = "Buscando código...";
        }
      }
      requestAnimationFrame(tick);
    }
  
    function stopScanning() {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
      }
      scanModal.style.display = "none";
    }
  
    closeScanModalButton.addEventListener("click", stopScanning);
    scanButton.addEventListener("click", startScanning);
  
    addEquipmentButton.addEventListener("click", () => {
      addEquipmentModal.style.display = "block";
    });
  
    closeModalButton.addEventListener("click", () => {
      addEquipmentModal.style.display = "none";
    });
  
    editEquipmentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      equipmentList[currentEditIndex].name = document.getElementById("edit-name").value;
      equipmentList[currentEditIndex].category = document.getElementById("edit-category").value;
      equipmentList[currentEditIndex].status = document.getElementById("edit-status").value;
      equipmentList[currentEditIndex].observations = document.getElementById("edit-observations").value;
      saveAndRender();
      editEquipmentModal.style.display = "none";
    });
  
    closeEditModalButton.addEventListener("click", () => {
      editEquipmentModal.style.display = "none";
    });
  
    addEquipmentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Genera un ID corto (4 dígitos) aleatorio para el equipo
      const randomId = Math.floor(Math.random() * 10000);
      const paddedId = String(randomId).padStart(4, '0');
      // Usamos un formato base: "EQ{numero}" y si es cantidad mayor se añade un sufijo
      const baseId = `EQ${paddedId}`;
      const name = document.getElementById("equipment-name").value;
      const category = document.getElementById("equipment-category").value;
      const status = document.getElementById("equipment-status").value;
      const observations = document.getElementById("equipment-observations").value;
      const quantity = parseInt(document.getElementById("equipment-quantity").value) || 1;
  
      for (let i = 1; i <= quantity; i++) {
        equipmentList.push({
          id: quantity === 1 ? baseId : `${baseId}-${i}`,
          name,
          category,
          status,
          observations,
          addedAt: new Date().toISOString(),
          quantity: 1
        });
      }
      saveAndRender();
      addEquipmentForm.reset();
      addEquipmentModal.style.display = "none";
    });
  
    exportButton.addEventListener("click", () => {
      if (equipmentList.length === 0) {
        alert("No hay equipos para exportar.");
        return;
      }
      const ws = XLSX.utils.json_to_sheet(equipmentList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");
      XLSX.writeFile(wb, "Inventario_Rigging.xlsx");
    });
  
    searchInput.addEventListener("input", () => {
      renderEquipmentList(searchInput.value, statusFilter.value);
    });
  
    statusFilter.addEventListener("change", () => {
      renderEquipmentList(searchInput.value, statusFilter.value);
    });
  
    renderEquipmentList();
  });
  