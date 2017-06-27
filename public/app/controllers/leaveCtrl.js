(function() {
 'use strict';
 
angular.module('pmoApp').controller('leaveCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'leaveService','regionService', 'resourceService'];
  
 function Controller($scope, $rootScope, leaveService,regionService,resourceService) {
 $scope.mongoLeaveData = [];
 $scope.regionList = [];
 $scope.resourceList = [];
 var holidays = {};
 holidays["holiday"] = "2017-06-26,2017-06-27,2017-06-28".split(",");
 
 
 $rootScope.Title = "Leave Listing";
 getLeaveData(leaveService,$scope);
 getRegionData(regionService,$scope);
 getResourceData(resourceService,$scope);
  
 $scope.clearFields = function (){
 
     $scope.leave = {};
 }
 
  
 $scope.deleteLeave = function(id) {
     if (confirm('Are you sure to delete?')) {
     leaveService.deleteLeave(id).then(function(res) {
     if (res.data == "deleted") {
       getLeaveData(leaveService,$scope);
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editLeave = function (id) {
     $rootScope.Title = "Edit Leave";
     leaveService.getLeaveForID(id).then(function(res) {
     $scope.leave = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(leave) {
     if ($scope.leaveForm.$valid) {
     leaveService.updateLeave(leave).then(function(res) {
     if (res.data == "updated") {
        getLeaveData(leaveService,$scope);
        $scope.leave = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createLeave = function(leave) {
     $rootScope.Title = "Create Leave";
     $scope.IsSubmit = true;
     if ($scope.leaveForm.$valid) {
         leaveService.createLeave(leave).then(function(res) {
         if (res.data == "created") {
            getLeaveData(leaveService,$scope);
            $scope.leave = {};
         }
         }).catch(function(err) {
         console.log(err);
         });
     }
     
 };

 $scope.difference = function (fromDate, toDate) {
   
		var aDay = 24 * 60 * 60 * 1000,
		daysDiff = parseInt((new Date(toDate).getTime()-new Date(fromDate).getTime())/aDay,10)+1;
		
		//Math.round(Math.abs((new Date(fromDate).getTime() - new Date(toDate).getTime())/(24*60*60*1000)));
		if (daysDiff>0) {  
		for (var i = new Date(fromDate).getTime(), lst = new Date(toDate).getTime(); i <= lst; i += aDay) {
		var d = new Date(i);
		if (d.getDay() == 6 || d.getDay() == 0 // weekend
		|| holidays.holiday.indexOf(formatDate(d)) != -1) {
          daysDiff--;
      }
    }
	$scope.leave.numberOfLeaves = daysDiff;
	return  $scope.leave.numberOfLeaves;
  }
  
	
 };

 
  }
  
  function pad(num) {
	return ("0" + num).slice(-2); 
 }
 function formatDate(date) { 
	var d = new Date(date), 
	dArr = [d.getFullYear(), 
	pad(d.getMonth() + 1), 
	pad(d.getDate())];
	return dArr.join('-');
 }
 
 function getLeaveData(leaveService,$scope){
      leaveService.getLeave().then(function(res) {
         $scope.mongoLeaveData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }
 
 function getRegionData(regionService,$scope){
      regionService.getRegion().then(function(res) {
         $scope.regionList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }
 
 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.resourceList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }
  
  
  })();