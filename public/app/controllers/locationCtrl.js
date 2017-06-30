(function() {

 
 'use strict';
 
 angular.module('pmoApp').controller('locationCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'locationService'];
  
 function Controller($scope, $rootScope, locationService) {
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
 
 $scope.deleteLocation = function(id) {
     if (confirm('Are you sure to delete?')) {
     locationService.deleteLocation(id).then(function(res) {
     if (res.data == "deleted") {
       getLocationData(locationService,$scope);
       app.loading = false;
       app.successMsg = "Location Deleted successfully";
       app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
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
     });
     }
 };
 
 $scope.createLocation = function(location) {
     $rootScope.Title = "Create Location";
     $scope.IsSubmit = true;
     if ($scope.locationForm.$valid) {
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
         });
     }else
     {
            app.loading =false;
            app.successMsg = false;
            app.errorMsg = "Please Enter Required value";
            app.errorClass = "error"
     }
     
 }
 }

 function getLocationData(locationService,$scope){
      locationService.getLocation().then(function(res) {
         $scope.mongoLocationData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }


 })();