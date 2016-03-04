 //pmb_im.services.factory('MapService', [ function() {
 pmb_im.services.factory('MapService', ['leafletData', '$compile', function(leafletData, $compile) {

   //Definicion de la proyecccion UTM 21 s
   proj4.defs('EPSG:32721', '+proj=utm +zone=21 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs');


   var mapService = {};

   mapService.goToPlace = function(_place,scope) {

     var _geoJson = {
       properties: {
         nombre: _place.nombre
       },
       crs: {
         type: 'name',
         properties: {
           name: 'urn:ogc:def:crs:EPSG::32721'
         }
       }
     };
     _geoJson = angular.extend(_geoJson, _place.geom);
     //alert(JSON.stringify(_place.geom));
     leafletData.getMap().then(function(map) {
       var _latlng;
       var layer = L.Proj.geoJson(_geoJson, {
         'pointToLayer': function(feature, latlng) {
           _latlng = latlng;
           var htmlPopUp = "<p align='center'>"+feature.properties.nombre+" <br/> <a ng-click='new_report_from_latlon("+_latlng.lat+","+_latlng.lng+");'>Iniciar reporte aquí</a></p>";
           var compiled = $compile(htmlPopUp)(scope);
           return L.marker(latlng).bindPopup(compiled[0]);
         }
       });
       layer.addTo(map);
       // console.log(JSON.stringify(layer));

       map.setView(_latlng, 18);
       layer.openPopup();
     });
   };

   mapService.centerMapOnCoords = function(lat,lng,zoom) {
     leafletData.getMap().then(function(map) {
        map.setView(new L.LatLng(lat, lng),zoom);
       });
     }

   return mapService;

 }]);
