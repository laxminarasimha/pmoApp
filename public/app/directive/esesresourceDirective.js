angular.module('pmoApp').directive("esesresourceChildDirective", function($compile) {
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/views/pages/resource/esesresourceDetail.html'; 
    directive.transclude = true;   
    
    return directive;
});