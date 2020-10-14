pmb_im.services.factory('ConnectivityService', ['$cordovaNetwork', function($cordovaNetwork){

  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        try {
          return $cordovaNetwork.isOnline();
         }
         catch (error) {
          return true;
         }
      } else {
        return navigator.onLine;
        //return false;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        try {
          return !$cordovaNetwork.isOnline();
         }
         catch (error) {
          return false;
         }
      } else {
        return !navigator.onLine;
      }
    }
  }
}])
