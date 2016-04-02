pmb_im.services.factory('DBService', ['$q', function($q) {
   var _db;

   // We'll need this later.
   var user_credentials_saved = false;

   return {
       initDB: initDB,
       saveUser: saveUser,
       getUser: getUser,
       eraseUser: eraseUser,
       credentials_saved: credentials_saved
   };

   function saveUser(user_name, user_email, user_password, user_id_doc, user_phone, user_picture_url) {
         user_credentials_saved = true;
         return _db.put({
            _id: 'user-logged',
            name: user_name,
            email: user_email,
            password: user_password,
            identity_document: user_id_doc,
            phone: user_phone,
            picture_url: user_picture_url
          }).then(function (response) {
            // handle response
          }).catch(function (err) {
            eraseUser();
            _db.put({
               _id: 'user-logged',
               name: user_name,
               email: user_email,
               password: user_password,
               identity_document: user_id_doc,
               phone: user_phone,
               picture_url: user_picture_url
             })
          });
   };

  function credentials_saved() {
    return user_credentials_saved;
  }

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
      user_credentials_saved = false;
      return _db.remove(doc);
    });
  }

   function initDB() {
       // Creates the database or opens if it already exists
       _db = new PouchDB('pmb_local_db');
       return _db;
   };
}]);
