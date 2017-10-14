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
  '$ionicScrollDelegate',
  '$cordovaNetwork',
  'PopUpService',
  '$ionicPlatform',
  'ConnectivityService',
  '$cordovaInAppBrowser',
  '$interval',
  '$cordovaKeyboard',
  'MapService',
  'ModalService',
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
    $ionicScrollDelegate,
    $cordovaNetwork,
    PopUpService,
    $ionicPlatform,
    ConnectivityService,
    $cordovaInAppBrowser,
    $interval,
    $cordovaKeyboard,
    MapService,
    ModalService
  ) {

    /**
     * Once state loaded, get put map on scope.
     */
    $scope.featureReports = {};
    $scope.reportsByState = {};
    $scope.reportsVisible = {};
    $scope.baseURL = ConfigService.baseURL;
    $scope.user_cached_image = "";
    $scope.report_detail_id = null;
    $scope.one_value_popup = null;
    $scope.abuse_name = null;
    $scope.abuse_email = null;
    $scope.abuse_subject = null;
    $scope.abuse_message = null;

    $scope.$on("$ionicView.beforeEnter", function() {
      ModalService.checkNoModalIsOpen();
      DBService.initDB();
      if(ConnectivityService.isOnline()){
        $scope.check_user_logged();
        $scope.send_offline_reports();
      }else{
        $scope.set_offline_user();
      }
      $scope.set_network_events();
      var checkOfflineReports = $interval(function() {
        $scope.send_offline_reports();
      }, 60000);
      document.getElementById("foot_bar").style.display = "block";
      if(ConnectivityService.isOnline()){
        $scope.create_online_map();
      }else{
        $scope.create_offline_map();
      }
    });

    $scope.openWebsite = function(url) {
      var options = {
                location: 'no',
                clearcache: 'yes',
                toolbar: 'no'
            };

     $cordovaInAppBrowser.open(url, '_blank', options)
          .then(function(event) {
            // success
          })
          .catch(function(event) {
            // error
        });
    }

    $scope.set_network_events = function() {
      if(ionic.Platform.isWebView()){
        $scope.$on('$cordovaNetwork:online', function(event, networkState){
          $scope.check_user_logged();
          $scope.send_offline_reports();
          //$scope.addReportsLayer();
          $scope.create_online_map();

        });
        $scope.$on('$cordovaNetwork:offline', function(event, networkState){
          $scope.create_offline_map();
          $scope.set_offline_user();
        });
      }
      else {
        window.addEventListener("online", function(e) {
          $scope.check_user_logged();
          $scope.send_offline_reports();
          //$scope.addReportsLayer();
          $scope.create_online_map();
        }, false);
        window.addEventListener("offline", function(e) {
          $scope.create_offline_map();
          $scope.set_offline_user();
        }, false);
      }
    };

    $scope.send_offline_reports_from_menu = function() {
      if(ConnectivityService.isOnline()){
        $scope.send_offline_reports();
        $scope.list_offline_reports();
      }else{
        PopUpService.show_alert('Error de conexión','Para poder enviar los reportes pendientes debe estar conectado a internet.');
      }

    };

    $scope.send_offline_reports = function() {
      if(ConnectivityService.isOnline()){
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
      if($scope.map!=null){
        return false;
      }
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
        },
        center: {
        }
      };
      $scope.loadPinsLayer();
      $scope.map.center = {
          lat: -34.901113,
          lng: -56.164531,
          zoom: 16
        };
      leafletData.getMap().then(function(map) {
        map.on('moveend', $scope.hideOffScreenPins);
      });
    };


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
            if(doc && doc.categories && Object.keys(doc.categories).length>0){
              $scope.report = ReportService._new();
              $scope.report.lat = LocationsService.new_report_lat;
              $scope.report.lon = LocationsService.new_report_lng;
              $scope.show_report_form(doc.categories);
            }else{
              //First time report
              document.getElementById("spinner").style.display = "none";
              PopUpService.show_alert('Primer reporte','La primera vez que realiza un reporte debe encontrarse conectado a internet.');
            }
          }).catch(function (err) {
              //First time report
              document.getElementById("spinner").style.display = "none";
              PopUpService.show_alert('Primer reporte','La primera vez que realiza un reporte debe encontrarse conectado a internet.');
            });
        }
      }else{
        $scope.addMapControls();
        //PopUpService.show_alert('Nuevo reporte','Para realizar un nuevo reporte, mantén presionado sobre la ubicación deseada.');
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
              if(doc && doc.categories && Object.keys(doc.categories).length>0){
                $scope.report =  $scope.offlineReports[reportId];
                $scope.show_offline_report_form(doc.categories);
              }else{
                //First time report
                document.getElementById("spinner").style.display = "none";
                PopUpService.show_alert('Primer reporte','La primera vez que realiza un reporte debe encontrarse conectado a internet.');
              }
            }).catch(function (err) {
              //First time report
              document.getElementById("spinner").style.display = "none";
              PopUpService.show_alert('Primer reporte','La primera vez que realiza un reporte debe encontrarse conectado a internet.');
            });

      };

  $scope.deleteOfflineReport = function(reportId) {
    //$scope.set_active_option('button-report');
    $scope.hide_special_divs();
    document.getElementById("spinner").style.display = "block";
    $scope.report =  $scope.offlineReports[reportId];
    ModalService.checkNoModalIsOpen();
    $ionicModal.fromTemplateUrl('templates/delete-offline-report.html', {
      scope: $scope,
      //hardwareBackButtonClose: false,
      animation: 'slide-in-up',
      //focusFirstInput: true
    }).then(function(modal) {
        ModalService.activeModal = modal;
        document.getElementById("spinner").style.display = "none";
        document.getElementById("foot_bar").style.display = "none";
        ModalService.show();
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

  $scope.cleanOfflineMarkers = function(map){
      map.eachLayer(function (layer) {
        if(layer._url!="undefined" && layer._url!=null){
          //IT's THE MAP ITSELF
        }else{
          if(layer.options.alt == "Reporte pendiente de envío"){
            map.removeLayer(layer);
          }
        };
      });
  }

  $scope.deleteOfflineReportOk = function(){
    var id = $scope.report._id;
    DBService.deleteGivenReport($scope.report).then(function(){
      var marker = $scope.offlineReportsMarkers[id];
      leafletData.getMap().then(function(map) {
        map.removeLayer(marker);
      });
      //console.log($scope.offlineReportsMarkers[report.id]);
      $scope.back_to_map(true);
      $scope.list_reports();
    });
  }

  $scope.show_report_form = function(categories){
    $scope.categories = categories;
    document.getElementById("spinner").style.display = "none";
    document.getElementById("foot_bar").style.display = "none";
    ModalService.checkNoModalIsOpen();
    if(UserService.isLogged()){
      $scope.report.name = UserService.name;
      $scope.report.email = UserService.email;
      $scope.report.password_sign_in = UserService.password;
      $scope.report.phone = UserService.phone;
      $ionicModal.fromTemplateUrl('templates/pmb-wizard.html', {
        scope: $scope,
        animation: 'slide-in-up',
        //focusFirstInput: true,
        hardwareBackButtonClose: false
      }).then(function(modal) {
          ModalService.activeModal = modal;
          ModalService.activeModal.show();
        });
    }else{
      $ionicModal.fromTemplateUrl('templates/pmb-wizard-with-login.html', {
        scope: $scope,
        hardwareBackButtonClose: false,
        animation: 'slide-in-up',
        //focusFirstInput: true
      }).then(function(modal) {
          ModalService.activeModal = modal;
          ModalService.activeModal.show();
        });

    }
  }

  $scope.show_offline_report_form = function(categories){
    $scope.categories = categories;
    document.getElementById("spinner").style.display = "none";
    document.getElementById("foot_bar").style.display = "none";
    var template = "";
    if(UserService.isLogged()){
      $scope.report.name = UserService.name;
      $scope.report.email = UserService.email;
      $scope.report.password_sign_in = UserService.password;
      $scope.report.phone = UserService.phone;
      template = "templates/pmb-offline-wizard.html";
    }else{
      //template = "templates/pmb-offline-wizard-with-login.html";
      template = "templates/pmb-offline-wizard.html";
      //Se llama siempre al form que no pide usuario porque ya se guardó el usuario la primera vez
    }
    ModalService.checkNoModalIsOpen();
    $ionicModal.fromTemplateUrl('templates/pmb-offline-wizard.html', {
      scope: $scope,
      //hardwareBackButtonClose: false,
      animation: 'slide-in-up',
      //focusFirstInput: true
    }).then(function(modal) {
        ModalService.activeModal = modal;
        ModalService.activeModal.show().then(function(){
              var categorygroup = $scope.report.categorygroup;
              var categories_select = angular.element( document.querySelector( '#categoriesSelect' ) );
              categories_select.val(categorygroup);
              $scope.update_subcategories();
              var category = $scope.report.category;
              var sub_select_id = "#subcategoriesSelect_"+categorygroup;
              var sub_categories_select = angular.element( document.querySelector( sub_select_id ) );
              sub_categories_select.val(category);
              //var compiled = $compile(element.contents())($scope);
            });;
    });
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

  $scope.abuse = function() {
      var confirmAbuse = $ionicPopup.show({
      template: 'Nombre: <input type="text" id="abuse_name"><br/>Email: <input type="text" id="abuse_email"><br/>Asunto: <input type="text" id="abuse_subject"><br/>Mensaje<textarea rows="6" id="abuse_message"></textarea><div id="error_container_inside"></div>',
      title: "Denunciar abuso",
      subTitle: "Estás reportando por abusiva al siguiente reporte, que contiene información personal, o similar:",
      scope: $scope,
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Enviar</b>',
          type: 'button-positive',
          onTap: function(e) {
            var fields = new Array();
            $scope.abuse_email = document.getElementById("abuse_email").value;
            $scope.abuse_name = document.getElementById("abuse_name").value;
            $scope.abuse_subject = document.getElementById("abuse_subject").value;
            $scope.abuse_message = document.getElementById("abuse_message").value;
            fields.push($scope.create_field_array("Nombre","notNull",$scope.abuse_name));
            fields.push($scope.create_field_array("Email","email",$scope.abuse_email));
            fields.push($scope.create_field_array("Asunto","notNull",$scope.abuse_subject));
            fields.push($scope.create_field_array("Mensaje","notNull",$scope.abuse_message));
            if(ErrorService.check_fields(fields,"error_container_inside")){
              return $scope.abuse_email;
            }else{
              e.preventDefault();
            }
          }
        }
      ]
    });
    confirmAbuse.then(function(res) {
     if(res) {
       var http_request = PMBService.abuse($scope.abuse_email,$scope.report_detail_id,$scope.abuse_name,abuse_subject,$scope.abuse_message);
       http_request.then(function(resp) {
          //var data = JSON.parse(resp.response);
          //if(ErrorService.http_data_response_is_successful(data,"error_container")){
            PopUpService.show_alert("Denuncia enviada","Gracias por tus comentarios. ¡Nos pondremos en contacto con usted tan pronto como nos sea posible!");
            $scope.abuse_name = null;
            $scope.abuse_email = null;
            $scope.abuse_subject = null;
            $scope.abuse_message = null;
          //}
       });
    }
   });
  };

  $scope.send_comment = function(){
    var fields = new Array();
    fields.push($scope.create_field_array("Comentario","notNull",$scope.comment.update));
    if(ErrorService.check_fields(fields,"error_container_inside")){
      comment_sent = PMBService.comment($scope.comment);
      if($scope.comment.photo==null){
          comment_sent.success(function(data, status, headers,config){
            $scope.back_to_map(true);
          })
          .error(function(data, status, headers, config){
            ErrorService.show_error_message("error_container_inside",status);
            $scope.back_to_map(false);
          })
        }else{
          comment_sent.then(function(resp) {
            $scope.back_to_map(true);
          }, function(error) {
          }, function(progress) {
            $timeout(function() {
              $scope.uploadProgress = (progress.loaded / progress.total) * 100;
              document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
            });
          });
        }
    }
  }

  $scope.subscribe = function() {
    if(UserService.isLogged()){
      var confirmSubscribe = PopUpService.confirmPopup("Subscribirse","¿Está seguro que desea recibir un correo a la dirección "+UserService.email+" cuando se dejen comentarios sobre este problema?");
      confirmSubscribe.then(function(res) {
       if(res) {
        var http_request = PMBService.subscribe(UserService.email,$scope.report_detail_id);
        http_request.then(function(resp) {
           //var data = JSON.parse(resp.response);
           //if(ErrorService.http_data_response_is_successful(data,"error_container")){
           //}
           PopUpService.show_alert("Confirme su correo","Se ha enviado un link a la dirección " + UserService.email + " para confirmar su correo. Luego de esto comenzarán a llegarle las alertas sobre nuevos comentarios.")
        });
       }
     });
    }else{
      var confirmSubscribe = PopUpService.askForOneValuePopUp($scope,"Subscribirse","Por favor, ingrese un correo al que desea recibir mensajes cuando se dejen comentarios sobre este problema.", "Email", "email");
      confirmSubscribe.then(function(res) {
       if(res) {
         $scope.one_value_popup = res;
         var http_request = PMBService.subscribe($scope.one_value_popup,$scope.report_detail_id);
         http_request.then(function(resp) {
            //var data = JSON.parse(resp.response);
            //if(ErrorService.http_data_response_is_successful(data,"error_container")){
              PopUpService.show_alert("Confirme su correo","Se ha enviado un link a la dirección " + $scope.one_value_popup + " para confirmar su correo. Luego de esto comenzarán a llegarle las alertas sobre nuevos comentarios.")
              $scope.one_value_popup = null;
            //}
         });
      }
     });
    }

  };

  $scope.hide = function() {
    if(UserService.isLogged()){
      var confirmHide = PopUpService.confirmPopup("Ocultar","¿Está seguro de que desea ocultar su reporte? Este no aparecerá más ni en la página ni en la aplicación si es ocultado.");
      confirmHide.then(function(res) {
       if(res) {
        var http_request = PMBService.hide($scope.report_detail_id);
        http_request.then(function(resp) {
           PopUpService.show_alert("Ocultar","Se ha ocultado el reporte. No será visible en el futuro.");
        });
       }
     });
    }
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
              //$scope.addReportsLayer();
              $scope.loadPinsLayer();
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
              //$scope.addReportsLayer();
              $scope.loadPinsLayer();
            }else{
              $scope.back_to_map(false);
            }
          }, function(error) {
            $scope.save_offline_report().then(function(response){
              $scope.back_to_map(true);
              //$scope.list_reports_and_go(response.id);
              $scope.list_reports();
              var alert = "Código: " + error.code;
              alert = alert + " Origen: " + error.source;
              alert = alert + " Destino: " + error.target;
              alert = alert + " http_status: " + error.http_status;
              //alert = alert + " Body: " + error.body;
            //  alert = alert + " Exception: " + error.exception;
              //console.log(alert);
              PopUpService.show_alert("Error en el envío","Hubo un error en el envío: " + alert + ". El reporte se ha guardado en su dispositivo y se enviará cuando utilice esta aplicación conectado a internet");
            });
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
      ModalService.checkNoModalIsOpen();
      document.getElementById("foot_bar").style.display = "block";
      document.getElementById("spinner-inside-modal").style.display = "none";
      //$scope.addReportsLayer();
    }else{
      document.getElementById("spinner-inside-modal").style.display = "none";
    }
  }

  $scope.cancelReport = function(){
    ModalService.checkNoModalIsOpen();
    document.getElementById("foot_bar").style.display = "block";
  }

  $scope.image = null;

  $scope.addImage = function(isFromAlbum, isUserPhoto, isCommentPhoto) {
    //alert("addImage");
    $scope.isUserPhoto = isUserPhoto;
    $scope.isCommentPhoto = isCommentPhoto;

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
      allowEdit: false,
      correctOrientation : fix_orientation,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: save_to_gallery,
      targetWidth: 360,
      targetHeight: 360
    };


    $cordovaCamera.getPicture(options).then(function(imageData) {
      onImageSuccess(imageData);

      function onImageSuccess(fileURI) {
        //alert(fileURI);
        //alert(fileURI);
        window.FilePath.resolveNativePath(fileURI, function(result) {
          // onSuccess code
          //alert(result);
          fileURI = 'file://' + result;
          if(result.startsWith("file://")){
            fileURI = result;
          }
          //alert(fileURI);
          if($scope.isUserPhoto==1){
            //UserService.add_photo(fileURI);
            $scope.profile.picture_url = fileURI;
          }else{
            if($scope.isCommentPhoto==1){
              $scope.comment.file = fileURI;
            }else{
              $scope.report.file = fileURI;
            }
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
      $scope.hide_special_divs();
      $scope.set_active_option('button-list-reports');
      document.getElementById("user-options-menu").style.display="none";
      if(ConnectivityService.isOnline()){
        //SHOW ONLINE REPORTS (logic inside template map.html)
        document.getElementById("report-list-scroll").style.display = "block";
      }else{
        //SHOW OFFLINE REPORTS
        $scope.list_offline_reports();
      }
    };

    $scope.list_offline_reports_menu = function(){
      $scope.hide_special_divs();
      $scope.list_offline_reports();
    }

    $scope.list_offline_reports = function(){
      leafletData.getMap().then(function(map) {
        $scope.cleanOfflineMarkers(map);
        var reports = DBService.getAllReports();
        var div = '<ion-scroll direction="y" id="offline-report-list-scroll"><div class="scroll"><div id="report-list-offline">';
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
                var markerOptions = {alt: "Reporte pendiente de envío"};
                var marker = L.marker([report.lat, report.lon],markerOptions).addTo(map);
                var markerHTML = '<a class="text report-link" ng-click="editOfflineReport(\'' + report._id + '\')"><p>' + report.title + '</p></a><p class="offline-pending">(pendiente de envío)</p>';
                var compiled = $compile(markerHTML)($scope);
                marker.bindPopup(compiled[0]);
                $scope.offlineReportsMarkers[report._id]=marker;
            });
            div = div + "<br/><h3><a ng-click='send_offline_reports_from_menu()'>- Enviar todos los reportes pendientes</a></h3>";
          }else{
            div = div + '<br/><h3>No hay ningún reporte pendiente de envío.</h3>';
          }
          div = div + '</div></div><div class="scroll-bar scroll-bar-v"><div class="scroll-bar-indicator scroll-bar-fade-out"></div></div></ion-scroll>';
          var element = angular.element( document.querySelector( '#offline-report-list-container' ) );
          element.html(div);
          var compiled = $compile(element.contents())($scope);
          $scope.$broadcast('scroll.resize');
        }).catch(function (err) {
          div = div + '<br/><h3>No hay ningún reporte pendiente de envío.</h3>';
          div = div + '</div></div><div class="scroll-bar scroll-bar-v"><div class="scroll-bar-indicator scroll-bar-fade-out"></div></div></ion-scroll>';
        });
        document.getElementById("offline-report-list-container").style.display = "block";
      });

    }

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
            var element = angular.element( document.querySelector( '#offline-report-list-container' ) );
            element.html(div);
            var compiled = $compile(element.contents())($scope);
          }).catch(function (err) {
            div = div + '<br/><h3>No hay ningún reporte pendiente de envío.</h3>';
            div = div + '</div>';
          });
          document.getElementById("offline-report-list-container").style.display = "block";
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
          ModalService.checkNoModalIsOpen();
          $scope.faq = $sce.trustAsHtml(response);
          document.getElementById("spinner").style.display = "none";
          $ionicModal.fromTemplateUrl('templates/faq.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              ModalService.activeModal = modal;
              ModalService.activeModal.show().then(function(){
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
      ModalService.checkNoModalIsOpen();
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
      document.getElementById("offline-report-list-container").style.display = "none";
      document.getElementById("user-options-menu").style.display="none";
      document.getElementById('map_crosshair').style.display = "none";
      document.getElementById('map_crosshair_button').style.display = "none";
    }

    $scope.viewReportDetails = function(id){
      $scope.report_detail_id = id;
      if(ConnectivityService.isOnline()){
        document.getElementById("spinner").style.display = "block";
        $scope.hide_special_divs();
        ReportService.getById(id).then(function(resp) {
          $scope.report_detail = $sce.trustAsHtml(resp.data.replace("overflow:auto;","").replace('src="/','src="'+ConfigService.baseURL).replace('url(/','url('+ConfigService.baseURL+ConfigService.baseCobrand+"/").replace('url(/','url('+ConfigService.baseURL+ConfigService.baseCobrand+"/"));
          document.getElementById("spinner").style.display = "none";
          $scope.comment = {
            submit_update: 1,
            id: $scope.report_detail_id,
            may_show_name: 1,
            add_alert: 1,
            fixed: 0,
            update: "",
            name: null,
            form_rznvy: null,
            photo: null
          };
          ModalService.checkNoModalIsOpen();
          $ionicModal.fromTemplateUrl('templates/report-detail.html', {
            scope: $scope,
            //hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              ModalService.activeModal = modal;
              ModalService.activeModal.show().then(function(){
                  var element = angular.element( document.querySelector( '#report-detail-container-div' ) );
                  var compiled = $compile(element.contents())($scope);
                  if(UserService.isLogged()){
                    document.getElementById("comment_container").style.display="block";
                    $scope.comment.name = UserService.name;
                    $scope.comment.form_rznvy = UserService.email;
                  }else{
                    document.getElementById("comment_container").style.display="none";
                  }
              })
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
      ModalService.checkNoModalIsOpen();
      $scope.report_detail_id = null;
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

    $scope.addMapControls = function() {

      document.getElementById('map_crosshair').style.display = "block";
      document.getElementById('map_crosshair_button').style.display = "block";

    };

    $scope.startReportFromCrosshairs = function(){
      leafletData.getMap().then(function(map) {
        var latlon = map.getCenter();
        LocationsService.save_new_report_position(latlon.lat,latlon.lng);
        $scope.new_report(1);
        //console.log(latlon);
      });
    }

    $scope.getOnlyCategoryIconURL = function(url){
      var new_url = url.replace("-proceso","");
      new_url = new_url.replace("-resuelto","");
      return new_url;
    };

    $scope.hideOffScreenPins = function() {
      leafletData.getMap().then(function(map) {
        var mapBounds = map.getBounds();
        var keysArray = Object.keys($scope.reportsByState);
        $scope.reportsVisible = [];
        keysArray.forEach(function(item){
          $scope.reportsByState[item].forEach(function(layer,key){
            var shouldBeVisible = mapBounds.contains(layer.getLatLng());
            if (!shouldBeVisible) {
                map.removeLayer(layer);
            } else if (shouldBeVisible) {
                /*if($scope.selected_residuo){
                  var programas_str = $scope.selected_residuo.properties.Programas;
                  var programasIds = programas_str.split(".");
                  var id = layer.feature.properties.ProgramaSubProgID;
                  if(programasIds.indexOf(id)<0){
                    map.removeLayer(layer);
                  }else{
                    map.addLayer(layer);
                  }
                }else{
                  map.addLayer(layer);
                }*/
                map.addLayer(layer);
                $scope.reportsVisible.push(layer.feature);
            }
          })
        });
      });
    }

    $scope.removeAllPins = function() {
      leafletData.getMap().then(function(map) {
        var mapBounds = map.getBounds();
        var keysArray = Object.keys($scope.reportsByState);
        $scope.reportsVisible = [];
        keysArray.forEach(function(item){
          $scope.reportsByState[item].forEach(function(layer,key){
            map.removeLayer(layer);
          })
        });
      });
    }

    $scope.loadPinsLayer = function(){
        document.getElementById("spinner").style.display = "block";
        $scope.removeAllPins();
        $scope.reportsByState = {};
        ReportService.getAll().then(function (response) {
          var pinsArray = response.data.features;
          $scope.reports = response.data.features;
          pinsArray.forEach(function(feature){
            if (feature.properties) {
              var lon = feature.geometry.coordinates[0];
              var lat = feature.geometry.coordinates[1];
              var icon = ConfigService.baseURL + feature.properties.pin_url;
              var markerIcon = L.icon({
                iconUrl: icon,
                iconSize: [29, 34],
                iconAnchor: [14, 34],
                popupAnchor: [14, -8]
              });
              var layer = L.marker([lat, lon], {icon: markerIcon});
              layer.feature = feature;
              $scope.featureReports[layer.feature.properties.id] = layer;
              if(!$scope.reportsByState["state-" + feature.properties.state]){
                $scope.reportsByState["state-" + feature.properties.state]=[];
              }
              $scope.reportsByState["state-" + feature.properties.state].push(layer);
              if (feature.properties) {
                reportId = feature.properties.id;
                descripcion = feature.properties.title;
                html = '<a class="text report-link" ng-click="viewReportDetails(' + reportId + ')"><p>' + descripcion + '</p></a>';
                var compiled = $compile(html)($scope);
                layer.bindPopup(compiled[0]);
              }
            }
          });
          document.getElementById("spinner").style.display = "none";
          $scope.hideOffScreenPins();
        });
    }


    $scope.addReportsLayer = function() {
      if($scope.jsonLayer!=null){
        return false;
      }
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
          url: baseURL + "/ajax_geo?bbox={bbox}" /*"ajax_geo?bbox={bbox}"*/ ,
          locAsGeoJSON: true /*locAsArray:true*/,
          onEachFeature: onEachFeature
        });

        $scope.jsonLayer = l;

      leafletData.getMap().then(function(map) {
        map.addLayer(l);
      });


      l.on('dataloaded', function(e) { //show loaded data!
        $scope.reports = e.data.features;
      });


      l.on('layeradd', function(e) {
        e.layer.eachLayer(function(_layer) {
          var markerIcon = L.icon({
            iconUrl: baseURL + "/" + _layer.feature.properties.pin_url,
            iconSize: [29, 34],
            iconAnchor: [14, 34],
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
        lat = lat - 0.0006;
        map.setView(new L.LatLng(lat, coords.lng), 18);
        layer.openPopup();
      });
    };

    // Suggestion
    $scope.model = [];
    $scope.externalModel = [];
    $scope.selectedItems = [];
    $scope.preselectedSearchItems = [];
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
      menu.style.height = '120px';
      menu.style.width = '150px';
      menu.style.display = "block";
    }

    $scope.show_user_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = UserService.name + "<div id='auth_options'><div class='user-logged-link' ng-click='show_edit_profile_modal()'>Mi perfil</div>";
      html = html + "<div class='user-logged-link' ng-click='list_offline_reports_menu()'>Reportes pendientes</div>";
      html = html + "<div class='user-logged-link' ng-click='sign_out()'>Cerrar sesión</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.height = '160px';
      menu.style.width = '200px';
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
        if($scope.actual_photo=="url(./img/icon-user-anonymous.png)"){
          $scope.actual_photo = "./img/icon-user-anonymous.png";
        }
        ModalService.checkNoModalIsOpen();
        $ionicModal.fromTemplateUrl('templates/edit_profile_with_photo.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              document.getElementById("user-options-menu").style.display="none";
              ModalService.activeModal = modal;
              document.getElementById("foot_bar").style.display = "none";
              ModalService.activeModal.show();
          });
      }else{
        $scope.actual_photo = null;
        ModalService.checkNoModalIsOpen();
        $ionicModal.fromTemplateUrl('templates/edit_profile.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'slide-in-up',
            //focusFirstInput: true
          }).then(function(modal) {
              $scope.hide_special_divs();
              ModalService.activeModal = modal;
              document.getElementById("foot_bar").style.display = "none";
              ModalService.activeModal.show();
          });
      }
    }

    $scope.close_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a update_user
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
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
              var alert = "Código: " + error.code;
              alert = alert + " Origen: " + error.source;
              alert = alert + " Destino: " + error.target;
              alert = alert + " http_status: " + error.http_status;
              alert = alert + " Body: " + error.body;
              alert = alert + " Exception: " + error.exception;
              ErrorService.show_error_message("error_container","Hubo un error en el envío: " + alert);
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
      ModalService.checkNoModalIsOpen();
      $ionicModal.fromTemplateUrl('templates/log_in.html', {
          scope: $scope,
          hardwareBackButtonClose: false,
          animation: 'slide-in-up',
          //focusFirstInput: true
        }).then(function(modal) {
            $scope.hide_special_divs();
            ModalService.activeModal = modal;
            document.getElementById("foot_bar").style.display = "none";
            ModalService.activeModal.show();
        });
    }

    $scope.login_ok = function(){
      $scope.sign_in($scope.nonauth.email,$scope.nonauth.password);
    }

    $scope.close_login_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
    }



    $scope.show_sign_up_modal = function(){
      //cargar el modal con el form de sign_up y de ahi llamar al sign_up
      $scope.newuser = new Array();
      $scope.newuser.email = "";
      $scope.newuser.password = "";
      $scope.newuser.fullname = "";
      $scope.newuser.id_doc = "";
      $scope.newuser.telephone = "";
      ModalService.checkNoModalIsOpen();
      $ionicModal.fromTemplateUrl('templates/sign_up.html', {
          scope: $scope,
          hardwareBackButtonClose: false,
          animation: 'slide-in-up',
          //focusFirstInput: true
        }).then(function(modal) {
            $scope.hide_special_divs();
            ModalService.activeModal = modal;
            document.getElementById("foot_bar").style.display = "none";
            ModalService.activeModal.show();
        });
    }

    $scope.close_sign_up_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
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

    $scope.set_offline_user = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              //$scope.sign_in_ajax(doc.email, doc.password);
              UserService.save_user_data(doc.name, doc.email, doc.password, doc.identity_document, doc.phone, doc.picture_url);
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
        //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
        $scope.user_cached_image="./img/icon-user-anonymous.png";
      }else{
        if(UserService.picture_url!=null && UserService.picture_url!=""){
          //alert(UserService.picture_url);
          $scope.user_cached_image=UserService.picture_url;
          //picture.style.backgroundImage = "url(" + UserService.picture_url + ")";
        }else{
          //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
          $scope.user_cached_image="./img/icon-user-anonymous.png";
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
                //ErrorService.show_error_message_popup("No hemos podido geolocalizarlo. ¿Tal vez olvidó habilitar los servicios de localización en su dispositivo?")
                $scope.openCouncilSelector();
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

  }
]);
