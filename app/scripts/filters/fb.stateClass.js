angular.module('fb.filters')
    .filter('stateClass', function() {
        return function(input) {
            return input.replace('.', '-');
        };
    });