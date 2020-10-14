pmb_im.services.factory('PMBService', ['$http', 'leafletData', '$cordovaFileTransfer', 'ConfigService', function($http, leafletData, $cordovaFileTransfer,ConfigService) {

  var base = ConfigService.baseURL;

  var PMBService = {

    report: function(form) {
      console.log(form);
      if (form.file) {
        var options = {
         fileKey: "photo",
         fileName: "image.jpeg",
         chunkedMode: false,
         mimeType: "image/jpeg",
         params : form,
         withCredentials: true 
        };
        options.headers = {
          Connection: "Close"
        };
        var trustAllHosts = true;
        return $cordovaFileTransfer.upload(base + '/report/new/mobile', form.file, options, trustAllHosts);
      }else{
        return $http.get(base + '/report/new/mobile', { params: form });
      }
    },

    subscribe: function (email,report_id) {
      return $http.get(base + "/alert/subscribe_ajax", { params: { rznvy: email, id: report_id, type: "updates" } });
    },

    abuse: function (email,report_id, name, subject, message) {
      return $http.get(base + "/contact/submit_ajax", { params: { em: email, id: report_id, name: name, subject: subject, message: message } });
    },

    hide: function (report_id) {
      var deleteURL = "/report/delete_ajax/" + report_id;
      return $http.get(base + deleteURL, { params: {} });
    },

    comment: function (comment) {
      if(comment.fixed==0){
        delete comment.fixed;
      }
      if(comment.state==null){
        delete comment.state;
      }
      if(comment.new_category==null){
        delete comment.new_category;
      }
      if (comment.photo) {
        var options = {
         fileKey: "photo",
         fileName: "image.jpeg",
         chunkedMode: false,
         mimeType: "image/jpeg",
         params : comment,
         withCredentials: true
        };
        options.headers = {
          Connection: "Close"
        };
        var trustAllHosts = true;
        return $cordovaFileTransfer.upload(base + '/report/update', comment.photo, options, trustAllHosts);
      }else{
        return $http.get(base + '/report/update', { withCredentials: true, params: comment });
      }
    },

   getAreas: function (lon,lat) {
     var mapitURL = "http://mapit.pormibarrio.uy/point/4326/"+lon+","+lat+"";
     return $http.get(mapitURL, { params: {} });
   },

  };
  return PMBService;

}]);
