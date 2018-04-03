(function () {

    'use strict';

    angular.module('pmoApp').controller('slaUploadCtrl', Controller);

    Controller.$inject = ['$scope', '$rootScope', 'Upload', '$window', 'globalConfig', '$http', 'projectSLAService', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter'];

    function Controller($scope, $rootScope, Upload, $window, globalConfig, $http, projectSLAService, DTOptionsBuilder, DTColumnBuilder, $compile, $filter) {

        $scope.mongoStatusData = [];
        $scope.slaReport = [];

        var app = $scope;

        getResourceData(projectSLAService, $scope);
        $scope.excelData = "";
        $scope.visible = false;


        //getExcelData(globalConfig,$http,$scope);
        $scope.fileSelected = function (files) {
            $scope.excelData = '';
            $scope.visible = false;
            if (files && files.length) {
                $scope.myFile = files[0];
            }
        }

        $scope.submit = function () {
            $scope.report = "slaReport";
            if (!$scope.report) {
                alert("Please choose the file type");
            } else {
                if ($scope.myFile) {
                    $scope.upload($scope.myFile);
                }
            }

        }

        $scope.upload = function (file) {
            Upload.upload({
                url: globalConfig.apiAddress + '/uploadDataFile/' + $scope.report,
                file: file
            }).then(function (res) {
                console.log(res.data.data);
                //$scope.excelData = res.data.data;
                getResourceData(projectSLAService, $scope)
                $scope.visible = true;

            });
        };

        $scope.clearFields = function () {

            $scope.resource = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = ""
        }

        /*$scope.deleteConfirmation = function (id, roadmap,name) {
            $scope.msgOne = roadmap;
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
            resourceService.deleteSlaResource($scope.deletedID).then(function (res) {
                if (res.data == "deleted") {
                    getResourceData(projectSLAService, $scope);
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
        };*/
        $scope.vm = {};


        $scope.vm.dtInstance = null;
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);

        var lang = {
            "decimal": "",
            "emptyTable": "No data available in table",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries",
            "infoEmpty": "Showing 0 to 0 of 0 entries",
            "infoFiltered": "(filtered from _MAX_ total entries)",
            "infoPostFix": "", 
            "thousands": ",",
            "lengthMenu": "Show _MENU_ entries",
            "loadingRecords": "Loading...",
            "processing": "Processing...",
            "search": "Search:",
            "zeroRecords": "No matching records found",
            "paginate": {
                "first": "First",
                "last": "Last",
                "next": "Next",
                "previous": "Previous",
            },
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            }
        }
        $scope.vm.dtOptions.withDOM('Bfrtip');

        $scope.vm.dtOptions.withOption('buttons', ['copy', 'print', 'pdf', 'excel'/*,
               {
                   text: 'Export to Excel',
                   action: function ( e, dt, node, config ) {
                       $scope.exportToExcel();
                   }
               }*/]);

        $scope.vm.dtOptions.withOption('language', lang);


        $scope.childInfo = function (id, event, edit) {

            var scope = $scope.$new(true);
            scope.records = $filter('filter')($scope.slaReport, { _id: id });
            app.successMsg = "";

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
                row.child($compile('<div slareport-child-directive class="clearfix"></div>')(scope)).show();
                tr.addClass('shown');
            }
        }

        /*  $scope.exportToExcel = function () {
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
  
          }*/

        $scope.updateRecord = function (objId) {
            angular.forEach($scope.slaReport, function (item) {
                if (item._id == objId) {
                    projectSLAService.updateSlaResource(item).then(function (res) {
                        if (res.data == "updated") {
                            console.log('updated');
                            app.loading = false;
                            app.successMsg = "Record saved successfully";
                            app.errorMsg = false;

                        }
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

            });
            // angular.forEach($scope.allocationList, function (item) {
            // 	if (item.resource === resource && item.year === year) {
            // 		allocationService.updateAllocation(item).then(function (res) {
            // 			if (res.data == "updated") {
            // 				console.log('updated');
            // 			}
            // 		}).catch(function (err) {
            // 			console.log(err);
            // 		});
            // 	}
            // });

            //$scope.childInfo(resource, year, loc, rowIndex, event, true);
        }
    }

    function getResourceData(projectSLAService, $scope) {
        projectSLAService.getSlaResources().then(function (res) {
            $scope.slaReport = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function openDialog() {
        $('#confirmModal').modal('show');
    }

})();
