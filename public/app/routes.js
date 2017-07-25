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
       	}		

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
          }
          
      })

 	.state('root.home', {
          url: '/Home',          
          views: {
            'container@': {
              templateUrl: 'app/views/pages/reporting/dashboard.html'
            }
          }

        })

	.state('root.logout',{
		url:'/logout',		
		views: {
            'container@': {
              templateUrl: 'app/views/pages/users/logout.html'	
       		 }       		
       	}		

	})

	.state('root.about',{
		url:'/about',
		views: {
            'container@': {
              templateUrl: 'app/views/pages/about.html'
       		 }
       	}		
	})

	.state('root.register',{
		url:'/register',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/register.html',		      
	           	controller: 'regCtrl',
				controllerAs: 'register',
       		 }
       	}		
	})

	.state('root.changepassword',{
		url:'/changepassword',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/users/changepassword.html'		      	     
       		 }
       	}
	})

	.state('root.profile',{
		url:'/profile',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/users/profile.html'		      	     
       		 }
       	}
	})

	.state('root.SkillSet',{
		url:'/SkillSet',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/skillSet.html',
              	controllerAs: 'skill'	      	     
       		 }
       	}
	})

	.state('root.Project',{
		url:'/Project',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/project.html'
       		 }
       	}
	})

	.state('root.Status',{
		url:'/Status',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/status.html'
       		 }
       	}
	})
	

	.state('root.Role',{
		url:'/Role',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/role.html'
       		 }
       	}
	})

	.state('root.Designation',{
		url:'/Designation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/designation.html'
       		 }
       	}
	})

	.state('root.Resource',{
		url:'/Resource',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/resource.html'
       		 }
       	}
	})

	.state('root.Holiday List',{
		url:'/Holiday List',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/holidayList.html'
       		 }
       	}
	})


	.state('root.Region',{
		url:'/Region',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/region.html'
       		 }
       	}
	})


	.state('root.Location',{
		url:'/AllLocation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/location.html'
       		 }
       	}
	})


	.state('root.Add Leave',{
		url:'/Add Leave',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/leave.html'
       		 }
       	}
	})


	.state('root.allocationList',{
		url:'/allocationList',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/allocation/allocationList.html',
              	controller : 'allocationCtrl'
       		 }
       	}
	})

	.state('root.createAllocation',{
		url:'/createAllocation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/allocation/createAllocation.html',
              	controller : 'createAllocationCtrl'
       		 }
       	}
	})

	.state('root.Resource Mapping',{
		url:'/Resource Mapping',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/resourcemapping/resourceMapping.html'              	
       		 }
       	}
	})


	.state('root.Resource Type',{
		url:'/Resource Type',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/admin/resourceType.html'
       		 }
       	}
	})

	.state('root.AvailableActualMandays',{
		url:'/AvailableActualMandays',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/data/AvailableActualMandays.html'
       		 }
       	}
	})

	.state('root.IdleTime',{
		url:'/IdleTime',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/data/IdleTime.html'
       		 }
       	}
	})

	.state('root.Utilisation',{
		url:'/Utilisation',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/data/Utilisation.html'
       		 }
       	}
	})

	.state('root.All Graphs',{
		url:'/All Graphs',
		views: {
            'container@': {
              	templateUrl: 'app/views/pages/reporting/graphs.html'
       		 }
       	}
	})
            
	 $locationProvider.html5Mode(true);
});


app.run(['$rootScope','Auth','$location',function($rootScope, Auth, $location){

    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        console.log("Inside stateChangeStart");
    });

}]);

var onlyLoggedIn = function ($location,$q,Auth) {
    var deferred = $q.defer();
    if (Auth.isLoggedIn()) {
        deferred.resolve();
    } else {
        deferred.reject();        
        $location.url('/login');
    }
    return deferred.promise;
};