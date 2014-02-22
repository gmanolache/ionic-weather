angular.module('ionic.weather', ['ionic', 'ionic.weather.services', 'ionic.weather.filters', 'ionic.weather.directives'])

    .constant('WUNDERGROUND_API_KEY', 'bc5d38f7baa092e9')

    .constant('FLICKR_API_KEY', '329978df4a52c2057c5d1130d2cf1302')

    .filter('int', function() {
        return function(v) {
            return parseInt(v) || '';
        };
    })

    .controller('WeatherCtrl', function($q, $scope, $timeout, $rootScope, YahooWeather, Geo, Flickr, Modal, Platform, Settings) {
        var _this = this;

        Platform.ready(function() {
            // Hide the status bar
            StatusBar.hide();
        });

        $scope.activeBgImageIndex = 0;

        $scope.showSettings = function() {
            if(!$scope.settingsModal) {
                // Load the modal from the given template URL
                Modal.fromTemplateUrl('settings.html', function(modal) {
                    $scope.settingsModal = modal;
                    $scope.settingsModal.show();
                }, {
                    // The animation we want to use for the modal entrance
                    animation: 'slide-in-up'
                });
            } else {
                $scope.settingsModal.show();
            }
        };


        this.getBackgroundImage = function(lat, lng, locString) {
            Flickr.search(locString, lat, lng).then(function(resp) {
                var photos = resp.photos;
                if(photos.photo.length) {
                    $scope.bgImages = photos.photo;
                    _this.cycleBgImages();
                }
            }, function(error) {
                console.error('Unable to get Flickr images', error);
            });
        };

        this.getWoeid = function(lat, lng) {
            var q = $q.defer();

            Flickr.getWoeid(lat, lng).then(function(resp) {
                var places = resp.places;
                if(places.place.length) {
                    $scope.woeid = places.place[0].woeid;
                    console.log($scope.woeid);
                    q.resolve();
                }
            }, function(error) {
                console.error('Unable to get Flickr woeid', error);
                q.reject(error);
            });

            return q.promise;

        };

        this.getForecast = function(woeid, degrees) {
            console.log(woeid);
            YahooWeather.getForecast(woeid, degrees).then(function(resp) {
                $scope.results = resp.query.results.channel;
                console.log($scope.results);
            }, function(error) {
                alert('Unable to get forecast. Try again later');
                console.error(error);
            });
        }

        this.cycleBgImages = function() {
            $timeout(function cycle() {
                if($scope.bgImages) {
                    $scope.activeBgImage = $scope.bgImages[$scope.activeBgImageIndex++ % $scope.bgImages.length];
                }
                //$timeout(cycle, 10000);
            });
        };

        $scope.refreshData = function() {
            Geo.getLocation().then(function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;

                Geo.reverseGeocode(lat, lng).then(function(locString) {
                    _this.getBackgroundImage(lat, lng, locString);
                });
                $scope.settings = Settings.getSettings();
                _this.getWoeid(lat, lng).then( function() {
                        _this.getForecast($scope.woeid, $scope.settings.tempUnits);
                    }
                );


            }, function(error) {
                alert('Unable to get current location: ' + error);
            });
        };

        $scope.refreshData();
    }).controller('SettingsCtrl', function($scope, Settings) {
        $scope.settings = Settings.getSettings();

        // Watch deeply for settings changes, and save them
        // if necessary
        $scope.$watch('settings', function(v) {
            Settings.save();
        }, true);

        $scope.closeSettings = function() {
            $scope.modal.hide();
        };

    });
