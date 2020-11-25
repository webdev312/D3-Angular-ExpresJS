(function () {
  'use strict';

  angular.module('orzaApp.login')
    .controller('loginCtrl', ['$scope', '$rootScope', '$location', '$http' ,function($scope, $rootScope, $location, $http){
        $scope.loginTitle = "Login";
        $scope.loginStyle = {
            "float" : "right",
            "display" : "none"
        };
        $scope.nRand = Math.floor(1000 + Math.random() * 9000);
        console.log($scope.nRand);
        $scope.loginSubmit = function(){
            if ($scope.loginTitle == "Login"){
                var url = '/login/' + $scope.loginUser + '/' + $scope.loginPhone + '/' + $scope.nRand;
                $http.get(url).success(function (verify) {
                    if (verify == "verify"){
                        $scope.loginTitle = "Verify";
                        $scope.loginStyle = {
                            "float" : "right",
                            "display" : "block"
                        };
                    }
                    if (verify == "register"){
                        $rootScope.isRecRet = false;
                        $rootScope.loginState = "ok";
                        $location.path('/main');
                    }
                });   
            }
            if ($scope.loginTitle == "Verify"){
                if ($scope.loginVerify == $scope.nRand){
                    var url = '/loginupdate/' + $scope.loginUser + '/' + $scope.loginPhone;
                    $http.get(url).success(function (update) {
                        console.log(update);
                    });   
                    $rootScope.isRecRet = false;
                    $rootScope.loginState = "ok";
                    $location.path('/main');
                }else{
                    $scope.loginVerify = "";
                }
            }     
        };
  }]);
}());