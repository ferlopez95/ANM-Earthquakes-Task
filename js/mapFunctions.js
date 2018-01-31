//Defining the map
var map = new google.maps.Map(document.getElementById("map-canvas"),{
  center:{
    lat: 25.671,
    lng: -100.309
  },
  zoom:5
});

//List of markers
var markers = [];

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
    })

    //Add the information to the marker
    var infoWindow = new google.maps.InfoWindow({
      content: '<h5>Magnitud: ' + props.magnitude + '</h5><h6>Fecha: ' + props.datetime.substring(0,10) + '</h6>'
    });

    //Show the information of the marker when clicked
    marker.addListener('click',function(){
      infoWindow.open(map,marker);
    })

    markers.push(marker);
  }

  var bounds = new google.maps.LatLngBounds();
  var j, place;

  //Moves the bound of the map
  for(j=0; place = places[j]; j++){
    bounds.extend(place.geometry.location);
  }

  map.fitBounds(bounds);
  map.setZoom(4);
})
