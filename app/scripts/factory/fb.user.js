angular.module('fb.factory')
    .factory('user', function(Restangular, eventBus, config) {
        var baseUser = Restangular.all('user');
        var user;

        var getOne = function() {
            return user;
        };

        var updateOne = function() {
            if (config.apiKey === false) {
                return;
            }

            baseUser.getList().then(function(list) {
                user = list[0];
                eventBus.emit('user.one', user);
            }, function() {
                user = undefined;
                eventBus.emit('user.one', user);
            });
        };

        var putOne = function(newUser) {
            user = newUser;
            eventBus.emit('user.one', user);
        };

        updateOne();

        return {
            getOne: getOne,
            updateOne: updateOne,
            putOne: putOne
        };
    });