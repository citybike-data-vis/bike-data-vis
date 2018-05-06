
var MAP;
var HEATMARKERS = [];

function addStationHeatMarker(coordinates, markerTitle, value) {
  var color ='#006837'
  var fillOpacity = 0.7
  var scale

  if (value < 3) {
    //color = '#addd8e'
    scale = 5
  } else if (value < 6) {
    //color = '#78c679'
    scale = 10
  } else if (value < 10) {
    //color = '#41ab5d'
    scale = 15
  } else if (value < 15) {
    //color = '#238443'
    scale = 20
  } else {
    //color = '#006837'
    scale = 30
  }

  //color = '#8efc28'
  scale = 15 * Math.log10(parseFloat(value + 3))

  var markerTitle = 'station: ' + markerTitle + ' - bikes available: ' + value;
  console.log('adding station markers')
  var symbolCross = {
    path: 'M -4,-4 4,4 M 4,-4 -4,4',
    strokeColor: '#922',
    strokeWeight: 2
  };

  if(value < 1) {
    var marker = new google.maps.Marker({
      position: coordinates,
      map: MAP,
      title: markerTitle,
      icon: symbolCross
    })
  } else {
    var marker = new google.maps.Marker({
      position: coordinates,
      map: MAP,
      title: markerTitle,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: scale,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 0,
        fillColor: color,
        fillOpacity: fillOpacity,
      }
    })
  }  

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
    zoom: 13,
    center: { lat: 60.185, lng: 24.939671 },
    disableDefaultUI: true,
    zoomControl: false,
    styles: styles
  }
  var mapDomElement = document.getElementById('heatmap');

  MAP = new google.maps.Map(mapDomElement, mapOptions);

  //addStationHeatMarkers("2017-06-30 10:00:00")
}


function addStationHeatMarkers(dayAndHour) {
  dayAndHour = moment(dayAndHour).utc().format('YYYY-MM-DD HH:mm:ss')
  d3.json(DATAFOLDER + 'hourly-avg-2017-06.csv.json').then(function (availabilityData) {
    //filter by selected date
    console.log("jotain")
    availabilityData = availabilityData.filter(row => 
      row.time === dayAndHour
    )
    console.log(availabilityData)
    
    //loop availability data row by row
    availabilityData = availabilityData.map(row => {

      //get station coordinates from json
      d3.json(DATAFOLDER + 'stations.json').then(function (stationData) {
        
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