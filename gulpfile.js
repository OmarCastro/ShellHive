var gulp        = require('gulp');
var ts          = require('gulp-typescript');
var newer       = require('gulp-newer');
var jison       = require('gulp-jison');
var istanbul    = require('gulp-istanbul');
var runSequence = require('run-sequence');
var mocha       = require('gulp-mocha');

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var assign = require('lodash.assign');



var jisonPath = 'src/parser/ast-builder/ast-builder.jison';


var tsProject = ts.createProject('tsconfig.json');

gulp.task('tsc', function () {
  var tsResult = tsProject.src().pipe(tsProject())
    return tsResult.js.pipe(gulp.dest('lib'));
});

gulp.task('copyHtmlAssets', function(){
  gulp.src(['src/**/*.html']).pipe(gulp.dest('lib/'))
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

// add custom browserify options here
var customOpts = {
  entries: './lib/angularjs/app.js',
  debug: true
};
//var opts = assign({}, watchify.args, customOpts);
//var b = watchify(browserify(opts)); 
var b = browserify(customOpts);

gulp.task('javascript', function () {
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
