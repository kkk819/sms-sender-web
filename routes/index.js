/*
 * @Author: Leo 
 * @Date: 2019-04-15 10:37:36 
 * @Last Modified by: Leo
 * @Last Modified time: 2019-04-19 13:52:56
 */

'use strict';

let express = require('express');
let router = express.Router();
let config = require('../config/config.json');
let co = require('co');

let logined = false;

const client = require('twilio')(config.accountSid, config.authToken);   

router.get('/', function(req, res, next) {
  logined = false;
  res.render(`login`);  
});

router.get('/login', function(req, res, next) {
  logined = false;
  res.render(`login`);  
});

router.get('/send', function(req, res, next) {
  if (!logined){
    res.render(`login`);  
  } else {
    res.render(`send`, {
      data: {
        fromTel: config.fromTel
      }
    });  
  }  
});

// router.get('/show', function(req, res, next) {  
//   res.render(`show`);  
// });

router.post('/login', function(req, res, next) {
  let txtAccount = req.body.txtAccount;
  let txtPass = req.body.txtPass;

  if (config.account == txtAccount && config.password == txtPass){
    logined = true;
    res.render(`send`, {
      data: {
        fromTel: config.fromTel
      }
    });  
  }
});

router.post('/show', function(req, res, next) {
  let msgBody = req.body.txtBody;
  let msgTo = req.body.txtTo;
  let msgArea = req.body.txtArea;

  if(!msgBody || !msgTo || !msgArea){
    return;
  }
  
  //将换行符替换成逗号
  msgTo = msgTo.replace(/\r\n/g, ',');  
  let toArr = msgTo.split(',');
  let successList = [];
  let failedList = [];
  let validTo = [];
  let telephone = '';
  for (let i = 0; i < toArr.length; i++){
    if (toArr[i]){
      if (toArr[i].length > 5){
        telephone = toArr[i];
        telephone = msgArea + telephone;
        validTo.push(telephone);
      } else {
        failedList.push({
          failed: msgArea + toArr[i]
        });
      }      
    }
  }

  // for (let i = 0; i < validTo.length; i++){
  //   co(function *() {
  //     yield client.messages.create({  
  //       from: config.fromTel,       
  //       to: validTo[i],
  //       body: msgBody 
  //     }, function(err, result) {
  //       if (!err){          
  //         console.log(result.sid);
  //         successList.push(validTo[i]);
  //       } else {
  //         console.log('send failed: ' + err.message);
  //         failedList.push(validTo[i]);          
  //       }        
  //     })
  //   }).catch(function (err) {
  //     console.log('catch error: ' + err.message);    
  //   });  
  // }
  // res.render(`show`, {
  //   data: {
  //     failed: failedList,
  //     success: successList
  //   }
  // });  
  

  // co(function *() {
  //   for (let i = 0; i < validTo.length; i++){
  //     yield client.messages.create({  
  //         from: config.fromTel,       
  //         to: validTo[i],
  //         body: msgBody 
  //       }, function(err, result) {
  //         if (!err){          
  //           console.log(result.sid);
  //           successList.push(validTo[i]);
  //         } else {
  //           console.log('catch error: ' + err.message);    
  //           failedList.push(validTo[i]);          
  //         }        
  //     })       
  //   }
  // }).catch(function (err) {
  //   console.log('catch error: ' + err.message);    
  // }); 
  // res.render(`show`, {
  //   data: {
  //     failed: failedList,
  //     success: successList
  //   }
  // }); 

  co(function* () {
    let sendPromises = [];
    for (let i = 0; i < validTo.length; i++){
      let promise = co(function *() {
        yield client.messages.create({  
          from: config.fromTel,       
          to: validTo[i],
          body: msgBody 
        }, function(err, result) {
          if (!err){          
            console.log(result.sid);
            successList.push({
              success: validTo[i]
            });
          } else {
            console.log('send failed: ' + err.message);    
            failedList.push({
              failed: validTo[i]
            });          
          }        
        })
      }).catch(function (err) {
        
      });
      sendPromises.push(promise);      
    }

    yield sendPromises;

    res.render(`show`, {
      data: {
        failedList: failedList,
        successList: successList
      }
    });
  });   
});

module.exports = router;


