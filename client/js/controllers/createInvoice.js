angular
  .module('app')
  .controller('CreateInvoiceController', ['$scope', '$state', 'Invoice', function($scope, $state, Invoice) {
    $scope.invoice = {};
  }]);
