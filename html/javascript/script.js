document.addEventListener('DOMContentLoaded', () => {
    console.log('Script geladen');
    
    // Initialize the map
    const map = L.map('map').setView([50.85045, 4.34878], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let locationsData = [];
    let markers = [];

    // Test data voor als de API niet werkt
    const testData = [
        {
            name_nl: "Parking Albertina",
            adres_: "Albertinastraat 1, 1000 Brussel",
            capacity: 350,
            operator_fr: "City Parking",
            contact_phone: "+32 2 123 4567",
            disabledcapacity: 15,
            geo_point_2d: { lat: 50.8466, lon: 4.3528 }
        },
        {
            name_nl: "Parking Anneessens", 
            adres_: "Anneessensplein 1, 1000 Brussel",
            capacity: 180,
            operator_fr: "Interparking",
            contact_phone: "+32 2 234 5678",
            disabledcapacity: 8,
            geo_point_2d: { lat: 50.8445, lon: 4.3488 }
        },
        {
            name_nl: "Parking Grote Markt",
            adres_: "Grote Markt 1, 1000 Brussel", 
            capacity: 120,
            operator_fr: "Q-Park",
            contact_phone: "+32 2 345 6789",
            disabledcapacity: 6,
            geo_point_2d: { lat: 50.8467, lon: 4.3525 }
        },
        {
            name_nl: "Parking Centraal Station",
            adres_: "Carrefour de l'Europe 2, 1000 Brussel",
            capacity: 850,
            operator_fr: "Europlaza",
            contact_phone: "+32 2 456 7890", 
            disabledcapacity: 40,
            geo_point_2d: { lat: 50.8458, lon: 4.3571 }
        },
        {
            name_nl: "Parking Sablon",
            adres_: "Place du Grand Sablon 1, 1000 Brussel",
            capacity: 95,
            operator_fr: "Indigo",
            contact_phone: "+32 2 567 8901",
            disabledcapacity: 4,
            geo_point_2d: { lat: 50.8422, lon: 4.3574 }
        }
    ];

    // Functie om de locatiebox te maken
    function createLocationBox() {
        const locationsContainer = document.getElementById('locations');
        if (!locationsContainer) {
            console.error('Locations container niet gevonden');
            return;
        }
        
        locationsContainer.innerHTML = `
            <div class="locations-header">
                <h3>Parkeerlocaties</h3>
                <div class="loading-indicator" style="display: none;">
                    <p>Data wordt geladen...</p>
                </div>
            </div>
            <div class="locations-list"></div>
        `;
    }

    // Verbeterde functie om een enkele parkeerlocatie weer te geven
    function createLocationElement(location) {
        const element = document.createElement('div');
        element.classList.add('location-item');
        
        // Veilige fallbacks voor ontbrekende data
        const name = location.name_nl || location.nom_fr || 'Naamloos parking';
        const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
        const capacity = location.capacity || 'Onbekend';
        const operator = location.operator_fr || location.operator_nl || 'Onbekend';
        const phone = location.contact_phone || 'Niet beschikbaar';
        const disabled = location.disabledcapacity || location.disabled_capacity || '0';
        
        element.innerHTML = `
            <h4>${name}</h4>
            <p class="adres"><strong>📍</strong> ${address}</p>
            <p class="capacity"><strong>🚗</strong> ${capacity} plaatsen</p>
            <p class="operator"><strong>🏢</strong> ${operator}</p>
            <p class="phone"><strong>📞</strong> ${phone}</p>
            <p class="handicap"><strong>♿</strong> ${disabled} handicap plaatsen</p>
            <button class="favorite-button" data-location='${JSON.stringify(location).replace(/'/g, "&apos;")}'>
                ❤ Voeg toe aan favorieten
            </button>
        `;
        return element;
    }

    // Functie om alle locaties weer te geven
    function displayLocations(data) {
        console.log('Displaying locations:', data.length);
        
        const locationsList = document.querySelector('.locations-list');
        if (!locationsList) {
            console.error('Locations list niet gevonden');
            return;
        }

        // Clear existing content
        locationsList.innerHTML = '';
        clearMarkers();

        if (data.length === 0) {
            locationsList.innerHTML = '<p class="no-results">Geen parkeerlocaties gevonden.</p>';
            return;
        }

        data.forEach((location, index) => {
            try {
                const locationElement = createLocationElement(location);
                locationsList.appendChild(locationElement);

                // Voeg marker toe aan kaart
                if (location.geo_point_2d && location.geo_point_2d.lat && location.geo_point_2d.lon) {
                    createMarker(location, index);
                }
            } catch (error) {
                console.error('Fout bij het maken van locatie element:', error, location);
            }
        });

        // Update counter in header
        const header = document.querySelector('.locations-header h3');
        if (header) {
            header.textContent = `Parkeerlocaties (${data.length})`;
        }
    }

    // Functie om marker te maken
    function createMarker(location, index) {
        try {
            const marker = L.circleMarker(
                [location.geo_point_2d.lat, location.geo_point_2d.lon], 
                {
                    color: getColor(location.capacity),
                    radius: 8,
                    fillOpacity: 0.8,
                    weight: 2
                }
            ).addTo(map);

            const name = location.name_nl || location.nom_fr || 'Naamloos parking';
            const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
            const capacity = location.capacity || 'Onbekend';

            marker.bindPopup(`
                <div class="popup-content">
                    <h3>${name}</h3>
                    <p><strong>Adres:</strong> ${address}</p>
                    <p><strong>Capaciteit:</strong> ${capacity} plaatsen</p>
                </div>
            `);

            markers.push(marker);
        } catch (error) {
            console.error('Fout bij het maken van marker:', error, location);
        }
    }

    // Clear alle markers
    function clearMarkers() {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }

    // Kleur bepalen op basis van capaciteit
    function getColor(capacity) {
        if (!capacity || capacity === 'Onbekend') return 'gray';
        const cap = parseInt(capacity);
        return cap > 500 ? 'blue' : cap > 100 ? 'green' : 'red';
    }

    // Functie om een favoriet toe te voegen aan de lijst
    function addToFavorites(location) {
        const favoritesList = document.getElementById('favorite-locations');
        if (!favoritesList) {
            console.error('Favorites list niet gevonden');
            return;
        }

        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('favorite-item');
        
        const name = location.name_nl || location.nom_fr || 'Naamloos parking';
        const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
        const capacity = location.capacity || 'Onbekend';
        const operator = location.operator_fr || location.operator_nl || 'Onbekend';
        const phone = location.contact_phone || 'Niet beschikbaar';
        const disabled = location.disabledcapacity || location.disabled_capacity || '0';
        
        favoriteItem.innerHTML = `
            <h4>${name}</h4>
            <p class="adres"><strong>📍</strong> ${address}</p>
            <p class="capacity"><strong>🚗</strong> ${capacity} plaatsen</p>
            <p class="operator"><strong>🏢</strong> ${operator}</p>
            <p class="phone"><strong>📞</strong> ${phone}</p>
            <p class="handicap"><strong>♿</strong> ${disabled} handicap plaatsen</p>
            <button class="remove-favorite" data-name="${name}">
                🗑️ Verwijder uit favorieten
            </button>
        `;
        favoritesList.appendChild(favoriteItem);

        // Sla favorieten op in localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.push(location);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Laad opgeslagen favorieten
    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const favoritesList = document.getElementById('favorite-locations');
        
        if (!favoritesList) return;
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">Nog geen favoriete parkeerlocaties toegevoegd.</p>';
            return;
        }
        
        favorites.forEach(location => addToFavorites(location));
    }

    // Initialiseer de locatiebox
    createLocationBox();

    // Event listeners voor filters
    document.getElementById('filterButton')?.addEventListener('click', () => {
        const searchQuery = document.getElementById('search')?.value.toLowerCase() || '';
        const filteredData = locationsData.filter(location => {
            const name = (location.name_nl || location.nom_fr || '').toLowerCase();
            const address = (location.adres_ || location.adresse || '').toLowerCase();
            return name.includes(searchQuery) || address.includes(searchQuery);
        });
        displayLocations(filteredData);
    });

    // Zoeken bij Enter key
    document.getElementById('search')?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('filterButton')?.click();
        }
    });

    let isCapacityDescending = true;
    document.getElementById('capaciteit')?.addEventListener('click', () => {
        const sortedData = [...locationsData].sort((a, b) => {
            const capacityA = parseInt(a.capacity) || 0;
            const capacityB = parseInt(b.capacity) || 0;
            return isCapacityDescending ? capacityB - capacityA : capacityA - capacityB;
        });
        isCapacityDescending = !isCapacityDescending;
        displayLocations(sortedData);
    });

    document.getElementById('alfabetisch')?.addEventListener('click', () => {
        const sortedData = [...locationsData].sort((a, b) => {
            const nameA = a.name_nl || a.nom_fr || '';
            const nameB = b.name_nl || b.nom_fr || '';
            return nameA.localeCompare(nameB);
        });
        displayLocations(sortedData);
    });

    // Event delegation voor dynamische elementen
    document.addEventListener('click', (event) => {
        // Favorite button click
        if (event.target.classList.contains('favorite-button')) {
            try {
                const locationData = JSON.parse(event.target.dataset.location.replace(/&apos;/g, "'"));
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const name = locationData.name_nl || locationData.nom_fr || 'Naamloos parking';
                
                if (!favorites.some(fav => (fav.name_nl || fav.nom_fr) === name)) {
                    addToFavorites(locationData);
                    event.target.textContent = '✓ Toegevoegd aan favorieten';
                    event.target.disabled = true;
                    event.target.style.backgroundColor = '#28a745';
                }
            } catch (error) {
                console.error('Fout bij toevoegen favoriet:', error);
            }
        }

        // Remove favorite button click
        if (event.target.classList.contains('remove-favorite')) {
            const name = event.target.dataset.name;
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const updatedFavorites = favorites.filter(fav => 
                (fav.name_nl || fav.nom_fr) !== name
            );
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            event.target.closest('.favorite-item').remove();

            // Update the count if no favorites left
            const favoritesList = document.getElementById('favorite-locations');
            if (favoritesList && favoritesList.children.length === 0) {
                favoritesList.innerHTML = '<p class="no-favorites">Nog geen favoriete parkeerlocaties toegevoegd.</p>';
            }

            // Re-enable the "Voeg toe aan favorieten" button if it exists
            const addButtons = document.querySelectorAll('.favorite-button');
            addButtons.forEach(button => {
                try {
                    const locationData = JSON.parse(button.dataset.location.replace(/&apos;/g, "'"));
                    const buttonName = locationData.name_nl || locationData.nom_fr;
                    if (buttonName === name) {
                        button.textContent = '❤ Voeg toe aan favorieten';
                        button.disabled = false;
                        button.style.backgroundColor = '';
                    }
                } catch (error) {
                    console.error('Fout bij updaten favorite button:', error);
                }
            });
        }
    });

    // Functie om data te laden
    async function loadData() {
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // Probeer eerst de echte API
        const apiUrls = [
            'https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parkings_publics/records?limit=50&offset=0',
            'https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parkings_publics/records?limit=50&offset=0',
            'https://opendata.bruxelles.be/api/explore/v2.1/catalog/datasets/parkings/records?limit=50&offset=0'
        ];

        let dataLoaded = false;

        for (const url of apiUrls) {
            try {
                console.log(`Proberen API URL: ${url}`);
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        console.log(`Succesvol data geladen van: ${url}`, data.results.length, 'items');
                        locationsData = data.results;
                        displayLocations(locationsData);
                        dataLoaded = true;
                        break;
                    }
                }
            } catch (error) {
                console.warn(`API URL ${url} werkt niet:`, error);
                continue;
            }
        }

        // Als geen API werkt, gebruik test data
        if (!dataLoaded) {
            console.log('API niet beschikbaar, gebruik test data');
            locationsData = testData;
            displayLocations(locationsData);
            
            // Toon melding aan gebruiker
            const locationsList = document.querySelector('.locations-list');
            if (locationsList) {
                const notice = document.createElement('div');
                notice.className = 'api-notice';
                notice.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-bottom: 15px; border-radius: 5px; color: #856404;';
                notice.innerHTML = '<strong>Opmerking:</strong> API tijdelijk niet beschikbaar. Toont demo data.';
                locationsList.insertBefore(notice, locationsList.firstChild);
            }
        }

        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // Laad favorieten na het laden van data
        loadFavorites();
    }

    // Start het laden van data
    loadData();

    console.log('Script setup compleet');
});