(function() {
 'use strict';
 
angular.module('pmoApp').controller('holidayListCtrl', Controller);

 Controller.$inject = ['$scope', '$rootScope', 'holidayListService','locationService'];
  
 function Controller($scope, $rootScope, holidayListService, locationService) {
 $scope.mongoHolidayData = [];
 $scope.locationList = [];
 var app = $scope;
 
 $rootScope.Title = "Holiday Listing";
 getLocationData(locationService, $scope);
 getHolidayData(holidayListService, $scope);
 
  
 $scope.clearFields = function (){
 
     $scope.holiday = {};

     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }
 
 $scope.deleteHoliday = function(id) {
     if (confirm('Are you sure to delete?')) {
     holidayListService.deleteHoliday(id).then(function(res) {
     if (res.data == "deleted") {
       getHolidayData(holidayListService,$scope);
       app.loading = false;
       app.successMsg = "Holiday Deleted successfully";
       app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editHoliday = function (id) {
     $rootScope.Title = "Edit Holiday";
     holidayListService.getHolidayForID(id).then(function(res) {
     $scope.holiday = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(holiday) {
     if ($scope.holidayForm.$valid) {
     holidayListService.updateHoliday(holiday).then(function(res) {
     if (res.data == "updated") {
        getHolidayData(holidayListService,$scope);
        $scope.holiday = {};
        app.loading =false;
        app.successMsg = "Holiday Updated successfully";
        app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createHoliday = function(holiday) {
     $rootScope.Title = "Create Holiday";
     $scope.IsSubmit = true;
     if ($scope.holidayForm.$valid) {
         holidayListService.createHoliday(holiday).then(function(res) {
         if (res.data == "created") {
            getHolidayData(holidayListService,$scope);
            $scope.holiday = {};
            app.loading =false;
            app.successMsg = "Holiday created successfully";
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

 function getHolidayData(holidayListService,$scope){
      holidayListService.getHolidays().then(function(res) {
         $scope.mongoHolidayData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }
 
 function getLocationData(locationService,$scope){
	locationService.getLocation().then(function(res) {
         $scope.locationList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

   })();