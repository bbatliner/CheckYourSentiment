const gulp = require('gulp')
const less = require('gulp-less')
const browserSync = require('browser-sync').create()
const cleanCSS = require('gulp-clean-css')
const rename = require("gulp-rename")
const uglify = require('gulp-uglify')
const pkg = require('./package.json')

// Compile LESS files from /less into /css
gulp.task('less', function() {
  return gulp.src('less/creative.less')
    .pipe(less())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
  return gulp.src('css/creative.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

// Minify JS
gulp.task('minify-js', function() {
  return gulp.src('js/creative.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
  gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
    .pipe(gulp.dest('vendor/bootstrap'))

  gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'))

  gulp.src(['node_modules/scrollreveal/dist/*.js'])
    .pipe(gulp.dest('vendor/scrollreveal'))

  gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ])
    .pipe(gulp.dest('vendor/font-awesome'))
})

// Run everything
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy'])

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: ''
    },
  })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js'], function() {
  gulp.watch('less/*.less', ['less'])
  gulp.watch('css/*.css', ['minify-css'])
  gulp.watch('js/*.js', ['minify-js'])
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('*.html', browserSync.reload)
  gulp.watch('js/**/*.js', browserSync.reload)
})
