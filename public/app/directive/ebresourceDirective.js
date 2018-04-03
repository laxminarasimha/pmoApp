angular.module('pmoApp').directive("ebresourceChildDirective", function($compile) {
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/views/pages/resource/ebresourceDetail.html'; 
    directive.transclude = true;   
    
    return directive;
});