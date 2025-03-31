    document.addEventListener("DOMContentLoaded", function() {
        // Inicializa el mapa y define una vista global
        var map = L.map('map').setView([0, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        // Crea un grupo para agrupar marcadores (clustering)
        var markersCluster = L.markerClusterGroup();
        
        // Extrae la lista de eventos desde localStorage
        let eventsList = JSON.parse(localStorage.getItem("eventsList")) || [];
        
        // Función para obtener eventos filtrados por el valor seleccionado
        function getFilteredEvents() {
        let filterValue = document.getElementById("status-filter").value;
        if (filterValue === "Todos") {
            return eventsList;
        } else {
            return eventsList.filter(ev => ev.status === filterValue);
        }
        }
        
        // Función asíncrona para geocodificar una dirección usando la API Nominatim
        async function geocodeAddress(address) {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        try {
            let response = await fetch(url, { 
            headers: { 'User-Agent': 'RiggingApp/1.0 (tucorreo@ejemplo.com)' }
            });
            let data = await response.json();
            if(data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
            }
        } catch (error) {
            console.error("Error geocodificando la dirección:", address, error);
        }
        return null;
        }
        
        // Función para agregar marcadores al mapa con clustering
        async function addEventMarkers() {
        markersCluster.clearLayers();
        let filteredEvents = getFilteredEvents();
        for (let event of filteredEvents) {
            if (event.location) {
            let coords = await geocodeAddress(event.location);
            if (coords) {
                let marker = L.marker([coords.lat, coords.lon]);
                marker.bindPopup(`<strong>${event.name}</strong><br>${event.dateTime}<br>${event.location}`);
                markersCluster.addLayer(marker);
            }
            }
        }
        map.addLayer(markersCluster);
        // Ajusta la vista para abarcar todos los marcadores, si existen
        if (markersCluster.getLayers().length > 0) {
            map.fitBounds(markersCluster.getBounds());
        }
        }
        
        // Función para calcular la ruta entre dos eventos (los dos primeros marcadores filtrados)
        var routingControl;
        function calculateRoute() {
        let markers = markersCluster.getLayers();
        if (markers.length < 2) {
            alert("Se necesitan al menos dos eventos para calcular una ruta.");
            return;
        }
        
        // Selecciona los dos primeros marcadores; aquí podrías mejorar la selección según criterios
        let waypoints = markers.slice(0, 2).map(marker => marker.getLatLng());
        
        if (routingControl) {
            map.removeControl(routingControl);
        }
        
        routingControl = L.Routing.control({
            waypoints: waypoints,
            router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
            }),
            lineOptions: {
            styles: [{ color: 'blue', opacity: 0.6, weight: 4 }]
            },
            createMarker: function(i, waypoint, n) {
            return L.marker(waypoint.latLng).bindPopup(`Waypoint ${i+1}`);
            },
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true
        }).addTo(map);
        }
        
        // Inicializa los marcadores en el mapa
        addEventMarkers();
        
        // Actualiza los marcadores al cambiar el filtro
        document.getElementById("status-filter").addEventListener("change", addEventMarkers);
        
        // Calcula la ruta al hacer clic en el botón "Calcular Ruta"
        document.getElementById("calculate-route").addEventListener("click", calculateRoute);
    });
    