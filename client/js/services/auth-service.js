/**
 * @ngdoc service
 * @name Auth
 * @description
 *
 * The `auth` module provides services for managing client-side authorization and authentication.
 * WARNING: All security measures taken place here are moot as security is handled server-side, however,
 * what this service is doing is helping route the user to the correct location based on the identity
 * of the user.
 */
angular.module('app')
  .service('Auth', ['localStorageService', '$rootScope', '$state',
    function (localStorageService, $rootScope, $state) {
      this.setUser = function(user) {
        localStorageService.set('user', user);
      };
      this.getUser = function() {
        return localStorageService.get('user');
      };
      this.logout = function() {
        localStorageService.remove('user');
        $rootScope.authorizedUser = false;
        delete $rootScope.layoutSettings;
      };
      this.init = function(override) {
        var user = this.getUser();
        if(!override && !user) {
          $rootScope.authorizedUser = false;
          $state.go('auth.login');
          return user;
        }
        $rootScope.authorizedUser = user;
        //TODO: In the future when we have different user types, handle that here
        $rootScope.layoutSettings = { showProviderMenu: true };
        return user;
      }
    }]);
