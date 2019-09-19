(function () {

    var app = angular.module('pmoApp');

    app.service('resourceInfoSharingService', function () {
        var resourceSelect = "";
        var region = "";
        var location = "";
        var mappingPercent = "";
        var mappingType = "";
        var topRowEvent = null;
        var topRowSelect = 0;
        var parentScope = null;
        var resource = null;

    });

    app.controller('allocationCtrl', Controller);

    Controller.$inject = ['$rootScope', '$scope', '$window', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceService', 'resourceInfoSharingService'];

    function Controller($rootScope, $scope, $window, DTOptionsBuilder, DTColumnBuilder, $compile, resourceService, resourceInfoSharingService) {

        $scope.resource = [];

        $scope.region = $window.localStorage.getItem("region");
        resourceInfoSharingService.parentScope = $scope; // keep use in child page to navigate the childinfo method.

        getResourceData($scope, resourceService); 


        ///////////////////////// start Datatable Code /////////////////////////////////
        $scope.previousRowSelect = null; //point reference which row selected previously
        $scope.previousRow = -1;
        $scope.vm = {};
        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);


        $scope.childInfo = function (resource, listIndex, event, updateTable) {

            resourceInfoSharingService.topRowEvent = event;
            resourceInfoSharingService.topRowSelect = listIndex;
            resourceInfoSharingService.resource = resource;

            if ($scope.previousRowSelect !== null && listIndex != $scope.previousRow) {
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
            $scope.previousRow = listIndex;


            resourceInfoSharingService.resourceSelect = resource.resourcename;
            resourceInfoSharingService.regionSelect = resource.region;
            resourceInfoSharingService.location = resource.baseentity;
            resourceInfoSharingService.mappingPercent = resource.taggedP;
            resourceInfoSharingService.mappingType = resource.resourceType;
            console.log( resourceInfoSharingService.regionSelect);

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
