'use strict';

angular.module('financeButlerApp', ['controllers', 'filters', 'directives', 'ui.state', 'pascalprecht.translate', 'chieffancypants.loadingBar'])
    .config(function($stateProvider, $urlRouterProvider, $translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'translations/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage(window.locale);
        $translateProvider.fallbackLanguage('ru_RU');

        $urlRouterProvider.otherwise('/').when('/home', '/');

        $stateProvider
            .state('parent', {
                url: '/',
                templateUrl: 'views/parent.html',
                abstract: true
            })
            .state('auth', {
                url: '/auth',
                templateUrl: 'views/auth.html'
            })
            .state('error', {
                url: '/error/:code',
                templateUrl: 'views/error.html',
                controller: 'ErrorCtrl'
            })
            .state('parent.operations', {
                url: '',
                templateUrl: 'views/operations.html'
            })
            .state('parent.plan', {
                url: 'plan',
                templateUrl: 'views/plan.html'
            })
            .state('parent.reports', {
                url: 'reports',
                templateUrl: 'views/reports.html'
            })
            .state('parent.categories', {
                url: 'categories',
                templateUrl: 'views/categories.html'
            })
            .state('parent.places', {
                url: 'places',
                templateUrl: 'views/places.html'
            });
    })
    .run(['$window', '$rootScope', '$state', 'Restangular', function($window, $rootScope, $state) {
        $rootScope.$state = $state;
        $rootScope.$apiKey = $window.apiKey || false;
        $rootScope.$locale = $window.locale || 'ru_RU';

        $rootScope.$on('$stateChangeStart', function(event, toState) {
            if (toState.name !== 'auth' && !$rootScope.$apiKey) {
                event.preventDefault();
                $rootScope.$state.transitionTo('auth');
            }
        });

        $rootScope.$on('account', function(event, args) {
            $rootScope.$broadcast('accountUpdate', args);
        });

        $rootScope.$on('currency', function(event, args) {
            $rootScope.$broadcast('currencyUpdate', args);
        });

        $rootScope.$on('category', function(event, args) {
            $rootScope.$broadcast('categoryUpdate', args);
        });

        $rootScope.$on('breakpointChange', function(event, breakpoint, oldClass) {

        });
    }]);