var MAP;
var HEATMARKERS = [];

function addStationHeatMarker(coordinates, markerTitle, value) {
  var color
  if (value < 5) {
    color = '#FF0000'
  } else if (value < 10) {
    color = '#fffa00'
  } else {
    color = '#2aff00'
  }

  var markerTitle = markerTitle + ' - avg: ' + value;
  console.log('adding station markers')
  var marker = new google.maps.Marker({
    position: coordinates,
    map: MAP,
    title: markerTitle,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 30,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 0,
      fillColor: color,
      fillOpacity: 0.35,
    }
  });

  marker.addListener('click', function () {
    console.log('clicked on:', marker.title)
    console.log(value)
  });

  HEATMARKERS.push(marker);
}

function initMap() {
  var styles = [
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
        { "saturation": 36 },
        { "color": "#333333" },
        { "lightness": 40 }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
        { "visibility": "on" },
        { "color": "#ffffff" },
        { "lightness": 16 }]
    },
    {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#fefefe" },
        { "lightness": 20 }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#fefefe" },
        { "lightness": 17 },
        { "weight": 1.2 }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
        { "color": "#f5f5f5" },
        { "lightness": 20 }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        { "color": "#f5f5f5" },
        { "lightness": 21 }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        { "color": "#e6e6e6" },
        { "lightness": 21 }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#ffffff" }, { "lightness": 17 }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#ffffff" },
        { "lightness": 29 },
        { "weight": 0.2 }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        { "color": "#ffffff" },
        { "lightness": 18 }]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
        { "color": "#ffffff" },
        { "lightness": 16 }]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        { "color": "#f2f2f2" },
        { "lightness": 19 }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        { "color": "#e0eff8" },
        { "lightness": 17 }
      ]
    }]

  var mapOptions = {
    zoom: 14,
    center: { lat: 60.175, lng: 24.939671 },
    disableDefaultUI: true,
    zoomControl: false,
    styles: styles
  }
  var mapDomElement = document.getElementById('heatmap');

  MAP = new google.maps.Map(mapDomElement, mapOptions);

  //addStationHeatMarkers("2017-06-30 10:00:00")
}


function addStationHeatMarkers(dayAndHour) {
  
  d3.json('heatmap-sample2.csv.json', function (error, availabilityData) {
    //filter by selected date
    availabilityData = availabilityData.filter(row => 
      row.time === dayAndHour
    )
    
    //loop availability data row by row
    availabilityData = availabilityData.map(row => {

      //get station coordinates from json
      d3.json('stations.json', function (error, stationData) {
        var stationInfo = stationData.stations.find(function(element) {  
          return element.stationId == parseInt(row.stationid);
        });

        //use data from stations.json and heatmap-data.json to draw markers
        var coordinates = { lat: parseFloat(stationInfo.lat), lng: parseFloat(stationInfo.lon)}
        addStationHeatMarker(coordinates, row.stationid, row.avlbikes)
      });

    })
  })
  console.log('end of addStationMarkers!')
}