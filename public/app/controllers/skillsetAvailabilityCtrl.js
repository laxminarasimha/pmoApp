(function() {

 'use strict';
 
angular.module('pmoApp').controller('slillsetAvailabilityController', Controller);
 
Controller.$inject = ['$scope', '$rootScope','$filter', 'locationService', 'resourceMappingService','allocationService','leaveService','availableDaysService','monthlyHeaderListService'];
 var barChartData ;
 var colors = ['#7394CB','#E1974D','#84BB5C','#D35D60','#6B4C9A','#9066A7','#AD6A58','#CCC374','#3869B1','#DA7E30','#3F9852','#6B4C9A','#922427','rgba(253, 102, 255, 0.2)','rgba(153, 202, 255, 0.2)'];
 var chartColors = ['rgb(255, 99, 132)','rgb(255, 159, 64)','rgb(255, 205, 86)','rgb(75, 192, 192)','rgb(54, 162, 235)','rgb(153, 102, 255)','rgb(201, 203, 207)','rgba(253, 102, 255)','rgba(153, 202, 255)','rgb(255, 99, 132)','rgb(255, 159, 64)','rgb(255, 205, 86)','rgb(75, 192, 192)','rgb(54, 162, 235)','rgb(153, 102, 255)','rgb(201, 203, 207)','rgba(253, 102, 255)','rgba(153, 202, 255)'];
var color = Chart.helpers.color;
 function Controller($scope, $rootScope, $filter, locationService,resourceMappingService,allocationService,leaveService,availableDaysService,monthlyHeaderListService) {
    var app = $scope;	 
    $rootScope.Title = "Reporting";         
    $scope.LocationData = [];
    $scope.locationId = "All"
    $scope.MappedResourceData = [];
    $scope.barChartData = [];
    $scope.chartlabels = [];
    $scope.graphid = "Resource Capacity";
    $scope.barChartData = {        
        datasets: []
    };
    getLocationData(locationService,$scope); 
    getMappedResourceData(resourceMappingService,$scope);

    $scope.headingList = [];
    prepareTableHeading($scope,monthlyHeaderListService);

    $scope.countrychange = function(){     
        //getMappedResourceData(resourceMappingService,$scope);
        createGraph($scope,resourceMappingService,availableDaysService,monthlyHeaderListService);
    }
    $scope.graphidchange = function(){     
        createGraph($scope,resourceMappingService,availableDaysService,monthlyHeaderListService);
    }
     
    

    getGraphData($scope,allocationService,leaveService,resourceMappingService,availableDaysService,monthlyHeaderListService);

    $scope.getActualResourceCapacity = function(availableDaysService,monthlyHeaderListService){
        var fromDate = "01-"+$scope.headingList[0];
        var toDate = "01-"+$scope.headingList[$scope.headingList.length-1];
        var list =  availableDaysService.getData(fromDate,toDate);        
        createActualResourceCapacityGraph(list,$scope,monthlyHeaderListService);

       }
    
 }

function createActualResourceCapacityGraph(list,$scope,monthlyHeaderListService){
    //console.log(list);    
    var resource = {'name':"",
                    'kindid':"",
                    'location':"",
                    'region':"", 
                    'resourcetype':"",
                    'skill':"", 
                    'status':"",
                    'utilisationArray':[]
                   };
   var resourceUtilisationArray = [];
           for(var i=0; i<list.length;i++){             
             resource.name = list[i].resource;
             resource.kindid = list[i].kindid;
             resource.location = list[i].location;
             resource.region = list[i].region;
             resource.resourcetype = list[i].resourcetype;
             resource.skill = list[i].skill;
             resource.status = list[i].status;
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
        }
    console.log(resource);
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
                        $scope.getActualResourceCapacity(availableDaysService,monthlyHeaderListService);
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

function prepareTableHeading($scope,monthlyHeaderListService){  
        $scope.headingList = monthlyHeaderListService.getHeaderList();
    }

 function getLocationData(locationService,$scope){
          locationService.getLocation().then(function(res) {
             $scope.LocationData = res.data;
             }).catch(function(err) {
             console.log(err);
         });
     }

function createGraph($scope,resourceMappingService,availableDaysService,monthlyHeaderListService){
    switch ($scope.graphid) {
            case "Resource Capacity":
                   getMappedResourceData(resourceMappingService,$scope);
                break;
            case "Skillset Capacity":
                   getMappedSkillData(resourceMappingService,$scope);
                break;
            case "Remaining Resource Capacity":
                   $scope.getActualResourceCapacity(availableDaysService,monthlyHeaderListService);
                break;                

                
            default:
                
                break;
        }
     
}//End OF CreateGraph()



function getMappedResourceData(resourceMappingService,$scope){
    resourceMappingService.getMappedResources().then(function(res) {         
         $scope.chartlabels = [];
         $scope.barChartData = {        
            labels : "",
            datasets: []
        };
         var data = [];         
         $scope.MappedResourceData = res.data;
         var i = 0;
         var fillLabels = true;
         angular.forEach(res.data,function(value, key){
         if($scope.locationId === "All" || value.location === $scope.locationId) {                 
            data = [];
            angular.forEach(value.monthlyAvailableActualMandays,function(value, key){
                if(fillLabels){
                    $scope.chartlabels.push(value.key);
                }
                data.push(value.value);
            })            
            var dataset = 
            {
                label: value.mappedResource.resourcename,                
                data : data,
                backgroundColor: color(chartColors[i]).alpha(0.5).rgbString(),
                borderColor: chartColors[i],
                borderWidth: 1
            }
            i++;
            $scope.barChartData.datasets.push(dataset);            
            fillLabels = false;              
            $scope.barChartData["labels"] = $scope.chartlabels;          
        }
         })
         createStackedBarGraph($scope);
         }).catch(function(err) {
         console.log(err);
     });
 }


 function getMappedSkillData(resourceMappingService,$scope){
    resourceMappingService.getMappedResources().then(function(res) {         
         $scope.chartlabels = [];
         $scope.barChartData = {        
            labels : "",
            datasets: []
        };
         var data = [];         
         $scope.MappedResourceData = res.data;
         var i = 0;
         var fillLabels = true;
         var skillsets = [];
         var currentSkill = "";      
         var datasets = [];
         var finalData =[];
         angular.forEach(res.data,function(value, key){
         if(skillsets.indexOf(value.skill) < 0)   skillsets.push(value.skill);   
         if($scope.locationId === "All" || value.location === $scope.locationId) {                 
            data = [];                                   
            angular.forEach(value.monthlyAvailableActualMandays,function(value, key){
                if(fillLabels){
                    $scope.chartlabels.push(value.key);
                }                
                 data.push(value.value);                
            })            
            var dataset = 
                {
                    label: value.skill,
                    data : data,
                    backgroundColor: color(chartColors[i]).alpha(0.5).rgbString(),
                    borderColor: chartColors[i],
                    borderWidth: 1
                }
            
            i++;

            datasets.push(dataset);
            fillLabels = false;              
            $scope.barChartData["labels"] = $scope.chartlabels;          
        }
         })         
         var newData = [];
         var newDataSets = [];
         var skillsTotal = [];
         for(var i=0; i<skillsets.length;i++){   
            skillsTotal[i] = [0,0,0,0,0,0,0,0,0,0,0,0];
            for(var k=0;k<datasets.length;k++){
              if(datasets[k].label == skillsets[i])
                {   
                    skillsTotal[i] = skillsTotal[i].map(function (num, idx) {
                        return num + datasets[k].data[idx];
                    });                  
                } 

            }
            var dataset = 
                {
                    label: skillsets[i],
                    data : skillsTotal[i],
                    backgroundColor: color(chartColors[i]).alpha(0.5).rgbString(),
                    borderColor: chartColors[i],
                    borderWidth: 1
                }
            $scope.barChartData.datasets.push(dataset);
         }
         createStackedBarGraph($scope);
         
         }).catch(function(err) {
         console.log(err);
     });
 }


 function createStackedBarGraph($scope){
        var ctx = CreateCanvas("SkillsetChart");
        var chart = new Chart(ctx, {
        type: 'bar',
        data: $scope.barChartData,
        options: {
                        legend: {
                            display: true,
                            position:'right',
                            labels: {
                                fontColor: 'rgb(255, 99, 132)'
                            }
                        },
                        title:{
                            display:true,
                            text: $scope.locationId +" Resource Capacity"
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false
                        },
                        responsive: true,
                        scales: {
                            xAxes: [{
                                stacked: true,
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        }
                    }
    });
    }//Endf OF createStackedBarGraph($scope)
    
    function CreateCanvas(canvasId){
    
        if (document.contains(document.getElementById("chartSubContainer"))) {
               document.getElementById("chartSubContainer").remove();
        }

        var canvas = document.createElement('canvas');
        var chartSubContainer = document.createElement('div');
            chartSubContainer.id = "chartSubContainer";
            canvas.id     = canvasId;        

        var container = document.getElementById('ChartContainer');
            container.appendChild(chartSubContainer);        
            chartSubContainer.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        return ctx;

    }



 })();