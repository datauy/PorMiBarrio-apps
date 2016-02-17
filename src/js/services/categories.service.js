pmb_im.services.factory('CategoriesService', ['$http','LocationsService', function($http,LocationsService) {

  var baseURL = "http://devel.pormibarrio.uy/report/new/ajax";

  return {
    all: function () {
      return $http.get(baseURL, { params: { lat: LocationsService.new_report_lat, lon: LocationsService.new_report_lng, format: "json" } })
    },
    get: function () {
      return $http.get(baseURL, { params: { lat: LocationsService.new_report_lat, lon: LocationsService.new_report_lng, format: "json" } })
    },
    add: function (id) {
      return $http.get(baseURL, { params: { lat: LocationsService.new_report_lat, lon: LocationsService.new_report_lng, format: "json" } })
    }
  };
}]);
