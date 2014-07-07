var express = require('express');
var app = express();

var libwebp = require('./libwebp'); //include our libwebp class
var gm = require('gm').subClass({ imageMagick: true });

//Create a static file server
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

//Get the dummy data
require('./public/js/ddata.js');

//Convert webp to jpeg (quality=95), resize width while maintaining aspect ratio
libwebp.dwebp([__dirname + '/public/img/a.webp', '-jpg', '95', '-scale', '400', '0', '-o', __dirname + '/public/img/a.jpg'], 
function(err, stdout){
  if (err) throw err;
});

//Convert webp to jpeg (quality=95), resize height while maintaining aspect ratio
libwebp.dwebp([__dirname + '/public/img/b.webp', '-jpg', '95', '-scale', '600', '0', '-o', __dirname + '/public/img/b.jpg'], 
function(err, stdout){
  if (err) throw err;
});

//Convert jpeg to webp (quality=80) and resize (disregard aspect ratio)
libwebp.cwebp(['-resize', '300', '300', '-q', '80', __dirname + '/public/img/c.jpg', '-o', __dirname + '/public/img/c.webp'], 
function(err, stdout){
  if (err) throw err;
});

//Get image sizes
libwebp.size(__dirname + '/public/img/a.webp', 
function(err, size){
  if (err) throw err;
  console.log(__dirname + '/public/img/a.webp has size: %d %d', size.width, size.height);
});

libwebp.size(__dirname + '/public/img/b.jpg', 
function(err, size){
  if (err) throw err;
  console.log(__dirname + '/public/img/b.jpg has size: %d %d', size.width, size.height);
});

//Use graphicsmagick to get image size (not used yet)
/*
gm('./public/img/c.jpg').size(
function(err, size){
  if (err) throw err;
  console.log('./public/img/c.jpg has size: %d %d', size.width, size.height);
});

gm('./public/img/c.webp').size(
function(err, size){
  if (err) throw err;
  console.log('./public/img/c.webp has size: %d %d', size.width, size.height);
});
*/

var port = 8080;
app.listen(port);
console.log('Express server started on port %s', port);
