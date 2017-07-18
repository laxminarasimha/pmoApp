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
            authenticated: true,
            controllerAs: 'skill'
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
	.when('/Holiday List', {
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
    .when('/Add Leave', {
            templateUrl: 'app/views/pages/admin/leave.html',
            authenticated: true
          })
    .when('/allocationList', {
            templateUrl: 'app/views/pages/allocation/allocationList.html',
            controller : 'allocationCtrl',
            authenticated: true
          })      
     .when('/createAllocation', {
            templateUrl: 'app/views/pages/allocation/createAllocation.html',
            controller : 'createAllocationCtrl',
            authenticated: true
          })            	            

     .when('/Resource Mapping', {
            templateUrl: 'app/views/pages/resourcemapping/resourceMapping.html',
            authenticated: true
          })	            
	.when('/Resource Type', {
            templateUrl: 'app/views/pages/admin/resourceType.html',
            authenticated: true
          })
	.when('/AvailableActualMandays', {
            templateUrl: 'app/views/pages/data/AvailableActualMandays.html',
            authenticated: true
          })
	.when('/IdleTime', {
            templateUrl: 'app/views/pages/data/IdleTime.html',
            authenticated: true
          })
	.when('/Utilisation', {
            templateUrl: 'app/views/pages/data/Utilisation.html',
            authenticated: true
          })
	.when('/Home', {
            templateUrl: 'app/views/pages/reporting/dashboard.html',
            authenticated: true
          })

	.when('/All Graphs',{
		templateUrl: 'app/views/pages/reporting/graphs.html',
        authenticated: true
	})

	.otherwise({redirectTo: '/Home'});

	$locationProvider.html5Mode({
		enabled:true,
		requireBase:false
	});
});

app.run(['$rootScope','Auth','$location',function($rootScope, Auth, $location){

	$rootScope.$on('$routeChangeStart', function(event, next, current){	

		if(next.$$route.authenticated ==  true){	
			if(!Auth.isLoggedIn()){
				event.preventDefault();
				$location.path('/login');
			}		
				
		}else if(next.$$route.authenticated == false){
			if(Auth.isLoggedIn()){
				console.log('Check1');
				event.preventDefault();
				$location.path('/Home');

			}
		}
	});

}]);