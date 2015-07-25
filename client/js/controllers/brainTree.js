angular
  .module('app')
  .controller('BrainTreeController', ['$scope', '$state', 'BrainTreeTransaction', '$http', '$log', '$rootScope', function($scope, $state, BrainTreeTransaction, $http, $log, $rootScope) {

    var defaultModel = { orderLines: [{}], total: 0 };
    $rootScope.layoutSettings = { showAdminMenu: true };

    ////// BEGIN CREATE TRANSACTION
    $scope.brainTreeTransaction = angular.copy(defaultModel);
    $scope.brainTreeTransaction.getTotal = function() {
      if(!$scope.brainTreeTransaction.orderLines || !$scope.brainTreeTransaction.orderLines[0].amount) {
        return 0;
      }
      return $scope.brainTreeTransaction.orderLines.reduceRight(function(previousValue, currentValue, index, array) {
        return previousValue + (currentValue.amount ? Number(currentValue.amount) : 0);
      }, 0);
    };

    $scope.addBrainTreeTransaction = function(form) {
      BrainTreeTransaction
        .create($scope.brainTreeTransaction)
        .$promise
        .then(function() {
          $scope.brainTreeTransaction = angular.copy(defaultModel);
          form.$setPristine();
        });
    };
    ////// END CREATE TRANSACTION

    ////// BEGIN LIST TRANSACTIONS
    $scope.transactions = [];
    function getBrainTreeTransactions() {
      BrainTreeTransaction
        .find()
        .$promise
        .then(function(results) {
          $scope.transactions = results;
        });
    }
    getBrainTreeTransactions();
    ////// END LIST TRANSACTIONS


    ////// BEGIN VIEW TRANSACTION
    //TODO: Do not auto-generate a new token every time the page is loaded, save the token for 24 hours and reuse
    if($state.current.name === 'customerViewBrainTreeTransaction') {
      $rootScope.layoutSettings.showAdminMenu = false;
      var brainTreeTransactionId = $state.params.id;
      BrainTreeTransaction.findById(
        { id: brainTreeTransactionId },
        function(transaction) {
          if(!transaction.clientToken) {
            $http.get('http://0.0.0.0:3000/generateBrainTreeClientToken').
              success(function(data, status, headers, config) {
                $log.debug("GENERATED CLIENT TOKEN: " + data);
                braintree.setup(data, "dropin", { container: "checkout" });
                //save token
              }).
              error(function(data, status, headers, config) {
                console.error(data);
              });
          } else {
            //reuse token from model
          }
          $scope.transaction = transaction
        },
        function(err) { /* ... */ });
    }
    ////// END VIEW TRANSACTION

  }]);
