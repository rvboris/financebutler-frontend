angular.module('fb.factory')
    .factory('category', function(Restangular, eventBus) {
        var baseCategory = Restangular.all('category');
        var categoryList;

        var updateList = function() {
            baseCategory.getList().then(function(list) {
                categoryList = list;
                eventBus.emit('category.list', list);
            });
        };

        var getList = function() {
            return categoryList;
        };

        var pushList = function(category) {
            categoryList.push(category);
            eventBus.emit('category.list', categoryList);
        };

        var putList = function(idx, category) {
            categoryList[idx] = category;
            eventBus.emit('category.list', categoryList);
        };

        var removeList = function(idx) {
            if (_.isArray(idx)) {
                _.each(idx, function(i) {
                    categoryList.splice(i, 1);
                });
            } else {
                categoryList.splice(idx, 1);
            }

            eventBus.emit('category.list', categoryList);
        };

        updateList();

        return {
            getList: getList,
            pushList: pushList,
            putList: putList,
            updateList: updateList,
            removeList: removeList
        };
    });