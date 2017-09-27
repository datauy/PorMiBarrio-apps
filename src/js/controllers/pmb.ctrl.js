pmb_im.controllers.controller('PMBCtrl',
['$scope',
'$state',
'leafletData',
'PMBService',
'ReportService',
'locationAPI',
'MapService',
'_',
'Loader',
'LocationsService',
'$ionicModal',
function($scope,
  $state,
  leafletData,
  PMBService,
  ReportService,
  locationAPI,
  MapService,
  _,
  Loader,
  LocationsService,
  $ionicModal) {


  $scope.reportButton = {
    text: "Reportar",
    state: "unConfirmed"
  };

  //$scope.$on('$ionicView.afterEnter', function(){ //This is fired twice in a row
  $scope.$on("$ionicView.afterEnter", function() {
    //document.getElementById("spinner").style.display = "none";
    var map = leafletData.getMap();
    if(LocationsService.initial_lat!=""){
      MapService.centerMapOnCoords(LocationsService.initial_lat, LocationsService.initial_lng, 16);
    }else{
      //MapService.centerMapOnCoords(-34.901113, -56.164531, 14);
      $scope.openCouncilSelector();
    }
  });

  $scope.select_imm = function(){
    $scope.close_council_modal();
    LocationsService.selectCouncil("289");
    MapService.centerMapOnCoords(-34.901113, -56.164531, 14);
  }

  $scope.select_idr = function(){
    $scope.close_council_modal();
    LocationsService.selectCouncil("255");
    MapService.centerMapOnCoords(-30.8997469, -55.5434686, 14);
  }

  $scope.openCouncilSelector = function(){
    $ionicModal.fromTemplateUrl('templates/council_selector_with_back_button.html', {
      scope: $scope,
      hardwareBackButtonClose: false,
      animation: 'slide-in-up',
      //focusFirstInput: true
    }).then(function(modal) {
        LocationsService.council_modal = modal;
        LocationsService.council_modal.show().then(function(){
        })
      });
  }

  $scope.close_council_modal = function(){
    LocationsService.council_modal.hide();
    LocationsService.council_modal.remove();
  }


  /**/

  $scope.searchMode = "calle.lugar";
  $scope.location ={calle:null,esquina:null,lugar:null};


  //Auto complete


  var locationGeomParams ={tipo:null,pathParams:[]};
  $scope.$on("$stateChangeSuccess", function() {
    $scope.ionAutocompleteElement = angular.element(document.getElementsByClassName("ion-autocomplete"));
    //console.log(JSON.stringify($scope.ionAutocompleteElement));
    $scope.ionAutocompleteElement.bind('touchend click focus', $scope.onClick);
  });


  $scope.initReport = function() {

    var _pin, _pinIcon = L.icon({
      iconUrl: 'img/pin@x2.png',
      iconSize: [70, 110], // size of the icon
      iconAnchor: [-18, 55], // point of the icon which will correspond to marker's location
    });

    if ($scope.reportButton.state == "unConfirmed") {

      $scope.reportButton.text = "Confirmar";
      $scope.reportButton.state = "about2Confirm";


      leafletData.getMap().then(function(map) {
        _pin = new L.marker(map.getCenter(), {
          icon: _pinIcon,
          clickable: false
        }).addTo(map);

        ReportService._new();
        ReportService.current.setLatLng(map.getCenter());
        //console.log(JSON.stringify($scope.currentReport));

        $scope.ionAutocompleteElement = angular.element(document.getElementsByClassName("ion-autocomplete"));
        $scope.ionAutocompleteElement.bind('touchend click focus', $scope.onClick);


      });
    } else {
      //console.log("currentReport =" + JSON.stringify($scope.currentReport));
    }

  };

  $scope.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  $scope.searchLocation = function(query) {
    var promiseSearch;
    if (query && query.length>=2) {
      if ($scope.searchMode == "calle.lugar") {
        promiseSearch = locationAPI.searchLocationByStr(query);
      } else {
        //console.log("buscando calle/"+$scope.selectedItem.codigo+"esquina = " + query);
        if($scope.isNumeric(query.trim())){
          var items = [];
          var item = {"descTipo":"NUMERO","address":query,"lat":query};
          items[0] = item;
          return items;
        }else{
          promiseSearch = locationAPI.searchEsquinaByStr({
            calle: $scope.selectedItem.lat,
            esquina: query
          });
        }
      }
      return promiseSearch;
    }else{
          return [];
    }
  };

  $scope.onClick = function() {

    $scope.ionAutocompleteElement.controller('ionAutocomplete').showModal();

  };

  $scope.itemsClicked = function(callback) {

    $scope.clickedValueModel = callback;
    //$scope.selectedItem = callback.selectedItems[0];
    $scope.selectedItem = callback.item;
    $scope.ionAutocompleteElementSearch = angular.element(document.getElementsByClassName("ion-autocomplete-search"));
    if ($scope.searchMode == "esquina.numero") {
      locationGeomParams.pathParams = [];
      $scope.location.esquina= $scope.selectedItem;
      locationGeomParams.pathParams.push($scope.location.calle.lat);
      locationGeomParams.pathParams.push($scope.location.esquina.lat);
      var str_tipo = "";
      var tipo = "";
      if($scope.isNumeric($scope.selectedItem.address)){
        //Seleccionó un número de puerta
        locationGeomParams.tipo="DIRECCION";
        tipo = "door";
      }else{
        //selecciono una esquina
        locationGeomParams.tipo="ESQUINA";//$scope.selectedItem.descTipo;
        str_tipo = "esquina";
        tipo = "corner";
      }
      //locationAPI.getLocationGeom(locationGeomParams).then(function(result)
      locationAPI.getLocationGeomPMB($scope.location.calle.lat,$scope.location.esquina.lat,tipo).then(function(result)
      {
        var name = $scope.location.calle.address + " " + str_tipo + " " + $scope.selectedItem.address;
        MapService.goToPlace(name, result.data.latitude,result.data.longitude,$scope);
        $scope.searchMode = "calle.lugar";
        $scope.ionAutocompleteElementSearch.attr("placeholder", "Buscar calle");
        $scope.externalModel = [];
      });
    } else {
      $scope.location.calle= $scope.selectedItem;
      $scope.searchMode = "esquina.numero";
      $scope.ionAutocompleteElementSearch.attr("placeholder", "Esquina o número");
      $scope.ionAutocompleteElement.controller('ionAutocomplete').showModal();
      $scope.preselectedSearchItems = [];
      /*if ($scope.selectedItem.descTipo === "VIA") {
        $scope.location.calle= $scope.selectedItem;
        $scope.searchMode = "esquina.numero";
        $scope.ionAutocompleteElementSearch.attr("placeholder", "Esquina o número");
        $scope.ionAutocompleteElement.controller('ionAutocomplete').showModal();

      }else{
        //goto place en el mapa
        $scope.location.lugar= $scope.selectedItem;
        locationGeomParams.tipo=$scope.selectedItem.descSubtipo;
        locationGeomParams.pathParams.push($scope.location.lugar.codigo);
        locationAPI.getLocationGeom(locationGeomParams).then(function(result){
        MapService.goToPlace(angular.extend({nombre:$scope.selectedItem.nombre},result));

        });

      }*/
    }

  };

  $scope.itemsCanceled= function(_item){
    var numPuerta = parseInt(_item.searchQuery);
    if(Number.isInteger(numPuerta)){
      //console.log("IS number");
      locationGeomParams.tipo="DIRECCION";//$scope.selectedItem.descTipo;
      locationGeomParams.pathParams.push($scope.location.calle.codigo);
      locationGeomParams.pathParams.push(numPuerta);
      locationAPI.getLocationGeom(locationGeomParams).then(function(result){
      MapService.goToPlace(angular.extend({nombre:$scope.selectedItem.nombre + " " + numPuerta },result),$scope);
      $scope.searchMode = "calle.lugar";

    },function(error){
      //console.log("Error obteniendo la direccion "+ JSON.stringify(error));
      Loader.showAlert("Error","No existe esa direccion").then(function(res){
          $scope.ionAutocompleteElement.controller('ionAutocomplete').showModal();
        });
    });
  }

  };
}]);
