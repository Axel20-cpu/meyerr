document.addEventListener("DOMContentLoaded", () => {
    // Verifica si el navegador soporta notificaciones
    if (!("Notification" in window)) {
        console.log("Este navegador no soporta notificaciones de escritorio.");
        return;
    }
    
    // Solicita permiso si aún no se ha concedido ni denegado
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("Permiso para notificaciones concedido.");
        }
        });
    }
    
    // Función para revisar eventos próximos
    function checkForUpcomingEvents() {
        let eventsList = JSON.parse(localStorage.getItem("eventsList")) || [];
        let now = new Date();
    
        eventsList.forEach((event, index) => {
        // Notificamos solo para eventos sin recurrencia o con "Ninguno"
        if (!event.recurrence || event.recurrence === "Ninguno") {
            let eventTime = new Date(event.dateTime);
            let diff = eventTime - now;
          // Si el evento empieza en los próximos 15 minutos y aún no fue notificado
          if (diff > 0 && diff <= 15 * 60 * 1000 && !event.notified) {
            new Notification("Recordatorio de Evento", {
                body: `El evento "${event.name}" comienza a las ${event.dateTime}.`
            });
            // Marcar evento como notificado para no repetir
            event.notified = true;
            }
        }
        });
      // Actualiza la lista en localStorage
        localStorage.setItem("eventsList", JSON.stringify(eventsList));
    }
    
    // Revisa cada minuto (60,000 ms)
    setInterval(checkForUpcomingEvents, 60000);
    // Ejecuta una revisión inmediata al cargar la página
    checkForUpcomingEvents();
    });
