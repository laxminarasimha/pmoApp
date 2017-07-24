
(function () {
    'use strict';

    angular.module('pmoApp').controller('resourceMappingCtrl', Controller);


    Controller.$inject = ['$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceMappingService', 'resourceService', 'roleService', 'locationService',
        'regionService', 'skillSetService', 'statusService', 'resourceTypeService', 'holidayListService',
        'monthlyHeaderListService'];

    function Controller($scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, $compile, resourceMappingService, resourceService, roleService, locationService,
        regionService, skillSetService, statusService, resourceTypeService, holidayListService, monthlyHeaderListService) {

        //$scope.resourcemap = {};
        $rootScope.Title = "Resource Map Listing";
        var app = $scope;

        $scope.resourcemap = {
            'taggToEuroclear': [],
            'monthlyAvailableActualMandays': []
        };

        $scope.mongoMappedResourceData = [];
        getMappedResourceData(resourceMappingService, $scope);

        $scope.resourceList = [];
        getResourceData(resourceService, $scope);

        //$scope.roleList = [];
        //getRoleData(roleService,$scope);


        $scope.locationList = [];
        getLocationData(locationService, $scope);

        $scope.regionList = [];
        getRegionData(regionService, $scope);


        $scope.skillSetList = [];
        getSkillSetData(skillSetService, $scope);

        $scope.statusList = [];
        getStatusData(statusService, $scope);


        $scope.resourceTypeList = [];
        getResourceTypeData(resourceTypeService, $scope);

        $scope.taggedToEuroclearList = [];
        // prepareTagToEuroclearHeading($scope, monthlyHeaderListService);

        $scope.filterResourceWithYear = [];

        //$scope.aggegrateHolidayList = [];
        //$scope.monthWorkDaysListForLocation = [];
        //prepareHolidayListForLocation(holidayListService,$scope);

        $scope.startDate = "";
        $scope.endDate = "";
        $scope.hidden = "hidden";
        //$scope.yearDiff = 0;

        $scope.createMapping = function () {

            var startYear = new Date($scope.startDate);
            var endYear = new Date($scope.endDate);

            if (startYear <= endYear) {
                $scope.taggedToEuroclearList = months(startYear, endYear);
                checkPreTagged($scope.resourcemap, $scope.mongoMappedResourceData, $scope.taggedToEuroclearList); // to check if already existed allocaiton 
                $scope.hidden = "";
                // $scope.yearDiff = endYear.getFullYear() - startYear.getFullYear();
            }
        }

        $scope.clearFields = function () {
            $scope.resourcemap = {
                'taggToEuroclear': [],
                'monthlyAvailableActualMandays': []
            };
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
        }


        $scope.deleteResourceMapping = function (id) {
            var selectedId = document.getElementsByName("action");
            if (selectedId.length <= 0) {
                alert('Please select records to delete.')
            } else {
                if (confirm('Are you sure to delete?')) {
                    for (var record = 0; record < selectedId.length; record++) {
                        if (selectedId[record].checked) {
                            resourceMappingService.deleteResourceMapping(selectedId[record].value).then(function (res) {
                                if (res.data == "deleted") {
                                    getMappedResourceData(resourceMappingService, $scope);
                                    app.loading = false;
                                    app.successMsg = "Resource mapping Deleted successfully";
                                    app.errorMsg = false;
                                }
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }
                    }
                }
            }
        };

        $scope.editResourceMapping = function () {
            var selectedId = document.getElementsByName("action");
            var id = 0;
            var count = 0;
            for (var i = 0; i < selectedId.length; i++) {
                console.log(selectedId[i].checked);
                if (selectedId[i].checked) {
                    id = selectedId[i].value;
                    count++;
                }
            }

            if (count > 1) {
                alert('Please select one records only to Edit.');
                return;
            }

            $scope.taggedToEuroclearList = [];
            angular.forEach($scope.mongoMappedResourceData, function (data) {
                if (data._id === id) {
                    $scope.resourcemap = data;
                }
            });

            for (var i = 0; i < $scope.resourcemap.taggToEuroclear.length; i++) {
                $scope.taggedToEuroclearList.push($scope.resourcemap.taggToEuroclear[i].key);
            }

            console.log($scope.taggedToEuroclearList);
            $scope.hidden = "";

        };

        $scope.saveData = function (resourcemap) {
            $rootScope.Title = "Update Resourcemap";
            if ($scope.resourceMappingForm.$valid) {
                prepareTaggedToEuroclearData($scope, resourcemap);
                prepareData(resourceMappingService, app, holidayListService, $scope, resourcemap, false, monthlyHeaderListService);
            } else {
                app.loading = false;
                app.successMsg = false;
                app.errorMsg = "Please Enter Required value";
                app.errorClass = "error"
            }
        };

        $scope.createResourceMapping = function (resourcemap) {
            $rootScope.Title = "Create resourcemap";
            $scope.IsSubmit = true;
            //if (false) {
            if ($scope.resourceMappingForm.$valid) {
                prepareTaggedToEuroclearData($scope, resourcemap);
                prepareData(resourceMappingService, app, holidayListService, $scope, resourcemap, true, monthlyHeaderListService);
            } else {
                app.loading = false;
                app.successMsg = false;
                app.errorMsg = "Please Enter Required value";
                app.errorClass = "error"
            }

        }

        $scope.validateInput = function (obj, value) {
            if (value > 100) {
                alert("Mapped should not exceed 100%");
                return false;
            }


        };


        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);

        $scope.childInfo = function (resource, yearSelect, event) {
            var scope = $scope.$new(true);
            scope.resourcemap = createDetails(resource, yearSelect, $scope.mongoMappedResourceData);

            var link = angular.element(event.currentTarget),
                icon = link.find('.glyphicon'),
                tr = link.parent().parent(),
                table = $scope.vm.dtInstance.DataTable,
                row = table.row(tr);

            if (row.child.isShown()) {
                icon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                icon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                row.child($compile('<div resourcemap-child-directive class="clearfix"></div>')(scope)).show();
                tr.addClass('shown');
            }
        }

    }

    function createDetails(resource, yearSelect, resourceData) {
        var filterRecord = [];
        angular.forEach(resourceData, function (row) {
            if (row.mappedResource.resourcename === resource &&
                row.year === yearSelect) {
                filterRecord.push(row);
            }
        });
        return filterRecord;
    }

    function createResoucreMap(resourceMappingService, app, $scope) {
        checkForAllocationInEachMonth($scope, resourceMappingService, app);

    }

    function saveResoucreMap(resourceMappingService, app, $scope) {
        resourceMappingService.updateResourceMapping($scope.resourcemap).then(function (res) {
            if (res.data == "updated") {
                getMappedResourceData(resourceMappingService, $scope);
                $scope.resourcemap = {
                    'taggToEuroclear': [],
                    'monthlyAvailableActualMandays': []
                };
                $scope.hidden = "hidden";
                $scope.startDate = "";
                $scope.endDate = "";
                app.loading = false;
                app.successMsg = "Resource mapping updated successfully";
                app.errorMsg = false;
            }
        }).catch(function (err) {
            console.log(err);
        });
    }


    function checkForAllocationInEachMonth($scope, resourceMappingService, app) {
        var resourceMap = $scope.resourcemap;
        var overAllocation = false;
        var infoMsg = "";
        for (var i = 0; i < resourceMap.taggToEuroclear.length; i++) {
            if (resourceMap.taggToEuroclear[i].value > 100) {
                overAllocation = true;
                infoMsg = resourceMap.taggToEuroclear[i].key;
                break;
            }
        }
        if (overAllocation) {
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = "Over Allocation for Resource for :" + infoMsg;
            app.errorClass = "error"
        } else {
            var kinID = resourceMap.mappedResource.kinId;
            // resourceMappingService.getMappedResourceForKinID(kinID).then(function (res) {
            // console.log(resourceMap);
            // for (var j = 0; j < res.data.length; j++) {
            //     for (var i = 0; i < resourceMap.taggToEuroclear.length; i++) {
            //         if (resourceMap.taggToEuroclear[i].key == res.data[j]._id.key) {
            //             var sumAllocation = resourceMap.taggToEuroclear[i].value + res.data[j].count;
            //             if (sumAllocation > 100) {
            //                 overAllocation = true;
            //                 infoMsg = resourceMap.taggToEuroclear[i].key;
            //                 break;
            //             }
            //         }
            //     }

            //     if (overAllocation) {
            //         break;
            //     }
            // }

            // if (overAllocation) {
            //     app.loading = false;
            //     app.successMsg = false;
            //     app.errorMsg = "Over Allocation of the Resource for :" + infoMsg;
            //     app.errorClass = "error"
            // } else {
            // var resourceMap = $scope.resourcemap;

            var resourceMapYr = splitResoruceMapByYear($scope.resourcemap, $scope.startDate, $scope.endDate, $scope.mongoMappedResourceData);

            for (var i = 0; i < resourceMapYr.length; i++) {
                if (!resourceMapYr[i].existing) {
                    resourceMappingService.createResourceMapping(resourceMapYr[i]).then(function (res) {
                        if (res.data == "created") {
                            getMappedResourceData(resourceMappingService, $scope);
                            $scope.resourcemap = {
                                'taggToEuroclear': [],
                                'monthlyAvailableActualMandays': []
                            };
                            app.loading = false;
                            app.successMsg = "Resource mapping created successfully";
                            app.errorMsg = false;
                            $scope.hidden = "hidden";
                            $scope.startDate = "";
                            $scope.endDate = "";
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                } else {
                    $scope.resourcemap = resourceMapYr[i];
                    saveResoucreMap(resourceMappingService, app, $scope);

                }
            }
        }

        // }).catch(function (err) {
        //  console.log(err);
        // });
    }

    function checkPreTagged(resourcemap, mongoMappedResourceData, taggedToEuroclearList) { // to check if already existed allocaiton

        var resource = resourcemap.mappedResource.resourcename;
        var resType = resourcemap.resourceType;
        var array = new Array();
        var value = 0;
        var yr = "";

        angular.forEach(taggedToEuroclearList, function (newTag) {
            yr = newTag.substr(newTag.length - 2);
            angular.forEach(mongoMappedResourceData, function (preTag) {
                if (preTag.mappedResource.resourcename === resource && preTag.year.endsWith(yr) &&
                    resType === preTag.resourceType) {
                    angular.forEach(preTag.taggToEuroclear, function (tag) {
                        if (tag.key === newTag) {
                            value = tag.value;
                        }
                    });
                }
            });

            var taggedToEuroclearObject = {
                "key": newTag,
                "value": parseInt(value)
            };
            resourcemap.taggToEuroclear.push(taggedToEuroclearObject);
            value = 0;

        });
    }


    function splitResoruceMapByYear(resourcemap, from, to, mongoMappedResourceData) {

        var maps = new Array();
        var d1 = new Date(from), d2 = new Date(to), years = [];
        for (var i = d1.getFullYear(); i <= d2.getFullYear(); i++) {
            years.push(i);
        }

        var yrs = 0;
        var tagLength = resourcemap.taggToEuroclear.length;
        var tagtoEuroclear = resourcemap.taggToEuroclear;
        var monthlyavailableActualMandays = resourcemap.monthlyAvailableActualMandays;
        var year = "";

        for (var yr = 0; yr < years.length; yr++) {
            year = String(years[yr]);
            yrs = year.substr(year.length - 2);

            var obj = jQuery.extend({}, resourcemap);
            obj.taggToEuroclear = [];
            obj.monthlyAvailableActualMandays = [];
            obj.existing = false;
            var tagEurocelar = [];
            var count = 0;
            var tmp = "";

            for (var rs = 0; rs < tagLength; rs++) {
                tmp = String(resourcemap.taggToEuroclear[rs].key);
                if (tmp.endsWith(yrs)) {
                    obj.taggToEuroclear.push(resourcemap.taggToEuroclear[rs]);
                }
            }

            for (var rs = 0; rs < tagLength; rs++) {
                tmp = String(resourcemap.monthlyAvailableActualMandays[rs].key);
                if (tmp.endsWith(yrs)) {
                    obj.monthlyAvailableActualMandays.push(resourcemap.monthlyAvailableActualMandays[rs]);
                }
            }
            obj.year = year;
            maps.push(obj);
        }

        for (var i = 0; i < maps.length; i++) {
            var obj = maps[i];
            angular.forEach(mongoMappedResourceData, function (oldData) {

                if ( //obj.mappedResource.kinId === oldData.mappedResource.kindId &&
                    obj.mappedResource.resourcename === oldData.mappedResource.resourcename &&
                    obj.resourceType === oldData.resourceType &&
                    obj.year === oldData.year) {
                    obj._id = oldData._id;
                    obj.existing = true;
                    obj.taggToEuroclear = mergeNewWithOldMappAndSort(obj.taggToEuroclear, oldData.taggToEuroclear);
                    obj.monthlyAvailableActualMandays = mergeNewWithOldMappAndSort(obj.monthlyAvailableActualMandays, oldData.monthlyAvailableActualMandays);
                }

            });
        }
        return maps;
    }

    function mergeNewWithOldMappAndSort(newCollection, oldCollection) {
        var collection = newCollection;
        angular.forEach(oldCollection, function (oldItem) {
            var found = false;
            angular.forEach(newCollection, function (newItem) {
                if (oldItem.key == newItem.key) {
                    found = true;
                }
            });
            if (!found)
                collection.push(oldItem);
        });

        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var month1 = "";
        var month2 = "";
        for (var i = 0; i < collection.length; i++) {
            month1 = collection[i].key.substr(0, 3);
            console.log(month1);
            for (var k = i; k < collection.length; k++) {
                month2 = collection[k].key.substr(0, 3);
                if(monthNames.indexOf(month1) > monthNames.indexOf(month2)){
                    var tmp = collection[i];
					collection[i] = collection[k];
					collection[k] = tmp;
                }   
            }
        }
        return collection;

    }


    function prepareData(resourceMappingService, app, holidayListService, $scope, resourcemap, isCreate, monthlyHeaderListService) {

        prepareHolidayListForLocation(resourceMappingService, app, holidayListService, $scope, resourcemap, isCreate, monthlyHeaderListService);
    }

    function prepareHolidayListForLocation(resourceMappingService, app, holidayListService, $scope, resourcemap, isCreate, monthlyHeaderListService) {
        holidayListService.getAggegrateLocationHolidays(resourcemap.location).then(function (res) {
            prepareWorkingDaysForGivenRange(resourceMappingService, app, $scope, res.data, resourcemap, isCreate, monthlyHeaderListService);
        }).catch(function (err) {
            console.log(err);
        });
    }

    function prepareWorkingDaysForGivenRange(resourceMappingService, app, $scope, aggegrateHolidayList, resourcemap, isCreate, monthlyHeaderListService) {
        var theMonths = monthlyHeaderListService.getMonthList();
        var monthWorkDays = [];
        var taggedToEuroclearList = $scope.taggedToEuroclearList;
        var location = resourcemap.location;
        var holiday = false;
        var monthyearLabel = "";

        for (var j = 0; j < taggedToEuroclearList.length; j++) {
            holiday = false;
            for (var i = 0; i < aggegrateHolidayList.length; i++) {
                monthyearLabel = theMonths[aggegrateHolidayList[i]._id.month - 1] + '-' + (aggegrateHolidayList[i]._id.year.toString()).substring(2, 4);
                if (monthyearLabel == taggedToEuroclearList[j]) {
                    var workdays = getWorkDays(aggegrateHolidayList[i]._id.month - 1, aggegrateHolidayList[i]._id.year);
                    var realWorkDays = workdays - aggegrateHolidayList[i].number;
                    var monthWorkDaysObject = { "location": location, "monthyear": monthyearLabel, "value": realWorkDays };
                    monthWorkDays.push(monthWorkDaysObject);
                    holiday = true;
                    break;
                }
            }

            if (!holiday) {
                var headeingLabelArray = taggedToEuroclearList[j].split('-');
                var month = theMonths.indexOf(headeingLabelArray[0]);
                var year = '20' + headeingLabelArray[1];
                var workdays = getWorkDays(month, year);
                var monthWorkDaysObject = { "location": location, "monthyear": taggedToEuroclearList[j], "value": workdays };
                monthWorkDays.push(monthWorkDaysObject);
            }

        }
        prepareActualAvailableMandaysData(resourceMappingService, app, $scope, resourcemap, monthWorkDays, isCreate, monthlyHeaderListService);
    }


    function prepareActualAvailableMandaysData(resourceMappingService, app, $scope, resourcemap, monthWorkDaysListForLocation, isCreate, monthlyHeaderListService) {
        var theMonths = monthlyHeaderListService.getMonthList();
        var taggedToEuroclearList = $scope.taggedToEuroclearList;
        var monthlyAvailableActualMandaysArray = [];
        var mappedResourceLocation = resourcemap.location;

        for (var j = 0; j < taggedToEuroclearList.length; j++) {

            for (var k = 0; k < monthWorkDaysListForLocation.length; k++) {
                if ((mappedResourceLocation == monthWorkDaysListForLocation[k].location)
                    && (taggedToEuroclearList[j] == monthWorkDaysListForLocation[k].monthyear)) {
                    var taggToEuroclearPercentage = getTaggToEuroclearPercentageForMonth(resourcemap, taggedToEuroclearList[j]);
                    var actualWorkingDays = (monthWorkDaysListForLocation[k].value) * (taggToEuroclearPercentage / 100);
                    var actualWorkingDaysWithRound = monthlyHeaderListService.getRoundNumber(actualWorkingDays, 1);
                    var monthlyAvailableActualMandaysObject = {
                        "key": taggedToEuroclearList[j],
                        "value": actualWorkingDaysWithRound
                    };
                    monthlyAvailableActualMandaysArray.push(monthlyAvailableActualMandaysObject);
                    break;

                }
            }
        }

        $scope.resourcemap.monthlyAvailableActualMandays = monthlyAvailableActualMandaysArray;
        if (isCreate) {
            createResoucreMap(resourceMappingService, app, $scope); //new
        } else {
            saveResoucreMap(resourceMappingService, app, $scope); //update
        }

    }

    function getTaggToEuroclearPercentageForMonth(resourcemap, monthyear) {

        for (var i = 0; i < resourcemap.taggToEuroclear.length; i++) {
            if (monthyear == resourcemap.taggToEuroclear[i].key) {
                return resourcemap.taggToEuroclear[i].value;
            }
        }
    }


    // function prepareTagToEuroclearHeading($scope, monthlyHeaderListService) {

    //    // $scope.taggedToEuroclearList = monthlyHeaderListService.getHeaderList();
    //    $scope.taggedToEuroclearList=[];

    // }

    function prepareTaggedToEuroclearData($scope, resourcemap) {
        var taggedToEuroclearArray = [];
        var taggedToEuroclearObject = {};

        for (var i = 0; i < $scope.taggedToEuroclearList.length; i++) {
            var taggedToEuroclearObject = {
                "key": $scope.taggedToEuroclearList[i],
                "value": parseInt(resourcemap.taggToEuroclear[i].value)
            };
            taggedToEuroclearArray.push(taggedToEuroclearObject);
        }

        $scope.resourcemap.taggToEuroclear = taggedToEuroclearArray;
    }


    function filterUniqueResourceWithYear(collection) {

        var output = [],
            keys = [],
            cond = [], duplicate = false, item;

        for (var col = 0; col < collection.length; col++) {
            item = collection[col];
            for (var i = 0; i < keys.length; i++) {
                cond = keys[i].split("-");
                if (item.mappedResource.resourcename === cond[0]
                    && item.year === cond[1]) {
                    duplicate = true;
                    break;
                }
            }
            if (!duplicate) {
                output.push(item);
                keys.push(item.mappedResource.resourcename + "-" + item.year);
            }

        }
        return output;

    }


    function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getWorkDays(month, year) {
        var days = getDaysInMonth(month, year);
        var workdays = 0;
        for (var i = 0; i < days; i++) {
            if (isWorkDay(year, month, i + 1)) {
                workdays++;
            }
        }
        return workdays;

    }

    function isWorkDay(year, month, day) {
        var date = new Date(year, month, day);
        var dayOfWeek = date.getDay();
        return (dayOfWeek >= 1 && dayOfWeek <= 5); // Sun = 0, Mon = 1, and so forth
    }


    function getMappedResourceData(resourceMappingService, $scope) {
        resourceMappingService.getMappedResources().then(function (res) {
            $scope.mongoMappedResourceData = res.data;
            $scope.filterResourceWithYear = filterUniqueResourceWithYear(res.data);

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


    function getLocationData(locationService, $scope) {
        locationService.getLocation().then(function (res) {
            $scope.locationList = res.data;
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


    function getSkillSetData(skillSetService, $scope) {
        skillSetService.getSkillSets().then(function (res) {
            $scope.skillSetList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getStatusData(statusService, $scope) {
        statusService.getStatus().then(function (res) {
            $scope.statusList = res.data;
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

    function months(from, to) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var arr = [];
        var datFrom = new Date(from);
        var datTo = new Date(to);
        var fromYear = datFrom.getFullYear();
        var toYear = datTo.getFullYear();
        var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();

        for (var i = datFrom.getMonth(); i <= diffYear; i++) {
            arr.push(monthNames[i % 12] + "-" + Math.floor(fromYear + (i / 12)).toString().substr(-2));
        }

        return arr;
    }

})();