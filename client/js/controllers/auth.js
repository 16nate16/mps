angular
  .module('app')
  .controller('AuthController', ['$scope', '$http', 'User', '$location', '$rootScope', '$state', 'Auth', '$rootScope',
    function($scope, $http, User, $location, $rootScope, $state, Auth, $rootScope) {

      function login(credentials, cb) {
        User.login(credentials)
            .$promise
            .then(function(response) {
              // save response to localstorage and rootscope
              Auth.setUser(response);
              if($state.current.name === 'auth.consumerLogin') {
                $state.go('consumer');
              } else {
                $state.go('providerRecommendations');
              }
              if(cb) {
                cb(response);
              }
            }, function(res) {
              $rootScope.notifications[notificationIndex] = 'Invalid username or password. Please try again...';
              notificationIndex = notificationIndex + 1;
            });
      }

      //todo: auto logs you in, remove this later!
      var autoLogin = false;
      if(autoLogin) {
        login({email: "fadichalfoun@gmail.com", password: "p"});
      }

      function goHome() {
        var user = Auth.getUser();
        if (user) {
          if (user.user.isProvider) {
            $state.go('provider.home');
          } else {
            $state.go('consumer');
          }
        } else {
          $state.go('login');
        }
      }

      if ($state.$current.name === 'auth.home') {
        goHome();
      }

      //sets user to rootScope
      var user = Auth.init(true);
      if(user) {
        goHome();
      }

      $scope.user = {profile:{}};
      $rootScope.notifications = [];
      var notificationIndex = 0;

      $scope.layoutSettings = {};
      $scope.credentials = {};
      $scope.registrationComplete = false;

      $scope.login = function() {
        //store returned token back into local storage
        login($scope.credentials);
      };

      $scope.register = function(isProvider) {
        var user = $scope.user;
        if(user.password != user.password2) {
          $rootScope.notifications[notificationIndex] = 'Passwords do not match. Please try again...';
          notificationIndex = notificationIndex + 1;
        } else {
            user.password = 'a';
            user.password2 = undefined;
            user.isProvider = isProvider;
            user.sourceType = 'publicRegistrationPage';
            User
              .create(user)
              .$promise
              .then(function () {
                $scope.registrationComplete = true;
              }, function(res) {
                  $rootScope.notifications[notificationIndex] = 'Email already in use. Please try a different email or login.';
                  notificationIndex = notificationIndex + 1;
                });
        }
      };

      //This is not only confirming the user's email but setting the password for the user and logging user in after
      $scope.setPassword = function() {
        var credentials = $scope.credentials;
        if(!credentials.password || credentials.password != credentials.password2) {
          $rootScope.notifications[notificationIndex] = 'Invalid password or passwords do not match. Please try again...';
          notificationIndex = notificationIndex + 1;
        } else {
          User
              .confirm({
                uid: $state.params.uid,
                token: $state.params.verificationToken
              })
              .$promise
              .then(function () {
                User.prototype$updateAttributes({ id: $state.params.uid }, {'password':credentials.password})
                    .$promise.then(function(user) {
                      user.password = credentials.password;
                      login(user);
                    });
              }, function(res) {
                $rootScope.notifications[notificationIndex] = 'Error verifying account.';
                notificationIndex = notificationIndex + 1;
              });
        }
      };
    }
  ]);
