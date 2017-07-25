(function() {
 'use strict';
 
angular.module('pmoApp').controller('resourceCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'resourceService','designationService','DTOptionsBuilder', 'DTColumnBuilder','skillSetService','locationService','roleService','$window'];
  
 function Controller($scope, $rootScope, resourceService, designationService, DTOptionsBuilder, DTColumnBuilder,skillSetService,locationService,roleService,$window) {
 $scope.mongoResourceData = [];
 
 var app = $scope;
 
 $rootScope.Title = "Resource Listing";
 getResourceData(resourceService,$scope);

 $scope.designationList = [];
 getDesignationData(designationService,$scope);
 

 $scope.skillSetList = [];
 getSkillSetData(skillSetService,$scope);
 

 $scope.regionList = [];
 getLocationData(locationService,$scope);


 $scope.roleList = [];
 getRoleData(roleService,$scope);
  
 $scope.clearFields = function (){
 
     $scope.resource = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = ""
 }
 
 $scope.deleteConfirmation = function(id,name){
    $scope.msg = name;
    $scope.deletedID = id;
    openDialog();

 }
 
 $scope.cancel = function(event){
    $scope.msg = "";
    $scope.deletedID = "";
 }

 $scope.delete = function(event) {
     //if (confirm('Are you sure to delete?')) {
         resourceService.deleteResource($scope.deletedID).then(function(res) {
         if (res.data == "deleted") {
           getResourceData(resourceService,$scope);
           app.loading = false;
           app.successMsg = "Resource Deleted successfully";
           app.errorMsg = false;
            $scope.msg = "";
            $scope.deletedID = "";
         }
         }).catch(function(err) {
         console.log(err);
         });
     //}
 };
 
$scope.editResource = function (id) {
     $rootScope.Title = "Edit Resource";
     resourceService.getResourceForID(id).then(function(res) {
     $scope.resource = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(resource) {
     if ($scope.resourceForm.$valid) {        
     resourceService.updateResource(resource).then(function(res) {
     if (res.data == "updated") {
        getResourceData(resourceService,$scope);
        $scope.resource = {};
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
 $scope.createResource = function(resource) {
     $rootScope.Title = "Create Resource";
     $scope.IsSubmit = true;
     if ($scope.resourceForm.$valid) {
        app.loading =true;
        //Password = "default";
        $scope.resource.password = '$2a$10$z14k1dcNp7nPmB1s.ApNNe4NLYu.UbKd1lKcgARc3fDTeoPW9GlAC';
         resourceService.createResource(resource).then(function(res) {
         if (res.data == "created") {
            app.loading =true;
            getResourceData(resourceService,$scope);            
            $scope.resource = {};
            app.loading =false;
            app.successMsg = "Resource created successfully";
            app.errorMsg = false;
         }else{
            app.loading =false;
            app.successMsg = "Resource Updated successfully";
            app.errorMsg = false;
         }
         }).catch(function(err) {
         console.log(err);
         });
     }else{
            app.loading =false;
            app.successMsg = false;
            app.errorMsg = "Please Fill All Required Fields(*)";
            app.errorClass = "error"
     }
     
 }

  //=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
//=============================================================//

    $scope.exportToExcel = function(){
         resourceService.getResourcesExportToExcel().then(function(res) {  
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
                    var blob = new Blob(byteArrays, {type: contentType});
                    var blobUrl = URL.createObjectURL(blob);
                    $window.location = blobUrl;
                    //$window.open(blob);

             }).catch(function(err) {
             console.log(err);
         });

       }

}

 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.mongoResourceData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getDesignationData(designationService,$scope){
      designationService.getDesignations().then(function(res) {
         $scope.designationList = res.data;
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

function getLocationData(locationService,$scope){
      locationService.getLocation().then(function(res) {
         $scope.regionList = res.data;
         console.log(res.data);
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getRoleData(roleService,$scope){
      roleService.getRole().then(function(res) {
         $scope.roleList = res.data;
         console.log(res.data);
         }).catch(function(err) {
         console.log(err);
     });
 }
 

function openDialog(){
    $('#confirmModal').modal('show');
 }

 })();