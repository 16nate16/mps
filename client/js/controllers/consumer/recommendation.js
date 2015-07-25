angular
  .module('app')
  .controller('ClientRecommendationController', ['$scope', '$state', '$log', 'RecommendationAlpha', 'Auth', '$rootScope',
    function($scope, $state, $log, RecommendationAlpha, Auth, $rootScope) {
      $rootScope.hidebg = true;
      RecommendationAlpha.findOne(
        { filter: { where: { id: $state.params.id } } },
        function(recommendation) {
          $scope.recommendation = recommendation;
          $scope.$broadcast('recommendation', recommendation.nutritionalRecommendation);
        },
        function(errorResponse) { /* error */ }
      );
    }
  ]);
