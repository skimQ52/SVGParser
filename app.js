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

  /*
  
const lib = ffi.DynamicLibrary('libsvgparser.so');
const funcPtr = lib.get('createValidSVG');
const createValidSVG = ffi.ForeignFunction(funcPtr, 'Object *', ['CString', 'CString']);

const svg = createValidSVG('file.svg', 'svg.xsd');//calling the createValidSVG FUnction!

place shared lib into default lib (SAME DIRECTORY AS APP.js) OR Modify app.js so it looks for shared lib in parser/bin
*/


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
app.get('/uploads/:name', function(req , res){
  fs.stat('uploads/' + req.params.name, function(err, stat) {
    if (err == null) {
        console.log("downloaded\n");//for testing
        //Im thinking here i use SVGTOJSON then return the JSON to the client side
        //res.sendFile(path.join(__dirname+'/uploads/' + req.params.name)); //ASK ANTHONY WHAT THIS DOES
        res.send({//ADDED BY ME
            retu: "filename is: "+req.params.name
        });
    } 
    else {
        console.log('Error in file downloading route: '+err);
        res.send('');
    }
  });
});

//******************** Your code goes here ******************** 

//Sample endpoint
app.get('/endpoint1', function(req , res){
  let retStr = req.query.data1 + " " + req.query.data2;
 
  res.send(
    {
      somethingElse: retStr
    }
  );
});

//FOR GETTING SVGS! --> EVENTUALLY, BUILD FROM HERE THO!
app.get('/uploads', function(req , res){
    let retStr = req.query.name + " " + req.query.value;
   
    res.send(
      {
        retu: retStr//HERE I DO SVGTOJSON OR OTHER WAY BRAIN NOP THINK
      }
    );
  });

app.listen(portNum);
console.log('Running app at localhost: ' + portNum);