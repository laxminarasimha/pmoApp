(function() {
 'use strict';
 
angular.module('pmoApp').controller('projectCtrl', Controller);
 
<<<<<<< HEAD
 Controller.$inject = ['$scope', '$rootScope', 'projectService','regionService'];
  
 function Controller($scope, $rootScope, projectService,regionService) {
=======
 Controller.$inject = ['$scope', '$rootScope', 'projectService','regionService','resourceService', 'DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, projectService,regionService,resourceService, DTOptionsBuilder, DTColumnBuilder) {
>>>>>>> da618df17967fbd5e575886d6c146d2f4f8d5577
 $scope.mongoProjectData = [];
 $scope.regionList = [];
 
 
 $rootScope.Title = "Project Listing";
 getProjectData(projectService,$scope);
 getRegionData(regionService,$scope);
  
 $scope.clearFields = function (){
 
     $scope.project = {};
 }
 
 $scope.deleteProject = function(id) {
     if (confirm('Are you sure to delete?')) {
     projectService.deleteProject(id).then(function(res) {
     if (res.data == "deleted") {
       getProjectData(projectService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editProject = function (id) {
     $rootScope.Title = "Edit Project";
     projectService.getProjectForID(id).then(function(res) {
     $scope.project = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(project) {
     if ($scope.projectForm.$valid) {
     projectService.updateProject(project).then(function(res) {
     if (res.data == "updated") {
        getProjectData(projectService,$scope);
        $scope.project = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createProject = function(project) {
     $rootScope.Title = "Create Project";
     $scope.IsSubmit = true;
     if ($scope.projectForm.$valid) {
         projectService.createProject(project).then(function(res) {
         if (res.data == "created") {
            getProjectData(projectService,$scope);
            $scope.project = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 }

//=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
//=============================================================//

 }

 function getProjectData(projectService,$scope){
      projectService.getProject().then(function(res) {
         $scope.mongoProjectData = res.data;
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

   })();