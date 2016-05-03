angular.module("ngWeather", [])
    .directive("ngWeather", function () {
        return {
            restrict: "E",
            replace: true,
            scope: {
                city: '@?'
                , cityId: '@?'
                , appId: '@'
                , locale: '@'
            },
            controller: ["$http", "$scope", "$locale", '$filter'
                , function ($http, $scope, $locale, $filter) {
                    var dictionary = {
                        it: {
                            srverror: "Non sono riuscito a recuperare i dati.",
                            notFound: "Città non trovata.",
                            configerror: "Ci sono alcuni errori nella configurazione!",
                            updatedAtText: "Ultimo aggiornamento",
                            updatedAtDate: "Oggi alle ",
                            newLocation: "Inserire nuova località"
                        },
                        en: {
                            srverror: "Data can't be retrieved.",
                            notFound: "City not found.",
                            configerror: "There are some errors in your config!",
                            updatedAtText: "Last update",
                            updatedAtDate: "Today at ",
                            newLocation: "Enter new location"
                        }
                    };

                    var localeId = $locale.id || "en";
                    if (!!$scope.locale) {
                        localeId = $scope.locale;
                    }
                    var lang = "en";
                    $scope.units = [
                        {
                            key: "imperial",
                            symbol: "°F"
                        },
                        {
                            key: "metric",
                            symbol: "°C"
                        },
                        {
                            key: "absolute",
                            symbol: "°K"
                        }];
                    $scope.unit = $scope.units[0];
                    if (localeId.indexOf("it") > -1) {
                        lang = "it";
                        $scope.unit = $scope.units[1];
                    }
                    $scope.newLocationLabel = dictionary[lang]["newLocation"];

                    $scope.updatedAtText = dictionary[lang]["updatedAtText"];

                    $scope.getTemperatureByCityId = function (cityId) {
                        var request = createRequest();
                        request.url+= "&id=" + cityId;
                        getTemperature(request);
                    };

                    $scope.getTemperatureByCityName = function (city) {
                        var request = createRequest();
                        request.url+= "&q=" + city;
                        getTemperature(request);
                    };

                    function createRequest(){
                        var apiUrl = "http://api.openweathermap.org/data/2.5/weather";
                        return {
                            method: "GET",
                            url: apiUrl + "?units=" + $scope.unit["key"] + '&appid=' + $scope.appId
                        };
                    }

                    function getTemperature(request) {

                        $scope.isError = false;
                        $scope.isLoading = true;
                        $http(request).then(function (response) {
                            if (!response || !response.data) {
                                throwError("srverror");
                                return false;
                            }
                            if(response.data.cod === "404"){
                                throwError("notFound");
                                return false;
                            }
                            var data = response.data;
                            $scope.city = data.name || $scope.city;
                            $scope.updatedAtDate = dictionary[lang]["updatedAtDate"] + $filter("date")(new Date(), "HH:mm");
                            $scope.weather = data.weather[0].main;
                            $scope.weatherCode = data.weather[0].id;
                            $scope.temperature = parseInt(data.main.temp);
                        }, function () {
                            throwError("srverror");
                        })['finally'](function () {
                            $scope.isLoading = false;
                        });
                    }

                    function throwError(dictionaryKey) {
                        $scope.isError = true;
                        $scope.errorMessage = dictionary[lang][dictionaryKey];
                    }

                    $scope.reload = function (city) {
                        if (!city && !$scope.city && !$scope.cityId) {
                            throwError("configerror");
                            return;
                        }
                        if(!!city){
                            $scope.city = city;
                            return $scope.getTemperatureByCityName($scope.city);
                        }
                        if (!!$scope.cityId) {
                            return $scope.getTemperatureByCityId($scope.cityId);
                        }
                        $scope.getTemperatureByCityName($scope.city);
                    };

                    $scope.setLocation = function () {
                        $scope.reload($scope.newCity);
                        $scope.newCity = "";
                        $scope.showSettings = false;
                    };

                    $scope.reload();
                }],
            templateUrl: "./ng-weather/template/template1.html"
        };
    });