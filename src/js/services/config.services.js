pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "http://pmbuy.development.datauy.org";
  ConfigObj.baseCobrand = "/cobrands/pormibarrio";

  return ConfigObj;

}]);
