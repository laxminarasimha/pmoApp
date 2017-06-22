(function() {
 'use strict';
 
angular.module('pmoApp').controller('resourceCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'resourceService'];
  
 function Controller($scope, $rootScope, resourceService) {
 $scope.mongoResourceData = [];
 
 
 $rootScope.Title = "Resource Listing";
 getResourceData(resourceService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.resource = {};
 }
 
 $scope.deleteResource = function(id) {
     if (confirm('Are you sure to delete?')) {
     resourceService.deleteResource(id).then(function(res) {
     if (res.data == "deleted") {
       getResourceData(resourceService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editResource = function (id) {
     $rootScope.Title = "Edit Resource";
     resourceService.getResourceForID(id).then(function(res) {
     $scope.resource = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(resource) {
     if ($scope.resourceForm.$valid) {
     resourceService.updateResource(resource).then(function(res) {
     if (res.data == "updated") {
        getResourceData(resourceService,$scope);
        $scope.resource = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createResource = function(resource) {
     $rootScope.Title = "Create Resource";
     $scope.IsSubmit = true;
     if ($scope.resourceForm.$valid) {
         resourceService.createResource(resource).then(function(res) {
         if (res.data == "created") {
            getResourceData(resourceService,$scope);
            $scope.resource = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 }
 }

 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.mongoResourceData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }
 
 })();