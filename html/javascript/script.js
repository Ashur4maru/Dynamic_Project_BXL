document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = L.map('map').setView([50.85045, 4.34878], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let locationsData = [];
    let markers = [];

    // Functie om de locatiebox te maken
    function createLocationBox() {
        const locationsContainer = document.getElementById('locations');
        locationsContainer.innerHTML = `
            <div class="locations-header">
                <h3>Parkeerlocaties</h3>
            </div>
            <div class="locations-list"></div>
        `;
    }

    // Functie om een enkele parkeerlocatie weer te geven
    function createLocationElement(location) {
        const element = document.createElement('div');
        element.classList.add('location-item');
        element.innerHTML = `
            <h4>${location.name_nl}</h4>
            <p class="adres">Adres: ${location.adres_}</p>
            <p class="capacity">Aantal plaatsen: ${location.capacity}</p>
            <p class="operator">Operator: ${location.operator_fr}</p>
            <p class="phone">Telefoon: ${location.contact_phone}</p>
            <p class="handicap">Handicap plaatsen: ${location.disabledcapacity}</p>
            <button class="favorite-button" data-location='${JSON.stringify(location)}'>
                ❤ Voeg toe aan favorieten
            </button>
        `;
        return element;
    }

    // Functie om alle locaties weer te geven
    function displayLocations(data) {
        const locationsList = document.querySelector('.locations-list');
        locationsList.innerHTML = '';
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        data.forEach(location => {
            const locationElement = createLocationElement(location);
            locationsList.appendChild(locationElement);

            const marker = L.circleMarker([location.geo_point_2d.lat, location.geo_point_2d.lon], {
                color: getColor(location.capacity),
                radius: 8,
                fillOpacity: 0.8
            }).addTo(map);

            marker.bindPopup(`
                <h3>${location.name_nl}</h3>
                <p>Adres: ${location.adres_}</p>
                <p>Aantal plaatsen: ${location.capacity}</p>
            `);

            markers.push(marker);
        });
    }

    // Functie om een favoriet toe te voegen aan de lijst
    function addToFavorites(location) {
        const favoritesList = document.getElementById('favorite-locations');
        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('favorite-item');
        favoriteItem.innerHTML = `
            <h4>${location.name_nl}</h4>
            <p class="adres">Adres: ${location.adres_}</p>
            <p class="capacity">Aantal plaatsen: ${location.capacity}</p>
            <p class="operator">Operator: ${location.operator_fr}</p>
            <p class="phone">Telefoon: ${location.contact_phone}</p>
            <p class="handicap">Handicap plaatsen: ${location.disabledcapacity}</p>
            <button class="remove-favorite" data-name="${location.name_nl}">
                🗑️ Verwijder uit favorieten
            </button>
        `;
        favoritesList.appendChild(favoriteItem);

        // Sla favorieten op in localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.push(location);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function getColor(capacity) {
        return capacity > 500 ? 'blue' :
               capacity > 100 ? 'green' :
                              'red';
    }

    // Initialiseer de locatiebox
    createLocationBox();

    // Laad opgeslagen favorieten
    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.forEach(location => addToFavorites(location));
    }

    // Event listeners voor filters
    document.getElementById('filterButton').addEventListener('click', () => {
        const searchQuery = document.getElementById('search').value.toLowerCase();
        const filteredData = locationsData.filter(location => 
            location.name_nl.toLowerCase().includes(searchQuery)
        );
        displayLocations(filteredData);
    });

    let isCapacityDescending = true;
    document.getElementById('capaciteit').addEventListener('click', () => {
        const sortedData = [...locationsData].sort((a, b) => {
            return isCapacityDescending ? b.capacity - a.capacity : a.capacity - b.capacity;
        });
        isCapacityDescending = !isCapacityDescending;
        displayLocations(sortedData);
    });

    document.getElementById('alfabetisch').addEventListener('click', () => {
        const sortedData = [...locationsData].sort((a, b) => 
            a.name_nl.localeCompare(b.name_nl)
        );
        displayLocations(sortedData);
    });

    // Event listener voor favorieten toevoegen
    document.querySelector('.locations-list').addEventListener('click', event => {
        if (event.target.classList.contains('favorite-button')) {
            const locationData = JSON.parse(event.target.dataset.location);
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            
            if (!favorites.some(fav => fav.name_nl === locationData.name_nl)) {
                addToFavorites(locationData);
                event.target.textContent = '✓ Toegevoegd aan favorieten';
                event.target.disabled = true;
            }
        }
    });

    // Event listener voor favorieten verwijderen
    document.getElementById('favorite-locations').addEventListener('click', event => {
        if (event.target.classList.contains('remove-favorite')) {
            const name = event.target.dataset.name;
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const updatedFavorites = favorites.filter(fav => fav.name_nl !== name);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            event.target.closest('.favorite-item').remove();

            // Enable de "Voeg toe aan favorieten" knop weer
            const addButton = document.querySelector(`.favorite-button[data-location*="${name}"]`);
            if (addButton) {
                addButton.textContent = '❤ Voeg toe aan favorieten';
                addButton.disabled = false;
            }
        }
    });

    // Haal de data op en toon deze
    fetch('https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parkings_publics/records?limit=20&offset=0')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            locationsData = data.results;
            displayLocations(locationsData);
            loadFavorites(); // Laad opgeslagen favorieten
        })
        .catch(error => console.error('Error:', error));
});