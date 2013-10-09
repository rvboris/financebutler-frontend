angular.module('fb.factory')
    .factory('locale', function(Restangular, eventBus) {
        var baseLocale = Restangular.all('locale');
        var localeList;

        var updateList = function() {
            baseLocale.getList().then(function(list) {
                localeList = list;
                eventBus.emit('locale.list', list);
            });
        };

        var getList = function() {
            return localeList;
        };

        updateList();

        return {
            getList: getList,
            updateList: updateList
        };
    });