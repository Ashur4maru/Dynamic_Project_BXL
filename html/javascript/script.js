document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = L.map('map').setView([50.85045, 4.34878], 13); // Centered on Brussels

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add legend to the map
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
            <i style="background: blue"></i> Grote capaciteit (500+)<br>
            <i style="background: green"></i> Gemiddelde capaciteit (100-500)<br>
            <i style="background: red"></i> Kleine capaciteit (<100)<br>
        `;
        return div;
    };

    legend.addTo(map);

    let locationsData = [];

    // Fetch data van de opendata.brussels API en toon locaties
    fetch('https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parkings_publics/records?limit=20&offset=0')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            locationsData = data.results;
            displayLocations(locationsData);
        })
        .catch(error => console.error('Error fetching data:', error));

    function getColor(capacity) {
        return capacity > 500 ? 'blue' :
               capacity > 100 ? 'green' :
                                'red';
    }

    function displayLocations(data) {
        const locationsContainer = document.getElementById('locations');
        locationsContainer.innerHTML = '';
        data.forEach(record => {
            const location = record;
            const locationElement = document.createElement('div');
            locationElement.classList.add('location');
            locationElement.innerHTML = `
                <h3>${location.name_nl}</h3>
                <p>Adres: ${location.adres_}</p>
                <p>Aantal plaatsen: ${location.capacity}</p>
                <p>Operator: ${location.operator_fr}</p>
                <p>Telefoon: ${location.contact_phone}</p>
            `;
            locationsContainer.appendChild(locationElement);

            // Add marker to the map
            const marker = L.circleMarker([location.geo_point_2d.lat, location.geo_point_2d.lon], {
                color: getColor(location.capacity),
                radius: 8,
                fillOpacity: 0.8
            }).addTo(map);

            marker.bindPopup(`
                <h3>${location.name_nl}</h3>
                <p>Adres: ${location.adres_}</p>
                <p>Aantal plaatsen: ${location.capacity}</p>
                <p>Operator: ${location.operator_fr}</p>
                <p>Telefoon: ${location.contact_phone}</p>
            `);
        });
    }

    // Filter locations by name
document.getElementById('filterButton').addEventListener('click', () => {
    const searchQuery = document.getElementById('search').value.toLowerCase();

    const filteredData = locationsData.filter(location => {
        return location.name_nl.toLowerCase().includes(searchQuery);
    });

    displayLocations(filteredData);
});

// Sort locations alphabetically
document.getElementById('alfabetisch').addEventListener('click', () => {
    const sortedData = [...locationsData].sort((a, b) => {
        return a.name_nl.localeCompare(b.name_nl);
    });

    displayLocations(sortedData);
});

// Variable pour suivre l'état du tri (true = décroissant, false = croissant)
let isCapacityDescending = true;

// Sort locations by capacity (toggle between descending and ascending)
document.getElementById('capaciteit').addEventListener('click', () => {
    const sortedData = [...locationsData].sort((a, b) => {
        return isCapacityDescending ? b.capacity - a.capacity : a.capacity - b.capacity;
    });

    // Inverse l'état du tri pour le prochain clic
    isCapacityDescending = !isCapacityDescending;

    displayLocations(sortedData);
});

    // Voeg interactiviteit toe voor het opslaan van favorieten
    const favoriteLocations = JSON.parse(localStorage.getItem('favoriteLocations')) || [];

    document.getElementById('locations').addEventListener('click', event => {
        const locationElement = event.target.closest('.location');
        if (locationElement) {
            const locationName = locationElement.querySelector('h3').innerText;
            if (!favoriteLocations.includes(locationName)) {
                favoriteLocations.push(locationName);
                localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
                updateFavoriteLocations();
            }
        }
    });

    function updateFavoriteLocations() {
        const favoriteLocationsContainer = document.getElementById('favorite-locations');
        const favoriteLocations = JSON.parse(localStorage.getItem('favoriteLocations')) || [];
        favoriteLocationsContainer.innerHTML = '';
        favoriteLocations.forEach(location => {
            const locationElement = document.createElement('div');
            locationElement.classList.add('favorite-location');
            locationElement.innerText = location;
            favoriteLocationsContainer.appendChild(locationElement);
        });
    }

    // Initialiseer favorieten bij het laden van de pagina
    if (window.location.pathname.includes('favorites.html')) {
        updateFavoriteLocations();
    }
});