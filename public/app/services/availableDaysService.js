 (function() {

 'use strict';
 
 var app =angular.module('pmoApp');
 app.filter('resourceunique', function() {
       return function(collection, keyname) {
          var output = [], 
              keys = [];

          angular.forEach(collection, function(item) {
              var key = item[keyname];
              if(keys.indexOf(key) === -1) {
                  keys.push(key);
                  output.push(item);
              }
          });

          return output;
       };
  })

 app.service('availableDaysService', Service);
 Service.$inject = ['$filter'];
   
  function Service($filter) {
      var allocation = [];
      var resourceMapped = [];
      var leaves = [];
 
      this.intialize = function(allocation,resoruceM,leave){
        this.allocation=allocation;
        this.resourceMapped = resoruceM;
        this.leaves = leave;
      }
      
      this.getData = function(startDt,EndDt){
        var month=months('2017-07-23','2018-06-23');
        var resourceDetails = [];
        var uniqueResource = $filter('resourceunique')(this.allocation,'resource');
        var list = filter(this.allocation,uniqueResource,this.resourceMapped,this.leaves,month,$filter);
       
      }
  }

  function filter(allocationList, resource,mappedResourceData,leaves,monthLabel,$filter) {
     
    var resourceDetails = [];
    var sMonth=[];
    var eMonth=[];

    angular.forEach(allocationList, function(item) {
      if(item.resource === resource) {
        resourceDetails.push(item);
      }
    });
    
    function Object(){
        this.month = "";
        this.allocation;
        this.project;
        this.buffertime=0;
        this.leave =0;
    }

    function Resource(resource,months,allocation){
        this.resource ="";
        this.maps=[];
    }

    var allocaitonObj = null;
    var allocaitonWithBufferTime = new Array();
    var allocaitonObj= new Array();
    var projA = new Array();
    var allocA = new Array();
    var rLoop = false;
    var leavesFilter = null;
    var allocationFilter = null;


    angular.forEach(resource,function(rname){
      
      leavesFilter =$filter('filter')(leaves, {resourcename: rname.resource});
      allocationFilter =$filter('filter')(allocationList, {resource: rname.resource});
      
      angular.forEach(monthLabel,function(month){
        var object = new Object();
            object.month = month;
            rLoop = false;
            angular.forEach(allocationList,function(alloc){
              if(alloc.resource === rname.resource){
                angular.forEach(alloc.allocation,function(mapAlloc){
                  if(mapAlloc.month === month ){
                    projA.push(alloc.project);
                    allocA.push(mapAlloc.value);
                    rLoop = true;
                    return;
                  }
                });
              }if(rLoop) return;
            });
           
            object.allocation=allocA;
            object.project=projA;
            setLeave(object,leavesFilter);
            setAvailableTime(object,rname.resource,mappedResourceData);
            projA = new Array();
            allocA = new Array();
           allocaitonWithBufferTime.push(object);
        });
          
        var nResource = new Resource();
            nResource.resource=rname.resource;
            nResource.maps.push(allocaitonWithBufferTime);
        allocaitonWithBufferTime = new Array();
        allocaitonObj.push(nResource);
    });
    console.log(allocaitonObj);
    return allocaitonObj;
  }

  function setLeave(object,leaves){
      angular.forEach(leaves,function(leave){
        angular.forEach(leave.leavedaysinmonth,function(monthD){
          if(monthD.month === object.month){
            object.leave=monthD.value;
            return;
          }
         });
      });
  }

  function setAvailableTime(object,resource,mappedResourceData){

    var actualMandays =[];

    for(var user = 0;user < mappedResourceData.length;user ++){
      if(mappedResourceData[user].mappedResource.resourcename === resource ){
        angular.forEach(mappedResourceData[user].monthlyAvailableActualMandays,function(item){  
          if(item.key === object.month){
              var allocaiton = object.allocation;
              var sum = 0,data=0;
              for(var i = 0, len = allocaiton.length; i < len; i++) {
                sum += parseInt(allocaiton[i]);  
              }
                
              sum = sum + parseInt(object.leave);
              object.buffertime = Math.round(item.value - sum);
              return;
            }
        });
      }
    }
  }

  function months(from, to) {
      var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
      var arr = [];
      var datFrom = new Date(from);
      var datTo = new Date(to);
      var fromYear =  datFrom.getFullYear();
      var toYear =  datTo.getFullYear();
      var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();
    
      for (var i = datFrom.getMonth(); i <= diffYear; i++) {
            arr.push(monthNames[i%12] + "-" + Math.floor(fromYear+(i/12)).toString().substr(-2));
      }        
      return arr;
  }

})();  
  


