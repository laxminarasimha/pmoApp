(function() {
 'use strict';
 
 angular.module('pmoApp').controller('menuCtrl', Controller);
 
 Controller.$inject = ['$scope', '$http'];
 
 function Controller($scope, $http) {
 
  $http.get("app/data/menuData.txt").then(function(response) {
              $scope.menuData = response.data;
          });
 
 }
 
 })();
