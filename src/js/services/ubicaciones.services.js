pmb_im.services.factory('locationAPI', ['$http', '$q', 'ApiImEndpoint', 'ApiDataEndpoint', function($http, $q, ApiImEndpoint, ApiDataEndpoint) {

  var restPreffix = "ubicacionesRestProd";


  var locationAPI = {};

  locationAPI.searchLocationByStr = function(_location) {
    return $http.get(ApiImEndpoint.url + '/' + restPreffix + '/calles', {
      method: 'GET',
      params: {
        nombre: _location
      }
    });
  };


  locationAPI.searchEsquinaByStr = function(_location) {
    //console.log("searchEsquinaByStr = " + JSON.stringify(_location));
    //return $http.get(ApiImEndpoint.url + '/' + restPreffix + '/esquina/' + _location.calle + '/' + _location.esquina, {
      return $http.get(ApiImEndpoint.url + '/' + restPreffix + '/cruces/' + _location.calle + '/',
      {
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
      'ESQUINA':"/esquina",
      'DIRECCION':"/direccion"
    };

    return restGeoDataServicePath[_tipo];


  };

  return locationAPI;

}]);
