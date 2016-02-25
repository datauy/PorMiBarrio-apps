pmb_im.services.factory('PMBService', ['$http', 'leafletData', '$cordovaFileTransfer', function($http, leafletData, $cordovaFileTransfer) {
  var base = "http://devel.pormibarrio.uy/";//"http://10.191.0.16:3000/";

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
