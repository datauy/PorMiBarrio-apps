pmb_im.services.factory('AuthService', ['$http', function($http) {

  var baseURL = "http://devel.pormibarrio.uy/auth/ajax/";

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
    }
  };
}]);
