fbDirectives
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