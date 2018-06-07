pmb_im.services.factory('AuthService', ['$http', 'ConfigService', function($http, ConfigService) {

  var baseURL = ConfigService.baseURL + "/auth/ajax/";

  return {
    sign_in: function (password, email) {
      return $http.get(baseURL + "sign_in", { withCredentials: true, params: { password_sign_in: password, email: email } });
    },

    sign_out: function (password, email) {
      return $http.get(baseURL + "sign_out", { withCredentials: true,  params: { password_sign_in: password, email: email } });
    },

    create_user: function (email,fullname,password, id_doc, user_phone) {
      return $http.get(baseURL + "create_user", { withCredentials: true,  params: { form_email: email, name: fullname, password_register: password,
                                                            identity_document: id_doc, phone: user_phone } });
    },

    change_password: function (email,fullname,password, id_doc, user_phone) {
      return $http.get(baseURL + "create_user", { withCredentials: true,  params: { login_email: email, name: fullname, password_register: password,
                                                            identity_document: id_doc, phone: user_phone } });
    },

    edit_user: function (email,password, fullname, new_email, id_doc, user_phone, user_picture_url) {
      if (user_picture_url!=null && user_picture_url!="") {
	var formData = new FormData();
	formData.append("photo", user_picture_url);
	formData.append("email", email);
	formData.append("password_sign_in", password);
	formData.append("name", fullname);
	formData.append("new_email", new_email);
	formData.append("identity_document", id_doc);
	formData.append("phone", user_phone);
	return $http.post(baseURL + "edit_user", formData, {
	    headers: { 'Content-Type': undefined },
	    transformRequest: angular.identity
	});

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
