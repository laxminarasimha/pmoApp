 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('monthlyHeaderListService', Service);
 
 Service.$inject = ['appConstants'];
 
 function Service(appConstants) {
   var theMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
   return {
       getHeaderList: function() { 
       var headinglabelArray = [];
       var x, todayDate = new Date();
       var noOfMonthToDisplay  = appConstants.NoOfMonthToDisplay;
       todayDate.setDate(1);
        for(x=0; x<noOfMonthToDisplay; ++x) {             
            var headinglabel = theMonths[todayDate.getMonth()] + '-' + (todayDate.getFullYear().toString()).substring(2, 4);;
            headinglabelArray.push(headinglabel);
            todayDate.setMonth(todayDate.getMonth()+1);
        }
        return headinglabelArray;
       },
       getMonthList: function() {
            return theMonths;
       },
       getRoundNumber:function (value, precision) {
          var multiplier = Math.pow(10, precision || 0);
          return Math.round(value * multiplier) / multiplier;
      }
      
   };
 }

 })();