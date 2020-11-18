pmb_im.services.factory('DBService', ['$q', function($q) {
   var _db = "empty";

   return {
       initDB: initDB,
       saveUser: saveUser,
       getUser: getUser,
       eraseUser: eraseUser,
       saveReport: saveReport,
       getReport: getReport,
       getAllReports: getAllReports,
       updateReport: updateReport,
       deleteReport: deleteReport,
       deleteGivenReport: deleteGivenReport,
       getCategories: getCategories,
       saveCategories: saveCategories
   };

   function saveUser(user_name, user_email, user_password, user_id_doc, user_phone, user_picture_url) {
         var user = {
            _id: 'user-logged',
            name: user_name,
            email: user_email,
            password: user_password,
            identity_document: user_id_doc,
            phone: user_phone,
            picture_url: user_picture_url
         };
         getUser().then(function (doc) {
           user._rev = doc._rev;
           return $q.when(_db.put(user));
         }).catch(function (err) {
           return $q.when(_db.put(user));
         })
   };

  function getUser() {
     return $q.when(_db.get('user-logged'));
  };

  function eraseUser() {
    $q.when(_db.get('user-logged')).then(function(doc) {
      return $q.when(_db.remove(doc));
    });
  }

   function initDB() {
       // Creates the database or opens if it already exists
       //PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));
       if(_db == "empty"){
         _db = new PouchDB(
            'mydb.db',
            {
              adapter: 'cordova-sqlite',
              iosDatabaseLocation: 'default'
            }
          );
          return _db;
       }
       return _db;
   };

   function saveReport(report) {
      //new_report_id = "report_" + pouchCollate.toIndexableString([report]);
      var date = new Date();
      var new_report_id = "report_" + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + date.getMilliseconds();
      report._id = new_report_id;
      return $q.when(_db.put(report));
   };

   function updateReport(report) {
     return $q.when(_db.put(report));
  };

   function getCategories() {
     return $q.when(_db.get('categories-list'));
   };

   function saveCategories(categories) {
     getCategories().then(function (doc) {
       categories._rev = doc._rev;
       return $q.when(_db.put(categories));
     }).catch(function (err) {
       categories._id = "categories-list";
       return $q.when(_db.put(categories));
     })
   };

  function getReport(reportId) {
     return $q.when(_db.get(reportId));
  };

   function getAllReports() {
     return $q.when(_db.allDocs({
      include_docs: true,
      attachments: false,
      startkey: 'report',
      endkey: 'report_'
     }));
  };

  function deleteReport(report_id) {
    $q.when(db.get(report_id)).then(function(doc) {
      return $q.when(_db.remove(doc));
    });
  };

  function deleteGivenReport(report) {
    return $q.when(_db.remove(report));
  };

}]);
