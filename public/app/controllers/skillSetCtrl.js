
 (function() {
    
 'use strict';
 
 angular.module('pmoApp').controller('skillSetCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'skillSetService','DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, skillSetService, DTOptionsBuilder, DTColumnBuilder) {


 $scope.mongoSkillData = [];

 var app = $scope;
         

 $rootScope.Title = "Skill Set Listing";

 getSkillData(skillSetService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.skill = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = ""
 }
 
 $scope.deleteSkill = function(id) {
     if (confirm('Are you sure to delete?')) {
        app.loading = true;
     skillSetService.deleteSkillSet(id).then(function(res) {
     if (res.data == "deleted") {
       getSkillData(skillSetService,$scope);
       app.loading = false;
       app.successMsg = "Skillset Deleted successfully";
       app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editSkill = function (id) {
     $rootScope.Title = "Edit Skill Set";
     skillSetService.getSkillSetsForID(id).then(function(res) {
     $scope.skill = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(skill) {
     if ($scope.skillForm.$valid) {
     skillSetService.updateSkillSet(skill).then(function(res) {
     if (res.data == "updated") {
        getSkillData(skillSetService,$scope);
        $scope.skill = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createSkill = function(skill) {
     app.loading = true;
     app.successMsg = false;
     app.errorMsg = false;            
     $rootScope.Title = "Create Skill Set";
     $scope.IsSubmit = true;
     if ($scope.skillForm.$valid) {
         skillSetService.createSkillSet(skill).then(function(res) {            
         if (res.data == "created") {
            getSkillData(skillSetService,$scope);
            $scope.skill = {};
            app.loading =false;
            app.successMsg = "Skillset created successfully";
            app.errorMsg = false;
         } else
         {
            app.loading =false;
            app.successMsg = "Skillset Updated successfully";
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

 function getSkillData(skillSetService,$scope){
      skillSetService.getSkillSets().then(function(res) {
         $scope.mongoSkillData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }


 })();