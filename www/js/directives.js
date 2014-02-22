angular.module('ionic.weather.directives', [])

    .constant('WEATHER_ICONS', {
        'tornado'					:'ion-ios7-thunderstorm',
        'tropical storm'			:'ion-ios7-thunderstorm',
        'hurricane'					:'ion-ios7-thunderstorm',
        'severe thunderstorms'		:'ion-flash',
        'thunderstorms'				:'ion-ios7-thunderstorm',
        'mixed rain and snow'		:'ion-ios7-rainy',
        'mixed rain and sleet'		:'ion-ios7-rainy',
        'mixed snow and sleet'		:'ion-ios7-rainy',
        'freezing drizzle'			:'ion-waterdrop',
        'drizzle'					:'ion-waterdrop',
        'freezing rain'				:'ion-ios7-rainy',
        'showers'					:'ion-ios7-rainy',
        'snow flurries'				:'ion-ios7-star-outline',
        'light snow showers'		:'ion-ios7-star-outline',
        'blowing snow'				:'ion-ios7-star-outline',
        'snow'						:'ion-ios7-star-outline',
        'hail'						:'ion-ios7-star-outline',
        'sleet'						:'ion-ios7-rainy-outline',
        'dust'						:'ion-ios7-rainy-outline',
        'foggy'						:'ion-ios7-rainy-outline',
        'haze'						:'ion-ios7-rainy-outline',
        'smoky'						:'ion-ios7-rainy-outline',
        'blustery'					:'ion-ios7-rainy-outline',
        'windy'						:'ion-ios7-rainy-outline',
        'cold'						:'ion-ios7-rainy-outline',
        'cloudy'					:'ion-ios7-cloudy-outline',
        'mostly cloudy (night)'		:'ion-cloud',
        'mostly cloudy (day)'		:'ion-ios7-partlysunny-outline',
        'partly cloudy (night)'		:'ion-cloud',
        'partly cloudy (day)'		:'ion-ios7-partlysunny-outline',
        'clear (night)'				:'ion-ios7-moon-outline',
        'sunny'						:'ion-ios7-sunny-outline',
        'fair (night)'				:'ion-ios7-moon',
        'fair (day)'				:'ion-ios7',
        'mixed rain and hail'		:'ion-ios7-rainy-outline',
        'hot'						:'ion-ios7-sunny-outline',
        'isolated thunderstorms'	:'ion-ios7-thunderstorm-outline',
        'scattered thunderstorms'	:'ion-ios7-thunderstorm-outline',
        'scattered thunderstorms'	:'ion-ios7-thunderstorm-outline',
        'scattered showers'			:'ion-ios7-thunderstorm-outline',
        'heavy snow'				:'ion-ios7-star-outline',
        'scattered snow showers'	:'ion-ios7-star-outline',
        'heavy snow'				:'ion-ios7-star-outline',
        'partly cloudy'				:'ion-ios7-partlysunny-outline',
        'thundershowers'			:'ion-ios7-thunderstorm',
        'snow showers'				:'',
        'isolated thundershowers'	:'ion-ios7-thunderstorm',
        'not available'				:''
    })

    .directive('weatherIcon', function(WEATHER_ICONS) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                icon: '='
            },
            template: '<i class="icon" ng-class="weatherIcon"></i>',
            link: function($scope) {

                $scope.$watch('icon', function(v) {
                    if(!v) { return; }

                    var icon = v;

                    if(icon in WEATHER_ICONS) {
                        $scope.weatherIcon = WEATHER_ICONS[icon];
                    } else {
                        $scope.weatherIcon = WEATHER_ICONS['cloudy'];
                    }
                });
            }
        }
    })

    .directive('currentTime', function($timeout, $filter) {
        return {
            restrict: 'E',
            replace: true,
            template: '<span class="current-time">{{currentTime}}</span>',
            scope: {
                localtz: '='
            },
            link: function($scope, $element, $attr) {
                $timeout(function checkTime() {
                    if($scope.localtz) {
                        $scope.currentTime = $filter('date')(+(new Date), 'h:mm') + $scope.localtz;
                    }
                    $timeout(checkTime, 500);
                });
            }
        }
    })

    .directive('currentWeather', function($timeout, $rootScope, Settings) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/current-weather.html',
            scope: true,
            compile: function(element, attr) {
                return function($scope, $element, $attr) {

                    $rootScope.$on('settings.changed', function(settings) {
                        //should update
                    });

                    $scope.$watch('results', function(results) {
                        if(results) {
                            $scope.currentTemp = results.item.condition.temp;
                            $scope.highTemp = results.item.forecast[0].high;
                            $scope.lowTemp = results.item.forecast[0].low;
                        }
                    });

                    $timeout(function() {
                        var windowHeight = window.innerHeight;
                        var thisHeight = $element[0].offsetHeight;
                        var headerHeight = document.querySelector('#header').offsetHeight;
                        $element[0].style.paddingTop = (windowHeight - thisHeight) + 'px';
                        angular.element(document.querySelector('.content')).css('-webkit-overflow-scrolling', 'auto');
                        $timeout(function() {
                            angular.element(document.querySelector('.content')).css('-webkit-overflow-scrolling', 'touch');
                        }, 50);
                    });
                }
            }
        }
    })

    .directive('forecast', function($timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/forecast.html',
            link: function($scope, $element, $attr) {
            }
        }
    })

    .directive('weatherBox', function($timeout) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                title: '@'
            },
            template: '<div class="weather-box"><h4 class="title">{{title}}</h4><div ng-transclude></div></div>',
            link: function($scope, $element, $attr) {
            }
        }
    })

    .directive('scrollEffects', function() {
        return {
            restrict: 'A',
            link: function($scope, $element, $attr) {
                var amt, st, header;
                var bg = document.querySelector('.bg-image');
                $element.bind('scroll', function(e) {
                    if(!header) {
                        header = document.getElementById('header');
                    }
                    st = e.detail.scrollTop;
                    if(st >= 0) {
                        header.style.webkitTransform = 'translate3d(0, 0, 0)';
                    } else if(st < 0) {
                        header.style.webkitTransform = 'translate3d(0, ' + -st + 'px, 0)';
                    }
                    amt = Math.min(0.6, st / 1000);

                    window.rAF(function() {
                        header.style.opacty = 1 - amt;
                        if(bg) {
                            //bg.style.opacity = 1 - amt;
                        }
                    });
                });
            }
        }
    })

    .directive('backgroundCycler', function($compile, $animate) {
        var animate = function($scope, $element, newImageUrl) {
            var child = $element.children()[0];

            var scope = $scope.$new();
            scope.url = newImageUrl;
            var img = $compile('<background-image></background-image>')(scope);

            $animate.enter(img, $element, null, function() {
            });
            if(child) {
                $animate.leave(angular.element(child), function() {
                });
            }
        };

        return {
            restrict: 'E',
            link: function($scope, $element, $attr) {
                $scope.$watch('activeBgImage', function(v) {
                    if(!v) { return; }
                    var item = v;
                    var url = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret + "_z.jpg";
                    animate($scope, $element, url);
                });
            }
        }
    })

    .directive('backgroundImage', function($compile, $animate) {
        return {
            restrict: 'E',
            template: '<div class="bg-image"></div>',
            replace: true,
            scope: true,
            link: function($scope, $element, $attr) {
                $element[0].id="bg-image"
                if($scope.url) {
                    $element[0].style.backgroundImage = 'url(' + $scope.url + ')';
                }
            }
        }
    });
