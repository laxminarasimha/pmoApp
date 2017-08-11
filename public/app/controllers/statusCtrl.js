 (function() {

 'use strict';
 
 angular.module('pmoApp').controller('statusCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'statusService','DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, statusService,DTOptionsBuilder, DTColumnBuilder) {
 $scope.mongoStatusData = [];
 
 var app = $scope;

 $rootScope.Title = "Status Listing";
 getStatusData(statusService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.status = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = ""
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
    //var dataValue = event.target.attributes.value.value;     
     statusService.deleteStatus($scope.deletedID).then(function(res) {
     if (res.data == "deleted") {
       getStatusData(statusService,$scope);
        app.loading = false;
        app.successMsg = "Status Deleted successfully";
        app.errorMsg = false;
        $scope.msg = "";
        $scope.deletedID = "";
     }
     }).catch(function(err) {
     console.log(err);
     });
    
     
 };
 
$scope.editStatus = function (id) {    
     $rootScope.Title = "Edit Status";
     statusService.getStatusForID(id).then(function(res) {
     $scope.status = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(status) {
     if ($scope.statusForm.$valid) {
         statusService.getStatusForName($scope.status.statusname).then(function(res) {
            if(res.data.length == 0){
              statusService.updateStatus(status).then(function(res) {              
                     if (res.data == "updated") {
                        getStatusData(statusService,$scope);
                        $scope.status = {};
                        app.loading =false;
                        app.successMsg = "Status Updated successfully";
                        app.errorMsg = false;
                     }
                     }).catch(function(err) {
                         console.log(err);
                         app.loading =false;
                         app.errorMsg = "Error in creation";
                         app.successMsg = false;
                         app.errorClass = "error";
                     });
            }else  if(res.data.length > 0){
                         app.loading =false;
                         app.errorMsg = "Status already exist";
                         app.successMsg = false;
                         app.errorClass = "error";
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
 };
 
 $scope.createStatus = function(status) {
     $rootScope.Title = "Create Status";
     $scope.IsSubmit = true;
     if ($scope.statusForm.$valid) {
        app.loading = true;
        statusService.getStatusForName($scope.status.statusname).then(function(res) {
            if(res.data.length == 0){
              statusService.createStatus(status).then(function(res)  {  
            
                     if (res.data == "created") {
                        getStatusData(statusService,$scope);
                        $scope.status = {};
                        app.loading =false;
                        app.successMsg = "Status created successfully";
                        app.errorMsg = false;
                     }
                     }).catch(function(err) {
                         console.log(err);
                         app.loading =false;
                         app.errorMsg = "Error in creation";
                         app.successMsg = false;
                         app.errorClass = "error";
                     });
            }else  if(res.data.length > 0){
                         app.loading =false;
                         app.errorMsg = "Status already exist";
                         app.successMsg = false;
                         app.errorClass = "error";
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

 function getStatusData(statusService,$scope){
      statusService.getStatus().then(function(res) {
         $scope.mongoStatusData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function openDialog(){
    $('#confirmModal').modal('show');
 }

 })();
