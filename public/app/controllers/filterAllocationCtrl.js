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




    Controller.$inject = ['$scope', '$compile', 'DTOptionsBuilder', 'DTColumnBuilder', 'resourceService', 'projectService', 'allocationService', 'leaveService', 'resourceMappingService', '$filter', 'availableDaysService', 'holidayListService'];

    function Controller($scope, $compile, DTOptionsBuilder, DTColumnBuilder, resourceService, projectService, allocationService, leaveService, resourceMappingService, $filter, availableDaysService, holidayListService) {

        $scope.projectSelect = "ALL";
        //$scope.resourceWiseAllocaiton = [];
        $scope.startDate;
        $scope.endDate;
        $scope.monthCol = [];
        $scope.allocationList = [];
        $scope.ShowSpinnerStatus = false;

        $scope.project = [];
        $scope.listData = [];
        $scope.selectProject = 'ALL';


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
        getProjectData(projectService, $scope);


        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons', ['print', 'pdf', 'excel']);



        $scope.filterSeach = function () {

            if ($scope.startDate === '' || $scope.endDate === '' || $scope.startDate === undefined || $scope.endDate === undefined) {
                $scope.errorMsg = "Please select a valid date range."
                return;
            }

            $scope.clearMessages();

            var strDt = $scope.startDate.split("/");
            var endDt = $scope.endDate.split("/");

            var date_1 = new Date(strDt[1], parseInt(strDt[0]) - 1);
            var date_2 = new Date(endDt[1], parseInt(endDt[0]) - 1);
            var monthCol = "";

            if (date_1 != "Invalid Date" && date_2 != "Invalid Date") {
                if (date_2 >= date_1) {
                    $scope.monthCol = months($scope.startDate, $scope.endDate);
                } else {
                    $scope.errorMsg = "Please select a valid date range."
                    return;
                }
            }

            $scope.ShowSpinnerStatus = true;

            allocationService.getAllAllocationByYear(strDt[1], endDt[1], 'ALL').then(function (allocation) {
                listRecords($scope, $filter, $scope.project, allocation.data, $scope.monthCol, $scope.selectProject);
            }).catch(function (err) {
                console.log(err);
            });

        }

        $scope.clearMessages = function () {
            $scope.successMsg = "";
            $scope.errorMsg = "";
            //$scope.hidden = "none";

            $scope.listData = [];
            $scope.totalMonthWise = [];
            $scope.totalMonthWise =[];
        }

    }

    function listRecords($scope, $filter, projectList, allocationList, monthCol, selectProject) {

        var allocFilter = [];
        $scope.listData = [];
        var len = monthCol.length + 1;

        $scope.totalMonthWise = new Array(len);
        $scope.totalMonthWise.fill(0, 0,len);

        if (selectProject !== 'ALL')
            projectList = $filter('filter')(projectList, { projectname: selectProject });


        angular.forEach(projectList, function (project) {

            allocFilter = $filter('filter')(allocationList, { project: project.projectname });

            angular.forEach(allocFilter, function (allocation) {
                var totalResourceWise = 0;
                var filterResourceWiseAllocation = $filter('filter')(allocFilter, { resource: allocation.resource });

                var monthWise = new Array(monthCol.length);
                monthWise.fill(0, 0, monthWise.length);

                angular.forEach(filterResourceWiseAllocation, function (allAlloc) {
                    angular.forEach(allAlloc.allocation, function (alloc) {
                        if (monthCol.indexOf(alloc.month) >= 0) { // check if months equal to the predefined month array(user selected)
                            var indx = monthCol.indexOf(alloc.month);
                            var value = monthWise[indx];
                            if (!isNaN(alloc.value)) {
                                var value = parseInt(value) + parseInt(alloc.value);
                                monthWise[indx] = value;
                                $scope.totalMonthWise[indx] += value;
                                totalResourceWise += value;
                            }

                        }
                    });

                });
                $scope.listData.push({ project: project.projectname, resource: allocation.resource, allocation: monthWise, total: totalResourceWise });
            });
        });

        var total = 0;   
        for(var i=0;i<$scope.totalMonthWise.length;i++){
            total += $scope.totalMonthWise[i];
        }
        $scope.totalMonthWise[len-1] = total;

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


    function getProjectData(projectService, $scope) {
        projectService.getProject().then(function (res) {
            $scope.project = res.data;

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

})();

