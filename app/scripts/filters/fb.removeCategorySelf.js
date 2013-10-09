angular.module('fb.filters')
    .filter('removeCategorySelf', function() {
        return function(categories, filterId) {
            if (!filterId) {
                return categories;
            }

            return _.filter(categories, function(category) {
                return category.id !== filterId;
            });
        };
    });