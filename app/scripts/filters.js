angular.module('filters', [])
    .filter('stateClass', function() {
        return function(input) {
            return input.replace('.', '-');
        };
    })
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
    })
    .filter('accounting', ['$filter', function($filter) {
        return function(number, currencyId, currencyList) {
            if (!currencyId || !currencyList) {
                return '';
            }

            return accounting.formatMoney(number, $filter('currencyCodeById')(currencyId, currencyList), 2, ' ', ',', '%v %s');
        };
    }]);