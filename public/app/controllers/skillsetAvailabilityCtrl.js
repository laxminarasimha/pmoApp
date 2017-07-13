(function() {

 'use strict';
 
angular.module('pmoApp').controller('slillsetAvailabilityController', Controller);
 
Controller.$inject = ['$scope', '$rootScope','$filter', 'locationService', 'resourceMappingService'];
 var barChartData ;
 var colors = ['#7394CB','#E1974D','#84BB5C','#D35D60','#818787','#9066A7','#AD6A58','#CCC374','#3869B1','#DA7E30','#3F9852','#6B4C9A','#922427','rgba(253, 102, 255, 0.2)','rgba(153, 202, 255, 0.2)'];
 function Controller($scope, $rootScope, $filter, locationService,resourceMappingService) {
    var app = $scope;	 
    $rootScope.Title = "Reporting";         
    $scope.LocationData = [];
    $scope.inputVal = "All"
    $scope.MappedResourceData = [];
    $scope.barChartData = [];
    $scope.chartlabels = [];
    $scope.barChartData = {        
        datasets: []
    };
    getLocationData(locationService,$scope); 
    getMappedResourceData(resourceMappingService,$scope);

    $scope.change = function(){     
        getMappedResourceData(resourceMappingService,$scope);
    }
     


function getSkillsetAvailabilityChart($scope,$filter,resourceMappingService){
}//End Of Function getSkillsetAvailabilityChart()

function getLocationData(locationService,$scope){
      locationService.getLocation().then(function(res) {
         $scope.LocationData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 }

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
         if($scope.inputVal === "All" || value.location === $scope.inputVal) {                 
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
                backgroundColor: colors[i]
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

 function createStackedBarGraph($scope){

    if (document.contains(document.getElementById("chartSubContainer"))) {
           document.getElementById("chartSubContainer").remove();
    }

    var canvas = document.createElement('canvas');
    var chartSubContainer = document.createElement('div');
        chartSubContainer.id = "chartSubContainer";
        canvas.id     = "SkillsetChart";        

    var container = document.getElementById('ChartContainer');
        container.appendChild(chartSubContainer);        
        chartSubContainer.appendChild(canvas);

    var ctx = canvas.getContext('2d');

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
                            text: $scope.inputVal +" Resource Capacity"
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



 })();