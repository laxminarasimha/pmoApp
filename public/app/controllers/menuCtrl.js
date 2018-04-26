(function() {
	'use strict';
	
	angular.module('pmoApp').controller('menuCtrl', Controller);
	
	Controller.$inject = ['$scope', '$http', 'Auth'];
	
	function Controller($scope, $http,Auth) {
	
	
	$http.get("app/data/menuData.txt").then(function(response) {
				 $scope.menuData = response.data;
				 getCustomizedmenu($scope,Auth,response.data);
			 });
	}
   
	function getCustomizedmenu($scope,Auth,menu){
	   var menuDataArray = [];
		if(Auth.isLoggedIn()){		
		   Auth.getUser().then(function(data){										
		   if(data.data.resourcename !== ""){			
			   var userType = data.data.etype;
			   for(var i=0;i<menu.length;i++){
				   //for(var j=0;j<menu[i].role.length;j++){
					 // if(userType == menu[i].role[j]){
					   if("true" == menu[i].visbile){
						   var tmpSubmenu = new Array();
						   if(menu[i].submenu.length > 0){
							   for(var j=0;j<menu[i].submenu.length;j++){
								   if(menu[i].submenu[j].visible === 'true'){
									   tmpSubmenu.push(menu[i].submenu[j]);
								   }
   
							   }
   
						   }
						   menu[i].submenu = tmpSubmenu;
						 menuDataArray.push(menu[i]);
					   }
					   //  break;
					  //}
				   //}
				   
			   }
		   }else{
			   console.log("User is not found");				
		   }
   
	   });
	   }
	   $scope.menuData = menuDataArray;
	}
	
	})();
   