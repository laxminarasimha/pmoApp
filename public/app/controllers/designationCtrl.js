
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('designationCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'designationService','DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, designationService,DTOptionsBuilder, DTColumnBuilder) {
 $scope.mongoDesignationData = [];
 var app = $scope;
 
 $rootScope.Title = "Designation Listing";
 
 getDesignationData(designationService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.designation = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }

 $scope.deleteConfirmation = function(id,name){
    $scope.msg = name;
    $scope.deletedID = id;
    openDialog();

 }
 
 $scope.cancel = function(event){
    $scope.msg = "";
    $scope.deletedID = "";
 }
 
 $scope.delete = function(event) {
     //if (confirm('Are you sure to delete?')) {
     designationService.deleteDesignation($scope.deletedID).then(function(res) {
     if (res.data == "deleted") {
       getDesignationData(designationService,$scope);
       app.loading = false;
       app.successMsg = "Designation Deleted successfully";
       app.errorMsg = false;
       $scope.msg = "";
       $scope.deletedID = "";
     }
     }).catch(function(err) {
     console.log(err);
     });
     //}
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
        app.loading =false;
        app.successMsg = "Designation Updated successfully";
        app.errorMsg = false;
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
            app.loading =false;
            app.successMsg = "Designation created successfully";
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
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons',['copy', 'print', 'pdf','excel']);
//=============================================================//

 }

 function getDesignationData(designationService,$scope){
      designationService.getDesignations().then(function(res) {
         $scope.mongoDesignationData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function openDialog(){
    $('#confirmModal').modal('show');
 }

 })();