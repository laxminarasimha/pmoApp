
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('designationCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'designationService'];
  
 function Controller($scope, $rootScope, designationService) {
 $scope.mongoDesignationData = [];
 
 
 $rootScope.Title = "Designation Listing";
 getDesignationData(designationService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.designation = {};
 }
 
 $scope.deleteDesignation = function(id) {
     if (confirm('Are you sure to delete?')) {
     designationService.deleteDesignation(id).then(function(res) {
     if (res.data == "deleted") {
       getDesignationData(designationService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editDesignation = function (id) {
     $rootScope.Title = "Edit Designation";
     designationService.getDesignationForID(id).then(function(res) {
     $scope.designation = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(designation) {
     if ($scope.designationForm.$valid) {
     designationService.updateDesignation(designation).then(function(res) {
     if (res.data == "updated") {
        getDesignationData(designationService,$scope);
        $scope.designation = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createDesignation = function(designation) {
     $rootScope.Title = "Create Designation";
     $scope.IsSubmit = true;
     if ($scope.designationForm.$valid) {
         designationService.createDesignation(designation).then(function(res) {
         if (res.data == "created") {
            getDesignationData(designationService,$scope);
            $scope.designation = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 }
 }

 function getDesignationData(designationService,$scope){
      designationService.getDesignations().then(function(res) {
         $scope.mongoDesignationData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 })();