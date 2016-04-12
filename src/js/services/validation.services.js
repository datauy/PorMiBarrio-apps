pmb_im.services.factory('ValidationService', ['$http','$ionicPopup', function($http,$ionicPopup) {

  return {
    validate_not_empty: function (value) {
        if(value!=null && value!="undefined" && value!=""){
          return true;
        }else{
          return false;
        }
    },

    validate_email: function (value) {
        if(value!=null && value!="undefined" && value!=""){
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(value);
        }else{
          return false;
        }
    }
  };
}]);
