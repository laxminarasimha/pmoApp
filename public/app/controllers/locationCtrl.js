(function() {

 
 'use strict';
 
 angular.module('pmoApp').controller('locationCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'locationService'];
  
 function Controller($scope, $rootScope, locationService) {
 $scope.mongoLocationData = [];
 
 
 $rootScope.Title = "Location Listing";
 getLocationData(locationService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.location = {};
 }
 
 $scope.deleteLocation = function(id) {
     if (confirm('Are you sure to delete?')) {
     locationService.deleteLocation(id).then(function(res) {
     if (res.data == "deleted") {
       getLocationData(locationService,$scope);
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
         }
         }).catch(function(err) {
         console.log(err);
         });
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