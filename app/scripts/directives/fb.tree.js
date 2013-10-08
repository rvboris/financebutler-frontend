fbDirectives
    .directive('tree', ['$timeout', function() {
        return {
            scope: true,
            link: function($scope, element) {
                $scope.$watch('categoriesTree', function(categories) {
                    if (!categories) {
                        return;
                    }

                    element.find('li').hide();
                    element.find('> li').show();

                    element.on('click', 'li button.toggle', function(e) {
                        if (e.isPropagationStopped()) {
                            return;
                        }

                        var children = angular.element(e.currentTarget).parent().parent().find('> ul > li');

                        if (children.is(':visible')) {
                            children.hide('fast');
                        } else {
                            children.show('fast');
                        }

                        angular.element(e.currentTarget).toggleClass('active');
                        angular.element(e.currentTarget).find('span').toggleClass('icon-plus icon-minus');

                        e.stopPropagation();
                    });
                });
            }
        };
    }]);