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
/*let parserLib = ffi.Library('./parserLib', {
    'printFunc': [ 'void', [ ] ],		//return type first, argument list second
    'createValidSVG': [ 'SVG', [ 'string', 'string'] ], //returns SVG, takes string for filename then string for schema file name
                                      //for void input type, leave argument list is empty
    'addTwo': [ 'int', [ 'int' ] ],	//int return, int argument
    'putDesc' : [ 'void', [ 'string' ] ],
    'getDesc' : [ 'string', [] ]
  });*/

  
const lib = ffi.DynamicLibrary('libsvgparser.so');

//createValidSVG
//const funcPtr = lib.get('createValidSVG');
//const createValidSVG = ffi.ForeignFunction(funcPtr, 'Object *', ['CString', 'CString']);

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

//const svg = createValidSVG('file.svg', 'svg.xsd');//calling the createValidSVG FUnction!

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', function(req, res) {
  if(!req.files) {
    return res.status(400).send('No files were uploaded!');
  }
 
  let uploadFile = req.files.uploadFile;
  console.log("received "+uploadFile.name+"\n");
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
                fileList.push(file);
                //console.log('files: '+fileList[i]);
                i++;
            }
        });
        let str = JSON.stringify(fileList);
        //console.log("pepe"+str);
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

app.get('/attributes', function(req, res) {
    let filepath = 'uploads/' + req.query.file;
    //console.log(filepath+req.query.type+req.query.index);
    let atts = getOtherAttributesJSON(filepath, 'svg.xsd', req.query.type, req.query.index);
    //console.log(atts);
    res.send({
        str: atts
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