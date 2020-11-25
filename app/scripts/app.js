(function () {
  'use strict';

  // create the angular app
  angular.module('orzaApp', [    
    'ngRoute',
    'orzaApp.controllers',
    'orzaApp.directives',
    'orzaApp.login',
    'ngMaterial'    
    ])
    .config(function($routeProvider, $mdThemingProvider) {
      $routeProvider
      .when('/main', {
        templateUrl : 'scripts/main/main.html'
      })
      .when('/login', {
        templateUrl : 'scripts/login/login.html'
      })
      .otherwise({
        redirectTo : '/login'
      });
      $mdThemingProvider.theme('default')
      .primaryPalette('grey')
      .accentPalette('red')
      // .dark();
    });
    

  // setup dependency injection
  angular.module('d3', ['ngMaterial']);
  angular.module('orzaApp.controllers', []);
  angular.module('orzaApp.login', []);
  angular.module('orzaApp.directives', ['d3']);
}());
