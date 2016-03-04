pmb_im.controllers.controller('MapController', ['$scope', '$sce', '_',
  '$cordovaCamera',
  '$cordovaFile',
  '$cordovaGeolocation',
  '$compile',
  '$state',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  'leafletData',
  'PMBService',
  'LocationsService',
  'ReportService',
  'FaqService',
  'CategoriesService',
  function(
    $scope,
    $sce,
    _,
    $cordovaCamera,
    $cordovaFile,
    $cordovaGeolocation,
    $compile,
    $state,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    leafletData,
    PMBService,
    LocationsService,
    ReportService,
    FaqService,
    CategoriesService
  ) {

    /**
     * Once state loaded, get put map on scope.
     */
    $scope.featureReports = {};
    $scope.baseURL = "http://devel.pormibarrio.uy/";


    $scope.$on("$ionicView.afterEnter", function() {
      document.getElementById("spinner").style.display = "none";

        $scope.addReportsLayer();
        $scope.addMapControls();



      $scope.map = {
        defaults: {
          tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          maxZoom: 18,
          zoomControlPosition: 'topleft',
        },
        markers: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      };
        $scope.map.center = {
          lat: -34.901113,
          lng: -56.164531,
          zoom: 14
        };
    });

    var Location = function() {
      if (!(this instanceof Location)) return new Location();
      this.lat = "";
      this.lng = "";
      this.name = "";
    };


    $ionicModal.fromTemplateUrl('templates/pmb-wizard.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.new_report_modal = modal;
      });

    $scope.new_report_from_latlon = function(lat,lng) {
      LocationsService.new_report_lat = lat;
      LocationsService.new_report_lng = lng;
      $scope.new_report(1);
    }

    $scope.new_report = function(alreadyLocated) {
      $scope.set_active_option('button-report');
      document.getElementById("report-list-scroll").style.display = "none";
      if(alreadyLocated==1){
        document.getElementById("spinner").style.display = "block";
        $scope.report = ReportService._new();
        $scope.report.lat = LocationsService.new_report_lat;
        $scope.report.lon = LocationsService.new_report_lng;
        CategoriesService.all().success(function (response) {
          $scope.categories = response;
          document.getElementById("spinner").style.display = "none";
          document.getElementById("foot_bar").style.display = "none";
          $scope.new_report_modal.show();
        })
      }else{
        var alertPopup = $ionicPopup.alert({
         title: 'Nuevo reporte',
         template: 'Para realizar un nuevo reporte, presione sobre la ubicación deseada.'
        });

        alertPopup.then(function(res) {

        });
      }
    }

  $scope.update_subcategories = function(){
    var all_subcats_selects_active = document.getElementsByClassName("subcategory-active");
    if (all_subcats_selects_active != 'undefined' && all_subcats_selects_active.length>0){
      all_subcats_selects_active[0].className = "subcategory-hidden";
    }
    var idCat = $scope.report.categorygroup;
    var active_select = document.getElementById('subcategoriesSelect_'+idCat);
    active_select.className = "subcategory-active";
    document.getElementById("subcategoriesSelectContainer").style.display="block";
  };

  $scope.confirmReport = function() {
    var report_sent = PMBService.report($scope.report);
    var back_to_map = false;
    document.getElementById("spinner").style.display = "block";
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
      //LocationsService.initial_lat = $scope.report.lat;
      //LocationsService.initial_lng = $scope.report.lon;
      $scope.new_report_modal.hide();
      document.getElementById("foot_bar").style.display = "block";
      document.getElementById("spinner").style.display = "none";
      $scope.addReportsLayer();
    }else{
      alert("Hubo un error al enviar el reporte.")
    }
  }

  $scope.cancelReport = function(){
    $scope.new_report_modal.hide();
    document.getElementById("foot_bar").style.display = "block";
  }

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


    $scope.list_reports = function() {
      $scope.set_active_option('button-list-reports');
      document.getElementById("report-list-scroll").style.display = "block";
    }

    $ionicModal.fromTemplateUrl('templates/faq.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.faq_modal = modal;
      });

    $scope.help = function() {
      document.getElementById("spinner").style.display = "block";
      $scope.set_active_option('button-help');
      document.getElementById("report-list-scroll").style.display = "none";
      FaqService.all().success(function (response) {
        $scope.faq = response;
        document.getElementById("spinner").style.display = "none";
        $scope.faq_modal.show()
      })
    }

    $scope.close_faq_modal = function(){
      $scope.faq_modal.hide();
    }

    $scope.set_active_option = function(buttonid) {
      document.getElementById("button-report").className = "option-inactive";
      document.getElementById("button-list-reports").className = "option-inactive";
      document.getElementById("button-help").className = "option-inactive";
      document.getElementById("button-find-me").className = "option-inactive";
      document.getElementById(buttonid).className = "option-active";
    }

    $ionicModal.fromTemplateUrl('templates/report-detail.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.report_detail_modal = modal;
      });

    $scope.viewReportDetails = function(id){
      document.getElementById("spinner").style.display = "block";
      document.getElementById("report-list-scroll").style.display = "none";
      ReportService.getById(id).then(function(resp) {
        $scope.report_detail = $sce.trustAsHtml(resp.data.replace("overflow:auto;",""));
        document.getElementById("spinner").style.display = "none";
        $scope.report_detail_modal.show()
      }, function(err) {
        //console.log(err);
        document.getElementById("spinner").style.display = "none";
        $scope.report_detail = "ERROR AL CARGAR DATOS DEL REPORTE";
        $scope.report_detail_modal.show()
      });
    }

    $scope.close_report_detail_modal = function(){
      $scope.report_detail_modal.hide();
    }


    /**
     * Center map on user's current position
     */
    $scope.locate = function() {

      $cordovaGeolocation
        .getCurrentPosition()
        .then(function(position) {
          $scope.map.center.lat = position.coords.latitude;
          $scope.map.center.lng = position.coords.longitude;
          $scope.map.center.zoom = 15;

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            message: "You Are Here",
            focus: true,
            draggable: false
          };

        }, function(err) {
          // error
          //console.log("Location error!");
          //console.log(err);
        });

    };


    $scope.getReports = function() {

      leafletData.getMap().then(function(map) {
        var bbox = map.getBounds();
        //Console.log(bbox);

        PMBService.around(bbox).then(function(data) {
          for (var i = 0; i < data.length; i++) {
            //console.log("pin " + i + "=" + data[i]);
          }
        });
      });
    };

    $scope.addMapControls = function() {

      var _crosshair, _crosshairIcon = L.icon({
        iconUrl: 'img/crosshairs@x2.png' //,
          /*  iconSize: [36, 36], // size of the icon
            iconAnchor: [18, 18], // point of the icon which will correspond to marker's location
            */
      });

      leafletData.getMap().then(function(map) {

        /*_crosshair = new L.marker(map.getCenter(), {
          icon: _crosshairIcon,
          clickable: false
        });

        L.easyButton({
          id: 'id-for-the-button',
          position: 'bottomleft',
          type: 'replace',
          leafletClasses: true,
          states: [{
              stateName: 'mark-center',
              onClick: function(button, map) {
                _crosshair.setLatLng(map.getCenter());
                _crosshair.addTo(map);
                map.on('move', function(e) {
                  _crosshair.setLatLng(map.getCenter());
                });

                button.state('remove-mark-center');
              },
              title: 'show me the middle',
              icon: 'ion-pinpoint'
            }, {
              stateName: 'remove-mark-center',
              onClick: function(button, map) {
                map.removeLayer(_crosshair);
                button.state('mark-center');
              },
              title: 'show me the middle',
              icon: 'ion-ios-undo'
            }

          ]
        }).addTo(map);

      //  L.Control.geocoder().addTo(map);
      */

      });
    };

    $scope.addReportsLayer = function() {

      var baseURL = "http://devel.pormibarrio.uy/", ///"http://pormibarrio.uy/";//"http://datauy.netuy.net/",
        buildPopup = function(data, marker) {
          var reportId = data[3],
            descripcion = data[4];

          var html = '<a class="text report-link" ng-click="viewReportDetails(' + reportId + ')"><p>' + descripcion + '</p></a>';
          return html;


        },

        onEachFeature = function(feature, layer) {
          // does this feature have a property named popupContent?
          var html, reportId, descripcion;
          if (feature.properties) {
            reportId = feature.properties.id;
            descripcion = feature.properties.title;
            html = '<a class="text report-link" ng-click="viewReportDetails(' + reportId + ')"><p>' + descripcion + '</p></a>';
            var compiled = $compile(html)($scope);
            layer.bindPopup(compiled[0]);
          }
        },

        l = new L.LayerJSON({
          url: baseURL + "ajax_geo?bbox={bbox}" /*"ajax_geo?bbox={bbox}"*/ ,
          locAsGeoJSON: true /*locAsArray:true*/,
          onEachFeature: onEachFeature
        });

      leafletData.getMap().then(function(map) {
        map.addLayer(l);
      });


      l.on('dataloaded', function(e) { //show loaded data!
        $scope.reports = e.data.features;
      });


      l.on('layeradd', function(e) {
        e.layer.eachLayer(function(_layer) {
          var markerIcon = L.icon({
            iconUrl: baseURL + _layer.feature.properties.pin_url,
            iconSize: [29, 34],
            iconAnchor: [8, 8],
            popupAnchor: [0, -8]
          });
          _layer.setIcon(markerIcon);
          if ($scope.featureReports[_layer.feature.properties.id] === undefined) {
            $scope.featureReports[_layer.feature.properties.id] = _layer;
          }
        });

      });


    };

    $scope.goToReport = function(report) {

      var report_divs_active = document.getElementsByClassName("report-inside-list-active");
      if(report_divs_active.length > 0){
        report_divs_active[0].className = "report-inside-list";
      }
      var report_div = document.getElementById("report-container-"+report.properties.id);
      report_div.className = "report-inside-list-active";

      var layer = $scope.featureReports[report.properties.id];
      leafletData.getMap().then(function(map) {
        var coords = layer.getLatLng();
        var lat = coords.lat;
        //Move a little the map center because the map view is smaller (report list is displayed)
        lat = lat - 0.001;
        map.setView(new L.LatLng(lat, coords.lng), 18);
        layer.openPopup();
      });
    };

    $scope.newReport = function() {
      alert("Nuevo Reporte");
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


    $scope.itemsRemoved = function(callback) {
      $scope.removedValueModel = callback;
    };



    $scope.find_me = function(){
        $scope.set_active_option("button-find-me");
        document.getElementById("report-list-scroll").style.display = "none";
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
                $scope.map.center.lat  = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                LocationsService.save_new_report_position(position.coords.latitude,position.coords.longitude)
                $scope.map.center.zoom = 18;

                $scope.map.markers.now = {
                  lat:position.coords.latitude,
                  lng:position.coords.longitude,
                  message: "<p align='center'>Te encuentras aquí <br/> <a ng-click='new_report(1);'>Iniciar reporte en tu posición actual</a></p>",
                  focus: true,
                  draggable: false,
                  getMessageScope: function() { return $scope; }
                };
                //$scope.map.markers.now.openPopup();
              }, function(err) {
                // error
                //console.log("Location error!");
                //console.log(err);
              });

          };

          var Location = function() {
        if ( !(this instanceof Location) ) return new Location();
        this.lat  = "";
        this.lng  = "";
        this.name = "";
      };



      /**
       * Detect user long-pressing on map to add new location
       */
      $scope.$on('leafletDirectiveMap.contextmenu', function(event, locationEvent){
        LocationsService.save_new_report_position(locationEvent.leafletEvent.latlng.lat,locationEvent.leafletEvent.latlng.lng)
        $scope.new_report(1);
      });


  }
]);
