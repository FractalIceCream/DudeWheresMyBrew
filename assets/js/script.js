var lightDark = $(".ldMode"); 
var toggle = $("#toggle");  
// chreate new variable for title. put it in the "if" statement colorname-text 

// toggle.on( "change", function() {
    //alert( "Handler for `change` called." );
    // if (toggle[0].checked===true) { 
            // lightDark.removeClass("blue").addClass("orange"); 
    // }
    // else {
        // lightDark.removeClass("orange").addClass("blue"); 
    // }
    // return; 
// } );



var apiKey = '4mo1Txzr1ivmB4uKFnqLsmMiKmOEhFul'; //map quest api key

L.mapquest.key = apiKey;

// 'map' refers to a <div> element with the ID map
// https://www.mapquestapi.com/geocoding/v1/address?key=KEY&location=Washington,DC


var userInput = $('#cityInput');
var map;
var savedCities = [];

var savedCitiesEl = $('#savedCities');


var userCity = "Dallas";

var breweryUrl = 'https://api.openbrewerydb.org/v1/breweries?by_city=dallas';
// `https://api.openbrewerydb.org/v1/breweries/search?query=${userCity}`;
$(function() {

    //if no saved cities in local storage provide empty object otherwise get from local
  if (localStorage.getItem('savedCities') !== null && localStorage.getItem('savedCities') !== '') {
    savedCities = JSON.parse(localStorage.getItem('savedCities'));
  } else {
    savedCities = [];
  }


    map = L.mapquest.map('map', {
    center: [37.7749, -122.4194],
    layers: L.mapquest.tileLayer('map'),
    zoom: 12
    });
    $(this).on('click', '.searchBtn', fetchUserCity);
    $(this).on('click', '.cityBtn', getCity);


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
            renderMap(latLng);
            addCityEl(userCity, userState);
            storeCity(userCity, userState, latLng);
            // console.log(data);
        });
}

function storeCity(city, state, latLng) {
    savedCities.push({city: city, state: state, latLng: latLng})
    localStorage.setItem('savedCities', JSON.stringify(savedCities))
}

function addCityEl(city, state) {
    savedCities.append($(`
    <div>
        <button type="button" class="cityBtn" data-city=${city} data-state=${state}>${city}, ${state}</button>
    </div>
    `));
}

function getCity(event) {
    var btnEvent = $(event.target);
    var city = btnEvent.attr('data-city');
    var state = btnEvent.attr('data-state');

    
}


fetch(breweryUrl)
    .then(function(response) {
    if (response.status !== 200) {
        throw response.json();
    }
    return response.json();
    })
    .then(function(data) {
        console.log(data)
});




