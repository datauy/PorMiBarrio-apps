pmb_im.services.factory('PopUpService', ['$ionicPopup', function($ionicPopup) {

  return {
    show_alert: function (alert_title,alert_message) {
        var alertPopup = $ionicPopup.alert({
         title: alert_title,
         template: alert_message
        });
        alertPopup.then(function(res) {
          return true;
        });
        return true;
    }
  };
}]);
