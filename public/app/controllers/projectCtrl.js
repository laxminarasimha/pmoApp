(function() {
 'use strict';
 
angular.module('pmoApp').controller('projectCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'projectService','regionService','resourceService', 'DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, projectService,regionService,resourceService, DTOptionsBuilder, DTColumnBuilder) {
 $scope.mongoProjectData = [];
 $scope.regionList = [];
 var app = $scope;
 
 $rootScope.Title = "Project Listing";
 getProjectData(projectService,$scope); 
 getRegionData(regionService,$scope);


 $scope.resourceList = [];
 getResourceData(resourceService,$scope);
  
 $scope.clearFields = function (){
 
     $scope.project = {};
	 app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }
 
 $scope.deleteProject = function(id) {
     if (confirm('Are you sure to delete?')) {
     projectService.deleteProject(id).then(function(res) {
     if (res.data == "deleted") {
       getProjectData(projectService,$scope);
	   app.loading = false;
       app.successMsg = "Project Deleted successfully";
       app.errorMsg = false;
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
		app.loading =false;
        app.successMsg = "Project Updated successfully";
        app.errorMsg = false;
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
			app.loading =false;
            app.successMsg = "Project created successfully";
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


function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.resourceList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }
 
   })();