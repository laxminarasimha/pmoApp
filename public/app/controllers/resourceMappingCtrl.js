(function () {
    'use strict';

    angular.module('pmoApp').controller('resourceMappingCtrl', Controller);


    Controller.$inject = ['$scope', '$rootScope','$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceMappingService', 'resourceService', 'roleService', 'locationService',
        'regionService', 'skillSetService', 'statusService', 'resourceTypeService', 'holidayListService',
        'monthlyHeaderListService'];

    function Controller($scope, $rootScope,$window, DTOptionsBuilder, DTColumnBuilder, $compile, resourceMappingService, resourceService, roleService, locationService,
        regionService, skillSetService, statusService, resourceTypeService, holidayListService, monthlyHeaderListService) {

        //$scope.resourcemap = {};
        $rootScope.Title = "Resource Map Listing";
        var app = $scope;
        $scope.region = $window.localStorage.getItem("region");

        $scope.resourcemap = {
            'taggToEuroclear': [],
            'monthlyAvailableActualMandays': []
        };

        $scope.mongoMappedResourceData = [];
        getMappedResourceData(resourceMappingService, $scope);

        $scope.resourceList = [];
        getResourceData(resourceService, $scope);


        $scope.locationList = [];
        getLocationData(locationService, $scope);

        $scope.regionList = [];
        getRegionData(regionService, $scope);


        $scope.skillSetList = [];
        getSkillSetData(skillSetService, $scope);

        $scope.statusList = [];
        getStatusData(statusService, $scope);

        $scope.roleList = [];
        getRoleData(roleService, $scope);


        $scope.resourceTypeList = [];
        getResourceTypeData(resourceTypeService, $scope);

        $scope.taggedToEuroclearList = [];


        $scope.filterResourceWithYear = [];

        $scope.aggegrateHolidayList = [];
        $scope.ShowSpinnerStatus = true;


        $scope.startDate = "";
        $scope.endDate = "";
        $scope.hidden = "none";
        $scope.errorMsgs = new Array();

        $scope.createMapping = function () {

            var strDt = $scope.startDate.split("/");
            var endDt = $scope.endDate.split("/");

            var date_1 = new Date(strDt[1], parseInt(strDt[0]) - 1);
            var date_2 = new Date(endDt[1], parseInt(endDt[0]) - 1);
            if (date_1 != "Invalid Date" && date_2 != "Invalid Date") {
                if (date_2 >= date_1) {
                    $scope.taggedToEuroclearList = months($scope.startDate, $scope.endDate);
                    $scope.yearSelect =
                        checkPreTagged($scope.resourcemap, $scope.mongoMappedResourceData, $scope.taggedToEuroclearList); // to check if already existed allocaiton 
                    $scope.hidden = "visible";
                } else {
                    app.loading = false;
                    app.successMsg = false;
                    app.errorMsg = " ";
                    app.errorClass = "error";
                    $scope.errorMsgs.push("Please Enter valid date range");
                }
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
            $scope.startDate = "";
            $scope.endDate = "";
            $scope.taggedToEuroclearList = [];
            $scope.hidden = "none";

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

        $scope.deleteResourceMapping = function (id) {
            var selectedId = document.getElementsByName("action");
            if (selectedId.length <= 0) {
                alert('Please select records to delete.')
            } else {
                //if (confirm('Are you sure to delete?')) {
                for (var record = 0; record < selectedId.length; record++) {
                    if (selectedId[record].checked) {
                        resourceMappingService.deleteResourceMapping(selectedId[record].value).then(function (res) {
                            if (res.data == "deleted") {
                                getMappedResourceData(resourceMappingService, $scope);
                                app.loading = false;
                                app.successMsg = "Resource mapping deleted successfully";
                                app.errorMsg = false;
                                $scope.msg = "";
                                $scope.deletedID = "";
                            }
                        }).catch(function (err) {
                            console.log(err);
                        });
                    }
                }
            }
        };

        $scope.editResourceMapping = function () {
            var selectedId = document.getElementsByName("action");
            var id = 0;
            var count = 0;
            for (var i = 0; i < selectedId.length; i++) {
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

            //console.log($scope.taggedToEuroclearList);
            $scope.hidden = "";

        };

        $scope.saveData = function (resourcemap) {
            $rootScope.Title = "Update Resourcemap";
            if ($scope.resourceMappingForm.$valid) {
                prepareTaggedToEuroclearData($scope, resourcemap);
                prepareData(resourceMappingService, app, holidayListService, $scope, resourcemap, false);
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
            if ($scope.resourceMappingForm.$valid) {
                prepareTaggedToEuroclearData($scope, resourcemap);
                prepareData(resourceMappingService, app, holidayListService, $scope, resourcemap, true);
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

        $scope.checkmonth = function (value) {

            return moment(value, "MMM-YYYY") < getToday();
        }


        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);

        $scope.childInfo = function (resource, yearSelect, event) {
            var scope = $scope.$new(true);


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
                scope.resourcemap = createDetails(resource, yearSelect, $scope.mongoMappedResourceData, holidayListService);
                icon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                row.child($compile('<div resourcemap-child-directive class="clearfix"></div>')(scope)).show();
                tr.addClass('shown');
            }
        }
    }

    function createDetails(resource, yearSelect, resourceData, holidayListService) {

        var filterRecord = [];

        angular.forEach(resourceData, function (row) {
            if (row.mappedResource.resourcename === resource &&
                row.year === yearSelect) {
                filterRecord.push(row);


                if (typeof row.holidaydeducted === 'undefined') {
                    console.log(row.region);
                    holidayListService.getAggegrateLocationHolidays(row.region).then(function (res) {
                        console.log(res.data);
                        var aggegrateHolidayList = res.data;
                        var monthyearLabel = new Map();

                        for (var i = 0; i < aggegrateHolidayList.length; i++) {
                            monthyearLabel.set(getMonth(aggegrateHolidayList[i]._id.month - 1) + '-' + (aggegrateHolidayList[i]._id.year.toString()).substring(2, 4), aggegrateHolidayList[i].number);
                        }

                        // Extract holidays from the actually available mandays
                        // for (var i = 0; i < filterRecord.length; i++) {
                        for (var k = 0; k < row.monthlyAvailableActualMandays.length; k++) {
                            var key = row.monthlyAvailableActualMandays[k].key;

                            if (monthyearLabel.has(key)) {
                                var holidays = monthyearLabel.get(key);
                                var percent = row.taggToEuroclear[k].value;
                                var actualHDays = (holidays * percent) / 100;
                                actualHDays = getRoundNumber(actualHDays, 1);
                                row.monthlyAvailableActualMandays[k].value = getRoundNumber((row.monthlyAvailableActualMandays[k].value - actualHDays), 1);
                                row.holidaydeducted = true;
                            }
                        }

                    }).catch(function (err) {
                        console.log(err);
                    });
                }
            }
        });

        // if (firstTimeClickDetails) {

        /*  holidayListService.getAggegrateLocationHolidays(region).then(function (res) {
              var aggegrateHolidayList = res.data;
              var monthyearLabel = new Map();
  
              for (var i = 0; i < aggegrateHolidayList.length; i++) {
                  monthyearLabel.set(getMonth(aggegrateHolidayList[i]._id.month - 1) + '-' + (aggegrateHolidayList[i]._id.year.toString()).substring(2, 4), aggegrateHolidayList[i].number);
              }
  
              console.log(monthyearLabel);
  
              // Extract holidays from the actually available mandays
              for (var i = 0; i < filterRecord.length; i++) {
                  for (var k = 0; k < filterRecord[i].monthlyAvailableActualMandays.length; k++) {
                      var key = filterRecord[i].monthlyAvailableActualMandays[k].key;
  
                      if (monthyearLabel.has(key)) {
                          var holidays = monthyearLabel.get(key);
                          var percent = filterRecord[i].taggToEuroclear[k].value;
                          var actualHDays = (holidays * percent) / 100;
                          actualHDays = getRoundNumber(actualHDays, 1);
                          filterRecord[i].monthlyAvailableActualMandays[k].value =getRoundNumber((filterRecord[i].monthlyAvailableActualMandays[k].value - actualHDays), 1);
               
                      }
                  }
              }
  
          }).catch(function (err) {
              console.log(err);
          });*/
        // }

        return filterRecord;
    }

    function createResoucreMap(resourceMappingService, app, $scope) {
        checkForAllocationInEachMonth($scope, resourceMappingService, app);

    }

    function saveResoucreMap(resourceMappingService, app, $scope) {

        $scope.errorMsgs = [];
        checkOverAllocation($scope, $scope.resourcemap, true);

        if ($scope.errorMsgs.length >= 1) {
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = " ";
            app.errorClass = "error";
        } else {
            resourceMappingService.updateResourceMapping($scope.resourcemap).then(function (res) {
                if (res.data == "updated") {
                    getMappedResourceData(resourceMappingService, $scope);
                    $scope.resourcemap = {
                        'taggToEuroclear': [],
                        'monthlyAvailableActualMandays': []
                    };
                    $scope.hidden = "none";
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
            app.errorMsg = "Allocaiton value shouldn't  greater than 100% for the month :" + infoMsg;
            app.errorClass = "error"
        } else {
            $scope.errorMsgs = [];
            checkOverAllocation($scope, resourceMap, false);
            if ($scope.errorMsgs.length > 0) {
                app.loading = false;
                app.successMsg = false;
                app.errorMsg = " ";
                app.errorClass = "error";
            } else {
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
                                $scope.hidden = "none";
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
        }
    }


    function checkOverAllocation($scope, resourceMap, isEdit) {

        var resource = resourceMap.mappedResource.resourcename;
        var totalValue = 0;
        var year = "";

        angular.forEach(resourceMap.taggToEuroclear, function (taggToEuro) {
            totalValue = 0;
            angular.forEach($scope.mongoMappedResourceData, function (oldAloc) {
                if (oldAloc.year != "undefined" && oldAloc.year != null) {
                    year = oldAloc.year.substr(2, oldAloc.year.length);
                    if (oldAloc.mappedResource.resourcename === resource && oldAloc.year.endsWith(year)) {
                        if (!isEdit) {
                            angular.forEach(oldAloc.taggToEuroclear, function (tag) {
                                if (taggToEuro.key === tag.key) {
                                    totalValue += tag.value;
                                }
                            });
                        } else {
                            if (oldAloc.resourceType != resourceMap.resourceType) {
                                angular.forEach(oldAloc.taggToEuroclear, function (tag) {
                                    if (taggToEuro.key === tag.key) {
                                        totalValue += tag.value;
                                    }
                                });

                            }
                        }
                    }
                }
            });

            totalValue += taggToEuro.value;
            if (totalValue > 100) {
                var values = "Over Allocation  for the month :" + taggToEuro.key;
                values += " and overalloaiton value is " + (parseInt(totalValue) - 100) + "% more";
                $scope.errorMsgs.push(values);
            }

        });

        return $scope.errorMsgs;
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
        var strYr = from.split("/");
        var endYr = to.split("/");

        var strYr = from.split("/")[1], endYr = to.split("/")[1], years = [];
        for (var i = strYr; i <= endYr; i++) {
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
            obj.taggToEuroclear = monthsWithYear(year);
            obj.monthlyAvailableActualMandays = monthsWithYear(year);
            obj.existing = false;
            var tagEurocelar = [];
            var count = 0;
            var tmp = "";

            for (var rs = 0; rs < tagLength; rs++) {
                tmp = String(resourcemap.taggToEuroclear[rs].key);
                if (tmp.endsWith(yrs)) {
                    for (var i = 0; i < obj.taggToEuroclear.length; i++) {
                        if (obj.taggToEuroclear[i].key === resourcemap.taggToEuroclear[rs].key) {
                            obj.taggToEuroclear[i].value = resourcemap.taggToEuroclear[rs].value;
                            break;
                        }
                    }
                }
            }

            for (var rs = 0; rs < tagLength; rs++) {
                tmp = String(resourcemap.monthlyAvailableActualMandays[rs].key);
                if (tmp.endsWith(yrs)) {
                    for (var i = 0; i < obj.monthlyAvailableActualMandays.length; i++) {
                        if (obj.monthlyAvailableActualMandays[i].key === resourcemap.monthlyAvailableActualMandays[rs].key) {
                            obj.monthlyAvailableActualMandays[i].value = resourcemap.monthlyAvailableActualMandays[rs].value;
                            break;
                        }
                    }
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
            for (var k = i; k < collection.length; k++) {
                month2 = collection[k].key.substr(0, 3);
                if (monthNames.indexOf(month1) > monthNames.indexOf(month2)) {
                    var tmp = collection[i];
                    collection[i] = collection[k];
                    collection[k] = tmp;
                }
            }
        }
        return collection;

    }


    function prepareData(resourceMappingService, app, holidayListService, $scope, resourcemap, isCreate) {
        // prepareHolidayListForLocation(resourceMappingService, app, holidayListService, $scope, resourcemap, isCreate, monthlyHeaderListService);
        prepareWorkingDaysForGivenRange(resourceMappingService, app, $scope, $scope.aggegrateHolidayList, resourcemap, isCreate);
    }

    /*  function prepareHolidayListForLocation(resourceMappingService, app, holidayListService, $scope, resourcemap, isCreate, monthlyHeaderListService) {
          holidayListService.getAggegrateLocationHolidays(resourcemap.mappedResource.baseentity).then(function (res) {
              $scope.aggegrateHolidayList = res.data;
              prepareWorkingDaysForGivenRange(resourceMappingService, app, $scope, $scope.aggegrateHolidayList, resourcemap, isCreate, monthlyHeaderListService);
          }).catch(function (err) {
              console.log(err);
          });
      }*/


    function prepareWorkingDaysForGivenRange(resourceMappingService, app, $scope, aggegrateHolidayList, resourcemap, isCreate) {
        // var theMonths = monthlyHeaderListService.getMonthList();
        var monthWorkDays = [];
        var taggedToEuroclearList = $scope.taggedToEuroclearList;
        var location = resourcemap.location;
        var holiday = false;
        var monthyearLabel = "";

        for (var j = 0; j < taggedToEuroclearList.length; j++) {
            // holiday = false;
            // for (var i = 0; i < aggegrateHolidayList.length; i++) {
            //     monthyearLabel = theMonths[aggegrateHolidayList[i]._id.month - 1] + '-' + (aggegrateHolidayList[i]._id.year.toString()).substring(2, 4);
            //     if (monthyearLabel == taggedToEuroclearList[j]) {
            //         var workdays = getWorkDays(aggegrateHolidayList[i]._id.month - 1, aggegrateHolidayList[i]._id.year);
            //       //  var realWorkDays = workdays - aggegrateHolidayList[i].number;
            //         var monthWorkDaysObject = { "location": location, "monthyear": monthyearLabel, "value": workdays };
            //         monthWorkDays.push(monthWorkDaysObject);
            //         holiday = true;
            //         break;
            //     }
            // }

            // if (!holiday) {
            var yearAndMonth = taggedToEuroclearList[j].split('-');
            var month = getIndex(yearAndMonth[0]);
            var year = yearAndMonth[1];
            var workdays = getWorkDays(month, year);

            var monthWorkDaysObject = { "location": location, "monthyear": taggedToEuroclearList[j], "value": workdays };
            monthWorkDays.push(monthWorkDaysObject);
            // }

        }
        prepareActualAvailableMandaysData(resourceMappingService, app, $scope, resourcemap, monthWorkDays, isCreate);
    }


    function prepareActualAvailableMandaysData(resourceMappingService, app, $scope, resourcemap, monthWorkDaysListForLocation, isCreate) {

        //var theMonths = monthlyHeaderListService.getMonthList();
        var taggedToEuroclearList = $scope.taggedToEuroclearList;
        var monthlyAvailableActualMandaysArray = [];
        var mappedResourceLocation = resourcemap.location;

        for (var j = 0; j < taggedToEuroclearList.length; j++) {
            for (var k = 0; k < monthWorkDaysListForLocation.length; k++) {
                if ((mappedResourceLocation == monthWorkDaysListForLocation[k].location)
                    && (taggedToEuroclearList[j] == monthWorkDaysListForLocation[k].monthyear)) {
                    var taggToEuroclearPercentage = getTaggToEuroclearPercentageForMonth(resourcemap, taggedToEuroclearList[j]);
                    var actualWorkingDays = (monthWorkDaysListForLocation[k].value) * (taggToEuroclearPercentage / 100);
                    var actualWorkingDaysWithRound = getRoundNumber(actualWorkingDays, 1);
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
            duplicate = false;
            for (var i = 0; i < keys.length; i++) {
                cond = keys[i].split("-");
                if (item.mappedResource.resourcename === cond[0] && item.year === cond[1]) {
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


    function daysInMonth(month, year) {
        return 32 - new Date(year, month, 32).getDate();
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

    function isWeekday(year, month, day) {
        var day = new Date(year, month, day).getDay();
        return day != 0 && day != 6;
    }

    function getMappedResourceData(resourceMappingService, $scope) {
        
        resourceMappingService.getMappedResources($scope.region).then(function (res) {
            $scope.mongoMappedResourceData = res.data;
            $scope.filterResourceWithYear = filterUniqueResourceWithYear(res.data);
            
            $scope.ShowSpinnerStatus = false;
            var spinner = document.getElementById("spinner");
            if (spinner.style.display != "none") {
                spinner.style.display = "none";

            }

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

    function getRoleData(roleService, $scope) {
        roleService.getRole().then(function (res) {
            $scope.roleList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
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

    function monthsWithYear(year) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var arr = [];
        function Object(key, value) {
            this.key = key;
            this.value = value;
        };

        for (var i = 0; i < monthNames.length; i++) {
            arr.push(new Object(monthNames[i] + "-" + year.substr(-2), 0));
        }


        return arr;
    }

    function getMonth(month) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[month];
    }

    function getIndex(month) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames.indexOf(month);
    }

    function getToday() {
        var date = new Date();
        var year = String(date.getFullYear());
        return moment(getMonth(date.getMonth()) + '-' + year.substr(-2), "MMM-YYYY");

    }

    function getRoundNumber(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }


    function openDialog() {
        $('#confirmModal').modal('show');
    }

})();