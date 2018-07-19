(function () {

    'use strict';

    angular.module('pmoApp').controller('graphsController', Controller);

    Controller.$inject = ['$scope', '$rootScope', '$window','$filter', 'locationService', 'skillSetService', 'resourceMappingService', 'allocationService', 'leaveService', 'availableDaysService', 'monthlyHeaderListService', 'projectService'];
    // var barChartData;
    //var colors = ['#7394CB', '#E1974D', '#84BB5C', '#D35D60', '#6B4C9A', '#9066A7', '#AD6A58', '#CCC374', '#3869B1', '#DA7E30', '#3F9852', '#6B4C9A', '#922427', 'rgba(253, 102, 255, 0.2)', 'rgba(153, 202, 255, 0.2)'];
    //var chartColors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgba(253, 102, 255)', 'rgba(153, 202, 255)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgba(253, 102, 255)', 'rgba(153, 202, 255)'];
    //var color = Chart.helpers.color;
    function Controller($scope, $rootScope,$window, $filter, locationService, skillSetService, resourceMappingService, allocationService, leaveService, availableDaysService, monthlyHeaderListService, projectService) {

        var app = $scope;
        $scope.region = $window.localStorage.getItem("region");

        $rootScope.Title = "Reporting";
        $scope.LocationData = [];
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
                } else {
                    alert("Please select a valid date range.");
                    return;
                }
            }
            createGraph($scope, $filter, resourceMappingService, availableDaysService, monthlyHeaderListService, allocationService, projectService, skillSetService, leaveService);
        }

    }


    function createGraph($scope, $filter, resourceMappingService, availableDaysService, monthlyHeaderListService, allocationService, projectService, skillSetService, leaveService) {
        $scope.ShowSpinnerStatus = true;
        switch ($scope.graphid) {
            case "Resource Capacity":
                //  getMappedResourceData(resourceMappingService, $scope);
                break;
            case "Skillset Capacity":
                //  getMappedSkillData(resourceMappingService, $scope);
                break;
            case "Remaining Resource Capacity":
                //  getActualResourceCapacity(availableDaysService, monthlyHeaderListService, $scope);
                break;
            case "ProjectMDS":
                projectManDaysGraph($scope, $filter, allocationService, projectService);
                break;
            case "AvlCapcitySkill":
                avlCapcitySkillGraph($scope, $filter, allocationService, resourceMappingService, skillSetService, leaveService);
                break;
            case "DemandCapacity":
                demandGraph($scope, $filter, resourceMappingService, allocationService, leaveService);
                break;
            case "CapacityFYF":
                demandGraphFYF($scope, $filter, resourceMappingService, allocationService, leaveService);
                break;
            default:
                break;
        }

    }//End OF CreateGraph()


    function demandGraphFYF($scope, $filter, resourceMappingService, allocationService, leaveService) {


        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");

        resourceMappingService.getMappedResourcesByYear(strDt[1], endDt[1],$scope.region).then(function (mapping) {
            leaveService.getLeave().then(function (res) {
                $scope.leaveList = res.data;
                var monthCol = months($scope.startDate, $scope.endDate);
                allocationService.getAllAllocationByYear(strDt[1], endDt[1],$scope.region).then(function (allocation) {
                    drawDeamndAndCapcityGraphFYF($scope, $filter, mapping.data, monthCol, $scope.leaveList, allocation.data);
                });

            }).catch(function (err) {
                console.log(err);
            });

        }).catch(function (err) {
            console.log(err);
        });
    }


    function drawDeamndAndCapcityGraphFYF($scope, $filter, mappingData, monthCol, leaveList, allocationData) {


        $scope.GraphData = [];
        var stCapacity = new Array(monthCol.length);
        stCapacity.fill(0, 0, monthCol.length);

        var ftCapacity = new Array(monthCol.length);
        ftCapacity.fill(0, 0, monthCol.length);

        // Total ST Capacity (ST + Buffer - Vaction) , ST+Buffer = Total mapping value
        angular.forEach(mappingData, function (mapping) {
            var leaveFilter = $filter('filter')(leaveList, { resourcename: mapping.mappedResource.resourcename });

            if (mapping.resourceType === 'Sufficient') {

                angular.forEach(mapping.monthlyAvailableActualMandays, function (mapData, index) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = stCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            stCapacity[indx] = round((parseInt(value) + parseInt(mapData.value)), 1);
                        }
                    }
                });

                // it excludes the vacation based on the percentage of mapping

                angular.forEach(leaveFilter, function (leaves) {
                    angular.forEach(leaves.leavedaysinmonth, function (leave) {
                        if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)

                            var indx = monthCol.indexOf(leave.month);
                            var value = stCapacity[indx];
                            var percent = 0;

                            angular.forEach(mapping.taggToEuroclear, function (tagged) {
                                if (tagged.key === leave.month) percent = tagged.value;
                            });

                            if (!isNaN(leave.value)) {
                                var percentV = (leave.value * percent) / 100;
                                stCapacity[indx] = round((parseInt(value) - parseInt(percentV)), 1);
                                //console.log('ST' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
                            }
                        }
                    });
                });
            }

            if (mapping.resourceType === 'FlexTeam') {
                angular.forEach(mapping.monthlyAvailableActualMandays, function (mapData) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = ftCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            ftCapacity[indx] = round((parseInt(value) + parseInt(mapData.value)), 1);
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
                            var percent = 0;

                            angular.forEach(mapping.taggToEuroclear, function (tagged) {
                                if (tagged.key === leave.month) percent = tagged.value;
                            });

                            if (!isNaN(leave.value)) {
                                var percentV = (leave.value * percent) / 100;
                                ftCapacity[indx] = round((parseInt(value) - parseInt(percentV)), 1);
                                // console.log('FT ' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
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

        angular.forEach(allocationData, function (allocaitons) {

            angular.forEach(allocaitons.allocation, function (allocData) {

                if (allocaitons.project.startsWith("Production Support")) {
                    if (monthCol.indexOf(allocData.month) >= 0) {
                        var indx = monthCol.indexOf(allocData.month);
                        var value = productionDemand[indx];
                        if (!isNaN(allocData.value)) {
                            productionDemand[indx] = round((parseInt(value) + parseInt(allocData.value)), 1);
                        }
                    }
                } else if (allocaitons.project.startsWith("Maintainance")) {
                    if (monthCol.indexOf(allocData.month) >= 0) {
                        var indx = monthCol.indexOf(allocData.month);
                        var value = maintainceDemand[indx];
                        if (!isNaN(allocData.value)) {
                            maintainceDemand[indx] = round((parseInt(value) + parseInt(allocData.value)), 1);
                        }
                    }
                } else {
                    if (monthCol.indexOf(allocData.month) >= 0) {
                        var indx = monthCol.indexOf(allocData.month);
                        var value = projectDemand[indx];
                        if (!isNaN(allocData.value)) {
                            projectDemand[indx] = round((parseInt(value) + parseInt(allocData.value)), 1);
                        }
                    }

                }
            });
        });

        console.log(stFtCapacity);


        var chartData = {
            labels: monthCol,
            datasets: [{
                type: 'line',
                label: 'Total Capacity (ST + FT)',
                borderColor: "#660066",
                borderWidth: 2,
                fill: false,
                data: stFtCapacity

            }, {
                type: 'line',
                label: 'Dataset 2',
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
                data: [
                    200,
                    400,
                    500,
                    800,
                    850,
                    300,
                    1200
                ],

            }, {
                type: 'line',
                label: 'Dataset 3',
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
                data: [
                    100,
                    300,
                    600,
                    700,
                    300,
                    300,
                    100
                ],

            }, {
                type: 'line',
                label: 'Dataset 3',
                borderColor: 'blue',
                borderWidth: 2,
                borderDash: [10, 10],
                fill: false,
                data: [
                    300,
                    300,
                    300,
                    300,
                    300,
                    300,
                    300
                ],

            }, {
                type: 'bar',
                label: 'Total ST Capacity',
                backgroundColor: "#00bfff",
                data: stCapacity,

            }, {
                type: 'bar',
                label: 'Production Support Demand',
                backgroundColor: "#0040ff",
                data: productionDemand
            }, {
                type: 'bar',
                label: 'Maintaince Demand',
                backgroundColor: "#b30000",
                data: maintainceDemand,

            }, {
                type: 'bar',
                label: 'Project Demand',
                backgroundColor: "#739900",
                data: projectDemand
            }]

        };

        $scope.GraphData.push({ label: "Total ST Capacity", backgroundColor: "#00bfff", data: stCapacity });
        $scope.GraphData.push({ label: "Project Demand", backgroundColor: "#739900", data: projectDemand });
        $scope.GraphData.push({ label: "Maintaince Demand", backgroundColor: "#b30000", data: maintainceDemand });
        $scope.GraphData.push({ label: "Production Support Demand", backgroundColor: "#0040ff", data: productionDemand });
        $scope.GraphData.push({ label: "Total Capacity (ST + FT)", backgroundColor: "#660066", data: stFtCapacity });
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

    function demandGraph($scope, $filter, resourceMappingService, allocationService, leaveService) {
        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");

        resourceMappingService.getMappedResourcesByYear(strDt[1], endDt[1]).then(function (mapping) {
            leaveService.getLeave().then(function (res) {
                $scope.leaveList = res.data;
                var monthCol = months($scope.startDate, $scope.endDate);
                allocationService.getAllAllocationByYear(strDt[1], endDt[1],$scope.region).then(function (allocation) {
                    drawDeamndAndCapcityGraph($scope, $filter, mapping.data, monthCol, $scope.leaveList, allocation.data);
                });

            }).catch(function (err) {
                console.log(err);
            });

        }).catch(function (err) {
            console.log(err);
        });
    }

    function drawDeamndAndCapcityGraph($scope, $filter, mappingData, monthCol, leaveList, allocationData) {
        $scope.GraphData = [];
        var stCapacity = new Array(monthCol.length);
        stCapacity.fill(0, 0, monthCol.length);

        var ftCapacity = new Array(monthCol.length);
        ftCapacity.fill(0, 0, monthCol.length);

        // Total ST Capacity (ST + Buffer - Vaction) , ST+Buffer = Total mapping value
        angular.forEach(mappingData, function (mapping) {
            var leaveFilter = $filter('filter')(leaveList, { resourcename: mapping.mappedResource.resourcename });

            if (mapping.resourceType === 'Sufficient') {

                angular.forEach(mapping.monthlyAvailableActualMandays, function (mapData, index) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = stCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            stCapacity[indx] = round((parseInt(value) + parseInt(mapData.value)), 1);
                        }
                    }
                });

                // it excludes the vacation based on the percentage of mapping

                angular.forEach(leaveFilter, function (leaves) {
                    angular.forEach(leaves.leavedaysinmonth, function (leave) {
                        if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)

                            var indx = monthCol.indexOf(leave.month);
                            var value = stCapacity[indx];
                            var percent = 0;

                            angular.forEach(mapping.taggToEuroclear, function (tagged) {
                                if (tagged.key === leave.month) percent = tagged.value;
                            });

                            if (!isNaN(leave.value)) {
                                var percentV = (leave.value * percent) / 100;
                                stCapacity[indx] = round((parseInt(value) - parseInt(percentV)), 1);
                                //console.log('ST' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
                            }
                        }
                    });
                });
            }

            if (mapping.resourceType === 'FlexTeam') {
                angular.forEach(mapping.monthlyAvailableActualMandays, function (mapData) {
                    if (monthCol.indexOf(mapData.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(mapData.key);
                        var value = ftCapacity[indx];
                        if (!isNaN(mapData.value)) {
                            ftCapacity[indx] = round((parseInt(value) + parseInt(mapData.value)), 1);
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
                            var percent = 0;

                            angular.forEach(mapping.taggToEuroclear, function (tagged) {
                                if (tagged.key === leave.month) percent = tagged.value;
                            });

                            if (!isNaN(leave.value)) {
                                var percentV = (leave.value * percent) / 100;
                                ftCapacity[indx] = round((parseInt(value) - parseInt(percentV)), 1);
                                // console.log('FT ' + leave.month + '--' + leaves.resourcename + '--' + mapping.mappedResource.resourcename + '--' + percentV);
                            }
                        }
                    });
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

            angular.forEach(allocaitons.allocation, function (allocData) {
                var total = 0;
                if (allocaitons.project.startsWith("Production Support")) {
                    if (monthCol.indexOf(allocData.month) >= 0) {
                        var indx = monthCol.indexOf(allocData.month);
                        var value = productionDemand[indx];
                        if (!isNaN(allocData.value)) {
                            productionDemand[indx] = round((parseInt(value) + parseInt(allocData.value)), 1);
                        }
                    }
                } else if (allocaitons.project.startsWith("Maintenance")) {
                    if (monthCol.indexOf(allocData.month) >= 0) {
                        var indx = monthCol.indexOf(allocData.month);
                        var value = maintainceDemand[indx];
                        if (!isNaN(allocData.value)) {
                            maintainceDemand[indx] = round((parseInt(value) + parseInt(allocData.value)), 1);
                        }
                    }
                } else {
                    if (monthCol.indexOf(allocData.month) >= 0) {
                        var indx = monthCol.indexOf(allocData.month);
                        var value = projectDemand[indx];
                        if (!isNaN(allocData.value)) {
                            projectDemand[indx] = round((parseInt(value) + parseInt(allocData.value)), 1);
                        }
                    }

                }

            });
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
                backgroundColor: "#0040ff",
                yAxisID: "bar-y-axis",
                data: productionDemand
            }, {
                label: 'Maintaince Demand',
                backgroundColor: "#b30000",
                yAxisID: "bar-y-axis",
                data: maintainceDemand
            }, {
                label: 'Project Demand',
                backgroundColor: "#739900",
                yAxisID: "bar-y-axis",
                data: projectDemand
            }, {
                data: stFtCapacity,
                type: 'line',
                label: 'Total Capacity (ST+FT)',
                fill: false,
                backgroundColor: "#660066",
                borderColor: "#660066",
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
                backgroundColor: "#00bfff",
                borderColor: "#00bfff",
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

        $scope.GraphData.push({ label: "Total ST Capacity", backgroundColor: "#00bfff", data: stCapacity });
        $scope.GraphData.push({ label: "Project Demand", backgroundColor: "#739900", data: projectDemand });
        $scope.GraphData.push({ label: "Maintaince Demand", backgroundColor: "#b30000", data: maintainceDemand });
        $scope.GraphData.push({ label: "Production Support Demand", backgroundColor: "#0040ff", data: productionDemand });
        $scope.GraphData.push({ label: "Total Capacity (ST + FT)", backgroundColor: "#660066", data: stFtCapacity });
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
                    }],
                    yAxes: [{
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 1500
                        }
                    }, {
                        id: "bar-y-axis",
                        stacked: false,
                        display: false, //optional
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 100
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

    function projectManDaysGraph($scope, $filter, allocationService, projectService) {

        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");

        projectService.getProject($scope.region).then(function (project) {
            $scope.project = project.data;
            console.log(project.data);

            if ($scope.projectHTML === '') {

                angular.forEach($scope.project, function (item) {
                    $scope.projectHTML += '<option>' + item.projectname + '</option>';
                });

                $('#project-select').append($scope.projectHTML);
                $('#project-select').multiselect('rebuild');
            }


            allocationService.getAllAllocationByYear(strDt[1], endDt[1],$scope.region).then(function (allocation) {
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
                angular.forEach(alloc.allocation, function (data) {
                    if (monthCol.indexOf(data.month) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(data.month);
                        var value = monthWise[indx];
                        if (!isNaN(data.value))
                            monthWise[indx] = round((parseInt(value) + parseInt(data.value)), 1);
                        //monthWise[indx] = parseInt(value) + parseInt(data.value);
                    }
                });
            });

            $scope.GraphData.push({ label: projectname, backgroundColor: getRandomColor(index), data: monthWise });
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
                        text: $scope.region + ' Project Demand & Pipeline (MDs)'
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            maxBarThickness: 30
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: false
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


    function avlCapcitySkillGraph($scope, $filter, allocationService, resourceMappingService, skillSetService, leaveService) {

        var strDt = $scope.startDate.split("/");
        var endDt = $scope.endDate.split("/");

        skillSetService.getSkillSets().then(function (skill) {
            $scope.skillSetList = skill.data;
            resourceMappingService.getMappedResourcesByYear(strDt[1], endDt[1],$scope.region).then(function (mapping) {
                allocationService.getAllAllocationByYear(strDt[1], endDt[1], $scope.region).then(function (allocation) {
                    var monthCol = months($scope.startDate, $scope.endDate);

                    leaveService.getLeave().then(function (res) {
                        $scope.leaveList = res.data;
                        drawAvailCapacityGraph($scope, $filter, mapping.data, $scope.skillSetList, allocation.data, monthCol, $scope.leaveList);
                    }).catch(function (err) {
                        console.log(err);
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

    function drawAvailCapacityGraph($scope, $filter, mappingList, skillSetList, allocationList, monthCol, leaveList) {

        $scope.GraphData = [];
        if ($scope.skillSelect != 'ALL')
            skillSetList = $filter('filter')(skillSetList, { skillname: $scope.skillSelect });

        angular.forEach(skillSetList, function (skill, index) {
            var monthWise = new Array(monthCol.length);
            monthWise.fill(0, 0, monthWise.length);
            var resourceMappBySkill = [];

            for (var k = 0; k < mappingList.length; k++) {
                if (mappingList[k].mappedResource.skill === skill.skillname) {
                    resourceMappBySkill.push(mappingList[k]);
                }
            }

            angular.forEach(resourceMappBySkill, function (mappedRes) {
                angular.forEach(mappedRes.monthlyAvailableActualMandays, function (data) {
                    if (monthCol.indexOf(data.key) >= 0) { // check if months equal to the predefined month array(user selected)
                        var indx = monthCol.indexOf(data.key);
                        var value = monthWise[indx];
                        if (!isNaN(data.value))
                            monthWise[indx] = round((parseInt(value) + parseInt(data.value)), 1);
                    }
                });

                // check for alloction ,and if it is there for that resource and skill then minus that value
                var allocationFilter = $filter('filter')(allocationList, { resource: mappedRes.mappedResource.resourcename });

                angular.forEach(allocationFilter, function (alloc) {
                    angular.forEach(alloc.allocation, function (data) {
                        if (monthCol.indexOf(data.month) >= 0) { // check if months equal to the predefined month array(user selected)
                            var indx = monthCol.indexOf(data.month);
                            var value = monthWise[indx];
                            if (!isNaN(data.value)) {
                                var value = parseInt(value) - parseInt(data.value);
                                monthWise[indx] = value;
                            }

                        }
                    });
                });

                //deduct the leave aswell for that resource

                var leaveFilter = $filter('filter')(leaveList, { resourcename: mappedRes.mappedResource.resourcename });
                angular.forEach(leaveFilter, function (leaves) {
                    angular.forEach(leaves.leavedaysinmonth, function (leave) {
                        if (monthCol.indexOf(leave.month) >= 0) { // check if months equal to the predefined month array(user selected)
                            var indx = monthCol.indexOf(leave.month);
                            var value = monthWise[indx];
                            if (!isNaN(leave.value)) {
                                var value = parseInt(value) - parseInt(leave.value);
                                monthWise[indx] = value;
                            }

                        }
                    });
                });
            });

            $scope.GraphData.push({ label: skill.skillname, backgroundColor: getRandomColor(index), data: monthWise });
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
                    text: $scope.region + ' Skillset Available Capacity (MDs)',
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{ stacked: true, min: 0, maxBarThickness: 40 }],
                    yAxes: [{ stacked: true, min: 0 }]

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
                    }],
                    yAxes: [{
                        stacked: true
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
                            labelString: $scope.chartxlabel
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: $scope.chartylabel,
                            barPercentage: 0.5
                        }
                    }]
                }
            }
        });
    }//Endf OF createStackedBarGraph($scope)


    function CreateCanvas(canvasId) {

        if (document.contains(document.getElementById("chartSubContainer"))) {
            document.getElementById("chartSubContainer").remove();
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

    function getRandomColor(index) {
        var Colors = [
            "#00ffff",
            "#000000",
            "#0000ff",
            "#a52a2a",
            "#00008b",
            "#008b8b",
            "#a9a9a9",
            "#006400",
            "#bdb76b",
            "#8b008b",
            "#556b2f",
            "#ff8c00",
            "#8b0000",
            "#e9967a",
            "#9400d3",
            "#ff00ff",
            "#ffd700",
            "#008000",
            "#4b0082",
            "#f0e68c",
            "#add8e6",
            "#e0ffff",
            "#90ee90",
            "#d3d3d3",
            "#ffb6c1",
            "#ffffe0",
            "#00ff00",
            "#ff00ff",
            "#800000",
            "#000080",
            "#808000",
            "#ffa500",
            "#ffc0cb",
            "#800080",
            "#800080",
            "#ff0000",
            "#c0c0c0",
            "#ffffff",
            "#ffff00"
        ];

        return Colors[index];

    }


    /*function getActualResourceCapacity(availableDaysService, monthlyHeaderListService, $scope) {
    var fromDate = "01-" + $scope.headingList[0];
    var toDate = "01-" + $scope.headingList[$scope.headingList.length - 1];
    var list = availableDaysService.getData(fromDate, toDate);
    createActualResourceUtilizationGraph(list, $scope, monthlyHeaderListService);
}*/

    /* function createActualResourceUtilizationGraph(list, $scope, monthlyHeaderListService) {
         var resources = [];
         $scope.barChartData = { datasets: [] };
         $scope.chartlabel = '';
         $scope.chartxlabel = 'Months';
         $scope.chartylabel = 'Percentage';
         for (var i = 0; i < list.length; i++) {
             var resource = {
                 name: "",
                 kindid: "",
                 location: "",
                 region: "",
                 resourcetype: "",
                 skill: "",
                 status: "",
                 utilisationArray: []
             };
             resource.name = list[i].resource;
             resource.kindid = list[i].kindid;
             resource.location = list[i].location;
             resource.region = list[i].region;
             resource.resourcetype = list[i].resourcetype;
             resource.skill = list[i].skill;
             resource.status = list[i].status;
             var monthlyUtilisationArray = [];
             for (var j = 0; j < list[i].maps[0].length; j++) {
                 var allocationOBJ = list[i].maps[0][j];
                 var sum = 0;
                 var actualAvailablemandays = 0;
                 var totalAllocation = 0;
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
                 totalAllocation = sum;
 
                 if (parseFloat(allocationOBJ.buffertime) > 0) {
                     totalAllocation = totalAllocation + parseFloat(allocationOBJ.buffertime);
                 }
 
                 sum = sum + parseFloat(allocationOBJ.buffertime);
 
                 actualAvailablemandays = sum;
 
                 var utilisation = 0;
                 if (sum == 0.0) {
                     utilisation = 0;
                 } else if (allocationOBJ.buffertime == 0.0 && sum != 0.0) {
                     utilisation = 100;
                 } else {
                     utilisation = monthlyHeaderListService.getRoundNumber((totalAllocation / actualAvailablemandays) * 100, 1);
                 }
 
                 var monthlyUtilisationObject = {
                     "key": allocationOBJ.month,
                     "value": utilisation
                 };
 
 
                 monthlyUtilisationArray.push(monthlyUtilisationObject);
 
             }
             resource.utilisationArray.push(monthlyUtilisationArray);
             resources.push(resource);
 
         }
 
         var fillLabels = true;
         $scope.chartlabels = [];
 
         for (var i = 0; i < resources.length; i++) {
             if ($scope.locationId === "All" || resources[i].location === $scope.locationId) {
 
                 angular.forEach(resources[i].utilisationArray, function (value, key) {
                     var data = [];
 
                     for (var j = 0; j < value.length; j++) {
                         if (fillLabels) {
                             $scope.chartlabels.push(value[j].key);
                             console.log(value[j].key);
                         }
                         data.push(value[j].value);
                     }
                     fillLabels = false;
                     var dataset =
                         {
                             label: resources[i].name,
                             data: data,
                             backgroundColor: color(chartColors[i]).alpha(0.5).rgbString(),
                             borderColor: chartColors[i],
                             borderWidth: 1
                         }
                     $scope.barChartData.datasets.push(dataset);
                     $scope.barChartData["labels"] = $scope.chartlabels;
                     $scope.chartlabel = $scope.locationId + " - Recource Utilization";
                 });
 
             }
 
         }
         createBarGraph($scope);
     }*/

    /* function getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService) {
         var allocation = [];
         var resoruceM = [];
         var leave = [];
         allocationService.getAllAllocation().then(function (res) {
             allocation = res.data;
             leaveService.getLeave().then(function (res) {
                 leave = res.data;
                 resourceMappingService.getMappedResources().then(function (res) {
                     resoruceM = res.data;
                     availableDaysService.intialize(allocation, resoruceM, leave);
                     getActualResourceCapacity(availableDaysService, monthlyHeaderListService, $scope);
                 }).catch(function (err) {
                     console.log(err);
                 });
             }).catch(function (err) {
                 console.log(err);
             });
         }).catch(function (err) {
             console.log(err);
         });
     }*/

    /* function prepareTableHeading($scope, monthlyHeaderListService) {
         $scope.headingList = monthlyHeaderListService.getHeaderList();
     }*/

    /* function getLocationData(locationService, $scope) {
         locationService.getLocation().then(function (res) {
             $scope.LocationData = res.data;
         }).catch(function (err) {
             console.log(err);
         });
     }*/


    /* function getMappedResourceData(resourceMappingService, $scope) {
        resourceMappingService.getMappedResources().then(function (res) {
            $scope.chartlabels = [];
            $scope.barChartData = {
                labels: "",
                datasets: []
            };
            var data = [];
            $scope.MappedResourceData = res.data;
            //console.log(res.data);
            var i = 0;
            var fillLabels = true;
            angular.forEach(res.data, function (value, key) {
                if ($scope.locationId === "All" || value.location === $scope.locationId) {
                    data = [];
                    angular.forEach(value.monthlyAvailableActualMandays, function (value, key) {
                        if (fillLabels) {
                            $scope.chartlabels.push(value.key);
                        }
                        data.push(value.value);
                    })
                    var dataset =
                        {
                            label: value.mappedResource.resourcename,
                            data: data,
                            backgroundColor: color(chartColors[i]).alpha(0.5).rgbString(),
                            borderColor: chartColors[i],
                            borderWidth: 1
                        }
                    i++;
                    $scope.barChartData.datasets.push(dataset);
                    fillLabels = false;
                    $scope.barChartData["labels"] = $scope.chartlabels;
                }
            })
            createStackedBarGraph($scope);
        }).catch(function (err) {
            console.log(err);
        });
    }*/


    /*function getMappedSkillData(resourceMappingService, $scope) {
        resourceMappingService.getMappedResources().then(function (res) {
            $scope.chartlabels = [];
            $scope.barChartData = {
                labels: "",
                datasets: []
            };
            var data = [];
            $scope.MappedResourceData = res.data;
            var i = 0;
            var fillLabels = true;
            var skillsets = [];
            var currentSkill = "";
            var datasets = [];
            var finalData = [];
            angular.forEach(res.data, function (value, key) {
                if (skillsets.indexOf(value.skill) < 0) skillsets.push(value.skill);
                if ($scope.locationId === "All" || value.location === $scope.locationId) {
                    data = [];
                    angular.forEach(value.monthlyAvailableActualMandays, function (value, key) {
                        if (fillLabels) {
                            $scope.chartlabels.push(value.key);
                        }
                        data.push(value.value);
                    })
                    var dataset =
                        {
                            label: value.skill,
                            data: data,
                            backgroundColor: color(chartColors[i]).alpha(0.5).rgbString(),
                            borderColor: chartColors[i],
                            borderWidth: 1
                        }

                    i++;

                    datasets.push(dataset);
                    fillLabels = false;
                    $scope.barChartData["labels"] = $scope.chartlabels;

                }
            })
            var newData = [];
            var newDataSets = [];
            var skillsTotal = [];
            for (var i = 0; i < skillsets.length; i++) {
                skillsTotal[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (var k = 0; k < datasets.length; k++) {
                    if (datasets[k].label == skillsets[i]) {
                        skillsTotal[i] = skillsTotal[i].map(function (num, idx) {
                            return num + datasets[k].data[idx];
                        });
                    }
                }
                var dataset = {
                    label: skillsets[i],
                    data: skillsTotal[i],
                    backgroundColor: color(chartColors[i]).alpha(0.5).rgbString(),
                    borderColor: chartColors[i],
                    borderWidth: 1
                }
                $scope.barChartData.datasets.push(dataset);
            }
            createStackedBarGraph($scope);

        }).catch(function (err) {
            console.log(err);
        });
    }*/


})();