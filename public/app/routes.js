var app = angular.module('appRoutes',['ui.router'])
.config(function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider,$locationProvider){
	
	$urlRouterProvider.otherwise('/home');
	$urlMatcherFactoryProvider.caseInsensitive(true);
  	$urlMatcherFactoryProvider.strictMode(false);

	$stateProvider

	.state('login',{
		url:'/login',
		authenticated: false,
		views: {
            'container@': {
              templateUrl: 'app/views/pages/users/login.html',
              controller:'mainController',
			  controllerAs:'main'		      
       		 }       		
       	},
    data : { pageTitle: 'Login' }  		

	})

	.state('root', {
        abstract: true,
        url: '', 
        views: {
            'header': {
              templateUrl: 'app/views/pages/users/mainmenu.html',
              controller:"menuCtrl"              
            },
            'footer':{
              templateUrl: 'app/views/pages/users/footer.html'              
            }
          },
          resolve :{
          	loggedIn:onlyLoggedIn
          },
          data : { pageTitle: 'Home' }
          
      })

 	.state('root.home', {
          url: '/Home',          
          views: {
            'container@': {
              templateUrl: 'app/views/pages/reporting/dashboard.html'
            }
          },
          data : { pageTitle: 'Home' }

        })

	.state('root.logout',{
		url:'/logout',		
		views: {
            'container@': {
              templateUrl: 'app/views/pages/users/logout.html'	
       		 }       		
       	},
        data : { pageTitle: 'Logout' }
		

	})

	.state('root.about',{
		url:'/about',
		views: {
            'container@': {
              templateUrl: 'app/views/pages/about.html'
       		 }
       	},
    data : { pageTitle: 'About' }	
	})

	.state('root.register',{
		url:'/register',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/register.html',		      
	           	controller: 'regCtrl',
				controllerAs: 'register',
       		 }
       	},
    data : { pageTitle: 'Register' } 		
	})

	.state('root.changepassword',{
		url:'/changepassword',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/users/changepassword.html'		      	     
       		 }
       	},
    data : { pageTitle: 'Change Password' } 
	})

	.state('root.profile',{
		url:'/profile',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/users/profile.html'		      	     
       		 }
       	},
        data : { pageTitle: 'Profile' } 
	})

	.state('root.SkillSet',{
		url:'/SkillSet',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/skillSet.html',
              	controllerAs: 'skill'	      	     
       		 }
       	},
    data : { pageTitle: 'Skill Set' } 
	})

	.state('root.Project',{
		url:'/Project',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/project.html'
       		 }
       	},
    data : { pageTitle: 'Project' } 
	})

	.state('root.Status',{
		url:'/Status',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/status.html'
       		 }
       	},
    data : { pageTitle: 'Status' } 
	})
	

	.state('root.Role',{
		url:'/Role',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/role.html'
       		 }
       	},
    data : { pageTitle: 'Role' } 
	})

	.state('root.Designation',{
		url:'/Designation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/designation.html'
       		 }
       	},
    data : { pageTitle: 'Designation' } 
	})

	.state('root.Resource',{
		url:'/Resource',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/resource.html'
       		 }
       	},
    data : { pageTitle: 'Resource' } 
	})

	.state('root.Holiday List',{
		url:'/Holiday List',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/holidayList.html'
       		 }
       	},
    data : { pageTitle: 'Holiday List' } 
	})


	.state('root.Region',{
		url:'/Region',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/region.html'
       		 }
       	},
    data : { pageTitle: 'Region' } 
	})


	.state('root.Location',{
		url:'/AllLocation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/location.html'
       		 }
       	},
    data : { pageTitle: 'Location' } 
	})


	.state('root.Add Leave',{
		url:'/Add Leave',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/leave.html'
       		 }
       	},
    data : { pageTitle: 'Add Leave' }  
	})


	.state('root.allocationList',{
		url:'/allocationList',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/allocation/allocationList.html',
              	controller : 'allocationCtrl'
       		 }
       	},
    data : { pageTitle: 'Allocation List' }        
	})

	.state('root.createAllocation',{
		url:'/createAllocation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/allocation/createAllocation.html',
              	controller : 'createAllocationCtrl'
       		 }
       	},
    data : { pageTitle: 'Create Allocation' }
	})

	.state('root.Resource Mapping',{
		url:'/Resource Mapping',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/resourcemapping/resourceMapping.html'              	
       		 }
       	},
    data : { pageTitle: 'Resource Mapping' }
	})


	.state('root.Resource Type',{
		url:'/Resource Type',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/resourceType.html'
       		 }
       	},
    data : { pageTitle: 'Resource Type' }
	})

	.state('root.AvailableActualMandays',{
		url:'/AvailableActualMandays',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/data/AvailableActualMandays.html'
       		 }
       	},
    data : { pageTitle: 'Available Actual Mandays' } 
	})

	.state('root.IdleTime',{
		url:'/IdleTime',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/data/IdleTime.html'
       		 }
       	},
    data : { pageTitle: 'IdleTime' } 
	})

	.state('root.Utilisation',{
		url:'/Utilisation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/data/Utilisation.html'
       		 }
       	},
    data : { pageTitle: 'Utilisation' } 
	})

	.state('root.All Graphs',{
		url:'/All Graphs',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/reporting/graphs.html'
       		 }
       	},
    data : { pageTitle: 'All Graphs' } 
	})
            
	 $locationProvider.html5Mode(true);
});


app.run(['$rootScope','Auth','$location','$state', '$stateParams',function($rootScope, Auth, $location,$state, $stateParams){
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$locationChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
    });
    $rootScope.$on('$locationChangeStart', function(e, toState, toParams, fromState, fromParams) {
    });

}]);

var onlyLoggedIn = function ($location,$q,Auth) {
    var deferred = $q.defer();
    //console.log("check1")
    //console.log(Auth.isLoggedIn());
    if (Auth.isLoggedIn()) {
        Auth.getUser().then(function(data){
        if(angular.isUndefined(data.data.message)){
          deferred.resolve();
        }else{
          deferred.reject();        
          $location.url('/login');
        }
        });
    } else {
        deferred.reject();        
        $location.url('/login');
    }
    return deferred.promise;
};