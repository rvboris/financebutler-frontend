fbFactory.service('category', ['Restangular', 'eventBus', function(Restangular, eventBus) {
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

    updateList();

    return {
        getList: getList,
        pushList: pushList,
        putList: putList,
        updateList: updateList
    };
}]);