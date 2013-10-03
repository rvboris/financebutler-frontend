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
    }])
    .filter('categoryFlatToTree', function() {
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
    })
    .filter('removeCategorySelf', function() {
        return function(categories, filterId) {
            if (!filterId) {
                return categories;
            }

            return _.filter(categories, function(category) {
               return category.id !== filterId;
            });
        };
    });