var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    tsc         = require('gulp-tsc'),
    newer       = require('gulp-newer'),
    jison       = require('gulp-jison'),
    istanbul    = require('gulp-istanbul')
    runSequence = require('run-sequence'),
    mocha       = require('gulp-mocha');

var jisonPath = 'src/parser/ast-builder/ast-builder.jison';

gulp.task('ts', function () {
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
  gulp.watch('src/**/*.ts',function(event) { runSequence('ts',   'coverage') });
  gulp.watch('src/**/*.ls',function(event) { runSequence('ls',   'coverage') });
  gulp.watch(jisonPath,    function(event) { runSequence('jison','coverage') });
  gulp.watch('test/**/*.js',['coverage']);
});

gulp.task('default', ['ts','ls','mocha','watch']);
