var apiKey = '4mo1Txzr1ivmB4uKFnqLsmMiKmOEhFul'; //map quest api key

L.mapquest.key = apiKey;

var userInput = $('#cityInput');
var map;
var savedCities = [];
var lightDark = $(".ldMode");
var shadow = $('.shMode');
var toggle = $("#toggle");
var leaflet = $('.leaflet-popup-content-wrapper');

var savedCitiesEl = $('#savedCities');
var breweryUrl = 'https://api.openbrewerydb.org/v1/breweries?';  
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

    // Add event listener for Enter key press
    userInput.keypress(function (event) {
        if (event.which === 13) { // 13 is the key code for Enter
            fetchUserCity();
        }
    });

    //button listeners
    $(document).ready(function () {
        $('.collapsible').collapsible();
    });
    $(this).on('click', '.searchBtn', fetchUserCity);
    $(this).on('click', '.cityBtn', getCity);
    $(this).on('click', '.removeBtn', removeCityEl);
    $(this).on('click', '.getBrewBtn', getBreweries);
    $(this).on('click', '.leaflet-marker-icon', lightDarkMode);
    $(this).on('change', '#toggle', lightDarkMode);

});

//changes various div elements from light colors to dark colors
function lightDarkMode() {
    lightDark = $('.ldMode');
    shadow = $('.shMode');
    leaflet = $('.leaflet-popup-content-wrapper');
    if (toggle[0].checked === true) {
        lightDark.removeClass("orange").addClass("blue-grey");
        lightDark.removeClass("lighten-2").addClass("darken-4");
        shadow.removeClass('text-shadow-burnt-orange');
        shadow.addClass('text-shadow-turquoise');
        leaflet.removeClass('orange').removeClass('lighten-2');
        leaflet.addClass('blue-grey').addClass('darken-4').addClass('teal-text');
        $('#map').attr('style', 'position: relative; border-color: turquoise;');
    }
    else {
        lightDark.removeClass("blue-grey").addClass("orange");
        lightDark.removeClass("darken-4").addClass("lighten-2");
        shadow.removeClass('text-shadow-turquoise');
        shadow.addClass('text-shadow-burnt-orange');
        leaflet.removeClass('blue-grey').removeClass('darken-4').removeClass('teal-text');
        leaflet.addClass('orange').addClass('lighten-2');
        $('#map').attr('style', 'position: relative; border-color: var(--orange-lighten-2);');
    }
    return;
}
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

            //accept valid cities ex:city name or postal code
            if (userCity === "" | userCity === null) { return; }

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
        <div class="collapsible-header ldMode cityBtn orange lighten-2 teal-text text-accent-2 shMode text-shadow-burnt-orange"
                data-city="${city}"
                data-state="${state}"
                data-lat="${lat}"
                data-lng="${lng}">
            <i class="material-icons left">place</i>
            ${city}, ${state}
            <i class="material-icons right removeBtn">delete_forever</i>    
        </div>
        <div class="collapsible-body collection left-align" style="margin:-24px;">
            <a class="collection-item ldMode getBrewBtn z-depth-3 orange lighten-2 green-text shMode text-shadow-burnt-orange" data-count="5">
                <i class="material-icons left">add_location</i>Show 5 Breweries</a>
        </div>
    </li>
    `));
    lightDarkMode();
}



//remove btn event to remove adjacent city btn from webpage and delete data from local storage
function removeCityEl(event) {
    event.stopPropagation();
    var btnEvent = $(event.target);
    var city = btnEvent.parents('.cityBtn').attr('data-city');
    var result = savedCities.findIndex(item => item.city === city);
    savedCities.splice(result, 1);

    localStorage.setItem('brewCities', JSON.stringify(savedCities));
    btnEvent.parent().parent().remove();
}

//retrieve data from city btn to render map
function getCity(event) {
    var btnEvent = $(event.target);
    var city = btnEvent.attr('data-city');
    var state = btnEvent.attr('data-state');

    // renderMap(latLng);
    renderMap(city, state);
}

//retrieve the 5 closest brewiers from locations using OpenBreweriesDB API
function getBreweries(event) {
    var btnEvent = $(event.target);
    var city = btnEvent.parent().siblings('.cityBtn').attr('data-city');
    var state = btnEvent.parent().siblings('.cityBtn').attr('data-state');
    var lat = btnEvent.parent().siblings('.cityBtn').attr('data-lat');
    var lng = btnEvent.parent().siblings('.cityBtn').attr('data-lng');
    var count = parseInt(btnEvent.attr('data-count'));

    var byDistUrl = `${breweryUrl}by_dist=${lat},${lng}&per_page=${count}`;
    fetch(byDistUrl)
        .then(function (response) {
            if (response.status !== 200) {
                throw response.json();
            }
            return response.json();
        })
        .then(function (data) {
            if (count === 20) {
                count = 5;
            } else {
                count += 5;
            }
            btnEvent.attr('data-count', count);
            btnEvent.html(`<i class="material-icons left">add_location</i>Show ${count} breweries`);
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
            url: dataSet[i].website_url,
            brewName: dataSet[i].name
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

            // Create a marker for each location //#2AAA8A //#263238 - grey dark #4caf50 - green
            if (i === 0) {
                marker = L.marker(locationLatLng, { icon: L.mapquest.icons.circle({ primaryColor: '#263238' }) })
                    .bindPopup(location.adminArea5 + ', ' + location.adminArea3);
            } else {

                var content = `
                <div> ${breweries[i].brewName} </div>
                <div> ${location.street} </div>`;
                if (breweries[i].url !== null) {
                    content += `<div><a href="${breweries[i].url}" target="_blank">${breweries[i].url}</a></div>`;
                }

                var customPopup = L.popup()
                    .setLatLng(locationLatLng)
                    .setContent(content);

                marker = L.marker(locationLatLng, { icon: L.mapquest.icons.marker({ primaryColor: '#4caf50' }) })
                    .bindPopup(customPopup);
            }
            group.push(marker);
        }
        return L.featureGroup(group); //return Mapquest's featureGroup to be added
    }

}
