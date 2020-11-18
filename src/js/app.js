// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'pmb_im' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var pmb_im = {
  controllers: angular.module('pmb_im.controllers', []),
  services: angular.module('pmb_im.services', [])
};

pmb_im.app = angular.module('pmb_im', ['ionic','ionic.wizard','ion-autocomplete','leaflet-directive', 'pmb_im.controllers', 'pmb_im.services', 'ngCordova'])

.constant('ApiImEndpoint', {
  url: 'http://www.montevideo.gub.uy'
})

.constant('ApiDataEndpoint', {
  url: '/data'
})


.run(function($ionicPlatform, $rootScope, $cordovaKeyboard,$cordovaNetwork) {
  $rootScope.VERSION = window.VERSION;
  $ionicPlatform.ready(function() {
    ionic.Platform.isFullScreen = true;

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
      try {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
       }
       catch (error) {
       }
      //cordova.plugins.Keyboard.disableScroll(false);
      try {
        window.Keyboard.hideKeyboardAccessoryBar(true);
       }
       catch (error) {
       }


      try {
        Keyboard.hideKeyboardAccessoryBar(true);
       }
       catch (error) {
       }

      try {
        StatusBar.hide();
       }
       catch (error) {
       }





  });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider) {
  $compileProvider.debugInfoEnabled(false);
  //$ionicConfigProvider.scrolling.jsScrolling(true);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

.state('app', {
    cache: false,
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'MapController'
  })

.state('app.map', {
    cache: false,
    url: "/map/",
    views: {
      'menuContent' :{
        templateUrl: "templates/map.html",
        controller : "PMBCtrl"
      }
    }
  })

.state('app.intro', {
  cache: false,
  url: "/intro",
  views: {
    'menuContent' :{
      templateUrl: "templates/intro.html",
      controller : "IntroCtrl"
    }
  }
})

// if none of the above states are matched, use this as the fallback
$urlRouterProvider.otherwise('/app/intro');

});
