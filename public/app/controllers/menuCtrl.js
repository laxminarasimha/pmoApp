(function () {
	'use strict';

	angular.module('pmoApp').controller('menuCtrl', Controller);

	Controller.$inject = ['$rootScope', '$scope', '$http', 'Auth', '$window'];
	


	function Controller($rootScope, $scope, $http, Auth, $window) {		
		$http.get("app/data/menuData.txt").then(function (response) {
			$scope.menuData = response.data;
			getCustomizedmenu($rootScope, $scope, Auth, response.data);
		});	
				
		//if ($rootScope.region !== undefined)
		//	$window.localStorage.setItem("region", $rootScope.region);
	}

	function getCustomizedmenu($rootScope, $scope, Auth, menu) {
		var menuDataArray = [];
		$rootScope.regionName = [];
		if (Auth.isLoggedIn()) {
			Auth.getUser().then(function (data) {
				// console.log("name:"+data.data.resourcename);												
				if (data.data.resourcename !== "") {
					var userType = data.data.etype;
					//$rootScope.region = data.data.region;
					//console.log("Region name:"+$rootScope.region);
					for (var i = 0; i < menu.length; i++) {
						//for(var j=0;j<menu[i].role.length;j++){
						// if(userType == menu[i].role[j]){
						if ("true" == menu[i].visbile) {
							var tmpSubmenu = new Array();
							if (menu[i].submenu.length > 0) {
								for (var j = 0; j < menu[i].submenu.length; j++) {
									if (menu[i].submenu[j].visible === 'true') {
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
				} else {
					console.log("User is not found");
				}
			});
		}
		$scope.menuData = menuDataArray;
	}

})();
