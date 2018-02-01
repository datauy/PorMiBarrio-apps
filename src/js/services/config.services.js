pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  ConfigObj.baseURL = "https://pmbdev.development.datauy.org";
  //ConfigObj.baseURL = "https://pormibarrio.uy";

  ConfigObj.baseCobrand = "/cobrands/pormibarrio";

  return ConfigObj;

}]);
