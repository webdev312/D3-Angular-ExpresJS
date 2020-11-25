(function() {
'use strict';
  angular.module('orzaApp.directives')
      .directive('d3Lines',['d3', '$rootScope', function(d3, $rootScope) {
          return {
            restrict : 'EA',
            scope: {
              data: "=",
              datadate: "=",
              sdate: "="
            },
            link : function(scope, element) {
                // initialize current slider value
                $rootScope.curSlider = 0;
                $rootScope.curDateIndex = 0;

                // watch for data changes and re-render
                scope.$watch('data', function(newVals, oldVals) {
                  return scope.render(newVals);
                }, true);

                $rootScope.$watch('loadingShow', function(newVals, oldVals) {
                  if (newVals == "hide") scope.render();
                }, true);
            // define render function
                scope.render = function(data) {
                  // Remove any existing graph
                  var elements = document.querySelectorAll('.data-graph');
                  elements.forEach(function (element) {
                    element.parentNode.removeChild(element);
                  });
                  // prepare variables for each fund linechart
                  
                  var linechart = new drawlinechart(data, scope, '#portfolio_chart'); // draw portfolio graph
                  
                  for (var i = 0; i < $rootScope.arr.length; i ++){
                    var eachData = $rootScope.arr[i]; // graph data for every element graph
                    var id = '#line' + (i + 1); // graph id for every element id same as '#line1', '#line2', ... '#line14'
                    var linechart = new drawlineEach(eachData, scope, id, i); // draw every element graph
                  }

                  var extra = new drawExtraLine($rootScope.orgData, scope, '#line_extra');

                  function drawlinechart(data, datadate, id, sdate){
                      data = $rootScope.portfolio;
                      if (data && data.length > 0) {
                  //  variables for SVG size
                      var width = window.innerWidth;
                      var height = 150;
                      var margin = {top: 20, right: 120, bottom: 20, left: 60};
                      if (window.innerWidth >= 960) width = window.innerWidth * 3/4;
                      else if (window.innerWidth < 960 && window.innerWidth >= 600) width = window.innerWidth;
                      else width = window.innerWidth;
                  // creating a div to contain line charts.
                      var div = d3.select(id);
                      var svg = div.append('svg:svg')
                      .attr('width', width)
                      .attr('height',	height)
                      .attr('class', 'data-graph')
                  // setup variables
                      var y = d3.scale.linear()
                        .domain(d3.extent(data.concat($rootScope.arrOtherPortfolio)))
                        .range([ 0 + margin.bottom, height - margin.top ]);
                      var x = d3.time.scale()
                        .domain(d3.extent(scope.datadate))
                        .range([ 0 + margin.left, width - margin.right ]);
                      var xi = d3.time.scale()
                        .domain(d3.extent(scope.datadate))
                        .range([0, data.length]);
                      var xAxis = d3.svg.axis()
                        .orient("bottom")
                        .scale(x)
                        .tickFormat(d3.time.format('%m-%y'));



                      //compare red line
                      var g1 = svg.append("svg:g")
                        .style('stroke', 'rgb(233, 30, 99)')
                        .style('fill', 'none');
                      var lineGraph1 = d3.svg.line()
                        .x(function(d, i) {return x(scope.datadate[i]);})
                        .y(function(d) {return height - y(d);});
                      g1.append("svg:path")
                        .attr("d",lineGraph1($rootScope.arrOtherPortfolio))
                        .style('stroke-width', 2)
                        .style('fill', 'none');



                      var g = svg.append("svg:g")
                        .style('stroke', '#000000')
                        .style('fill', 'none');
                      
                      var lineGraph = d3.svg.line()
                        .x(function(d, i) {return x(scope.datadate[i]);})
                        .y(function(d) {return height - y(d);});
                  // line chart path
                      g.append("svg:path")
                        .attr("d",lineGraph(data))
                        .style('stroke-width', 3)
                        .style('stroke', '#03A9F4')
                        .style('fill', 'none');
                  
                  // tooltip
                      // vertical line
                      var verticalLine = svg.append('line')
                        .attr({
                            'x1': 0,
                            'y1': 8,
                            'x2': 0,
                            'y2': height - 8,
                        })
                        .attr("stroke", "steelblue")
                        .attr('class', 'verticalLine')
                        .style('stroke-width', 1);
                      // date of portfolio
                      var toolTipDate = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', 'toolTipDate')
                        .attr('dy', '20')
                        .attr('dx', '-90');
                      // value of portofolio
                      var toolTipValue = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', 'toolTipValue')
                        .attr('dy', '20')
                        .attr('dx', '8');
                      // 91 day return of portfolio
                      var toolTip91dr = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', 'toolTip91dr')
                        .attr('dy', '40')
                        .attr('dx', '8');
                      var prevToolTipValue = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', 'prevToolTipValue')
                        .attr('dy', '60')
                        .attr('dx', '8')
                        .style('fill', 'rgb(233, 30, 99)');


                      scope.$watch('sdate', function(value) {
                        if (value != undefined){
                          // console.log(x(value));
                          scope.moveTooltip(x(value));
                          $rootScope.curSlider = x(value);
                        }                        
                      });

                      scope.moveTooltip = function(xPos){
                        d3.select(".verticalLine")
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                          // date
                          d3.select(".toolTipDate")
                          .text(function(){
                            var date = new Date(x.invert(xPos));   
                            var month = (date.getMonth()+1 < 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
                            var day = (date.getDate()<10) ? '0'+date.getDate() : date.getDate();
                            return month + '/' + day + '/' + date.getFullYear();
                          })
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                          // value
                          d3.select(".toolTipValue")
                          .text(function(){
                            // console.log(datadate);
                            // console.log(scope.datadate);
                            for (var i = 0; i < scope.datadate.length; i ++){
                              var cur = new Date(x.invert(xPos));
                              var item = new Date(scope.datadate[i]);
                              
                              if (cur.getFullYear() == item.getFullYear()){
                                if (cur.getMonth() == item.getMonth()){
                                  if (cur.getDate() == item.getDate()){     
                                    $rootScope.curDateIndex = i;
                                    return "Valor " + d3.format("$0,.02f")($rootScope.portfolio[i]);
                                  }
                                }
                              } 
                            }
                          })
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                          // 91 day return
                          d3.select(".toolTip91dr")
                          .text(function(){
                            // console.log(datadate);
                            // console.log(scope.datadate);
                            return "Retorno 91d " + d3.format(".02%")($rootScope.p91dr[$rootScope.curDateIndex]);
                          })
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                          d3.select(".prevToolTipValue")
                          .text(function(){
                            // console.log(datadate);
                            // console.log(scope.datadate);
                            var otherPortValue = $rootScope.arrOtherPortfolio[$rootScope.curDateIndex];
                            if (otherPortValue == undefined) otherPortValue = 0;
                            return "Valor " + d3.format("$0,.02f")(otherPortValue);
                          })
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                      };

                      // svg.on('mousemove', function () {
                      //     var xPos = d3.mouse(this)[0];
                      //     scope.moveTooltip(xPos);                          
                      // })
                      // .on('mouseout', function () {
                      //   scope.moveTooltip($rootScope.curSlider);
                      //   // scope.moveTooltip(xPos);
                      //   // d3.select(".verticalLine").attr("display", "none");
                      //   // d3.select(".toolTipDate").attr("display", "none");
                      //   // d3.select(".toolTipValue").attr("display", "none");
                      // });
                    };
                  }

                  function drawlineEach(data, datadate, id, index){
                      if (data && data.length > 0) {
                  //  variables for SVG size
                      var width = window.innerWidth;
                      var height = 150;
                      var margin = {top: 20, right: 120, bottom: 20, left: 60};
                      if (window.innerWidth >= 960) width = window.innerWidth * 3/4;
                      else if (window.innerWidth < 960 && window.innerWidth >= 600) width = window.innerWidth;
                      else width = window.innerWidth;
                  // creating a div to contain line charts.
                      var div = d3.select(id);
                      var svg = div.append('svg:svg')
                      .attr('width', width)
                      .attr('height',	height)
                      .attr('class', 'data-graph')
                  // setup variables
                      var y = d3.scale.linear()
                        .domain(d3.extent(data.concat($rootScope.arrOtherUserData[index])))
                        .range([ 0 + margin.bottom, height - margin.top ]);
                      var x = d3.time.scale()
                        .domain(d3.extent(scope.datadate))
                        .range([ 0 + margin.left, width - margin.right ]);
                      var xi = d3.time.scale()
                        .domain(d3.extent(scope.datadate))
                        .range([0, data.length]);
                      var xAxis = d3.svg.axis()
                        .orient("bottom")
                        .scale(x)
                        .tickFormat(d3.time.format('%m-%y'));
                      

                      //compare red line
                      var g1 = svg.append("svg:g")
                        .style('stroke', 'rgb(233, 30, 99)')
                        .style('fill', 'none');
                      var lineGraph1 = d3.svg.line()
                        .x(function(d, i) {return x(scope.datadate[i]);})
                        .y(function(d) {return height - y(d);});
                      g1.append("svg:path")
                        .attr("d",lineGraph1($rootScope.arrOtherUserData[index]))
                        .style('stroke-width', 3)
                        .style('fill', 'none');


                      var g = svg.append("svg:g")
                        .style('stroke', '#000000')
                        .style('fill', 'none');
                      var lineGraph = d3.svg.line()
                        .x(function(d, i) {return x(scope.datadate[i]);})
                        .y(function(d) {return height - y(d);});
                      g.append("svg:path")
                        .attr("d",lineGraph(data))
                        .style('stroke-width', 3)
                        .style('stroke', '#03A9F4')
                        .style('fill', 'none');



                      var verticalLine = svg.append('line')
                        .attr({
                            'x1': 0,
                            'y1': 8,
                            'x2': 0,
                            'y2': height - 8
                        })
                        .attr("stroke", "steelblue")
                        .attr('class', id.slice(1) + '_vline')
                        .style('stroke-width', 1);
                      
                      var toolTipDate = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', id.slice(1) + '_toolTipDate')
                        .attr('dy', '20')
                        .attr('dx', '-90');

                      var toolTipValue = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', id.slice(1) + '_toolTipValue')
                        .attr('dy', '20')
                        .attr('dx', '8');

                      var toolTipCount = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', id.slice(1) + '_toolTipCount')
                        .attr('dy', '40')
                        .attr('dx', '8');

                      var prevEachToolTipValue = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', id.slice(1) + '_prevEachToolTipValue')
                        .attr('dy', '60')
                        .attr('dx', '8')
                        .style('fill', 'rgb(233, 30, 99)');

                      scope.$watch('sdate', function(value) {
                        if (value != undefined){
                          // console.log(x(value));
                          scope.moveTooltip_s(x(value));
                        }                        
                      });

                      scope.moveTooltip_s = function(xPos){
                        // for (var i = 0; i < $rootScope.arr.length; i ++){
                        d3.select(".line" + ($rootScope.m_nSelIndex+1) + "_vline")
                        .attr("transform", function () {
                            return "translate(" + xPos + ",0)";
                        })
                        .attr("display" , "block");
                        d3.select(".line" + ($rootScope.m_nSelIndex+1) + "_toolTipDate")
                        .text(function(){
                          var date = new Date(x.invert(xPos));   
                          var month = (date.getMonth()+1 < 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
                          var day = (date.getDate()<10) ? '0'+date.getDate() : date.getDate();
                          return month + '/' + day + '/' + date.getFullYear();
                        })
                        .attr("transform", function () {
                            return "translate(" + xPos + ",0)";
                        })
                        .attr("display" , "block");
                        d3.select(".line" + ($rootScope.m_nSelIndex+1) + "_toolTipValue")
                        .text(function(){
                            return d3.format("$0,.02f")($rootScope.arr[$rootScope.m_nSelIndex][$rootScope.curDateIndex]);
                        })
                        .attr("transform", function () {
                            return "translate(" + xPos + ",0)";
                        })
                        .attr("display" , "block");  
                        d3.select(".line" + ($rootScope.m_nSelIndex+1) + "_toolTipCount")
                        .text(function(){
                            var sum = 0;
                            for (var j = 0; j <= $rootScope.curDateIndex; j ++){
                              sum = sum + $rootScope.arrCnt[$rootScope.m_nSelIndex][j];
                            }
                            return "Value " + sum;                         
                        })
                        .attr("transform", function () {
                            return "translate(" + xPos + ",0)";
                        })
                        .attr("display" , "block");  
                        d3.select(".line" + ($rootScope.m_nSelIndex+1) + "_prevEachToolTipValue")
                        .text(function(){
                          // console.log(datadate);
                          // console.log(scope.datadate);
                          var otherPortValue = $rootScope.arrOtherUserData[$rootScope.m_nSelIndex][$rootScope.curDateIndex];
                          if (otherPortValue == undefined) otherPortValue = 0;
                          return "Valor " + d3.format("$0,.02f")(otherPortValue);
                        })
                        .attr("transform", function () {
                            return "translate(" + xPos + ",0)";
                        })
                        .attr("display" , "block");
                      };                      
                    };
                  }

                  function drawExtraLine(data, datadate, id){
                      if (data && data.length > 0) {
                  //  variables for SVG size
                      var width = window.innerWidth;
                      var height = 150;
                      var margin = {top: 20, right: 120, bottom: 20, left: 60};
                      if (window.innerWidth >= 960) width = window.innerWidth * 3/4;
                      else if (window.innerWidth < 960 && window.innerWidth >= 600) width = window.innerWidth;
                      else width = window.innerWidth;
                  // creating a div to contain line charts.
                      var div = d3.select(id);
                      var svg = div.append('svg:svg')
                      .attr('width', width)
                      .attr('height',	height)
                      .attr('class', 'data-graph')
                  // setup variables
                      var y = d3.scale.linear()
                        .domain(d3.extent(data))
                        .range([ 0 + margin.bottom, height - margin.top ]);
                      var x = d3.time.scale()
                        .domain(d3.extent(scope.datadate))
                        .range([ 0 + margin.left, width - margin.right ]);
                      var xi = d3.time.scale()
                        .domain(d3.extent(scope.datadate))
                        .range([0, data.length]);
                      var xAxis = d3.svg.axis()
                        .orient("bottom")
                        .scale(x)
                        .tickFormat(d3.time.format('%m-%y'));
                      var g = svg.append("svg:g")
                        .style('stroke', '#000000')
                        .style('fill', 'none');
                      var lineGraph = d3.svg.line()
                        .x(function(d, i) {return x(scope.datadate[i]);})
                        .y(function(d) {return height - y(d);});
                  // line chart path
                      g.append("svg:path")
                        .attr("d",lineGraph(data))
                        .style('stroke-width', 3)
                        .style('stroke', '#03A9F4')
                        .style('fill', 'none');

                      var verticalLine = svg.append('line')
                        .attr({
                            'x1': 0,
                            'y1': 8,
                            'x2': 0,
                            'y2': height - 8
                        })
                        .attr("stroke", "steelblue")
                        .attr('class', 'line_exvline')
                        .style('stroke-width', 1);
                      
                      var toolTipDate = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', 'line_extoolTipDate')
                        .attr('dy', '20')
                        .attr('dx', '-90');

                      var toolTipValue = svg.append('text')
                        .text(function(d) { return "" })
                        .attr('text-anchor', 'start')
                        .attr('class', 'line_extoolTipValue')
                        .attr('dy', '20')
                        .attr('dx', '8');

                      scope.$watch('sdate', function(value) {
                        if (value != undefined){
                          // console.log(x(value));
                          scope.moveTooltip_e(x(value));
                        }                        
                      });

                      scope.moveTooltip_e = function(xPos){
                          d3.select(".line_exvline")
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                          d3.select(".line_extoolTipDate")
                          .text(function(){
                            var date = new Date(x.invert(xPos));   
                            var month = (date.getMonth()+1 < 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
                            var day = (date.getDate()<10) ? '0'+date.getDate() : date.getDate();
                            return month + '/' + day + '/' + date.getFullYear();
                          })
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                          d3.select(".line_extoolTipValue")
                          .text(function(){
                              return d3.format("$0,.02f")($rootScope.orgData[$rootScope.curDateIndex]);
                          })
                          .attr("transform", function () {
                              return "translate(" + xPos + ",0)";
                          })
                          .attr("display" , "block");
                      };                      
                    };
                  }
              }
            }
          };
      }]);
}());

