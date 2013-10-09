angular.module('fb.controllers')
    .controller('ErrorCtrl', function($scope, $state) {
        $scope.errorCode = $state.params.code;
    });