angular
    .module('app')
    .controller('ProviderRecommendationController', ['$scope', '$state', '$log', 'Auth', 'RecommendationAlpha', '$rootScope', 'User',
        function ($scope, $state, $log, Auth, RecommendationAlpha, $rootScope, User) {

            var defaultModel = { client: { trainingSchedule: {}, goals: [{}] }, nutritionalRecommendation: { meals: [{items: [{}]}] } };
            var user = Auth.init();
            var notificationIndex = 0;

            var phone;
            User.findById({ id: Auth.getUser().userId })
                .$promise
                .then(function (user) {
                    phone = user.phone;
                });
            function generateEmail(client) {
                var clientName = client ? client.first : '(name)';
                var email = "Hi " + clientName + ",\n";
                email += "You will find your nutrition plan HERE.\n\n";
                email += "If you have any questions please don't hesitate to call/text/email. I often have clients text me pictures when trying to make nutrition choices.\n\n";
                email += "I hope you find your plan helpful. We can always revise this plan to better meet your needs and preferences.\n\n";
                email += "Cheers,\n" + Auth.getUser().user.first + "\n" + Auth.getUser().user.email + "\n" + phone;

                return email;
            }

            $rootScope.notifications = [];
            function editRecommendation() {
                $rootScope.notifications[notificationIndex] = 'Recommendation Saved...';
                notificationIndex = notificationIndex + 1;
                $rootScope.showGrowl = true;
                $scope.recommendation.$save();
            }

            $scope.createRecommendation = function (dataProcess) {
                var recommendation = {providerId: user.userId, clientEmail: $scope.newRecommendation.clientEmail};
                if (dataProcess === 'request') {
                    recommendation.requestDataFromClient = true;
                }
                RecommendationAlpha
                    .create(recommendation)
                    .$promise
                    .then(function (newRecommendation) {
                        $state.go('providerRecommendationsEdit', {id: newRecommendation.id});
                    });
            };

            if ($state.$current.name === 'providerRecommendationsEdit') {
                RecommendationAlpha.findOne(
                    { filter: { where: { id: $state.params.id } } },
                    function(recommendation) {
                        $scope.recommendation = recommendation;
                        $scope.recommendation.emailBody = generateEmail($scope.recommendation.clientData);
                    },
                    function(errorResponse) { /* error */ }
                );
                $scope.formAction = editRecommendation;
                $scope.removeMeal = function (meals, meal) {
                    meals.splice(meal.items.indexOf(meal), 1);
                };
                $scope.removeMealItem = function (meal, mealItem) {
                    meal.items.splice(meal.items.indexOf(mealItem), 1);
                };
                $scope.getUSDAData = function() {
                    $scope.$broadcast('recommendation', $scope.recommendation.nutritionalRecommendation);
                };
                $scope.save = function () {
                    $scope.recommendation.$save();
                };
            }

            //scope on emitted new data, broadcast to master label
        }]);
