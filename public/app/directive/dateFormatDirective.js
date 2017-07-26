angular.module('pmoApp').directive('jqdatepicker', function ($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
         link: function (scope, element, attrs, ngModelCtrl) {
            element.datepicker({
                dateFormat: 'dd-MMM-yy',
                onSelect: function (date) {   
                    var ar=date.split("/");
                    date=new Date(ar[2]+"-"+ar[1]+"-"+ar[0]);
                    ngModelCtrl.$setViewValue(date);            
                    scope.$apply();
                }
            });
            ngModelCtrl.$formatters.unshift(function(v) {
            return $filter('date')(v,'dd-MMM-yy'); 
            });

        }
    };
});