pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "http://devel.pormibarrio.uy/";

  return ConfigObj;

}]);
