/**
 * Created by Danny on 2015/9/26 15:39.
 */
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var util = require("util");
var url = require("url");
var log = require('../lib/log.js');
var uploadprogress = {};//全局变量，存进度

var head = function (res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    return res.status(200);
}

//获取服务器时间
var getTime = function (req, res, next) {
    head(res).send({"time": new Date().toLocaleString()});
    log("sync","time");
}
//文件上传
exports.Upload = function (req, res, next) {
    //Creates a new incoming form.
    var form = new formidable.IncomingForm();
    //设置文件上传存放地址
    form.uploadDir = "./files";
    //执行里面的回调函数的时候，表单已经全部接收完毕了。
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.end("403");
            log("err(文件错误)", err);
        }
        else{
            var oldpath = "./" + files.file.path;
            var folderpath = "./files/" + fields.folder;
            var newpath = folderpath + "/" + fields.fileName;
            if (!fs.existsSync(folderpath)) fs.mkdirSync(folderpath);

            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    res.end("403");
                }
                res.end("200");
            });
        }
    });
    log("receive(接收文件)");
}
//异步上传
var uploadAsync = function(req, res, next) {
    var id;
    var uploadfile;
    var fileName;
    var folderpath;
    var form = new formidable.IncomingForm();//formidable模块的用法自己去github看文档吧
    form.uploadDir = './files';
    form.keepExtensions = true;
    form.on("field", function (name, value) {//设置唯一可标识的id
       if(name == "fileName"){
           fileName = value;
       }
        if(name == "folder"){
            folderpath = "./files/" + value;
            if (!fs.existsSync(folderpath)) fs.mkdirSync(folderpath);
        }
        if(name == "randomId")
        {
            id= value;
        }
    });
    form.on("err", function (err) {
       if(err) res.end("403");
    })
    form.on("progress", function (bytesRecieved, bytesExpected) {
        uploadprogress[id] = Math.ceil((bytesRecieved / bytesExpected) * 100);//更新进度
    })
    form.on("abort", function () {
        res.end("403");
    })
    form.on("file", function (err, file) {
        if (err) {
            res.end("403");
        }
        uploadfile = file;//记录文件信息
    })
    form.on("end", function () {
        var oldpath = "./" + uploadfile.path;
        var newpath = folderpath + "/" + fileName;
        log("receive(完成接收)" , newpath);
        delete uploadprogress[id];
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.end("403");
            }
            res.end("200");
        });
    })
    form.parse(req);
    log("receive(开始接收)");
}
//上传进度
var uploadProgress = function(req,res,next) {
    var query = url.parse(req.url, true).query;
    var id = query.randomId;
    var pr;
    if (uploadprogress[id]) {
        pr = uploadprogress[id];
    }
    else {
        pr = 0;
    }
    head(res).send(pr.toString());//返回错误.send({"progress": pr});
}
//打开网页
var Entry = function (req, res, next) {
    if (req.url == "/") {
        fs.readFile("./public/index.html", function (err, data) {
            res.end(data);
        });
    }
}
//下载更新后的文件信息
exports.GetFiles = function (req, res, next) {
    dbfileslog.GetAll(function (err, data) {
        head(res).send({"filelogs": data});
    })
    log("downland","更新索引");
}

//注册相关事件
exports.startRouter = function(app){
    app.get("/",Entry);
    app.get("/time",getTime);
    app.post(/^\/upload/,uploadAsync);//文件上传
    app.get("/uploadprocess",uploadProgress);//文件上传进度
}