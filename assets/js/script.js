
var apiKey = '4mo1Txzr1ivmB4uKFnqLsmMiKmOEhFul'; //map quest api key

L.mapquest.key = apiKey;

// 'map' refers to a <div> element with the ID map




var userCity = "Dallas";

var breweryUrl = 'https://api.openbrewerydb.org/v1/breweries?by_city=dallas';
// `https://api.openbrewerydb.org/v1/breweries/search?query=${userCity}`;
$(function() {
    
    
    var map = L.mapquest.map('map', {
    center: [37.7749, -122.4194],
    layers: L.mapquest.tileLayer('map'),
    zoom: 12
    });

    map.addControl(L.mapquest.control());
});

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




