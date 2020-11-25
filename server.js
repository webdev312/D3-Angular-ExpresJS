(function() {
  var express = require('express');
  var http = require('http');
  var mysql = require('mysql');
  var bodyParser = require('body-parser');
  var client = require('twilio')(
    'AC5428b55a4f53db74fee7425898415543',
    '6d2d4b5c56b96a3980dc81c00a7c241d'
  );
  var app = express();

app.set('port', process.env.PORT || 8080);
app.use(express.static(__dirname + '/app'));
app.use(bodyParser.json());

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
console.log('Using development settings.');
  var pool = mysql.createPool({
    host: 'orzadevelopmentinstance.crkgmcy3tvtc.us-east-1.rds.amazonaws.com',
    user: 'TestUser',
    port: '3306',
    password: 'WorkUpYH2017.',
   multipleStatements: true});
}

if ('production' == env) {
console.log('Using production settings.');
 var pool = mysql.createPool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    multipleStatements : true});
}

pool.getConnection(function(err,connection){
  if(err){
    process.env['msg'] = 'unable to connect to RDS -' + err;
   return;  
  };
app.get('/loginupdate/:user/:phone', function(req, res){
  var userName = req.params.user;
  var userPhone = req.params.phone;
  sqlLine = "update OrzaDevelopmentDB.saver set" +
          " confirmed_saver = 1" +
          " where user_name_saver = '" + userName + "'";
  sqlLine = sqlLine + " and phone_saver = '" + userPhone + "'";

  connection.query(sqlLine,function(err,inserted){
    if(err) throw err;
    res.json("register");
  });
});
// send sms to cell phone
app.get('/login/:user/:phone/:random', function(req, res){
  var userName = req.params.user;
  var userPhone = req.params.phone;
  var verifyNum = req.params.random;

  var sqlLine = "select saver_id, confirmed_saver from OrzaDevelopmentDB.saver where user_name_saver = '" + userName + "'";
  sqlLine = sqlLine + " and phone_saver = '" + userPhone + "'";

  connection.query(sqlLine,function(err, rows){
    if(err) throw err;
    if (rows.length > 0){
      if (rows[0].confirmed_saver == 1){
        res.json("register");
      }else{
        client.messages.create({
          from : '+1 610-679-9200',
          to : userPhone,
          body : verifyNum
        }, function(err, message){
          if (err){
            console.log(err.message);
          }
        });
        res.json("verify");
      }
    }else{
      var curDate = new Date();
      var month = (curDate.getMonth()+1 < 10) ? '0'+(curDate.getMonth()+1) : (curDate.getMonth()+1);
      var day = (curDate.getDate()<10) ? '0'+curDate.getDate() : curDate.getDate();

      var param1 = userName;
      var param2 = userPhone;
      var param3 = 0;
      var param4 = 1;
      var param5 = curDate.getFullYear() + '-' + (month) + '-' + day;

      sqlLine = "insert into OrzaDevelopmentDB.saver " +
        "(user_name_saver, phone_saver, confirmed_saver, fp_id_saver, date_created_saver)" +
        " values (";
      var sqlValues = "'"+param1+"'" + ',' + "'"+param2+"'"  + ',' + param3  + ',' + param4  + ',' + "'"+param5+"'";
      sqlLine = sqlLine + sqlValues + ")";

      console.log(sqlLine);
      connection.query(sqlLine,function(err,inserted){
        if(err) throw err;
      });

      client.messages.create({
        from : '+1 610-679-9200',
        to : userPhone,
        body : verifyNum
      }, function(err, message){
        if (err){
          console.log(err.message);
        }
      });
      res.json("verify");
    }
  });

  
  // console.log("sms sent");
  // res.json("ok");
});

// get returns from MySQL database
app.get('/ret', function(req, res){
var sqlLine = "select date_value_pr_fund, fund_id_pr_fund, pr_fund from OrzaDevelopmentDB.price_fund as a where a.date_value_pr_fund >= '2016-01-01' ";
 connection.query(sqlLine,function(err,rows){
  if(err) throw err;
  res.json(rows);
  });
 });

// get fund ids and names from MySQL database
app.get('/ret1', function(req, res){
var sqlLine1 = "select fund_id_alias_fund, alias from OrzaDevelopmentDB.alias_fund";
 connection.query(sqlLine1,function(err,fundnames){
  if(err) throw err;
  res.json(fundnames);
  });
 });

app.get('/userInfo', function(req, res){
  var sqlLine = "select portfolio_id, portfolio_name_saver from OrzaDevelopmentDB.portfolio";
    connection.query(sqlLine,function(err,portnames){
      if(err) throw err;
      res.json(portnames);
  });
});

app.get('/transaction/:portid', function(req, res){
  var portfolio_id = req.params.portid;
  var sqlLine = "select * from OrzaDevelopmentDB.transaction where transaction_portfolio_id = '" + portfolio_id + "'";
    connection.query(sqlLine,function(err,transactions){
      if(err) throw err;
      res.json(transactions);
  });
});

 // save transaction to transaction table in MySQL database
 app.get('/buy/:fund_id_bought/:units_bought/:fund_id_sold/:units_sold/:date_value_transaction/:portfolio_id/:nowDate', function(req, res){
    
    // default value of 1 for transaction_portfolio_id and transaction_saver_id 
    var param1 = req.params.portfolio_id;
    var param2 = 1;
    var param3 = req.params.fund_id_bought;
    var param4 = req.params.units_bought;
    var param5 = req.params.fund_id_sold;
    var param6 = req.params.units_sold;
    var param7 = req.params.date_value_transaction;
    var param8 = req.params.nowDate;

    console.log("================ Parameters ================");
    console.log(param1);
    console.log(param2);
    console.log(param3);
    console.log(param4);
    console.log(param5);
    console.log(param6);
    console.log(param7);
    console.log(param8);
    console.log("================ Parameters ================");

    // check portfolio_id from portfolio table of database
    var sqlPortfolio = "select portfolio_id from OrzaDevelopmentDB.portfolio where portfolio_id = '" + param1 + "'";
    connection.query(sqlPortfolio, function(err, portID){
      if (err) throw err;      
      res.json(portID);
      if (portID.length > 0){
        // same portfolio id is existed
      }
      else{
        // there isn't same portfolio id on portfolio table
        var sqlLine = "insert into OrzaDevelopmentDB.portfolio " +
        "(portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver, date_created_portfolio_saver)" +
        " values (";
        var sqlValues = "'"+param1+"'" + ',' + "'"+param1+"'" + ',' + '1' + ',' + "'"+'COP'+"'" + ',' + "'"+param8+"'";
        sqlLine = sqlLine + sqlValues + ")";
        connection.query(sqlLine, function(err, portdata){
          console.log("success injected into portfolio");
        })
      }

      // variables to insert transaction if no other transaction for that fund on that date 
      var sqlLine = "insert into OrzaDevelopmentDB.transaction " +
      "(transaction_portfolio_id, transaction_saver_id, fund_id_bought, units_bought, fund_id_sold, units_sold, date_value_transaction)" +
      " values (";
      var sqlValues = "'"+param1+"'" + ',' + param2  + ',' + param3  + ',' + param4  + ',' + param5  + ',' + param6  + ',' + "'" + param7 + "'";
      sqlLine = sqlLine + sqlValues + ")";

      // variable to look for previous transactions if there is already a transaction for that fund on that date
      var beforeReq = "select * from OrzaDevelopmentDB.transaction ";
      beforeReq = beforeReq + "where fund_id_bought = " + param3;
      beforeReq = beforeReq + " and fund_id_sold = " + param5;
      beforeReq = beforeReq + " and date_value_transaction = '" + param7 + "'";
      beforeReq = beforeReq + " and transaction_portfolio_id = " + "'"+param1+"'";

      console.log(beforeReq);
      // if between insert and update of transaction
      connection.query(beforeReq, function(err, portdata){
        if(err) throw err;
        if (portdata.length > 0){

          param4 = param4*1 + portdata[0].units_bought;
          param6 = param6*1 + portdata[0].units_sold; 
          // update transaction if there is a previous transaction for that fund on that date
          sqlLine = "update OrzaDevelopmentDB.transaction set" +
          " units_bought = " + param4 +
          ", units_sold = " + param6 +
          " where transaction_id = " + portdata[0].transaction_id;
          console.log(sqlLine);
          connection.query(sqlLine, function(err, portdata){
            console.log("success");
          });
        }
        // insert transaction if there is no previous transaction for that fund on that date
        else{
          console.log(sqlLine);
          connection.query(sqlLine, function(err, portdata){
            console.log("success");
          });
        }
      })
    });
 });

// connection and express server
console.log('Connection established');
connection.release();
http.createServer(app).listen(app.get('port'), function(){
console.log("Express server listening on port " + app.get('port'));
  });            
});

}).call(this);
