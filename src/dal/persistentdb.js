/**
 * Created by Danny on 2015/9/28 16:44.
 */
//引包
var mongoose = require('mongoose');
var setting = require('../setting.js');
var log = require('../log.js');

mongoose.Promise = global.Promise;

//创建数据库连接
db = mongoose.createConnection(setting.dbPath);

db.on('error',console.error.bind(console, 'connection error:'));

db.on('connecting', function(){
    log('db connecting...');
});
db.on('connected', function(){
    log('db connected');
});
db.on('disconnecting', function(){
    log('db disconnecting...');
});
db.on('disconnected', function(){
    log('db disconnected');
});
db.on('close', function(){
    log('db close');
});
//监听open事件
db.on('open', function () {
    log('db open');
})
//向外暴露这个db对象
module.exports = db;