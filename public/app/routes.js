var app = angular.module('appRoutes',['ngRoute'])
.config(function($routeProvider, $locationProvider){
	$routeProvider

	.when('/', {
		templateUrl: 'app/views/pages/users/login.html',
		authenticated: false
	})

	.when('/about',{
		templateUrl: 'app/views/pages/about.html',	
		authenticated: true
	})

	.when('/register',{
		templateUrl: 'app/views/pages/users/register.html',
		controller: 'regCtrl',
		controllerAs: 'register',
		authenticated: true

	})
	
	.when('/login',{
		templateUrl: 'app/views/pages/users/login.html',
		authenticated: false
	})

	.when('/logout',{
		templateUrl: 'app/views/pages/users/logout.html',			
		authenticated: true
	})

	.when('/changepassword',{
		templateUrl: 'app/views/pages/users/changepassword.html',			
		authenticated: true
	})
	.when('/profile',{
		templateUrl: 'app/views/pages/users/profile.html',			
		authenticated: true
	})

	.when('/SkillSet', {
            templateUrl: 'app/views/pages/admin/skillSet.html',
            authenticated: true
          })

	.when('/Project', {
            templateUrl: 'app/views/pages/admin/project.html',
            authenticated: true
		  })

	.when('/Status', {
            templateUrl: 'app/views/pages/admin/status.html',
            authenticated: true
          })
	.when('/Role', {
            templateUrl: 'app/views/pages/admin/role.html',
            authenticated: true
          })
	.when('/Designation', {
            templateUrl: 'app/views/pages/admin/designation.html',
            authenticated: true
          })
	.when('/Resource', {
            templateUrl: 'app/views/pages/admin/resource.html',
            authenticated: true
          })
	.when('/HolidayList', {
            templateUrl: 'app/views/pages/admin/holidayList.html',
            authenticated: true
          })
	.when('/Region', {
            templateUrl: 'app/views/pages/admin/region.html',
            authenticated: true
          })
	.when('/Location', {
            templateUrl: 'app/views/pages/admin/location.html',
            authenticated: true
          })
    .when('/AddLeave', {
            templateUrl: 'app/views/pages/admin/leave.html',
            authenticated: true
          })
    .when('/allocationList', {
            templateUrl: 'app/views/pages/allocation/allocationList.html',
            authenticated: true
          })         	            

     .when('/ResourceMapping', {
            templateUrl: 'app/views/pages/resourcemapping/resourceMapping.html',
            authenticated: true
          })	            
	.when('/ResourceType', {
            templateUrl: 'app/views/pages/admin/resourceType.html',
            authenticated: true
          })
	.otherwise({redirectTo: '/'});

	$locationProvider.html5Mode({
		enabled:true,
		requireBase:false
	});
});

app.run(['$rootScope','Auth','$location',function($rootScope, Auth, $location){

	$rootScope.$on('$routeChangeStart', function(event, next, current){
		console.log('check-3 :' + next.$$route.authenticated);	

		if(next.$$route.authenticated ==  true){	
			if(!Auth.isLoggedIn()){
				event.preventDefault();
				$location.path('/login');
			}		
				
		}else if(next.$$route.authenticated == false){
			if(Auth.isLoggedIn()){
				console.log('Check1');
				event.preventDefault();
				$location.path('/profile');

			}
		}
	});

}]);