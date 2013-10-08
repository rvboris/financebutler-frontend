fbFilters.filter('categoryFlatToTree', function() {
    return function(categories) {
        var flat = {}, root = [], parentIdx, i;

        _.each(categories, function(category) {
            category.children = [];
            flat['id' + category.id] = category;
        });

        for (i in flat) {
            if (flat.hasOwnProperty(i)) {
                parentIdx = 'id' + flat[i].parentId;

                if (!flat[parentIdx]) {
                    continue;
                }

                flat[parentIdx].children.push(flat[i]);
            }
        }

        for (i in flat) {
            if (flat.hasOwnProperty(i)) {
                parentIdx = 'id' + flat[i].parentId;

                if (flat[parentIdx]) {
                    continue;
                }

                root.push(flat[i]);
            }
        }

        return root;
    };
});