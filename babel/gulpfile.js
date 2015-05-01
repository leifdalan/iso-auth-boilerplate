import gulp from 'gulp';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import browserSync from 'browser-sync';
import del from 'del';
import webpackHotConfig from '../webpack.hot-config';
import webpackConfig from '../webpack.config';
import config from '../config';

const aws = {
  key: config.AWS_KEY,
  secret: config.AWS_SECRET,
  bucket: config.AWS_BUCKET,
  region: 'us-west-2'
};

const debug = require('debug')('gulp:feedback');
const $ = require('gulp-load-plugins')();
const {
  WEBPACK_DEV_SERVER_PORT: WPDEVPORT,
  DEVELOPMENT_PORT: DEVPORT,
  BROWSERSYNC_PORT: BSPORT,
  HOSTNAME,
  PROTOCOL,
  BROWSER_RELOAD_TIMEOUT,
  DEBUG,
  NODE_ENV,
  PUBLIC_PATH
} = config;
const paths = {
  sharedJS: '!node_modules/**/*',
  baseJS: './**/*.{js,jsx}'
};
const webPackAddress = `${PROTOCOL}${HOSTNAME}:${WPDEVPORT}`;

gulp.task('server', (cb) => {
  const options = {
    script: 'index.js',
    ext: 'js,jsx',
    env: {
      DEBUG,
      NODE_ENV
    }
  };

  if ($.util.env.clientOnly) {
    options.ignore = ['shared', 'src', 'node_modules', '!shared/routes.js'];
    options.env.REACT_CLIENT_RENDER = true;
    options.env.REACT_SERVER_RENDER = false;
  } else if ($.util.env.serverOnly) {
    options.ignore = ['node_modules'];
    options.env.REACT_SERVER_RENDER = true;
    options.env.REACT_CLIENT_RENDER = false;
  } else if ($.util.env.iso) {
    options.ignore = ['node_modules'];
    options.env.REACT_SERVER_RENDER = true;
    options.env.REACT_CLIENT_RENDER = true;
  }

  if ($.util.env.admin) {
    options.env.ALWAYS_ADMIN = true;
  }

  if ($.util.env.ptod) {
    options.env.NODE_ENV = 'production';
  }

  debug('NODEMON OPTIONS: ', options);

  $.nodemon(options);
  cb();
});

gulp.task('eslint', () => {
  return gulp.src([paths.sharedJS, paths.baseJS])
    .pipe($.cached('eslint'))
    .pipe($.eslint({
      globals: {
        document: true,
        console: true,
        debug: true,
        process: true,
        __dirname: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        window: true
      }
    }))
    .pipe($.eslint.format())
    .pipe($.notify({
      message: (file) => {
        if (!file || !file.eslint || file.eslint.success || !file.eslint.messages.length) {
          // Don't show something if success
          return false;
        }
        const errors = file.eslint.messages.map((data) => {
          if (data) {
            return '(' + data.line + ':' + data.column + ') ' + data.message;
          }
        }).join('\n');
        const endPath = file.eslint.filePath.replace(__dirname, '');
        return endPath + ' (' + file.eslint.messages.length + ' errors)\n' + errors;
      },
      title: 'ESLint'
    })
  );
});


gulp.task('devserver', (callback) => {
  // Start a webpack-dev-server
  new WebpackDevServer(webpack(webpackHotConfig), {
    publicPath: `${PUBLIC_PATH}/`,
    hot: true,
    noInfo: true,
    stats: {
      colors: true
    }
  })
  .listen(WPDEVPORT, HOSTNAME, (err) => {
  if (err) {
    $.notify(err);
    throw new $.util.PluginError('webpack-dev-server', err);

  }
  $.util.log('[webpack-dev-server]', webPackAddress);
  // keep the server alive or continue?
  callback();
  });
});

gulp.task('browser-sync', () => {
  setTimeout(() => {
    debug(`Starting browserSync server, proxying ${DEVPORT} to ${BSPORT}.`);
    browserSync({
      proxy: `${PROTOCOL}${HOSTNAME}:${DEVPORT}`,
      port: BSPORT
    });
  }, BROWSER_RELOAD_TIMEOUT);
});

gulp.task('browser-reload', () => {
  setTimeout(() => {
    debug('Reloading open browsers.');
    browserSync.reload();
  }, BROWSER_RELOAD_TIMEOUT);

});

// Compile LESS
gulp.task('less', (cb) => {
  debug('Lessing....');
  return gulp.src('src/less/main.less')
    .pipe($.sourcemaps.init())
    .on('error', (err) => {
      debug(err);
      cb();
    })
    .pipe($.less())
    .on('error', (err) => {
      $.notify(err);
      debug(err);
      cb();
    })
    .pipe($.sourcemaps.write({
      includeContent: false
    }))
    .on('error', (err) => {
      debug(err);
      cb();
    })
    .pipe($.sourcemaps.init({
      loadMaps: true
    }))
    .on('error', (err) => {
      debug(err);
      cb();
    })
    .pipe($.autoprefixer())
    .on('error', (err) => {
      debug(err);
      cb();
    })
    .pipe($.sourcemaps.write('.'))
    .on('error', (err) => {
      debug(err);
      cb();
    })
    .pipe(gulp.dest(`.${PUBLIC_PATH}`))
    .pipe($.filter('**/*.css'))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(gulp.dest(`.${PUBLIC_PATH}`)); // Copy to static dir
});

gulp.task('watch', () => {
  gulp.watch('./**/*.less', ['less']);
  gulp.watch('/index.js', ['browser-reload']);
  // gulp.watch(paths.less, ['less']);
  gulp.watch(['./**/*.{jsx,js}', '!./node_modules/**/*'], ['eslint']);
});

gulp.task('clean', (cb) => {
  del(['dist/*'], cb);
});

gulp.task('bundleJS', ['clean'], () => {
  return gulp.src('./client.js')
    .pipe($.webpack(webpackConfig))
    .pipe(gulp.dest(`.${PUBLIC_PATH}/`));
});

// ----------------------------------------------------------------------------
// Deployment Tasks
// ----------------------------------------------------------------------------

gulp.task('g-zip', ['rev'], function() {
  return gulp.src([`.${PUBLIC_PATH}/**/*`])
    .pipe($.gzip())
    .pipe(gulp.dest(`.${PUBLIC_PATH}/`));
});

gulp.task('rev', ['build'], function() {
  return gulp.src([`.${PUBLIC_PATH}/**/*`])
    .pipe($.rev())
    .pipe(gulp.dest(`.${PUBLIC_PATH}/`))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('.'));
});

gulp.task('awsJS', function() {
  return gulp.src(`.${PUBLIC_PATH}/**/*.js.gz`)
    .pipe($.s3(aws, {
      gzippedOnly: true,
      headers: {
        'Cache-Control': 'max-age=315360000, no-transform, public',
        'Content-Type': 'application/javascript; charset=UTF-8',
        'Vary': 'Accept-Encoding'
      }
    }));
});


gulp.task('awsCSS', function() {
  return gulp.src(`.${PUBLIC_PATH}/**/*.css.gz`)
    .pipe($.s3(aws, {
      gzippedOnly: true,
      headers: {
        'Cache-Control': 'max-age=315360000, no-transform, public',
        'Content-Type': 'text/css; charset=UTF-8',
        'Vary': 'Accept-Encoding'
      }
    }));
});

gulp.task('aws', ['awsCSS', 'awsJS']);

gulp.task('dev', ['clean', 'watch', 'devserver', 'browser-sync', 'less', 'server']);

gulp.task('build', ['clean', 'less', 'bundleJS']);

gulp.task('server-only', ['clean', 'watch', 'browser-sync', 'less', 'server']);

gulp.task('deploy', ['g-zip'], function() {
  gulp.start('aws');
  const manifest = require('../rev-manifest.json');
  $.run(`heroku config:set CSS_PATH=${manifest['main.css']} ` +
        `JS_PATH=${manifest['client.js']} ` +
        `PUBLIC_ASSET_DOMAIN=s3-${aws.region}.amazonaws.com ` +
        `PUBLIC_PATH=/${aws.bucket}`).exec();
  $.run(`git push heroku master`).exec();
});

gulp.task('run', function() {
  $.run('echo hello');
});
