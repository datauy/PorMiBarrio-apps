pmb_im.services.factory('CategoriesService', ['$http','LocationsService', 'ConfigService', function($http,LocationsService, ConfigService) {

  var baseURL = ConfigService.baseURL + "report/new/ajax";

  return {
    all: function () {
      return $http.get(baseURL, { params: { lat: LocationsService.new_report_lat, lon: LocationsService.new_report_lng, format: "json" } })
    }
  };
}]);
