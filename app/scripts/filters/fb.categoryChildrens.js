angular.module('fb.filters')
    .filter('categoryChildrens', function() {
        return function(categories, rootId) {
            var childs = [];

            var findCategoriesByParentId = function(parentId) {
                return _.filter(categories, function(category) {
                    return category.parentId === parentId;
                });
            };

            var iterate = function(parentId) {
                _.each(findCategoriesByParentId(parentId), function(category) {
                    childs.push(category);
                    iterate(category.id);
                });
            };

            iterate(rootId);

            return childs;
        };
    });