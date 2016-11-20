var gulp        = require('gulp'),
    tsc         = require('gulp-tsc'),
    newer       = require('gulp-newer'),
    jison       = require('gulp-jison'),
    istanbul    = require('gulp-istanbul')
    runSequence = require('run-sequence'),
    mocha       = require('gulp-mocha');

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');




var jisonPath = 'src/parser/ast-builder/ast-builder.jison';

gulp.task('tsc', function () {
  return gulp
    .src('src/**/*.ts', {read: false})
    .pipe(newer('target'))
    .pipe(tsc({target:'ES5', module: 'commonjs', sourcemap: false, outDir: 'target'}))
    .on('error', gutil.log)
    .pipe(gulp.dest('lib'));
    //.pipe( livereload( server ));
});



gulp.task('mocha', function() {
  return gulp.src('test/test.js')
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function (error) {
      var errorText = (error.plugin) ? error : error.stack;
      gutil.beep();
      gutil.log(gutil.colors.yellow(errorText));
    });
}); 




gulp.task('coverage', function(cb) {

gulp.src([
  'api/**/*.js',
  '!api/responses/*.js',
  '!api/controllers/DemoController.js',
  'lib/**/commands/*.js',
  'lib/**/utils/*.js',
  'lib/common/*.js',
  'lib/parser/parser.js'
  ]).pipe(istanbul()) // Covering files
  .on('finish', function () {
    gulp.src(['test/test.js'])
      .pipe(mocha({reporter: 'spec'}))
      .on('error', function (error) {
        var errorText = (error.plugin) ? error : error.stack;
        gutil.beep();
        gutil.log(gutil.colors.yellow(errorText));
      })
      .pipe(istanbul.writeReports()) // Creating the reports after tests runned
      .on('end', cb);
  });
});  

gulp.task('jison', function() {
    return gulp.src(jisonPath)
        .pipe(jison({ moduleType: 'commonjs' }))
        .pipe(gulp.dest('lib/parser/ast-builder/'));
});



gulp.task('watch', function () {
  gulp.watch('src/**/*.ts',function(event) { runSequence('tsc',  'javascript', 'coverage') });
  gulp.watch('src/**/*.ls',function(event) { runSequence('ls',   'coverage') });
  gulp.watch(jisonPath,    function(event) { runSequence('jison','coverage') });
  gulp.watch('test/**/*.js',['coverage']);
});


gulp.task('ts', function () {
  runSequence('tsc',  'javascript')
});

gulp.task('javascript', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './lib/angularjs/app.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./assets/dist/js/'));
});

gulp.task('default', ['tsc','mocha','watch']);
