(function () {

    var app = angular.module('pmoApp');

    app.service('allocationSharingService', function () {
        var resourceSelect = "";
        var region = "";
        var allocationList;

    });

    app.controller('allocationCtrl', Controller);


    Controller.$inject = ['$rootScope', '$scope', '$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceService', 'allocationSharingService'];

    function Controller($rootScope, $scope, $window, DTOptionsBuilder, DTColumnBuilder, $compile, resourceService, allocationSharingService) {

        $scope.resource = [];

        $scope.region = $window.localStorage.getItem("region");

        getResourceData($scope, resourceService);


        ///////////////////////// start Datatable Code /////////////////////////////////
        $scope.previousRowSelect = null; //point reference which row selected previously
        $scope.previousRow = -1;
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);


        $scope.childInfo = function (resource, region, listIndex, event, updateTable) {

            if ($scope.previousRowSelect !== null && listIndex != $scope.previousRow ) {
                var link = angular.element($scope.previousRowSelect.currentTarget),
                    icon = link.find('.glyphicon'),
                    tr = link.parent().parent(),
                    table = $scope.vm.dtInstance.DataTable,
                    row = table.row(tr);

                icon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                row.child.hide();
                tr.removeClass('shown');
            }

            $scope.previousRowSelect = event;
            $scope.previousRow= listIndex;

            allocationSharingService.resourceSelect = resource;
            allocationSharingService.regionSelect = region;

            var scope = $scope.$new(true);
            var link = angular.element(event.currentTarget),
                icon = link.find('.glyphicon'),
                tr = link.parent().parent(),
                table = $scope.vm.dtInstance.DataTable,
                row = table.row(tr);

            //var leaves = $filter('filter')($scope.leaveList, { resourcename: resource });
            //var holidays = $filter('filter')($scope.holidayList, { year: year, locationname: location });

            var childShown = false;
            if (updateTable == null)
                childShown = row.child.isShown();


            if (updateTable) {
                row.child($compile('<div tmpl class="clearfix"></div>')(scope)).show();

            } else {
                if (row.child.isShown()) {
                    icon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    icon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    row.child($compile('<div tmpl class="clearfix"></div>')(scope)).show();
                    tr.addClass('shown');
                }
            }

        }


    }



    function getResourceData($scope, resourceService) {
        //$scope.ShowSpinnerStatus = false;
        resourceService.getResources($scope.region).then(function (res) {
            $scope.ShowSpinnerStatus = false;
            var spinner = document.getElementById("spinner");
            if (spinner.style.display != "none") {
                spinner.style.display = "none";
            }

            $scope.resourceData = res.data;

        }).catch(function (err) {
            console.log(err);
        });
    }



})();
