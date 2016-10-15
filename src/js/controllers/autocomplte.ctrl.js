pmb_im.controllers.controller('AutoCompleteCtrl', ['$scope', 'leafletData', 'locationAPI', function($scope, leafletData, locationAPI) {


  $scope.ionAutocompleteElement = angular.element(document.getElementsByClassName("ion-autocomplete"));
  $scope.ionAutocompleteElement.bind('touchend click focus', $scope.onClick);

  $scope.onClick = function() {

    $scope.ionAutocompleteElement.controller('ionAutocomplete').showModal();


  };



  $scope.searchLocation = function(query) {
    if (query) {
      //console.log("query= " + query);
      return locationAPI.searchLocationByStr(query);

    }
  };


}]);
