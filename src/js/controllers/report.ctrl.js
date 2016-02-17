pmb_im.controllers.controller('ReportCtrl', ['$scope', "$state",'$cordovaCamera', '$cordovaFile',
'$ionicSlideBoxDelegate', '$ionicNavBarDelegate', 'leafletData', 'ReportService','PMBService',
'LocationsService','CategoriesService',
function($scope,$state, $cordovaCamera, $cordovaFile, $ionicSlideBoxDelegate, $ionicNavBarDelegate,
  leafletData, ReportService,PMBService,LocationsService,CategoriesService) {

    $scope.$on("$ionicView.enter", function() {
    });

    $scope.$on("$ionicView.beforeEnter", function() {
      $scope.report = ReportService._new();
      $scope.myActiveSlide = 1;
      $scope.report.lat = LocationsService.new_report_lat;
      $scope.report.lon = LocationsService.new_report_lng;
      //console.log($scope.report.lat);
      //console.log($scope.report.lon);
      CategoriesService.all().success(function (response) {
        $scope.categories = response;
      })
    });

  $scope.update_subcategories = function(){
    var all_subcats_selects_active = document.getElementsByClassName("subcategory-active");
    if (all_subcats_selects_active != 'undefined' && all_subcats_selects_active.length>0){
      all_subcats_selects_active[0].className = "subcategory-hidden";
    }
    var idCat = $scope.report.categorygroup;
    var active_select = document.getElementById('subcategoriesSelect_'+idCat);
    active_select.className = "subcategory-active";
  };

  $scope.goToState = function(stateView) {

    $state.go(stateView);
  };

  $scope.confirmReport = function() {
    var report_sent = PMBService.report($scope.report);
    var back_to_map = false;

    if($scope.report.file==null){
      report_sent.success(function(data, status, headers,config){
        //var jsonResult = JSON.stringify(result);
        //console.log(jsonResult);
        //console.log('data success');
        //console.log(data); // object seems fine
        $scope.back_to_map(true);
      })
      .error(function(data, status, headers,config){
        //console.log('data error');
        //console.log(data);
        $scope.back_to_map(true);
      })
    }else{
      report_sent.then(function(result) {
        // Success!
        //console.log("Envío exitoso",result);
        $scope.back_to_map(true);
      }, function(err) {
        //console.log("Error al subir el archivo",err);
        $scope.back_to_map(true);
      }, function(progress) {
        $timeout(function() {
          $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        });
      });
    }
  };

  $scope.back_to_map = function(back_to_map){
    if(back_to_map){
      LocationsService.initial_lat = $scope.report.lat;
      LocationsService.initial_lng = $scope.report.lon;
      $state.go("app.map");
    }else{
      alert("Hubo un error al enviar el reporte.")
    }
  }

  $scope.cancelReport = function(){
    $state.go("app.map");
  }

  $scope.$on('wizard:Previous', function(e) {

    $ionicNavBarDelegate.showBackButton($ionicSlideBoxDelegate.currentIndex() == 1);


  });
  $scope.$on('wizard:Next', function(e) {


    $ionicNavBarDelegate.showBackButton(false);


  });

  $scope.image = null;

  $scope.addImage = function(isFromAlbum) {

    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: !isFromAlbum ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY, // Camera.PictureSourceType.PHOTOLIBRARY
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true

    };


    $cordovaCamera.getPicture(options).then(function(imageData) {
      onImageSuccess(imageData);

      function onImageSuccess(fileURI) {
        window.FilePath.resolveNativePath(fileURI, function(result) {
          // onSuccess code
          fileURI = 'file://' + result;
          $scope.report.file = fileURI;
          $scope.imgURI = fileURI;
          //createFileEntry(fileURI);
        }, function(error) {
          console.error("Error resolveNativePath" + error);
        });

      }

      function createFileEntry(fileURI) {
        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
      }

      // 5
      function copyFile(fileEntry) {
        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
        var newName = makeid() + name;

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
            fileEntry.copyTo(
              fileSystem2,
              newName,
              onCopySuccess,
              fail
            );
          },
          fail);
      }

      // 6
      function onCopySuccess(entry) {
        $scope.$apply(function() {
          $scope.image = entry.nativeURL;
        });
      }

      function fail(error) {

        //console.log("fail: " + error.code);
        //console.log("fail: " + angular.toJson(error));
      }

      function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }

    }, function(err) {
      //console.log(err);
    });
  };

  $scope.urlForImage = function() {
    var imageURL = "http://placehold.it/200x200";
    if ($scope.image) {
      var name = $scope.image.substr($scope.image.lastIndexOf('/') + 1);
      imageURL = cordova.file.dataDirectory + name;
    }
    //console.log("ImageURL = " + imageURL);
    return imageURL;
  };


      // Suggestion

      $scope.model = "";
      $scope.clickedValueModel = "";
      $scope.removedValueModel = "";

      $scope.getTestItems = function(query) {
        var toReturn = [],
          obj;
        if (query) {
          obj = {
            items: [{
              id: "1",
              name: query + "1",
              view: "view: " + query + "1"
            }, {
              id: "2",
              name: query + "2",
              view: "view: " + query + "2"
            }, {
              id: "3",
              name: query + "3",
              view: "view: " + query + "3"
            }]
          };
          toReturn = obj.items;
        }
        return toReturn;
      };

      $scope.itemsClicked = function(callback) {
        $scope.clickedValueModel = callback;
      };
      $scope.itemsRemoved = function(callback) {
        $scope.removedValueModel = callback;
      };



}]);
