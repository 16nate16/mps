angular
    .module('app')
    .controller('HomeController', ['$scope', '$modal',
        function ($scope, $modal) {
            $scope.openGetStartedModal = function() {
                $modal.open({
                    templateUrl: 'views/modals/get-started-modal.html',
                    controller: ('modalController', ['$scope', '$modalInstance', 'ProviderWaitList', function($modalScope, $modalInstance, ProviderWaitList) {
                        function addWaitListEntry(waitListEntry) {
                            ProviderWaitList
                                .create(waitListEntry)
                                .$promise
                                .then(function () {
                                    $modalScope.done = true;
                                    $modalScope.close();
                                });
                        }
                        $modalScope.addWaitListEntry = addWaitListEntry;
                        $modalScope.close = function() {
                            $modalInstance.dismiss();
                        }
                    }])
                });
            }
        }]);
