const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;
const spawn = require('gulp-spawn');
const run = require('gulp-run');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('client/app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('client/.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('client/app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('client/.tmp/scripts'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('client/app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('client/app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('client/test/spec/**/*.js', {
    fix: true,
    env: {
      mocha: true
    }
  })
    .pipe(gulp.dest('client/test/spec/**/*.js'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('client/app/*.html')
    .pipe($.useref({searchPath: ['client/.tmp', 'client/app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('client/dist'));
});

gulp.task('images', () => {
  return gulp.src('client/app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('client/dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('client/app/fonts/**/*'))
    .pipe(gulp.dest('client/.tmp/fonts'))
    .pipe(gulp.dest('client/dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'client/app/*.*',
    '!client/app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('client/dist'));
});

gulp.task('clean', del.bind(null, ['client/.tmp', 'dist']));

gulp.task('serve:client', ['styles', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['client/.tmp', 'client/app'],
      routes: {
        '/bower_components': 'client/bower_components'
      }
    }
  });

  gulp.watch([
    'client/app/*.html',
    'client/app/images/**/*',
    'client/.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('client/app/styles/**/*.scss', ['styles']);
  gulp.watch('client/app/scripts/**/*.js', ['scripts']);
  gulp.watch('client/app/fonts/**/*', ['fonts']);
  gulp.watch('client/bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'client/test',
      routes: {
        '/scripts': 'client/.tmp/scripts',
        '/bower_components': 'client/bower_components'
      }
    }
  });

  gulp.watch('client/app/scripts/**/*.js', ['scripts']);
  gulp.watch('client/test/spec/**/*.js').on('change', reload);
  gulp.watch('client/test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('client/app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('client/app/styles'));

  gulp.src('client/app/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('client/app'));
});

gulp.task('build:client', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build:server', () => {
  return run('dotnet restore server/src/ServerSent').exec(() => {
    return run('dotnet restore server/src/Streamin').exec(() => {
      return run('dotnet build server/src/Streamin').exec();
    });
  });
});

gulp.task('serve:server', () => {
  return run('dotnet run -p ./server/src/Streamin').exec();
  // return spawn({
  //   cmd: 'dotnet run -p ./server/src/Streamin'
  // });
});

gulp.task('serve', () => {
  gulp.start('serve:server');
  gulp.start('serve:client');
});

gulp.task('default', ['clean', 'build:client', 'build:server'], () => {
});
