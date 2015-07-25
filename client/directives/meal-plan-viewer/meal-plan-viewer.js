/*global angular, $ */
/**
 * @ngdoc directive
 * @name signportal
 * @description The wrapper directive around the skyslopeSignatureBox, providing a scrollable window over documents images containing signature fixtures.
 */
angular.module('app')
    .directive('mealPlanViewer', ['$log', '$http',
        function ($log, $http) {
            'use strict';
            return {
                // used as an element only (e.g., <mealPlanViewer></mealPlanViewer>)
                restrict: 'E',
                scope: {
                    recommendation: '='
                },
                // replace the entire element with the contents of viewer
                replace: true,
                templateUrl: 'directives/meal-plan-viewer/meal-plan-viewer.html',
                link: function ($scope, element, attrs) {
                    var mode = attrs.mode || 'view';
                    $scope.$on('recommendation', function (event, recommendation) {
                        console.log('received recommendation');
                        console.log(recommendation);
                        if (recommendation && recommendation.meals) {
                            angular.forEach(recommendation.meals, function (meal) {
                                angular.forEach(meal.items, function (mealItem) {
                                    if (mealItem.name === 'cheddar') {
                                        mealItem.ndbno = '01009';
                                    } else if(mealItem.name === 'chicken') {
                                        mealItem.ndbno = '05062';
                                    }
                                    if (mealItem.ndbno) {
                                        var getUrl = 'http://api.nal.usda.gov/usda/ndb/reports/?ndbno=' + mealItem.ndbno + '&type=b&format=json&api_key=UH64vIMbVK8hIGwweLpItnZ7y5VDson50HFEiZ4E';
                                        $log.debug('URL: ' + getUrl);
                                        var promise = $http.get(getUrl);
                                        promise.success(function(data, status) {
                                            $log.debug('nutritional data GET ndbno=' + mealItem.ndbno + ' = ' + JSON.stringify(data));
                                            mealItem.usdaData = data;
                                        });
                                    }
                                });
                            });

                            $scope.convertedValue = function (value, mealItem) {
                                if (mealItem.unitOfMeasurement === 'g') {
                                    value = (value * (mealItem.quantity / 100)).toFixed(2);
                                }
                                return value;
                            };
                        }
                    });
                }
            };
        }]);
