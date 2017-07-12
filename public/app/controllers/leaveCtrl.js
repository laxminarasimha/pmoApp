(function() {
 'use strict';
 
angular.module('pmoApp').controller('leaveCtrl', Controller);
 
 Controller.$inject = ['$scope', '$filter', '$rootScope', 'leaveService','locationService', 'resourceService','holidayListService','DTOptionsBuilder', 'DTColumnBuilder','availableDaysService'];
  
 function Controller($scope, $filter, $rootScope, leaveService,locationService,resourceService,holidayListService,DTOptionsBuilder, DTColumnBuilder,availableDaysService) {
     $scope.mongoLeaveData = [];
     $scope.locationList = [];
     $scope.resourceList = [];
     $scope.holidayList = '';
     $scope.toDate;
     $scope.fromDate;
     $scope.numberOfLeaves;

     availableDaysService.getData();

     var app = $scope;
 
     $rootScope.Title = "Leave Listing";
     getLeaveData(leaveService,$scope);
     
     getLocationData(locationService,$scope);
     getResourceData(resourceService,$scope);

     $scope.clearFields = function (){
     
         $scope.leave = {};
         app.loading =false;
         app.successMsg = false;
         app.errorMsg = false;
         app.errorClass = "";
     }
     
  
     $scope.deleteLeave = function(id) {
         if (confirm('Are you sure to delete?')) {
         leaveService.deleteLeave(id).then(function(res) {
         if (res.data == "deleted") {
           getLeaveData(leaveService,$scope);
           app.loading = false;
           app.successMsg = "Leave Deleted successfully";
           app.errorMsg = false;
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
            leave.fromDate=$scope.fromDate;
            leave.toDate=$scope.toDate;
            leave.numberOfLeaves=$scope.numberOfLeaves;
            leave.leavedaysinmonth=$scope.monthwiseLeave;
            leaveService.updateLeave(leave).then(function(res) {
                if (res.data == "updated") {
                    getLeaveData(leaveService,$scope);
                    $scope.leave = {};
                    app.loading =false;
                    app.successMsg = "Leave Updated successfully";
                    app.errorMsg = false;
                }
            }      ).catch(function(err) {
            console.log(err);
            });
         }
    };
 
    $scope.createLeave = function(leave) {
         $rootScope.Title = "Create Leave";
         $scope.IsSubmit = true;
         if ($scope.leaveForm.$valid) {
            leave.fromDate=$scope.fromDate;
            leave.toDate=$scope.toDate;
            leave.numberOfLeaves=$scope.numberOfLeaves;
            leave.leavedaysinmonth=$scope.monthwiseLeave;
            leaveService.createLeave(leave).then(function(res) {
        
             if (res.data == "created") {
                getLeaveData(leaveService,$scope);
                $scope.leave = {};
                app.loading =false;
                app.successMsg = "Leave created successfully";
                app.errorMsg = false;
             }
             }).catch(function(err) {
             console.log(err);
             });
         }else{
                app.loading =false;
                app.successMsg = false;
                app.errorMsg = "Please Enter Required value";
                app.errorClass = "error"
        }
     
    };

    $scope.numberofdays = function (fromDate,toDate) {
            if(toDate != null && fromDate !=null) {
               var holidays = {};
                holidays["holiday"] = $scope.holidayList.split(",");
        		var aDay = 24 * 60 * 60 * 1000,
        		daysDiff = parseInt((new Date(toDate).getTime()-new Date(fromDate).getTime())/aDay,10)+1;
        		
        		if (daysDiff>0) {  
            		for (var i = new Date(fromDate).getTime(), lst = new Date(toDate).getTime(); i <= lst; i += aDay) {
            		var d = new Date(i);
            		if (d.getDay() == 6 || d.getDay() == 0 // weekend
            		|| holidays.holiday.indexOf(formatDate(d)) != -1) {
                      daysDiff--;
                }
            }
            	$scope.numberOfLeaves = daysDiff;
                $scope.monthwiseLeave(daysDiff,fromDate,toDate);
            	return  $scope.numberOfLeaves;
            }
        }
    };


    function daysDiff (fromDate,toDate) {
            
                 var holidays = {};
                holidays["holiday"] = $scope.holidayList.split(",");
                var aDay = 24 * 60 * 60 * 1000,
                daysDiff = parseInt((new Date(toDate).getTime()-new Date(fromDate).getTime())/aDay,10)+1;
               
                if (daysDiff>0) {  
                    for (var i = new Date(fromDate).getTime(), lst = new Date(toDate).getTime(); i <= lst; i += aDay) {
                    var d = new Date(i);
                    if (d.getDay() == 6 || d.getDay() == 0 // weekend
                    || holidays.holiday.indexOf(formatDate(d)) != -1) {
                      daysDiff--;
                    }
                }
            }
            return daysDiff;
                     
    };


    $scope.monthwiseLeave = function(days,fromDate,toDate){

       var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

        $scope.monthwiseLeave =[];
        
        function Object (month,days){
            this.month = month  
            this.value = days
        }

        var totalDays = days;
        var fDate = new Date(fromDate);
        var lDate = new Date(fDate.getFullYear(), fDate.getMonth()+1, 0);
        var dt =0;
        var month="";
        while(totalDays > 0){
            dt = daysDiff(fDate,lDate);
            month = monthNames[fDate.getMonth()]+"-"+fDate.getFullYear().toString().substr(-2);
            if(totalDays > dt){
                $scope.monthwiseLeave.push(new Object(month,dt));
                totalDays = totalDays - dt;
                fDate = new Date(fDate.getFullYear(), fDate.getMonth()+1, 1);
                lDate = new Date(fDate.getFullYear(), fDate.getMonth()+1, 0);
            }else{
                $scope.monthwiseLeave.push(new Object(month ,totalDays));
                break;
            }
        }
          
    }

    
    $scope.getHolidayDataForLoaction = function (location){
          console.log(location);
          holidayListService.getLocationHolidays(location).then(function(res) {
               angular.forEach(res.data,function(value,index){
                    var today = $filter('date')(new Date(value.holidayDate), 'yyyy-MM-dd');
                    $scope.holidayList= $scope.holidayList+today;
                    if(res.data.length != index+1){
                       $scope.holidayList= $scope.holidayList +",";
                    }
                    
                });

         }).catch(function(err) {
             console.log(err);
         });  
      
    };


//=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
//=============================================================//

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
 

    function getLocationData(locationService,$scope){
        locationService.getLocation().then(function(res) {
             $scope.locationList = res.data;
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