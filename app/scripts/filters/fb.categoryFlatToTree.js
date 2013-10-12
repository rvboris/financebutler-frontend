angular.module('fb.filters')
    .filter('categoryFlatToTree', function() {
        return function(categories) {
            var flat = {}, root = [], parentIdx;

            _.each(categories, function(category) {
                category.children = [];
                flat['id' + category.id] = category;
            });

            _.forIn(flat, function(val, key) {
                parentIdx = 'id' + flat[key].parentId;

                if (!flat[parentIdx]) {
                    return;
                }

                flat[parentIdx].children.push(flat[key]);
            });

            _.forIn(flat, function(val, key) {
                parentIdx = 'id' + flat[key].parentId;

                if (flat[parentIdx]) {
                    return;
                }

                root.push(flat[key]);
            });

            return root;
        };
    });