'use strict';

angular.module('fb', [
        'fb.controllers',
        'fb.filters',
        'fb.directives',
        'fb.factory',
        'ui.state',
        'pascalprecht.translate',
        'chieffancypants.loadingBar',
        'restangular'
    ])
    .constant('config', {
        locale: window.locale || 'ru_RU',
        apiKey: window.apiKey || false
    })
    .config([
        'config',
        '$stateProvider',
        '$urlRouterProvider',
        '$translateProvider',
        'RestangularProvider',
        function(config, $stateProvider, $urlRouterProvider, $translateProvider, RestangularProvider) {
            if (config.apiKey) {
                RestangularProvider.setBaseUrl(['api', config.apiKey].join('/'));
            }

            $translateProvider.useStaticFilesLoader({
                prefix: 'translations/locale-',
                suffix: '.json'
            });
            $translateProvider.preferredLanguage(config.locale);
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
        }])
    .run(['$rootScope', '$state', 'config', 'eventBus', 'user', function($rootScope, $state, config, eventBus, user) {
        $rootScope.$state = $state;

        eventBus.on('user.one', function(user) {
            if (!user) {
                $rootScope.$state.transitionTo('auth');
            }
        });

        $rootScope.$on('$stateChangeStart', function(event, toState) {
            if (toState.name !== 'auth' && !config.apiKey) {
                event.preventDefault();
                $rootScope.$state.transitionTo('auth');
            }
        });
    }]);