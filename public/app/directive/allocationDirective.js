(function() {
 'use strict';

angular.module('pmoApp').directive('tmpl', testComp);
  
function testComp($compile){
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/views/pages/allocation/allocationDetail.html'; 
    directive.transclude = false;   
    
    return directive;
  }

  })();


