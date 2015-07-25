angular
  .module('app')
  .controller('ProviderController', ['$scope', '$state', '$http', '$log', '$rootScope', 'Auth', 'RecommendationAlpha',
    function($scope, $state, $http, $log, $rootScope, Auth, RecommendationAlpha) {
      var user = Auth.init(),
          recommendations = [];
      if ($state.current.name === 'providerRecommendations') {
        RecommendationAlpha.find(
            //{  },
            { filter: { where: { providerId: user.userId } } },
            function(list) {
              recommendations = list;
              $scope.recommendations = recommendations;
            },
            function (errorResponse) { /* error */ }
        );
      }
    }
  ]);
