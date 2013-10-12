angular.module('fb.controllers')
    .controller('CategoryCtrl', function($scope, $filter, Restangular, category, eventBus) {
        $scope.categories = category.getList();
        $scope.categoriesTree = _.isUndefined($scope.categories) ? [] : $filter('categoryFlatToTree')($scope.categories);
        $scope.types = ['out', 'in', 'any'];

        $scope.categoryDialog = false;
        $scope.removeAccountDialog = false;

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
            if (_.isUndefined(parentId) || _.isNull(parentId) || _.isEmpty(parentId)) {
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
                Restangular.all('category')
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

            var lastIdx;
            var categoryToSave = _.find($scope.categories, function(category, idx) {
                lastIdx = idx;
                return category.id === $scope.activeCategoryId;
            });

            categoryToSave.name = $scope.activeCategory.name;
            categoryToSave.type = $scope.activeCategory.type;
            categoryToSave.parent = _.parseInt($scope.activeCategory.parent);

            categoryToSave.put().then(function(newCategory) {
                var childrens = $filter('categoryChildrens')($scope.categories, newCategory.id);

                _.each($scope.categories, function(category) {
                    _.each(childrens, function(child) {
                        if (category.id === child.id) {
                            category.type = newCategory.type;
                        }
                    });
                });

                category.putList(lastIdx, newCategory);

                $scope.categoryDialogClose();
            });
        };

        $scope.removeCategoryDialogOpen = function(categoryId) {
            $scope.removeCategoryDialog = true;
            $scope.activeCategoryId = categoryId;
        };

        $scope.removeCategoryDialogClose = function() {
            $scope.removeCategoryDialog = false;
        };

        $scope.removeCategoryDialogSave = function() {
            var lastIdx;
            var categoryToDelete = _.find($scope.categories, function(category, idx) {
                lastIdx = idx;
                return category.id === $scope.activeCategoryId;
            });

            if (_.isUndefined(categoryToDelete)) {
                $scope.removeCategoryDialogClose();
                return;
            }

            categoryToDelete.remove().then(function() {
                var childrens = $filter('categoryChildrens')($scope.categories, categoryToDelete.id);
                var idxToDelete = [ lastIdx ];

                _.each($scope.categories, function(category, idx) {
                    _.each(childrens, function(children) {
                        if (children.id === category.id) {
                            idxToDelete.push(idx);
                        }
                    });
                });

                category.removeList(idxToDelete);

                $scope.removeCategoryDialogClose();
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
    });