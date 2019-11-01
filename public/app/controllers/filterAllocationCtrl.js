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

    Controller.$inject = ['$rootScope', '$scope', '$window', '$compile', 'DTOptionsBuilder', 'DTColumnBuilder', 'resourceService', 'projectService', 'allocationService', 'resourceTypeService', 'leaveService', '$filter', 'availableDaysService', 'holidayListService'];

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

        intialize(allocationService, $scope);

       
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons', ['print', 'pdf', 'excel']);
        $scope.vm.dtOptions.withOption('lengthMenu', [10, 25, 50, "All"]);
        getProjectData(projectService, resourceService, resourceTypeService);
        $scope.selectDate = function () {
            $scope.rangeSelect = "";
            $('#rangeSelect').prop('disabled', true);
        }

        $scope.filterSeach = function () {


            switch ($scope.rangeSelect) {
                case "one":
                    var fromDate = new Date();
                    var fyear = fromDate.getFullYear();
                    var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
                    //  console.log(fDate)
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
                    // console.log(fDate)
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
                    // console.log(fDate)
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

            var date_1 = new Date(strDt[1], parseInt(strDt[0]) - 1);
            var date_2 = new Date(endDt[1], parseInt(endDt[0]) - 1);

            if (date_1 != "Invalid Date" && date_2 != "Invalid Date") {
                if (date_2 >= date_1) {
                    $scope.monthCol = months($scope.startDate, $scope.endDate);
                    getProjectData(projectService, resourceService, resourceTypeService);
                } else {
                    $scope.errorMsg = "Please select a valid date range."
                    // return;
                }
            }
            // console.log($scope.monthCol);
            $scope.ShowSpinnerStatus = true;

            allocationService.getAllAllocationByYear(strDt[1], endDt[1], $scope.region).then(function (allocation) {
              console.log(allocation.data);
                console.log($scope.project);
            //     console.log($scope.monthCol);
                listRecords($scope, $filter,$scope.project, allocation.data, $scope.monthCol, $scope.selectProject, $scope.resTypeSelect);
            }).catch(function (err) {
                console.log(err);
            });


        }

        $scope.clearMessages = function () {
            $scope.successMsg = "";
            $scope.errorMsg = "";
            //$scope.hidden = "none";
            $scope.monthCol = [];
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

            $scope.rangeSelect = 'six';
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

        function getProjectData(projectService, resourceService, resourceTypeService) {
            projectService.getProject($scope.region).then(function (res) {
                $scope.project = res.data;
               // console.log(res.data);
                resourceService.getResources($scope.region).then(function (res) {
                    $scope.mappedResourceData = res.data;
                    var htm = '';
                    angular.forEach($scope.mappedResourceData, function (item) {
                        if (item.resourcename !== 'Admin') {
                            htm += '<option>' + item.resourcename + '</option>';
                            $scope.resource.push(item.resourcename);
                        }

                    });
                    $('#resource-select').empty();
                    $('#resource-select').append(htm);
                    $('#resource-select').multiselect('rebuild');
                    $('#resource-select').multiselect('selectAll', false);
                    $('#resource-select').multiselect('updateButtonText');

                    resourceTypeService.getResourceType().then(function (res) {
                        $scope.resourceType = res.data;
                        
                    })
                }).catch(function (err) {
                    console.log(err);
                });
            }).catch(function (err) {
                console.log(err);
            });
        }
        function listRecords($scope, $filter,project, allocationList, monthCol, selectProject, resTypeSelect) {
       //console.log(project);
    //    console.log(selectProject);
    //    console.log(allocationList);
            var allocFilter = [];
            $scope.listData = [];
            var len = monthCol.length + 1;
            var allocFilter = [];
            var duplicateCheck = new Array();

            $scope.totalMonthWise = new Array(len);
            $scope.totalMonthWise.fill(0, 0, len);



            angular.forEach($scope.resource, function (resource) {

                angular.forEach(allocationList, function (alloc) {
                 
                    if (alloc.project === selectProject || selectProject === 'ALL') {
                      //  console.log(alloc);
                        allocFilter.push(alloc);
                       
                    //  allocFilter = $filter('filter')(allocFilter, {project:projectName})
                    //  console.log(project);
                    }
                });

                if (resTypeSelect !== 'ALL') {
                    allocFilter = $filter('filter')(allocFilter, { resourcetype: resTypeSelect });
                }

                allocFilter = $filter('filter')(allocFilter, { resource: resource });

              //console.log(allocFilter);


                angular.forEach(allocFilter, function (allocation) {
                    var totalResourceWise = 0;

                    var vDcheck = "";

                    var monthWise = new Array(monthCol.length);
                    monthWise.fill(0, 0, monthWise.length);

                    vDcheck = project.projectname + "-" + resource;
                   //  console.log(vDcheck);
                    if (duplicateCheck.indexOf(vDcheck) < 0) {
                        // console.log(monthWise + "--" + monthCol);
                        angular.forEach(allocFilter, function (allAlloc) {
                            angular.forEach(allAlloc.allocation, function (alloc) {
                           //     console.log(alloc);
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
                             // console.log(allAlloc.project);
                            $scope.listData.push({ project: allAlloc.project, resource: resource, resType: allocation.resourcetype, allocation: destinationArray, total: round(totalResourceWise, 1) });
                            //console.log($scope.listData);
                            totalResourceWise = 0;
                            monthWise.fill(0, 0, monthWise.length);
                            duplicateCheck.push(vDcheck); // resource and project should be once count
                        });

                    }
                });
                // }
            });

            console.log($scope.listData);

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
    }
    function intialize(allocationService, $scope, $filter) {

        var fromDate = new Date();
        var fyear = fromDate.getFullYear();
        var fDate = (fromDate.getMonth() + 1) + '/' + fyear;
        //  console.log(fDate)
        var preDate = new Date(fromDate);
        preDate.setMonth(fromDate.getMonth() - 5);
        var pyear = preDate.getFullYear();
        var pDate = (preDate.getMonth() + 1) + '/' + pyear;

        //  console.log(preDate + pyear + pDate);

        var monthCol = "";
        $scope.monthCol = months(pDate, fDate);
        //   console.log(monthCol);
        allocationService.getAllAllocationByYear(pyear, fyear, $scope.region).then(function (allocation) {
             console.log(allocation.data);
            listRecord($scope, $filter, allocation.data, $scope.monthCol);
        })




    }

    function listRecord($scope, $filter, allocationList, monthCol) {
        $scope.listData = [];
        var len = monthCol.length + 1;
        //  console.log(len);
        var totalResourceWise = 0;

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
            // console.log(allocation.project)
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



    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

})();
