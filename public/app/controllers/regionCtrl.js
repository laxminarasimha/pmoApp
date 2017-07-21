(function() {
 
 'use strict';
 
 angular.module('pmoApp').controller('regionCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'regionService'];
  
 function Controller($scope, $rootScope, regionService) {
 $scope.mongoRegionData = [];
 var app = $scope;
 
 $rootScope.Title = "Region Listing";
 getRegionData(regionService,$scope);
 
  
 $scope.clearFields = function (){
 
     $scope.region = {};
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
         regionService.deleteRegion($scope.deletedID).then(function(res) {
         if (res.data == "deleted") {
           getRegionData(regionService,$scope);
           app.loading = false;
           app.successMsg = "Region Deleted successfully";
           app.errorMsg = false;
            $scope.msg = "";
            $scope.deletedID = "";
         }
         }).catch(function(err) {
         console.log(err);
         });
     //}
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
        app.loading =false;
        app.successMsg = "Region Updated successfully";
        app.errorMsg = false;
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
            app.loading =false;
            app.successMsg = "Region created successfully";
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

 function getRegionData(regionService,$scope){
      regionService.getRegion().then(function(res) {
         $scope.mongoRegionData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function openDialog(){
    $('#confirmModal').modal('show');
 }

 
 })();