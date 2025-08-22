// Favorieten Pagina JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('Favorieten pagina geladen');
    
    // Functie om favorieten weer te geven
    function displayFavorites() {
        const favoritesList = document.getElementById('favorite-locations');
        if (!favoritesList) {
            console.error('Favorites container niet gevonden');
            return;
        }

        // Haal favorieten op uit localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        console.log('Geladen favorieten:', favorites.length);

        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="no-favorites">
                    <h3>Nog geen favorieten</h3>
                    <p>Je hebt nog geen favoriete parkeerlocaties toegevoegd.</p>
                    <p>Ga naar de <a href="index.html#explore">hoofdpagina</a> om parkeerlocaties te verkennen en toe te voegen aan je favorieten.</p>
                </div>
            `;
            return;
        }

        // Maak HTML voor elke favoriet
        const favoritesHTML = favorites.map((location, index) => {
            const name = location.name_nl || location.nom_fr || 'Naamloos parking';
            const address = location.adres_ || location.adresse || 'Adres niet beschikbaar';
            const capacity = location.capacity || 'Onbekend';
            const operator = location.operator_fr || location.operator_nl || 'Onbekend';
            const phone = location.contact_phone || 'Niet beschikbaar';
            
            // Verbeterde afhandeling van handicap plaatsen
            let disabled = 'Niet opgegeven';
            if (location.disabledcapacity !== undefined && location.disabledcapacity !== null && location.disabledcapacity !== '') {
                disabled = location.disabledcapacity;
            } else if (location.disabled_capacity !== undefined && location.disabled_capacity !== null && location.disabled_capacity !== '') {
                disabled = location.disabled_capacity;
            } else if (location.handicapped_capacity !== undefined && location.handicapped_capacity !== null && location.handicapped_capacity !== '') {
                disabled = location.handicapped_capacity;
            } else if (location.pmr_capacity !== undefined && location.pmr_capacity !== null && location.pmr_capacity !== '') {
                disabled = location.pmr_capacity;
            }
            
            // Zorg ervoor dat het een nummer is
            if (disabled !== 'Niet opgegeven' && !isNaN(disabled)) {
                disabled = parseInt(disabled) || 0;
            }

            return `
                <div class="favorite-item" data-index="${index}">
                    <div class="favorite-header">
                        <h3>${name}</h3>
                        <button class="remove-favorite" data-index="${index}" title="Verwijder uit favorieten">
                            🗑️
                        </button>
                    </div>
                    <div class="favorite-details">
                        <p class="address"><strong>📍</strong> ${address}</p>
                        <p class="capacity"><strong>🚗</strong> ${capacity} plaatsen</p>
                        <p class="operator"><strong>🏢</strong> ${operator}</p>
                        <p class="phone"><strong>📞</strong> ${phone}</p>
                        <p class="handicap"><strong>♿</strong> ${disabled} ${disabled === 'Niet opgegeven' ? '' : 'handicap plaatsen'}</p>
                    </div>
                    <div class="favorite-actions">
                        ${location.geo_point_2d ? `
                            <button class="show-directions" data-lat="${location.geo_point_2d.lat}" data-lon="${location.geo_point_2d.lon}">
                                🗺️ Toon routebeschrijving
                            </button>
                        ` : ''}
                        <button class="copy-address" data-address="${address}">
                            📋 Kopieer adres
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        favoritesList.innerHTML = `
            <div class="favorites-header">
                <h3>Je hebt ${favorites.length} favoriet${favorites.length === 1 ? '' : 'e'} parkeerlocatie${favorites.length === 1 ? '' : 's'}</h3>
                <div class="favorites-actions">
                    <button id="clear-all-favorites" class="clear-all-btn">
                        🗑️ Wis alle favorieten
                    </button>
                    <button id="export-favorites" class="export-btn">
                        📤 Exporteer favorieten
                    </button>
                </div>
            </div>
            <div class="favorites-grid">
                ${favoritesHTML}
            </div>
        `;
    }

    // Event listeners
    document.addEventListener('click', (event) => {
        // Verwijder favoriet
        if (event.target.classList.contains('remove-favorite')) {
            const index = parseInt(event.target.dataset.index);
            removeFavorite(index);
        }

        // Toon routebeschrijving
        if (event.target.classList.contains('show-directions')) {
            const lat = event.target.dataset.lat;
            const lon = event.target.dataset.lon;
            showDirections(lat, lon);
        }

        // Kopieer adres
        if (event.target.classList.contains('copy-address')) {
            const address = event.target.dataset.address;
            copyToClipboard(address);
        }

        // Wis alle favorieten
        if (event.target.id === 'clear-all-favorites') {
            clearAllFavorites();
        }

        // Exporteer favorieten
        if (event.target.id === 'export-favorites') {
            exportFavorites();
        }
    });

    // Functie om een favoriet te verwijderen
    function removeFavorite(index) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (index >= 0 && index < favorites.length) {
            const locationName = favorites[index].name_nl || favorites[index].nom_fr || 'Parkeerlocatie';
            
            if (confirm(`Weet je zeker dat je "${locationName}" wilt verwijderen uit je favorieten?`)) {
                favorites.splice(index, 1);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                displayFavorites(); // Herlaad de lijst
                
                // Toon bevestiging
                showNotification(`"${locationName}" is verwijderd uit je favorieten.`, 'success');
            }
        }
    }

    // Functie om alle favorieten te wissen
    function clearAllFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.length === 0) {
            showNotification('Je hebt geen favorieten om te wissen.', 'info');
            return;
        }

        if (confirm(`Weet je zeker dat je alle ${favorites.length} favorieten wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
            localStorage.removeItem('favorites');
            displayFavorites();
            showNotification('Alle favorieten zijn gewist.', 'success');
        }
    }

    // Functie om routebeschrijving te tonen
    function showDirections(lat, lon) {
        // Open Google Maps met routebeschrijving
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        window.open(url, '_blank');
    }

    // Functie om adres te kopiëren
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Adres gekopieerd naar klembord!', 'success');
        } catch (err) {
            // Fallback voor oudere browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Adres gekopieerd naar klembord!', 'success');
            } catch (err) {
                showNotification('Kon adres niet kopiëren.', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }

    // Functie om favorieten te exporteren
    function exportFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.length === 0) {
            showNotification('Je hebt geen favorieten om te exporteren.', 'info');
            return;
        }

        // Maak CSV bestand
        const headers = ['Naam', 'Adres', 'Capaciteit', 'Operator', 'Telefoon', 'Handicap Plaatsen'];
        const csvContent = [
            headers.join(','),
            ...favorites.map(location => {
                const name = (location.name_nl || location.nom_fr || 'Naamloos parking').replace(/,/g, ';');
                const address = (location.adres_ || location.adresse || 'Niet beschikbaar').replace(/,/g, ';');
                const capacity = location.capacity || 'Onbekend';
                const operator = (location.operator_fr || location.operator_nl || 'Onbekend').replace(/,/g, ';');
                const phone = location.contact_phone || 'Niet beschikbaar';
                const disabled = location.disabledcapacity || location.disabled_capacity || 'Niet opgegeven';
                
                return [name, address, capacity, operator, phone, disabled].join(',');
            })
        ].join('\n');

        // Download bestand
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'mijn-favoriete-parkings.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Favorieten geëxporteerd als CSV bestand!', 'success');
    }

    // Functie om notificaties te tonen
    function showNotification(message, type = 'info') {
        // Verwijder bestaande notificaties
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Voeg toe aan pagina
        document.body.appendChild(notification);

        // Auto verwijderen na 5 seconden
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Functie om favorieten te sorteren
    function sortFavorites(sortBy) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        let sorted;
        switch (sortBy) {
            case 'name':
                sorted = [...favorites].sort((a, b) => {
                    const nameA = a.name_nl || a.nom_fr || '';
                    const nameB = b.name_nl || b.nom_fr || '';
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'capacity':
                sorted = [...favorites].sort((a, b) => {
                    const capA = parseInt(a.capacity) || 0;
                    const capB = parseInt(b.capacity) || 0;
                    return capB - capA;
                });
                break;
            default:
                sorted = favorites;
        }
        
        localStorage.setItem('favorites', JSON.stringify(sorted));
        displayFavorites();
    }

    // Voeg sorteer functionaliteit toe
    function addSortButtons() {
        const header = document.querySelector('.favorites-header');
        if (header && !header.querySelector('.sort-buttons')) {
            const sortButtons = document.createElement('div');
            sortButtons.className = 'sort-buttons';
            sortButtons.innerHTML = `
                <span>Sorteer op:</span>
                <button onclick="window.sortFavorites('name')" class="sort-btn">📝 Naam</button>
                <button onclick="window.sortFavorites('capacity')" class="sort-btn">🚗 Capaciteit</button>
            `;
            header.appendChild(sortButtons);
        }
    }

    // Maak sorteer functie globaal beschikbaar
    window.sortFavorites = sortFavorites;

    // Initialiseer de pagina
    displayFavorites();
    
    // Voeg sort buttons toe na een korte delay
    setTimeout(addSortButtons, 100);

    console.log('Favorieten pagina setup compleet');
});