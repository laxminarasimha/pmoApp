
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('availableActualMandaysCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile','availableActualMandaysService',
                       'resourceService','roleService','regionService','projectService','resourceTypeService'];
  
 function Controller($scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, $compile, availableActualMandaysService,
                     resourceService,roleService,regionService,projectService,resourceTypeService) {

 
 var app = $scope;

 $scope.availableActualMandaysData = [];
 //getAvailableActualMandaysData(availableActualMandaysService,$scope);

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
  
 $scope.clearFields = function (){
     $scope.availableActualMandaysDTO = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }
 

 
 
 $scope.getAvailableActualMandays = function(availableActualMandaysDTO) {
     $scope.IsSubmit = true;
     if ($scope.availableActualMandaysForm.$valid) {
         availableActualMandaysService.getAvailableActualMandays(availableActualMandaysDTO).then(function(res) {
         if (res.data == "created") {
            getAvailableActualMandaysData(availableActualMandaysService,$scope);
            $scope.availableActualMandaysDTO = {};
            app.loading =false;
            app.successMsg = "Data fetched successfully";
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


//=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
        
//=============================================================//


 }

 function getAvailableActualMandaysData(availableActualMandaysService,$scope){
      availableActualMandaysService.getMappedResources().then(function(res) {
         $scope.availableActualMandaysData = res.data;
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

 })();