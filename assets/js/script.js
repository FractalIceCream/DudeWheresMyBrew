var apiKey = '4mo1Txzr1ivmB4uKFnqLsmMiKmOEhFul'; //map quest api key

L.mapquest.key = apiKey;

// 'map' refers to a <div> element with the ID map
// https://www.mapquestapi.com/geocoding/v1/address?key=KEY&location=Washington,DC


var userInput = $('#cityInput');
var map;
var savedCities = [];

var savedCitiesEl = $('#savedCities');


// var userCity = "Dallas";

var breweryUrl = 'https://api.openbrewerydb.org/v1/breweries?';    //by_city=dallas';
// `https://api.openbrewerydb.org/v1/breweries/search?query=${userCity}`;
$(function() {

    //if no saved cities in local storage provide empty object otherwise get from local
  if (localStorage.getItem('brewCities') !== null && localStorage.getItem('brewCities') !== '') {
    savedCities = JSON.parse(localStorage.getItem('brewCities'));
  } else {
    savedCities = [];
  }

  for(var entry of savedCities) {
    addCityEl(entry.city, entry.state, entry.lat, entry.lng);

  }

    map = L.mapquest.map('map', {
    center: [32.77822, -96.79512],
    layers: L.mapquest.tileLayer('map'),
    zoom: 12
    });
    $(this).on('click', '.searchBtn', fetchUserCity);
    $(this).on('click', '.cityBtn', getCity);
    $(this).on('click', '.removeBtn', removeCityEl);


});

function renderMap(latLng) {
    map.remove();
    map = L.mapquest.map('map', {
        center: latLng,
        layers: L.mapquest.tileLayer('map'),
        zoom: 12
        });
}

function fetchUserCity(event) {
    if (city === "" | city === null) {return;}

    
    var city = userInput.val();
    var url = `https://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&location=${city}`;
    fetch(url)
        .then(function(response) {
            if (response.status !== 200) {
                throw response.json();
            }
            return response.json();
        })
        .then(function(data){
            var userCity = data.results[0].locations[0].adminArea5;
            var userState = data.results[0].locations[0].adminArea3;
            var latLng = data.results[0].locations[0].latLng;
            var userLat = latLng.lat;
            var userLng = latLng.lng;
            
            renderMap(latLng);
            var checkHistory = savedCities.some(item => item.city === userCity);
            if (checkHistory) {return;}
            
            addCityEl(userCity, userState, userLat, userLng);
            storeCity(userCity, userState, userLat, userLng);
        });
}

function storeCity(city, state, lat, lng) {
    savedCities.push({city: city, state: state, lat: lat, lng: lng})
    localStorage.setItem('brewCities', JSON.stringify(savedCities))
}

function addCityEl(city, state, lat, lng) {
    savedCitiesEl.children('ul').append($(`
    <li>
        <button type="button" 
                class="cityBtn" 
                data-city=${city} 
                data-state=${state} 
                data-lat=${lat}
                data-lng=${lng}>
                ${city}, ${state}
        </button>
        <button type="button"
                class="removeBtn">
                Remove
        </button>
    </li>
    `));
}

function removeCityEl(event) {
    event.stopPropagation();
    var btnEvent = $(event.target);
    var city = btnEvent.siblings('.citeBtn').attr('data-city');
    var result = savedCities.findIndex(item => item.city === city);
    savedCities.splice(result, 1);

    localStorage.setItem('brewCities', JSON.stringify(savedCities));
    btnEvent.parent().remove();
}

function getCity(event) {
    var btnEvent = $(event.target);
    // var city = btnEvent.attr('data-city');
    // var state = btnEvent.attr('data-state');
    var lat = btnEvent.attr('data-lat');
    var lng = btnEvent.attr('data-lng');

    var latLng = {lat: lat, lng: lng};
    renderMap(latLng);
}
// function getBreweries

fetch(breweryUrl)
    .then(function(response) {
    if (response.status !== 200) {
        throw response.json();
    }
    return response.json();
    })
    .then(function(data) {
        // console.log(data)
});




