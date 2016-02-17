pmb_im.services.factory('FaqService', ['$http', function($http) {

  var baseURL = "http://devel.pormibarrio.uy/faq";

  return {
    all: function () {
      return $http.get(baseURL, { params: { ajax: "1" } });
    }
  };
}]);
