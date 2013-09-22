angular.module('directives', [])
    .directive('subview', function($http, $templateCache, $compile, $parse) {
        return {
            restrict: 'E',
            link: function(scope, elm, attrs) {
                $http.get('views/' + $parse(attrs.data)(scope) + '.html', {
                    cache: $templateCache
                }).success(function(tplContent) {
                        elm.replaceWith($compile(tplContent)(scope));
                    });
            }
        };
    })
    .directive('smartFloat', function() {
        var currencyRegexp = /^[-]?(0|[1-9][0-9]*)((\.|,)[0-9]+)?([eE][+-]?[0-9]+)?$/;

        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function(viewValue) {
                    if (currencyRegexp.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return parseFloat(viewValue.replace(',', '.'));
                    } else {
                        ctrl.$setValidity('float', false);
                        return undefined;
                    }
                });
            }
        };
    })
    .directive('breakpoint', ['$window', '$rootScope', function($window, $rootScope) {
        return {
            restrict: "A",
            link: function(scope, element, attr) {
                scope.breakpoint = {
                    class: '',
                    windowSize: $window.innerWidth
                };

                var breakpoints = (scope.$eval(attr.breakpoint));

                angular.element($window).bind('resize', function() {
                    scope.breakpoint.windowSize = $window.innerWidth;

                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });

                scope.$watch('breakpoint.windowSize', function(windowWidth) {
                    var setClass = breakpoints[Object.keys(breakpoints)[0]];

                    for (var breakpoint in breakpoints) {
                        if (breakpoints.hasOwnProperty(breakpoint)) {
                            if (breakpoint < windowWidth) {
                                setClass = breakpoints[breakpoint];
                            }
                            element.removeClass(breakpoints[breakpoint]);
                        }
                    }

                    element.addClass(setClass);
                    scope.breakpoint.class = setClass;

                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });

                scope.$watch('breakpoint.class', function(newClass, oldClass) {
                    if (newClass === oldClass) {
                        return;
                    }

                    $rootScope.$broadcast('breakpointChange', scope.breakpoint, oldClass);
                });
            }
        };
    }])
    .directive('pageslide', function() {
        return {
            restrict: "A",
            replace: false,
            transclude: false,
            scope: {},
            link: function($scope, el, attrs) {
                var param = {};
                param.side = attrs.pageslide || 'right';
                param.speed = attrs.psSpeed || '0.5';

                var css_class = 'ng-pageslide ps-hidden';
                css_class += ' ps-' + param.side;

                var content = document.getElementById(attrs.href.substr(1));
                var slider = document.createElement('div');
                slider.id = "ng-pageslide";
                slider.className = css_class;

                document.body.appendChild(slider);
                slider.appendChild(content);

                el[0].onclick = function(e) {
                    e.preventDefault();

                    if (/ps-hidden/.exec(slider.className)) {
                        content.style.display = 'none';
                        slider.className = slider.className.replace(' ps-hidden', '');
                        slider.className += ' ps-shown';

                        setTimeout(function() {
                            content.style.display = 'block';
                        }, (param.speed * 1000));

                    } else if (/ps-shown/.exec(slider.className)) {
                        content.style.display = 'none';
                        slider.className = slider.className.replace(' ps-shown', '');
                        slider.className += ' ps-hidden';
                    }
                };
            }
        };
    });