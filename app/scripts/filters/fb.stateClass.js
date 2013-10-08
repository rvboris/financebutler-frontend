fbFilters.filter('stateClass', function() {
    return function(input) {
        return input.replace('.', '-');
    };
});