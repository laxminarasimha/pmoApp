(function () {
    'use strict';

    angular.module('pmoApp').controller('resourceCtrl', Controller);

    Controller.$inject = ['$scope', '$rootScope','$window', 'resourceService', 'designationService',  'allocationService', 'DTOptionsBuilder', 'DTColumnBuilder', 'skillSetService', 'locationService', 'roleService','regionService','resourceTypeService'];

    function Controller($scope, $rootScope,$window, resourceService, designationService,  allocationService, DTOptionsBuilder, DTColumnBuilder, skillSetService, locationService, roleService, regionService, resourceTypeService ) {
        $scope.mongoResourceData = [];
        $scope.startDate;
        $scope.endDate;
        $scope.months = [];
        var app = $scope;

         $scope.resource = {
            alias: "",
            baseentity: "",
            designation: "",
            email: "",
            kinId: "",
            password: "",
            region: "",
            resourceType: "",
            resourcename: "",
            role: "",
            taggedP: 100
        }
        $scope.region = $window.localStorage.getItem("region");

        $rootScope.Title = "Resource Listing";
        getResourceData(resourceService, $scope);

        $scope.designationList = [];
        getDesignationData(designationService, $scope);


        $scope.skillSetList = [];
        getSkillSetData(skillSetService, $scope);


        $scope.locationList = [];
        getLocationData(locationService, $scope);


        $scope.roleList = [];
        $scope.kinID = 0;
        getRoleData(roleService, $scope);
        $scope.resourceName="";
        $scope.allocationData=[];
        $scope.regionList = [];
        getRegionData(regionService, $scope);
        
        $scope.resourceTypeList = [];
        getResourceTypeData(resourceTypeService, $scope);
        // $scope.resourceTypeList = [];
        // getResourceTypeData(resourceTypeService, $scope);

        // $scope.resourcemapList = [];
        //deleteResourcemapData(resourceMappingService,$scope);

        //  $scope.allocationList = [];
        //  deleteAllocationData(allocationService,$scope);


        //sendEmail(resourceService,null);

        $scope.clearFields = function () {
            $('input[type=checkbox]').prop('checked',false);
            $scope.resource = {};
            app.loading = false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
            $scope.resource.taggedP=100
    
        }

        $scope.deleteConfirmation = function (id, name, kinId, rname) {
            $scope.msg = name;
            $scope.deletedID = id;
            $scope.kinID = kinId;
            $scope.rName = rname;
            openDialog();

        }
        $scope.validateInput = function (obj, taggedP) {
            console.log(taggedP);
            if (taggedP > 100) {
                alert("Mapped should not exceed 100%");
                return false;
            }
        };

        $scope.cancel = function (event) {
            $scope.msg = "";
            $scope.deletedID = "";
        }

        $scope.delete = function (event) {
            //if (confirm('Are you sure to delete?')) {
            resourceService.deleteResource($scope.deletedID).then(function (res) {
                console.log($scope.deletedID);
                if (res.data == "deleted") {
                    console.log($scope.kinID);
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


        }


        $scope.editResource = function (id) {
            $rootScope.Title = "Edit Resource";
            resourceService.getResourceForID(id).then(function (res) {
                $scope.resource = res.data;
                $scope.resourceName= res.data.resourcename;
                console.log(res.data.resourcename);
            }).catch(function (err) {
                console.log(err);
            });

        };
       
$scope.alert= function ( ){
    var str= $scope.resource.resourcename;
 
    if(str.startsWith('admin')){
        app.successMsg = "";
    }else{
        app.errorMsg ="name should start with admin";
       
    }
}
        $scope.saveData = function (resource) {
            console.log(resource);
            if ($scope.resourceForm.$valid) {
                resourceService.updateResource(resource).then(function (res) {
                    console.log(res.data);
                    if (res.data == "updated") {
                        allocationService.getAlloctionForResource($scope.resourceName).then(function(res){
                             console.log(res.data);
                    angular.forEach(res.data,function(item){
                        console.log(item);
                       item.resource=resource.resourcename;
                         allocationService.updateAllocation(item).then(function(res){
                           console.log(res.data);
                           if(res.data=="updated"){
                              console.log("record updated");
                             }
                        })
                         })
                    })
                        //$scope.allocationData= res.data;
                        //console.log($scope.allocationData);
                        
                        getResourceData(resourceService, $scope);
                       // console.log(resourceService);
                        $scope.resource = {};
                        app.loading = false;
                        app.successMsg = "Resource Updated successfully";
                        app.errorMsg = false;
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            }


        };

        $scope.createResource = function (resource) {
            console.log(resource);
            $rootScope.Title = "Create Resource";
            $scope.IsSubmit = true;
            if ($scope.resourceForm.$valid) {
                app.loading = true;
                //Password = "default";
                //$scope.resource.password = '$2a$10$z14k1dcNp7nPmB1s.ApNNe4NLYu.UbKd1lKcgARc3fDTeoPW9GlAC';
                $scope.resource.password = "default";
                resourceService.getResourceForKinId($scope.resource.kinId).then(function (res) {
                    if (res.data.length == 0) {
                        resourceService.createResource(resource).then(function (res) {
                            console.log(resource);
                            if (res.data == "created") {
                                getResourceData(resourceService, $scope);
                                console.log(resourceService);
                                $scope.resource = {};
                                app.loading = false;
                                app.successMsg = "Resource created successfully";
                                app.errorMsg = false;
                                $scope.resource.taggedP=100;
                                //sendEmail(resourceService,resource);
                            }
                        }).catch(function (err) {
                            console.log(err);
                            app.loading = false;
                            app.errorMsg = "Error in creation";
                            app.successMsg = false;
                            app.errorClass = "error";
                        });
                    } else if (res.data.length > 0) {
                        app.loading = false;
                        app.errorMsg = "Resource already exist";
                        app.successMsg = false;
                        app.errorClass = "error";
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

    };

    function sendEmail(resourceService, resource) {
        resourceService.sendEmailToResource(resource).then(function (res) {
            //$scope.mongoResourceData = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getResourceData(resourceService, $scope) {
        resourceService.getResources($scope.region).then(function (res) {
            $scope.mongoResourceData = res.data;
        }).catch(function (err) {
            console.log(err);
        });
    }

    function getDesignationData(designationService, $scope) {
        designationService.getDesignations().then(function (res) {
            $scope.designationList = res.data;
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

    function getLocationData(locationService, $scope) {
        locationService.getLocation().then(function (res) {
            $scope.locationList = res.data;
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
    
    function getRegionData(regionService, $scope) {
        regionService.getRegion().then(function (res) {
            $scope.regionList = res.data;
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

    //  function deleteAllocationData(allocationService,$scope){
    //     allocationService.deleteAllocation().then(function(res){
    //         $scope.allocationList = res.data;
    //         console.log(res.data);
    //     }).catch(function(err){
    //         console.log(err);
    //     });
    //  }


    function openDialog() {
        $('#confirmModal').modal('show');
    }

})();