pmb_im.services.factory('locationAPI', ['$http', '$q', 'ApiImEndpoint', 'ApiDataEndpoint', function($http, $q, ApiImEndpoint, ApiDataEndpoint) {

  var restPreffix = "ubicacionesRestWEB";


  var locationAPI = {};

  locationAPI.searchLocationByStr = function(_location) {
    return $http.get(ApiImEndpoint.url + '/' + restPreffix + '/infoUbicacion/lugaresDeInteresYVias/', {
      method: 'GET',
      params: {
        nombre: _location
      }
    });
  };


  locationAPI.searchEsquinaByStr = function(_location) {
    console.log("searchEsquinaByStr = " + JSON.stringify(_location));
    return $http.get(ApiImEndpoint.url + '/' + restPreffix + '/infoUbicacion/esquinas/' + _location.calle + '/', {
      params: {
        nombre: _location.esquina
      }
    });
  };
  locationAPI.getLocationGeom = function(_location) {
    var url = ApiImEndpoint.url + '/' + restPreffix + locationAPI.getParamPathByTipo(_location.tipo);
    for (var i = 0; i < _location.pathParams.length; i++) {
      url += '/' + _location.pathParams[i];
    }

    return $http.get(url).then(function(response){
      return response.data;
    });


  };

  locationAPI.getParamPathByTipo = function(_tipo) {

    var restGeoDataServicePath = {
      'ESQUINA':"/esquinas/posicion",
      'DIRECCION':"/direcciones/posicion",
      'CULTURA': "/cultura/posicion",
      'DEPORTE': "/deporte/posicion",
      'EDUCACION': "/educacion/posicion",
      'SALUD': "/salud/posicion",
      'MONUMENTO': "/monumentos/posicion",
      'ESPACIO LIBRE': "/nomobresDeEspacioLibre/puntoInterior",
      'PATRIMONIO': "/patrimonio/puntoInterior",
      'PLAYA': "/playas/puntoInterior",
      'PARQUE': "/nombresDeParque/puntoInterior"


    };

    return restGeoDataServicePath[_tipo];


  };

  return locationAPI;

}]);
