pmb_im.services.factory('ErrorService', ['$http','$ionicPopup', function($http,$ionicPopup) {

  return {
    http_response_is_successful: function (jsonResult, errorContainerId) {
      var errorDiv = document.getElementById(errorContainerId);
      if(jsonResult.data.result==0){
        errorDiv.innerHTML="<h3>" + jsonResult.data.message + "</h3>";
        errorDiv.style.display = "block";
        return false;
      }else{
        errorDiv.style.display = "none";
        return true;
      }
    },

    http_response_is_successful_ajax: function (jsonResult) {
      if(jsonResult.data.result==0){
        return false;
      }else{
        return true;
      }
    },

    http_response_is_successful_popup: function (jsonResult) {
      if(jsonResult.data.result==0){
        var alertPopup = $ionicPopup.alert({
         title: "Error",
         template: jsonResult.data.message
        });
        alertPopup.then(function(res) {
          return false;
        });
        return false;
      }else{
        return true;
      }
    },

    http_data_response_is_successful: function (data, errorContainerId) {
      var errorDiv = document.getElementById(errorContainerId);
      if(data.result==0){
        errorDiv.innerHTML="<h3>" + data.message + "</h3>";
        errorDiv.style.display = "block";
        return false;
      }else{
        errorDiv.style.display = "none";
        return true;
      }
    },

    show_error_message: function (errorContainerId, message) {
        var errorDiv = document.getElementById(errorContainerId);
        errorDiv.innerHTML="<h3>" + message + "</h3>";
        errorDiv.style.display = "block";
        return false;
    }

  };
}]);
