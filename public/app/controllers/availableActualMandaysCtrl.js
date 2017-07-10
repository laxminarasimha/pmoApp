
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('availableActualMandaysCtrl', Controller);
 
 Controller.$inject = ['$filter','$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile','availableActualMandaysService',
                       'resourceService','roleService','regionService','projectService','resourceTypeService','holidayListService',
                       'resourceMappingService','locationService','monthlyHeaderListService'];
  
 function Controller($filter,$scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, $compile, availableActualMandaysService,
                     resourceService,roleService,regionService,projectService,resourceTypeService,holidayListService,
                     resourceMappingService,locationService,monthlyHeaderListService) {

 
 var app = $scope;

 

 $scope.mappedResourceList = [];
 getMappedResourceData(resourceMappingService,$scope);

 $scope.locationList = [];
 getLocationData(locationService,$scope);


 $scope.resourceList = [];
 getResourceData(resourceService,$scope);

 $scope.roleList = [];
 getRoleData(roleService,$scope);



 $scope.regionList = [];
 getRegionData(regionService,$scope);
 
   
 $scope.resourceTypeList = [];
 getResourceTypeData(resourceTypeService,$scope);


 $scope.projectList = [];
 getProjectData(projectService,$scope);


 $scope.headingList = [];
 prepareTableHeading($scope,monthlyHeaderListService);
  
 $scope.clearFields = function (){
     $scope.availableActualMandaysDTO = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";


     prepareActualAvailableMandaysData($scope);

    

 }
 

 //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
        
//=============================================================//


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

 

 function getRegionData(regionService,$scope){
      regionService.getRegion().then(function(res) {
         $scope.regionList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }


  function getResourceTypeData(resourceTypeService,$scope){
      resourceTypeService.getResourceType().then(function(res) {
         $scope.resourceTypeList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getProjectData(projectService,$scope){
      projectService.getProject().then(function(res) {
         $scope.projectList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 
 function getMappedResourceData(resourceMappingService,$scope){
      resourceMappingService.getMappedResources().then(function(res) {
         $scope.mappedResourceList = res.data;
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


    function prepareTableHeading($scope,monthlyHeaderListService){
       

        $scope.headingList = monthlyHeaderListService.getHeaderList();

    }

    

 })();