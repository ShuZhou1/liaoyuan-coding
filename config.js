(function(){
    angular
        .module("TaxCalApp")
        .config(configuration);

    function configuration($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'index.html',
                controller: 'MainController',
                controllerAs: 'model'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
})();

