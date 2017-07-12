
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('idleTimeCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile','idleTimeService',
                       'resourceService','roleService','regionService','projectService','resourceTypeService',
                       'allocationService','leaveService','resourceMappingService','availableDaysService',
                       'monthlyHeaderListService'];
  
 function Controller($scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, $compile, idleTimeService,
                     resourceService,roleService,regionService,projectService,resourceTypeService,
                     allocationService,leaveService,resourceMappingService,availableDaysService,
                     monthlyHeaderListService) {

 
 var app = $scope;

 $scope.idleTimeData = [];
 //getIdleTimeData(idleTimeService,$scope);

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
     $scope.idleTimeDTO = {};
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }
 

 
 
 $scope.getIdleTimes = function(idleTimeDTO) {
     $scope.IsSubmit = true;
     if ($scope.idleTimeForm.$valid) {
         idleTimeService.getIdleTimes(idleTimeDTO).then(function(res) {
         if (res.data == "created") {
            getIdleTimeData(idleTimeService,$scope);
            $scope.idleTimeDTO = {};
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
     
 }


//=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
         
        
//=============================================================//
   
    getGraphData($scope,allocationService,leaveService,resourceMappingService,availableDaysService,monthlyHeaderListService);

    $scope.prepareIdleTimeData = function(availableDaysService,monthlyHeaderListService){

           var list =  availableDaysService.getData();
           var resourceIdleTimeArray = [];
           for(var i=0; i<list.length;i++){
             var resourceObj = new Resource();
             resourceObj.name = list[i].resource;
             //console.log("list[i].resource=================="+list[i].resource);
             var monthlyIdleTimeArray = [];
                 for(var j=0;j<list[i].maps[0].length;j++){
                        var allocationOBJ = list[i].maps[0][j];
                        var sum = 0;
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
                        sum = sum + parseFloat(allocationOBJ.buffertime);
                        var idleTime = 0;
                        if(sum == 0.0){
                            idleTime = 0;
                        }else if(allocationOBJ.buffertime == 0.0){
                            idleTime = 0;
                        }else{
                           idleTime = monthlyHeaderListService.getRoundNumber((parseFloat(allocationOBJ.buffertime)/sum)*100,1);
                        }
                        
                        var monthlyIdleTimeObject = {
                                "key" : allocationOBJ.month,
                                "value" : idleTime 
                             };



                        monthlyIdleTimeArray.push(monthlyIdleTimeObject);

                 }
                 resourceObj.idleTimeArray = monthlyIdleTimeArray;
                 resourceIdleTimeArray.push(resourceObj);
                 console.log(resourceIdleTimeArray);
           }

              $scope.idleTimeData = resourceIdleTimeArray;

        }

 }


//====================================================//

function Resource(name,idleTimeArray){
        this.name =name
        this.idleTimeArray=idleTimeArray;
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
                        $scope.prepareIdleTimeData(availableDaysService,monthlyHeaderListService);
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




 function getIdleTimeData(idleTimeService,$scope){
      idleTimeService.getMappedResources().then(function(res) {
         $scope.idleTimeData = res.data;
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