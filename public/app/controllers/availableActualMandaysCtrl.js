
(function () {
    'use strict';

    angular.module('pmoApp').controller('availableActualMandaysCtrl', Controller);

    Controller.$inject = ['$filter', '$scope', '$rootScope', '$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'availableActualMandaysService',
        'resourceService', 'roleService', 'regionService', 'projectService', 'resourceTypeService', 'holidayListService',
        'locationService', 'monthlyHeaderListService', 'skillSetService'];

    function Controller($filter, $scope, $rootScope, $window, DTOptionsBuilder, DTColumnBuilder, $compile, availableActualMandaysService,
        resourceService, roleService, regionService, projectService, resourceTypeService, holidayListService,
        locationService, monthlyHeaderListService, skillSetService) {


        var app = $scope;

        $scope.region = $window.localStorage.getItem("region");

        $scope.mappedResourceList = [];
      
      
      //  getMappedResourceData(resourceMappingService, $scope);

        $scope.locationList = [];
        getLocationData(locationService, $scope);

        $scope.resourceList = [];
        getResourceData(resourceService, $scope);

        $scope.roleList = [];
        getRoleData(roleService, $scope);



        $scope.regionList = [];
        getRegionData(regionService, $scope);


        $scope.resourceTypeList = [];
        getResourceTypeData(resourceTypeService, $scope);


        $scope.projectList = [];
        getProjectData(projectService, $scope);


        $scope.headingList = [];
        prepareTableHeading($scope, monthlyHeaderListService);

        $scope.skillDataList = [];
        getSkillData(skillSetService, $scope);

        $scope.ShowSpinnerStatus = true;

        $scope.clearFields = function () {
            $scope.availableActualMandaysDTO = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
         
         //   getMappedResourceData(resourceMappingService, $scope);

        };

        $scope.getAvailableActualMandays = function (availableActualMandaysDTO) {

            $scope.IsSubmit = true;
            availableActualMandaysService.search(availableActualMandaysDTO).then(function (res) {
                $scope.mappedResourceList = res.data;
                app.loading = false;
                app.successMsg = "Data feteched successfully";
                app.errorMsg = false;


            }).catch(function (err) {
                console.log(err);
            });

        };


        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons', ['copy', 'print', 'pdf', 'excel']);
        //=============================================================//



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


   /* function getMappedResourceData(resourceMappingService, $scope) {
        resourceMappingService.getMappedResources($scope.region).then(function (res) {
            $scope.mappedResourceList = res.data;
            $scope.ShowSpinnerStatus = false;
            var spinner = document.getElementById("spinner");
            if (spinner.style.display != "none") {
                spinner.style.display = "none";

            }
            //console.log(res.data);
        }).catch(function (err) {
            console.log(err);
        });

    }*/

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


    function prepareTableHeading($scope, monthlyHeaderListService) {
        $scope.headingList = monthlyHeaderListService.getHeaderList();

    }



})();