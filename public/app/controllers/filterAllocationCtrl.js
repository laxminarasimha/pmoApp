(function () {

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

    app.controller('filterAllocationCtrl', Controller);

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

    Controller.$inject = ['$rootScope', '$scope', '$window', '$compile', 'DTOptionsBuilder', 'DTColumnBuilder', 'resourceService', 'projectService', 'allocationService', 'resourceTypeService', 'leaveService',  '$filter', 'availableDaysService', 'holidayListService'];

    function Controller($rootScope, $scope, $window, $compile, DTOptionsBuilder, DTColumnBuilder, resourceService, projectService, allocationService, resourceTypeService, leaveService, $filter, availableDaysService, holidayListService) {

        $scope.projectSelect = "ALL";

        $scope.startDate;
        $scope.endDate;
        $scope.monthCol = [];
        $scope.allocationList = [];
        $scope.ShowSpinnerStatus = false;

        $scope.project = [];
        $scope.listData = [];
        $scope.selectProject = 'ALL';
        $scope.resTypeSelect = 'ALL';
        $scope.resource = [];
        $scope.mappedResourceData = [];
        $scope.resourceType = [];
        $scope.region = $window.localStorage.getItem("region");

        intialize(projectService, resourceService, resourceTypeService, allocationService, $scope);

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
        // var myDate = new Date();
       
        // var previousMonth = new Date(myDate);
        // previousMonth.setMonth(myDate.getMonth()-7);
        // console.log(previousMonth);
        // previousMonth = mm + '/'  + yyyy;


       



        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons', ['print', 'pdf', 'excel']);
        $scope.vm.dtOptions.withOption('lengthMenu', [10, 25, 50, "All"]);

        $scope.selectDate = function () {
            $scope.rangeSelect = "";
            $('#rangeSelect').prop('disabled', true);
        }

        $scope.filterSeach = function () {

            // if ($scope.startDate === '' || $scope.endDate === '' || $scope.startDate === undefined || $scope.endDate === undefined) {
            //     // var date = new Date();
            //     // $scope.startDate = date.getFullYear()+''+date.getMonth();
            //     $scope.errorMsg = "Please select a valid date range."
            //     return;
            // }
            // console.log("Resource" + $scope.resource);
            // if ($scope.resource == '' || $scope.resource == undefined) {
            //     $scope.errorMsg = "Please select a valid resource."
            //     return;
            // }
            switch ($scope.rangeSelect) {
                case "one":
                    var fromDate = new Date();
                    var fyear = fromDate.getFullYear();
                    var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
                    console.log(fDate)
                    var preDate = new Date(fromDate);
                    preDate.setMonth(fromDate.getMonth());
                    var pyear = preDate.getFullYear();
                    var pDate = (preDate.getMonth() + 1) + '/' + pyear;
                    $scope.startDate = pDate;
                    $scope.endDate = fDate;
                    break;
                case "six":
                    var fromDate = new Date();
                    var fyear = fromDate.getFullYear();
                    var fDate = (fromDate.getMonth() + 2) + '/' + fyear;
                    console.log(fDate)
                    var preDate = new Date(fromDate);
                    preDate.setMonth(fromDate.getMonth() - 5);
                    var pyear = preDate.getFullYear();
                    var pDate = (preDate.getMonth() + 1) + '/' + pyear;
                    $scope.startDate = pDate;
                    $scope.endDate = fDate;
                    break;
                case "twelve":
                    var fromDate = new Date();
                    var fyear = fromDate.getFullYear();
                    var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
                    console.log(fDate)
                    var preDate = new Date(fromDate);
                    preDate.setMonth(fromDate.getMonth() - 11);
                    var pyear = preDate.getFullYear();
                    var pDate = (preDate.getMonth() + 1) + '/' + pyear;
                    $scope.startDate = pDate;
                    $scope.endDate = fDate;
                    break;
                default:
                    break;
            }

            $scope.clearMessages();
            var strDt = $scope.startDate.split("/");
            var endDt = $scope.endDate.split("/");
            console.log(strDt[1]);
            console.log(endDt[1]);
            var date_1 = new Date(strDt[1], parseInt(strDt[0]) - 1);
            var date_2 = new Date(endDt[1], parseInt(endDt[0]) - 1);
            var monthCol = "";
           // $scope.isValidDate = false;
            if (date_1 != "Invalid Date" && date_2 != "Invalid Date") {
                if (date_2 >= date_1) {
                    $scope.monthCol = months($scope.startDate, $scope.endDate);
                    //$scope.isValidDate = true;
                } else {
                    $scope.errorMsg = "Please select a valid date range."
                    // return;
                }
            }
            console.log($scope.monthCol);
            $scope.ShowSpinnerStatus = true;
            
                allocationService.getAllAllocationByYear(strDt[1], endDt[1], $scope.region).then(function (allocation) {
                    //console.log("hiiiiii"+allocation.data);
                    listRecords($scope, $filter, $scope.project, allocation.data, $scope.monthCol, $scope.selectProject, $scope.resTypeSelect);
                }).catch(function (err) {
                    console.log(err);
                });
            
            
            // if ($scope.errorMsg == null) {
            //     $scope.clearFields();
            //     $('#submit').attr('disabled', false);
            // }

        }

        $scope.clearMessages = function () {
            $scope.successMsg = "";
            $scope.errorMsg = "";
            //$scope.hidden = "none";

            $scope.listData = [];
            $scope.totalMonthWise = [];
            $scope.totalMonthWise = [];
        }

        $scope.clearFields = function () {
            $('#resource-select').multiselect('clearSelection');
            $('#resource-select').multiselect('refresh');
            $('#rangeSelect').prop('disabled', false);
            $('#resource-select').multiselect('selectAll', false);
            $('#resource-select').multiselect('updateButtonText');
            $scope.clearMessages();
            $scope.resource = [];

            $scope.rangeSelect='six';
            $scope.startDate = '';
            $scope.endDate = '';
            $scope.selectProject = 'ALL';
            $scope.resTypeSelect = 'ALL';
            $scope.resource = '';
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
            $scope.errorMsg = "";
            // $scope.hidden = "none";
        }

    }



    function listRecords($scope, $filter, projectList, allocationList, monthCol, selectProject, resTypeSelect) {
        //console.log(monthCol);
        var allocFilter = [];
        $scope.listData = [];
        var len = monthCol.length + 1;
        var allocFilter = [];
        var duplicateCheck = new Array();

        $scope.totalMonthWise = new Array(len);
        $scope.totalMonthWise.fill(0, 0, len);

        console.log($scope.resource);

        angular.forEach($scope.resource, function (resource) {

            //  if (project.projectname === selectProject || selectProject === 'ALL') {  // This is second check sometimes it get same project with start name . Ex- it picks "CSDR" and "CSDR Settlement"

            // allocFilter = $filter('filter')(allocationList, { project: project.projectname });

            angular.forEach(allocationList, function (alloc) {
                if (alloc.project === selectProject || selectProject === 'ALL') {
                    allocFilter.push(alloc);
                }
            });

            if (resTypeSelect !== 'ALL') {
                allocFilter = $filter('filter')(allocFilter, { resourcetype: resTypeSelect });
            }
           
            allocFilter = $filter('filter')(allocFilter, { resource: resource });
        
            console.log(allocFilter);


            angular.forEach(allocFilter, function (allocation) {
                var totalResourceWise = 0;
                var filterResourceWiseAllocation = [];
                var vResource = null;
                var vDcheck = "";

                var monthWise = new Array(monthCol.length);
                monthWise.fill(0, 0, monthWise.length);

                vDcheck = project.projectname + "-" + resource;
                console.log("vDcheck" + vDcheck);
                if (duplicateCheck.indexOf(vDcheck) < 0) {

                    //filterResourceWiseAllocation = $filter('filter')(allocFilter, { resource: resource });
                    //console.log(filterResourceWiseAllocation);


                    console.log(monthWise + "--" + monthCol);

                    angular.forEach(allocFilter, function (allAlloc) {
                        angular.forEach(allAlloc.allocation, function (alloc) {
                            //console.log(alloc);
                            if (monthCol.indexOf(alloc.month) >= 0) { // check if months equal to the predefined month array(user selected)
                                var indx = monthCol.indexOf(alloc.month);
                                var value = monthWise[indx];

                                if (!isNaN(alloc.value)) {
                                    var _lv = round(parseFloat(value) + parseFloat(alloc.value), 1);
                                    monthWise[indx] = _lv;
                                    //  console.log(parseFloat($scope.totalMonthWise[indx]) + "<><><>" + parseFloat(alloc.value));
                                    $scope.totalMonthWise[indx] = round((parseFloat($scope.totalMonthWise[indx]) + parseFloat(alloc.value)), 1);
                                    totalResourceWise += round(parseFloat(alloc.value), 1);
                                }
                            }
                        });

                        var destinationArray = Array.from(monthWise);
                        $scope.listData.push({ project: allAlloc.project, resource: resource, resType: allocation.resourcetype, allocation: destinationArray, total: round(totalResourceWise, 1) });
                        console.log($scope.listData);
                        totalResourceWise = 0;
                        monthWise.fill(0, 0, monthWise.length);
                        duplicateCheck.push(vDcheck); // resource and project should be once count
                    });

                }
            });
            // }
        });

        var total = 0;
        for (var i = 0; i < $scope.totalMonthWise.length; i++) {
            total += $scope.totalMonthWise[i];

        }

        $scope.totalMonthWise[len - 1] = round(total, 1);

        $scope.ShowSpinnerStatus = false;
        var spinner = document.getElementById("spinner");
        if (spinner.style.display != "none") {
            spinner.style.display = "none";

        }
    }




    function checkmonth(index) {
        var currentMonth = new Date().getMonth();
        return index < currentMonth;
    }

    function intialize(projectService, resourceService, resourceTypeService, allocationService, $scope, $filter) {
        // if ($scope.startDate === '' || $scope.endDate === '' || $scope.startDate === undefined || $scope.endDate === undefined) {  
        // var today = new Date(); 
        // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        // var yyyy = today.getFullYear();

        // today = mm + '/'  + yyyy;
        // $scope.startDate = today;
        // $scope.endDate = today;

        // }

        projectService.getProject($scope.region).then(function (res) {
            $scope.project = res.data;
            resourceService.getResources($scope.region).then(function (res) {
                $scope.mappedResourceData = res.data;
                var htm = '';
                angular.forEach($scope.mappedResourceData, function (item) {
                    if (item.resourcename !== 'Admin') {
                        htm += '<option>' + item.resourcename + '</option>';
                        $scope.resource.push(item.resourcename);
                    }
                    // if(item.resourcename===''||item.resourcename===undefined){
                    //     item.resourcename='All'
                    //     console.log(All);
                    // }
                });
                $('#resource-select').empty();
                $('#resource-select').append(htm);
                $('#resource-select').multiselect('rebuild');
                $('#resource-select').multiselect('selectAll', false);
                $('#resource-select').multiselect('updateButtonText');
                
                resourceTypeService.getResourceType().then(function (res) {
                    $scope.resourceType = res.data;
                })
                var fromDate = new Date();
                var fyear = fromDate.getFullYear();
                var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
                console.log(fDate)
                var preDate = new Date(fromDate);
                preDate.setMonth(fromDate.getMonth() - 5);
                var pyear = preDate.getFullYear();
                var pDate = (preDate.getMonth() + 1) + '/' + pyear;

                console.log(preDate + pyear + pDate);

                var monthCol = "";
                $scope.monthCol = months(pDate, fDate);
                console.log(monthCol);
                allocationService.getAllAllocationByYear(pyear, fyear, $scope.region).then(function (allocation) {
                    console.log(allocation.data);
                    listRecord($scope, $filter, allocation.data, $scope.monthCol);
                })

            }).catch(function (err) {
                console.log(err);
            });

        }).catch(function (err) {
            console.log(err);
        });
    }

    function listRecord($scope, $filter, allocationList, monthCol) {
        $scope.listData = [];
        var len = monthCol.length + 1;
        console.log(len);
        var totalResourceWise = 0;
        var filterResourceWiseAllocation = [];
        var monthWise = new Array(monthCol.length);
        monthWise.fill(0, 0, monthWise.length);

        $scope.totalMonthWise = new Array(len);
        $scope.totalMonthWise.fill(0, 0, len);
        angular.forEach(allocationList, function (allocation) {

            //  console.log( monthWise);
            angular.forEach(allocation.allocation, function (alloc) {
                if (monthCol.indexOf(alloc.month) >= 0) {
                    var indx = monthCol.indexOf(alloc.month);
                    var value = monthWise[indx];
                    if (!isNaN(alloc.value)) {
                        var _lv = round(parseFloat(value) + parseFloat(alloc.value), 1);
                        monthWise[indx] = _lv;
                        //  console.log(parseFloat($scope.totalMonthWise[indx]) + "<><><>" + parseFloat(alloc.value));
                        $scope.totalMonthWise[indx] = round((parseFloat($scope.totalMonthWise[indx]) + parseFloat(alloc.value)), 1);
                        totalResourceWise += round(parseFloat(alloc.value), 1);
                    }

                }
            });
            var destinationArray = Array.from(monthWise);
            $scope.listData.push({ project: allocation.project, resource: allocation.resource, resType: allocation.resourcetype, allocation: destinationArray, total: round(totalResourceWise, 1) });
            totalResourceWise = 0;
            monthWise.fill(0, 0, monthWise.length);
        });
        var total = 0;
        for (var i = 0; i < $scope.totalMonthWise.length; i++) {
            total += $scope.totalMonthWise[i];

        }

        $scope.totalMonthWise[len - 1] = round(total, 1);

    }

    function filterUniqueResource(collection) {
        var output = [], item;
        for (var col = 0; col < collection.length; col++) {
            item = collection[col];
            if (output.indexOf(item.mappedResource.resourcename) <= -1) {
                output.push(item.mappedResource.resourcename);
            }
        }
        return output;

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

    function openDialog() {
        $('#confirmModal').modal('show');
    }

    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

})();



