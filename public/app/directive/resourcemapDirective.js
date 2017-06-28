
angular.module('pmoApp').directive("resourcemapChildDirective", function($compile) {
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/views/pages/resourcemapping/resourceMappingDetail.html'; 
    directive.transclude = true;   
    
    return directive;
});
 

