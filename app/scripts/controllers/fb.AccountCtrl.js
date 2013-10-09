angular.module('fb.controllers')
    .controller('AccountCtrl', function($scope, $log, $q, Restangular, eventBus, account, currency) {
        $scope.accounts = account.getList();
        $scope.currency = currency.getList();

        $scope.currencySelectOptions = { width: '100%' };

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

        eventBus.on('account.list', function(accountsList) {
            if (_.isUndefined(accountsList)) {
                return;
            }

            $scope.accounts = accountsList;
        });

        eventBus.on('currency.list', function(currencyList) {
            if (_.isUndefined(currencyList)) {
                return;
            }

            $scope.currency = currencyList;

            var defaultCurrency = _.find(currencyList, function(currency) {
                return currency.code === 'RUB';
            });

            if (defaultCurrency) {
                $scope.defaultCurrencyId = defaultCurrency.id;
                return;
            }

            $scope.defaultCurrencyId = currencyList[0].id;
        });

        $scope.accountDialogOpen = function(mode, accountId) {
            $scope.activeMode = mode;

            if (accountId) {
                $scope.activeAccountId = accountId;
            } else {
                $scope.activeAccountId = null;
            }

            if (mode === 'new') {
                $scope.activeAccount.name = '';
                $scope.activeAccount.startValue = 0;
                $scope.activeAccount.currency = $scope.defaultCurrencyId;
            } else {
                var accountToPopulate = _.find($scope.accounts, function(account) {
                    return account.id === $scope.activeAccountId;
                });

                var currency = _.find($scope.currency, function(currency) {
                    return currency.id === accountToPopulate.currencyId;
                });

                $scope.activeAccount.name = accountToPopulate.name;
                $scope.activeAccount.startValue = accountToPopulate.startValue;
                $scope.activeAccount.currency = currency.id;
            }

            $scope.accountDialog = true;
        };

        $scope.accountDialogClose = function() {
            $scope.accountDialog = false;
        };

        $scope.accountDialogSave = function() {
            if ($scope.activeMode === 'new') {
                Restangular.all('account')
                    .post({
                        name: $scope.activeAccount.name,
                        startValue: $scope.activeAccount.startValue,
                        currency: $scope.activeAccount.currency
                    })
                    .then(function(newAccount) {
                        account.pushList(newAccount);
                        $scope.accountDialogClose();
                    });
                return;
            }

            var lastIdx;
            var accountToSave = _.find($scope.accounts, function(account, idx) {
                lastIdx = idx;
                return account.id === $scope.activeAccountId;
            });

            if (_.isUndefined(accountToSave)) {
                $scope.accountDialogClose();
                return;
            }

            accountToSave.name = $scope.activeAccount.name;
            accountToSave.startValue = $scope.activeAccount.startValue;
            accountToSave.currency = $scope.activeAccount.currency;

            accountToSave.put().then(function(newAccount) {
                account.putList(lastIdx, newAccount);
                $scope.accountDialogClose();
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
            var lastIdx;
            var accountToDelete = _.find($scope.accounts, function(account, idx) {
                lastIdx = idx;
                return account.id === $scope.activeAccountId;
            });

            if (_.isUndefined(accountToDelete)) {
                $scope.removeAccountDialogClose();
                return;
            }

            accountToDelete.remove().then(function() {
                account.removeList(lastIdx);
                $scope.removeAccountDialogClose();
            });
        };
    });