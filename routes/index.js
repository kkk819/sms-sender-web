/*
 * @Author: Leo 
 * @Date: 2019-04-15 10:37:36 
 * @Last Modified by: Leo
 * @Last Modified time: 2019-04-16 14:37:23
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

  if(!msgBody || !msgTo){
    return;
  }
  
  
  let toArr = msgTo.split(',');
  let successList = [];
  let failedList = [];
  let validTo = [];
  for (let i = 0; i < toArr.length; i++){
    if (toArr[i] && toArr[i].length > 5){
      validTo.push(toArr[i].replace(/\r\n/g, ''));
    }
  }

  co(function *() {
    for (let i = 0; i < validTo.length; i++){
      yield client.messages.create({  
          from: config.fromTel,       
          to: validTo[i],
          body: msgBody 
        }, function(err, result) {
          if (!err){          
            console.log(result.sid);
            successList.push(validTo[i]);
          } else {
            failedList.push(validTo[i]);          
          }        
      })       
    }

    res.render(`show`, {
      data: {
        failed: failedList,
        success: successList
      }
    });    
  })
  .catch(function (err) {
    // console.log(err.message);
    res.render(`show`, {
      data: {
        failed: failedList,
        success: successList
      }
    });    
  }); 
  
  
});

module.exports = router;


