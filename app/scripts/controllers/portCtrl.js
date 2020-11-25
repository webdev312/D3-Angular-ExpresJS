(function () {
  'use strict';

  angular.module('orzaApp.controllers')
    .controller('portCtrl', ['$scope', '$rootScope', '$interval', '$http', '$mdDialog', '$cookieStore',function($scope, $rootScope, $interval, $http, $mdDialog, $cookieStore){
      // creating original arrays for each of 15 funds [40,48,51,54,59,80,88,104,105,106,126,149,176,179,190] and calculation

      // initializing the model on number of units, except for fund 59
      // replaced static title with array from dataCtrl, corrected error on fund 59
      // What does each field of the object hold?
      $scope.listMessage = [
        "",
        "* No more items",
        ""];
      $scope.arr = {};
      $scope.arr.unitArr = [
        {title : $scope.f40_name, model : $scope.f40units, newVal : $scope.f40last, linedata : $scope.f40chart, lineID : 'line1', index: 0, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f48_name, model : $scope.f48units, newVal : $scope.f48last, linedata : $scope.f48chart, lineID : 'line2', index: 1, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f51_name, model : $scope.f51units, newVal : $scope.f51last, linedata : $scope.f51chart, lineID : 'line3', index: 2, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f54_name, model : $scope.f54units, newVal : $scope.f54last, linedata : $scope.f54chart, lineID : 'line4', index: 3, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f80_name, model : $scope.f80units, newVal : $scope.f80last, linedata : $scope.f80chart, lineID : 'line5', index: 4, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f88_name, model : $scope.f88units, newVal : $scope.f88last, linedata : $scope.f88chart, lineID : 'line6', index: 5, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f104_name, model : $scope.f104units, newVal : $scope.f104last, linedata : $scope.f104chart, lineID : 'line7', index: 6, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f105_name, model : $scope.f105units, newVal : $scope.f105last, linedata : $scope.f105chart, lineID : 'line8', index: 7, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f106_name, model : $scope.f106units, newVal : $scope.f106last, linedata : $scope.f106chart, lineID : 'line9', index: 8, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f126_name, model : $scope.f126units, newVal : $scope.f126last, linedata : $scope.f126chart, lineID : 'line10', index: 9, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f149_name, model : $scope.f149units, newVal : $scope.f149last, linedata : $scope.f149chart, lineID : 'line11', index: 10, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f176_name, model : $scope.f176units, newVal : $scope.f176last, linedata : $scope.f176chart, lineID : 'line12', index: 11, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f179_name, model : $scope.f179units, newVal : $scope.f179last, linedata : $scope.f179chart, lineID : 'line13', index: 12, option : '', bos: true, bosTitle:'Buy'},
        {title : $scope.f190_name, model : $scope.f190units, newVal : $scope.f190last, linedata : $scope.f190chart, lineID : 'line14', index: 13, option : '', bos: true, bosTitle:'Buy'}
      ];
      // filling arr.unitArr from TotalData
      for (var i = 0; i < $scope.arr.unitArr.length; i ++)
      {
        $scope.arr.unitArr[i].title = $rootScope.TotalData[i].name;
        $scope.arr.unitArr[i].model = 0;
        $scope.arr.unitArr[i].newVal = $rootScope.TotalData[i].u[$rootScope.TotalData[i].ulen - 1];
        $scope.arr.unitArr[i].index = i;
        $scope.arr.unitArr[i].option = $rootScope.TotalData[i].name;
        $scope.arr.unitArr[i].classname = $rootScope.TotalData[i].name + '_class';
      }

      $scope.arr.username = $rootScope.username;
      $scope.arr.sliderDisable = false;
      $scope.arr.selectedFunds = "";
      $scope.arr.errModel = "";
      $rootScope.m_nSelIndex = 0;

      // Resize slider width same as graph width
      var width = 0;
      if (window.innerWidth >= 960) width = window.innerWidth * 3/4;
      else if (window.innerWidth < 960 && window.innerWidth >= 600) width = window.innerWidth;
      else width = window.innerWidth;
      $scope.arr.SliderStyle = width+'px';


      // creating the first array of portfolio to be rendered
      $scope.unitChanged = function() {
        if (!isNaN($scope.arr.unitArr[$rootScope.m_nSelIndex].model)){
          $scope.updateUnitBySwitchValue(); // if user switch buy to sell, the value 8 would be changed into -8
          $scope.checkSellCount(); // if user have 5 items and he is going to sell 8, in this case, the value -8 will be changed into -5
          $scope.drawEachChart(); // Draw every element graph
          $scope.updateSlider(); // What does this do?
          $scope.drawChart(); // Draw portfolio graph
          $scope.disableSlider(); //Disable Slider
        }
      };

      // Disable Slider
      $scope.disableSlider = function(){
        if ($scope.arr.unitArr[$rootScope.m_nSelIndex].model == $rootScope.arrCnt[$rootScope.m_nSelIndex][$rootScope.sliderIndex]){
          $scope.arr.sliderDisable = false;
        }else{
          $scope.arr.sliderDisable = true;
        }
      }

      $scope.checkSellCount = function(){
        $scope.errorMessage(0);
        if ($scope.arr.unitArr[$rootScope.m_nSelIndex].model < 0){
          var nCurIndex = -1;
          for (var i = 0; i < $rootScope.TotalData[$rootScope.m_nSelIndex].ulen; i ++){
            var sliderDate = new Date($rootScope.curDate);
            var everyDate = new Date($rootScope.TotalData[$rootScope.m_nSelIndex].udate[i]);
            
            if (sliderDate - everyDate == 0){
              nCurIndex = i;
              break;
            }
          }
          if (nCurIndex > -1){
            if ($rootScope.arrTotalSum[$rootScope.m_nSelIndex] >= Math.abs($scope.arr.unitArr[$rootScope.m_nSelIndex].model)){
              var nItemCnt = $rootScope.arrSum[$rootScope.m_nSelIndex][nCurIndex - 1];
              if (Math.abs($scope.arr.unitArr[$rootScope.m_nSelIndex].model) > nItemCnt){
                $scope.arr.unitArr[$rootScope.m_nSelIndex].model = -nItemCnt;
              }
            }else{
              $scope.arr.unitArr[$rootScope.m_nSelIndex].model = -$rootScope.arrTotalSum[$rootScope.m_nSelIndex];
              $scope.errorMessage(1);
            }
          }
        }
      }

      $scope.errorMessage = function(index){
        $scope.arr.errModel = $scope.listMessage[index];
      }

      // update unit input value following switch value Buy or Sell
      $scope.updateUnitBySwitchValue = function(){
        $scope.arr.unitArr[$rootScope.m_nSelIndex].bos = ($scope.arr.unitArr[$rootScope.m_nSelIndex].model < 0) ? false : true;        
      }

      // calculate value of portfolio (units*price) for each date and fill temporary array
      $scope.drawChart = function (){
        var newArr = [];
        for (var i = 0; i < $rootScope.TotalData[0].ulen; i++) {
          var sum = 0;
          for (var j = 0; j < $rootScope.TotalData.length; j ++){
            // sum = sum + $rootScope.arr[j][i] * $scope.arr.unitArr[j].model;
            sum = sum + $rootScope.arr[j][i];
          }
          newArr.push(sum);         
        }
        // rootscope the portfolio array
        $rootScope.portfolio = newArr;
        // calculations for portfolio
        // 1dreturn, 1dloss, 7dloss, 91dreturn, 182dreturn, 365dreturn, startfundreturn
        // declaring portfolio calculations arrays
        var parru =[]; var parr1dr = []; var parr1dl = []; var parr7dl = []; var parr91dr = []; var parr182dr = []; var parr365dr = []; var parrisr = [];
        var u=0; var day1_return=0; var day1_loss=0; var day7_loss=0; var day91_return=0; var day182_return=0; var day365_return=0; var year_return=0; var start_return=0;
        // initializing portofolio calculations arrays
        // parru.push([]); parr1dr.push([]); parr1dl.push([]); parr7dl.push([]); parr91dr.push([]); parr182dr.push([]); parr365dr.push([]); parrisr.push([]);
        for (var k = 0; k < $rootScope.portfolio.length; k++) {
            u = $rootScope.portfolio[k];
            if ((k == 0) || ($rootScope.portfolio[k-1] == 0)) { day1_return = 0 } else { day1_return = (u / $rootScope.portfolio[k-1]) - 1 };
            if ((k == 0) || ($rootScope.portfolio[k-1] == 0)) { day1_loss = 0 } else { day1_loss = Math.min((u / $rootScope.portfolio[k-1]) - 1, 0) };
            if ((k <= 7) || ($rootScope.portfolio[k-7] == 0)) { day7_loss = 0 } else { day7_loss = Math.min((u / $rootScope.portfolio[k-7]) - 1, 0) };
            if ((k <= 91) || ($rootScope.portfolio[k-91] == 0)) { day91_return = 0 } else { day91_return = (u / $rootScope.portfolio[k-91]) - 1 };
            if ((k <= 182) || ($rootScope.portfolio[k-182] == 0)) { day182_return = 0 } else { day182_return = (u / $rootScope.portfolio[k-182]) - 1 };
            if ((k <= 365) || ($rootScope.portfolio[k-365] == 0)) { day365_return = 0 } else { day365_return = (u / $rootScope.portfolio[k-365]) - 1 };
            if (k == 0) { start_return = 0 } else { start_return = (u / $rootScope.portfolio[0]) - 1 };
            // pushing calculations into arrays.
            parru.push(u);
            parr1dr.push(day1_return);
            parr1dl.push(day1_loss);
            parr7dl.push(day7_loss);
            parr91dr.push(day91_return);
            parr182dr.push(day182_return);
            parr365dr.push(day365_return);
            parrisr.push(start_return);
        };
        // console.log(parru);console.log(parr1dr);console.log(parr1dl);console.log(parr7dl);console.log(parr91dr);console.log(parr182dr);console.log(parr365dr);console.log(parrisr);
        $rootScope.p91dr = parr91dr;
      };
      $scope.drawEachChart = function(){
        var n_curSelected = $rootScope.m_nSelIndex;        
        // Update graph data for every funds' graph
        if (n_curSelected > -1){
          var nSliderIndex = $rootScope.sliderIndex;
          var arrCntTmp = angular.copy($rootScope.arrCnt[n_curSelected]);
          
          if (nSliderIndex > -1){
            arrCntTmp[nSliderIndex] = $scope.arr.unitArr[n_curSelected].model;
          }

          var total = 0;
          var new999Price = 0;
          for (var i = 0; i < $rootScope.TotalData[n_curSelected].ulen; i ++){
            if (arrCntTmp[i] != 0){
              total = total + arrCntTmp[i];
              new999Price = new999Price + $rootScope.TotalData[n_curSelected].u[i] * arrCntTmp[i];
              new999Price = 0;
            }
            $rootScope.arr[n_curSelected][i] = total * $rootScope.TotalData[n_curSelected].u[i] - new999Price;
            $rootScope.arrSum[n_curSelected][i] = total;
          }          
        }
      };
      $scope.InitSlider = function(){
        $scope.minDate = $rootScope.TotalData[0].udate[0];
        $scope.maxDate = $rootScope.TotalData[0].udate[$rootScope.TotalData[0].ulen - 1];

        $scope.minValue = getFormattedString(new Date($scope.minDate));
        $scope.maxValue = getFormattedString(new Date($scope.maxDate));

        $scope.$watch('arr.slider', function (value) {
            if (value != undefined) {
              $scope.errorMessage(0);

              var st = getFormattedDate($rootScope.TotalData[0].udate[0]);
              var et = getFormattedDate($rootScope.TotalData[0].udate[$rootScope.TotalData[0].ulen - 1]);
              $scope.minDate = st;
              $scope.maxDate = et;

              var updatedDate = new Date($scope.minDate);
              $scope.selectedDate = getFormattedDate(updatedDate.setDate(updatedDate.getDate() + value));//Update date on set slider
              $rootScope.curDate = $scope.selectedDate;

              for (var i = 0; i < $rootScope.mainGraphDate.length; i ++){
                var dt = new Date($rootScope.mainGraphDate[i]);
                if (dt - updatedDate == 0){
                  $rootScope.sliderIndex = i;
                  $scope.arr.unitArr[$rootScope.m_nSelIndex].model = $rootScope.arrCnt[$rootScope.m_nSelIndex][i];
                  break;
                }
              }
              // $scope.updateSlider();
            }
        })
        function getFormattedString(date){ 
          var month = (date.getMonth()+1 < 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
          var day = (date.getDate()<10) ? '0'+date.getDate() : date.getDate();
          return month + '/' + day + '/' + date.getFullYear();
        }
        function getFormattedDate(stDate) {
            var sDate = new Date(stDate);
            return sDate;
        }
        function dayDiff(firstDate, secondDate) {
            var minDate = new Date(firstDate);
            var maxDate = new Date(secondDate);
            var timeDiff = Math.abs(maxDate.getTime() - minDate.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return diffDays;
        }

        $scope.selectedDate = new Date($scope.minDate);

        $scope.arr.sliderRange = dayDiff($scope.minDate, $scope.maxDate);
        $scope.arr.slider = $scope.arr.sliderRange;
      };

      $scope.updateSlider = function(){
        var newArr = [];
        for (var i = 0; i < $rootScope.TotalData[0].ulen; i++) {
          var max = new Date($scope.maxDate);
          var cur = new Date($rootScope.TotalData[0].udate[i]);
          if (cur <= max){
            var sum = 0;
            for (var j = 0; j < $rootScope.TotalData.length; j ++){
              sum = sum + $rootScope.TotalData[j].u[i] * $scope.arr.unitArr[j].model;
            }
            newArr.push(sum);         
          }
        }
        $rootScope.portfolio = newArr;
        // $scope.drawEachChart();
      };

      $scope.optChanged = function(){
        $rootScope.m_nSelIndex = -1;
        for (var i = 0; i < $rootScope.TotalData.length; i ++){
            if ($rootScope.TotalData[i].name == $scope.arr.selectedFunds){                
                $rootScope.m_nSelIndex = i;
                break;
            }
        }

        var classname = $scope.arr.selectedFunds;
        for (var i = 0; i < $scope.arr.unitArr.length; i ++){
          $scope.arr.unitArr[i].classname = "hide";          
        }
        for (var i = 0; i < $scope.arr.unitArr.length; i ++){
          var everyFundsName = $rootScope.TotalData[i].name;
          if (everyFundsName == classname){
            $scope.arr.unitArr[i].classname = "show";
          }
        }
        $rootScope.orgData = $rootScope.TotalData[$rootScope.m_nSelIndex].u;
      };

      $scope.onBuy = function(name){
        if (Math.abs($scope.arr.unitArr[$rootScope.m_nSelIndex].model) == 0) return;

        if ($rootScope.username.length < 1){
          $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title('Input Error')
              .textContent('Please input Portfolio name.')
              .ariaLabel('Alert Dialog Demo')
              .ok('Got it!')
          );
          return;
        }
        // initializing buyInfo object
        var buyInfo = {};
        buyInfo.username = $rootScope.username;
        buyInfo.unitData = Math.abs($scope.arr.unitArr[$rootScope.m_nSelIndex].model);
        buyInfo.curDate = $rootScope.curDate;
        buyInfo.eachValue = [];
        buyInfo.eachIndex = [];
        buyInfo.curName = name;
        buyInfo.curIndex = $rootScope.m_nSelIndex;
        // updating the array of units for a fund after a buy transaction
        buyInfo.portValue = $rootScope.portfolio[$rootScope.sliderIndex];
        for (var i = 0; i < $rootScope.arr.length; i ++){
          buyInfo.eachValue[i] = $rootScope.TotalData[i].u[$rootScope.sliderIndex] * buyInfo.unitData;
          buyInfo.eachIndex[i] = $rootScope.TotalData[i].index;
        }     

        var date = new Date(buyInfo.curDate);   
        var month = (date.getMonth()+1 < 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
        var day = (date.getDate()<10) ? '0'+date.getDate() : date.getDate();
        buyInfo.curDate = date.getFullYear() + '-' + month + '-' + day;

        var date_now = new Date();   
        var month_now = (date_now.getMonth()+1 < 10) ? '0'+(date_now.getMonth()+1) : (date_now.getMonth()+1);
        var day_now = (date_now.getDate()<10) ? '0'+date_now.getDate() : date_now.getDate();
        buyInfo.nowDate = date_now.getFullYear() + '-' + month_now + '-' + day_now;

        var confirm = $mdDialog.confirm()
          .title('Would you like to Buy?')
          .ariaLabel('Lucky day') // Is this the type of label?
          .ok('Save it')
          .cancel('Not now');
        //creating page to save buy transaction to insert or update database
        $mdDialog.show(confirm).then(function() {
            var url = '/buy';
            
            if ($scope.arr.unitArr[$rootScope.m_nSelIndex].bos == true){
              // buy item
              url = url + '/' + buyInfo.eachIndex[buyInfo.curIndex];
              url = url + '/' + buyInfo.unitData;
              url = url + '/' + 999;
              url = url + '/' + buyInfo.eachValue[buyInfo.curIndex];
              url = url + '/' + buyInfo.curDate;        
              url = url + '/' + buyInfo.username;  
              url = url + '/' + buyInfo.nowDate;
              $rootScope.arrTotalSum[$rootScope.m_nSelIndex] = $rootScope.arrTotalSum[$rootScope.m_nSelIndex] + buyInfo.unitData;
            }else{
              //sell item
              url = url + '/' + 999;
              url = url + '/' + buyInfo.unitData;
              url = url + '/' + buyInfo.eachIndex[buyInfo.curIndex];
              url = url + '/' + buyInfo.eachValue[buyInfo.curIndex];
              url = url + '/' + buyInfo.curDate;
              url = url + '/' + buyInfo.username;
              url = url + '/' + buyInfo.nowDate;
              $rootScope.arrTotalSum[$rootScope.m_nSelIndex] = $rootScope.arrTotalSum[$rootScope.m_nSelIndex] - buyInfo.unitData;
            }

            $scope.arr.sliderDisable = false;
            $rootScope.arrCnt[$rootScope.m_nSelIndex][$rootScope.sliderIndex] = $scope.arr.unitArr[$rootScope.m_nSelIndex].model;
            // $scope.arr.unitArr[$rootScope.m_nSelIndex].model = 0;

            console.log(url);
            $http.get(url).success(function (portdata) {
                console.log(portdata);
            });
            var storeInfo = {};
            storeInfo.username = $rootScope.username;
            $cookieStore.put('Orza', storeInfo);
        }, function() {
            // Not now
        });
      };

      // sell transaction
      $rootScope.onSell = function(name){
        if ($scope.arr.sliderDisable == true){
          var confirm = $mdDialog.confirm()
            .title('Would you like to Discard?')
            .ariaLabel('Lucky day') // Is this a type of label?
            .ok('Discard it')
            .cancel('Not now');
          // creating page to save sell transaction to later insert or update database
          $mdDialog.show(confirm).then(function() {
            $scope.arr.sliderDisable = false;
            $scope.arr.unitArr[$rootScope.m_nSelIndex].model = $rootScope.arrCnt[$rootScope.m_nSelIndex][$rootScope.sliderIndex];
            $scope.unitChanged();
          }, function() {
              // Not now
          });
        }
      };

      // portfolio save
      $rootScope.onSave = function(){

          var storeInfo = {};
          storeInfo.username = $rootScope.username;
          // storeInfo.unitData = $rootScope.cookieInfo;

          var confirm = $mdDialog.confirm()
            .title('Would you like to save data into cookie?')
            .textContent('All of the data would be saved and you can load it.')
            .ariaLabel('Lucky day') // Type of label?
            .ok('Save it')
            .cancel('Not now');

          // store information on portfolio in cookie
          $mdDialog.show(confirm).then(function() {
              $cookieStore.put('Orza', storeInfo);
          }, function() {
              // Not now
          });
      };

      // load portofolio

      $rootScope.onLoad = function(){
          var confirm = $mdDialog.confirm()
            .title('Would you like to load data?')
            .textContent('All of the data would be changed by previous data!')
            .ariaLabel('Lucky day')
            .ok('Load it')
            .cancel('Not now');
          
          // load portofolio information from cookie
          $mdDialog.show(confirm).then(function() {
              var loadedCookie = $cookieStore.get('Orza');
              $rootScope.username = loadedCookie.username;
              $rootScope.isLoad = true;
          }, function() {
              // Not now
          });
      }

      $scope.$watch('isLoad', function (value) {
          if (value == true){
            $scope.arr.username = $rootScope.username;
            value = false;
          }
      });

      $scope.$watch('arr.username', function (value) {
          $rootScope.username = $scope.arr.username;          
      });

      $interval(function() {

        $scope.arr.determinateValue += 1;
        if ($scope.arr.determinateValue > 100) {
          $scope.arr.determinateValue = 30;
        }

      }, 100);

      // Draw Portfolio Graph
      $scope.drawChart();
      $scope.InitSlider();

      // Draw Every Funds Graphs
      $scope.drawEachChart();

      // Select every funds name to show or hide.
      $scope.arr.selectedFunds = $scope.arr.unitArr[0].option;
      $rootScope.userModel = "none"
      $scope.optChanged();
  }]);
}());