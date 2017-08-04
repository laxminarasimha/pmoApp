(function () {
    'use strict';

    angular.module('pmoApp').controller('leaveCtrl', Controller);

    Controller.$inject = ['$scope', '$filter', '$rootScope', 'leaveService', 'locationService', 'resourceService', 'holidayListService', 'DTOptionsBuilder', 'DTColumnBuilder', 'availableDaysService'];

    function Controller($scope, $filter, $rootScope, leaveService, locationService, resourceService, holidayListService, DTOptionsBuilder, DTColumnBuilder, availableDaysService) {
        $scope.mongoLeaveData = [];
        $scope.locationList = [];
        $scope.resourceList = [];
        $scope.holidayList = '';
        $scope.toDate;
        $scope.fromDate;
        $scope.numberOfLeaves;
        $scope.resourcename;


        var app = $scope;

        $rootScope.Title = "Leave Listing";
        getLeaveData(leaveService, $scope);

        getLocationData(locationService, $scope);
        getResourceData(resourceService, $scope);

        $scope.clearFields = function () {

            $scope.leave = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
        }

        $scope.deleteConfirmation = function (id, name) {
            $scope.msg = name;
            $scope.deletedID = id;
            openDialog();

        }

        $scope.cancel = function (event) {
            $scope.msg = "";
            $scope.deletedID = "";
        }


        $scope.delete = function (event) {
            //if (confirm('Are you sure to delete?')) {
            leaveService.deleteLeave($scope.deletedID).then(function (res) {
                if (res.data == "deleted") {
                    getLeaveData(leaveService, $scope);
                    app.loading = false;
                    app.successMsg = "Leave Deleted successfully";
                    app.errorMsg = false;
                    $scope.msg = "";
                    $scope.deletedID = "";
                }
            }).catch(function (err) {
                console.log(err);
            });
            //}
        };

        $scope.editLeave = function (id) {

            $rootScope.Title = "Edit Leave";
            leaveService.getLeaveForID(id).then(function (res) {
                res.data.fromDate = $filter('date')(new Date(res.data.fromDate), 'dd-MMM-yy');
                res.data.toDate = $filter('date')(new Date(res.data.toDate), 'dd-MMM-yy');
                $scope.leave = res.data;
            }).catch(function (err) {
                console.log(err);
            });

        };

        $scope.saveData = function (leave) {
            if ($scope.leaveForm.$valid) {
                leave.fromDate = $scope.leave.fromDate;
                leave.toDate = $scope.leave.toDate;
                leave.numberOfLeaves = $scope.numberOfLeaves;
                leave.leavedaysinmonth = $scope.monthwiseLeave;
                leaveService.updateLeave(leave).then(function (res) {
                    if (res.data == "updated") {
                        getLeaveData(leaveService, $scope);
                        $scope.leave = {};
                        app.loading = false;
                        app.successMsg = "Leave Updated successfully";
                        app.errorMsg = false;
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            }
        };

        $scope.createLeave = function (leave) {
            $rootScope.Title = "Create Leave";
            $scope.IsSubmit = true;

            if ($scope.leaveForm.$valid) {
                leave.fromDate = $scope.leave.fromDate;
                leave.toDate = $scope.leave.toDate;
                leave.resourcename = $scope.leave.resourcename;
                leave.numberOfLeaves = $scope.numberOfLeaves;
                leave.leavedaysinmonth = $scope.monthwiseLeave;
                console.log(leave);
                app.loading = false;
                app.errorMsg = false;
                getLeavesForresource(leaveService, leave.resourcename, $scope);


                /*leaveService.createLeave(leave).then(function(res) {
            
                 if (res.data == "created") {
                    getLeaveData(leaveService,$scope);
                    $scope.leave = {};
                    app.loading =false;
                    app.successMsg = "Leave created successfully";
                    app.errorMsg = false;
                 }
                 }).catch(function(err) {
                 console.log(err);
                 });*/
            } else {
                app.loading = false;
                app.successMsg = false;
                app.errorMsg = "Please Enter Required value";
                app.errorClass = "error"
            }

        };

        $scope.numberofdays = function (fromDate, toDate, resourcename) {

            if (toDate != null && fromDate != null) {
                if (new Date(fromDate) > new Date(toDate)) {
                    console.log("Start Date should be less than End date");
                    app.loading = false;
                    app.successMsg = false;
                    app.errorMsg = "Start Date should be less than End date";
                    app.errorClass = "error"
                } else {
                    app.loading = false;
                    app.errorMsg = false;


                    var holidays = {};
                    holidays["holiday"] = $scope.holidayList.split(",");
                    var aDay = 24 * 60 * 60 * 1000,
                        daysDiff = parseInt((new Date(toDate).getTime() - new Date(fromDate).getTime()) / aDay, 10) + 1;

                    if (daysDiff > 0) {
                        for (var i = new Date(fromDate).getTime(), lst = new Date(toDate).getTime(); i <= lst; i += aDay) {
                            var d = new Date(i);
                            if (d.getDay() == 6 || d.getDay() == 0 // weekend
                                || holidays.holiday.indexOf(formatDate(d)) != -1) {
                                daysDiff--;
                            }
                        }

                        $scope.numberOfLeaves = daysDiff;
                        monthwiseLeave(daysDiff, fromDate, toDate, $scope);

                        return $scope.numberOfLeaves;
                    }

                }
            }
        };

        function daysDiff(fromDate, toDate) {

            var holidays = {};
            holidays["holiday"] = $scope.holidayList.split(",");
            var aDay = 24 * 60 * 60 * 1000,
                daysDiff = parseInt((new Date(toDate).getTime() - new Date(fromDate).getTime()) / aDay, 10) + 1;

            if (daysDiff > 0) {
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


        function monthwiseLeave(days, fromDate, toDate, $scope) {

            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            $scope.monthwiseLeave = [];

            function Object(month, days) {
                this.month = month
                this.value = days
            }

            var totalDays = days;
            var fDate = new Date(fromDate);
            var lDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0);
            var dt = 0;
            var month = "";
            while (totalDays > 0) {
                dt = daysDiff(fDate, lDate);
                month = monthNames[fDate.getMonth()] + "-" + fDate.getFullYear().toString().substr(-2);
                if (totalDays > dt) {
                    $scope.monthwiseLeave.push(new Object(month, dt));
                    totalDays = totalDays - dt;
                    fDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 1);
                    lDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0);
                } else {
                    $scope.monthwiseLeave.push(new Object(month, totalDays));
                    break;
                }
            }

        }

        $scope.getHolidayDataForLoaction = function (location) {
            holidayListService.getLocationHolidays(location).then(function (res) {
                angular.forEach(res.data, function (value, index) {
                    var today = $filter('date')(new Date(value.holidayDate), 'yyyy-MM-dd');
                    $scope.holidayList = $scope.holidayList + today;
                    if (res.data.length != index + 1) {
                        $scope.holidayList = $scope.holidayList + ",";
                    }

                });

            }).catch(function (err) {
                console.log(err);
            });

        };


        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons',['copy', 'print', 'pdf','excel']);
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

    function getLeaveData(leaveService, $scope) {
        leaveService.getLeave().then(function (res) {
            $scope.mongoLeaveData = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }


    function getLocationData(locationService, $scope) {
        locationService.getLocation().then(function (res) {
            $scope.locationList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getResourceData(resourceService, $scope) {
        resourceService.getResources().then(function (res) {
            $scope.resourceList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function save(isDuplicate, leaveService, $scope) {
        if (!isDuplicate) {
            console.log("true...");
            leaveService.createLeave($scope.leave).then(function (res) {

                if (res.data == "created") {
                    getLeaveData(leaveService, $scope);
                    $scope.leave = {};
                    $scope.loading = false;
                    $scope.successMsg = "Leave created successfully";
                    $scope.errorMsg = false;
                }
            }).catch(function (err) {
                console.log(err);
            });
        } else {
            console.log("false.............");
            $scope.loading = false;
            $scope.successMsg = "You have already applied with this dates.";
            $scope.errorMsg = false;
        }

    }



    function getLeavesForresource(leaveService, resourcename, $scope) {

        leaveService.getLeaveForResourceName(resourcename).then(function (res) {
            var flag = false;
            var leaves = res.data;
            for (var i = 0; i < leaves.length; i++) {
                //   if( new Date($scope.leave.fromDate) >=  new Date(leaves[i].fromDate)   &&
                //         new Date($scope.leave.toDate) <= new Date(leaves[i].toDate)){
                //         console.log(" 1 duplicate date"+ leaves[i].fromDate +'-'+leaves[i].toDate);
                //         flag= true;
                //         break;
                //     }else if(new Date($scope.leave.fromDate) >= new Date(leaves[i].fromDate) && 
                //           new Date($scope.leave.fromDate) <= new Date(leaves[i].toDate)){
                //           console.log(" 2 duplicate date"+ leaves[i].fromDate +'-'+leaves[i].toDate);
                //           flag= true;
                //         break;
                //     }else if(new Date($scope.leave.toDate) >= new Date(leaves[i].fromDate) && 
                //           new Date($scope.leave.toDate) <= new Date(leaves[i].toDate)){
                //          console.log(" 3 duplicate date"+ leaves[i].fromDate +'-'+leaves[i].toDate);
                //           flag= true;
                //           break;
                //     }


                if ((new Date($scope.leave.fromDate) >= new Date(leaves[i].fromDate) &&
                    new Date($scope.leave.fromDate) <= new Date(leaves[i].toDate)) ||
                    new Date($scope.leave.toDate) >= new Date(leaves[i].fromDate) &&
                    new Date($scope.leave.toDate) <= new Date(leaves[i].toDate)) {
                    flag = true;
                    break;
                }



            }
            save(flag, leaveService, $scope);

        });

    }

    function openDialog() {
        $('#confirmModal').modal('show');
    }


})();