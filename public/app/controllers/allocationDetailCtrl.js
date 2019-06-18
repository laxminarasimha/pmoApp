(function () {
    'use strict';
    var app = angular.module('pmoApp');

    app.filter('unique', function () {
        return function (collection, condition) {
            var output = [],
                keys = [];
            var splitKeys = condition.split('.');

            angular.forEach(collection, function (item) {
                var key = {};
                angular.copy(item, key);
                for (var i = 0; i < splitKeys.length; i++) {
                    key = key[splitKeys[i]];
                }

                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    output.push(item);
                }
            });

            return output;
        };
    });

    app.controller('allocationDetailCtrl', Controller);

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
    })

    function filter(scope, collection, resource, year, mappedResourceData, leaveList, holidayList, showdetail, $filter) {
        if (showdetail) return; // if details is going to close then return

        var allocationDetails = [];

        angular.forEach(collection, function (item) {
            if (item.resource === resource && item.year === year) {
                allocationDetails.push(item);

            }
        });

        scope.monthLabel = months(year);
        //var duplicateProjectChk = [];
        //var fileterTarget = [];

        angular.forEach(allocationDetails, function (item) {
            item.allocation = eachMonthAllocaiton(scope.monthLabel, item);
            //console.log(eachMonthAllocaiton(scope.monthLabel, item.allocation));

        });


        // create the hoilidays with month-year fromat and store in a map
        var monthyearLabel = new Map();
        for (var i = 0; i < holidayList.length; i++) {
            monthyearLabel.set(getMonth(holidayList[i]._id.month - 1) + '-' + (holidayList[i]._id.year.toString()).substring(2, 4), holidayList[i].number);
        }

        var mappedToResource = [];
        for (var user = 0; user < mappedResourceData.length; user++) {

            if (mappedResourceData[user].mappedResource.resourcename === resource && mappedResourceData[user].year === year) {

                if (typeof mappedResourceData[user].holidaydeduct === 'undefined') {  // if it is first time open, then holidays should not delte from the actually availablemanday.It is already dedcuted during load time
                    for (var k = 0; k < mappedResourceData[user].monthlyAvailableActualMandays.length; k++) {
                        var key = mappedResourceData[user].monthlyAvailableActualMandays[k].key;

                        if (monthyearLabel.has(key)) {
                            var holidays = monthyearLabel.get(key);
                            var percent = mappedResourceData[user].taggToEuroclear[k].value;
                            var actualHDays = (holidays * percent) / 100;
                            actualHDays = getRoundNumber(actualHDays, 1);
                            mappedResourceData[user].monthlyAvailableActualMandays[k].value = getRoundNumber((mappedResourceData[user].monthlyAvailableActualMandays[k].value - actualHDays), 1);
                            mappedResourceData[user].holidaydeduct = true;
                        }
                    }
                }
                mappedToResource.push(mappedResourceData[user]);
            }
        }

        var resoruceType = null;
        var object = null;
        var collection = [];
        var oldObject = null;
        var readonly = monthsReadonly(scope.monthLabel);

        for (var k = 0; k < allocationDetails.length; k++) {
            resoruceType = allocationDetails[k].resourcetype;

            angular.forEach(collection, function (item) {
                if (item.resourcetype === resoruceType) {
                    oldObject = item;
                    return;
                }
            });

            if (oldObject != null) {
                oldObject.allocation.push(allocationDetails[k]);
            } else {
                object = new Object();
                collection.push(object);
                object.allocation = [];
                object.buffertime = [];
                object.resourcetype = allocationDetails[k].resourcetype;
                object.year = allocationDetails[k].year;
                object.allocation.push(allocationDetails[k]);
                object.availabledays = [];
                object.mappercent = [];
                object.vacation = monthsWithYear(year);
                object.readonly = readonly;

                for (var j = 0; j < mappedToResource.length; j++) {
                    if (mappedToResource[j].resourceType === allocationDetails[k].resourcetype) {
                        object.availabledays = mappedToResource[j].monthlyAvailableActualMandays;
                        object.mappercent = mappedToResource[j].taggToEuroclear;
                        break;
                    }
                }

                if (object.availabledays.length <= 0) {
                    var arr = monthsWithYear(object.year);
                    object.availabledays = arr;
                    object.mappercent = arr;
                }
            }
            oldObject = null;
        }

        checkOverAllocaiton(scope, collection, year, leaveList, mappedToResource, resource);
        return collection;
    }

    function eachMonthAllocaiton(source, target) {

        function Object(month, value) {  // new object create for each month
            this.month = month;
            this.value = value;
        }

        var tempAlloc = 0;
        var newAlloc = [];

        angular.forEach(source, function (month) {
            tempAlloc = 0;
            angular.forEach(target.allocation, function (oldMonth) {
                if (oldMonth.month === month) {
                    tempAlloc = oldMonth.value;
                    return;
                }
            });
            newAlloc.push(new Object(month, tempAlloc));
        });
        return newAlloc;
    };


    function checkOverAllocaiton(scope, alloCollection, year, leaveList, mappedResourceData, resource) {

        var buffertime = null;
        var count = 0;
        var totalAllocDays = monthsWithYear(year);

        // map indivial leaves to map a 12 months map
        var leaves = monthsWithYear(year);
        angular.forEach(leaveList, function (leave) {
            angular.forEach(leave.leavedaysinmonth, function (days) {
                angular.forEach(leaves, function (leaveDay) {
                    if (leaveDay.key === days.month) {
                        leaveDay.value = leaveDay.value + days.value;

                    }
                });
            });
        });

        //adjust the leave with each allocaiton type 
        for (var adj = 0; adj < alloCollection.length; adj++) {
            var item = alloCollection[adj];
            for (var k = 0; k < 12; k++) {
                var percent = item.mappercent[k].value;
                var percentV = (leaves[k].value * percent) / 100;
                item.vacation[k].value = round(percentV, 1);
            }
        }

        var isConflict = false;

        angular.forEach(alloCollection, function (item) {

            buffertime = new Array();
            buffertime = Array(12).fill(0);

            angular.forEach(item.allocation, function (alloc) {
                count = 0;
                angular.forEach(alloc.allocation, function (monthlyAloc) {
                    buffertime[count] = buffertime[count] + round(monthlyAloc.value, 1);
                    count++;
                });
            });

            for (var k = 0; k < item.availabledays.length; k++) {
                buffertime[k] = round((item.availabledays[k].value - buffertime[k]), 1);        // this check the status of mapping value with allocaiton value only with add leaves
                buffertime[k] = round((buffertime[k] - item.vacation[k].value), 1);             // minus the leave days from totaldays as well
                totalAllocDays[k].value = totalAllocDays[k].value + item.availabledays[k].value;  // this sums actual available days as per mapping percentage

                if (buffertime[k] < 0) {
                    isConflict = true;
                }
            }
            item.buffertime = buffertime;
            item.isConflict = isConflict;

        });

        // if there is not allocation done yet,so it only shows the available mandays after deduct leaves on the months

        if (alloCollection.length <= 0 && mappedResourceData.length > 0) {

            scope.noallocation = [];
            function NoAllocation() {
                this.type;
                this.availableday = [];
                this.percent = [];
            }

            for (var map = 0; map < mappedResourceData.length; map++) {
                var noalloc = new NoAllocation();
                noalloc.type = mappedResourceData[map].resourceType;
                noalloc.availableday = mappedResourceData[map].monthlyAvailableActualMandays;
                noalloc.percent = mappedResourceData[map].taggToEuroclear;
                if (typeof mappedResourceData[map].holidaydeduct === 'undefined') {
                    for (var month = 0; month < leaves.length; month++) {
                        noalloc.availableday[month].value = round((noalloc.availableday[month].value - leaves[month].value), 1);
                    }
                    mappedResourceData[map].holidaydeduct = true;
                }

                scope.noallocation.push(noalloc);
            }
        }

    }

    Controller.$inject = ['$rootScope', '$scope', '$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceService', 'projectService', 'resourceTypeService', 'ecrService', 'allocationService', 'leaveService', 'resourceMappingService', '$filter', 'availableDaysService', 'holidayListService', 'allocationSharingService'];

    function Controller($rootScope, $scope, $window, DTOptionsBuilder, DTColumnBuilder, $compile, resourceService, projectService, resourceTypeService, ecrService, allocationService, leaveService, resourceMappingService, $filter, availableDaysService, holidayListService, allocationSharingService) {

        $scope.resource = [];
        //$scope.resourceWiseAllocaiton = [];
        $scope.startDate;
        $scope.endDate;
        $scope.months = [];
        $scope.allocationList = [];
        $scope.leaveList = [];
        $scope.mappedResourceData = [];
        $scope.mappingValue = [];
        $scope.conflict = false;
        $scope.holidayList = [];
        $scope.ShowSpinnerStatus = true;


        //console.log("*************"+$rootScope.region);
        $scope.region = $window.localStorage.getItem("region");

        $scope.allocationYear = [];

        function allocObject(object) {
            var month;
            var allocation;
            var date;

            return {
                month: object.month,
                value: object.value,
                date: object.date,
                project: object.project,
                label: object.label,
            }
        };

        getAlloctionData(allocationService, allocationSharingService.resourceSelect, $scope);
        getResourceTypeData(resourceTypeService, $scope);
        getProjectData(projectService, $scope);
        getEcrData(ecrService, $scope);
        getMappedResourceData($scope, resourceMappingService, holidayListService);
        getResourceData($scope, resourceService);
        getLeaveData(leaveService, $scope);
        //getHolidayData(holidayListService, $scope, new Date().getFullYear()); // get all the date from current year
        getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService);

        $scope.updateAllocaiton = function (rowIndex, event) {

            //console.log(allocationSharingService.resourceSelect + "--" + $scope.yearSelect + "--" + allocationSharingService.regionSelect);

            angular.forEach($scope.allocationList, function (item) {
                if (item.resource === allocationSharingService.resourceSelect && item.year === $scope.yearSelect) {
                    allocationService.updateAllocation(item).then(function (res) {
                        if (res.data == "updated") {
                            console.log('updated');
                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
            });
            $scope.childInfo($scope.yearSelect, rowIndex, event, true);
        }

        $scope.newRowIndex = 0;
        $scope.newResourceType = "";
        $scope.newRowEvent = null;

        $scope.addNewRow = function (resource, year, resourceType, row, event) {
            console.log( $scope.resourcetype);
            var monthLabel = months(year);
            console.log(year);
             var v_label = [];
            $scope.newRowIndex = row;
            $scope.newResourceType = resourceType;
            $scope.newRowEvent = event;


            angular.forEach(monthLabel, function (label) {
                $scope.monthWiseAllocation = {
                    month: label,  // this is allocation month name
                    value: 0,
                }
                v_label.push($scope.monthWiseAllocation);
            });
            $scope.rowWiseAllocation = {
                resource: resource,
                project: '',
                ecr: '',
                resourcetype: '',
                region: $scope.region,
                year: year,
                allocation: v_label,
            }
            oDialog();
        }

        $scope.clearMessages = function () {
            $scope.successMsg = "";
            $scope.errorMsg = "";
            //$scope.hidden = "none";
        }

        $scope.saveNewRow = function (event, rowIndex) {
            $scope.clearMessages();
            allocationService.createAllocation($scope.rowWiseAllocation).then(function (res) {
                if (res.data === "created") {
                    // $scope.successMsg = "Allocaiton created successfully";
                    $scope.cancel(event);
                    $scope.allocationList.push($scope.rowWiseAllocation); // add new row to the existing list to update the screen
                } else {
                    $scope.errorMsg = "Allocaiton creation failed,Please try  again";
                }
            })
            $scope.childInfo($scope.rowWiseAllocation.resource, $scope.rowWiseAllocation.year, $scope.newResourceType, $scope.newRowIndex, $scope.newRowEvent, true);
        }
        $scope.cancel = function (event) {

        }

        $scope.deleteAllocation = function (rowIndex, event) {

            var myRadio = $('input[name="action"]');
            $scope.deletedID = myRadio.filter(':checked').val();

            if (confirm("Are you sure want to delete the record?")) {
                if ($scope.deletedID != null) {
                    var data = $scope.deletedID.split("~");
                    for (var count = 0; count < $scope.allocationList.length; count++) {
                        var item = $scope.allocationList[count];
                        if (item._id == data[4]) {
                            allocationService.deleteAllocation(item._id).then(function (res) {
                                if (res.data == "deleted") {
                                    app.loading = false;
                                    app.successMsg = "Resource allocation deleted successfully";
                                    app.errorMsg = false;
                                    $scope.msg = "";

                                    allocationService.getAllAllocation().then(function (res) {
                                        $scope.allocationList = res.data;
                                        $scope.childInfo($scope.yearSelect, rowIndex, event, true);

                                    }).catch(function (err) {
                                        console.log(err);
                                    });
                                }
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }
                    }
                }
            }
        };
        ///////////////////////// start Datatable Code /////////////////////////////////

        $scope.previousRowSelect2 = null; //point reference which row selected previously
        $scope.previousRow2 = -1;
        $scope.vm2 = {};
        $scope.vm2.dtInstance = null;
        $scope.vm2.dtOptions = DTOptionsBuilder.newOptions().withOption("bPaginate", false).withOption("bFilter", false).withOption("paging", false).withOption("bInfo", false);

        $scope.yearSelect = "";
        $scope.resourceSelect = "";
        $scope.regionSelect = "";


        $scope.childInfo = function (year, listIndex, event, updateTable) {

            if ($scope.previousRowSelect2 !== null && $scope.previousRow2 !== listIndex) {
                var link = angular.element($scope.previousRowSelect2.currentTarget),
                    icon = link.find('.glyphicon'),
                    tr = link.parent().parent(),
                    table = $scope.vm2.dtInstance.DataTable,
                    row = table.row(tr);

                icon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                row.child.hide();
                tr.removeClass('shown');

            }
            $scope.previousRowSelect2 = event;
            $scope.previousRow2 =listIndex;

            var scope = $scope.$new(true);
            var link = angular.element(event.currentTarget),
                icon = link.find('.glyphicon'),
                tr = link.parent().parent(),
                table = $scope.vm2.dtInstance.DataTable,
                row = table.row(tr);

            var leaves = $filter('filter')($scope.leaveList, { resourcename: allocationSharingService.resourceSelect });
            //var holidays = $filter('filter')($scope.holidayList, { year: year, locationname: location });

            var childShown = false;
            if (updateTable == null)
                childShown = row.child.isShown();

            //console.log(allocationSharingService.resourceSelect + "--" + year + "--" + allocationSharingService.regionSelect);

            $scope.yearSelect = year;

            holidayListService.getAggegrateLocationHolidays(allocationSharingService.regionSelect).then(function (res) {
                scope.allocCollection = filter(scope, $scope.allocationList, allocationSharingService.resourceSelect, year, $scope.mappedResourceData, leaves, res.data, childShown, $filter);

                if (typeof scope.allocCollection !== "undefined") {

                    var isConflict = false;
                    angular.forEach(scope.allocCollection, function (item) {
                        if (item.isConflict)
                            isConflict = true;
                    });

                    $scope.mappingValue[listIndex].isConflict = isConflict;

                }
            }).catch(function (err) {
                console.log(err);
            });


            if (updateTable) {
                row.child($compile('<div allocdetail class="clearfix"></div>')(scope)).show();

            } else {
                if (row.child.isShown()) {
                    icon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    icon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    row.child($compile('<div allocdetail class="clearfix"></div>')(scope)).show();
                    tr.addClass('shown');
                }
            }
        }

        $scope.getAllocationStatus = function () {
            $scope.mappingValue = availableDaysService.getAllocationStatus($scope.mappingValue);
        }

    }

    function checkmonth(index) {
        var currentMonth = new Date().getMonth();
        return index < currentMonth;
    }

    function getAlloctionData(allocationService, resourceName, $scope) {

        $scope.ShowSpinnerStatus = true;

        allocationService.getAlloctionForResource(resourceName).then(function (res) {

            $scope.allocationList = res.data;

            $scope.ShowSpinnerStatus = false;
            var spinner = document.getElementById("spinner");
            if (spinner.style.display != "none") {
                spinner.style.display = "none";
            }

        }).catch(function (err) {
            console.log(err);
        });
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

    function getLeaveData(leaveService, $scope) {
        leaveService.getLeave().then(function (res) {
            $scope.leaveList = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getMappedResourceData($scope, resourceMappingService, holidayListService) {
        //$scope.ShowSpinnerStatus = false;
        resourceMappingService.getMappedResources($scope.region).then(function (res) {

            // $scope.ShowSpinnerStatus = false;
            // var spinner = document.getElementById("spinner");
            // if (spinner.style.display != "none") {
            //     spinner.style.display = "none";
            // }

            var collection = res.data;
            var key = "";
            var resource = [], keys = [], item;
            for (var col = 0; col < collection.length; col++) {
                item = collection[col];
                key = item.mappedResource.resourcename + '-' + item.year;
                if (keys.indexOf(key) <= -1) {
                    resource.push(item);
                    keys.push(key);
                }
            }

            //getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService, resource);
            $scope.mappedResourceData = res.data;
            $scope.mappingValue = resource;

        }).catch(function (err) {
            console.log(err);
        });
    }


    function getResourceData($scope, resourceService) {
        //$scope.ShowSpinnerStatus = false;
        resourceService.getResources($scope.region).then(function (res) {
            // $scope.ShowSpinnerStatus = false;
            // var spinner = document.getElementById("spinner");
            // if (spinner.style.display != "none") {
            //     spinner.style.display = "none";
            // }

            // var collection = res.data;
            // var key = "";
            // var resource = [], keys = [], item;
            // for (var col = 0; col < collection.length; col++) {
            //     item = collection[col];
            //     key = item.mappedResource.resourcename + '-' + item.year;
            //     if (keys.indexOf(key) <= -1) {
            //         resource.push(item);
            //         keys.push(key);
            //     }
            // }

            //getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService, resource);
            $scope.resourceData = res.data;
            //$scope.mappingValue = resource;

        }).catch(function (err) {
            console.log(err);
        });
    }

    function getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService) {
        var allocation = [];
        var resoruceMapping = [];
        var leave = [];
        allocationService.getAllAllocation().then(function (res) {
            allocation = res.data;
            
            leaveService.getLeave().then(function (res) {
                leave = res.data;
                resourceMappingService.getMappedResources($scope.region).then(function (res) {
                    resoruceMapping = res.data;
                    availableDaysService.intialize(allocation, resoruceMapping, leave);
                    $scope.getAllocationStatus(availableDaysService);
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

    function daysInMonthAndYear(year, holidays) {
        var holidayList = [];
        var monthWiseDays = [];

        angular.forEach(holidays, function (holiday) {
            holidayList.push(formatDate(holiday.holidayDate));
        });

        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var days = 0;

        function Object(key, value) {
            this.key = key;
            this.value = value;
        };

        for (var month = 0; month < monthNames.length; month++) {
            var date = new Date(year, month, 1);
            var days = [];
            var tmp = 0;
            while (date.getMonth() === month) {
                var tmpDate = new Date(date);
                var weekDay = tmpDate.getDay();

                if (weekDay % 6) { // exclude 0=Sunday and 6=Saturday
                    if (holidayList.indexOf(formatDate(tmpDate)) === -1) {
                        days.push(tmpDate);
                    }
                }
                date.setDate(date.getDate() + 1);
            }
            monthWiseDays.push(new Object(monthNames[month] + "-" + year.substr(-2), days.length));

        }
        return monthWiseDays;
    }

    function date_sort_asc(date1, date2) {
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
    }

    function date_sort_desc(date1, date2) {
        if (date1 > date2) return -1;
        if (date1 < date2) return 1;
        return 0;
    }

    function months(year) {
       
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var arr = [];
        for (var i = 0; i < monthNames.length; i++) {
            arr.push(monthNames[i] + "-" + year.substr(-2));
        }
        return arr;
    }

    function monthsReadonly(monthLabel) {
        var arr = [];
        for (var i = 0; i < monthLabel.length; i++) {
            var date = moment(monthLabel[i], "MMM-YYYY");
            arr.push(date < getToday());
        }
        return arr;
    }

    function getMonth(month) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[month];
    }

    function getToday() {

        var date = new Date();
        var year = String(date.getFullYear());
        return moment(getMonth(date.getMonth()) + '-' + year.substr(-2), "MMM-YYYY");

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

    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    function formatDate(date) {
        var d = new Date(date),
            dArr = [d.getFullYear(),
            pad(d.getMonth() + 1),
            pad(d.getDate())];
        return dArr.join('-');
    }

    function pad(num) {
        return ("0" + num).slice(-2);
    }

    function getRoundNumber(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    function openDialog() {
        $('#confirmModal').modal('show');
    }
    function oDialog() {
        $('#conmModal').modal('show');
    }
})();
