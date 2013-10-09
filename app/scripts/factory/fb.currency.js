angular.module('fb.factory')
    .factory('currency', function(Restangular, eventBus) {
        var baseCurrency = Restangular.all('currency');
        var currencyList;

        var updateList = function() {
            baseCurrency.getList().then(function(list) {
                currencyList = list;
                eventBus.emit('currency.list', list);
            });
        };

        var getList = function() {
            return currencyList;
        };

        updateList();

        return {
            getList: getList,
            updateList: updateList
        };
    });