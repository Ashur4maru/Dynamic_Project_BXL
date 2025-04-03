Dynamic Project Brussel Explorer

Het doel van deze project is een website te maken die alle parkingen groepeert van 1000 brussel. Met behulp van de data van Brussel: https://opendata.brussels.be/pages/home/ .
Deze project wordt vooral gemaakt met de volgende talen: HTML, CSS en Javascript>

Deze site zal van 2 webpagina's bestaan: Homepage en Favorieten.

Het project word behandeld door Dalil Belahcen en Rakim Benkirane van het hogeschool EHB
# Brussels Explorer
## Projectbeschrijving en functionaliteiten

- **Interactieve Kaart**: Het project maakt gebruik van Leaflet.js om een interactieve kaart te tonen die gecentreerd is op Brussel.
- **Parkeerlocaties Weergeven**: Parkeerlocaties worden opgehaald van de opendata.brussels API en weergegeven als markers op de kaart.
- **Filteren en Sorteren**: Gebruikers kunnen parkeerlocaties filteren op naam en sorteren op alfabetische volgorde of capaciteit.
- **Favorieten Opslaan**: Gebruikers kunnen favoriete parkeerlocaties
- **Responsief Ontwerp**: De applicatie past zich aan verschillende schermformaten aan, inclusief mobiele telefoons.

## Gebruikte API's

### OpenStreetMap API
- **Link**: [OpenStreetMap](https://www.openstreetmap.org/copyright)
- **Gebruik**: Gebruikt voor het weergeven van de kaarttegels in de applicatie.

### opendata.brussels API
- **Link**: [opendata.brussels](https://bruxellesdata.opendatasoft.com/)
- **Gebruik**: Gebruikt voor het ophalen van parkeerlocatiegegevens in Brussel.

## Implementatie van Technische Vereisten

### Initialisatie van de Kaart
- **Bestand**: `scripts.js`
- **Regelnummer**: 3-9
```javascript
const map = L.map('map').setView([50.85045, 4.34878], 13); // Gecentreerd op Brussel
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
```

### Weergave van Parkeerlocaties
- **Bestand**: `scripts.js`
- **Regelnummer**: 26-33
```javascript
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
```

### Filtering en Sorteren van Locaties
- **Bestand**: `scripts.js`
- **Regelnummer**: 70-78
```javascript
document.getElementById('filterButton').addEventListener('click', () => {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const filteredData = locationsData.filter(location => {
        return location.name_nl.toLowerCase().includes(searchQuery);
    });
    displayLocations(filteredData);
});

document.getElementById('alfabetisch').addEventListener('click', () => {
    const sortedData = [...locationsData].sort((a, b) => {
        return a.name_nl.localeCompare(b.name_nl);
    });
    displayLocations(sortedData);
});
```

### Opslaan van Favorieten
- **Bestand**: `scripts.js`
- **Regelnummer**: 101-109
```javascript
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
```

### Responsief Ontwerp
- **Bestand**: `styles.css`
- **Regelnummer**: 169-187
```css
/* Stijlen voor telefoonschermen */
@media (max-width: 600px) {
    body {
        font-size: 14px; /* Verkleint de tekstgrootte voor telefoons */
    }

    header {
        padding: 10px; /* Vermindert de interne opvulling */
    }

    header .navbar-brand {
        font-size: 18px; /* Verkleint de tekstgrootte van het merk */
    }

    header .nav-link {
        font-size: 14px; /* Verkleint de tekstgrootte van de links */
    }

    main {
        padding: 10px; /* Vermindert de interne opvulling */
    }

    .section h2 {
        font-size: 24px; /* Verkleint de tekstgrootte van de titels */
    }

    .filter input {
        width: 100%; /* Laat de inputvelden de volledige breedte innemen */
    }

    .filter {
        flex-direction: column; /* Zet de filtervelden onder elkaar */
        align-items: flex-start; /* Lijnt de filtervelden links uit */
    }

    #map {
        height: 300px; /* Verkleint de hoogte van de kaart */
    }

    #locations {
        max-height: 300px; /* Beperkt de hoogte van de lijst met parkings */
    }

    .parking-grid {
        grid-template-columns: 1fr; /* Toont de parkeerelementen in één kolom */
    }
}
```

## Installatiehandleiding

Volg de onderstaande stappen om de applicatie lokaal te installeren en uit te voeren:

1. **Repository Kloon**:
   ```
   git clone https://github.com/IgRiZ1/brussels-explorer.git
   cd brussels-explorer
   ```

2. **Afhankelijkheden Installeren**:
   Zorg ervoor dat je Node.js en npm geïnstalleerd hebt. Installeer vervolgens de benodigde npm-pakketten door het volgende commando uit te voeren:
   ```
   npm install
   ```

3. **Start de Applicatie**:
   Start de applicatie in ontwikkelmodus met behulp van het volgende commando:
   ```
   npm start
   ```

4. **Open in de Browser**:
   Open je browser en ga naar `http://localhost:3000` om de applicatie te bekijken.

5. **API Sleutel Configuratie**:
   Zorg ervoor dat je een geldige API-sleutel hebt voor de opendata.brussels API en stel deze in volgens de instructies in de documentatie.

## Bijdragen

Bijdragen aan dit project zijn welkom! Volg alstublieft de standaard GitHub workflow voor pull requests en issues.
