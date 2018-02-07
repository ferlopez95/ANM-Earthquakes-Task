/*
  Author:Fernando Lopez

  Website: http://anmearthquaketask.000webhostapp.com/index.html

  1. Takes input: country name
  2. Calls GeoNames recent earthquake WebService
  3. Plots results on a Google Map.
  Each marker displays details of the earthquake when is cliked over marker.

  Bonus:
  Lists top 10 largest earthquakes in the world.
  Original requirement: display earthquakes from last 12 months.
  I have the top 10 earthquakes listed on the page, however there is no parameter
  on GeoNames webservices allows for retrieving results limited to the last year.
  I am getting the maximum allowed rows to be returned (500 earthquakes), and even with
  the optional date parameter was unable to get the service to return results from specifically
  the past year.
*/

//Setting up variables
var markers = [];
var largestTen = [];
var tempQuakesArray = [];
var yyyy;
var mm;
var dd;

//Defining the map
var map = new google.maps.Map(document.getElementById("map-canvas"),{
  center:{
    lat: 25.671,
    lng: -100.309
  },
  zoom:5
});

//Obtain the country entered in the search box
var searchBox = new google.maps.places.SearchBox(document.getElementById('mapsearch'));

google.maps.event.addListener(searchBox, 'places_changed', function(){

  //Function to delete markers
  deleteMarkers();
  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }
  function clearMarkers() {
    setMapOnAll(null);
  }
  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }

  var places = searchBox.getPlaces();
  var result;
  geocode();

  //Function to obtain the coordinates of the location
  function geocode(){
    var location = $('#mapsearch').val();
    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: location,
        key: 'AIzaSyDwYR5LcUod_6DIzOScnqarpbP_wLCq3A8'
      }
    })
    .then(function(response){
      result = response.data.results[0].geometry.viewport;
      earthquakes(result);
    })
    .catch(function(error){
      console.log(error);
    });
  }

  //Function to obtain the list of earthquakes
  function earthquakes(coordinates){
    axios.get('http://api.geonames.org/earthquakesJSON',{
      params: {
        north: coordinates.northeast.lat,
        south: coordinates.southwest.lat,
        east: coordinates.northeast.lng,
        west: coordinates.southwest.lng,
        username: 'ferlopez95'
      }
    })
    .then(function(response){
      for(var i = 0; i < response.data.earthquakes.length; i++){
        addMarker(response.data.earthquakes[i]);
      }
    })
    .catch(function(error){
      console.log(error);
    });
  }

  //Function that adds the markers
  function addMarker(props){
    var marker = new google.maps.Marker({
      position: {lat: props.lat, lng: props.lng},
      map: map
    });

    //Add the information to the marker
    var infoWindow = new google.maps.InfoWindow({
      content: '<h5>Magnitud: ' + props.magnitude + '</h5><h6>Fecha: ' + props.datetime.substring(0,10) + '</h6>'
    });

    //Show the information of the marker when clicked
    marker.addListener('click',function(){
      infoWindow.open(map,marker);
    });

    markers.push(marker);
  }

  var bounds = new google.maps.LatLngBounds();
  var place;

  //Moves the bound of the map
  for(var j=0; place = places[j]; j++){
    bounds.extend(place.geometry.location);
  }

  map.fitBounds(bounds);
  map.setZoom(4);
});

//Get the 500 largest earthquakes on earth
function tenLargestQuakes(){

  var largest;
  var north = 90;
  var east = 180;
  var west = -180;
  var south = -90;
  var maxRows = 500;

  var today = new Date();
  dd = today.getDate();
  mm = today.getMonth()+1;
  yyyy = today.getFullYear();
  today = yyyy+'-'+mm+'-'+dd;
  var minMagnitude = 1;

  console.log("GETTING DATA!");
  $.getJSON("http://api.geonames.org/earthquakesJSON?north="+north+"&south="+south+"&east="+east+"&west="+west+"&datetime="+today+"&minMagnitude="+minMagnitude+"&maxRows="+maxRows+"&username=ferlopez95", function(response){
    //console.log(response);
    sortQuakes(response);
  });

}

//Sort the top 10 earthquakes for the last 12 months given 500 earthquakes
function sortQuakes(data){
  for(var i = 0; i < data.earthquakes.length; i++){

    var quake = data.earthquakes[i];
    var fulldate = quake.datetime;
    var yearSubstring = fulldate.substring(0,4);
    var monthSubstring = fulldate.substring(5,7);

    tempQuakesArray.push(quake);
  }

  var listContainer = document.getElementById("top-10");
  var listElement = document.createElement("ul");

  //Sort the array by magnitude
  tempQuakesArray.sort(function(a,b){return b.magnitude-a.magnitude;});

  $("top-10").append("<ul></ul>");

  //  Add top quakes to the list
  for (var j = 0; j < 10; j++) {

    largestTen[j] = tempQuakesArray[j];
    console.log("LARGEST 10.....");
    console.log(largestTen[j]);

    var li = "<li>";

    //  Add the quakes to the web page
    $("#top-10").append(li.concat("<b>Magnitude:</b> " +largestTen[j].magnitude + ",<br> <b>Date: </b>" + largestTen[j].datetime +",<br> <b> lat, lng: </b>" + largestTen[j].lat + ", "+largestTen[j].lng ));

  }
}

tenLargestQuakes();
