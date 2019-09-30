
(function () {
    'use strict';

    angular.module('pmoApp').controller('utilisationCtrl', Controller);

    Controller.$inject = ['$scope', '$rootScope','$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'utilisationService',
        'resourceService', 'regionService',
        'allocationService', 'leaveService',  'availableDaysService',
        'monthlyHeaderListService', 'locationService','holidayListService', '$filter'];

    function Controller($scope, $rootScope, $window, DTOptionsBuilder, DTColumnBuilder, $compile, utilisationService,
        resourceService, regionService,
        allocationService, leaveService,  availableDaysService,
        monthlyHeaderListService, locationService,holidayListService ,$filter) {


        var app = $scope;

        $scope.region = $window.localStorage.getItem("region");

       // $scope.utilisationData = [];
       // $scope.originalData = [];
        //getuUilisationData(utilisationService,$scope);

        $scope.resourceList = [];
        getResourceData(resourceService, $scope);

       // $scope.roleList = [];
       // getRoleData(roleService, $scope);

        //$scope.locationList = [];
       // getLocationData(locationService, $scope);

       // $scope.skillDataList = [];
       // getSkillData(skillSetService, $scope);

        //$scope.regionList = [];
       // getRegionData(regionService, $scope);


       // $scope.resourceTypeList = [];
       // getResourceTypeData(resourceTypeService, $scope);

        $scope.ShowSpinnerStatus = true;

       // $scope.projectList = [];
        //getProjectData(projectService, $scope);

        $scope.headingList = [];
       // prepareTableHeading($scope, monthlyHeaderListService);

        $scope.clearFields = function () {
            $scope.utilisationDTO = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
            getGraphData($scope, allocationService, leaveService, availableDaysService, monthlyHeaderListService);
        };


        $scope.dateChange = function () {

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
                    $scope.headingList = monthCol;
                    getGraphData($scope, allocationService, leaveService,  availableDaysService,holidayListService, monthlyHeaderListService);
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



        $scope.getUtilisation = function (utilisationDTO) {

            $scope.IsSubmit = true;
            // //if ($scope.utilisationForm.$valid) {
            //       utilisationService.getuUtilisation(utilisationDTO).then(function(res) {
            //     // if (res.data == "created") {
            //         $scope.utilisationData = res.data;
            //        //getUilisationData(utilisationService,$scope);
            //       // $scope.utilisationDTO = {};
            //         app.loading =false;
            //         app.successMsg = "Data fetched successfully";
            //         app.errorMsg = false;

            //     }).catch(function(err) {
            //      console.log(err);
            //      });
            // 
            //   }else
            //   {
            //          app.loading =false;
            //         app.successMsg = false;
            //          app.errorMsg = "Please Enter Required value";
            //           app.errorClass = "error"
            //   }

            console.log(utilisationDTO);
            //  //if (false) {
            var emptyObject = angular.equals({}, utilisationDTO);
            if (typeof utilisationDTO == "undefined" || emptyObject) {
                getGraphData($scope, allocationService, leaveService, availableDaysService, monthlyHeaderListService);
            } else {
                var utilisationTimeFilteredDataList = [];
                utilisationTimeFilteredDataList = $scope.originalData;
                if (utilisationDTO.resource) {
                    utilisationTimeFilteredDataList = $filter('filter')(utilisationTimeFilteredDataList, { 'name': utilisationDTO.resource });
                    console.log(utilisationTimeFilteredDataList);
                }
                if (utilisationDTO.resourceType) {
                    utilisationTimeFilteredDataList = $filter('filter')(utilisationTimeFilteredDataList, { 'resourcetype': utilisationDTO.resourceType });
                    console.log(utilisationTimeFilteredDataList);
                }
                if (utilisationDTO.region) {
                    utilisationTimeFilteredDataList = $filter('filter')(utilisationTimeFilteredDataList, { 'region': utilisationDTO.region });
                    console.log(utilisationTimeFilteredDataList);
                }
                if (utilisationDTO.skillname) {
                    utilisationTimeFilteredDataList = $filter('filter')(utilisationTimeFilteredDataList, { 'skill': utilisationDTO.skillname });
                    console.log(idleTimeFilteredDataList);
                }
                if (utilisationDTO.region) {
                    utilisationTimeFilteredDataList = $filter('filter')(utilisationTimeFilteredDataList, { 'location': utilisationDTO.locationname });
                    console.log(utilisationTimeFilteredDataList);
                }
                $scope.utilisationData = utilisationTimeFilteredDataList;
            }


        };

        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons', ['copy', 'print', 'pdf', 'excel']);
        //=============================================================//



        //getGraphData($scope, allocationService, leaveService,  availableDaysService, monthlyHeaderListService);

        $scope.prepareUtilisationData = function (availableDaysService, monthlyHeaderListService) {

            var list = availableDaysService.getData($scope.startDate, $scope.endDate);
            //console.log("List====");
            console.log(list);
            var resourceUtilisationArray = [];
            for (var i = 0; i < list.length; i++) {

                for (var l = 0; l < list[i].maps.length; l++) {
                    var resourceObj = new Resource();
                    resourceObj.name = list[i].resource;
                    resourceObj.kinid = list[i].kinid;
                    resourceObj.location = list[i].location;
                    resourceObj.region = list[i].region;
                    resourceObj.resourcetype = list[i].maps[l].type;
                    resourceObj.skill = list[i].skill;
                    resourceObj.status = list[i].status;
                    var monthlyUtilisationArray = [];
                    for (var j = 0; j < list[i].maps[l].allocation.length; j++) {
                        var allocationOBJ = list[i].maps[l].allocation[j];
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

                    resourceObj.utilisationArray = monthlyUtilisationArray;
                    resourceUtilisationArray.push(resourceObj);
                }

            }
            //console.log(resourceUtilisationArray);
            $scope.utilisationData = resourceUtilisationArray;
            $scope.originalData = resourceUtilisationArray;
            $scope.ShowSpinnerStatus = false;
            var spinner = document.getElementById("spinner");
            if (spinner.style.display != "none") {
                spinner.style.display = "none";

            }
        }


    }




    //====================================================//

    function Resource(name, kinid, location, region, resourcetype, skill, status, utilisationArray) {
        this.name = name
        this.kinid = kinid;
        this.location = location;
        this.region = region;
        this.resourcetype = resourcetype;
        this.skill = skill;
        this.status = status;
        this.utilisationArray = utilisationArray;
    }



    function getGraphData($scope, allocationService, leaveService,  availableDaysService,holidayListService, monthlyHeaderListService) {
        var allocation = [];
        var resoruceM = [];
        var leave = [];
        allocationService.getAllAllocation().then(function (allocation) {
            leaveService.getLeave().then(function (leave) {
               // resourceMappingService.getMappedResources($scope.region).then(function (res) {
                    //resoruceM = res.data;
                   // availableDaysService.intialize(allocation, resoruceM, leave);
                   // $scope.prepareUtilisationData(availableDaysService, monthlyHeaderListService);
                //}).catch(function (err) {
                   // console.log(err);
               // });
               var strDt = $scope.startDate.split("/");
               var endDt = $scope.endDate.split("/");
               holidayListService.getLocationHolidaysYearRange(strDt[1], endDt[1]).then(function (holidayData) {
                    availableDaysService.intialize(allocation.data, $scope.resourceList, leave.data, holidayData.data);
                    $scope.prepareUtilisationData(availableDaysService, monthlyHeaderListService);
               });

            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        });
        
    }

    //====================================================//


   /* function getuUilisationData(utilisationService, $scope) {
        utilisationService.getMappedResources().then(function (res) {
            $scope.utilisationData = res.data;
            
        }).catch(function (err) {
            console.log(err);
        });
    }*/

    function getResourceData(resourceService, $scope) {
        resourceService.getResources($scope.region).then(function (res) {
            $scope.resourceList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    /*function getRoleData(roleService, $scope) {
        roleService.getRole().then(function (res) {
            $scope.roleList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }*/



    function getRegionData(regionService, $scope) {
        regionService.getRegion().then(function (res) {
            $scope.regionList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }


    /*function getResourceTypeData(resourceTypeService, $scope) {
        resourceTypeService.getResourceType().then(function (res) {
            $scope.resourceTypeList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }*/

    /*function getProjectData(projectService, $scope) {
        projectService.getProject($scope.region).then(function (res) {
            $scope.projectList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }*/


   /* function prepareTableHeading($scope, monthlyHeaderListService) {
        $scope.headingList = monthlyHeaderListService.getHeaderList();
    }*/

   /* function getLocationData(locationService, $scope) {
        locationService.getLocation().then(function (res) {
            $scope.locationList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }*/

    /*function getSkillData(skillSetService, $scope) {
        skillSetService.getSkillSets().then(function (res) {
            $scope.skillDataList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }*/

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