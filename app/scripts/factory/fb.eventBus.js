angular.module('fb.factory')
    .factory('eventBus', function() {
        //noinspection JSHint
        return new EventEmitter2();
    });