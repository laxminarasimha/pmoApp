
(function () {
    'use strict';

    angular.module('pmoApp').controller('idleTimeCtrl', Controller);

    Controller.$inject = ['$scope', '$rootScope', '$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'idleTimeService',
        'resourceService', 'roleService', 'regionService', 'projectService', 'resourceTypeService',
        'allocationService', 'leaveService', 'availableDaysService',
        'monthlyHeaderListService', 'locationService', 'skillSetService', '$filter'];

    function Controller($scope, $rootScope, $window, DTOptionsBuilder, DTColumnBuilder, $compile, idleTimeService,
        resourceService, roleService, regionService, projectService, resourceTypeService,
        allocationService, leaveService,  availableDaysService,
        monthlyHeaderListService, locationService, skillSetService, $filter) {


        var app = $scope;

        $scope.region = $window.localStorage.getItem("region");


        console.log("Idle Time Region scope:" + $scope.region);
        console.log("Idle Time Region rootScope:" + $rootScope.region);

        $scope.idleTimeData = [];
        $scope.originalData = [];
        //getIdleTimeData(idleTimeService,$scope);

        $scope.locationList = [];
        getLocationData(locationService, $scope);

        $scope.skillDataList = [];
        getSkillData(skillSetService, $scope);

        $scope.resourceList = [];
        getResourceData(resourceService, $scope);

        $scope.roleList = [];
        getRoleData(roleService, $scope);

        $scope.ShowSpinnerStatus = true;

        $scope.regionList = [];
        getRegionData(regionService, $scope);


        $scope.resourceTypeList = [];
        getResourceTypeData(resourceTypeService, $scope);


        $scope.projectList = [];
        getProjectData(projectService, $scope);

        $scope.headingList = [];
        prepareTableHeading($scope, monthlyHeaderListService);

        $scope.ShowSpinnerStatus = true;

        $scope.clearFields = function () {
            $scope.idleTimeDTO = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
            //getIdleTimeData(idleTimeService,$scope);
            getGraphData($scope, allocationService, leaveService, availableDaysService, monthlyHeaderListService);
        }

        $scope.getIdleTimes = function (idleTimeDTO) {
            $scope.IsSubmit = true;
            console.log(idleTimeDTO);

            //if (false) {
            var emptyObject = angular.equals({}, idleTimeDTO);
            console.log(emptyObject);
            if (typeof idleTimeDTO == "undefined" || emptyObject) {
                getGraphData($scope, allocationService, leaveService, availableDaysService, monthlyHeaderListService);
            } else {
                var idleTimeFilteredDataList = [];
                idleTimeFilteredDataList = $scope.originalData;
                var resource = idleTimeDTO.resource.trim();

                if (idleTimeDTO.resource) {
                    console.log(idleTimeFilteredDataList);
                    idleTimeFilteredDataList = $filter('filter')(idleTimeFilteredDataList, { name: resource });
                    console.log(idleTimeFilteredDataList);
                }
                if (idleTimeDTO.resourceType) {
                    idleTimeFilteredDataList = $filter('filter')(idleTimeFilteredDataList, { 'resourcetype': idleTimeDTO.resourceType });
                    console.log(idleTimeFilteredDataList);
                }
                if (idleTimeDTO.region) {
                    idleTimeFilteredDataList = $filter('filter')(idleTimeFilteredDataList, { 'region': idleTimeDTO.region });
                    //console.log(idleTimeFilteredDataList);
                }
                if (idleTimeDTO.skillname) {
                    idleTimeFilteredDataList = $filter('filter')(idleTimeFilteredDataList, { 'skill': idleTimeDTO.skillname });
                    //console.log(idleTimeFilteredDataList);
                }
                if (idleTimeDTO.region) {
                    idleTimeFilteredDataList = $filter('filter')(idleTimeFilteredDataList, { 'location': idleTimeDTO.locationname });
                    //console.log(idleTimeFilteredDataList);
                }
                $scope.idleTimeData = idleTimeFilteredDataList;
            }


            //}else
            // {
            //      app.loading =false;
            //    app.successMsg = false;
            //  app.errorMsg = "Please Enter Required value";
            //app.errorClass = "error"
            //   }

        }


        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons', ['copy', 'print', 'pdf', 'excel']);
        //=============================================================//

        getGraphData($scope, allocationService, leaveService, availableDaysService, monthlyHeaderListService);

        $scope.prepareIdleTimeData = function ($scope, availableDaysService, monthlyHeaderListService) {

            var fromDate = new Date();
            var toDate = new Date().setMonth(fromDate.getMonth() + 11);

            var list = availableDaysService.getData(fromDate, toDate);
            //console.log("List====");
            // console.log(list);
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
                            //console.log("idleTime:"+ idleTime);
                        }

                        var monthlyIdleTimeObject = {
                            "key": allocationOBJ.month,
                            "value": idleTime
                        };


                        monthlyIdleTimeArray.push(monthlyIdleTimeObject);
                    }
                    resourceObj.idleTimeArray = monthlyIdleTimeArray;
                    //console.log(resourceObj.idleTimeArray);
                    resourceIdleTimeArray.push(resourceObj);

                }


            }
            //console.log(resourceIdleTimeArray);
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



    function getGraphData($scope, allocationService, leaveService,  availableDaysService, monthlyHeaderListService) {
        var allocation = [];
        var resoruceM = [];
        var leave = [];
        allocationService.getAllAllocation().then(function (res) {
            allocation = res.data;
            leaveService.getLeave().then(function (res) {
                leave = res.data;
               // resourceMappingService.getMappedResources($scope.region).then(function (res) {
                    resoruceM = res.data;
                   // availableDaysService.intialize(allocation, resoruceM, leave);
                    $scope.prepareIdleTimeData($scope, availableDaysService, monthlyHeaderListService);
               // }).catch(function (err) {
                   // console.log(err);
               // });
            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        });
    }

    //====================================================//




    function getIdleTimeData(idleTimeService, $scope) {
        idleTimeService.getMappedResources().then(function (res) {
            $scope.idleTimeData = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getResourceData(resourceService, $scope) {
        resourceService.getResources($scope.region).then(function (res) {
            $scope.resourceList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getRoleData(roleService, $scope) {
        roleService.getRole().then(function (res) {
            $scope.roleList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }



    function getRegionData(regionService, $scope) {
        regionService.getRegion().then(function (res) {
            $scope.regionList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }


    function getResourceTypeData(resourceTypeService, $scope) {
        resourceTypeService.getResourceType().then(function (res) {
            $scope.resourceTypeList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getProjectData(projectService, $scope) {
        projectService.getProject($scope.region).then(function (res) {
            $scope.projectList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function prepareTableHeading($scope, monthlyHeaderListService) {
        $scope.headingList = monthlyHeaderListService.getHeaderList();
    }


    function getLocationData(locationService, $scope) {
        locationService.getLocation().then(function (res) {
            $scope.locationList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getSkillData(skillSetService, $scope) {
        skillSetService.getSkillSets().then(function (res) {
            $scope.skillDataList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

})();