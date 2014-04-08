/******************************************************************************

This file serves as a node wrapper for the command line image conversion tools 
dwebp and cwebp. Below are the usages for each tool followed by examples.

dwebp usage: 
============
   dwebp in_file [options] [-o out_file]

Decodes the WebP image file to PNG format [Default]
Use following options to convert into alternate image formats:
  -jpg <quality>.. save as compressed jpeg
  -pam ........... save the raw RGBA samples as a color PAM
  -ppm ........... save the raw RGB samples as a color PPM
  -bmp ........... save as uncompressed BMP format
  -tiff .......... save as uncompressed TIFF format
  -pgm ........... save the raw YUV samples as a grayscale PGM
                   file with IMC4 layout
  -yuv ........... save the raw YUV samples in flat layout

 Other options are:
  -version  .... print version number and exit.
  -nofancy ..... don't use the fancy YUV420 upscaler.
  -nofilter .... disable in-loop filtering.
  -nodither .... disable dithering.
  -dither <d> .. dithering strength (in 0..100)
  -mt .......... use multi-threading
  -crop <x> <y> <w> <h> ... crop output with the given rectangle
  -scale <w> <h> .......... scale the output (*after* any cropping)
                            set w<=0 OR h<=0 to preserve aspect ratio
  -alpha ....... only save the alpha plane.
  -incremental . use incremental decoding (useful for tests)
  -h     ....... this help message.
  -v     ....... verbose (e.g. print encoding/decoding times)
  -noasm ....... disable all assembly optimizations.
  

cwebp usage:
============
   cwebp [-preset <...>] [options] in_file [-o out_file]

If input size (-s) for an image is not specified, it is assumed to be a PNG, 
JPEG or TIFF file.
options:
  -h / -help  ............ short help
  -H / -longhelp  ........ long help
  -q <float> ............. quality factor (0:small..100:big)
  -alpha_q <int> ......... Transparency-compression quality (0..100).
  -preset <string> ....... Preset setting, one of:
                            default, photo, picture,
                            drawing, icon, text
     -preset must come first, as it overwrites other parameters.
  -m <int> ............... compression method (0=fast, 6=slowest)
  -segments <int> ........ number of segments to use (1..4)
  -size <int> ............ Target size (in bytes)
  -psnr <float> .......... Target PSNR (in dB. typically: 42)

  -s <int> <int> ......... Input size (width x height) for YUV
  -sns <int> ............. Spatial Noise Shaping (0:off, 100:max)
  -f <int> ............... filter strength (0=off..100)
  -sharpness <int> ....... filter sharpness (0:most .. 7:least sharp)
  -strong ................ use strong filter instead of simple (default).
  -nostrong .............. use simple filter instead of strong.
  -partition_limit <int> . limit quality to fit the 512k limit on
                           the first partition (0=no degradation ... 100=full)
  -pass <int> ............ analysis pass number (1..10)
  -crop <x> <y> <w> <h> .. crop picture with the given rectangle
  -resize <w> <h> ........ resize picture (after any cropping)
  -mt .................... use multi-threading if available
  -low_memory ............ reduce memory usage (slower encoding)
  -map <int> ............. print map of extra info.
  -print_psnr ............ prints averaged PSNR distortion.
  -print_ssim ............ prints averaged SSIM distortion.
  -print_lsim ............ prints local-similarity distortion.
  -d <file.pgm> .......... dump the compressed output (PGM file).
  -alpha_method <int> .... Transparency-compression method (0..1)
  -alpha_filter <string> . predictive filtering for alpha plane.
                           One of: none, fast (default) or best.
  -alpha_cleanup ......... Clean RGB values in transparent area.
  -blend_alpha <hex> ..... Blend colors against background color
                           expressed as RGB values written in
                           hexadecimal, e.g. 0xc0e0d0 for red=0xc0
                           green=0xe0 and blue=0xd0.
  -noalpha ............... discard any transparency information.
  -lossless .............. Encode image losslessly.
  -hint <string> ......... Specify image characteristics hint.
                           One of: photo, picture or graph

  -metadata <string> ..... comma separated list of metadata to
                           copy from the input to the output if present.
                           Valid values: all, none (default), exif, icc, xmp

  -short ................. condense printed message
  -quiet ................. don't print anything.
  -version ............... print version number and exit.
  -noasm ................. disable all assembly optimizations.
  -v ..................... verbose, e.g. print encoding/decoding times
  -progress .............. report encoding progress

Experimental Options:
  -jpeg_like ............. Roughly match expected JPEG size.
  -af .................... auto-adjust filter strength.
  -pre <int> ............. pre-processing filter


examples:
=========
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


******************************************************************************/


var childproc = require('child_process'),
    EventEmitter = require('events').EventEmitter;

function exec2(file, args /*, options, callback */) {
  var options = { encoding: 'utf8'
                , timeout: 0
                , maxBuffer: 500*1024
                , killSignal: 'SIGKILL'
                , output: null
                };

  var callback = arguments[arguments.length-1];
  if ('function' != typeof callback) callback = null;

  if (typeof arguments[2] == 'object') {
    var keys = Object.keys(options);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (arguments[2][k] !== undefined) options[k] = arguments[2][k];
    }
  }

  var child = childproc.spawn(file, args);
  var killed = false;
  var timedOut = false;

  var Wrapper = function(proc) {
    this.proc = proc;
    this.stderr = new Accumulator();
    proc.emitter = new EventEmitter();
    proc.on = proc.emitter.on.bind(proc.emitter);
    this.out = proc.emitter.emit.bind(proc.emitter, 'data');
    this.err = this.stderr.out.bind(this.stderr);
    this.errCurrent = this.stderr.current.bind(this.stderr);
  };
  Wrapper.prototype.finish = function(err) {
    this.proc.emitter.emit('end', err, this.errCurrent());
  };

  var Accumulator = function(cb) {
    this.stdout = {contents: ""};
    this.stderr = {contents: ""};
    this.callback = cb;

    var limitedWrite = function(stream) {
      return function(chunk) {
        stream.contents += chunk;
        if (!killed && stream.contents.length > options.maxBuffer) {
          child.kill(options.killSignal);
          killed = true;
        }
      };
    };
    this.out = limitedWrite(this.stdout);
    this.err = limitedWrite(this.stderr);
  };
  Accumulator.prototype.current = function() { return this.stdout.contents; };
  Accumulator.prototype.errCurrent = function() { return this.stderr.contents; };
  Accumulator.prototype.finish = function(err) { this.callback(err, this.stdout.contents, this.stderr.contents); };

  var std = callback ? new Accumulator(callback) : new Wrapper(child);

  var timeoutId;
  if (options.timeout > 0) {
    timeoutId = setTimeout(function () {
      if (!killed) {
        child.kill(options.killSignal);
        timedOut = true;
        killed = true;
        timeoutId = null;
      }
    }, options.timeout);
  }

  child.stdout.setEncoding(options.encoding);
  child.stderr.setEncoding(options.encoding);

  child.stdout.addListener("data", function (chunk) { std.out(chunk, options.encoding); });
  child.stderr.addListener("data", function (chunk) { std.err(chunk, options.encoding); });

  var version = process.versions.node.split('.');
  child.addListener(version[0] == 0 && version[1] < 7 ? "exit" : "close", function (code, signal) {
    if (timeoutId) clearTimeout(timeoutId);
    if (code === 0 && signal === null) {
      std.finish(null);
    } else {
      var e = new Error("Command "+(timedOut ? "timed out" : "failed")+": " + std.errCurrent());
      e.timedOut = timedOut;
      e.killed = killed;
      e.code = code;
      e.signal = signal;
      std.finish(e);
    }
  });

  return child;
};

exports.dwebp = function(args, timeout, callback) {
  var procopt = {encoding: 'binary'};
  if (typeof timeout === 'function') {
    callback = timeout;
    timeout = 0;
  } else if (typeof timeout !== 'number') {
    timeout = 0;
  }
  if (timeout && (timeout = parseInt(timeout)) > 0 && !isNaN(timeout))
    procopt.timeout = timeout;
  return exec2(exports.dwebp.path, args, procopt, callback);
}
exports.dwebp.path = './build/Release/dwebp';

exports.cwebp = function(args, timeout, callback) {
  var procopt = {encoding: 'binary'};
  if (typeof timeout === 'function') {
    callback = timeout;
    timeout = 0;
  } else if (typeof timeout !== 'number') {
    timeout = 0;
  }
  if (timeout && (timeout = parseInt(timeout)) > 0 && !isNaN(timeout))
    procopt.timeout = timeout;
  return exec2(exports.cwebp.path, args, procopt, callback);
}
exports.cwebp.path = './build/Release/cwebp';
