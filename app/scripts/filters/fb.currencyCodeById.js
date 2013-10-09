angular.module('fb.filters')
    .filter('currencyCodeById', function() {
        return function(currencyId, currencyList) {
            if (!currencyList || !currencyId) {
                return '';
            }

            currencyId = _.parseInt(currencyId);

            return _.find(currencyList,function(currency) {
                return currency.id === currencyId;
            }).code;
        };
    });