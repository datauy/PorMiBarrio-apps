pmb_im.services.factory('CategoriesService', ['$http','LocationsService', 'ConfigService', 'DBService', function($http,LocationsService, ConfigService, DBService) {

  var baseURL = ConfigService.baseURL + "/report/new/ajax";
  var baseURLfromAPI = ConfigService.baseURL + "/api/categories/";

  return {
    all: function () {
      return $http.get(baseURL, { params: { lat: LocationsService.new_report_lat, lon: LocationsService.new_report_lng, format: "json" } })
    },

    allFromBodyArea: function (areaId) {
      return $http.get(baseURLfromAPI, { params: { api_key: "1234", area: areaId } })
    },

    getCachedCategories: function () {
      return DBService.getCategories();
    }
  };
}]);
