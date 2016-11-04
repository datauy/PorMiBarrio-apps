pmb_im.services.factory('CategoriesService', ['$http','LocationsService', 'ConfigService', 'DBService', function($http,LocationsService, ConfigService, DBService) {

  var baseURL = ConfigService.baseURL + "/report/new/ajax";

  return {
    all: function () {
      return $http.get(baseURL, { params: { lat: LocationsService.new_report_lat, lon: LocationsService.new_report_lng, format: "json" } })
    },

    getCachedCategories: function () {
      return DBService.getCategories();
    }
  };
}]);
