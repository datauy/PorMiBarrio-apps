pmb_im.services.factory('PMBService', ['$http', 'leafletData', '$cordovaFileTransfer', 'ConfigService', function($http, leafletData, $cordovaFileTransfer,ConfigService) {

  var base = ConfigService.baseURL;

  var PMBService = {

    report: function(form) {
      if (form.file) {
	var formData = new FormData();
	formData.append("photo", form.file);
	formData.append("category", form.category);
	formData.append("detail", form.detail);
	formData.append("email", form.email);
	formData.append("lat", form.lat);
	formData.append("lon", form.lon);
	formData.append("may_show_name", form.may_show_name);
	formData.append("name", form.name);
	formData.append("password_sign_in", form.password_sign_in);
	formData.append("pc", form.pc);
	formData.append("remember_me", form.remember_me);
	formData.append("submit_sign_in", form.submit_sign_in);
	formData.append("title", form.title);
	return $http.post(base + '/report/new/mobile', formData, {
	    headers: { 'Content-Type': undefined },
	    transformRequest: angular.identity
	});
      }else{
        return $http.get(base + '/report/new/mobile', { params: form });
      }
    },

    subscribe: function (email,report_id) {
      return $http.get(base + "/alert/subscribe_ajax", { params: { rznvy: email, id: report_id, type: "updates" } });
    },

    abuse: function (email,report_id, name, subject, message) {
      return $http.get(base + "/contact/submit_ajax", { params: { em: email, id: report_id, name: name, subject: subject, message: message } });
    },

    hide: function (report_id) {
      var deleteURL = "/report/delete_ajax/" + report_id;
      return $http.get(base + deleteURL, { params: {} });
    },

    comment: function (comment) {
      if (comment.photo) {
      	var formData = new FormData();
      	formData.append("photo", comment.photo);
      	formData.append("id", comment.id);
      	formData.append("may_show_name", comment.may_show_name);
      	formData.append("add_alert", comment.add_alert);
      	if(comment.fixed==1){
      		formData.append("fixed", comment.fixed);
      	}
      	formData.append("update", comment.update);
      	formData.append("name", comment.name);
      	formData.append("form_rznvy", comment.form_rznvy);
      	formData.append("submit_update", comment.submit_update);
        if(comment.state){
          formData.append("state", comment.state);
        }
        if(comment.new_category){
          formData.append("new_category", comment.new_category);
        }
      	return $http.post(base + '/report/update', formData, {
      	    headers: { 'Content-Type': undefined },
      	    transformRequest: angular.identity,
      	    withCredentials: true
      	});
      }else{
      	if(comment.fixed==0){
      		delete comment.fixed;
      	}
        if(comment.state==null){
          delete comment.state;
        }
        if(comment.new_category==null){
          delete comment.new_category;
        }
        return $http.get(base + '/report/update', { withCredentials: true, params: comment });
      }

    },

    getAreas: function (lon,lat) {
      var mapitURL = "http://mapit.pormibarrio.uy/point/4326/"+lon+","+lat+"";
      return $http.get(mapitURL, { params: {} });
    },

  };
  return PMBService;

}]);
