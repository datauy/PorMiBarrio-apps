pmb_im.services.factory('DBService', ['$q', function($q) {
   var _db;

   // We'll need this later.
   var _reports;

   return {
       initDB: initDB,
       saveUser: saveUser,
       getUser: getUser,
       eraseUser: eraseUser
   };

   function saveUser(user_name, user_email, user_password) {
     return _db.put({
        _id: 'user-logged',
        name: user_name,
        email: user_email,
        password: user_password
      });
    /*.then(function (response) {
      // handle response
    }).catch(function (err) {
      console.log(err);
    });*/
   };

  function getUser() {
     return _db.get('user-logged');
     /*.then(function (doc) {
       // handle doc
     }).catch(function (err) {
       console.log(err);
     });*/
  };

  function eraseUser() {
    _db.get('user-logged').then(function(doc) {
      return _db.remove(doc);
    });
  }

   function initDB() {
       // Creates the database or opens if it already exists
       _db = new PouchDB('pmb_local_db');
       return _db;
   };
}]);
