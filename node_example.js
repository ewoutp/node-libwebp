//Example for node.js. Run using "node example.js"
var libwebp = require('./libwebp');

//Convert webp to jpeg (quality=95), resize width while maintaining aspect ratio
libwebp.dwebp(['./public/img/a.webp', '-jpg', '95', '-scale', '400', '0', '-o', './public/img/a.jpg'], 
function(err, stdout){
  if (err) throw err;
});

//Convert webp to jpeg (quality=95), resize height while maintaining aspect ratio
libwebp.dwebp(['./public/img/b.webp', '-jpg', '95', '-scale', '600', '0', '-o', './public/img/b.jpg'], 
function(err, stdout){
  if (err) throw err;
});

//Convert jpeg to webp (quality=80) and resize (disregard aspect ratio)
libwebp.cwebp(['-resize', '300', '300', '-q', '80', './public/img/c.jpg', '-o', './public/img/c.webp'], 
function(err, stdout){
  if (err) throw err;
});
