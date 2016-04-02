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
  'ConfigService',
  'PMBService',
  'LocationsService',
  'ReportService',
  'FaqService',
  'CategoriesService',
  'AuthService',
  'UserService',
  'DBService',
  '$timeout',
  '$location',
  'ErrorService',
  '$ionicSlideBoxDelegate',
  '$anchorScroll',
  '$ionicScrollDelegate',
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
    ConfigService,
    PMBService,
    LocationsService,
    ReportService,
    FaqService,
    CategoriesService,
    AuthService,
    UserService,
    DBService,
    $timeout,
    $location,
    ErrorService,
    $ionicSlideBoxDelegate,
    $anchorScroll,
    $ionicScrollDelegate
  ) {

    /**
     * Once state loaded, get put map on scope.
     */
    $scope.featureReports = {};
    $scope.baseURL = ConfigService.baseURL;

    $scope.$on("$ionicView.loaded", function() {
      DBService.initDB();
      $scope.check_user_logged();
    });


    $scope.$on("$ionicView.afterEnter", function() {
      //document.getElementById("spinner").style.display = "none";
      document.getElementById("foot_bar").style.display = "block";
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
        CategoriesService.all().then(function (response) {
          if(ErrorService.http_response_is_successful_popup(response)){
            $scope.categories = response.data.categories;
            document.getElementById("spinner").style.display = "none";
            document.getElementById("foot_bar").style.display = "none";
            if(UserService.isLogged()){
              $scope.report.name = UserService.name;
              $scope.report.email = UserService.email;
              $scope.report.password_sign_in = UserService.password;
              $scope.report.phone = UserService.phone;
              $ionicModal.fromTemplateUrl('templates/pmb-wizard.html', {
                scope: $scope,
                animation: 'slide-in-up'
              }).then(function(modal) {
                  $scope.new_report_modal = modal;
                  $scope.new_report_modal.show();
                });
            }else{
              $ionicModal.fromTemplateUrl('templates/pmb-wizard-with-login.html', {
                scope: $scope,
                animation: 'slide-in-up'
              }).then(function(modal) {
                  $scope.new_report_modal = modal;
                  $scope.new_report_modal.show();
                });

            }
          }else{
            document.getElementById("spinner").style.display = "none";
          }
        })
      }else{
        var alertPopup = $ionicPopup.alert({
         title: 'Nuevo reporte',
         template: 'Para realizar un nuevo reporte, mantén presionado sobre la ubicación deseada.'
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
    document.getElementById("spinner-inside-modal").style.display = "block";
    if($scope.report.file==null){
      report_sent.success(function(data, status, headers,config){
        if(ErrorService.http_data_response_is_successful(data,"error_container")){
          $scope.back_to_map(true);
        }else{
          $scope.back_to_map(false);
        }
      })
      .error(function(data, status, headers, config){
        ErrorService.show_error_message("error_container",status);
        $scope.back_to_map(false);
      })
    }else{
      report_sent.then(function(resp) {
        var data = JSON.parse(resp.response);
        if(ErrorService.http_data_response_is_successful(data,"error_container")){
          $scope.back_to_map(true);
        }else{
          $scope.back_to_map(false);
        }
      }, function(resp) {
        ErrorService.show_error_message("error_container",resp.responseCode);
        $scope.back_to_map(false);
      }, function(progress) {
        $timeout(function() {
          $scope.uploadProgress = (progress.loaded / progress.total) * 100;
          document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
        });
      });
    }
  };

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };

  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  $scope.confirmReportWithLogin = function() {
    document.getElementById("spinner-inside-modal").style.display = "block";
    AuthService.sign_in($scope.report.password_sign_in, $scope.report.email).then(function(resp) {
      if(ErrorService.http_response_is_successful(resp,"error_container")){
        UserService.save_user_data(resp.data.name, $scope.report.email, $scope.report.password_sign_in, resp.data.identity_document, resp.data.phone, resp.data.picture_url);
        DBService.saveUser(resp.data.name,$scope.report.email,$scope.report.password_sign_in,resp.data.identity_document,resp.data.phone,resp.data.picture_url);
        $scope.set_user_picture(1);
        $scope.confirmReport();
      }else{
        $scope.back_to_map(false);
      }

    }, function(resp) {
      //console.log(err);
      ErrorService.show_error_message_ajax("error_container",resp.statusText);
      $scope.back_to_map(false);
    });

  };

  $scope.back_to_map = function(back_to_map){
    if(back_to_map){
      //LocationsService.initial_lat = $scope.report.lat;
      //LocationsService.initial_lng = $scope.report.lon;
      $scope.new_report_modal.hide();
      $scope.new_report_modal.remove();
      document.getElementById("foot_bar").style.display = "block";
      document.getElementById("spinner-inside-modal").style.display = "none";
      $scope.addReportsLayer();
    }else{
      document.getElementById("spinner-inside-modal").style.display = "none";
    }
  }

  $scope.cancelReport = function(){
    $scope.new_report_modal.hide();
    $scope.new_report_modal.remove();
    document.getElementById("foot_bar").style.display = "block";
  }

  $scope.image = null;

  $scope.addImage = function(isFromAlbum, isUserPhoto) {

    $scope.isUserPhoto = isUserPhoto;

    var source = Camera.PictureSourceType.CAMERA;
    var fix_orientation = true;
    var save_to_gallery = true;
    if(isFromAlbum==1){
      source = Camera.PictureSourceType.PHOTOLIBRARY;
      fix_orientation = false;
      save_to_gallery = false;
    }

    var options = {
      quality: 90,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: true,
      correctOrientation : fix_orientation,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: save_to_gallery,
      targetWidth: 200,
      targetHeight: 200
    };


    $cordovaCamera.getPicture(options).then(function(imageData) {
      onImageSuccess(imageData);

      function onImageSuccess(fileURI) {
        window.FilePath.resolveNativePath(fileURI, function(result) {
          // onSuccess code
          fileURI = 'file://' + result;
          if($scope.isUserPhoto==1){
            //UserService.add_photo(fileURI);
            $scope.profile.picture_url = fileURI;
          }else{
            $scope.report.file = fileURI;
          }
          $scope.imgURI = fileURI;
          //createFileEntry(fileURI);
        }, function(error) {
          alert("Error resolveNativePath" + error);
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
        $scope.faq = $sce.trustAsHtml(response);
        document.getElementById("spinner").style.display = "none";
        $scope.faq_modal.show().then(function(){
          var element = angular.element( document.querySelector( '#faq-container-div' ) );
          var compiled = $compile(element.contents())($scope);
        })
      })
    }

    $scope.scrollMe = function(anchor_id){
      $location.hash(anchor_id);
      var handle  = $ionicScrollDelegate.$getByHandle('content');
      handle.anchorScroll();
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
      });
    };

    $scope.addReportsLayer = function() {

      var baseURL = ConfigService.baseURL;
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

    $scope.user_options = function(){
      var name = UserService.name;
      if(name==null){
        //No esta logueado
        $scope.show_anonymous_menu();
      }else{
        //Está logueado
        $scope.show_user_menu();
      }
    }

    $scope.show_anonymous_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = "<div id='auth_options'><a ng-click='show_login_modal()'>Iniciar sesión</a>";
      html = html + "<br/><br/><a ng-click='show_sign_up_modal()'>Registrarse</a></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.display = "block";
    }

    $scope.show_user_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = UserService.name + "<div id='auth_options'><a ng-click='show_edit_profile_modal()'>Mi perfil</a>";
      html = html + "<br/><br/><a ng-click='sign_out()'>Cerrar sesión</a></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.display = "block";
    }

    $scope.sign_in = function(email, password){
      document.getElementById("spinner-inside-modal").style.display = "block";
      AuthService.sign_in(password, email).then(function(resp) {
        if(ErrorService.http_response_is_successful(resp,"error_container")){
          UserService.save_user_data(resp.data.name, email, password, resp.data.identity_document, resp.data.phone, resp.data.picture_url);
          DBService.saveUser(resp.data.name,email,password,resp.data.identity_document,resp.data.phone,resp.data.picture_url);
          //$scope.set_user_picture(1);
          document.getElementById("spinner-inside-modal").style.display = "none";
          $scope.close_login_modal();
          //$scope.check_user_logged();
          $scope.set_user_picture(1);
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }
      }, function(resp) {
        //console.log(err);
        //alert("Error en sign_in");
        document.getElementById("spinner-inside-modal").style.display = "none";
        ErrorService.show_error_message("error_container",resp.statusText);
      });
    }

    $scope.sign_in_ajax = function(email, password){
      AuthService.sign_in(password, email).then(function(resp) {
        if(ErrorService.http_response_is_successful_ajax(resp)){
          UserService.save_user_data(resp.data.name, email, password, resp.data.identity_document, resp.data.phone, resp.data.picture_url);
          DBService.saveUser(resp.data.name,email,password,resp.data.identity_document,resp.data.phone,resp.data.picture_url);
          $scope.set_user_picture(1);
          return 1;
        }else{
          return 0;
        }

      }, function(resp) {
        //console.log(err);
        ErrorService.show_error_message_ajax("error_container",resp.statusText);
        return 0;
      });
    }

    $scope.sign_out = function(){
      UserService.erase_user_data();
      DBService.eraseUser();
      document.getElementById("spinner").style.display = "none";
      $scope.set_user_picture(0);
      document.getElementById("user-options-menu").style.display="none";
    }

    $scope.show_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a edit_profile_ok
      $scope.profile = new Array();
      $scope.profile.email = UserService.email;
      $scope.profile.password = "";
      $scope.profile.fullname = UserService.name;
      $scope.profile.new_email = UserService.email;
      $scope.profile.id_doc = UserService.identity_document;
      $scope.profile.telephone = UserService.phone;
      $scope.profile.picture_url = null;
      if(UserService.picture_url!=null){
        $scope.actual_photo = UserService.picture_url;
        $ionicModal.fromTemplateUrl('templates/edit_profile_with_photo.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
              document.getElementById("user-options-menu").style.display="none";
              $scope.edit_profile_modal = modal;
              document.getElementById("foot_bar").style.display = "none";
              $scope.edit_profile_modal.show();
          });
      }else{
        $scope.actual_photo = null;
        $ionicModal.fromTemplateUrl('templates/edit_profile.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
              document.getElementById("user-options-menu").style.display="none";
              $scope.edit_profile_modal = modal;
              document.getElementById("foot_bar").style.display = "none";
              $scope.edit_profile_modal.show();
          });
      }
    }

    $scope.close_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a update_user
      document.getElementById("foot_bar").style.display = "block";
      $scope.edit_profile_modal.hide();
      $scope.edit_profile_modal.remove();
    }

    $scope.edit_profile_ok = function(){
      $scope.edit_profile(UserService.email,UserService.password,$scope.profile.fullname,$scope.profile.new_email,$scope.profile.id_doc,$scope.profile.telephone,$scope.profile.picture_url);
    }

    $scope.edit_profile = function(email,password, fullname, new_email, id_doc, user_phone, user_picture_url){
      document.getElementById("spinner-inside-modal").style.display = "block";
      var edit_request = AuthService.edit_user(email,password, fullname, new_email, id_doc, user_phone, user_picture_url);
      if(user_picture_url==null || user_picture_url==""){
        edit_request.success(function(data, status, headers,config){
          document.getElementById("sent_label").innerHTML = "Enviado: 100%";
          console.log(data);
          if(ErrorService.http_data_response_is_successful(data,"error_container")){
            UserService.save_user_data(data.name, data.email, password, data.identity_document, data.phone, data.picture_url);
            document.getElementById("spinner-inside-modal").style.display = "none";
            $scope.close_edit_profile_modal();
            $scope.check_user_logged();
          }else{
            document.getElementById("spinner-inside-modal").style.display = "none";
          }
        })
        .error(function(data, status, headers,config){
          ErrorService.show_error_message_ajax("error_container",status);
          document.getElementById("spinner-inside-modal").style.display = "none";
        })
      }else{
        edit_request.then(function(result) {
          var data = JSON.parse(result.response);
          if(ErrorService.http_data_response_is_successful(data,"error_container")){
            UserService.save_user_data(data.name, data.email, password, data.identity_document, data.phone, data.picture_url);
            document.getElementById("spinner-inside-modal").style.display = "none";
            $scope.close_edit_profile_modal();
            $scope.check_user_logged();
          }else{
            document.getElementById("spinner-inside-modal").style.display = "none";
          }
        }, function(result) {
          ErrorService.show_error_message_ajax("error_container",result.responseCode);
          document.getElementById("spinner-inside-modal").style.display = "none";
        }, function(progress) {
            $timeout(function() {
              $scope.uploadProgress = (progress.loaded / progress.total) * 100;
              document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
            });
        });
      }
    }


    $scope.show_login_modal = function(){
      //Cargar el modal con el form de login y ahi llama al sign_in
      $scope.nonauth = new Array();
      $scope.nonauth.email = "";
      $scope.nonauth.password = "";
      $ionicModal.fromTemplateUrl('templates/log_in.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
            document.getElementById("user-options-menu").style.display="none";
            $scope.login_modal = modal;
            document.getElementById("foot_bar").style.display = "none";
            $scope.login_modal.show();
        });
    }

    $scope.login_ok = function(){
      $scope.sign_in($scope.nonauth.email,$scope.nonauth.password);
    }

    $scope.close_login_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      $scope.login_modal.hide();
      $scope.login_modal.remove();
    }



    $scope.show_sign_up_modal = function(){
      //cargar el modal con el form de sign_up y de ahi llamar al sign_up
      $scope.newuser = new Array();
      $scope.newuser.email = "";
      $scope.newuser.password = "";
      $scope.newuser.fullname = "";
      $scope.newuser.id_doc = "";
      $scope.newuser.telephone = "";
      $ionicModal.fromTemplateUrl('templates/sign_up.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
            document.getElementById("user-options-menu").style.display="none";
            $scope.sign_up_modal = modal;
            document.getElementById("foot_bar").style.display = "none";
            $scope.sign_up_modal.show();
        });
    }

    $scope.close_sign_up_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      $scope.sign_up_modal.hide();
      $scope.sign_up_modal.remove();
    }

    $scope.sign_up = function(email,fullname,password, id_doc, user_phone){
      document.getElementById("spinner-inside-modal").style.display = "block";
      AuthService.create_user(email,fullname,password, id_doc, user_phone).then(function(resp) {
        if(ErrorService.http_response_is_successful(resp,"error_container")){
          UserService.save_user_data(fullname, email, password, id_doc, user_phone,null);
          $scope.set_user_picture(1);
          document.getElementById("spinner-inside-modal").style.display = "none";
          $scope.close_sign_up_modal();
          $scope.check_user_logged();
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }
      }, function(resp) {
        document.getElementById("spinner-inside-modal").style.display = "none";
        ErrorService.show_error_message("error_container",resp.statusText);
      });
    }

    $scope.sign_up_ok = function(){
      $scope.sign_up($scope.newuser.email,$scope.newuser.fullname,$scope.newuser.password,$scope.newuser.id_doc,$scope.newuser.telephone);
    }

    $scope.check_user_logged = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              $scope.sign_in_ajax(doc.email, doc.password);
            }else{
              $scope.set_user_picture(0);
            }
          }).catch(function (err) {
            $scope.set_user_picture(0);
          });
      }else{
        //Está logueado
        if(UserService.picture_url==null || UserService.picture_url==""){
          //El usuario no tiene foto definida
          $scope.set_user_picture(0);
        }else{
          //El usuario tiene foto
          $scope.set_user_picture(1);
        }
      }
    }

    $scope.set_user_picture = function(hasPhoto){
      var picture = document.getElementById("user_picture");
      if(hasPhoto==0){
        picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
      }else{
        picture.style.backgroundImage = "url(" + UserService.picture_url + ")";
      }

    }

    $scope.find_me = function(){
        $scope.set_active_option("button-find-me");
        document.getElementById("report-list-scroll").style.display = "none";
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
                $scope.map.center.lat  = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                LocationsService.save_new_report_position(position.coords.latitude,position.coords.longitude);
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
