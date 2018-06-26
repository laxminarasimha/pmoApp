(function () {

    'use strict';

    angular.module('pmoApp').controller('graphsController', Controller);

    Controller.$inject = ['$scope', '$rootScope', '$filter', 'locationService', 'resourceMappingService', 'allocationService', 'leaveService', 'availableDaysService', 'monthlyHeaderListService', 'projectService'];
    var barChartData;
    var colors = ['#7394CB', '#E1974D', '#84BB5C', '#D35D60', '#6B4C9A', '#9066A7', '#AD6A58', '#CCC374', '#3869B1', '#DA7E30', '#3F9852', '#6B4C9A', '#922427', 'rgba(253, 102, 255, 0.2)', 'rgba(153, 202, 255, 0.2)'];
    var chartColors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgba(253, 102, 255)', 'rgba(153, 202, 255)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgba(253, 102, 255)', 'rgba(153, 202, 255)'];
    var color = Chart.helpers.color;
    function Controller($scope, $rootScope, $filter, locationService, resourceMappingService, allocationService, leaveService, availableDaysService, monthlyHeaderListService, projectService) {
        var app = $scope;
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
        $scope.startDate = '';
        $scope.endDate = '';
        $scope.GraphData = [];

        //getLocationData(locationService, $scope);
        // getMappedResourceData(resourceMappingService, $scope);

        //$scope.headingList = [];
        //prepareTableHeading($scope, monthlyHeaderListService);

        // $scope.countrychange = function () {
        //     //getMappedResourceData(resourceMappingService,$scope);
        //     createGraph($scope, resourceMappingService, availableDaysService, monthlyHeaderListService, allocationService,projectService);
        // }
        $scope.graphidchange = function () {
            createGraph($scope, $filter, resourceMappingService, availableDaysService, monthlyHeaderListService, allocationService, projectService);
        }



        //getGraphData($scope,allocationService,leaveService,resourceMappingService,availableDaysService,monthlyHeaderListService);

        //getActualResourceCapacity(availableDaysService,monthlyHeaderListService);

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

    function createGraph($scope, $filter, resourceMappingService, availableDaysService, monthlyHeaderListService, allocationService, projectService) {
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
            default:
                break;
        }

    }//End OF CreateGraph()


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

    function projectManDaysGraph($scope, $filter, allocationService, projectService) {


        if ($scope.startDate === '' || $scope.endDate === '' || $scope.startDate === 'undefined' || $scope.endDate === 'undefined') {
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
        console.log('$scope.projectSelect ' + $scope.projectSelect);

        projectService.getProject().then(function (project) {

            $scope.project = project.data;
            allocationService.getAllAllocationByYear(strDt[1], endDt[1], $scope.projectSelect).then(function (allocation) {
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

        if ($scope.projectSelect != 'ALL')
            projectList = $filter('filter')(projectList, { projectname: $scope.projectSelect });


        angular.forEach(projectList, function (project, index) {
            var monthWise = new Array(monthCol.length);
            monthWise.fill(0, 0, monthWise.length);

            var filterAllocation = $filter('filter')(allocationList, { project: project.projectname });

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

            $scope.GraphData.push({ label: project.projectname, backgroundColor: getRandomColor(index), data: monthWise });
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
                        text: 'Project Demand & Pipeline (MDs)'
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            fontColor: "#000080",
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: false
                            }
                        }]
                    },
                    legendCallback: function (chart) {
                        var text = [];
                        text.push('Hello Legend');
                        return text.join("");
                    }
                }
            });

        console.log($scope.GraphData);

        // $("#Testgraph").html(chart.generateLegend());
        $("#graphDiv").show();

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
        chartSubContainer.style.width = '1200px';
        chartSubContainer.style.height = '600px';

        var container = document.getElementById('ChartContainer');
        container.appendChild(chartSubContainer);
        chartSubContainer.appendChild(canvas);
        var ctx = canvas.getContext('2d');



        document.getElementById('download').addEventListener('click', function () {
            downloadCanvas(this, 'TotalManDaysGraph', 'TotalManDaysGraph.png');
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

})();