
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('resourceMappingCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile','resourceMappingService','resourceService','roleService','locationService',
                       'regionService','skillSetService','statusService','resourceTypeService'];
  
 function Controller($scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, $compile, resourceMappingService,resourceService,roleService,locationService,
                        regionService,skillSetService,statusService,resourceTypeService) {

 //$scope.resourcemap = {};
 $rootScope.Title = "Resource Map Listing";
 var app = $scope;

 $scope.mongoMappedResourceData = [];
 getMappedResourceData(resourceMappingService,$scope);

 $scope.resourceList = [];
 getResourceData(resourceService,$scope);

 //$scope.roleList = [];
 //getRoleData(roleService,$scope);


 $scope.locationList = [];
 getLocationData(locationService,$scope);

 $scope.regionList = [];
 getRegionData(regionService,$scope);
 
 
 $scope.skillSetList = [];
 getSkillSetData(skillSetService,$scope);

 $scope.statusList = [];
 getStatusData(statusService,$scope);
 
  
 $scope.resourceTypeList = [];
 getResourceTypeData(resourceTypeService,$scope);
  
 $scope.clearFields = function (){
     $scope.resourcemap = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }
 

 $scope.deleteResourceMapping = function(id) {
     if (confirm('Are you sure to delete?')) {
     resourceMappingService.deleteResourceMapping(id).then(function(res) {
     if (res.data == "deleted") {
       getMappedResourceData(resourceMappingService,$scope);
       app.loading = false;
       app.successMsg = "Resource mapping Deleted successfully";
       app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editResourceMapping = function (id) {
     $rootScope.Title = "Edit Designation";
     resourceMappingService.getMappedResourceForID(id).then(function(res) {
     $scope.resourcemap = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(resourcemap) {
     if ($scope.resourceMappingForm.$valid) {
     resourceMappingService.updateResourceMapping(resourcemap).then(function(res) {
     if (res.data == "updated") {
        getMappedResourceData(resourceMappingService,$scope);
        $scope.resourcemap = {};
        app.loading =false;
        app.successMsg = "Resource mapping Updated successfully";
        app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createResourceMapping = function(resourcemap) {
     $rootScope.Title = "Create resourcemap";
     $scope.IsSubmit = true;
     if ($scope.resourceMappingForm.$valid) {
         resourceMappingService.createResourceMapping(resourcemap).then(function(res) {
         if (res.data == "created") {
            getMappedResourceData(resourceMappingService,$scope);
            $scope.resourcemap = {};
            app.loading =false;
            app.successMsg = "Resource mapping created successfully";
            app.errorMsg = false;
         }
         }).catch(function(err) {
         console.log(err);
         });
     }else
     {
            app.loading =false;
            app.successMsg = false;
            app.errorMsg = "Please Enter Required value";
            app.errorClass = "error"
     }
     
 }


//=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
         $scope.childInfo = function(resourcemap, event){
            var scope = $scope.$new(true);      
                scope.resourcemap  = resourcemap;

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
                row.child($compile('<div resourcemap-child-directive class="clearfix"></div>')(scope)).show();
                tr.addClass('shown');
              }
        }
//=============================================================//


 }

 function getMappedResourceData(resourceMappingService,$scope){
      resourceMappingService.getMappedResources().then(function(res) {
         $scope.mongoMappedResourceData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.resourceList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 /*function getRoleData(roleService,$scope){
      roleService.getRole().then(function(res) {
         $scope.roleList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }*/

 function getLocationData(locationService,$scope){
      locationService.getLocation().then(function(res) {
         $scope.locationList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getRegionData(regionService,$scope){
      regionService.getRegion().then(function(res) {
         $scope.regionList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }


 function getSkillSetData(skillSetService,$scope){
       skillSetService.getSkillSets().then(function(res) {
           $scope.skillSetList = res.data;
           }).catch(function(err) {
           console.log(err);
         });
 }

 function getStatusData(statusService,$scope){
      statusService.getStatus().then(function(res) {
         $scope.statusList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

  function getResourceTypeData(resourceTypeService,$scope){
      resourceTypeService.getResourceType().then(function(res) {
         $scope.resourceTypeList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 })();