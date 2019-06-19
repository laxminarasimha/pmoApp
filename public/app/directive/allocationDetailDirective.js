(function() {
 'use strict';

angular.module('pmoApp').directive('allocdetail', allocationDetail);
  
function allocationDetail($compile){
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/views/pages/allocation/allocationListDetail.html'; 
    directive.transclude = false;   
    
    return directive;
  }

  })();


