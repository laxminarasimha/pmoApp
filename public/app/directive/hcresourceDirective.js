angular.module('pmoApp').directive("hcresourceChildDirective", function($compile) {
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/views/pages/resource/hcresourceDetail.html'; 
    directive.transclude = true;   
    
    return directive;
});