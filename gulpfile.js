var gulp = require('gulp');
var jade = require('gulp-jade');
var preprocess = require('gulp-preprocess');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');

var pathDest = 'build/';
var pathSrc = 'src/';
var userJs = 'send_with_style.user.js';
var metaJs = 'send_with_style.meta.js';

gulp.task('jade', function () {
  return gulp.src(pathSrc + 'container.jade')
    .pipe(jade())
    .pipe(gulp.dest(pathDest));
});

gulp.task('stylus', function () {
  return gulp.src(pathSrc + 'style.styl')
    .pipe(stylus({ compress: true }))
    .pipe(gulp.dest(pathDest));
});

gulp.task('js', ['jade', 'stylus'], function () {
  return gulp.src(pathSrc + userJs)
    .pipe(preprocess())
    .pipe(gulp.dest(pathDest));
});

gulp.task('meta', function () {
  return gulp.src(pathSrc + metaJs)
    .pipe(gulp.dest(pathDest));
});

gulp.task('concat', ['js', 'meta'], function () {
  return gulp.src([pathSrc + metaJs, pathDest + userJs])
    .pipe(concat(userJs))
    .pipe(gulp.dest(pathDest));
});

gulp.task('build', ['concat']);

gulp.task('watch', function () {
  gulp.watch(pathSrc + '*.*', ['build']);
});

gulp.task('default', ['build']);