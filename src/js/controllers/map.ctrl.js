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
  '$cordovaNetwork',
  'PopUpService',
  '$ionicPlatform',
  'ConnectivityService',
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
    $ionicScrollDelegate,
    $cordovaNetwork,
    PopUpService,
    $ionicPlatform,
    ConnectivityService
  ) {

    /**
     * Once state loaded, get put map on scope.
     */
    $scope.featureReports = {};
    $scope.baseURL = ConfigService.baseURL;

    $scope.$on("$ionicView.beforeEnter", function() {
      DBService.initDB();
      if(ConnectivityService.isOnline()){
        $scope.check_user_logged();
        $scope.send_offline_reports();
      }
      $scope.set_network_events();
    });

    $scope.set_network_events = function() {
      if(ionic.Platform.isWebView()){
        $scope.$on('$cordovaNetwork:online', function(event, networkState){
          $scope.check_user_logged();
          $scope.send_offline_reports();
          $scope.addReportsLayer();
        });
        $scope.$on('$cordovaNetwork:offline', function(event, networkState){
          $scope.create_offline_map();
        });
      }
      else {
        window.addEventListener("online", function(e) {
          $scope.check_user_logged();
          $scope.send_offline_reports();
          $scope.addReportsLayer();
        }, false);
        window.addEventListener("offline", function(e) {
          $scope.create_offline_map();
        }, false);
      }
    }

    $scope.send_offline_reports = function() {
      var reports = DBService.getAllReports();
      reports.then(function (result) {
        // handle result
        if(result!=null && result.total_rows>0){
          result.rows.forEach(function(row) {
              var report = row.doc;
              var report_sent = PMBService.report(report);
              if(report.file==null){
                report_sent.success(function(data, status, headers,config){
                  if(ErrorService.http_data_response_is_successful_ajax(data)){
                    DBService.deleteReport(report._id);
                  }else{
                    //ERROR SENDING THE REPORT;
                  }
                })
                .error(function(data, status, headers, config){
                  //ERROR SENDING THE REPORT;
                })
              }else{
                report_sent.then(function(resp) {
                  var data = JSON.parse(resp.response);
                  if(ErrorService.http_data_response_is_successful_ajax(data)){
                    DBService.deleteReport(report._id);
                  }else{
                    //ERROR SENDING THE REPORT;
                  }
                }, function(error) {
                    //ERROR SENDING THE REPORT;
                }, function(progress) {
                });
              }
          });
        }

      }).catch(function (err) {
        //console.log(err);
      });
    }

    $scope.send_offline_report = function(report) {
      var report_sent = PMBService.report(report);
      if(report.file==null){
        report_sent.success(function(data, status, headers,config){
          if(ErrorService.http_data_response_is_successful_ajax(data)){
            return true;
          }else{
            return false;
          }
        })
        .error(function(data, status, headers, config){
          return false;
        })
      }else{
        report_sent.then(function(resp) {
          var data = JSON.parse(resp.response);
          if(ErrorService.http_data_response_is_successful_ajax(data)){
            return true;
          }else{
            return false;
          }
        }, function(error) {
            return false;
        }, function(progress) {
        });
      }
  };

    $scope.create_offline_map = function(){
      $scope.map = {
          defaults: {
            tileLayer: './offline_tiles/{z}/{x}/{y}.png',
            //minZoom: 12,
            minZoom: 16,
            maxZoom: 16,
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
    };

    $scope.create_online_map = function(){
      $scope.map = {
        defaults: {
          tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          minZoom: 12,
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
    };

    $scope.$on("$ionicView.afterEnter", function() {
      //document.getElementById("spinner").style.display = "none";
      document.getElementById("foot_bar").style.display = "block";
      if(ConnectivityService.isOnline()){
        $scope.create_online_map();
        $scope.addReportsLayer();
        //$scope.addMapControls();
      }else{
        $scope.create_offline_map();
      }

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
      $scope.hide_special_divs();
      if(alreadyLocated==1){
        document.getElementById("spinner").style.display = "block";
        if(ConnectivityService.isOnline()){
          $scope.report = ReportService._new();
          $scope.report.lat = LocationsService.new_report_lat;
          $scope.report.lon = LocationsService.new_report_lng;
          CategoriesService.all().then(function (response) {
            if(ErrorService.http_response_is_successful_popup(response)){
              DBService.saveCategories(response.data);
              $scope.show_report_form(response.data.categories);
            }else{
              document.getElementById("spinner").style.display = "none";
            }
          })
        }else{
          //OFFLINE REPORT. First need to check if there is any cached categories. If not, it's the first time
          //runing the app so need to show message saying that first time report has to be online.
          var categoriesDoc = CategoriesService.getCachedCategories();
          categoriesDoc.then(function(doc){
            if(doc!=null){
              $scope.report = ReportService._new();
              $scope.report.lat = LocationsService.new_report_lat;
              $scope.report.lon = LocationsService.new_report_lng;
              $scope.show_report_form(doc.categories)
            }else{
              //First time report
              document.getElementById("spinner").style.display = "none";
              PopUpService.show_alert('Primer reporte','La primera vez que realiza un reporte debe encontrarse conectado a internet.');
            }
          });
        }
      }else{
        PopUpService.show_alert('Nuevo reporte','Para realizar un nuevo reporte, mantén presionado sobre la ubicación deseada.');
      }
    };

    $scope.editOfflineReport = function(reportId) {
        $scope.set_active_option('button-report');
        $scope.hide_special_divs();
          document.getElementById("spinner").style.display = "block";
            //OFFLINE REPORT. First need to check if there is any cached categories. If not, it's the first time
            //runing the app so need to show message saying that first time report has to be online.
            var categoriesDoc = CategoriesService.getCachedCategories();
            categoriesDoc.then(function(doc){
              if(doc!=null){
                $scope.report =  $scope.offlineReports[reportId];
                //$scope.report.categorygroup = "Plantación";
                //console.log($scope.report);
                //$scope.report.file = "file:///home/lito/Im%C3%A1genes/MapaMelillaSeccional22.png";
                $scope.show_offline_report_form(doc.categories)
              }else{
                //First time report
                document.getElementById("spinner").style.display = "none";
                PopUpService.show_alert('Primer reporte','La primera vez que realiza un reporte debe encontrarse conectado a internet.');
              }
            });

      };

  $scope.deleteOfflineReport = function(reportId) {
    //$scope.set_active_option('button-report');
    $scope.hide_special_divs();
    document.getElementById("spinner").style.display = "block";
    $scope.report =  $scope.offlineReports[reportId];
    $ionicModal.fromTemplateUrl('templates/delete-offline-report.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.new_report_modal = modal;
        document.getElementById("spinner").style.display = "none";
        document.getElementById("foot_bar").style.display = "none";
        $scope.new_report_modal.show();
      });
  };

  $scope.updateOfflineReport = function(){
    var fields = new Array();
    fields.push($scope.create_field_array("Email","email",$scope.report.email));
    fields.push($scope.create_field_array("Contraseña","notNull",$scope.report.password_sign_in));
    fields.push($scope.create_field_array("Seleccione una subcategoría","notNull",$scope.report.category));
    fields.push($scope.create_field_array("Título","notNull",$scope.report.title));
    fields.push($scope.create_field_array("Detalles","notNull",$scope.report.detail));
    if(ErrorService.check_fields(fields,"error_container")){
      DBService.updateReport($scope.report).then(function(){
        $scope.back_to_map(true);
        PopUpService.show_alert("Envío pendiente","Se han guardado los cambios al reporte. Se enviará cuando utilice esta aplicación conectado a internet");
        $scope.list_reports();
        $scope.offlineReportsMarkers[$scope.report._id].openPopup();
      });
    }else{
      $scope.back_to_map(false);
    }
  }

  $scope.deleteOfflineReportOk = function(){
    DBService.deleteGivenReport($scope.report).then(function(){
      $scope.back_to_map(true);
      $scope.list_reports();
    });
  }

  $scope.show_report_form = function(categories){
    $scope.categories = categories;
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
  }

  $scope.show_offline_report_form = function(categories){
    $scope.categories = categories;
    document.getElementById("spinner").style.display = "none";
    document.getElementById("foot_bar").style.display = "none";
    if(UserService.isLogged()){
      $scope.report.name = UserService.name;
      $scope.report.email = UserService.email;
      $scope.report.password_sign_in = UserService.password;
      $scope.report.phone = UserService.phone;
      $ionicModal.fromTemplateUrl('templates/pmb-offline-wizard.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
          $scope.new_report_modal = modal;
          $scope.new_report_modal.show();
        });
    }else{
      $ionicModal.fromTemplateUrl('templates/pmb-offline-wizard.html', { //Se llama siempre al form que no pide usuario porque ya se guardó el usuario la primera vez
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
          $scope.new_report_modal = modal;
          $scope.new_report_modal.show();
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
    if(ConnectivityService.isOnline()){
      var fields = new Array();
      fields.push($scope.create_field_array("Seleccione una subcategoría","notNull",$scope.report.category));
      fields.push($scope.create_field_array("Título","notNull",$scope.report.title));
      fields.push($scope.create_field_array("Detalles","notNull",$scope.report.detail));
      if(ErrorService.check_fields(fields,"error_container")){
        var report_sent = PMBService.report($scope.report);
        var back_to_map = false;
        document.getElementById("spinner-inside-modal").style.display = "block";
        if($scope.report.file==null){
          report_sent.success(function(data, status, headers,config){
            if(ErrorService.http_data_response_is_successful(data,"error_container")){
              $scope.back_to_map(true);
              $scope.addReportsLayer();
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
              $scope.addReportsLayer();
            }else{
              $scope.back_to_map(false);
            }
          }, function(error) {
            ErrorService.show_error_message("error_container","Hubo un error en el envío: Código = " + error.code);
            $scope.back_to_map(false);
          }, function(progress) {
            $timeout(function() {
              $scope.uploadProgress = (progress.loaded / progress.total) * 100;
              document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
            });
          });
        }
      }else{
        $scope.back_to_map(false);
      }
    }else{
      $scope.save_offline_report().then(function(response){
        $scope.back_to_map(true);
        //$scope.list_reports_and_go(response.id);
        $scope.list_reports();
        PopUpService.show_alert("Envío pendiente","El reporte se ha guardado en su dispositivo y se enviará cuando utilice esta aplicación conectado a internet");
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
    if(ConnectivityService.isOnline()){
      document.getElementById("spinner-inside-modal").style.display = "block";

      var fields = new Array();
      fields.push($scope.create_field_array("Email","email",$scope.report.email));
      fields.push($scope.create_field_array("Contraseña","notNull",$scope.report.password_sign_in));
      fields.push($scope.create_field_array("Seleccione una subcategoría","notNull",$scope.report.category));
      fields.push($scope.create_field_array("Título","notNull",$scope.report.title));
      fields.push($scope.create_field_array("Detalles","notNull",$scope.report.detail));
      if(ErrorService.check_fields(fields,"error_container")){
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
          ErrorService.show_error_message("error_container",resp.statusText);
          $scope.back_to_map(false);
        });
      }else{
        $scope.back_to_map(false);
      }
    }else{
      $scope.save_offline_report().then(function(response){
        $scope.back_to_map(true);
        //$scope.list_reports_and_go(response.id);
        $scope.list_reports();
        PopUpService.show_alert("Envío pendiente","El reporte se ha guardado en su dispositivo y se enviará cuando utilice esta aplicación conectado a internet");
      });
    }
  };

  $scope.save_offline_report = function(){
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    month = month + 1;
    var year = date.getFullYear();
    $scope.report.date = day + "/" + month + "/" + year;
    return DBService.saveReport($scope.report);
  }

  $scope.back_to_map = function(back_to_map){
    if(back_to_map){
      //LocationsService.initial_lat = $scope.report.lat;
      //LocationsService.initial_lng = $scope.report.lon;
      $scope.new_report_modal.hide();
      $scope.new_report_modal.remove();
      document.getElementById("foot_bar").style.display = "block";
      document.getElementById("spinner-inside-modal").style.display = "none";
      //$scope.addReportsLayer();
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
      document.getElementById("user-options-menu").style.display="none";
      if(ConnectivityService.isOnline()){
        //SHOW ONLINE REPORTS (logic inside template map.html)
        document.getElementById("report-list-scroll").style.display = "block";
      }else{
        //SHOW OFFLINE REPORTS
        leafletData.getMap().then(function(map) {
          map.eachLayer(function (layer) {
            if(layer._url!="undefined" && layer._url!=null){
              //IT's THE MAP ITSELF
            }else{
              map.removeLayer(layer);
            };
          });
          var reports = DBService.getAllReports();
          var div = '<div id="report-list-offline">';
          $scope.offlineReports = new Array();
          $scope.offlineReportsMarkers = new Array();
          reports.then(function (result) {
            // handle result
            div = div + '<h3><b>Reportes guardados en el dispositivo y pendientes de envío:</b></h3>';
            if(result!=null && result.rows.length>0){
              result.rows.forEach(function(row) {
                  var report = row.doc;
                  $scope.offlineReports[report._id]=report;
                  div = div + $scope.add_offline_report_div(report);
                  var marker = L.marker([report.lat, report.lon]).addTo(map);
                  var markerHTML = '<a class="text report-link" ng-click="editOfflineReport(\'' + report._id + '\')"><p>' + report.title + '</p></a><p class="offline-pending">(pendiente de envío)</p>';
                  var compiled = $compile(markerHTML)($scope);
                  marker.bindPopup(compiled[0]);
                  $scope.offlineReportsMarkers[report._id]=marker;
              });
            }else{
              div = div + '<br/><h3>No hay ningún reporte pendiente de envío.</h3>';
            }
            div = div + '</div>';
            var element = angular.element( document.querySelector( '#offline-report-list-scroll' ) );
            element.html(div);
            var compiled = $compile(element.contents())($scope);
          }).catch(function (err) {
            div = div + '<br/><h3>No hay ningún reporte pendiente de envío.</h3>';
            div = div + '</div>';
          });
          document.getElementById("offline-report-list-scroll").style.display = "block";
        });

      }
    };

    $scope.list_reports_and_go = function(reportId) {
      $scope.set_active_option('button-list-reports');
      document.getElementById("user-options-menu").style.display="none";
      if(ConnectivityService.isOnline()){
        //SHOW ONLINE REPORTS (logic inside template map.html)
        document.getElementById("report-list-scroll").style.display = "block";
      }else{
        //SHOW OFFLINE REPORTS
        leafletData.getMap().then(function(map) {
          map.eachLayer(function (layer) {
            if(layer._url!="undefined" && layer._url!=null){
              //IT's THE MAP ITSELF
            }else{
              map.removeLayer(layer);
            };
          });
          var reports = DBService.getAllReports();
          var div = '<div id="report-list-offline">';
          $scope.offlineReports = new Array();
          $scope.offlineReportsMarkers = new Array();
          reports.then(function (result) {
            // handle result
            div = div + '<h3><b>Reportes guardados en el dispositivo y pendientes de envío:</b></h3>';
            if(result!=null && result.rows.length>0){
              result.rows.forEach(function(row) {
                  var report = row.doc;
                  $scope.offlineReports[report._id]=report;
                  div = div + $scope.add_offline_report_div(report);
                  var marker = L.marker([report.lat, report.lon]).addTo(map);
                  var markerHTML = '<a class="text report-link" ng-click="editOfflineReport(\'' + report._id + '\')"><p>' + report.title + '</p></a><p class="offline-pending">(pendiente de envío)</p>';
                  var compiled = $compile(markerHTML)($scope);
                  marker.bindPopup(compiled[0]);
                  $scope.offlineReportsMarkers[report._id]=marker;
                  if(report._id == reportId){
                    goToOfflineReport(reportId);
                  }
              });
            }else{
              div = div + '<br/><h3>No hay ningún reporte pendiente de envío.</h3>';
            }
            div = div + '</div>';
            var element = angular.element( document.querySelector( '#offline-report-list-scroll' ) );
            element.html(div);
            var compiled = $compile(element.contents())($scope);
          }).catch(function (err) {
            div = div + '<br/><h3>No hay ningún reporte pendiente de envío.</h3>';
            div = div + '</div>';
          });
          document.getElementById("offline-report-list-scroll").style.display = "block";
        });

      }
    };

    $scope.goToOfflineReport = function(reportId){
      var report = $scope.offlineReports[reportId];
      leafletData.getMap().then(function(map) {
        var lat = report.lat;
        //Move a little the map center because the map view is smaller (report list is displayed)
        lat = lat - 0.001;
        $scope.map.center.lat = lat;
        $scope.map.center.lng = report.lon;
        map.setView(new L.LatLng(lat, report.lon), 16);
        $scope.offlineReportsMarkers[reportId].openPopup();
      });

    }

    $scope.add_offline_report_div = function(report){
      var div = '<div id="report-container-' + report._id + '" ng-click="goToOfflineReport(\''+report._id+'\')" class="report-inside-list-offline">';
      div = div + '<div class="report-in-list-icon-offline"></div>';
      div = div + '<div class="report-in-list-info">';
      div = div + '<p id="report-title-'+report._id+'" class="report-in-list-title">'+report.title+'</p>';
      div = div + '<p id="report-category-'+report._id+'" class="report-in-list-category">'+report.category+'</p>';
      div = div + '<p id="report-date-'+report._id+'" class="report-in-list-date">'+report.date+'</p>';
      div = div + '<p id="report-date-'+report._id+'" class="report-in-list-actions">'+'<a ng-click="editOfflineReport(\''+report._id+'\')">Editar</a>'+'&nbsp; <a ng-click="deleteOfflineReport(\''+report._id+'\')">Eliminar</a></p>';
      div = div + '<div class="report-mini-icons">';
      if(report.file != null && report.file != "undefined"){
        div = div + '<img class="report-mini-icon" src="./img/icon-camera.png" />';
      }
      div = div + '<img class="report-mini-icon" src="./img/icon-tags.png" />';
      //TODO: Add actions div with "Edit", "Delete"
      div = div + '</div></div></div>';
      return div;
    }

    $scope.help = function() {
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner").style.display = "block";
        $scope.set_active_option('button-faq');
        $scope.hide_special_divs();
        FaqService.all().success(function (response) {
          $scope.faq = $sce.trustAsHtml(response);
          document.getElementById("spinner").style.display = "none";
          $ionicModal.fromTemplateUrl('templates/faq.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
              $scope.faq_modal = modal;
              $scope.faq_modal.show().then(function(){
                var element = angular.element( document.querySelector( '#faq-container-div' ) );
                var compiled = $compile(element.contents())($scope);
              })
            });
        })
      }else{
        PopUpService.show_alert("Sin conexión a internet","Para ver la ayuda debe estar conectado a internet");
      }

    }

    $scope.scrollMe = function(anchor_id){
      $location.hash(anchor_id);
      var handle  = $ionicScrollDelegate.$getByHandle('content');
      handle.anchorScroll();
    }

    $scope.close_faq_modal = function(){
      $scope.faq_modal.hide();
      $scope.faq_modal.remove();
    }

    $scope.set_active_option = function(buttonid) {
      document.getElementById("button-report").className = "option-inactive";
      document.getElementById("button-list-reports").className = "option-inactive";
      document.getElementById("button-faq").className = "option-inactive";
      document.getElementById("button-find-me").className = "option-inactive";
      document.getElementById(buttonid).className = "option-active";
    }

    $scope.hide_special_divs = function(){
      document.getElementById("report-list-scroll").style.display = "none";
      document.getElementById("offline-report-list-scroll").style.display = "none";
      document.getElementById("user-options-menu").style.display="none";
    }

    $scope.viewReportDetails = function(id){
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner").style.display = "block";
        $scope.hide_special_divs();
        ReportService.getById(id).then(function(resp) {
          $scope.report_detail = $sce.trustAsHtml(resp.data.replace("overflow:auto;",""));
          document.getElementById("spinner").style.display = "none";
          $ionicModal.fromTemplateUrl('templates/report-detail.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
              $scope.report_detail_modal = modal;
              $scope.report_detail_modal.show()
            });
        }, function(resp) {
          //console.log(err);
          document.getElementById("spinner").style.display = "none";
          ErrorService.show_error_message_popup("ERROR AL CARGAR DATOS DEL REPORTE: " + resp.statusText)
        });
      }else{
        PopUpService.show_alert("Sin conexión a internet","Para ver los detalles del reporte, debe estar conectado a internet.");
      }

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


    /*$scope.getReports = function() {

      leafletData.getMap().then(function(map) {
        var bbox = map.getBounds();
        //Console.log(bbox);

        PMBService.around(bbox).then(function(data) {
          for (var i = 0; i < data.length; i++) {
            //console.log("pin " + i + "=" + data[i]);
          }
        });
      });
    };*/

    /*$scope.addMapControls = function() {
      var _crosshair, _crosshairIcon = L.icon({
        iconUrl: 'img/crosshairs@x2.png' //,
      });

      leafletData.getMap().then(function(map) {
      });
    };*/

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
      var menu = document.getElementById("user-options-menu");
      if(menu.style.display=="block"){
        menu.style.display = "none";
      }else{
        var name = UserService.name;
        if(name==null){
          //No esta logueado
          $scope.show_anonymous_menu();
        }else{
          //Está logueado
          $scope.show_user_menu();
        }
      }
    }

    $scope.show_anonymous_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = "<div id='auth_options'><div class='nonauth-link' ng-click='show_login_modal()'>Iniciar sesión</div>";
      html = html + "<div class='nonauth-link' ng-click='show_sign_up_modal()'>Registrarse</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.display = "block";
    }

    $scope.show_user_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = UserService.name + "<div id='auth_options'><div class='user-logged-link' ng-click='show_edit_profile_modal()'>Mi perfil</div>";
      html = html + "<div class='user-logged-link' ng-click='sign_out()'>Cerrar sesión</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.display = "block";
    };

    $scope.create_field_array = function(name,type,value){
      var field = new Array();
      field.name = name;
      field.type = type;
      field.value = value;
      return field;
    };

    $scope.sign_in = function(email, password){
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner-inside-modal").style.display = "block";
        var fields = new Array();
        fields.push($scope.create_field_array("Email","email",email));
        fields.push($scope.create_field_array("Contraseña","notNull",password));
        if(ErrorService.check_fields(fields,"error_container")){
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
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }

      }else{
        PopUpService.show_alert("Sin conexión a internet","Para iniciar sesión debe estar conectado a internet");
      }
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
        //ErrorService.show_error_message_popup(resp.statusText);
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
              $scope.hide_special_divs();
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
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner-inside-modal").style.display = "block";
        var fields = new Array();
        fields.push($scope.create_field_array("Correo electrónico","email",new_email));
        //fields.push($scope.create_field_array("Contraseña","notNull",password));
        fields.push($scope.create_field_array("Cédula de Identidad","iddoc_uy",id_doc));
        fields.push($scope.create_field_array("Nombre y apellido","two_words",fullname));
        if(ErrorService.check_fields(fields,"error_container")){
          var edit_request = AuthService.edit_user(email,password, fullname, new_email, id_doc, user_phone, user_picture_url);
          if(user_picture_url==null || user_picture_url==""){
            edit_request.success(function(data, status, headers,config){
              document.getElementById("sent_label").innerHTML = "Enviado: 100%";
              //console.log(data);
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
              ErrorService.show_error_message("error_container",status);
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
            }, function(error) {
              ErrorService.show_error_message("error_container","Hubo un error en el envío: Código = " + error.code);
              document.getElementById("spinner-inside-modal").style.display = "none";
            }, function(progress) {
                $timeout(function() {
                  $scope.uploadProgress = (progress.loaded / progress.total) * 100;
                  document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
                });
            });
          }
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }
      }else{
        PopUpService.show_alert("Sin conexión a internet","Para editar su perfil debe estar conectado a internet");
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
            $scope.hide_special_divs();
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
            $scope.hide_special_divs();
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
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner-inside-modal").style.display = "block";
        var fields = new Array();
        fields.push($scope.create_field_array("Correo electrónico","email",email));
        fields.push($scope.create_field_array("Contraseña","notNull",password));
        fields.push($scope.create_field_array("Cédula de Identidad","iddoc_uy",id_doc));
        fields.push($scope.create_field_array("Nombre y apellido","two_words",fullname));
        if(ErrorService.check_fields(fields,"error_container")){
          AuthService.create_user(email,fullname,password, id_doc, user_phone).then(function(resp) {
            if(ErrorService.http_response_is_successful(resp,"error_container")){
              UserService.save_user_data(fullname, email, password, id_doc, user_phone,null);
              //$scope.set_user_picture(1);
              document.getElementById("spinner-inside-modal").style.display = "none";
              $scope.close_sign_up_modal();
              var alertPopup = $ionicPopup.alert({
               title: "Usuario creado con éxito",
               template: resp.data.message
              });
              alertPopup.then(function(res) {
                //return false;
              });
              //$scope.check_user_logged();
            }else{
              document.getElementById("spinner-inside-modal").style.display = "none";
            }
          }, function(resp) {
            document.getElementById("spinner-inside-modal").style.display = "none";
            ErrorService.show_error_message("error_container",resp.statusText);
          });
        }else{
          document.getElementById("spinner-inside-modal").style.display = "none";
        }
      }else{
        PopUpService.show_alert("Sin conexión a internet","Para iniciar registrarse debe estar conectado a internet");
      }
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
        if(UserService.picture_url!=null && UserService.picture_url!=""){
          picture.style.backgroundImage = "url(" + UserService.picture_url + ")";
        }else{
          picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
        }
      }

    }

    $scope.find_me = function(){
        $scope.set_active_option("button-find-me");
        $scope.hide_special_divs();
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
                $scope.map.center.lat  = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                LocationsService.save_new_report_position(position.coords.latitude,position.coords.longitude);
                if(ConnectivityService.isOnline()){
                  $scope.map.center.zoom = 18;
                }else{
                  $scope.map.center.zoom = 16;
                }
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
                ErrorService.show_error_message_popup("No hemos podido geolocalizarlo. ¿Tal vez olvidó habilitar los servicios de localización en su dispositivo?")
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
        $scope.hide_special_divs();
        LocationsService.save_new_report_position(locationEvent.leafletEvent.latlng.lat,locationEvent.leafletEvent.latlng.lng);
        $scope.new_report(1);
      });


  }
]);
