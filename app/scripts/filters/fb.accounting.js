fbFilters.filter('accounting', ['$filter', function($filter) {
    return function(number, currencyId, currencyList) {
        if (!currencyId || !currencyList) {
            return '';
        }

        return accounting.formatMoney(number, $filter('currencyCodeById')(currencyId, currencyList), 2, ' ', ',', '%v %s');
    };
}]);