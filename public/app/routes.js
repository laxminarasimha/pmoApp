var app = angular.module('appRoutes', ['ui.router'])
	.config(function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider) {

		$urlRouterProvider.otherwise('/allocationList');
		$urlMatcherFactoryProvider.caseInsensitive(true);
		$urlMatcherFactoryProvider.strictMode(false);

		$stateProvider

			.state('login', {
				url: '/login',
				authenticated: false,
				views: {
					'container@': {
						templateUrl: 'app/views/pages/users/login.html',
						controller: 'mainController',
						controllerAs: 'main'
						
					}
				},
				data: { pageTitle: 'Login' }
			})

			.state('root', {
				abstract: true,
				url: '',
				views: {
					'header': {
						templateUrl: 'app/views/pages/users/mainmenu.html',
						controller: 'menuCtrl'
					},
					'footer': {
						templateUrl: 'app/views/pages/users/footer.html'
					}
				},
				resolve: {
					loggedIn: onlyLoggedIn
				},
				data: { pageTitle: 'Allocation List', roles: ['ADMIN'] }

			})

			

			.state('root.logout', {
				url: '/logout',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/users/logout.html'
					}
				},
				data: { pageTitle: 'Logout', roles: ['ADMIN'] }


			})

			.state('root.about', {
				url: '/about',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/about.html'
					}
				},
				data: { pageTitle: 'About', roles: ['ADMIN'] }
			})

			.state('root.register', {
				url: '/register',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/register.html',
						controller: 'regCtrl',
						controllerAs: 'register',
					}
				},
				data: { pageTitle: 'Register', roles: ['ADMIN'] }
			})

			.state('root.changepassword', {
				url: '/changepassword',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/users/changepassword.html'
					}
				},
				data: { pageTitle: 'Change Password', roles: ['ADMIN'] }
			})

			.state('root.profile', {
				url: '/profile',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/users/profile.html'
					}
				},
				data: { pageTitle: 'Profile', roles: ['ADMIN'] }
			})

			.state('root.SkillSet', {
				url: '/SkillSet',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/skillSet.html',
						controllerAs: 'skill'
					}
				},
				data: { pageTitle: 'Skill Set', roles: ['ADMIN'] }
			})

			.state('root.Project', {
				url: '/Project',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/project.html'
					}
				},
				data: { pageTitle: 'Project', roles: ['ADMIN'] }
			})

			.state('root.ECRManagement', {
				url: '/ECRManagement',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/ECRManagement.html'
					}
				},
				data: { pageTitle: 'ECRManagement', roles: ['ADMIN'] }
			})

			.state('root.Status', {
				url: '/Status',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/status.html'
					}
				},
				data: { pageTitle: 'Status', roles: ['ADMIN'] }
			})


			.state('root.Role', {
				url: '/Role',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/role.html'
					}
				},
				data: { pageTitle: 'Role', roles: ['ADMIN'] }
			})

			.state('root.Designation', {
				url: '/Designation',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/designation.html'
					}
				},
				data: { pageTitle: 'Designation', roles: ['ADMIN'] }
			})

			.state('root.Resource', {
				url: '/Resource',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/resource.html'
					}
				},
				data: { pageTitle: 'Resource', roles: ['ADMIN'] }
			})

			.state('root.Holiday List', {
				url: '/Holiday List',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/holidayList.html'
					}
				},
				data: { pageTitle: 'Holiday List', roles: ['ADMIN'] }
			})


			.state('root.Region', {
				url: '/Region',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/region.html'
					}
				},
				data: { pageTitle: 'Region', roles: ['ADMIN'] }
			})


			.state('root.Location', {
				url: '/Location',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/location.html'
					}
				},
				data: { pageTitle: 'Location', roles: ['ADMIN'] }
			})


			.state('root.Leave', {
				url: '/Leave',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/leave.html'
					}
				},
				data: { pageTitle: 'Add Leave', roles: ['ADMIN'] }
			})

			.state('root.allocationList', {
				url: '/allocationList',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/allocation/allocationList.html',
					}
				},
				data: { pageTitle: 'Allocation List', roles: ['ADMIN'] }
			})

			.state('root.createAllocation', {
				url: '/createAllocation',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/allocation/createAllocation.html',
					}
				},
				data: { pageTitle: 'Create Allocation', roles: ['ADMIN'] }
			})

			.state('root.filterAllocation', {
				url: '/filterAllocation',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/allocation/filterAllocation.html',
					}
				},
				data: { pageTitle: 'Filter Allocation', roles: ['ADMIN'] }
			})

			.state('root.Resources', {
				url: '/Resources',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/resourcemapping/resourceMapping.html'
					}
				},
				data: { pageTitle: 'Resources', roles: ['ADMIN'] }
			})


			.state('root.Resource Type', {
				url: '/Resource Type',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/resourceType.html'
					}
				},
				data: { pageTitle: 'Resource Type', roles: ['ADMIN'] }
			})

			.state('root.AvailableActualMandays', {
				url: '/AvailableActualMandays',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/data/AvailableActualMandays.html'
					}
				},
				data: { pageTitle: 'Available Actual Mandays', roles: ['ADMIN'] }
			})

			.state('root.IdleTime', {
				url: '/IdleTime',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/data/IdleTime.html'
					}
				},
				data: { pageTitle: 'IdleTime' }
			})

			.state('root.Utilisation', {
				url: '/Utilisation',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/data/Utilisation.html'
					}
				},
				data: { pageTitle: 'Utilisation', roles: ['ADMIN'] }
			})

			.state('root.Graph', {
				url: '/Graph',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/reporting/graphs.html'
					}
				},
				data: { pageTitle: 'Graph', roles: ['ADMIN'] }
			})

			.state('root.TestGraph', {
				url: '/TestGraph',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/reporting/testgraph.html'
					}
				},
				data: { pageTitle: 'TestGraph', roles: ['ADMIN'] }
			})

			.state('root.File Upload', {
				url: '/File Upload',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/admin/fileUpload.html'
					}
				},
				data: { pageTitle: 'File Upload', roles: ['ADMIN'] }
			})
			.state('root.SLA', {
				url: '/SLA',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/sla/slaUpload.html'
					}
				},
				data: { pageTitle: 'SLA', roles: ['ADMIN'] }
			})
			.state('root.Graphs', {
				url: '/Graphs',
				views: {
					'container@': {
						templateUrl: 'app/views/pages/reporting/graphs/graph.html'
					},
					'filters@root.Graphs': {
						templateUrl: 'app/views/pages/reporting/graphs/filter.html'
					}

				},
				data: { pageTitle: 'Graphs', roles: ['ADMIN'] }
			})
			.state('root.ebresource', {
				url: '/ebresource',
				views: {
					'container@': {
						templateUrl: '/app/views/pages/resource/ebresource.html'
					},
					'filters@root.Graphs': {
						templateUrl: 'app/views/pages/reporting/graphs/filter.html'
					}

				},
				data: { pageTitle: 'Graphs', roles: ['ADMIN'] }
			})
			.state('root.esesresource', {
				url: '/esesresource',
				views: {
					'container@': {
						templateUrl: '/app/views/pages/resource/esesresource.html'
					},
					'filters@root.Graphs': {
						templateUrl: 'app/views/pages/reporting/graphs/filter.html'
					}

				},
				data: { pageTitle: 'Graphs', roles: ['ADMIN'] }
			})
			.state('root.hcresource', {
				url: '/hcresource',
				views: {
					'container@': {
						templateUrl: '/app/views/pages/resource/hcresource.html'
					},
					'filters@root.Graphs': {
						templateUrl: 'app/views/pages/reporting/graphs/filter.html'
					}

				},
				data: { pageTitle: 'Graphs', roles: ['ADMIN'] }
			})

		$locationProvider.html5Mode(true);
	});


app.run(['$rootScope', 'Auth', '$location', '$state', '$stateParams',function ($rootScope, Auth, $location, $state, $stateParams) {
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;


	$rootScope.$on('$locationChangeSuccess', function (e, toState, toParams, fromState, fromParams) {

	});



	$rootScope.$on('$locationChangeStart', function (e, toState, toParams, fromState, fromParams) {



	});

}]);

var onlyLoggedIn = function ($location, $q, Auth) {
	var deferred = $q.defer();
	//console.log("check1")
	//console.log(Auth.isLoggedIn());
	if (Auth.isLoggedIn()) {
		Auth.getUser().then(function (data) {
			if (angular.isUndefined(data.data.message)) {
				deferred.resolve();
			} else {
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