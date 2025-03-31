document.addEventListener('DOMContentLoaded', function() {
  // Función para asegurar que la fecha tenga segundos
  function formatDateTime(dateTime) {
    return dateTime.length === 16 ? dateTime + ":00" : dateTime;
  }

  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'es',
    height: 800,  // Altura aumentada a 800px
    editable: true,
    events: function(fetchInfo, successCallback, failureCallback) {
      let storedEvents = JSON.parse(localStorage.getItem("eventsList")) || [];
      let calendarEvents = storedEvents.map(ev => {
        let formattedDateTime = formatDateTime(ev.dateTime);
        if (ev.recurrence && ev.recurrence !== "Ninguno") {
          let freqMap = {
            "Diario": "daily",
            "Semanal": "weekly",
            "Mensual": "monthly"
          };
          return {
            title: ev.name,
            rrule: {
              freq: freqMap[ev.recurrence] || "daily",
              dtstart: formattedDateTime
            },
            duration: "PT1H",
            extendedProps: {
              id: ev.id,
              client: ev.client,
              location: ev.location,
              status: ev.status,
              recurrence: ev.recurrence,
              checklist: ev.checklist
            }
          };
        } else {
          return {
            title: ev.name,
            start: formattedDateTime,
            extendedProps: {
              id: ev.id,
              client: ev.client,
              location: ev.location,
              status: ev.status,
              recurrence: ev.recurrence,
              checklist: ev.checklist
            }
          };
        }
      });
      successCallback(calendarEvents);
    },
    eventDrop: function(info) {
      let newDate = info.event.start.toISOString().slice(0,16);
      let storedEvents = JSON.parse(localStorage.getItem("eventsList")) || [];
      let eventId = info.event.extendedProps.id;
      let eventIndex = storedEvents.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        if (storedEvents[eventIndex].recurrence && storedEvents[eventIndex].recurrence !== "Ninguno") {
          alert("No se pueden modificar eventos recurrentes arrastrando. Por favor, edítalo manualmente.");
          info.revert();
        } else {
          storedEvents[eventIndex].dateTime = newDate;
          localStorage.setItem("eventsList", JSON.stringify(storedEvents));
        }
      }
    },
    googleCalendarApiKey: '148638433718-t2lf1bt7gjf4a7uvecr5tp8l55fonufm.apps.googleusercontent.com',
    eventSources: [
      {
        googleCalendarId: 'axelsalinas476@gmail.com'
      }
    ]
  });

  calendar.render();
  window.calendar = calendar;
});
