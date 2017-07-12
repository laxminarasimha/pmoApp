(function() {

 'use strict';
 
angular.module('pmoApp').controller('slillsetAvailabilityController', Controller);
 
Controller.$inject = ['$scope', '$rootScope','$filter'];
  
 function Controller($scope, $rootScope, $filter) {
     
	 var app = $scope;
	 
     $rootScope.Title = "Reporting";    
     
     var ctx = document.getElementById('SwedenChart').getContext('2d');

     var country = "Sweden";

     getSkillsetAvailabilityChart(app,$filter,ctx,country);  

     var ctx = document.getElementById('FinlandChart').getContext('2d');
     
     country = "Finland";

     getSkillsetAvailabilityChart(app,$filter,ctx,country);     
   


 }

function getSkillsetAvailabilityChart($scope,$filter,ctx, country){
    var barChartData = {
        labels: ["Jan-17", "Feb-17", "Mar-17", "Apr-17", "May-17", "Jun-17", "Jul-17"],
        datasets: [{
            label: 'CoolGen',                
            data: [10,8,4,12,41,26,25],
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
        }, {
            label: 'MF',
            data: [4,18,14,22,42,26,25],
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
        }, {
            label: 'BA',                
            data: [10,23,25,19,12,16,5],
            backgroundColor: 'rgba(153, 102, 255, 0.2)'
        }, {
            label: 'Testing',                
            data: [10,23,25,19,12,16,5],
            backgroundColor: 'rgba(253, 102, 255, 0.2)'
        }, {
            label: 'Java',                
            data: [10,23,25,19,12,16,5],
            backgroundColor: 'rgba(153, 202, 255, 0.2)'
        }]

    };
    var chart = new Chart(ctx, {
        type: 'bar',
        data: barChartData,
        options: {
                        legend: {
                            display: true,
                            labels: {
                                fontColor: 'rgb(255, 99, 132)'
                            }
                        },
                        title:{
                            display:true,
                            text: country +" Skillset Available Capacity"
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
}//End Of Function getSkillsetAvailabilityChart()

 })();