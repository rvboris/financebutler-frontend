angular.module('fb.controllers').controller('CategoryCtrl', ['$scope', '$filter', 'Restangular', 'category', 'eventBus', function($scope, $filter, Restangular, category, eventBus) {
    var baseCategory = Restangular.all('category');

    $scope.categories = category.getList();
    $scope.categoriesTree = $filter('categoryFlatToTree')($scope.categories);
    $scope.types = ['out', 'in', 'any'];

    $scope.categoryDialog = false;
    $scope.activeMode = null;
    $scope.activeCategoryId = null;
    $scope.activeCategory = {
        name: null,
        type: null,
        parent: null
    };

    $scope.parentSelectOptions = {
        allowClear: true,
        width: '100%'
    };

    $scope.typeSelectDisabled = false;
    $scope.typeSelectOptions = {
        width: '100%'
    };

    eventBus.on('category.list', function(categories) {
        $scope.categories = categories;
        $scope.categoriesTree = $filter('categoryFlatToTree')(categories);
    });

    $scope.$watch('activeCategory.parent', function(parentId) {
        if (!parentId) {
            $scope.typeSelectDisabled = false;
            return;
        }

        parentId = _.parseInt(parentId);

        var parentCategory = _.find($scope.categories, function(category) {
            return category.id === parentId;
        });

        $scope.activeCategory.type = parentCategory.type;
        $scope.typeSelectDisabled = true;
    });

    $scope.categoryDialogOpen = function(mode, categoryId) {
        $scope.activeMode = mode;

        if (categoryId) {
            $scope.activeCategoryId = categoryId;
        } else {
            $scope.activeCategoryId = null;
        }

        if (mode === 'new') {
            $scope.activeCategory.name = '';
            $scope.activeCategory.type = 'out';
            $scope.activeCategory.parent = null;
            $scope.activeCategory.default = null;
            $scope.categoryDialog = true;
        } else {
            var categoryToPopulate = _.find($scope.categories, function(category) {
                return category.id === categoryId;
            });

            $scope.activeCategory.name = categoryToPopulate.name;
            $scope.activeCategory.type = categoryToPopulate.type;
            $scope.activeCategory.parent = categoryToPopulate.parentId;
            $scope.activeCategory.default = categoryToPopulate.defaultId;
            $scope.categoryDialog = true;
        }
    };

    $scope.categoryDialogClose = function() {
        $scope.categoryDialog = false;
    };

    $scope.categoryDialogSave = function() {
        if ($scope.activeMode === 'new') {
            baseCategory
                .post({
                    name: $scope.activeCategory.name,
                    type: $scope.activeCategory.type,
                    parent: $scope.activeCategory.parent
                }).then(function(newCategory) {
                    category.pushList(newCategory);
                    $scope.categoryDialogClose();
                });

            return;
        }

        $scope.categories.then(function(categories) {
            var lastIdx;
            var categoryToSave = _.find(categories, function(category, idx) {
                lastIdx = idx;
                return category.id === $scope.activeCategoryId;
            });

            categoryToSave.name = $scope.activeCategory.name;
            categoryToSave.type = $scope.activeCategory.type;
            categoryToSave.parent = $scope.activeCategory.parent;

            categoryToSave.put().then(function(newCategory) {
                category.putList(lastIdx, newCategory);
                $scope.categoryDialogClose();
            });
        });
    };

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
}]);