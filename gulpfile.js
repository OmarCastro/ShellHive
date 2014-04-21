var gulp        = require('gulp');
    gutil       = require('gulp-util'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
	tsc         = require('gulp-tsc'),
	ls          = require('gulp-livescript'),
    tinylr      = require('tiny-lr'),
    mocha       = require('gulp-mocha'),
	livereload  = require('gulp-livereload'), // Livereload plugin needed: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
    server      = tinylr();




gulp.task('ts', function () {
  return gulp
    .src('src/**/*.ts')
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
  return gulp.src('test/**/*.js')
    .pipe(mocha({reporter: 'nyan', require:["should"]}))
    .on('error', gutil.log);
}); 

gulp.task('watchify', function () {
  var bundler = watchify('target/parser/shellParser.js');
  // Optionally, you can apply transforms
  // and other configuration options on the
  // bundler just as you would with browserify
  bundler.transform('brfs')

  bundler.on('update', rebundle)

  function rebundle () {
    return bundler.bundle()
      .pipe(source('parser.js'))
      .pipe(gulp.dest('./public/js'))
  }

  return rebundle()
});


gulp.task('watch', function () {
   gulp.watch('src/**/*.ts',['ts','mocha']);
   gulp.watch('src/**/*.ls',['ls','mocha']);
   gulp.watch('test/**/*.js',['mocha']);
});

gulp.task('default', ['ts','ls','mocha','watch']);//,'watchify']);
