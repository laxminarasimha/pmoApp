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
    type: 'bar',
    data: {
        labels: ["Jan-17", "Feb-17", "Mar-17", "Apr-17", "May-17", "Jun-17"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
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