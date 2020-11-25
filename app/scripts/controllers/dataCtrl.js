(function () {
  'use strict';

  angular.module('orzaApp.controllers', ['ngCookies', 'ngMaterial', 'ngRoute'])
    .controller('dataCtrl', ['$scope', '$rootScope','$http', '$timeout', '$filter', '$cookieStore', '$mdDialog', '$location',
    function($scope, $rootScope, $http, $timeout, $filter, $cookieStore, $mdDialog, $location) {
    // module retrieves data and names from MySQL request, calculates statistics for all funds, creates buy, sell and portfolio
    // review if we can move to other controllers buy, sell, load and save functions
    if ($rootScope.loginState != "ok") $location.path( "/login" );
    // array of all funds and their calculations
    $rootScope.TotalData = [];

    // array for individual funds of extra graph
    $rootScope.orgData = [];

    // array for individual funds to draw every funds graph
    $rootScope.arr = [];
    
    // array for individual funds to get real data for store into database.
    $rootScope.arrCnt = [];

    // array for running total funds to store current counts
    $rootScope.arrSum = [];

    // array for total sum
    $rootScope.arrTotalSum = []; 

    // array for save/load data into/from cookies
    // data : every funds value, portfolio name
    $rootScope.cookieInfo = [];
    
    // array for userlist from portfolio table of database
    $rootScope.arrDBUserList = [];

    //loading screen
    $rootScope.loadingShow = "hide";

    // array for other user's portfolio data
    $rootScope.arrOtherUserData = [];

    // arrau for other user's portfolio data
    $rootScope.arrOtherPortfolio = [];
    
    // array of fund ids
    var f_index = [40,48,51,54,59,80,88,104,105,106,126,149,176,179,190];
    //  arrays of fund names, i.e., for fund 40 it's n[40][0].alias
    var n = []; n.push([]);
    $http.get('/ret1').success(function (fundnames) {
        for (var i=0; i<f_index.length; i++){
            n[f_index[i]] = $filter('filter')(fundnames, function (d) { return d.fund_id_alias_fund === f_index[i]; });
        };
    });

    $http.get('/userInfo').success(function (portnames){
        var temp = {portfolio_id : "none" , portfolio_name_saver : "No Selected"};        
        $rootScope.arrDBUserList = portnames;
        $rootScope.arrDBUserList.unshift(temp);
    });
    
    // arrays of funds and their calculations
    $http.get('/ret').success(function (rows) {
        var f = [];
        // loop to create fund-filtered arrays
        for (var i=0; i<f_index.length; i++){
            f[f_index[i]] = $filter('filter')(rows, function (d) { return d.fund_id_pr_fund === f_index[i]; });
        }
        // creating arrays for each calculation
        // units, 1dreturn, 1dloss, 7dloss, 91dreturn, 182dreturn, 365dreturn, startyearreturn, startfundreturnindividualdates, startfundreturnequaldate
        var arru =[]; var arr1dr = []; var arr1dl = []; var arr7dl = []; var arr91dr = []; var arr182dr = []; var arr365dr = []; var arryr = []; var arrisr = [];var arresr = [];
        var arrudate =[]; var arr1drdate = []; var arr1dldate = []; var arr7dldate = []; var arr91drdate = []; var arr182drdate = []; var arr365drdate = []; var arryrdate = []; var arrisrdate = [];var arresrdate = [];
        var u=0; var day1_return=0; var day1_loss=0; var day7_loss=0; var day91_return=0; var day182_return=0; var day365_return=0; var year_return=0; var start_return=0; var dt=0;
        // nested loop to create array of funds and fund calculations
        for (var j=0; j<f_index.length; j++){
            arru.push([]); arr1dr.push([]); arr1dl.push([]); arr7dl.push([]); arr91dr.push([]); arr182dr.push([]); arr365dr.push([]); arryr.push([]); arrisr.push([]); arresr.push([]);
            arrudate.push([]); arr1drdate.push([]); arr1dldate.push([]); arr7dldate.push([]); arr91drdate.push([]); arr182drdate.push([]); arr365drdate.push([]); arryrdate.push([]); arrisrdate.push([]); arresrdate.push([]);
            for (var i = 0; i < f[f_index[j]].length; i++) {
                u = f[f_index[j]][i].pr_fund;
                if (i == 0) { day1_return = 0 } else { day1_return = (u / f[f_index[j]][i-1].pr_fund) - 1 };
                if (i == 0) { day1_loss = 0 } else { day1_loss = Math.min((u / f[f_index[j]][i-1].pr_fund) - 1, 0) };
                if (i <= 7) { day7_loss = 0 } else { day7_loss = Math.min((u / f[f_index[j]][i-7].pr_fund) - 1,0) };
                if (i <= 91) { day91_return = 0 } else { day91_return = (u / f[f_index[j]][i-91].pr_fund) - 1 };
                if (i <= 182) { day182_return = 0 } else { day182_return = (u / f[f_index[j]][i-182].pr_fund) - 1 };
                if (i <= 365) { day365_return = 0 } else { day365_return = (u / f[f_index[j]][i-365].pr_fund) - 1 };
                if (f[f_index[j]][i].year_start == null) { f[f_index[j]][i].year_start = f[f_index[j]][0].pr_fund };
                if (i == 0) { year_return = 0 } else { year_return = (u / f[f_index[j]][i].year_start) - 1 };
                if (i == 0) { start_return = 0 } else { start_return = (u / f[f_index[j]][0].pr_fund) - 1 };
                dt = new Date(f[f_index[j]][i].date_value_pr_fund);
                // pushing calculations into arrays.
                arru[j].push(u);arrudate[j].push(dt);
                arr1dr[j].push(day1_return);arr1drdate[j].push(dt);
                arr1dl[j].push(day1_loss);arr1dldate[j].push(dt);
                arr7dl[j].push(day7_loss);arr7dldate[j].push(dt);
                arr91dr[j].push(day91_return);arr91drdate[j].push(dt);
                arr182dr[j].push(day182_return);arr182drdate[j].push(dt);
                arr365dr[j].push(day365_return);arr365drdate[j].push(dt);
                arryr[j].push(year_return);arryrdate[j].push(dt);
                arrisr[j].push(start_return);arrisrdate[j].push(dt);
                arresr[j].push(start_return)
            }
        }

        // filling TotalData array with each fund
        for (var i = 0; i < f_index.length; i ++){
            var item = {'name' : '', 'u' : '', 'udate':'', 'ulen' : '', 'uIsLoaded' : false, 'index' : 0}; 
            item.name = n[f_index[i]][0].alias;
            item.u = arru[i];
            item.udate = arrudate[i];
            item.ulen = item.u.length;
            item.uIsLoaded = true;
            item.index = f_index[i];
            $rootScope.TotalData[i] = item;
        }
        $rootScope.TotalData.splice(4, 1); // Remove f59 data
        $rootScope.orgData = $rootScope.TotalData[0].u; // for draw new graph
        $rootScope.m_nSelIndex = 0; // Current selected index


        // initializing the units for each fund at 1, the user's name and the slider date
        for (var i = 0; i < $rootScope.TotalData.length; i ++){
            $rootScope.cookieInfo[i] = 1;
        }        
        $rootScope.username = ""; //portfolio name
        $rootScope.curDate = new Date();

        $rootScope.isLoad = false; // 0 or 1 flag value which express load date from cookie
        $rootScope.isRecRet = true; // 0 or 1 flag value which express get data from server index.html
        $rootScope.mainGraphDate = arrudate[0]; // Date for Portfolio Graph
        
        // filling $rootScope.arr with individual fund data for each graph
        for (var i = 0; i < $rootScope.TotalData.length; i ++){
            var arr_Tmp = [];
            for (var j = 0; j < $rootScope.TotalData[i].u.length; j ++){
                arr_Tmp[j] = 0;
            }            
            $rootScope.arr[i] = arr_Tmp;
            $rootScope.arrTotalSum[i] = 0;
        }   

        // filling $rootScope.arrCnt with individual fund data for each graph
        for (var i = 0; i < $rootScope.TotalData.length; i ++){
            var arr_Tmp = [];
            for (var j = 0; j < $rootScope.TotalData[i].u.length; j ++){
                arr_Tmp[j] = 0;
            }            
            $rootScope.arrCnt[i] = arr_Tmp;
        }

        // filling $rootScope.arrSum with individual fund data for each graph
        for (var i = 0; i < $rootScope.TotalData.length; i ++){
            var arr_Tmp = [];
            for (var j = 0; j < $rootScope.TotalData[i].u.length; j ++){
                arr_Tmp[j] = 0;
            }            
            $rootScope.arrSum[i] = arr_Tmp;
        }

        // filling $rootScope.arrOtherUserData with individual fund data for each graph
        for (var i = 0; i < $rootScope.TotalData.length; i ++){
            var arr_Tmp = [];
            for (var j = 0; j < $rootScope.TotalData[i].u.length; j ++){
                arr_Tmp[j] = 0;
            }            
            $rootScope.arrOtherUserData[i] = arr_Tmp;
        }

        var loadedCookie = $cookieStore.get('Orza');
        if (loadedCookie != undefined) $rootScope.username = loadedCookie.username;        
    });
    $rootScope.onChangeUserList = function(value){
        $rootScope.loadingShow = "show";
        $http.get('/transaction/' + value).success(function (transactions) {
            // init array
            for (var i = 0; i < $rootScope.arrOtherUserData.length; i ++){
                for (var j = 0; j < $rootScope.arrOtherUserData[i].length; j ++){
                    $rootScope.arrOtherUserData[i][j] = 0;
                }
            }
            // sorting by date_value_transactio field of the database
            transactions.sort(function(a, b){
                var keyA = new Date(a.date_value_transaction),
                    keyB = new Date(b.date_value_transaction);
                // Compare the 2 dates
                if(keyA < keyB) return -1;
                if(keyA > keyB) return 1;
                return 0;
            });
            
            // calculate data and store into arrOtherUserData
            for (var i = 0; i < transactions.length; i ++){
                if (transactions[i].fund_id_bought == 999){
                    transactions[i].fund_id_bought = transactions[i].fund_id_sold;
                    transactions[i].fund_id_sold = 999;
                    transactions[i].units_bought = -transactions[i].units_bought;
                }

                var fundIndex = f_index.indexOf(transactions[i].fund_id_bought);
                var transactionDate = new Date(transactions[i].date_value_transaction);
                var dateIndex = -1;
                for (var j = 0; j < $rootScope.mainGraphDate.length; j ++){
                    var curDate = new Date($rootScope.mainGraphDate[j]);
                    if (curDate - transactionDate == 0){
                        dateIndex = j;
                        break;
                    }
                }
                $rootScope.arrOtherUserData[fundIndex][dateIndex] = transactions[i].units_bought;
                // console.log("index = " + fundIndex);
                // console.log("date index = " + dateIndex);
                // console.log(transactions[i]);
            }
            
            for (var i = 0; i < $rootScope.arrOtherUserData.length; i ++){
                var temp = 0;
                var new999Price = 0;
                for (var j = 0; j < $rootScope.arrOtherUserData[i].length; j ++){
                    if ($rootScope.arrOtherUserData[i][j] != 0){
                        temp = temp + $rootScope.arrOtherUserData[i][j];
                        new999Price = new999Price + $rootScope.TotalData[i].u[j] * $rootScope.arrOtherUserData[i][j];                        
                    }
                    $rootScope.arrOtherUserData[i][j] = temp * $rootScope.TotalData[i].u[j] - new999Price;
                }
            }

            // for (var i = 0; i < $rootScope.arrOtherUserData.length; i ++){
            //     var new999Price = 0;
            //     for (var j = 0; j < $rootScope.arrOtherUserData[i].length; j ++){
            //         $rootScope.arrOtherUserData[i][j] = $rootScope.arrOtherUserData[i][j] * $rootScope.TotalData[i].u[j];
            //     }
            // }

            // Calculate Portfolio Data
            ///////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////
            var newArr = [];
            for (var i = 0; i < $rootScope.TotalData[0].ulen; i++){
                var sum = 0;
                for (var j = 0; j < $rootScope.TotalData.length; j ++){
                    sum = sum + $rootScope.arrOtherUserData[j][i];
                }
                newArr.push(sum);
            }
            $rootScope.arrOtherPortfolio = newArr;

            // console.log($rootScope.arrOtherUserData);
            $rootScope.loadingShow = "hide";
        });
    }
  }]);
}());

        // creating "data" to use in D3 for each of 15 funds [40,48,51,54,59,80,88,104,105,106,126,149,176,179,190] and calculation
        // units, 1dreturn, 1dloss, 7dloss, 91dreturn, 182dreturn, 365dreturn, startyearreturn, startfundreturnindividualdates, startfundreturnequaldate
        // TotalData[i].name : Label name
        // TotalData[i].u : same as f40_units
        // TotalData[i].udate : same as f40_udate
        // TotalData[i].ulen : same as f40_ulen
        // TotalData[i].uIsLoaded : same as f40_u_isLoaded

