(function() {
 'use strict';
 
angular.module('pmoApp').controller('resourceCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'resourceService','designationService','DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, resourceService, designationService, DTOptionsBuilder, DTColumnBuilder) {
 $scope.mongoResourceData = [];
 
 var app = $scope;
 
 $rootScope.Title = "Resource Listing";
 getResourceData(resourceService,$scope);

 $scope.designationList = [];
 getDesignationData(designationService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.resource = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = ""
 }
 
 $scope.deleteResource = function(id) {
     if (confirm('Are you sure to delete?')) {
     resourceService.deleteResource(id).then(function(res) {
     if (res.data == "deleted") {
       getResourceData(resourceService,$scope);
       app.loading = false;
       app.successMsg = "Resource Deleted successfully";
       app.errorMsg = false;
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
        app.loading =true;
        //Password = "default";
        $scope.resource.password = '$2a$10$z14k1dcNp7nPmB1s.ApNNe4NLYu.UbKd1lKcgARc3fDTeoPW9GlAC';
         resourceService.createResource(resource).then(function(res) {
         if (res.data == "created") {
            app.loading =true;
            getResourceData(resourceService,$scope);            
            $scope.resource = {};
            app.loading =false;
            app.successMsg = "Resource created successfully";
            app.errorMsg = false;
         }else{
            app.loading =false;
            app.successMsg = "Resource Updated successfully";
            app.errorMsg = false;
         }
         }).catch(function(err) {
         console.log(err);
         });
     }else{
            app.loading =false;
            app.successMsg = false;
            app.errorMsg = "Please Fill All Required Fields(*)";
            app.errorClass = "error"
     }
     
 }

  //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
//=============================================================//
 }

 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.mongoResourceData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getDesignationData(designationService,$scope){
      designationService.getDesignations().then(function(res) {
         $scope.designationList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }
 
 })();