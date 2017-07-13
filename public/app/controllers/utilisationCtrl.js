
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('utilisationCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile','utilisationService',
                       'resourceService','roleService','regionService','projectService','resourceTypeService',
                       'allocationService','leaveService','resourceMappingService','availableDaysService',
                       'monthlyHeaderListService'];
  
 function Controller($scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, $compile, utilisationService,
                     resourceService,roleService,regionService,projectService,resourceTypeService,
                     allocationService,leaveService,resourceMappingService,availableDaysService,
                     monthlyHeaderListService) {

 
 var app = $scope;

 $scope.utilisationData = [];
 //getuUilisationData(utilisationService,$scope);

 $scope.resourceList = [];
 getResourceData(resourceService,$scope);

 $scope.roleList = [];
 getRoleData(roleService,$scope);



 $scope.regionList = [];
 getRegionData(regionService,$scope);
 
   
 $scope.resourceTypeList = [];
 getResourceTypeData(resourceTypeService,$scope);


 $scope.projectList = [];
 getProjectData(projectService,$scope);

 $scope.headingList = [];
 prepareTableHeading($scope,monthlyHeaderListService);
  
 $scope.clearFields = function (){
     $scope.utilisationDTO = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 };
 

 
 
 $scope.getUtilisation = function(utilisationDTO) {
     $scope.IsSubmit = true;
     if ($scope.utilisationForm.$valid) {
         utilisationService.getUtilisation(utilisationDTO).then(function(res) {
         if (res.data == "created") {
            getuUilisationData(utilisationService,$scope);
            $scope.utilisationDTO = {};
            app.loading =false;
            app.successMsg = "Data fetched successfully";
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
     
 };


//=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
        
//=============================================================//


    getGraphData($scope,allocationService,leaveService,resourceMappingService,availableDaysService,monthlyHeaderListService);

    $scope.prepareUtilisationData = function(availableDaysService,monthlyHeaderListService){

           var fromDate = "01-"+$scope.headingList[0];
           var toDate = "01-"+$scope.headingList[$scope.headingList.length-1];
           var list =  availableDaysService.getData(fromDate,toDate);
           var resourceUtilisationArray = [];
           for(var i=0; i<list.length;i++){
             var resourceObj = new Resource();
             resourceObj.name = list[i].resource;
             //console.log("list[i].resource=================="+list[i].resource);
             var monthlyUtilisationArray = [];
                 for(var j=0;j<list[i].maps[0].length;j++){
                        var allocationOBJ = list[i].maps[0][j];
                        var sum = 0;
                        var actualAvailablemandays = 0;
                        var totalAllocation = 0;
                        for(var k=0; k<allocationOBJ.allocation.length;k++){
                           if(isNaN(allocationOBJ.allocation[k])){
                             allocationOBJ.allocation[k] = 0;
                           }
                           //console.log("Allocation=================="+allocationOBJ.allocation[k]);
                           sum = sum + parseFloat(allocationOBJ.allocation[k]);
                        }
                        
                        if(isNaN(allocationOBJ.leave)){
                             allocationOBJ.leave = 0.0;
                           }

                           //console.log("Leave=================="+allocationOBJ.leave);
                        if(isNaN(allocationOBJ.buffertime)){
                             allocationOBJ.buffertime = 0.0;
                         }
                         //console.log("buffertime=================="+allocationOBJ.buffertime);
                        sum = sum + parseFloat(allocationOBJ.leave);
                        totalAllocation = sum;

                        if(parseFloat(allocationOBJ.buffertime) > 0){
                           totalAllocation = totalAllocation + parseFloat(allocationOBJ.buffertime);
                        }

                        sum = sum + parseFloat(allocationOBJ.buffertime);

                        actualAvailablemandays = sum;                    



                        var utilisation = 0;
                        if(sum == 0.0){
                            utilisation = 0;
                        }else if(allocationOBJ.buffertime == 0.0 && sum != 0.0){
                            utilisation = 100;
                        }else{
                           utilisation = monthlyHeaderListService.getRoundNumber((totalAllocation/actualAvailablemandays)*100,1);
                        }
                        
                        var monthlyUtilisationObject = {
                                "key" : allocationOBJ.month,
                                "value" : utilisation 
                             };



                        monthlyUtilisationArray.push(monthlyUtilisationObject);

                 }
                 resourceObj.utilisationArray = monthlyUtilisationArray;
                 resourceUtilisationArray.push(resourceObj);
                 
           }
              console.log(resourceUtilisationArray);
              $scope.utilisationData = resourceUtilisationArray;

        }


 }




//====================================================//

function Resource(name,utilisationArray){
        this.name =name
        this.utilisationArray=utilisationArray;
    }



function getGraphData($scope,allocationService,leaveService,resourceMappingService,availableDaysService,monthlyHeaderListService){
        var allocation =[];
        var resoruceM =[];
        var leave =[];
        allocationService.getAllAllocation().then(function(res) {
                allocation=res.data;
                leaveService.getLeave().then(function(res) {
                    leave=res.data;
                    resourceMappingService.getMappedResources().then(function(res) {
                        resoruceM = res.data;
                        availableDaysService.intialize(allocation,resoruceM,leave);
                        $scope.prepareUtilisationData(availableDaysService,monthlyHeaderListService);
                     }).catch(function(err) {
                     console.log(err);
                    });
                }).catch(function(err) {
                    console.log(err);
                });
        }).catch(function(err) {
         console.log(err);
     });
    }

//====================================================//


 function getuUilisationData(utilisationService,$scope){
      utilisationService.getMappedResources().then(function(res) {
         $scope.utilisationData = res.data;
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

 function getRoleData(roleService,$scope){
      roleService.getRole().then(function(res) {
         $scope.roleList = res.data;
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


  function getResourceTypeData(resourceTypeService,$scope){
      resourceTypeService.getResourceType().then(function(res) {
         $scope.resourceTypeList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getProjectData(projectService,$scope){
      projectService.getProject().then(function(res) {
         $scope.projectList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }


 function prepareTableHeading($scope,monthlyHeaderListService){  
        $scope.headingList = monthlyHeaderListService.getHeaderList();
    }


 })();