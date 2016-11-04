pmb_im.services.factory('ReportService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  var baseURL = ConfigService.baseURL + "/report/ajax/";


  /**
   * Constructor, with class name
   */
  function Report(_data) {
    angular.extend(this, _data);
  }

  Report.getById = function(id){
    var url = baseURL + id;
    return $http.get(url).then(function(result){
              return result;
    });
  }


  Report._default = function(){
    var _data = {
      lat: 0,
      lon: 0,
      title: null,
      detail: null,
      may_show_name: 1,
      category: null,
      phone: null,
      pc: '',
      file: null,
      name: null,
      email: null,
      submit_sign_in: 1,
      password_sign_in: null,
      remember_me:1
    };
    return new Report(_data);
  };
    Report._all = [];
    Report.current = {};
    Report._new = function(){
      /*Report.current = Report._default();
      return Report.current;*/
      return Report._default();
    };



    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    Report.build = function(_data) {

      return new Report(
        _data
      );
    };

    Report.prototype.setLatLng = function (latlng) {

      this.lat = latlng.lat;
      this.lon = latlng.lng;
    };

    /**
     * Return the constructor function
     */
    return Report;

}]);
