
 (function() {

 
 'use strict';
 
 angular.module('pmoApp').controller('resourceTypeCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'resourceTypeService'];
  
 function Controller($scope, $rootScope, resourceTypeService) {
 $scope.mongoResourceTypeData = [];
 var app = $scope;
 
 $rootScope.Title = "ResourceType Listing";
 getResourceTypeData(resourceTypeService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.resourceType = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }
 
 $scope.deleteResourceType = function(id) {
     if (confirm('Are you sure to delete?')) {
     resourceTypeService.deleteResourceType(id).then(function(res) {
     if (res.data == "deleted") {
       getResourceTypeData(resourceTypeService,$scope);
       app.loading = false;
       app.successMsg = "ResourceType Deleted successfully";
       app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editResourceType = function (id) {
     $rootScope.Title = "Edit resourceType";
     resourceTypeService.getResourceTypeForID(id).then(function(res) {
     $scope.resourceType = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(resourceType) {
     if ($scope.resourceTypeForm.$valid) {
     resourceTypeService.updateResourceType(resourceType).then(function(res) {
     if (res.data == "updated") {
        getResourceTypeData(resourceTypeService,$scope);
        $scope.resourceType = {};
        app.loading =false;
        app.successMsg = "ResourceType Updated successfully";
        app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createResourceType = function(resourceType) {
     $rootScope.Title = "Create Resource Type";
     $scope.IsSubmit = true;
     if ($scope.resourceTypeForm.$valid) {
         resourceTypeService.createResourceType(resourceType).then(function(res) {
         if (res.data == "created") {
            getResourceTypeData(resourceTypeService,$scope);
            $scope.resourceType = {};
            app.loading =false;
            app.successMsg = "ResourceType created successfully";
            app.errorMsg = false;
         }
         }).catch(function(err) {
         console.log(err);
         });
     }else
     {
            app.loading =false;
            app.successMsg = false;
            app.errorMsg = "Please Enter Required value";
            app.errorClass = "error"
     }
     
 }
 }

 function getResourceTypeData(resourceTypeService,$scope){
      resourceTypeService.getResourceType().then(function(res) {
         $scope.mongoResourceTypeData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

})();