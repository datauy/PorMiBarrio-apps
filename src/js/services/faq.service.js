pmb_im.services.factory('FaqService', ['$http', 'ConfigService', function($http, ConfigService) {

  var baseURL = ConfigService.baseURL + "/faq";

  return {
    all: function () {
      return $http.get(baseURL, { params: { ajax: "1" } });
    }
  };
}]);
