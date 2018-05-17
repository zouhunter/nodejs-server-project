/*
 封装socket.io,为了获取server以便监听.
 2016年8月8日10:28:24
 */
var path = require("path");
var fs = require("fs");
var log = require("../lib/log.js");
var socketio = {};
var socket_io = require('socket.io');

//获取io
socketio.getSocketio = function (server) {
    var io = socket_io.listen(server);
    io.sockets.on('connection', function (socket) {
        log("接入",socket.request.socket._peername.address.substr(7)+":" +socket.request.socket._peername.port);
        socket.on("test_send",function (req) {
            socket.emit("test_receive","服务器：已收到");
        });
        //断开链接
        socket.on('disconnect', function () {
           
        });
    })
};
module.exports = socketio;