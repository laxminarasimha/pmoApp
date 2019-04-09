(function () {

    var app = angular.module('pmoApp');

    app.controller('createAllocationCtrl', Controller);

    app.filter('projectfilter', function () {
        return function (collection, keyname) {
            var output = [];
            angular.forEach(collection, function (item) {
                if (item.projectname != keyname) {
                    output.push(item);
                }
            });
            return output;
        };
    });

    function eachMonthAllocaiton(source, target) {

        function Object(month, value) {  // new object create for each month
            this.month = month;
            this.value = value;
        }

        var tempAlloc = 0;
        var newAlloc = [];
        angular.forEach(source, function (month) {
            tempAlloc = 0;
            angular.forEach(target, function (oldMonth) {
                if (oldMonth.month === month) {
                    tempAlloc = oldMonth.value;
                    return;
                }

            });
            newAlloc.push(new Object(month, tempAlloc));

        });

        return newAlloc;
    };

    Controller.$inject = ['$scope', '$rootScope', '$window', 'projectService', 'ecrService', 'resourceMappingService', 'allocationService', 'resourceTypeService', '$filter', 'regionService'];

    function Controller($scope, $rootScope, $window, projectService, ecrService, resourceMappingService, allocationService, resourceTypeService, $filter, regionService) {

        $scope.names = [{ 'drname': 'Dr.Test1' }, { 'drname': 'Dr.Test2' }, { 'drname': 'Dr.Test3' }];
        $scope.detailDiv = true;
        $scope.resource = [];
        $scope.resourceWiseAllocaiton = [];
        $scope.resourceTypeList = [];
        $scope.startDate;
        $scope.endDate;
        $scope.months = [];
        $scope.mappedResourceData = [];
        $scope.successMsg = "";
        $scope.errorMsg = "";
        $scope.hidden = "none";
        $scope.newData = false;
        $scope.errvalue = false;
        $scope.regionData = [];
       // $scope.save=false;
       // $scope.vishnu="none";
        $scope.region = $window.localStorage.getItem("region");
        $scope.regionname = $window.localStorage.getItem("region");

       // console.log("region from window" + $scope.region);

        function allocObject(object) {
            var month;
            var allocation;
            var date;
            return {
                month: object.month,
                value: object.value,
            }
        };

        // getDisabledData();
        getMappedResourceData(resourceMappingService, $scope);
        getProjectData(projectService, $scope);
        getResourceTypeData(resourceTypeService, $scope);
        getEcrData(ecrService, $scope);
    


        if ($scope.region != "All") {
            $('oregion').val($scope.region);
            getRegionForName(regionService, $scope);

        } else {
            getRegion(regionService, $scope);
        }



        $scope.createAllocation = function () {
          //  $scope.vishnu="vishnu";
            if ($scope.resource == null || $scope.resource.length <= 0) {
                $scope.errorMsg = "Please select a resource."
                return;
            }

            if ($scope.startDate == null || $scope.endDate == null) {
                $scope.errorMsg = "Please select a valid date range."
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
                    $scope.errorMsg ="";
                    app.errorMsg = false;
                } else {
                    $scope.errorMsg = "Please select a valid date range."
                    return;
                }
            }

            var monthCol = months($scope.startDate, $scope.endDate);
            angular.forEach(monthCol, function (label) {
                $scope.monthWiseAllocation = {
                    month: label,  // this is allocation month name
                    value: 0,
                }
                $scope.months.push($scope.monthWiseAllocation);
            });

            var vRegion = '';
            angular.forEach($scope.mappedResourceData, function (mapped) {
                if (mapped.mappedResource.resourcename === $scope.resource) {
                    vRegion = mapped.mappedResource.region;
                }

            });



            angular.forEach($scope.resource, function (res) {

                $scope.rowWiseAllocation = {
                    resource: res,
                    project: $scope.projselect,

                    ecr: $scope.ecrselect,
                    resourcetype: $scope.resourcetype,
                    //region: $rootScope.region,
                    region: $scope.region,
                    //startdate: $scope.startDate,
                    //enddate: $scope.endDate,
                    allocation: [],
                    rowSelect: true
                };

                angular.forEach($scope.months, function (item) {
                    var obj = new allocObject(item);
                    $scope.rowWiseAllocation.allocation.push(obj);
                });

                $scope.resourceWiseAllocaiton.push($scope.rowWiseAllocation);

            });


            $scope.resource = [];
            $scope.detailDiv = false;
            $scope.hidden = "";
            $scope.months = [];
            $scope.monthCol = "";
            // $('#projectBtn').attr('disabled', true);

        }

        $scope.saveAllocation = function () {

           // console.log($scope.resourceWiseAllocaiton);
            $scope.errvalue = false;
            angular.forEach($scope.resourceWiseAllocaiton, function (it) {

                // var allocationYearWise = splitAllocationByYear($scope.resourceWiseAllocaiton, $scope.startDate, $scope.endDate);
                angular.forEach($scope.resourceWiseAllocaiton, function (item) {
                    // if (item.rowSelect) {// if row delete in screen,then it should not save
                    if (item.project === undefined || item.resourcetype === undefined || item.project === undefined) {
                        $scope.errorMsg = "Please enter valid data for all the input field.";
                        $scope.errvalue = true;
                        return;
                    }

                });

            });

            if ($scope.errvalue === false) {
                $scope.clearMessages();
                var allocationYearWise = splitAllocationByYear($scope.resourceWiseAllocaiton, $scope.startDate, $scope.endDate);
                //console.log(allocationYearWise);
                angular.forEach(allocationYearWise, function (item) {
                    if (item.rowSelect) {// if row delete in screen,then it should not save
                        if (!$scope.newData) {
                            $scope.clearMessages();
                            var r = confirm("There is duplicate records,Are sure want to continue?");
                            if (r === false) {
                                return;
                            }
                        }
                        allocationService.createAllocation(item).then(function (res) {
                            if (res.data == "created") {
                                $scope.clearMessages();
                                $scope.successMsg = "Allocaiton created successfully";
                                $('#resource-select').multiselect('rebuild');
                            }
                        }).catch(function (err) {
                            console.log(err);
                        });
                    }
                    $scope.clearMessages();
                });

                if ($scope.errorMsg == null) {
                    $scope.clearFields();
                    $('#projectBtn').attr('disabled', false);

                }

                // });
                $scope.newData = false;
            }
        }

        $scope.cancel = function () {
            $scope.detailDiv = true;
        }

        $scope.removeAllocation = function (rowId) {
            $("#" + rowId).hide();
            $scope.resourceWiseAllocaiton[rowId].rowSelect = false;
            var rowDelete = $filter('filter')($scope.resourceWiseAllocaiton, { rowSelect: false });
            if ($scope.resourceWiseAllocaiton.length === rowDelete.length) {
                $scope.months = [];
            }
        }

        $scope.clearAllocation = function (rowId) {
            angular.forEach($scope.resourceWiseAllocaiton[rowId].allocation, function (item) {
                item.value = 0;
            });

        }

        $scope.clearFields = function () {
            $('#resource-select').multiselect('rebuild');
            $scope.clearMessages();
            $scope.startDate = "";
            $scope.endDate = "";
            $scope.months = [];
            $scope.resourceWiseAllocaiton = [];
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            $scope.hidden = "none";
           // $scope.vishnu="none";
            $('#projectBtn').attr('disabled', false);
        }

        $scope.clearMessages = function () {
            $scope.successMsg = "";
            $scope.errorMsg = "";
            //$scope.hidden = "none";
        }

        $scope.dataChanged = function () {
            $scope.newData = true;
            $scope.clearMessages();
        }

        function getProjectData(projectService, $scope) {
            projectService.getProject($scope.region).then(function (res) {
                $scope.project = res.data;

            }).catch(function (err) {
                console.log(err);
            });

        }
        function getEcrData(ecrService, $scope) {
            ecrService.getEcr($scope.region).then(function (res) {
                $scope.ecr = res.data;
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

        $scope.getregiondata = function () {
            $scope.regionname = $scope.selectRegion.regionname;
            getMappedResourceData(resourceMappingService, $scope);
        }

        function getMappedResourceData(resourceMappingService, $scope) {
            resourceMappingService.getMappedResources($scope.regionname).then(function (res) {
                $scope.mappedResourceData = filterUniqueResource(res.data);
                var htm = '';
                angular.forEach($scope.mappedResourceData, function (item) {
                    htm += '<option>' + item.mappedResource.resourcename + '</option>';
                });
                $('#resource-select').empty();
                $('#resource-select').append(htm);
                $('#resource-select').multiselect('rebuild');
            }).catch(function (err) {
                console.log(err);
            });
        }

        function filterUniqueResource(collection) {

            var output = [], keys = [], item;
            for (var col = 0; col < collection.length; col++) {
                item = collection[col];
                if (keys.indexOf(item.mappedResource.resourcename) <= -1) {
                    output.push(item);
                    keys.push(item.mappedResource.resourcename);
                }
            }
            return output;
        }

        function splitAllocationByYear(entryAllocaiton, from, to) {

            var maps = new Array();
            var obj, year, allocLength, entryAlloc, yrs;
            var strYr = from.split("/");
            var endYr = to.split("/");

            var strYr = from.split("/")[1], endYr = to.split("/")[1], years = [];
            for (var i = strYr; i <= endYr; i++) {
                years.push(i);
            }

            for (var yr = 0; yr < years.length; yr++) {
                year = String(years[yr]);
                yrs = year.substr(year.length - 2);

                for (var allocRec = 0; allocRec < entryAllocaiton.length; allocRec++) {

                    allocLength = entryAllocaiton[allocRec].allocation.length;
                    entryAlloc = entryAllocaiton[allocRec].allocation;
                    //obj = Object.create(entryAllocaiton[allocRec]);
                    obj = jQuery.extend({}, entryAllocaiton[allocRec]);
                    obj.allocation = [];
                    obj.year = year;
                    var month = "";

                    for (var rs = 0; rs < allocLength; rs++) {
                        month = String(entryAlloc[rs].month);
                        if (month.endsWith(yrs)) {
                            obj.allocation.push(entryAlloc[rs]);
                        }
                    }
                    maps.push(obj);
                }

            }

            return maps;
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
        function getRegion(regionService, $scope) {
            regionService.getRegion().then(function (res) {
                $scope.regionData = res.data;
            })

        }

        function getRegionForName(regionService, $scope) {
            regionService.getRegionForName($scope.region).then(function (res) {
                $scope.regionData = res.data;
            })
        }
    }

})();

