const gulp = require('gulp');
const jade = require('gulp-pug');
const preprocess = require('gulp-preprocess');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');

var pathDest = 'build/';
var pathSrc = 'src/';
var userJs = 'send_with_style.user.js';
var metaJs = 'send_with_style.meta.js';

exports.jade = function _jade() {
  return gulp.src(pathSrc + 'container.jade')
    .pipe(jade())
    .pipe(gulp.dest(pathDest));
};

exports.stylus = function _stylus() {
  return gulp.src(pathSrc + 'style.styl')
    .pipe(stylus({ compress: true }))
    .pipe(gulp.dest(pathDest));
};

function _js() {
  return gulp.src(pathSrc + userJs)
    .pipe(preprocess())
    .pipe(gulp.dest(pathDest));
}
exports.js = gulp.series(gulp.parallel(exports.jade, exports.stylus), _js);

exports.meta = function _meta() {
  return gulp.src(pathSrc + metaJs)
    .pipe(gulp.dest(pathDest));
};

exports.concat = function _concat() {
  return gulp.src([pathSrc + metaJs, pathDest + userJs])
    .pipe(concat(userJs))
    .pipe(gulp.dest(pathDest));
};

exports.watch = function watch() {
  gulp.watch(pathSrc + '*.*', ['build']);
};

exports.default = exports.build = gulp.series(
  exports.jade,
  exports.stylus,
  exports.meta,
  exports.js,
  exports.concat
);
