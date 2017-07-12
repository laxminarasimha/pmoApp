(function() {

 'use strict';
 
angular.module('pmoApp').controller('dashboardController', Controller);
 
Controller.$inject = ['$scope', '$rootScope','$filter','dashboardService','resourceService'];
  
 
  
 function Controller($scope, $rootScope, $filter,dashboardService,resourceService) {
     
	 var app = $scope;
	 $rootScope.Title = "Reporting";
     app.ProjectData = [];
     app.ResourceData = [];
     var projects = [];
     $scope.projectNames = [];
     $scope.projectDates = [];
     var ctx = document.getElementById('myChart').getContext('2d');
     getProjectGraph(dashboardService,app,$filter);     
     getProjectChartjs(dashboardService,app,$filter,ctx);     
     getResourceData(resourceService,$scope);
 }

 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.ResourceData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

function getProjectChartjs(dashboardService,$scope,$filter,ctx){
   
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],            
        },
        {
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 25)',
            borderColor: 'rgb(255, 99, 132)',
            data: [2, 1, 6, 5, 12, 30, 45],
        }]
       
    },

    // Configuration options go here
    options: {}
});

}
 
 function getProjectGraph(dashboardService,$scope,$filter){        
    dashboardService.getProject().then(function(res) {
        var options = {
                chart: {
                    renderTo: 'container',
                    type: 'columnrange',
                    inverted: true
                },
                title: {
                    text: 'Project Details'
                },
                subtitle: {
                    text: 'Observed in Years'
                },
                xAxis: {
                categories: $scope.projectNames
                },
                yAxis: {
                    title: {
                        text: 'Years(YYYY)'
                    }
                },
                tooltip: {
                    valueSuffix: ''
                },
                plotOptions: {
                columnrange: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return this.y;
                        }
                    }
                }
                },
                legend: {
                    enabled: false
                },
                series: [{
                name: 'Year',                
                data: [{}]                
                }]
            };
    
            $scope.ProjectData = res.data;            

            angular.forEach(res.data,function(value, key){
                $scope.projectNames.push(value.projectname);               
                var pdates = [];
                pdates.push(parseInt($filter('date')(value.startDate, "yyyy")));
                pdates.push(parseInt($filter('date')(value.endDate, "yyyy")));
                $scope.projectDates.push(pdates);
            })
            options.series[0].data = $scope.projectDates;
            var chart = new Highcharts.Chart(options);
         }).catch(function(err) {
         console.log(err);
     });
 }

 })();