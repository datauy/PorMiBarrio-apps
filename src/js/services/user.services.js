pmb_im.services.factory('UserService', ['$http', function($http) {

  //var baseURL = "http://devel.pormibarrio.uy/auth/ajax/";
  var UserObj = {};
  UserObj.name = null;
  UserObj.email = null;
  UserObj.password = null;
  UserObj.picture = "url(./img/icon-user-anonymous.png)";

  UserObj.save_user_data = function (user_name, user_email, user_password) {
      UserObj.name = user_name;
      UserObj.email = user_email;
      UserObj.password = user_password;
      //SAVE IN POUCHDB
  }

  UserObj.erase_user_data = function () {
    UserObj.name = null;
    UserObj.email = null;
    UserObj.password = null;
    //DELETE IN POUCHDB
  }

  UserObj.get_user_data = function () {
    //LEVANTA DE POUCHDB LOS DATOS DEL USUARIO. SI HAY LOS PONE EN LAS VARIABLES DEL SERVICIO. SI NO HAY PONE TODO NULL
  }


  return UserObj;

}]);
