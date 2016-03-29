pmb_im.services.factory('PMBService', ['$http', 'leafletData', '$cordovaFileTransfer', 'ConfigService', function($http, leafletData, $cordovaFileTransfer,ConfigService) {

  var base = ConfigService.baseURL;

  var PMBService = {

    report: function(form) {
      if (form.file) {
        var options = {
         fileKey: "photo",
         //fileName: filename,
         //chunkedMode: false,
         //mimeType: "image/jpg",
         params : form
        };
        var trustAllHosts = true;
        return $cordovaFileTransfer.upload(base + 'report/new/mobile', form.file, options, trustAllHosts);
      }else{
        return $http.get(base + 'report/new/mobile', { params: form });
      }
    }

  };
  return PMBService;

}]);
