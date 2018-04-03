(function () {
    'use strict';

    angular.module('pmoApp').controller('hcresourceCtrl', Controller);

    Controller.$inject = ['$scope', '$rootScope', 'resourceService', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$window'];

    function Controller($scope, $rootScope, resourceService, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $window) {
        $scope.hcResource = [];

        var app = $scope;

        getResourceData(resourceService, $scope);


        $scope.clearFields = function () {

            $scope.resource = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = ""
        }

        $scope.deleteConfirmation = function (id, name) {
            $scope.msg = name;
            $scope.deletedID = id;
                openDialog();
            //console.log($scope.deletedID);

        }

        $scope.cancel = function (event) {
            $scope.msg = "";
            $scope.deletedID = "";
        }

        $scope.delete = function (event) {
            //if (confirm('Are you sure to delete?')) {
            resourceService.deleteHcResource($scope.deletedID).then(function (res) {
                if (res.data == "deleted") {
                    getResourceData(resourceService, $scope);
                    app.loading = false;
                    app.successMsg = "Resource Deleted successfully";
                    app.errorMsg = false;
                    $scope.msg = "";
                    $scope.deletedID = "";
                }
            }).catch(function (err) {
                console.log(err);
            });
            //}
        };

        //==========filtering gad and nongad resources data=======////
        $scope.gadResource = [];

        $scope.getData = function (department) {
            if (department === 'FS') {
                $scope.gadResource = $filter('filter')($scope.hcResource, { Dept: 'FS' });
                console.log($scope.gadResource);
            }
            else if (department === 'Non-Fs') {
                $scope.gadResource = $filter('filter')($scope.hcResource, { Dept: 'Non-Fs' });
                console.log($scope.gadResource);
            }
            else {
                $scope.gadResource = $scope.hcResource;
            }
        }
 
        //=========================Data table==========================//
        $scope.vm = {};

        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);

        $scope.childInfo = function (kin, yearSelect, event) {
            //console.log(kin);

            var scope = $scope.$new(true);
            scope.records = $filter('filter')($scope.hcResource, { KIN: kin });

            console.log(scope.records);

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
                row.child($compile('<div hcresource-child-directive class="clearfix"></div>')(scope)).show();
                tr.addClass('shown');
            }
        }

        // var lang = {
        //     "decimal":        "",
        //     "emptyTable":     "No data available in table",
        //     "info":           "Showing _START_ to _END_ of _TOTAL_ entries",
        //     "infoEmpty":      "Showing 0 to 0 of 0 entries",
        //     "infoFiltered":   "(filtered from _MAX_ total entries)",
        //     "infoPostFix":    "",
        //     "thousands":      ",",
        //     "lengthMenu":     "Show _MENU_ entries",
        //     "loadingRecords": "Loading...",
        //     "processing":     "Processing...",
        //     "search":         "Search:",
        //     "zeroRecords":    "No matching records found",
        //     "paginate": {
        //         "first":      "First",
        //         "last":       "Last",
        //         "next":       "Next",
        //         "previous":   "Previous",                
        //     },
        //     "aria": {
        //         "sortAscending":  ": activate to sort column ascending",
        //         "sortDescending": ": activate to sort column descending"
        //     }
        // }

        // $scope.vm.dtOptions.withDOM('Bfrtip');

        // $scope.vm.dtOptions.withOption('buttons',['copy', 'print', 'pdf','excel'/*,
        //     {
        //         text: 'Export to Excel',
        //         action: function ( e, dt, node, config ) {
        //             $scope.exportToExcel();
        //         }
        //     }*/]);

        // $scope.vm.dtOptions.withOption('language', lang);


        /*$scope.vm.dtOptions.withOption('drawCallback', function() {
                 angular.element('.paginate_button.first').on('click', function() { alert('first')} )
                angular.element('.paginate_button.next').on('click', function() { alert('next')} )             
        })*/



        //=============================================================//

        $scope.exportToExcel = function () {
            resourceService.getExportToExcelData().then(function (res) {
                var byteCharacters = $window.atob(res.data);
                var byteArrays = [];
                var contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                var sliceSize = sliceSize || 512;
                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                var blob = new Blob(byteArrays, { type: contentType });
                var blobUrl = URL.createObjectURL(blob);
                $window.location = blobUrl;
                //$window.open(blob);

            }).catch(function (err) {
                console.log(err);
            });

        }
    }

    function getResourceData(resourceService, $scope) {
        resourceService.getHCResources().then(function (res) {
            $scope.hcResource = res.data;
            $scope.gadResource = res.data;

        }).catch(function (err) {
            console.log(err);
        });
    }

    function openDialog() {
        $('#confirmModal').modal('show');
    }

})();