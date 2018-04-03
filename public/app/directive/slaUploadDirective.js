angular.module('pmoApp').directive("slareportChildDirective", function($compile) {
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/views/pages/sla/slaUploadDetail.html'; 
    directive.transclude = true;   
    
    return directive;
});