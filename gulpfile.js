var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    source      = require('vinyl-source-stream'),
    watchify    = require('watchify'),
    tsc         = require('gulp-tsc'),
    ls          = require('gulp-livescript'),
    newer       = require('gulp-newer'),
    tinylr      = require('tiny-lr'),
    istanbul    = require('gulp-istanbul')
    runSequence = require('run-sequence'),
    mocha       = require('gulp-mocha'),
    livereload  = require('gulp-livereload'), // Livereload plugin needed: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
    server      = tinylr();


gulp.task('ts', function () {
  return gulp
    .src('src/**/*.ts', {read: false})
    .pipe(newer('target'))
    .pipe(tsc({target:'ES5', module: 'commonjs', sourcemap: true, outDir: 'target'}))
    .on('error', gutil.log)
    .pipe(gulp.dest('target'));
    //.pipe( livereload( server ));
});

gulp.task('ls', function() {
  return gulp.src('src/**/*.ls')
    .pipe(ls({bare: true}))
    .on('error', gutil.log)
    .pipe(gulp.dest('target'));
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

gulp.task('coverage', function() {
  gulp.src(['target/**/commands/*.js','target/parser/parser.js'])
    .pipe(istanbul()) // Covering files
    .on('end', function () {
      gulp.src(['test/test.js'])
        .pipe(mocha({reporter: 'spec'}))
        .on('error', function (error) {
          var errorText = (error.plugin) ? error : error.stack;
          gutil.beep();
          gutil.log(gutil.colors.yellow(errorText));
        })
        .pipe(istanbul.writeReports()); // Creating the reports after tests runned
    });
});  

gulp.task('watchify', function () {
  var bundler = watchify('./target/parser/shellParser.js');
  // Optionally, you can apply transforms
  // and other configuration options on the
  // bundler just as you would with browserify
  //bundler.transform('brfs')

  bundler.on('update', rebundle)

  function rebundle () {
    return bundler.bundle()
      .pipe(source('parser.js'))
      .pipe(gulp.dest('./public/js'))
      .pipe(gulp.dest('./public/reports/js5'))
  }

  return rebundle()
});


gulp.task('watch', function () {
   gulp.watch('src/**/*.ts',function(event) { runSequence('ts','coverage') });
   gulp.watch('src/**/*.ls',function(event) { runSequence('ls','coverage') });
   gulp.watch('test/**/*.js',['mocha']);
});

gulp.task('default', ['ts','ls','mocha','watch']);//,'watchify']);
