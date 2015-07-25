angular
    .module('app', [
        'lbServices',
        'ui.router',
        'ui.bootstrap'
    ])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            .state('home', {
                url: '/',
                controller: 'HomeController',
                templateUrl: 'views/home.html'
            });

        $urlRouterProvider.otherwise('/');
    }]);