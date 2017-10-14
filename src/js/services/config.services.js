pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "https://pormibarrio.uy";
  //ConfigObj.baseURL = "http://pmbdev.development.datauy.org";

  ConfigObj.baseCobrand = "/cobrands/pormibarrio";

  return ConfigObj;

}]);
