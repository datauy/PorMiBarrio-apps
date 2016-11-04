pmb_im.services.factory('PMBService', ['$http', 'leafletData', '$cordovaFileTransfer', 'ConfigService', function($http, leafletData, $cordovaFileTransfer,ConfigService) {

  var base = ConfigService.baseURL;

  var PMBService = {

    report: function(form) {
      if (form.file) {
        var options = {
         fileKey: "photo",
         fileName: "image.jpeg",
         chunkedMode: false,
         mimeType: "image/jpeg",
         params : form
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

    comment: function (report_id,message,name,email,may_show_name,add_alert,fixed) {
      return $http.get(base + "/report/update_ajax",
      { params:
        {
          submit_update: 1,
          id: report_id,
          may_show_name: may_show_name,
          add_alert: add_alert,
          fixed: fixed,
          update: message,
          name: name,
          form_rznvy: email
        }
      });
    },

  };
  return PMBService;

}]);
