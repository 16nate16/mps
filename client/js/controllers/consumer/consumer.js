angular
  .module('app')
  .controller('ConsumerController', ['$scope', '$state', '$log', 'User', 'Auth',
    function($scope, $state, $log, User, Auth) {
      var authorizedUser = Auth.init();
      if(authorizedUser && authorizedUser.user.isProvider) {
        $state.go('provider');
      }
      $scope.recommendations = User.receivedRecommendations({ id: Auth.getUser().userId });
    }
  ]);
