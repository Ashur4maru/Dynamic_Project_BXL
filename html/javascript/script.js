document.addEventListener('DOMContentLoaded', () => {
    // Controleer of we op de favorietenpagina zijn
    const isFavoritesPage = window.location.pathname.includes('favorites.html');

    if (isFavoritesPage) {
        // Laad favorieten en toon ze op de favorietenpagina
        updateFavoriteLocations();
    } else {
        // Initialize the map
        const map = L.map('map').setView([50.85045, 4.34878], 13); // Centered on Brussels

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        let locationsData = [];

        // Fetch data van de opendata.brussels API en toon locaties
        fetch('https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parkings_publics/records?limit=30')
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
                const marker = L.marker([location.geo_point_2d.lat, location.geo_point_2d.lon]).addTo(map);
                marker.bindPopup(`
                    <h3>${location.name_nl}</h3>
                    <p>Adres: ${location.adres_}</p>
                    <p>Aantal plaatsen: ${location.capacity}</p>
                    <p>Operator: ${location.operator_fr}</p>
                    <p>Telefoon: ${location.contact_phone}</p>
                `);
            });
        }

        // Filter locations by name and capacity
        document.getElementById('filterButton').addEventListener('click', () => {
            const searchQuery = document.getElementById('search').value.toLowerCase();
            const capacityFilter = document.getElementById('capacityFilter').value;

            const filteredData = locationsData.filter(location => {
                const matchesName = location.name_nl.toLowerCase().includes(searchQuery);
                const matchesCapacity = capacityFilter ? location.capacity >= capacityFilter : true;
                return matchesName && matchesCapacity;
            });

            displayLocations(filteredData);
        });

        // Voeg interactiviteit toe voor het opslaan van favorieten
        document.getElementById('locations').addEventListener('click', event => {
            const locationElement = event.target.closest('.location');
            if (locationElement) {
                const locationName = locationElement.querySelector('h3').innerText;
                addFavorite(locationName);
            }
        });
    }

    function addFavorite(locationName) {
        const favoriteLocations = JSON.parse(localStorage.getItem('favoriteLocations')) || [];
        if (!favoriteLocations.includes(locationName)) {
            favoriteLocations.push(locationName);
            localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
            updateFavoriteLocations();
        }
    }

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
    if (isFavoritesPage) {
        updateFavoriteLocations();
    }
});