angular.module('fb.controllers')
    .controller('UserCtrl', function($scope, $q, $translate, $window, locale, currency, category, user, account, eventBus) {
        $scope.locales = locale.getList();
        $scope.currency = currency.getList();
        $scope.user = user.getOne();

        $scope.instock = [];
        $scope.arrears = [];

        $scope.activeUser = {
            name: '',
            email: '',
            locale: ''
        };

        $scope.settingsDialog = false;

        eventBus.on('locale.list', function(locales) {
            $scope.locales = locales;
        });

        eventBus.on('currency.list', function(currencyList) {
            $scope.currency = currencyList;
        });

        eventBus.on('user.one', function(user) {
            $scope.user = user;

            $translate.uses(user.locale.code);

            currency.updateList();
            category.updateList();
        });

        eventBus.on('account.list', function() {
            var grouped = account.getGrouped();
            var currency;

            $scope.instock.length = 0;
            $scope.arrears.length = 0;

            for (currency in grouped.instock) {
                if (grouped.instock.hasOwnProperty(currency)) {
                    $scope.instock.push({ currency: _.parseInt(currency), total: grouped.instock[currency] });
                }
            }

            for (currency in grouped.arrears) {
                if (grouped.arrears.hasOwnProperty(currency)) {
                    $scope.arrears.push({ currency: _.parseInt(currency), total: grouped.arrears[currency] });
                }
            }
        });

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
            $scope.activeUser.name = $scope.user.name;
            $scope.activeUser.email = $scope.user.email;
            $scope.activeUser.locale = _.find($scope.locales,function(locale) {
                return locale.code === $scope.user.locale.code;
            }).code;

            $scope.settingsDialog = true;
        };

        $scope.settingsDialogClose = function() {
            $scope.settingsDialog = false;
        };

        $scope.settingsDialogSave = function() {
            $scope.user.name = $scope.activeUser.name;
            $scope.user.email = $scope.activeUser.email;
            $scope.user.locale = $scope.activeUser.locale;

            $scope.user.put().then(function(newUser) {
                user.putOne(newUser);
                $scope.settingsDialogClose();
            });
        };

        $scope.deleteUser = function() {
            $scope.user.remove().then(function() {
                $window.location.reload();
            });
        };
    });