/**
 * Created by Administrator on 2016/12/20 0020.
 */
/**
 * Created by Danny on 2015/9/20 9:23.
 */
var express = require('express');
app = express();
var cors = require('cors');
var server = require('http').createServer(app);
var router = require("./bll/router");
var io = require("./bll/socketio");
var config = require('./config.json');

//事件分发
router.startRouter(app);
//静态文件路径
app.use(express.static("./public"));
app.use(express.static("./files"));
app.use(cors());
io.getSocketio(server);
server.listen(config.port);