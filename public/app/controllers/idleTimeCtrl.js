
(function () {
    'use strict';

    angular.module('pmoApp').controller('idleTimeCtrl', Controller);

    Controller.$inject = ['$scope', '$rootScope', '$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'idleTimeService',
        'resourceService', 'regionService',
        'allocationService', 'leaveService', 'availableDaysService',
        'monthlyHeaderListService', 'holidayListService', '$filter'];

    function Controller($scope, $rootScope, $window, DTOptionsBuilder, DTColumnBuilder, $compile, idleTimeService,
        resourceService, regionService,
        allocationService, leaveService, availableDaysService,
        monthlyHeaderListService, holidayListService, $filter) {


        var app = $scope;

        $scope.region = $window.localStorage.getItem("region");

        $scope.regionname = $window.localStorage.getItem("region");
        getRegion(regionService, $scope);
        getResources(resourceService, $scope);
        $scope.idleTimeData = [];
        $scope.originalData = [];
        $scope.regionData = [];
        $scope.startDate = '';
        $scope.endDate = '';
        $scope.resourceList = [];
        $scope.resources=[];
        $scope.headingList = [];
        $scope.ShowSpinnerStatus = true;
        $scope.regionList = [];
        $scope.ShowSpinnerStatus = true;
        initialize($scope, allocationService, leaveService, availableDaysService, holidayListService,monthlyHeaderListService);
        $scope.selectDate = function () {
            $scope.rangeSelect = "";
            $('#rangeSelect').prop('disabled', true);
        }
        $scope.dateChange = function () {

            switch ($scope.rangeSelect) {
                case "one":
                    var fromDate = new Date();
                    var fyear = fromDate.getFullYear();
                    var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
                   // console.log(fDate)
                    var preDate = new Date(fromDate);
                    preDate.setMonth(fromDate.getMonth());
                    var pyear = preDate.getFullYear();
                    var pDate = (preDate.getMonth() + 1) + '/' + pyear;
                    $scope.startDate = pDate;
                    $scope.endDate = fDate;
                    break;
                case "six":
                    var fromDate = new Date();
                    var fyear = fromDate.getFullYear();
                    var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
                  //  console.log(fDate)
                    var preDate = new Date(fromDate);
                    preDate.setMonth(fromDate.getMonth() - 5);
                    var pyear = preDate.getFullYear();
                    var pDate = (preDate.getMonth() + 1) + '/' + pyear;
                    $scope.startDate = pDate;
                    $scope.endDate = fDate;
                    break;
                case "twelve":
                    var fromDate = new Date();
                    var fyear = fromDate.getFullYear();
                    var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
                    console.log(fDate)
                    var preDate = new Date(fromDate);
                    preDate.setMonth(fromDate.getMonth() - 11);
                    var pyear = preDate.getFullYear();
                    var pDate = (preDate.getMonth() + 1) + '/' + pyear;
                    $scope.startDate = pDate;
                    $scope.endDate = fDate;
                    break;
                default:
                    break;
            }

            $scope.clearMessages();

            var strDt = $scope.startDate.split("/");
            var endDt = $scope.endDate.split("/");
            //console.log(strDt);

            //console.log(endDt);

            var date_1 = new Date(strDt[1], parseInt(strDt[0]) - 1);
            var date_2 = new Date(endDt[1], parseInt(endDt[0]) - 1);
            var monthCol = "";

            if (date_1 != "Invalid Date" && date_2 != "Invalid Date") {
                if (date_2 >= date_1) {
                    monthCol = months($scope.startDate, $scope.endDate);
                   // console.log(monthCol);
                    app.errorMsg = false;
                    $scope.headingList = monthCol;
                    getRegion(regionService, $scope);
                    getResources(resourceService, $scope);
                    getGraphData($scope, allocationService, leaveService, availableDaysService, holidayListService, monthlyHeaderListService);
                } else {
                    if (date_2 != null && date_1 != null) {
                        if (new Date(date_1) > new Date(date_2)) {
                            console.log("Start Date should be less than End date");
                            app.loading = false;
                            app.successMsg = false;
                            app.errorMsg = "Start Date should be less than End date";
                            app.errorClass = "error"
                        }
                    }
                }
            }

        }
        $scope.clearMessages = function () {
            $scope.successMsg = "";
            $scope.errorMsg = "";
            //$scope.hidden = "none";
            $scope.idleTimeData = [];


        }
        function getResources(resourceService, $scope) {
            resourceService.getResources($scope.regionname).then(function (res) {
               // $scope.resourceList = filterUniqueResource(res.data);
              
               $scope.resourceList= res.data;
              
                var htm = '';
                angular.forEach($scope.resourceList, function (item) {
                    htm += '<option>' + item.resourcename + '</option>';
                    $scope.resourceList.push(item.resourcename);
                   // console.log($scope.resourceList);
                });
                $('#resource-select').empty();
                    $('#resource-select').append(htm);
                    console.log($('#resource-select'));
                    $('#resource-select').multiselect('rebuild');
                    $('#resource-select').multiselect('selectAll',true );
                    $('#resource-select').multiselect('updateButtonText');
            }).catch(function (err) {
                console.log(err);
            });
        }
        function getRegion(regionService, $scope) {
            regionService.getRegion().then(function (res) {
                angular.forEach(res.data, function (item) {
                    if (item.regionname !== 'All') {
                        $scope.regionData.push(item);
                    }
                });
            });
        }
        $scope.clearFields = function () {
            $('#resource-select').multiselect('clearSelection');
            $('#resource-select').multiselect('refresh');
            $('#rangeSelect').prop('disabled', false);
            $('#resource-select').multiselect('selectAll', true);
            $('#resource-select').multiselect('updateButtonText');
            $scope.clearMessages();
            $scope.resourceList = [];
            $scope.resourceList = '';
            $scope.rangeSelect = 'six';
            $scope.startDate = '';
            $scope.endDate = '';

            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
            //getIdleTimeData(idleTimeService,$scope);
          
        }
        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons', ['copy', 'print', 'pdf', 'excel']);
        //=============================================================//

        var fromDate = new Date();
        var toDate = new Date().setMonth(fromDate.getMonth() + 11);

        $scope.getregiondata = function (region) {
            // console.log(region);
            $scope.regionname = region;
            // console.log($scope.regionname);
            getResources(resourceService, $scope);
        }

        $scope.prepareIdleTimeData = function ($scope, availableDaysService) {
            var list = availableDaysService.getData($scope.startDate, $scope.endDate);
            var resourceIdleTimeArray = [];
            for (var i = 0; i < list.length; i++) {

                //console.log("list[i].resource=================="+list[i].resource);

                for (var l = 0; l < list[i].maps.length; l++) {
                    var resourceObj = new Resource();
                    resourceObj.name = list[i].resource;
                    resourceObj.kinid = list[i].kinid;
                    resourceObj.location = list[i].location;
                    resourceObj.region = list[i].region;
                    resourceObj.resourcetype = list[i].maps[l].type;
                    resourceObj.skill = list[i].skill;
                    resourceObj.status = list[i].status;
                    var monthlyIdleTimeArray = [];
                  //  console.log(resourceObj);
                    //console.log("Allocation111=================="+list[i].maps[l].allocation);
                    //console.log(list);
                    for (var j = 0; j < list[i].maps[l].allocation.length; j++) {
                        var allocationOBJ = list[i].maps[l].allocation[j];
                        //console.log("Allocation=================="+allocationOBJ);
                        var sum = 0;
                        for (var k = 0; k < allocationOBJ.allocation.length; k++) {
                            if (isNaN(allocationOBJ.allocation[k])) {
                                allocationOBJ.allocation[k] = 0;
                            }
                            //console.log("Allocation=================="+allocationOBJ.allocation[k]);
                            sum = sum + parseFloat(allocationOBJ.allocation[k]);
                        }

                        if (isNaN(allocationOBJ.leave)) {
                            allocationOBJ.leave = 0.0;
                        }

                        //console.log("Leave=================="+allocationOBJ.leave);
                        if (isNaN(allocationOBJ.buffertime)) {
                            allocationOBJ.buffertime = 0.0;
                        }
                        //console.log("buffertime=================="+allocationOBJ.buffertime);
                        sum = sum + parseFloat(allocationOBJ.leave);
                        sum = sum + parseFloat(allocationOBJ.buffertime);
                        var idleTime = 0;
                        if (sum == 0.0) {
                            idleTime = 0;
                        } else if (allocationOBJ.buffertime == 0.0) {
                            idleTime = 0;
                        } else {
                            idleTime = monthlyHeaderListService.getRoundNumber((parseFloat(allocationOBJ.buffertime) / sum) * 100, 1);

                        }
                      
                        var monthlyIdleTimeObject = {
                            "key": allocationOBJ.month,
                            "value": idleTime
                        };

            // console.log(monthlyIdleTimeArray);
                        monthlyIdleTimeArray.push(monthlyIdleTimeObject);
                    }
                    resourceObj.idleTimeArray = monthlyIdleTimeArray;
                    //console.log(resourceObj.idleTimeArray);
                    resourceIdleTimeArray.push(resourceObj);

                }
            }
          
            $scope.idleTimeData = resourceIdleTimeArray;
            $scope.originalData = resourceIdleTimeArray;
            $scope.ShowSpinnerStatus = false;
            var spinner = document.getElementById("spinner");
            if (spinner.style.display != "none") {
                spinner.style.display = "none";

            }
        }
        $scope.prepareIdleData = function ($scope, availableDaysService,pDate,fDate) {
           
            var list = availableDaysService.getData(pDate, fDate);
            var resourceIdleTimeArray = [];
            var monthCol = "";
            monthCol = months(pDate,fDate);
            $scope.headingList = monthCol;
            for (var i = 0; i < list.length; i++) {

                //console.log("list[i].resource=================="+list[i].resource);

                for (var l = 0; l < list[i].maps.length; l++) {
                    var resourceObj = new Resource();
                    
                    resourceObj.name = list[i].resource;
                    resourceObj.kinid = list[i].kinid;
                    resourceObj.location = list[i].location;
                    resourceObj.region = list[i].region;
                    resourceObj.resourcetype = list[i].maps[l].type;
                    resourceObj.skill = list[i].skill;
                    resourceObj.status = list[i].status;
                    var monthlyIdleTimeArray = [];
                    
                    //console.log("Allocation111=================="+list[i].maps[l].allocation);
                 
                    for (var j = 0; j < list[i].maps[l].allocation.length; j++) {
                        var allocationOBJ = list[i].maps[l].allocation[j];
                        //console.log("Allocation=================="+allocationOBJ);
                        var sum = 0;
                        for (var k = 0; k < allocationOBJ.allocation.length; k++) {
                            if (isNaN(allocationOBJ.allocation[k])) {
                                allocationOBJ.allocation[k] = 0;
                            }
                            //console.log("Allocation=================="+allocationOBJ.allocation[k]);
                            sum = sum + parseFloat(allocationOBJ.allocation[k]);
                        }

                        if (isNaN(allocationOBJ.leave)) {
                            allocationOBJ.leave = 0.0;
                        }

                        //console.log("Leave=================="+allocationOBJ.leave);
                        if (isNaN(allocationOBJ.buffertime)) {
                            allocationOBJ.buffertime = 0.0;
                        }
                        //console.log("buffertime=================="+allocationOBJ.buffertime);
                        sum = sum + parseFloat(allocationOBJ.leave);
                        sum = sum + parseFloat(allocationOBJ.buffertime);
                        var idleTime = 0;
                        if (sum == 0.0) {
                            idleTime = 0;
                        } else if (allocationOBJ.buffertime == 0.0) {
                            idleTime = 0;
                        } else {
                            idleTime = monthlyHeaderListService.getRoundNumber((parseFloat(allocationOBJ.buffertime) / sum) * 100, 1);

                        }
                 
                        var monthlyIdleTimeObject = {
                            "key": allocationOBJ.month,
                            "value": idleTime
                        };

                  // console.log(monthlyIdleTimeArray);
                        monthlyIdleTimeArray.push(monthlyIdleTimeObject);
                    }
                    resourceObj.idleTimeArray = monthlyIdleTimeArray;
                    //console.log(resourceObj.idleTimeArray);
                    resourceIdleTimeArray.push(resourceObj);

                }
            }
           // console.log(resourceIdleTimeArray);
           // console.log($scope.idleTimeData);
            $scope.idleTimeData = resourceIdleTimeArray;
            $scope.originalData = resourceIdleTimeArray;
            $scope.ShowSpinnerStatus = false;
            var spinner = document.getElementById("spinner");
            if (spinner.style.display != "none") {
                spinner.style.display = "none";

            }
        }
    }


    //====================================================//

    function Resource(name, kinid, location, region, resourcetype, skill, status, idleTimeArray) {
        this.name = name;
        this.kinid = kinid;
        this.location = location;
        this.region = region;
        this.resourcetype = resourcetype;
        this.skill = skill;
        this.status = status;
        this.idleTimeArray = idleTimeArray;
    }


    function getGraphData($scope, allocationService, leaveService, availableDaysService, holidayListService) {
        var leave = [];
        allocationService.getAllAllocation().then(function (allocation) {
            leaveService.getLeave().then(function (leave) {
                var strDt = $scope.startDate.split("/");
                var endDt = $scope.endDate.split("/");
                holidayListService.getLocationHolidaysYearRange(strDt[1], endDt[1]).then(function (holidayData) {
                   // console.log(allocation.data);
                  // console.log($scope.resourceList);
                    availableDaysService.intialize(allocation.data, $scope.resourceList, leave.data, holidayData.data);
                    $scope.prepareIdleTimeData($scope, availableDaysService);
                });

            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        });
    }

    //====================================================//

    function initialize($scope, allocationService, leaveService, availableDaysService, holidayListService) {
        allocationService.getAllAllocation().then(function (allocation) {
            leaveService.getLeave().then(function (leave) {
            var fromDate = new Date();
            var fyear = fromDate.getFullYear();
            var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
           // console.log(fDate);
            var preDate = new Date(fromDate);
            preDate.setMonth(fromDate.getMonth() - 5);
            var pyear = preDate.getFullYear();
            var pDate = (preDate.getMonth() + 1) + '/' + pyear;
          
           
            holidayListService.getLocationHolidaysYearRange(pDate[1],fDate[1]).then(function (holidayData) {
               // console.log($scope.resourceList);
                availableDaysService.intialize(allocation.data, $scope.resourceList, leave.data, holidayData.data);

                $scope.prepareIdleData($scope, availableDaysService,pDate,fDate);
            });
        }).catch(function (err) {
            console.log(err);
        });
            }).catch(function (err) {
                console.log(err);
            });
       
    }


    // function getIdleTimeData(idleTimeService, $scope) {
    //     idleTimeService.getMappedResources().then(function (res) {
    //         $scope.idleTimeData = res.data;
    //     }).catch(function (err) {
    //         console.log(err);
    //     });
    // }

   
   

    function months(from, to) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var arr = [];
        var datFrom = from.split("/");
        var datTo = to.split("/");

        var fromYear = parseInt(datFrom[1]);
        var toYear = parseInt(datTo[1]);

        var monthFrom = parseInt(datFrom[0]) - 1;
        var monthTo = parseInt(datTo[0]) - 1;

        var diffYear = (12 * (toYear - fromYear)) + monthTo;
        for (var i = monthFrom; i <= diffYear; i++) {
            arr.push(monthNames[i % 12] + "-" + Math.floor(fromYear + (i / 12)).toString().substr(-2));
        }

        return arr;
    }

})();