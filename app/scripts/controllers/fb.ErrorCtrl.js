angular.module('fb.controllers').controller('ErrorCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.errorCode = $state.params.code;
}]);