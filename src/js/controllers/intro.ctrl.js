pmb_im.controllers.controller('IntroCtrl', ['$scope', '$state',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicPlatform',
  '$ionicPopup',
  'LocationsService',
  function($scope, $state, $cordovaGeolocation, $stateParams, $ionicPlatform, $ionicPopup, LocationsService) {

  $scope.geolocate = function() {

      var posOptions = {timeout: 7000, enableHighAccuracy: true};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function(position) {
          LocationsService.save_initial_position(position);
          $state.go("app.map");
        }, function(err) {
          $state.go("app.map");
        });
    };

   $scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
       $scope.geolocate();
   });

  }
]);
