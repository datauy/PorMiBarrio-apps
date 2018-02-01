pmb_im.services.factory('AuthService', ['$http', '$cordovaFileTransfer', 'ConfigService', function($http, $cordovaFileTransfer, ConfigService) {

  var baseURL = ConfigService.baseURL + "/auth/ajax/";

  return {
    sign_in: function (password, email) {
      return $http.get(baseURL + "sign_in", { withCredentials: true, params: { password_sign_in: password, email: email } });
    },

    sign_out: function (password, email) {
      return $http.get(baseURL + "sign_out", { withCredentials: true, params: { password_sign_in: password, email: email } });
    },

    create_user: function (email,fullname,password, id_doc, user_phone) {
      return $http.get(baseURL + "create_user", { withCredentials: true, params: { form_email: email, name: fullname, password_register: password,
                                                            identity_document: id_doc, phone: user_phone } });
    },

    password_recovery: function (email) {
      return $http.get(baseURL + "forgot_password", { params: { login_email: email}
                                        });
    },

    password_change: function (email,oldPassword,newPassword,confirmPassword) {

      var body = 'email='+email+'&password_sign_in='+oldPassword+'&new_password='+newPassword+'&confirm='+confirmPassword;
      return $http.post(baseURL + 'change_password', body,{headers: {'Content-Type': 'application/x-www-form-urlencoded'}});

    },


    edit_user: function (email,password, fullname, new_email, id_doc, user_phone, user_picture_url) {
      if (user_picture_url!=null && user_picture_url!="") {
        var options = {
         fileKey: "photo",
         //fileName: filename,
         //chunkedMode: false,
         //mimeType: "image/jpg",
         withCredentials: true,
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
        return $http.get(baseURL + "edit_user", { withCredentials: true, params: { email: email,
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
