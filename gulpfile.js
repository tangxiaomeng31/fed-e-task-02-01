// 实现这个项目的构建任务
const { src, dest, series, parallel, watch } = require('gulp')

//清除文件
const del = require('del')

//创建一个开发服务
var browserSync = require('browser-sync').create()

const sass = require('gulp-sass')
const babel = require('gulp-babel')
const imagemin = require('gulp-imagemin')
const swig = require('gulp-swig')

//html模板所需数据
const data = {
    date: new Date(),
    pkg: require('./package.json'),
    menus: [
        {
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'About',
            icon: 'github',
            link: 'about.html'
        },
    ]
}

//style模块 通过gulp-sass对scss文件进行编译
function styles () {
    return src('src/assets/styles/*.scss', { base: 'src' })
        .pipe(sass({outputStyle: 'compressed'})) //处理scss并压缩
        .pipe(dest('temp'))
}

//js代码
function scripts () {
    return src('src/assets/scripts/*.js', { base: 'src' })
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest('temp'))
}

//html处理 swig模板引擎转换插件
function htmls () {
    return src('src/*.html', { bacse: 'src' })
        .pipe(swig({ data }))
        .pipe(dest('temp'))
}

//图片处理
function image () {
    return src('src/assets/images/**', { base: 'src' })
        .pipe(imagemin())
        .pipe(dest('dist'))
}

//文字处理
function font () {
    return src('src/assets/fonts/**', { base: 'src' })
        .pipe(imagemin())
        .pipe(dest('dist'))
}

//public资源
function public () {
    return src('public/**', { base: 'public' })
        .pipe(dest('dist'))
}

//清除文件夹
function clean () {
    return del(['temp', 'dist'])
}

//web服务
function serve () {
    watch('src/assets/styles/*.scss', styles)
    watch('src/assets/scripts/*.js', scripts)
    watch('src/*.html', htmls)
    watch([
        'src/assets/images/**',
        'src/assets/fonts/**',
        'public/**'
    ], browserSync.reload)

    browserSync.init({
        files: 'temp/**',
        server: {
            baseDir: ['temp', 'src', 'public'],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

const compile = parallel(styles, scripts, htmls)
const build = series(clean, parallel(compile, public, image, font))
const deploy = series(compile, serve)

module.exports = {
    build,
    clean,
    serve,
    deploy
}