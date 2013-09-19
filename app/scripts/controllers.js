angular.module('controllers', ['restangular', 'ui.bootstrap.modal', 'ui.bootstrap.dropdownToggle', 'ui.select2'])
	.controller('UserCtrl', ['$rootScope', '$scope', '$log', '$q', 'Restangular', function($rootScope, $scope, $log, $q, Restangular) {
        Restangular.setBaseUrl(['api', $rootScope.$apiKey].join('/'));

        var baseLocale = Restangular.all('locale');
        var baseUser = Restangular.all('user');

        $scope.locales = baseLocale.getList();
        $scope.user = baseUser.getList();

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
            escapeMarkup: function(m) { return m; },
            width: '100%'
        };

        $scope.settingsDialogOpen = function() {
            $q.all([$scope.user, $scope.locales]).then(function(results) {
                var user = results[0];
                var locales = results[1];

                $scope.activeUser.name = user.name;
                $scope.activeUser.email = user.email;
                $scope.activeUser.locale = _.find(locales, function(locale) {
                    return locale.code === user.locale;
                }).code;

                $scope.settingsDialog = true;
            });
        };

        $scope.settingsDialogClose = function() {
            $scope.settingsDialog = false;
        };

        $scope.settingsDialogSave = function() {
            $scope.settingsDialogClose();
        };

		$scope.$on('accountUpdate', function(event, args) {
			_.each(args, function(val, key) {
				if (key === 'instock') {
					$scope.instock.length = 0;

					for (var currencyId in val) {
						$scope.instock.push({ currencyId: _.parseInt(currencyId), total: val[currencyId] });
					}
				} else if (key === 'arrears') {
					$scope.arrears.length = 0;

					for (var currencyId in val) {
						$scope.arrears.push({ currencyId: _.parseInt(currencyId), total: val[currencyId] });
					}
				} else if ($scope[key]) {
					$scope[key] = val;
				}
			});
    	});

    	$scope.$on('currencyUpdate', function(event, args) {
			$scope.currency = args;
    	});

		$scope.user.then(null, function(err) {
			if (err.status === 401) {
				$rootScope.$state.transitionTo('auth');
			} else {
				$rootScope.$state.transitionTo('error', { code: err.status });
				$log.error(err);
			}
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
                    $scope.activeAccount.currency = _.findIndex(currencyList, function(currency) {
                        return currency.id === accountToPopulate.currencyId
                    });

                    $scope.accountDialog = true;
                });
            }
		};

		$scope.accountDialogClose = function() {
			$scope.accountDialog = false;
		};

		$scope.accountDialogSave = function() {
            if ($scope.activeMode === 'new') {
                $scope.currency.then(function(currency) {
                    baseAccounts.post({
                        name: $scope.activeAccount.name,
                        startValue: $scope.activeAccount.startValue,
                        currency: currency[$scope.activeAccount.currency].id
                    }).then(function(accounts) {
                        $scope.accounts = baseAccounts.getList();
                        $scope.accountDialogClose();
                    });
                });

                return;
            }

            $q.all([$scope.accounts, $scope.currency]).then(function(results) {
                var accountList = results[0];
                var currencyList = results[1];

                var accountToSave = _.find(accountList, function(account) {
                    return account.id === $scope.activeAccountId;
                });

                accountToSave.name = $scope.activeAccount.name;
                accountToSave.startValue = $scope.activeAccount.startValue;
                accountToSave.currency = currencyList[$scope.activeAccount.currency].id;

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

		$scope.$watch('currency', function(currency) {
			_.each(currency, function(cur, idx) {
				if (cur.code === 'RUB') {
					$scope.defaultCurrencyId = idx;
				}
			});

			$scope.$emit('currency', currency);
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
	.controller('OperationsCtrl', ['$scope', 'Restangular', function($scope, Restangular) {
		$scope.$on('accountUpdate', function(event, args) {
			_.each(args, function(val, key) {
				if (key === 'accounts') {
					$scope[key] = val;
				}
			});
    	});
	}])
	.controller('ErrorCtrl', ['$scope', '$state', function($scope, $state) {
		$scope.errorCode = $state.params.code;
	}]);