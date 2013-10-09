angular.module('fb.factory')
    .factory('account', function(Restangular, eventBus) {
        var baseAccount = Restangular.all('account');
        var accountList;

        var getList = function() {
            return accountList;
        };

        var pushList = function(account) {
            accountList.push(account);
            eventBus.emit('account.list', accountList);
        };

        var putList = function(idx, account) {
            accountList[idx] = account;
            eventBus.emit('account.list', accountList);
        };

        var removeList = function(idx) {
            accountList.splice(idx, 1);
            eventBus.emit('account.list', accountList);
        };

        var updateList = function() {
            baseAccount.getList().then(function(list) {
                accountList = list;
                eventBus.emit('account.list', list);
            });
        };

        var getGrouped = function() {
            var instock = {};
            var arrears = {};

            _.each(accountList, function(account) {
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

            return { instock: instock, arrears: arrears };
        };

        updateList();

        return {
            getList: getList,
            pushList: pushList,
            putList: putList,
            updateList: updateList,
            getGrouped: getGrouped,
            removeList: removeList
        };
    });