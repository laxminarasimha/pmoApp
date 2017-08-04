(function () {

  'use strict';

  var app = angular.module('pmoApp');
  app.filter('resourceunique', function () {
    return function (collection, keyname) {
      var output = [],
        keys = [];

      angular.forEach(collection, function (item) {
        var key = item[keyname];
        if (keys.indexOf(key) === -1) {
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

    this.intialize = function (allocation, resoruceM, leave) {
      this.allocation = allocation;
      this.resourceMapped = resoruceM;
      this.leaves = leave;
    }

    this.getData = function (startDt, EndDt) {
      var month = months(startDt, EndDt);
      var uniqueResource = $filter('resourceunique')(this.allocation, 'resource');
      var list = filter(this.allocation, uniqueResource, this.resourceMapped, this.leaves, month, $filter);
      return list;

    }
  }

  function filter(allocationList, resource, mappedResourceData, leaves, months, $filter) {

    var resourceDetails = [];
    var sMonth = [];
    var eMonth = [];

    angular.forEach(allocationList, function (item) {
      if (item.resource === resource) {
        resourceDetails.push(item);
      }
    });

    function Object() {
      this.month;
      this.year;
      this.allocation;
      this.type;
    }

    function Resource() {
      this.resource = "";
      this.location = "";
      this.region = "";
      this.status = "";
      this.skill = "";
      this.kinid = "";
      this.maps = [];
    }


    var allocationObj = null;
    var allocatonWithBufferTime = new Array();
    var allocationObj = new Array();
    var projA = new Array();
    var allocA = new Array();
    var rLoop = false;
    var leavesFilter = null;
    var allocationFilter = null;


    angular.forEach(resource, function (rname) {

      var nResource = new Resource();
      nResource.resource = rname.resource;
      nResource.kinid = rname.kinId;


      leavesFilter = $filter('filter')(leaves, { resourcename: rname.resource });
      allocationFilter = $filter('filter')(allocationList, { resource: rname.resource });

      var duplicateCheck = [];

      angular.forEach(allocationFilter, function (allocFilter) {

        var vRecord = allocFilter.resourcetype + '-' + allocFilter.year + '-' + allocFilter.resourcetype;
        if (duplicateCheck.indexOf(vRecord) === -1) {
          var object = new Object();
          object.type = allocFilter.resourcetype;
          object.allocation = mapAllocation(nResource.resource, months, allocationFilter, object.type, leavesFilter, mappedResourceData, object.type, allocFilter.year);
          nResource.maps.push(object);
          duplicateCheck.push(vRecord);
        }

      });

      mapResoruceDetails(nResource, mappedResourceData);
      allocationObj.push(nResource);
    });

    return allocationObj;
  }

  function mapAllocation(resource, months, allocationFilter, type, leaves, mappedResourceData, resourcetype, year) {

    var allocation = [];

    function Allocation() {
      this.month;
      this.project = [];
      this.allocation = [];
      this.leave;
      this.buffertime;
    }


    angular.forEach(months, function (month) {

      var vAlloc = new Allocation();
      vAlloc.month = month;
      var filterMappedResource;

      angular.forEach(allocationFilter, function (alloc) {
        if (alloc.resourcetype === type) {
          vAlloc.project.push(alloc.project);
          for (var k = 0; k < alloc.allocation.length; k++) {
            if (alloc.allocation[k].month === month) {
              vAlloc.allocation.push(alloc.allocation[k].value);
              break;
            }
          }

        }
      });

      for (var user = 0; user < mappedResourceData.length; user++) {
        if (mappedResourceData[user].mappedResource.resourcename === resource && mappedResourceData[user].resourceType === resourcetype
          && mappedResourceData[user].year == year) {
          filterMappedResource = mappedResourceData[user];
        }
      }

      setLeave(vAlloc, leaves, filterMappedResource);
      setBufferTime(vAlloc, resource, filterMappedResource);
      allocation.push(vAlloc);
    });

    return allocation;

  }


  function setLeave(object, leaves, mappedResourceData) {

    object.leave = 0;

    angular.forEach(leaves, function (leave) {
      angular.forEach(leave.leavedaysinmonth, function (monthD) {
        if (monthD.month === object.month) {
          object.leave = monthD.value;
          return;
        }
      });
    });


    for (var adj = 0; adj < mappedResourceData.taggToEuroclear.length; adj++) {

      if (mappedResourceData.taggToEuroclear[adj].key === object.month) {
        var percent = mappedResourceData.taggToEuroclear[adj].value;
        var percentV = (object.leave * percent) / 100;
        object.leave = round(percentV, 1);
      }
    }

  }

  function setBufferTime(object, resource, mappedResourceData) {

    object.buffertime = 0;
    var actualMandays = [];
    var mappedDays = 0;

    for (var user = 0; user < mappedResourceData.monthlyAvailableActualMandays.length; user++) {
      if (mappedResourceData.monthlyAvailableActualMandays[user].key === object.month) {
        mappedDays = mappedResourceData.monthlyAvailableActualMandays[user].value;
        break;
      }
    }

    var vBuffer = 0;

    for (var k = 0; k < object.allocation.length; k++) {
      vBuffer = vBuffer + parseInt(object.allocation[k]);
    }

    vBuffer = vBuffer + object.leave;
    object.buffertime = round((mappedDays - vBuffer), 1);

  }


  function mapResoruceDetails(nResource, mappedResourceData) {
    for (var user = 0; user < mappedResourceData.length; user++) {
      if (mappedResourceData[user].mappedResource.resourcename === nResource.resource) {
        nResource.location = mappedResourceData[user].location;
        nResource.region = mappedResourceData[user].region;
        nResource.status = mappedResourceData[user].status;
        nResource.skill = mappedResourceData[user].skill;
        nResource.kinid = mappedResourceData[user].mappedResource.kinId;
        break;
      }
    };
  }

  function months(from, to) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var arr = [];
    var datFrom = new Date(from);
    var datTo = new Date(to);
    var fromYear = datFrom.getFullYear();
    var toYear = datTo.getFullYear();
    var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();

    for (var i = datFrom.getMonth(); i <= diffYear; i++) {
      arr.push(monthNames[i % 12] + "-" + Math.floor(fromYear + (i / 12)).toString().substr(-2));
    }
    return arr;
  }

  function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }


})();



