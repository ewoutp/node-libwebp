//Example for node.js. Run using "node example.js"
var libwebp = require('../libwebp');
var gm = require('gm').subClass({
    imageMagick: true
});

//Convert webp to jpeg (quality=95), resize width while maintaining aspect ratio
libwebp.dwebp(['../public/img/a.webp', '-jpg', '95', '-scale', '400', '0', '-o', '../public/img/a.jpg'],
    function(err, stdout) {
        if (err) throw err;
    });

//Convert webp to jpeg (quality=95), resize height while maintaining aspect ratio
libwebp.dwebp(['../public/img/b.webp', '-jpg', '95', '-scale', '600', '0', '-o', '../public/img/b.jpg'],
    function(err, stdout) {
        if (err) throw err;
        libwebp.size('../public/img/b.jpg',
            function(err, size) {
                if (err) throw err;
                console.log('../public/img/b.jpg has size: %d %d', size.width, size.height);
            });
    });

//Convert jpeg to webp (quality=80) and resize (disregard aspect ratio)
libwebp.cwebp(['-resize', '300', '300', '-q', '80', '../public/img/c.jpg', '-o', '../public/img/c.webp'],
    function(err, stdout) {
        if (err) throw err;
    });

//Get image sizes
libwebp.size('../public/img/a.webp',
    function(err, size) {
        if (err) throw err;
        console.log('../public/img/a.webp has size: %d %d', size.width, size.height);
    });

//Use graphicsmagick to get image size (not used yet)
/*
gm('../public/img/c.jpg').size(
function(err, size){
  if (err) throw err;
  console.log('../public/img/c.jpg has size: %d %d', size.width, size.height);
});

gm('../public/img/c.webp').size(
function(err, size){
  if (err) throw err;
  console.log('../public/img/c.webp has size: %d %d', size.width, size.height);
});
*/