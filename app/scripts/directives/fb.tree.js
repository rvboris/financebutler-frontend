angular.module('fb.directives')
    .directive('tree', function(eventBus) {
        var openedNodes = [];

        return {
            scope: true,
            link: function($scope, element) {
                var updateEvents = function() {
                    element.find('li')
                        .show()
                        .hide()
                        .find('button.toggle').each(function() {
                            if (_.indexOf(openedNodes, _.parseInt(angular.element(this).data('id'))) >= 0) {
                                angular.element(this).parent().parent().find('> ul > li').show();
                            } else {
                                angular.element(this)
                                    .removeClass('active')
                                    .find('span')
                                    .removeClass('icon-minus')
                                    .addClass('icon-plus');
                            }
                        });

                    element.find('> li').show();

                    element.off();
                    element.on('click', 'li button.toggle', function(e) {
                        if (e.isPropagationStopped()) {
                            return;
                        }

                        var categoryId = _.parseInt(angular.element(e.currentTarget).data('id'));
                        var children = angular.element(e.currentTarget).parent().parent().find('> ul > li');

                        if (children.is(':visible')) {
                            children.hide('fast');

                            var idxToDelete = _.indexOf(openedNodes, categoryId);

                            if (idxToDelete >= 0) {
                                openedNodes.splice(idxToDelete, 1);
                            }
                        } else {
                            children.show('fast');
                            openedNodes.push(categoryId);
                        }

                        angular.element(e.currentTarget).toggleClass('active');
                        angular.element(e.currentTarget).find('span').toggleClass('icon-plus icon-minus');

                        e.stopPropagation();
                    });
                };

                eventBus.on('category.list', function(categories) {
                    _.each(openedNodes, function(node) {
                        var finded = _.find(categories, function(category) {
                            return category.id === node;
                        });

                        if (_.isUndefined(finded)) {
                            var idxToDelete = _.indexOf(openedNodes, node);

                            if (idxToDelete >= 0) {
                                openedNodes.splice(idxToDelete, 1);
                            }
                        }
                    });
                });

                $scope.$watch('categoriesTree', function(categories) {
                    if (_.isUndefined(categories)) {
                        return;
                    }

                    updateEvents();
                });
            }
        };
    });