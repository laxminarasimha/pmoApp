
 (function() {

 
 'use strict';
 
 angular.module('pmoApp').controller('roleCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'roleService','DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, roleService, DTOptionsBuilder, DTColumnBuilder) {
 $scope.mongoRoleData = [];
 var app = $scope;
 
 $rootScope.Title = "Role Listing";
 getRoleData(roleService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.role = {};
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
     roleService.deleteRole($scope.deletedID).then(function(res) {
     if (res.data == "deleted") {
       getRoleData(roleService,$scope);
       app.loading = false;
       app.successMsg = "Role Deleted successfully";
       app.errorMsg = false;
       $scope.msg = "";
       $scope.deletedID = "";
     }
     }).catch(function(err) {
     console.log(err);
     });
     //}
 };
 
$scope.editRole = function (id) {
     $rootScope.Title = "Edit Role";
     roleService.getRoleForID(id).then(function(res) {
     $scope.role = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(role) {
     if ($scope.roleForm.$valid) {
        roleService.getRoleForName($scope.role.rolename).then(function(res) {
            if(res.data.length == 0){
              roleService.updateRole(role).then(function(res) { 
            
                     if (res.data == "updated") {
                        getRoleData(roleService,$scope);
                        $scope.role = {};
                        app.loading =false;
                        app.successMsg = "Role Updated successfully";
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
                         app.errorMsg = "Role already exist";
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
 
 $scope.createRole = function(role) {
     $rootScope.Title = "Create Role";
     $scope.IsSubmit = true;
     if ($scope.roleForm.$valid) {
          roleService.getRoleForName($scope.role.rolename).then(function(res) {
            if(res.data.length == 0){
              roleService.createRole(role).then(function(res) { 
            
                     if (res.data == "created") {
                        getRoleData(roleService,$scope);
                        $scope.role = {};
                        app.loading =false;
                        app.successMsg = "Role created successfully";
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
                         app.errorMsg = "Role already exist";
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

 function getRoleData(roleService,$scope){
      roleService.getRole().then(function(res) {
         $scope.mongoRoleData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function openDialog(){
    $('#confirmModal').modal('show');
 }

})();