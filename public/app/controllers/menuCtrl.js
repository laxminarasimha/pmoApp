(function() {
 'use strict';
 
 angular.module('pmoApp').controller('menuCtrl', Controller);
 
 Controller.$inject = ['$scope', '$http', 'Auth'];
 
 function Controller($scope, $http,Auth) {
 
 
 $http.get("app/data/menuData.txt").then(function(response) {
              $scope.menuData = response.data;
          });
 }
 
 })();
