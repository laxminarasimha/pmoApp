
 (function() {

 
 'use strict';
 
 angular.module('pmoApp').controller('roleCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'roleService'];
  
 function Controller($scope, $rootScope, roleService) {
 $scope.mongoRoleData = [];
 
 
 $rootScope.Title = "Role Listing";
 getRoleData(roleService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.role = {};
 }
 
 $scope.deleteRole = function(id) {
     if (confirm('Are you sure to delete?')) {
     roleService.deleteRole(id).then(function(res) {
     if (res.data == "deleted") {
       getRoleData(roleService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editRole = function (id) {
     $rootScope.Title = "Edit Role";
     roleService.getRoleForID(id).then(function(res) {
     $scope.role = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(role) {
     if ($scope.roleForm.$valid) {
     roleService.updateRole(role).then(function(res) {
     if (res.data == "updated") {
        getRoleData(roleService,$scope);
        $scope.role = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createRole = function(role) {
     $rootScope.Title = "Create Role";
     $scope.IsSubmit = true;
     if ($scope.roleForm.$valid) {
         roleService.createRole(role).then(function(res) {
         if (res.data == "created") {
            getRoleData(roleService,$scope);
            $scope.role = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 }
 }

 function getRoleData(roleService,$scope){
      roleService.getRole().then(function(res) {
         $scope.mongoRoleData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

})();