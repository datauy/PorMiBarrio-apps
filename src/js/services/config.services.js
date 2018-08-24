pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  //ConfigObj.baseURL = "https://pmbdev.development.datauy.org";
  ConfigObj.baseURL = "http://pmbuy.development.datauy.org";
  if(ionic.Platform.isWebView()){
    ConfigObj.baseURL = "http://pmbuy.development.datauy.org";
  } else {
    ConfigObj.baseURL = "/data";
  }

  ConfigObj.baseCobrand = "/cobrands/pormibarrio";

  return ConfigObj;

}]);
