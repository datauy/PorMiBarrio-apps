pmb_im.services.factory('AuthService', ['$http', '$cordovaFileTransfer', 'ConfigService', function($http, $cordovaFileTransfer, ConfigService) {

  var baseURL = ConfigService.baseURL + "/auth/ajax/";

  return {
    sign_in: function (password, email) {
      return $http.get(baseURL + "sign_in", { params: { password_sign_in: password, email: email } });
    },

    sign_out: function (password, email) {
      return $http.get(baseURL + "sign_out", { params: { password_sign_in: password, email: email } });
    },

    create_user: function (email,fullname,password, id_doc, user_phone) {
      return $http.get(baseURL + "create_user", { params: { form_email: email, name: fullname, password_register: password,
                                                            identity_document: id_doc, phone: user_phone } });
    },

    change_password: function (email,fullname,password, id_doc, user_phone) {
      return $http.get(baseURL + "create_user", { params: { login_email: email, name: fullname, password_register: password,
                                                            identity_document: id_doc, phone: user_phone } });
    },

    edit_user: function (email,password, fullname, new_email, id_doc, user_phone, user_picture_url) {
      if (user_picture_url!=null && user_picture_url!="") {
        var options = {
         fileKey: "photo",
         //fileName: filename,
         //chunkedMode: false,
         //mimeType: "image/jpg",
         params : {  email: email,
                     password_sign_in: password,
                     name: fullname,
                     new_email: new_email,
                     identity_document: id_doc,
                     phone: user_phone
                   }
        };
        var trustAllHosts = true;
        return $cordovaFileTransfer.upload(baseURL + "edit_user", user_picture_url, options, trustAllHosts);
      }else{
        return $http.get(baseURL + "edit_user", { params: { email: email,
                                                            password_sign_in: password,
                                                            name: fullname,
                                                            new_email: new_email,
                                                            identity_document: id_doc,
                                                            phone: user_phone
                                                          }
                                                });
      }
    }

  };
}]);
