(function () {
    'use strict';

    angular.module('pmoApp').controller('holidayListCtrl', Controller);

    Controller.$inject = ['$scope', '$rootScope', 'holidayListService', 'regionService', 'DTOptionsBuilder', 'DTColumnBuilder', '$filter'];

    function Controller($scope, $rootScope, holidayListService, regionService, DTOptionsBuilder, DTColumnBuilder, $filter) {
        $scope.mongoHolidayData = [];
        $scope.regionList = [];
        var app = $scope;

        $rootScope.Title = "Holiday Listing";
        getRegionData(regionService, $scope);
        getHolidayData(holidayListService, $scope);


        $scope.clearFields = function () {

            $scope.holiday = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
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

        $scope.delete = function (event) {
            //if (confirm('Are you sure to delete?')) {
            holidayListService.deleteHoliday($scope.deletedID).then(function (res) {
                if (res.data == "deleted") {
                    getHolidayData(holidayListService, $scope);
                    app.loading = false;
                    app.successMsg = "Holiday Deleted successfully";
                    app.errorMsg = false;
                    $scope.msg = "";
                    $scope.deletedID = "";
                }
            }).catch(function (err) {
                console.log(err);
            });
            //}
        };

        $scope.editHoliday = function (id) {
            $rootScope.Title = "Edit Holiday";
            holidayListService.getHolidayForID(id).then(function (res) {
                res.data.holidayDate = $filter('date')(new Date(res.data.holidayDate), 'dd-MMM-yy');
                $scope.holiday = res.data;
            }).catch(function (err) {
                console.log(err);
            });

        };

        $scope.saveData = function (holiday) {
            if ($scope.holidayForm.$valid) {
                var years = new Date(holiday.holidayDate).getFullYear();
                holiday.year = years;
                holidayListService.updateHoliday(holiday).then(function (res) {
                    if (res.data == "updated") {
                        getHolidayData(holidayListService, $scope);
                        $scope.holiday = {};
                        app.loading = false;
                        app.successMsg = "Holiday Updated successfully";
                        app.errorMsg = false;
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            }
        };

        $scope.createHoliday = function (holiday) {
            $rootScope.Title = "Create Holiday";
            $scope.IsSubmit = true;
            if ($scope.holidayForm.$valid) {
                var years = new Date(holiday.holidayDate).getFullYear();
                holiday.year = years;
                holidayListService.createHoliday(holiday).then(function (res) {
                    if (res.data == "created") {
                        getHolidayData(holidayListService, $scope);
                        $scope.holiday = {};
                        app.loading = false;
                        app.successMsg = "Holiday created successfully";
                        app.errorMsg = false;
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            } else {
                app.loading = false;
                app.successMsg = false;
                app.errorMsg = "Please Enter Required value";
                app.errorClass = "error"
            }

        }

        //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons',['copy', 'print', 'pdf','excel']);

        //=============================================================//

    }

    function getHolidayData(holidayListService, $scope) {
        holidayListService.getHolidays().then(function (res) {
            $scope.mongoHolidayData = res.data;
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

    function openDialog() {
        $('#confirmModal').modal('show');
    }

})();