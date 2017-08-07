(function() {

 
 'use strict';
 
 angular.module('pmoApp').controller('locationCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'locationService','DTOptionsBuilder', 'DTColumnBuilder'];
  
 function Controller($scope, $rootScope, locationService,DTOptionsBuilder, DTColumnBuilder) {
 $scope.mongoLocationData = [];
 var app = $scope;
 
 $rootScope.Title = "Location Listing";
 getLocationData(locationService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.location = {};
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
         locationService.deleteLocation($scope.deletedID).then(function(res) {
         if (res.data == "deleted") {
           getLocationData(locationService,$scope);
           app.loading = false;
           app.successMsg = "Location Deleted successfully";
           app.errorMsg = false;
           $scope.msg = "";
           $scope.deletedID = "";
         }
         }).catch(function(err) {
         console.log(err);
         });
     //}
 };
 
$scope.editLocation = function (id) {
     $rootScope.Title = "Edit Location";
     locationService.getLocationForID(id).then(function(res) {
     $scope.location = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(location) {
     if ($scope.locationForm.$valid) {
        locationService.getLocationForName($scope.location.locationname).then(function(res) {
            if(res.data.length == 0){
              locationService.updateLocation(location).then(function(res) {
            
                     if (res.data == "updated") {
                       getLocationData(locationService,$scope);
                        $scope.location = {};
                        app.loading =false;
                        app.successMsg = "Location Updated successfully";
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
                         app.errorMsg = "Location already exist";
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
 
 $scope.createLocation = function(location) {
     $rootScope.Title = "Create Location";
     $scope.IsSubmit = true;
     if ($scope.locationForm.$valid) {
        locationService.getLocationForName($scope.location.locationname).then(function(res) {
            if(res.data.length == 0){
              locationService.createLocation(location).then(function(res) {
            
                     if (res.data == "created") {
                       getLocationData(locationService,$scope);
                        $scope.location = {};
                        app.loading =false;
                        app.successMsg = "Location created successfully";
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
                         app.errorMsg = "Location already exist";
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

 function getLocationData(locationService,$scope){
      locationService.getLocation().then(function(res) {
         $scope.mongoLocationData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function openDialog(){
    $('#confirmModal').modal('show');
 }


 })();