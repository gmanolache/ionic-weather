angular.module('ionic.weather.services', ['ngResource'])

    .constant('DEFAULT_SETTINGS', {
        'tempUnits': 'f'
    })

    .factory('Settings', function($rootScope, DEFAULT_SETTINGS) {
        var _settings = {};
        try {
            _settings = JSON.parse(window.localStorage['settings']);
        } catch(e) {
        }

        // Just in case we have new settings that need to be saved
        _settings = angular.extend({}, DEFAULT_SETTINGS, _settings);

        if(!_settings) {
            window.localStorage['settings'] = JSON.stringify(_settings);
        }

        var obj = {
            getSettings: function() {
                return _settings;
            },
            // Save the settings to localStorage
            save: function() {
                window.localStorage['settings'] = JSON.stringify(_settings);
                $rootScope.$broadcast('settings.changed', _settings);
            },
            // Get a settings val
            get: function(k) {
                return _settings[k];
            },
            // Set a settings val
            set: function(k, v) {
                _settings[k] = v;
                this.save();
            },

            getTempUnits: function() {
                return _settings['tempUnits'];
            }
        }

        // Save the settings to be safe
        obj.save();
        return obj;
    })

    .factory('Geo', function($q) {
        return {
            reverseGeocode: function(lat, lng) {
                var q = $q.defer();

                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'latLng': new google.maps.LatLng(lat, lng)
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if(results.length > 0) {
                            var r = results[0];
                            var a, types;
                            var parts = [];
                            var foundLocality = false;
                            var foundState = false;
                            for(var i = 0; i < r.address_components.length; i++) {
                                a = r.address_components[i];
                                types = a.types;
                                for(var j = 0; j < types.length; j++) {
                                    if(!foundLocality && types[j] == 'locality') {
                                        foundLocality = true;
                                        parts.push(a.long_name);
                                    } else if(!foundState && types[j] == 'administrative_area_level_1') {
                                        foundState = true;
                                        //parts.push(a.long_name);
                                    }
                                }
                            }
                            q.resolve(parts.join(' '));
                        }
                    } else {
                        q.reject(results);
                    }
                })

                return q.promise;
            },
            getLocation: function() {
                var q = $q.defer();

                navigator.geolocation.getCurrentPosition(function(position) {
                    q.resolve(position);
                }, function(error) {
                    q.reject(error);
                });

                return q.promise;
            }
        };
    })

    .factory('Flickr', function($q, $resource, FLICKR_API_KEY) {
        var baseUrl = 'http://api.flickr.com/services/rest/'


        var flickrSearch = $resource(baseUrl, {
            method: 'flickr.groups.pools.getPhotos',
            group_id: '1463451@N25',
            safe_search: 1,
            jsoncallback: 'JSON_CALLBACK',
            api_key: FLICKR_API_KEY,
            format: 'json'
        }, {
            get: {
                method: 'JSONP'
            }
        });

        var flickrGetWoeid = $resource(baseUrl, {
            method: 'flickr.places.findByLatLon',
            jsoncallback: 'JSON_CALLBACK',
            api_key: FLICKR_API_KEY,
            format: 'json'
        }, {
            get: {
                method: 'JSONP'
            }
        });

        return {
            search: function(tags, lat, lng) {
                var q = $q.defer();

                flickrSearch.get({
                    tags: tags,
                    lat: lat,
                    lng: lng
                }, function(val) {
                    q.resolve(val);
                }, function(httpResponse) {
                    q.reject(httpResponse);
                });

                return q.promise;
            },
            getWoeid: function(lat, lng) {
                var q = $q.defer();

                flickrGetWoeid.get({
                    lat: lat,
                    lon: lng
                }, function(val) {
                    q.resolve(val);
                }, function(httpResponse) {
                    q.reject(httpResponse);
                });

                return q.promise;
            }
        };
    })


    .factory('YahooWeather', function($q, $resource) {
        var locationUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20woeid%3D:woeid%20and%20u%3D%27:degrees%27&format=json&callback=JSON_CALLBACK";

        var forecastResource = $resource(locationUrl, {
            jsoncallback: 'JSON_CALLBACK',
            format: 'json'
        }, {
            get: {
                method: 'JSONP'
            }
        });

        return {
            getForecast: function(woeid, degrees) {
                var q = $q.defer();

                forecastResource.get({
                    woeid : woeid,
                    degrees : degrees
                }, function(resp) {
                    q.resolve(resp);
                }, function(httpResponse) {
                    q.reject(httpResponse);
                });

                return q.promise;
            }
        }
    })
