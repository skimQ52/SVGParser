'use strict'

// C library API
const ffi = require('ffi-napi');

// Express App (Routes)
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.use(express.static(path.join(__dirname+'/uploads')));

// Minimization
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { resetWatchers } = require('nodemon/lib/monitor/watch');

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Send HTML at root, do not change
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Send Style, do not change
app.get('/style.css',function(req,res){
  //Feel free to change the contents of style.css to prettify your Web app
  res.sendFile(path.join(__dirname+'/public/style.css'));
});

// Send obfuscated JS, do not change
app.get('/index.js',function(req,res){
  fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});


//SETTING UP FFI-napi!
 
const lib = ffi.DynamicLibrary('libsvgparser.so');

const funcPtr = lib.get('createSVGtoJSON');
const createSVGtoJSON = ffi.ForeignFunction(funcPtr, 'String', ['CString', 'CString']);

//for viewlog
const funcPtr2 = lib.get('getTitleSVG');
const getTitleSVG = ffi.ForeignFunction(funcPtr2, 'String', ['CString', 'CString']);

const funcPtr3 = lib.get('getDescSVG');
const getDescSVG = ffi.ForeignFunction(funcPtr3, 'String', ['CString', 'CString']);

const funcPtr4 = lib.get('getRectsSVG');
const getRectsSVG = ffi.ForeignFunction(funcPtr4, 'String', ['CString', 'CString']);

const funcPtr5 = lib.get('getCircsSVG');
const getCircsSVG = ffi.ForeignFunction(funcPtr5, 'String', ['CString', 'CString']);

const funcPtr6 = lib.get('getPathsSVG');
const getPathsSVG = ffi.ForeignFunction(funcPtr6, 'String', ['CString', 'CString']);

const funcPtr7 = lib.get('getGroupsSVG');
const getGroupsSVG = ffi.ForeignFunction(funcPtr7, 'String', ['CString', 'CString']);

const funcPtr8 = lib.get('getOtherAttributesJSON');
const getOtherAttributesJSON = ffi.ForeignFunction(funcPtr8, 'String', ['CString', 'CString', 'int', 'int']);

const funcPtr9 = lib.get('checkIfImmediateSVG');
const checkIfImmediateSVG = ffi.ForeignFunction(funcPtr9, 'int', ['CString', 'CString', 'int', 'int']);

const funcPtr10 = lib.get('setAttributeNewSVG');
const setAttributeNewSVG = ffi.ForeignFunction(funcPtr10, 'int', ['CString', 'CString', 'int', 'int', 'CString', 'CString']);

const funcPtr11 = lib.get('setTitleDescSVG');
const setTitleDescSVG = ffi.ForeignFunction(funcPtr11, 'int', ['CString', 'CString', 'CString', 'CString']);

const funcPtr12 = lib.get('validateUploadedSVG');
const validateUploadedSVG = ffi.ForeignFunction(funcPtr12, 'int', ['CString', 'CString']);

//adding component functions
const funcPtr13 = lib.get('addRectToSVG');
const addRectToSVG = ffi.ForeignFunction(funcPtr13, 'int', ['CString', 'CString', 'float', 'float', 'float', 'float', 'CString', 'CString']);

const funcPtr14 = lib.get('addCircToSVG');
const addCircToSVG = ffi.ForeignFunction(funcPtr14, 'int', ['CString', 'CString', 'float', 'float', 'float', 'CString', 'CString']);


//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', function(req, res) {
    if(!req.files) {
        return res.status(400).send('No files were uploaded!');
    }
    let uploadFile = req.files.uploadFile;
    console.log("uploaded "+uploadFile.name+"\n");

    // Use the mv() method to place the file somewhere on your server
    uploadFile.mv('uploads/' + uploadFile.name, function(err) {
        if(err) {
            return res.status(500).send(err);
        }

        res.redirect('/');
    });
  
  
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function(req , res){;
    /*if (!validateUploadedSVG(uploadFile, 'svg.xsd')) {
        console.log("INVALID SVG! Cannot be uploaded.");
        res.send('');
    }*/
  fs.stat('uploads/' + req.params.name, function(err, stat) {
    if (err == null) {
        res.sendFile(path.join(__dirname+'/uploads/' + req.params.name));
    } 
    else {
        console.log('Error in file downloading route: '+err);
        res.send('');
    }
  });
});

//******************** Your code goes here ******************** 

//READING DIRECTORY /uploads FOR ALL UPLOADED SVG FILES!
app.get('/files', function(req, res) {
    const uploadsDir = path.join(__dirname, 'uploads');
    var fileList = [];
    fs.readdir(uploadsDir, function (err, files) {

        if (err) {
            return console.log("cant read directory: "+err);
        }
        let i = 0;
        files.forEach(function(file) {
            if (file.split('.').pop() == "svg") {//if svg file
                if (!validateUploadedSVG('uploads/'+file, 'svg.xsd')) {
                    console.log("INVALID SVG "+file+" Cannot be uploaded --> deleting file from server.");
                    fs.unlinkSync('uploads/'+file);
                }
                else {
                    console.log(file+' acquired by server.');
                    fileList.push(file); 
                };
                i++;
            }
        });
        let str = JSON.stringify(fileList);
        res.send({
            files: str
        });
    });
});

//USED FOR SVG FILE LOG PANEL, ON ONLOAD right after /files endpoint ^^
app.get('/onload', function(req, res) {
    //console.log('uploads/'+req.query.fileSent);
    //console.log(req.query.data1);
    let svgJSON = createSVGtoJSON('uploads/' + req.query.fileSent, 'svg.xsd');
    //console.log(req.query.fileSent + ": " +svgJSON);
    let svg = JSON.parse(svgJSON);
    res.send({
        retu: svg
    });
});

//used when dropdown changed
app.get('/viewlog', function(req, res) {
    let filepath = 'uploads/' + req.query.file;

    let titl = getTitleSVG(filepath, 'svg.xsd');
    let desc = getDescSVG(filepath, 'svg.xsd');
    let recs = getRectsSVG(filepath, 'svg.xsd');
    let cirs = getCircsSVG(filepath, 'svg.xsd');
    let pats = getPathsSVG(filepath, 'svg.xsd');
    let gros = getGroupsSVG(filepath, 'svg.xsd');

    res.send({
        title: titl,
        description: desc,
        rectangles: recs,
        circles: cirs,
        paths: pats,
        groups: gros
    });
});

//for getting attributes
app.get('/attributes', function(req, res) {
    let filepath = 'uploads/' + req.query.file;
    //console.log(filepath+req.query.type+req.query.index);
    let atts = getOtherAttributesJSON(filepath, 'svg.xsd', req.query.type, req.query.index);
    //console.log(atts);
    res.send({
        str: atts
    });
});

app.get('/immediate', function(req, res) {
    let filepath = 'uploads/' + req.query.file;
    //console.log(filepath+" at immediate...");
    let truth = checkIfImmediateSVG(filepath, 'svg.xsd', req.query.type, req.query.index);
    //console.log(truth);
    res.send({
        truth: truth
    });
});

//change title/description
app.get('/titledesc', function(req, res) {
    let filepath = 'uploads/' + req.query.file;
    let status = setTitleDescSVG(filepath, 'svg.xsd', req.query.type, req.query.text);
    res.send({
        status: status
    });
});

//when changing attributes
app.get('/changeatt', function(req, res) {
    let filepath = 'uploads/' + req.query.file;
    //console.log(filepath+" "+req.query.type+" "+req.query.index+" "+req.query.attName+" "+req.query.attValue);
    //console.log(setAttributeNewSVG(filepath, 'svg.xsd', req.query.type, req.query.index, req.query.attName, req.query.attValue));
    let status = setAttributeNewSVG(filepath, 'svg.xsd', req.query.type, req.query.index, req.query.attName, req.query.attValue);
    if (status == -1) {
        console.log("invalid attribute!");
        res.send("invalid attribute!");
    }
    else if (status == 0) {
        console.log("failed to writeSVG");
        res.send("failed to writeSVG");
    }
    else {
        //console.log("success");
    }
});

//adding rectangle
app.get('/addrect', function(req, res) {
    let filepath = 'uploads/' + req.query.file;
    let fillValue;
    let status;
    console.log("adding new rect to file: "+req.query.file);
    if (!req.query.fill) {
        fillValue = "";
    }
    else {
        fillValue = req.query.fill;
    }
    //console.log(filepath+req.query.str+fillValue);
    let rect = JSON.parse(req.query.str);
    if (addRectToSVG(filepath, 'svg.xsd', rect.x, rect.y, rect.w, rect.h, rect.units, fillValue)) {
        console.log('successfully added rect');
        status = 1;
    }
    else {
        console.log('failed to add rect');
        status = 0;
    }
    res.send({
        status: status
    });
});

//adding circle
app.get('/addcirc', function(req, res) {
    let filepath = 'uploads/' + req.query.file;
    let fillValue;
    let status;
    console.log("adding new circ to file: "+req.query.file);
    if (!req.query.fill) {
        fillValue = "";
    }
    else {
        fillValue = req.query.fill;
    }
    //console.log(filepath+req.query.str+fillValue);
    let circ = JSON.parse(req.query.str);
    if (addCircToSVG(filepath, 'svg.xsd', circ.cx, circ.cy, circ.r, circ.units, fillValue) == 1) {
        console.log('successfully added circ');
        status = 1;
    }
    else {
        console.log('failed to add circ');
        status = 0;
    }
    res.send({
        status: status
    });
});

//Sample endpoint
app.get('/endpoint1', function(req , res){
  let retStr = req.query.data1 + " " + req.query.data2;
 
  res.send(
    {
      somethingElse: retStr
    }
  );
});

app.listen(portNum);
console.log('Running app at localhost: ' + portNum);