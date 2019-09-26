(function () {

    'use strict';

    angular.module('pmoApp').controller('graphsController', Controller);

    Controller.$inject = ['$scope', '$rootScope', '$window', '$filter', 'resourceService', 'allocationService', 'leaveService', 'projectService', 'holidayListService', 'regionService'];

    function Controller($scope, $rootScope, $window, $filter, resourceService, allocationService, leaveService, projectService, holidayListService, regionService) {

        //This if condition is used for StartsWith() not supported IE11) 
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (searchString, position) {
                position = position || 0;
                return this.indexOf(searchString, position) === position;
            };
        }

        var app = $scope;
        $scope.region = $window.localStorage.getItem("region");
        $scope.regionname = $window.localStorage.getItem("region");
        console.log("root region" + $scope.regionname);
        $rootScope.Title = "Reporting";
        $scope.LocationData = [];
        $scope.regionData = [];
        $scope.locationId = "All"
        $scope.MappedResourceData = [];
        $scope.barChartData = [];
        $scope.chartlabels = [];
        $scope.graphid = "Resource Capacity";
        $scope.barChartData = {
            datasets: []
        };
        $scope.chartlabel = '';
        $scope.chartxlabel = '';
        $scope.chartylabel = '';
        $scope.project = [];
        $scope.projectSelect = "ALL";
        $scope.skillSelect = "ALL";
        $scope.startDate = '';
        $scope.endDate = '';
        $scope.GraphData = [];
        $scope.skillSetList = [];
        $scope.projectHTML = '';
        $scope.ShowSpinnerStatus = false;
        $scope.newRegion = false;
        $scope.errorMsg = false;
        getRegion(regionService, $scope);
        //getLocationData(locationService, $scope);
        // getMappedResourceData(resourceMappingService, $scope);
        //$scope.headingList = [];
        //prepareTableHeading($scope, monthlyHeaderListService);

        // $scope.countrychange = function () {
        //     //getMappedResourceData(resourceMappingService,$scope);
        //     createGraph($scope, resourceMappingService, availableDaysService, monthlyHeaderListService, allocationService,projectService);
        // }

        //getGraphData($scope,allocationService,leaveService,resourceMappingService,availableDaysService,monthlyHeaderListService);
        //getActualResourceCapacity(availableDaysService,monthlyHeaderListService);

        if ($scope.region != 'All') {
            document.getElementById("region-select").style.display = "none";
        } else {
            document.getElementById("region-select").style.display = "block";
        }
        $scope.regionChange = function () {
            $scope.regionname = $scope.selectRegion;
            $scope.newRegion = true;
            $scope.graphidchange();

        }

        $scope.graphidchange = function () {

            if ($scope.startDate === '' || $scope.endDate === '' || $scope.startDate === undefined || $scope.endDate === undefined) {
                return;
            }

            var strDt = $scope.startDate.split("/");
            var endDt = $scope.endDate.split("/");

            var date_1 = new Date(strDt[1], parseInt(strDt[0]) - 1);
            var date_2 = new Date(endDt[1], parseInt(endDt[0]) - 1);
            var monthCol = "";

            if (date_1 != "Invalid Date" && date_2 != "Invalid Date") {
                if (date_2 >= date_1) {
                    monthCol = months($scope.startDate, $scope.endDate);
                    app.errorMsg = false;
                    createGraph($scope, $filter, resourceService, allocationService, projectService, leaveService, holidayListService);
                } else {
                    // alert("Please select a valid date range.");
                    //  return;
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

    }

    function createGraph($scope, $filter, resourceService, allocationService, projectService, leaveService, holidayListService) {
        $scope.ShowSpinnerStatus = true;

        switch ($scope.graphid) {
            case "ProjectMDS":
            //     document.getElementById("skill").style.display = "none";
            //     document.getElementById("project").style.display = "block";
            //     projectManDaysGraph($scope, $filter, allocationService, projectService, $scope.regionname);
            //     break;
            case "AvlCapcitySkill":
                document.getElementById("project").style.display = "none";
                document.getElementById("skill").style.display = "block";
                avlCapcitySkillGraph($scope, $filter, allocationService, resourceService, leaveService, holidayListService, $scope.regionname);
                break;
            case "DemandCapacity":
                document.getElementById("project").style.display = "none";
                document.getElementById("skill").style.display = "none";
                demandGraph($scope, $filter, resourceService, allocationService, leaveService, holidayListService, $scope.regionname);
                break;
            case "CapacityFYF":
                document.getElementById("project").style.display = "none";
                document.getElementById("skill").style.display = "none";
                demandGraphFYF($scope, $filter, resourceService, allocationService, leaveService, holidayListService, $scope.regionname);
                break;
            default:
                break;
        }

    }//End OF CreateGraph()

    function getRegion(regionService, $scope) {
        regionService.getRegion().then(function (res) {
            $scope.regionData = res.data;
        })

    }

    function demandGraphFYF($scope, $filter, resourceService, allocationService, leaveService, holidayListService, regionname) {

        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");

        resourceService.getResources(regionname).then(function (resource) {
            leaveService.getLeave().then(function (res) {
                $scope.leaveList = res.data;
                var monthCol = months($scope.startDate, $scope.endDate);
                allocationService.getAllAllocationByYear(strDt[1], endDt[1], regionname).then(function (allocation) {
                    holidayListService.getLocationHolidaysYearRange(strDt[1], endDt[1]).then(function (holidayData) {
                        drawDeamndAndCapcityGraphFYF($scope, $filter, resource.data, monthCol, $scope.leaveList, allocation.data, holidayData.data);
                    });
                });

            }).catch(function (err) {
                console.log(err);
            });

        }).catch(function (err) {
            console.log(err);
        });
    }

    function drawDeamndAndCapcityGraphFYF($scope, $filter, resourceData, monthCol, leaveList, allocationData, holidayList) {

        $scope.GraphData = [];
        var stCapacity = new Array(monthCol.length);
        stCapacity.fill(0, 0, monthCol.length);

        var ftCapacity = new Array(monthCol.length);
        ftCapacity.fill(0, 0, monthCol.length);

        // Total ST Capacity (ST + Buffer - Vaction) , ST+Buffer = Total mapping value
        angular.forEach(resourceData, function (resource) {
            var leaveFilter = $filter('filter')(leaveList, { resourcename: resource.resourcename });
            monthlyAvailableDays(resource, monthCol);

            if (resource.resourceType === 'Sufficient') {
                angular.forEach(resource.monthlyAvailableActualMandays, function (mapData, index) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = stCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            stCapacity[indx] = round((parseFloat(value) + parseFloat(mapData.value)), 1);
                        }
                    }
                });

                // it excludes the vacation based on the percentage of mapping

                angular.forEach(leaveFilter, function (leaves) {
                    angular.forEach(leaves.leavedaysinmonth, function (leave) {
                        if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)

                            var indx = monthCol.indexOf(leave.month);
                            var value = stCapacity[indx];
                            var percent = resource.taggedP;

                            /*angular.forEach(mapping.taggToEuroclear, function (tagged) {
                                if (tagged.key === leave.month) percent = tagged.value;
                            });*/

                            if (!isNaN(leave.value)) {
                                var percentV = (leave.value * percent) / 100;
                                stCapacity[indx] = round((parseFloat(value) - parseFloat(percentV)), 1);
                                //console.log('ST' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
                            }
                        }
                    });
                });

                var holidayFilter = $filter('filter')(holidayList, { locationname: resource.baseentity });
                angular.forEach(holidayFilter, function (holiday) {
                    var lmonth = getMonthAndYear(new Date(holiday.holidayDate).getMonth(), new Date(holiday.holidayDate).getFullYear());

                    angular.forEach(resource.monthlyAvailableActualMandays, function (data) { // if allocation is not done for the resource or he is not active
                        if (data.key === lmonth && data.value > 0) {
                            if (monthCol.indexOf(lmonth) >= 0) { // check if months equal to the predefined month array(user selected)
                                var indx = monthCol.indexOf(lmonth);
                                var value = stCapacity[indx];
                                // angular.forEach(mapping.taggToEuroclear, function (data) { // if allocation is not done for the resource or he is not active
                                // if (data.key === lmonth) {
                                var percent = parseFloat(resource.taggedP);
                                var actualHDays = (1 * percent) / 100;
                                stCapacity[indx] = value - actualHDays;
                                // }
                                //});
                            }
                        }
                    });
                });
            }

            if (resource.resourceType === 'FlexTeam') {
                angular.forEach(resource.monthlyAvailableActualMandays, function (mapData) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = ftCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            ftCapacity[indx] = round((parseFloat(value) + parseFloat(mapData.value)), 1);
                            // stFtCapacity[indx] = round((parseInt(stFtCapacity[indx])) + ,1);  
                        }
                    }
                });

                // it excludes the vacation based on the percentage of mapping
                angular.forEach(leaveFilter, function (leaves) {
                    angular.forEach(leaves.leavedaysinmonth, function (leave) {
                        if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)

                            var indx = monthCol.indexOf(leave.month);
                            var value = ftCapacity[indx];
                            var percent = resource.taggedP;

                            /* angular.forEach(mapping.taggToEuroclear, function (tagged) {
                                 if (tagged.key === leave.month) percent = tagged.value;
                             });*/

                            if (!isNaN(leave.value)) {
                                var percentV = (leave.value * percent) / 100;
                                ftCapacity[indx] = round((parseFloat(value) - parseFloat(percentV)), 1);
                                // console.log('FT ' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
                            }
                        }
                    });
                });

                var holidayFilter = $filter('filter')(holidayList, { locationname: resource.baseentity });
                angular.forEach(holidayFilter, function (holiday) {
                    var lmonth = getMonthAndYear(new Date(holiday.holidayDate).getMonth(), new Date(holiday.holidayDate).getFullYear());

                    angular.forEach(resource.monthlyAvailableActualMandays, function (data) { // if allocation is not done for the resource or he is not active
                        if (data.key === lmonth && data.value > 0) {
                            if (monthCol.indexOf(lmonth) >= 0) { // check if months equal to the predefined month array(user selected)
                                var indx = monthCol.indexOf(lmonth);
                                var value = ftCapacity[indx];
                                // angular.forEach(mapping.taggToEuroclear, function (data) { // if allocation is not done for the resource or he is not active
                                // if (data.key === lmonth) {
                                var percent = parseFloat(resource.taggedP);
                                var actualHDays = (1 * percent) / 100;
                                ftCapacity[indx] = value - actualHDays;
                                // }
                                // });
                            }
                        }
                    });
                });
            }
        });

        var stFtCapacity = new Array(monthCol.length);
        var yAxisValue = 1000;

        for (var i = 0; i < stFtCapacity.length; i++) {
            stFtCapacity[i] = stCapacity[i] + ftCapacity[i];
            yAxisValue = yAxisValue > stFtCapacity[i] ? yAxisValue : stFtCapacity[i];
        }
        yAxisValue += 500;

        //console.log(stFtCapacity);

        var projectDemand = new Array(monthCol.length);
        projectDemand.fill(0, 0, monthCol.length);

        var maintainceDemand = new Array(monthCol.length);
        maintainceDemand.fill(0, 0, monthCol.length);

        var productionDemand = new Array(monthCol.length);
        productionDemand.fill(0, 0, monthCol.length);

        var totalDemand = new Array(monthCol.length);
        totalDemand.fill(0, 0, monthCol.length);

        angular.forEach(allocationData, function (allocaitons) {

            angular.forEach(allocaitons.allocation, function (allocData) {

                if (allocaitons.project.startsWith("Production Support")) {
                    if (monthCol.indexOf(allocData.month) >= 0) {
                        var indx = monthCol.indexOf(allocData.month);
                        var value = productionDemand[indx];
                        var tvalue = totalDemand[indx]; // total demand

                        if (!isNaN(allocData.value)) {
                            productionDemand[indx] = round((parseFloat(value) + parseFloat(allocData.value)), 1);
                            totalDemand[indx] = round((parseFloat(tvalue) + parseFloat(allocData.value)), 1);
                        }
                    }
                } else if (allocaitons.project.startsWith("Maintenance")) {
                    if (allocaitons.resourcetype === "Sufficient" || allocaitons.resourcetype === "FlexTeam") {
                        if (monthCol.indexOf(allocData.month) >= 0) {
                            var indx = monthCol.indexOf(allocData.month);
                            var value = maintainceDemand[indx];
                            var tvalue = totalDemand[indx]; // total demand

                            if (!isNaN(allocData.value)) {
                                maintainceDemand[indx] = round((parseFloat(value) + parseFloat(allocData.value)), 1);
                                totalDemand[indx] = round((parseFloat(tvalue) + parseFloat(allocData.value)), 1);
                            }
                        }
                    }
                } else {
                    if (allocaitons.resourcetype === "Sufficient" || allocaitons.resourcetype === "FlexTeam") {
                        if (monthCol.indexOf(allocData.month) >= 0) {
                            var indx = monthCol.indexOf(allocData.month);
                            var value = projectDemand[indx];
                            var tvalue = totalDemand[indx]; // total demand

                            if (!isNaN(allocData.value)) {
                                projectDemand[indx] = round((parseFloat(value) + parseFloat(allocData.value)), 1);
                                totalDemand[indx] = round((parseFloat(tvalue) + parseFloat(allocData.value)), 1);
                            }
                        }

                    }
                }
            });
        });

        var prodSupportCon = new Array(monthCol.length);
        prodSupportCon.fill(round((18.333 * 3), 1), 0, monthCol.length);

        var maintainceCon = new Array(monthCol.length);
        maintainceCon.fill(round((18.333 * 9), 1), 0, monthCol.length);

        var projSupportCon = new Array(monthCol.length);
        projSupportCon.fill(round((18.333 * 10), 1), 0, monthCol.length);

        var availableCapacity = new Array(monthCol.length);
        availableCapacity.fill(0, 0, monthCol.length);

        var availableCapacityP = new Array(monthCol.length);
        availableCapacityP.fill(0, 0, monthCol.length);

        for (var i = 0; i < monthCol.length; i++) {
            availableCapacity[i] = round((stFtCapacity[i] - totalDemand[i]), 1);
            availableCapacityP[i] = Math.ceil(((availableCapacity[i] / stFtCapacity[i]) * 100));
        }

        var chartData = {
            labels: monthCol,
            datasets: [{
                type: 'line',
                label: 'Total Demand',
                borderColor: "#ffc0cb",
                borderWidth: 2,
                fill: false,
                data: totalDemand

            }, {
                type: 'line',
                label: 'Total Capacity (ST + FT)',
                borderColor: "#d5cc4d",
                borderWidth: 2,
                fill: false,
                data: stFtCapacity

            }, {
                type: 'line',
                label: 'Production Support (Contractual)',
                borderColor: '#800080',
                borderWidth: 2,
                fill: false,
                data: prodSupportCon

            }, {
                type: 'line',
                label: 'Maintaince (Contractual)',
                borderColor: '#ff0000',
                borderWidth: 2,
                fill: false,
                data: maintainceCon

            }, {
                type: 'line',
                label: 'Project Support (Contractual)',
                borderColor: '#556b2f',
                borderWidth: 2,
                fill: false,
                data: projSupportCon

            }, {
                type: 'line',
                label: 'Avialble Capacity',
                borderColor: '#50C878',
                borderWidth: 2,
                borderDash: [10, 10],
                fill: false,
                data: availableCapacity

            },
            {
                type: 'line',
                label: 'Available Capacity %',
                borderColor: ' #febaad',
                borderWidth: 2,
                fill: false,
                data: availableCapacityP

            }, {
                type: 'bar',
                label: 'Total ST Capacity',
                backgroundColor: "#7f868a",
                data: stCapacity,

            }, {
                type: 'bar',
                label: 'Production Support Demand',
                backgroundColor: "#b24141 ",
                data: productionDemand
            }, {
                type: 'bar',
                label: 'Maintaince Demand',
                backgroundColor: "#003763",
                data: maintainceDemand,

            }, {
                type: 'bar',
                label: 'Project Demand',
                backgroundColor: "#ddaf27",
                data: projectDemand
            }]

        };

        $scope.GraphData.push({ label: "Total ST Capacity", backgroundColor: "#7f868a", data: stCapacity });
        $scope.GraphData.push({ label: "Production Support Demand", backgroundColor: "#b24141 ", data: productionDemand });
        $scope.GraphData.push({ label: "Maintaince Demand", backgroundColor: "#003763", data: maintainceDemand });
        $scope.GraphData.push({ label: "Project Demand", backgroundColor: "#ddaf27", data: projectDemand });

        $scope.GraphData.push({ label: "Total Demand", backgroundColor: "#ffc0cb", data: totalDemand, showLine: "true" });
        $scope.GraphData.push({ label: "Total Capacity (ST + FT)", backgroundColor: "#d5cc4d", data: stFtCapacity, showLine: "true" });
        $scope.GraphData.push({ label: "Production Support (Contractual)", backgroundColor: "#800080", data: prodSupportCon, showLine: "true" });
        $scope.GraphData.push({ label: "Maintaince (Contractual)", backgroundColor: "#ff0000", data: maintainceCon, showLine: "true" });
        $scope.GraphData.push({ label: "Project Support (Contractual)", backgroundColor: "#556b2f", data: projSupportCon, showLine: "true" });
        $scope.GraphData.push({ label: "Available Capacity", backgroundColor: "#50C878", data: availableCapacity, showDot: "true" });
        $scope.GraphData.push({ label: "Available Capacity %", backgroundColor: " #febaad", data: availableCapacityP, showLine: "true" });
        $scope.GraphData.months = monthCol;

        var ctx = CreateCanvas("drawDeamndAndCapcityGraphFYF");
        var chart =
            new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: $scope.region + ' Capacity Demand FYF'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: true
                    }, legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{

                            scaleLabel: {
                                display: true,
                                labelString: 'Months'
                            }

                        }],
                        yAxes: [{

                            scaleLabel: {
                                display: true,
                                labelString: 'ManDays'
                            }
                        }]
                    }
                }
            });

        $("#graphDiv").show();
        $scope.ShowSpinnerStatus = false;
        var spinner = document.getElementById("spinner");
        if (spinner.style.display != "none") {
            spinner.style.display = "none";

        }
    }

    function demandGraph($scope, $filter, resourceService, allocationService, leaveService, holidayListService, regionname) {
        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");

        resourceService.getResources(regionname).then(function (resource) {
            leaveService.getLeave().then(function (res) {
                $scope.leaveList = res.data;
                var monthCol = months($scope.startDate, $scope.endDate);
                allocationService.getAllAllocationByYear(strDt[1], endDt[1], regionname).then(function (allocation) {
                    holidayListService.getLocationHolidaysYearRange(strDt[1], endDt[1]).then(function (holdata) {
                        drawDeamndAndCapcityGraph($scope, $filter, resource.data, monthCol, $scope.leaveList, allocation.data, holdata.data);
                    });

                });

            }).catch(function (err) {
                console.log(err);
            });

        }).catch(function (err) {
            console.log(err);
        });
    }

    function drawDeamndAndCapcityGraph($scope, $filter, resourceData, monthCol, leaveList, allocationData, holidayList) {

        $scope.GraphData = [];
        var stCapacity = new Array(monthCol.length);
        stCapacity.fill(0, 0, monthCol.length);

        var ftCapacity = new Array(monthCol.length);
        ftCapacity.fill(0, 0, monthCol.length);

        // Total ST Capacity (ST + Buffer - Vaction) , ST+Buffer = Total mapping value
        angular.forEach(resourceData, function (resource) {
            var leaveFilter = $filter('filter')(leaveList, { resourcename: resource.resourcename });

            if (resource.resourceType === 'Sufficient') {

                monthlyAvailableDays(resource, monthCol);

                angular.forEach(resource.monthlyAvailableActualMandays, function (mapData, index) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = stCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            stCapacity[indx] = round((parseFloat(value) + parseFloat(mapData.value)), 1);
                        }
                    }
                });

                // it excludes the vacation based on the percentage of mapping

                angular.forEach(leaveFilter, function (leaves) {
                    angular.forEach(leaves.leavedaysinmonth, function (leave) {
                        if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)

                            var indx = monthCol.indexOf(leave.month);
                            var value = stCapacity[indx];
                            var percent = parseFloat(resource.taggedP);

                            /* angular.forEach(resource.taggToEuroclear, function (tagged) {
                                 if (tagged.key === leave.month) percent = tagged.value;
                             });*/

                            //if (percent > 0) {
                            if (!isNaN(leave.value)) {
                                var percentV = (leave.value * percent) / 100;
                                stCapacity[indx] = round((parseFloat(value) - parseFloat(percentV)), 1);
                                //console.log('ST' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
                            }
                            // }
                        }
                    });
                });

                var holidayFilter = $filter('filter')(holidayList, { locationname: resource.baseentity });

                angular.forEach(holidayFilter, function (holiday) {
                    var lmonth = getMonthAndYear(new Date(holiday.holidayDate).getMonth(), new Date(holiday.holidayDate).getFullYear());
                    var percent = parseFloat(resource.taggedP);

                    //angular.forEach(resource.taggToEuroclear, function (tagged) {
                    // if (tagged.key === lmonth) {
                    var indx = monthCol.indexOf(lmonth);
                    //percent = tagged.value;
                    //var percent = parseFloat(tagged.value);
                    var actualHDays = (1 * percent) / 100;
                    stCapacity[indx] = round((stCapacity[indx] - parseFloat(actualHDays)), 1);
                    // }
                    // });
                });
            }

            if (resource.resourceType === 'FlexTeam') {
                monthlyAvailableDays(resource, monthCol);
                angular.forEach(resource.monthlyAvailableActualMandays, function (mapData) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = ftCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            ftCapacity[indx] = round((parseFloat(value) + parseFloat(mapData.value)), 1);
                            // stFtCapacity[indx] = round((parseInt(stFtCapacity[indx])) + ,1);  
                        }
                    }
                });

                // it excludes the vacation based on the percentage of mapping
                angular.forEach(leaveFilter, function (leaves) {
                    angular.forEach(leaves.leavedaysinmonth, function (leave) {
                        if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)

                            var indx = monthCol.indexOf(leave.month);
                            var value = ftCapacity[indx];
                            var percent = parseFloat(resource.taggedP);

                            /* angular.forEach(resource.taggToEuroclear, function (tagged) {
                                 if (tagged.key === leave.month) percent = tagged.value;
                             });*/

                            if (percent > 0) {
                                if (!isNaN(leave.value)) {
                                    var percentV = (leave.value * percent) / 100;
                                    ftCapacity[indx] = round((parseFloat(value) - parseFloat(percentV)), 1);
                                    // console.log('FT ' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
                                }
                            }
                        }
                    });
                });

                var holidayFilter = $filter('filter')(holidayList, { locationname: resource.baseentity });

                angular.forEach(holidayFilter, function (holiday) {
                    var lmonth = getMonthAndYear(new Date(holiday.holidayDate).getMonth(), new Date(holiday.holidayDate).getFullYear());
                    var percent = parseFloat(resource.taggedP);

                    // angular.forEach(resource.taggToEuroclear, function (tagged) {
                    // if (tagged.key === lmonth) {
                    var indx = monthCol.indexOf(lmonth);
                    //   percent = tagged.value;
                    //  var percent = parseFloat(tagged.value);
                    var actualHDays = (1 * percent) / 100;
                    ftCapacity[indx] = round((ftCapacity[indx] - parseFloat(actualHDays)), 1);
                    // }
                    // });
                });
            }
        });

        var stFtCapacity = new Array(monthCol.length);

        for (var i = 0; i < stFtCapacity.length; i++) {
            stFtCapacity[i] = stCapacity[i] + ftCapacity[i];
        }

        var projectDemand = new Array(monthCol.length);
        projectDemand.fill(0, 0, monthCol.length);

        var maintainceDemand = new Array(monthCol.length);
        maintainceDemand.fill(0, 0, monthCol.length);

        var productionDemand = new Array(monthCol.length);
        productionDemand.fill(0, 0, monthCol.length);

        angular.forEach(allocationData, function (allocaitons) {

            if (allocaitons.resourcetype === "Sufficient" || allocaitons.resourcetype === "FlexTeam") {

                angular.forEach(allocaitons.allocation, function (allocData) {
                    var total = 0;
                    if (allocaitons.project.startsWith("Production Support")) {
                        if (monthCol.indexOf(allocData.month) >= 0) {
                            var indx = monthCol.indexOf(allocData.month);
                            var value = productionDemand[indx];
                            if (!isNaN(allocData.value)) {
                                productionDemand[indx] = round((parseFloat(value) + parseFloat(allocData.value)), 1);
                            }
                        }
                    } else if (allocaitons.project.startsWith("Maintenance")) {
                        if (monthCol.indexOf(allocData.month) >= 0) {
                            var indx = monthCol.indexOf(allocData.month);
                            var value = maintainceDemand[indx];
                            if (!isNaN(allocData.value)) {
                                maintainceDemand[indx] = round((parseFloat(value) + parseFloat(allocData.value)), 1);
                            }
                        }
                    } else {
                        if (monthCol.indexOf(allocData.month) >= 0) {
                            var indx = monthCol.indexOf(allocData.month);
                            var value = projectDemand[indx];
                            if (!isNaN(allocData.value)) {
                                projectDemand[indx] = round((parseFloat(value) + parseFloat(allocData.value)), 1);
                            }
                        }

                    }

                });
            }
        });

        //console.log('projectDemand' + projectDemand);
        //console.log('maintainceDemand' + maintainceDemand);
        //console.log('productionDemand' + productionDemand);

        var yAxisValue = 1000;
        var total = 0;

        for (var count = 0; count < monthCol.length; count++) {
            yAxisValue = yAxisValue > projectDemand[count] ? yAxisValue : projectDemand[count];
            yAxisValue = yAxisValue > maintainceDemand[count] ? yAxisValue : maintainceDemand[count];
            yAxisValue = yAxisValue > productionDemand[count] ? yAxisValue : productionDemand[count];
            yAxisValue = yAxisValue > stFtCapacity[count] ? yAxisValue : stFtCapacity[count];

        }

        var barChartData = {
            labels: monthCol,
            datasets: [{
                label: 'Production Support Demand',
                backgroundColor: "#b24141 ",
                yAxisID: "bar-y-axis",
                data: productionDemand
            }, {
                label: 'Maintaince Demand',
                backgroundColor: "#003763",
                yAxisID: "bar-y-axis",
                data: maintainceDemand
            }, {
                label: 'Project Demand',
                backgroundColor: "#ddaf27",
                yAxisID: "bar-y-axis",
                data: projectDemand
            }, {
                data: stFtCapacity,
                type: 'line',
                label: 'Total Capacity (ST+FT)',
                fill: false,
                backgroundColor: "#6bb300",
                borderColor: "#6bb300",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                lineTension: 0.3,
                pointBackgroundColor: "#fff",
                pointBorderColor: "#70cbf4",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "#70cbf4",
                pointHoverBorderColor: "#70cbf4",
                pointHoverBorderWidth: 2,
                pointRadius: 4,
                pointHitRadius: 10
            }, {
                data: stCapacity,
                type: 'line',
                label: 'Total ST Capacity',
                fill: true,
                backgroundColor: "#7f868a",
                borderColor: "#7f868a",
                borderCapStyle: '',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                lineTension: .3,
                pointBackgroundColor: "#737373",
                pointBorderColor: "#737373",
                pointBorderWidth: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "#737373",
                pointHoverBorderColor: "#737373",
                pointHoverBorderWidth: 2,
                pointRadius: 4,
                pointHitRadius: 10
            }]
        };

        $scope.GraphData.push({ label: "Total ST Capacity", backgroundColor: "#7f868a", data: stCapacity, showFill: "true" });
        $scope.GraphData.push({ label: "Project Demand", backgroundColor: "#ddaf27", data: projectDemand });
        $scope.GraphData.push({ label: "Maintaince Demand", backgroundColor: "#003763", data: maintainceDemand });
        $scope.GraphData.push({ label: "Production Support Demand", backgroundColor: "#b24141 ", data: productionDemand });
        $scope.GraphData.push({ label: "Total Capacity (ST + FT)", backgroundColor: "#6bb300", data: stFtCapacity, showLine: "true" });
        $scope.GraphData.months = monthCol;

        var ctx = CreateCanvas("DemandCapacity");
        var mixedChart = new Chart(ctx, {
            type: 'bar',
            data: barChartData,
            options: {
                title: {
                    display: true,
                    text: $scope.region + " Demand & Capacity (MDs)"
                },
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'label'
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true,
                        maxBarThickness: 40,
                        scaleLabel: {
                            display: true,
                            labelString: 'Months'
                        }
                    }],
                    yAxes: [{
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: yAxisValue
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'ManDays'
                        }
                    }, {
                        id: "bar-y-axis",
                        stacked: false,
                        display: false, //optional
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: yAxisValue
                        },
                        type: 'linear'

                    }]
                }
            }

        });

        //chart.render();
        $("#graphDiv").show();
        $scope.ShowSpinnerStatus = false;
        var spinner = document.getElementById("spinner");
        if (spinner.style.display != "none") {
            spinner.style.display = "none";

        }
    }

    function projectManDaysGraph($scope, $filter, allocationService, projectService, regionname) {

        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");
        //$scope.projectSelect = "ALL";
        projectService.getProject(regionname).then(function (project) {
            $scope.project = project.data;

            if ($scope.projectHTML === '' || $scope.newRegion) {
                $scope.projectHTML = "";
                // $scope.projectSelect = "ALL";

                angular.forEach($scope.project, function (item) {
                    if (!item.projectname.startsWith("Production Support") && !item.projectname.startsWith("Maintenance")) {
                        $scope.projectHTML += '<option>' + item.projectname + '</option>';
                    }
                });

                $('#project-select').find('option').remove().end().append($scope.projectHTML);
                $('#project-select').multiselect('rebuild');
            }
            // console.log("project"+$scope.projectSelect);
            allocationService.getAllAllocationByYear(strDt[1], endDt[1], regionname).then(function (allocation) {
                var monthCol = months($scope.startDate, $scope.endDate);
                drawTotalManDaysGraph($scope, $filter, project.data, allocation.data, monthCol);

            }).catch(function (err) {
                console.log(err);
            });

        }).catch(function (err) {
            console.log(err);
        });

    }

    function drawTotalManDaysGraph($scope, $filter, projectList, allocationList, monthCol) {

        $scope.GraphData = [];
        $scope.projectFilter = [];

        //  console.log("project Select"+$scope.projectSelect);
        if ($scope.projectSelect === undefined || $scope.projectSelect === 'ALL') {
            angular.forEach(projectList, function (project, index) {
                $scope.projectFilter.push(project.projectname);
            });

        } else {

            for (var k = 0; k < $scope.projectSelect.length; k++) {
                $scope.projectFilter.push($scope.projectSelect[k]);
            }
        }

        angular.forEach($scope.projectFilter, function (projectname, index) {

            var monthWise = new Array(monthCol.length);
            monthWise.fill(0, 0, monthWise.length);
            var filterAllocation = $filter('filter')(allocationList, { project: projectname });

            angular.forEach(filterAllocation, function (alloc) {

                if (alloc.resourcetype === "Sufficient" || alloc.resourcetype === "FlexTeam") {
                    if (!alloc.project.startsWith("Production Support") && !alloc.project.startsWith("Maintenance")) {
                        angular.forEach(alloc.allocation, function (data) {
                            if (monthCol.indexOf(data.month) >= 0) { // check if months equal to the predefined month array(user selected)
                                var indx = monthCol.indexOf(data.month);
                                var value = monthWise[indx];
                                if (!isNaN(data.value))
                                    monthWise[indx] = round((parseFloat(value) + parseFloat(data.value)), 1);
                                //monthWise[indx] = parseInt(value) + parseInt(data.value);
                            }
                        });
                    }
                }
            });

            if (!projectname.startsWith("Production Support") && !projectname.startsWith("Maintenance")) {
                $scope.GraphData.push({ label: projectname, backgroundColor: getRandomColor(index), data: monthWise });
            }
        });
        $scope.GraphData.months = monthCol;

        var ctx = CreateCanvas("TotalManDaysGraph");
        var chart =
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: monthCol,
                    datasets: $scope.GraphData
                },
                options: {
                    title: {
                        display: true,
                        text: $scope.regionname + ' Project Demand & Pipeline (MDs)'
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            maxBarThickness: 30,
                            scaleLabel: {
                                display: true,
                                labelString: 'Months'
                            }

                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'ManDays'
                            }
                        }]
                    }
                }
            });

        $("#graphDiv").show();
        $scope.ShowSpinnerStatus = false;
        var spinner = document.getElementById("spinner");
        if (spinner.style.display != "none") {
            spinner.style.display = "none";

        }
        $scope.newRegion = false;
    }

    function avlCapcitySkillGraph($scope, $filter, allocationService, resourceService, leaveService, holidayListService, regionname) {


        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");

        // skillSetService.getSkillSets().then(function (skill) {
        //  $scope.skillSetList = "";
        resourceService.getResources(regionname).then(function (resource) {
            $scope.skillSetList = [];
            angular.forEach(resource.data, function (res) {
                if ($scope.skillSetList.indexOf(res.skill) < 0) {
                    $scope.skillSetList.push(res.skill);
                }
            });

            allocationService.getAllAllocationByYear(strDt[1], endDt[1], regionname).then(function (allocation) {
                var monthCol = months($scope.startDate, $scope.endDate);

                leaveService.getLeave().then(function (res) {
                    $scope.leaveList = res.data;
                    holidayListService.getLocationHolidaysYearRange(strDt[1], endDt[1]).then(function (holdata) {
                        drawAvailCapacityGraph($scope, $filter, resource.data, $scope.skillSetList, allocation.data, monthCol, $scope.leaveList, holdata.data);
                    });

                }).catch(function (err) {
                    console.log(err);
                });

            }).catch(function (err) {
                console.log(err);
            });

        }).catch(function (err) {
            console.log(err);
        });

    }

    function drawAvailCapacityGraph($scope, $filter, resourceList, skillSetList, allocationList, monthCol, leaveList, holidayList) {

        $scope.GraphData = [];
        var duplicateCheck = new Array();

        if ($scope.skillSelect != 'ALL') {
            skillSetList = [];
            skillSetList.push($scope.skillSelect);
        }

        angular.forEach(skillSetList, function (skill, index) {
            var monthWise = new Array(monthCol.length);
            monthWise.fill(0.0, 0.0, monthCol.length);

            var vDcheck = "";
            var resourceMappBySkill = [];

            for (var k = 0; k < resourceList.length; k++) {
                if (resourceList[k].resourceType === 'Sufficient' || resourceList[k].resourceType === 'FlexTeam') {
                    if (resourceList[k].skill === skill) {
                        resourceMappBySkill.push(resourceList[k]);
                    }
                }
            }

            angular.forEach(resourceMappBySkill, function (mappedRes) {

                monthlyAvailableDays(mappedRes, monthCol);
                angular.forEach(mappedRes.monthlyAvailableActualMandays, function (data) {

                    if (monthCol.indexOf(data.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(data.key);
                        vDcheck = skill + "-" + mappedRes.resourcename;

                        var value = monthWise[indx];
                        if (!isNaN(data.value)) {
                            monthWise[indx] = (parseFloat(value) + parseFloat(data.value));
                        }
                    }
                });

                if (duplicateCheck.indexOf(vDcheck) < 0) {

                    // check for alloction ,and if it is there for that resource and skill then minus that value
                    var allocationFilter = $filter('filter')(allocationList, { resource: mappedRes.resourcename });

                    angular.forEach(allocationFilter, function (alloc) {
                        if (alloc.resourcetype === 'Sufficient' || alloc.resourcetype === 'FlexTeam') {
                            angular.forEach(alloc.allocation, function (data) {
                                if (monthCol.indexOf(data.month) >= 0) { // check if months equal to the predefined month array(user selected)
                                    var indx = monthCol.indexOf(data.month);
                                    var value = monthWise[indx];
                                    if (!isNaN(data.value)) {
                                        var value = round((parseFloat(value) - parseFloat(data.value)), 1);
                                        monthWise[indx] = value;
                                    }

                                }
                            });
                        }
                    });

                    //deduct the leave as well for that resource

                    var leaveFilter = $filter('filter')(leaveList, { resourcename: mappedRes.resourcename });

                    angular.forEach(leaveFilter, function (leaves) {
                        angular.forEach(leaves.leavedaysinmonth, function (leave) {
                            if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)
                                var indx = monthCol.indexOf(leave.month);
                                var monthValue = monthWise[indx];

                                //angular.forEach(mappedRes.taggToEuroclear, function (data) { // if allocation is not done for the resource or he is not active
                                // if (data.key === leave.month) {
                                var percent = mappedRes.taggedP;
                                var actualLeave = (leave.value * percent) / 100;
                                var value = round((parseFloat(monthValue) - actualLeave), 1);
                                monthWise[indx] = value;

                                // }
                                //});
                            }
                        });
                    });

                    var holidayFilter = $filter('filter')(holidayList, { locationname: resourceMappBySkill.baseentity });
                    angular.forEach(holidayFilter, function (holiday) {
                        var lmonth = getMonthAndYear(new Date(holiday.holidayDate).getMonth(), new Date(holiday.holidayDate).getFullYear());

                        angular.forEach(mappedRes.monthlyAvailableActualMandays, function (data) { // if allocation is not done for the resource or he is not active
                            if (data.key === lmonth && data.value > 0) {
                                if (monthCol.indexOf(lmonth) >= 0) { // check if months equal to the predefined month array(user selected)
                                    var indx = monthCol.indexOf(lmonth);
                                    var value = monthWise[indx];
                                    //angular.forEach(mappedRes.taggToEuroclear, function (data) { // if allocation is not done for the resource or he is not active
                                        //if (data.key === lmonth) {
                                            var percent = mappedRes.taggedP;
                                            var actualHDays = (1 * percent) / 100;
                                            monthWise[indx] = value - actualHDays;

                                       // }
                                    //});
                                }
                            }
                        });

                    });
                    duplicateCheck.push(vDcheck);
                }
            });

            $scope.GraphData.push({ label: skill, backgroundColor: getRandomColor(index), data: monthWise });
        });

        $scope.GraphData.months = monthCol;

        var ctx = CreateCanvas("avlCapcitySkillGraph");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthCol,
                datasets: $scope.GraphData
            },
            options: {
                title: {
                    display: true,
                    text: $scope.regionname + ' Skillset Available Capacity (MDs)',
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        min: 0,
                        maxBarThickness: 40,
                        scaleLabel: {
                            display: true,
                            labelString: 'Months'
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        min: 0,
                        scaleLabel: {
                            display: true,
                            labelString: 'Buffer Availability'
                        }
                    }]

                },
                scaleBeginAtZero: true
            }
        });
        $("#graphDiv").show();

        $scope.ShowSpinnerStatus = false;
        var spinner = document.getElementById("spinner");
        if (spinner.style.display != "none") {
            spinner.style.display = "none";
        }
    }


    function monthlyAvailableDays(resourceMappBySkill, selectMonth) {

        var monthlyAvailableActualMandaysArray = [];

        for (var j = 0; j < selectMonth.length; j++) {
            var yearAndMonth = selectMonth[j].split('-');
            var month = getIndex(yearAndMonth[0]);
            var year = yearAndMonth[1];

            var workdays = getWorkDays(month, year);
            var actualWorkingDays = workdays * (resourceMappBySkill.taggedP / 100);
            var actualWorkingDaysWithRound = getRoundNumber(actualWorkingDays, 1);
            var monthlyAvailableActualMandaysObject = {
                "key": selectMonth[j],
                "value": actualWorkingDaysWithRound
            };

            monthlyAvailableActualMandaysArray.push(monthlyAvailableActualMandaysObject);

        }
        resourceMappBySkill.monthlyAvailableActualMandays = monthlyAvailableActualMandaysArray;
    }


    function createStackedBarGraph($scope) {
        var ctx = CreateCanvas("SkillsetChart");
        var chart = new Chart(ctx, {
            type: 'bar',
            data: $scope.barChartData,
            options: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        fontColor: 'rgb(255, 99, 132)'
                    }
                },
                title: {
                    display: true,
                    text: $scope.chartlabel
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Months'
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'ManDays'
                        }
                    }]
                }
            }
        });
    }//Endf OF createStackedBarGraph($scope)

    function createBarGraph($scope) {
        var ctx = CreateCanvas("SkillsetChart");
        var chart = new Chart(ctx, {
            type: 'bar',
            data: $scope.barChartData,
            scaleLabel: "Hello",
            options: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        fontColor: 'rgb(255, 99, 132)'
                    }
                },
                title: {
                    display: true,
                    text: $scope.chartlabel
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Months'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'ManDays',
                            barPercentage: 0.5
                        }
                    }]
                }
            }
        });
    }//Endf OF createStackedBarGraph($scope)

    function CreateCanvas(canvasId) {

        if (document.body.contains(document.getElementById("chartSubContainer"))) {
            //document.getElementById("chartSubContainer").remove();
            $('#chartSubContainer').remove();
        }

        var canvas = document.createElement('canvas');
        var chartSubContainer = document.createElement('div');
        chartSubContainer.id = "chartSubContainer";
        canvas.id = canvasId;
        //chartSubContainer.style.width = '1200px';
        //chartSubContainer.style.height = '600px';

        var container = document.getElementById('ChartContainer');
        container.appendChild(chartSubContainer);
        chartSubContainer.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        document.getElementById('download').addEventListener('click', function () {
            downloadCanvas(this, canvas.id, canvas.id + ".png");
        }, false);
        return ctx;
    }

    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    function downloadCanvas(link, canvasId, filename) {
        link.href = document.getElementById(canvasId).toDataURL();
        link.download = filename;
    }

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

    function getWorkDays(month, year) {
        var yr = "20" + year;
        var days = daysInMonth(month, yr);
        var weekdays = 0;
        for (var i = 0; i < days; i++) {
            if (isWeekday(yr, month, i + 1)) weekdays++;
        }
        return weekdays;
    }

    function daysInMonth(month, year) {
        return 32 - new Date(year, month, 32).getDate();
    }
    function isWeekday(year, month, day) {
        var day = new Date(year, month, day).getDay();
        return day != 0 && day != 6;
    }

    function getRoundNumber(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    function getIndex(month) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames.indexOf(month);
    }

    function getMonthAndYear(month, year) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[month] + "-" + String(year).substr(-2);
    }

    function getRandomColor(index) {
        var Colors = [
            "#7ebab5", "#bc9f8a", "#003763",
            "#97ca53", "#bcb88a", "#ff8c00",
            "#7e83b9", "#cac253", "#008b8b",
            "#b3b3b3", "#008000", "#e9967a",
            "#637d96", "#006400", "#bdb76b",
            "#556b2f", ,
            "#7fffd4",
            "#ffd700",
            "#cce0ff",
            "#ffebcc",
            "#ca5379",
            "#d1ccff",
            "#967c64",
            "#b4bc8a",
            "#f7ccff",
            "#8aa7bc",
            "#deb887",
            "#87adde",
            "#405030",
            "#312b21",
            "#212121",
            "#ffebcd",
            "#191e28",
            "#caa553",
            "#1a2824",
            "#1a2824",
            "#53caa5",
            "#c0c0c0",


        ];

        return Colors[index];

    }

})();
