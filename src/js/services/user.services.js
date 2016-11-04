pmb_im.services.factory('UserService', ['$http', function($http) {

  //var baseURL = "http://pmbuy.development.datauy.org/auth/ajax/";
  var UserObj = {};
  UserObj.name = null;
  UserObj.email = null;
  UserObj.password = null;
  UserObj.identity_document = null;
  UserObj.phone = '';
  UserObj.picture_url = "url(./img/icon-user-anonymous.png)";


  UserObj.save_user_data = function (user_name, user_email, user_password, user_id_doc, user_phone, user_picture_url) {
      UserObj.name = user_name;
      UserObj.email = user_email;
      UserObj.password = user_password;
      UserObj.identity_document = user_id_doc;
      UserObj.phone = user_phone;
      UserObj.picture_url = user_picture_url;
      //SAVE IN POUCHDB
  }

  UserObj.erase_user_data = function () {
    UserObj.name = null;
    UserObj.email = null;
    UserObj.password = null;
    UserObj.identity_document = null;
    UserObj.phone = null;
    UserObj.picture_url = null;
    //DELETE IN POUCHDB
  }

  UserObj.get_user_data = function () {
    //LEVANTA DE POUCHDB LOS DATOS DEL USUARIO. SI HAY LOS PONE EN LAS VARIABLES DEL SERVICIO. SI NO HAY PONE TODO NULL
  }

  UserObj.add_photo = function (user_picture_url) {
    UserObj.picture_url = user_picture_url;
  }

  UserObj.isLogged = function () {
    if(UserObj.name!=null && UserObj.name!=""){
      return true;
    }else{
      return false;
    }
  }


  return UserObj;

}]);
