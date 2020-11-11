pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  //ConfigObj.baseURL = "https://pmbdev.development.datauy.org";
  ConfigObj.baseURL = "/data";
  if(ionic.Platform.isWebView()){
    ConfigObj.baseURL = "https://pormibarrio.freyja.datauy.org";
  }

  ConfigObj.baseCobrand = "/cobrands/pormibarrio";

  return ConfigObj;

}]);
