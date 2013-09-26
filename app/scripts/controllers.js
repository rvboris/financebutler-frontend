angular.module('controllers', ['restangular', 'ui.bootstrap.modal', 'ui.bootstrap.dropdownToggle', 'ui.select2'])
    .controller('UserCtrl', ['$rootScope', '$scope', '$log', '$q', '$translate', 'Restangular', function($rootScope, $scope, $log, $q, $translate, Restangular) {
        Restangular.setBaseUrl(['api', $rootScope.$apiKey].join('/'));

        var baseLocale = Restangular.all('locale');
        var baseUser = Restangular.all('user');

        $scope.locales = baseLocale.getList();
        $scope.users = baseUser.getList();

        $scope.instock = [];
        $scope.arrears = [];

        $scope.activeUser = {
            name: '',
            email: '',
            locale: ''
        };

        $scope.settingsDialog = false;

        var localeFormat = function format(locale) {
            if (!locale.id) {
                return locale.text;
            }

            return '<img class="flag" src="images/flags/' + locale.id.split('_')[1].toLowerCase() + '.png">' + locale.text;
        };

        $scope.localeSelectOptions = {
            formatResult: localeFormat,
            formatSelection: localeFormat,
            escapeMarkup: function(m) {
                return m;
            },
            width: '100%'
        };

        $scope.settingsDialogOpen = function() {
            $q.all([$scope.users, $scope.locales]).then(function(results) {
                var user = results[0][0];
                var locales = results[1];

                $scope.activeUser.name = user.name;
                $scope.activeUser.email = user.email;
                $scope.activeUser.locale = _.find(locales,function(locale) {
                    return locale.code === user.locale.code;
                }).code;

                $scope.settingsDialog = true;
            });
        };

        $scope.settingsDialogClose = function() {
            $scope.settingsDialog = false;
        };

        $scope.settingsDialogSave = function() {
            $scope.users.then(function(users) {
                var user = users[0];

                user.name = $scope.activeUser.name;
                user.email = $scope.activeUser.email;
                user.locale = $scope.activeUser.locale;

                user.put().then(function() {
                    $scope.users = baseUser.getList();
                    $scope.settingsDialogClose();
                });
            });
        };

        $scope.deleteUser = function() {
            $scope.users.then(function(users) {
                var user = users[0];

                user.remove().then(function() {
                    location.reload();
                });
            });
        };

        $scope.$on('accountUpdate', function(event, args) {
            _.each(args, function(val, key) {
                var currency;

                if (key === 'instock') {
                    $scope.instock.length = 0;

                    for (currency in val) {
                        if (val.hasOwnProperty(currency)) {
                            $scope.instock.push({ currency: _.parseInt(currency), total: val[currency] });
                        }
                    }
                } else if (key === 'arrears') {
                    $scope.arrears.length = 0;

                    for (currency in val) {
                        if (val.hasOwnProperty(currency)) {
                            $scope.arrears.push({ currency: _.parseInt(currency), total: val[currency] });
                        }
                    }
                } else if ($scope[key]) {
                    $scope[key] = val;
                }
            });
        });

        $scope.$on('currencyUpdate', function(event, args) {
            if (args === true) {
                return;
            }

            $scope.currency = args;
        });

        $scope.users.then(null, function(err) {
            if (err.status === 401) {
                $rootScope.$state.transitionTo('auth');
            } else {
                $rootScope.$state.transitionTo('error', { code: err.status });
                $log.error(err);
            }
        });

        $scope.$watch('users', function(users) {
            if (!users || users.length === 0) {
                return;
            }

            $translate.uses(users[0].locale.code);

            $scope.$emit('currency', true);
            $scope.$emit('category', true);
        });
    }])
    .controller('AccountCtrl', ['$scope', '$log', '$q', 'Restangular', function($scope, $log, $q, Restangular) {
        var baseAccounts = Restangular.all('account');
        var baseCurrency = Restangular.all('currency');

        $scope.accounts = baseAccounts.getList();
        $scope.currency = baseCurrency.getList();

        $scope.currencySelectOptions = {
            width: '100%'
        };

        $scope.defaultCurrencyId = null;
        $scope.activeAccountId = null;
        $scope.activeMode = null;

        $scope.accountDialog = false;
        $scope.removeAccountDialog = false;

        $scope.activeAccount = {
            name: '',
            startValue: 0,
            currency: null
        };

        $scope.accountDialogOpen = function(mode, accountId) {
            $scope.activeMode = mode;

            if (accountId) {
                $scope.activeAccountId = accountId;
            }

            if (mode === 'new') {
                $scope.activeAccount.name = '';
                $scope.activeAccount.startValue = 0;
                $scope.activeAccount.currency = $scope.defaultCurrencyId;
                $scope.accountDialog = true;
            } else {
                $q.all([$scope.accounts, $scope.currency]).then(function(results) {
                    var accountList = results[0];
                    var currencyList = results[1];

                    var accountToPopulate = _.find(accountList, function(account) {
                        return account.id === $scope.activeAccountId;
                    });

                    $scope.activeAccount.name = accountToPopulate.name;
                    $scope.activeAccount.startValue = accountToPopulate.startValue;
                    $scope.activeAccount.currency = _.find(currencyList,function(currency) {
                        return currency.id === accountToPopulate.currencyId;
                    }).id;

                    $scope.accountDialog = true;
                });
            }
        };

        $scope.accountDialogClose = function() {
            $scope.accountDialog = false;
        };

        $scope.accountDialogSave = function() {
            if ($scope.activeMode === 'new') {
                baseAccounts.post({
                    name: $scope.activeAccount.name,
                    startValue: $scope.activeAccount.startValue,
                    currency: $scope.activeAccount.currency
                }).then(function() {
                        $scope.accounts = baseAccounts.getList();
                        $scope.accountDialogClose();
                    });

                return;
            }

            $scope.accounts.then(function(accounts) {
                var accountToSave = _.find(accounts, function(account) {
                    return account.id === $scope.activeAccountId;
                });

                accountToSave.name = $scope.activeAccount.name;
                accountToSave.startValue = $scope.activeAccount.startValue;
                accountToSave.currency = $scope.activeAccount.currency;

                accountToSave.put().then(function() {
                    $scope.accounts = baseAccounts.getList();
                    $scope.accountDialogClose();
                });
            });
        };

        $scope.removeAccountDialogOpen = function(accountId) {
            $scope.removeAccountDialog = true;
            $scope.activeAccountId = accountId;
        };

        $scope.removeAccountDialogClose = function() {
            $scope.removeAccountDialog = false;
        };

        $scope.removeAccountDialogSave = function() {
            $scope.removeAccountDialogClose();

            $scope.accounts.then(function(accounts) {
                var accountToDelete = _.find(accounts, function(account) {
                    return account.id === $scope.activeAccountId;
                });

                accountToDelete.remove().then(function() {
                    $scope.accounts = baseAccounts.getList();
                });
            });
        };

        $scope.$watch('currency', function(currencyList) {
            _.each(currencyList, function(currency) {
                if (currency.code === 'RUB') {
                    $scope.defaultCurrencyId = currency.id;
                }
            });

            $scope.$emit('currency', currencyList);
        });

        $scope.$on('currencyUpdate', function(event, args) {
            if (args !== true) {
                return;
            }

            $scope.currency = baseCurrency.getList();
        });

        $scope.$watch('accounts', function(accounts) {
            var instock = {};
            var arrears = {};

            _.each(accounts, function(account) {
                if (account.currentValue < 0) {
                    if (!arrears[account.currencyId]) {
                        arrears[account.currencyId] = 0;
                    }
                    arrears[account.currencyId] += parseFloat(account.currentValue);
                } else {
                    if (!instock[account.currencyId]) {
                        instock[account.currencyId] = 0;
                    }
                    instock[account.currencyId] += parseFloat(account.currentValue);
                }
            });

            $scope.$emit('account', { accounts: accounts, instock: instock, arrears: arrears });
        });
    }])
    .controller('OperationsCtrl', ['$scope', function($scope) {
        $scope.$on('accountUpdate', function(event, args) {
            _.each(args, function(val, key) {
                if (key === 'accounts') {
                    $scope[key] = val;
                }
            });
        });
    }])
    .controller('CategoryCtrl', ['$scope', '$filter', 'Restangular', function($scope, $filter, Restangular) {
        var baseCategory = Restangular.all('category');

        $scope.categories = baseCategory.getList();
        $scope.categoriesTree = [];

        $scope.$on('categoryUpdate', function(event, args) {
            if (args !== true) {
                return;
            }

            $scope.categories = baseCategory.getList();
        });

        $scope.$watch('categories', function(categories) {
            if (!categories) {
                return;
            }

            $scope.categoriesTree = $filter('categoryFlatToTree')(categories);
        });

        $scope.typeTitleByType = function(type) {
            if (type === 'any') {
                return $filter('translate')('Все операции');
            }

            if (type === 'out') {
                return $filter('translate')('Расход');
            }

            if (type === 'in') {
                return $filter('translate')('Доход');
            }

            return '';
        };

        $scope.classByType = function(type) {
            if (type === 'any') {
                return 'label-default';
            }

            if (type === 'out') {
                return 'label-primary';
            }

            if (type === 'in') {
                return 'label-success';
            }

            return '';
        };
    }])
    .controller('ErrorCtrl', ['$scope', '$state', function($scope, $state) {
        $scope.errorCode = $state.params.code;
    }]);