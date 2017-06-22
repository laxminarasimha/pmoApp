(function() {
 
 'use strict';
 
 angular.module('pmoApp').controller('regionCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'regionService'];
  
 function Controller($scope, $rootScope, regionService) {
 $scope.mongoRegionData = [];
 
 
 $rootScope.Title = "Region Listing";
 getRegionData(regionService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.region = {};
 }
 
 $scope.deleteRegion = function(id) {
     if (confirm('Are you sure to delete?')) {
     regionService.deleteRegion(id).then(function(res) {
     if (res.data == "deleted") {
       getRegionData(regionService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editRegion = function (id) {
     $rootScope.Title = "Edit Region";
     regionService.getRegionForID(id).then(function(res) {
     $scope.region = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(region) {
     if ($scope.regionForm.$valid) {
     regionService.updateRegion(region).then(function(res) {
     if (res.data == "updated") {
        getRegionData(regionService,$scope);
        $scope.region = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createRegion = function(region) {
     $rootScope.Title = "Create Region";
     $scope.IsSubmit = true;
     if ($scope.regionForm.$valid) {
         regionService.createRegion(region).then(function(res) {
         if (res.data == "created") {
            getRegionData(regionService,$scope);
            $scope.region = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 }
 }

 function getRegionData(regionService,$scope){
      regionService.getRegion().then(function(res) {
         $scope.mongoRegionData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 
 })();