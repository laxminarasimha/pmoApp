 (function() {

 'use strict';
 
 angular.module('pmoApp').controller('statusCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'statusService'];
  
 function Controller($scope, $rootScope, statusService) {
 $scope.mongoStatusData = [];
 
 
 $rootScope.Title = "Status Listing";
 getStatusData(statusService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.status = {};
 }
 
 $scope.deleteStatus = function(id) {
     if (confirm('Are you sure to delete?')) {
     statusService.deleteStatus(id).then(function(res) {
     if (res.data == "deleted") {
       getStatusData(statusService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editStatus = function (id) {
     $rootScope.Title = "Edit Status";
     statusService.getStatusForID(id).then(function(res) {
     $scope.status = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(status) {
     if ($scope.statusForm.$valid) {
     statusService.updateStatus(status).then(function(res) {
     if (res.data == "updated") {
        getStatusData(statusService,$scope);
        $scope.status = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createStatus = function(status) {
     $rootScope.Title = "Create Status";
     $scope.IsSubmit = true;
     if ($scope.statusForm.$valid) {
         statusService.createStatus(status).then(function(res) {
         if (res.data == "created") {
            getStatusData(statusService,$scope);
            $scope.status = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 }
 }

 function getStatusData(statusService,$scope){
      statusService.getStatus().then(function(res) {
         $scope.mongoStatusData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 })();
