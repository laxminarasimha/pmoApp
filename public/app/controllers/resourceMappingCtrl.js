
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('resourceMappingCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'resourceMappingService','resourceService','roleService','locationService',
                       'regionService','skillSetService','statusService'];
  
 function Controller($scope, $rootScope, resourceMappingService,resourceService,roleService,locationService,
                        regionService,skillSetService,statusService) {

 //$scope.resourcemap = {};
 $rootScope.Title = "Resource Map Listing";

 $scope.mongoMappedResourceData = [];
 getMappedResourceData(resourceMappingService,$scope);

 $scope.resourceList = [];
 getResourceData(resourceService,$scope);

 $scope.roleList = [];
 getRoleData(roleService,$scope);


 $scope.locationList = [];
 getLocationData(locationService,$scope);

 $scope.regionList = [];
 getRegionData(regionService,$scope);
 
 
 $scope.skillSetList = [];
 getSkillSetData(skillSetService,$scope);

 $scope.statusList = [];
 getStatusData(statusService,$scope);
 
  
 $scope.clearFields = function (){
 
      alert(resourcemap.resourcedesignation+"==="+resourcemap.resourcealias);
     $scope.resourcemap = {};
 }
 
 $scope.deleteResourceMapping = function(id) {
     if (confirm('Are you sure to delete?')) {
     resourceMappingService.deleteResourceMapping(id).then(function(res) {
     if (res.data == "deleted") {
       getMappedResourceData(resourceMappingService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editResourceMapping = function (id) {
     $rootScope.Title = "Edit Designation";
     resourceMappingService.getMappedResourceForID(id).then(function(res) {
     $scope.resourcemap = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(resourcemap) {
     if ($scope.resourceMappingForm.$valid) {
     resourceMappingService.updateResourceMapping(resourcemap).then(function(res) {
     if (res.data == "updated") {
        getMappedResourceData(resourceMappingService,$scope);
        $scope.resourcemap = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createResourceMapping = function(resourcemap) {
    alert(resourcemap.resourcename+"==="+resourcemap.designation);
     $rootScope.Title = "Create resourcemap";
     $scope.IsSubmit = true;
     if ($scope.resourceMappingForm.$valid) {
         resourceMappingService.createResourceMapping(resourcemap).then(function(res) {
         if (res.data == "created") {
            getMappedResourceData(resourceMappingService,$scope);
            $scope.resourcemap = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 }
 }

 function getMappedResourceData(resourceMappingService,$scope){
      resourceMappingService.getMappedResources().then(function(res) {
         $scope.mongoMappedResourceData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.resourceList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getRoleData(roleService,$scope){
      roleService.getRole().then(function(res) {
         $scope.roleList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getLocationData(locationService,$scope){
      locationService.getLocation().then(function(res) {
         $scope.locationList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getRegionData(regionService,$scope){
      regionService.getRegion().then(function(res) {
         $scope.regionList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }


 function getSkillSetData(skillSetService,$scope){
       skillSetService.getSkillSets().then(function(res) {
           $scope.skillSetList = res.data;
           }).catch(function(err) {
           console.log(err);
         });
 }

 function getStatusData(statusService,$scope){
      statusService.getStatus().then(function(res) {
         $scope.statusList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 })();