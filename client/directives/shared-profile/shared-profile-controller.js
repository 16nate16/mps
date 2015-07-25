angular
    .module('app')
    .controller('SharedProfileController', ['$scope', '$http', 'User', '$location', '$rootScope', '$state', 'Auth', 'RecommendationAlpha',
        function($scope, $http, User, $location, $rootScope, $state, Auth, RecommendationAlpha) {
            $scope.user = {profile:{}};

            $scope.$on('new-shared-profile', function ($event, newProfile) {
                var user = newProfile;
                var notificationIndex = 0;
                $rootScope.notifications = $rootScope.notifications || [];
                user.password = 'temp';
                user.sourceType = 'publicRegistrationPage';
                user.source = $state.params.source;
                //todo: NATE LOOK HERE
                user.sharedProfile = $scope.user.sharedProfile;
                User
                    .create(user)
                    .$promise
                    .then(function () {
                        $scope.registrationComplete = true;
                        $rootScope.notifications[notificationIndex] = 'Data entry completed! Please check your email for confirmation.';
                        notificationIndex = notificationIndex + 1;
                        console.log('created user');
                        console.log(user);
                    }, function(res) {
                        $rootScope.notifications[notificationIndex] = 'Email already in use. Please try a different email or login.';
                        notificationIndex = notificationIndex + 1;
                    });
            });

            //This is for edit mode of an existing shared profile, in the provider controller we need to
            if ($state.params.id) {

                var user = Auth.init();

                //todo: load existing shared profile to display on front end

                //todo: pass back auth token on every call, on the back end check if owner or provider and act accordingly
                //currently this will blindly update the profile parameter
                $scope.updateProfile = function () {
                    User.prototype$updateAttributes({ id: $state.params.id }, {'profile':$scope.user.profile})
                        .$promise.then(function(user) {
                            console.log('profile saved');
                        });
                };

                //todo: the 'shared profile' should move into another model and be protected via the built-in ACL instead of manually checking permissions
            }

            if ($state.params.source) {
                var recId = $state.params.source;
                RecommendationAlpha.findById({ id: recId })
                    .$promise
                    .then(function (recommendationAlpha) {
                        var providerId = recommendationAlpha.providerId;
                        User.findById({ id: providerId })
                            .$promise
                            .then(function (user) {
                                $scope.provider = user;
                            });
                    });
            }
        }
    ]);
