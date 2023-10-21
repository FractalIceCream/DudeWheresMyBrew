var apiKey = '4mo1Txzr1ivmB4uKFnqLsmMiKmOEhFul'; //map quest api key

L.mapquest.key = apiKey;
// 'map' refers to a <div> element with the ID map
// https://www.mapquestapi.com/geocoding/v1/address?key=KEY&location=Washington,DC

var userInput = $('#cityInput');
var map;
var savedCities = [];

var savedCitiesEl = $('#savedCities');
// var byDistUrl = 'https://api.openbrewerydb.org/v1/breweries?';  //by_dist=${},${}38.8977,77.0365&per_page=3`;
var breweryUrl = 'https://api.openbrewerydb.org/v1/breweries?';    //by_city=dallas';
// `https://api.openbrewerydb.org/v1/breweries/search?query=${userCity}`;

$(function () {

    //if no saved cities in local storage provide empty object otherwise get from local
    if (localStorage.getItem('brewCities') !== null && localStorage.getItem('brewCities') !== '') {
        savedCities = JSON.parse(localStorage.getItem('brewCities'));
    } else {
        savedCities = [];
    }

    //through localStorage each saved city search append city btn element
    for (var entry of savedCities) {
        addCityEl(entry.city, entry.state, entry.lat, entry.lng);

    }
    
    //initlalize map on page load
    L.mapquest.geocoding().geocode('Dallas, TX', createMap);

    //button listeners
    $(this).on('click', '.searchBtn', fetchUserCity);
    $(this).on('click', '.cityBtn', getCity);
    $(this).on('click', '.removeBtn', removeCityEl);
    $(this).on('click', '.getBrewBtn', getBreweries);
});


//create map data -required for geocode
function createMap(error, response) {
    var location = response.results[0].locations[0];
    var latLng = location.displayLatLng;
    map = L.mapquest.map('map', {
        center: latLng,
        layers: L.mapquest.tileLayer('map'),
        zoom: 10
    });
}
//render new Map with city, state arguments
function renderMap(city, state) {
    map.remove(); //handled first before instantiating new map
    L.mapquest.geocoding().geocode(`${city}, ${state}`, createMap);
}

//mapquest api fetch user input and render the map location, add btn, store city data
function fetchUserCity(event) {
    if (city === "" | city === null) { return; }
    var city = userInput.val();
    var url = `https://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&location=${city}`;
    fetch(url)
        .then(function (response) {
            if (response.status !== 200) {
                throw response.json();
            }
            return response.json();
        })
        .then(function (data) {
            var userCity = data.results[0].locations[0].adminArea5;
            var userState = data.results[0].locations[0].adminArea3;
            var latLng = data.results[0].locations[0].latLng;
            var userLat = latLng.lat;
            var userLng = latLng.lng;

            renderMap(userCity, userState);
            var checkHistory = savedCities.some(item => item.city === userCity);
            if (checkHistory) { return; }

            addCityEl(userCity, userState, userLat, userLng);
            storeCity(userCity, userState, userLat, userLng);
        });
}

//store city data(city, state, lat, lng) to local storage
function storeCity(city, state, lat, lng) {
    savedCities.push({ city: city, state: state, lat: lat, lng: lng })
    localStorage.setItem('brewCities', JSON.stringify(savedCities))
}

//append city btn, remove btn, and getBreweries btn
function addCityEl(city, state, lat, lng) {
    savedCitiesEl.children('ul').append($(`
    <li>
        <button type="button" 
                class="cityBtn" 
                data-city="${city}" 
                data-state="${state}"
                data-lat="${lat}"
                data-lng="${lng}">
                ${city}, ${state}
        </button>
        <button type="button"
                class="removeBtn">
                Remove
        </button>
        <button type="button"
                class="getBrewBtn">
                Get Breweries
        </button>
    </li>
    `));
}

//remove btn event to remove adjacent city btn from webpage and delete data from local storage
function removeCityEl(event) {
    event.stopPropagation();
    var btnEvent = $(event.target);
    var city = btnEvent.siblings('.cityBtn').attr('data-city');
    var result = savedCities.findIndex(item => item.city === city);
    savedCities.splice(result, 1);

    localStorage.setItem('brewCities', JSON.stringify(savedCities));
    btnEvent.parent().remove();
}

//retrieve data from city btn to render map
function getCity(event) {
    var btnEvent = $(event.target);
    var city = btnEvent.attr('data-city');
    var state = btnEvent.attr('data-state');
    var lat = btnEvent.attr('data-lat');
    var lng = btnEvent.attr('data-lng');

    var latLng = { lat: lat, lng: lng };
    // renderMap(latLng);
    renderMap(city, state);
}

//retrieve the 5 closest brewiers from locations using OpenBreweriesDB API
function getBreweries(event) {
    var btnEvent = $(event.target);
    var city = btnEvent.siblings('.cityBtn').attr('data-city');
    var state = btnEvent.siblings('.ctiyBtn').attr('data-state');
    var lat = btnEvent.siblings('.cityBtn').attr('data-lat');
    var lng = btnEvent.siblings('.cityBtn').attr('data-lng');

    var byDistUrl = `${breweryUrl}by_dist=${lat},${lng}&per_page=5`;
    fetch(byDistUrl)
        .then(function (response) {
            if (response.status !== 200) {
                throw response.json();
            }
            return response.json();
        })
        .then(function (data) {
            renderBreweries(data, city, state);
        });
}

//render map with breweries with markers with 1st one indicated by a different for the searched city
function renderBreweries(dataSet, city, state) {
    var breweries = [`${city}, ${state}`];
    for (var i = 0; i < dataSet.length; i++) {
        breweries.push({
            street: dataSet[i].address_1,
            city: dataSet[i].city,
            state: dataSet[i].state,
            postalCode: dataSet[i].postal_code,
            url: dataSet[i].website_url
        });
    }

    map.remove();
    L.mapquest.geocoding().geocode(breweries, createFGMap);

    function createFGMap(error, response) {
        // Initialize the Map
        map = L.mapquest.map('map', {
            layers: L.mapquest.tileLayer('map'),
            center: [0, 0],
            zoom: 12
        });

        // Generate the feature group containing markers from the geocoded locations
        var featureGroup = generateMarkersFeatureGroup(response);

        // Add markers to the map and zoom to the features
        featureGroup.addTo(map);
        map.fitBounds(featureGroup.getBounds());
    }
    
    function generateMarkersFeatureGroup(response) {
        var group = [];
        
        //each location append marker and popup
        for (var i = 0; i < response.results.length; i++) {
            var location = response.results[i].locations[0];
            var locationLatLng = location.latLng;
            var marker;
            
            // Create a marker for each location
            if (i === 0) {
            marker = L.marker(locationLatLng, { icon: L.mapquest.icons.circle({primaryColor: '#2AAA8A'}) })
                .bindPopup(location.adminArea5 + ', ' + location.adminArea3);
            } else {
            var customPopup = L.popup()
                .setLatLng(locationLatLng)
                .setContent(`
                <div> ${location.street} </div>
                <div> <a href=${breweries[i].url} target="_blank">${breweries[i].url}</a></div>
                `);
            marker = L.marker(locationLatLng, { icon: L.mapquest.icons.marker() })
                    .bindPopup(customPopup);
                // .bindPopup(location.street);
            }
            
            group.push(marker);
        }
        return L.featureGroup(group); //return Mapquest's featureGroup to be added
    }
}
