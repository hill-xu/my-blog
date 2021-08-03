---
title: WEBPACK 打包构建优化
---
# Webpack 优化
webpack优化主要有两个方面：
1.构建速度优化，当项目越来越大的时候编译的速度会变慢，从而影响开发效率。
2.打包优化，对产出的代码进行合理代码分割、css shaking、js shaking...等

## 默认无优化webpack配置
```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/react", "@babel/env"]
                    },  
                }]
            }, 
            {
                test: /\.css$/,
                use: [
                    'style-loader', 
                    'css-loader', 
                    // 针对import './index.css' 引入的css做处理
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: ["postcss-preset-env"]
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // 根据模版生成html
        new HtmlWebpackPlugin({
            template: 'template/index.html'
        })
    ]
}
```

## 构建速度优化
1.通过设置include/exclude减少webpack遍历目录树的时间。主要针对loader添加该配置
```javascript
...
rules: [
    {
        test: /\.js$/,
        include: [path.resolve(__dirname, "./src")],
        use: [{
            loader: 'babel-loader',
            options: {
                presets: ["@babel/react", "@babel/env"]
            },  
        }]
    }, 
    {
        test: /\.css$/,
        include: [path.resolve(__dirname, "./src")],
        use: [
            'style-loader', 
            'css-loader', 
            {
                loader: "postcss-loader",
                options: {
                    postcssOptions: {
                        plugins: ["postcss-preset-env"]
                    }
                }
            }
        ]
    }
]
...
```

2.设置resolve.modules
```javascript
resolve: {
    modules: [path.resolve(__dirname, 'node_modules')]
}
```
resolve.modules用于配置webpack去哪些目录下寻找第三方模块，默认是 ['node_modules']，但是，它会先去当前目录的/node_modules查找，没有的话再去 ../node_modules最后到根目录。
所以当安装的第三方模块都放在项目根目录时，就没有必要安默认的一层一层的查找，直接指明存放的绝对位置。


3.设置resolve.extensions
```javascript
resolve: {
    extensions: ['js']
}
```
在导入没带文件后缀的路径时，webpack会自动带上后缀去尝试询问文件是否存在，而 resolve.extensions用于配置尝试后缀列表；默认为 extensions:['js','json']。
当遇到 require('./data')时webpack会先尝试寻找 data.js，没有再去找 data.json；如果列表越长，或者正确的后缀越往后，尝试的次数就会越多。

所以在配置时为提升构建优化需遵守：
+ 频率出现高的文件后缀优先放在前面。
+ 列表尽可能的小。
+ 书写导入语句时，尽量写上后缀名。

4.resolve.alias
webpack 默认会去寻找所有 resolve.root 下的模块，但是有些目录我们是可以明确告知 webpack 不要管这里，从而减轻 webpack 的工作量

5.module.noParse
告诉webpack精准过滤不需要解析的文件
```javascript
noParse: /jquery|lodash/,  //接收参数  正则表达式 或函数
noParse:function(contentPath){
    return /jquery|lodash/.test(contentPath);
}
```
主要用到的是函数的方式, contentPath包含loader路径以及资源路径(loader1!loader2!..loaderx!assetsPath) 有更大的操作空间


6.DLLPlugin/DllReferencePlugin 
DLLPlugin 它能把第三方库代码分离开，并且每次文件更改的时候，它只会打包该项目自身的代码。所以打包速度会更快。类似缓存的概念。
添加webpack.dll.config.js
```javascript
const path = require('path')
const DllPlugin = require('webpack/lib/DllPlugin')
module.exports = {
    ...
    entry: {
        react: ['react-dom', 'react']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: '_dll_[name]'
    },
    ...
    plugins: [
        new DllPlugin({
            /*
                该插件的name属性值需要和 output.library保存一致，该字段值，也就是输出的 manifest.json文件中name字段的值。
                比如在jquery.manifest文件中有 name: '_dll_jquery'
            */
            name: '_dll_[name]',
            /* 生成manifest文件输出的位置和文件名称 */
            path: path.join(__dirname, 'dist', '[name].manifest.json')
        }),
    ]
}
```

```javascript
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
...
plugins: [
    // 告诉webpack使用了哪些第三方库代码
    new DllReferencePlugin({
        manifest: require('./dist/react.manifest.json')
    }),
    new AddAssetHtmlPlugin([
        { 
            filepath: require.resolve('./dist/react.js'),
            publicPath: ''
        }
    ])
]
```


7.DLLPlugin配置太复杂了，可以用hard-source-webpack-plugin插件。HardSourceWebpackPlugin是webpack的插件，为模块提供中间缓存步骤。为了查看结果，您需要使用此插件运行webpack两次：第一次构建将花费正常的时间。第二次构建将显着加快

```javascript
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
...
new HardSourceWebpackPlugin()
```
[webpack5 HardSourceWebpackPlugin 问题](https://github.com/mzgoddard/hard-source-webpack-plugin/issues/461)


## 打包输出优化

1.css 抽离独立文件
    在不做css抽离之前，会在打包的js里面引入css内容，通过一系列css loader的处理，最终通过style-loader加载到html中去。增加了js文件的体积。使用mini-css-extract-plugin来实现css抽离, 用MiniCssExtractPlugin.loader代替style-loader。
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
...
module: {
    rules: [
        {
            test: /\.css$/,
            include: [path.resolve(__dirname, "./src"),],
            use: [
                MiniCssExtractPlugin.loader,
                // 'style-loader', 
                'css-loader', 
            ]
        }
    ]
},
plugins: [
    // 抽离css
    new MiniCssExtractPlugin({
        filename: "css/common.css"
    })
]
...
```

2.js代码分割, 有两种方式。
2.1 entry - 配置多入口、多页面
```javascript
entry: {
    index: './src/index.js',
    xxx: './src/xxxx.js',
}
```
弊端：如果有公共的代码块，那么打包之后的两个Bundle里都会包含重复的模块。



2.3 splitChunks - 智能抽取公共代码
```javascript
optimization: {
    splitChunks: {
        cacheGroups: {
            commons: {
                test: /[\\/]node_modules[\\/]/, // 匹配规则，可以根据需要调整粒度
                name: 'vendor', // 模块的名字
                chunks: 'all', 
                minChunks: 1, // 至少被引用1次才会生成代码块,也可以全局配置。
            },
        },
    },
}
```

3.tree shaking(摇树)
代码中可能存在没有被引用的方法或者没有被使用的css样式使代码体积增大，可以通过js/css shaking减少代码的体积。
3.1 css shaking
以前的方案
```javascript
const PurifyCss = require('purifycss-webpack')
const glob = require('glob-all')
...
new PurifyCss({
    paths: glob.sync([
        path.resolve(__dirname, "./template/*.html"), // 请注意，我们同样需要对 html 文件进行 tree shaking
        path.resolve(__dirname, "./src/*.js")
    ])
})
```

现在的方案
```javascript
const PurifyCss = require('purifycss-webpack')
const glob = require('glob-all')
...
new PurgecssPlugin({
    paths: glob.sync(path.resolve(__dirname, "./src/*.js"), {nodir: true}), // 需要tree shaking的代码
})
```

3.2 js shaking
usedExports: 
```javascript
optimization: {
    usedExports: true, // production下默认配置
}
```

sideEffects: 在package.json中配置
```javascript
sideEffects: false, // 没有副作用，所有模块都可删除
sideEffects: [./xx.js] // ./xx.js 不会被不删除
```


## 构建速度分析
1.查看webpack complier生命周期执行用时的消耗
```javascript
const webpack = require('webpack');
const webpakConfig = require('./webpack.config.js')
const compiler = webpack(webpakConfig)
const dayjs = require('dayjs')
let preTime = dayjs()
Object.keys(compiler.hooks).forEach(hookName => {
    compiler.hooks[hookName].tap(`run -> ${hookName}`, (compilation) => {
        console.log(`run -> ${hookName} 花费： ${dayjs().diff(preTime, 'ms')}ms`);
        preTime = dayjs()
    })
})
compiler.run()


run -> beforeRun 花费： 5ms
run -> run 花费： 1ms
run -> normalModuleFactory 花费： 2ms
run -> contextModuleFactory 花费： 0ms
run -> beforeCompile 花费： 0ms
run -> compile 花费： 1ms
run -> thisCompilation 花费： 5ms
run -> compilation 花费： 6ms
run -> make 花费： 1ms
run -> normalModuleFactory 花费： 11ms
run -> contextModuleFactory 花费： 0ms
run -> beforeCompile 花费： 0ms
run -> compilation 花费： 2ms
run -> finishMake 花费： 63ms
run -> afterCompile 花费： 29ms
run -> normalModuleFactory 花费： 751ms
run -> contextModuleFactory 花费： 1ms
run -> beforeCompile 花费： 0ms
run -> compilation 花费： 1ms
run -> finishMake 花费： 1345ms
run -> afterCompile 花费： 10ms
run -> finishMake 花费： 3ms
run -> afterCompile 花费： 28ms
run -> shouldEmit 花费： 0ms
run -> emit 花费： 0ms
run -> afterEmit 花费： 11ms
run -> done 花费： 0ms
run -> afterDone 花费： 0ms
```

2.体积分析  
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
...
new BundleAnalyzerPlugin()
```
能个直观的展示打包之后各个文件的大小，重点对大文件进行关注


3.速度分析
```javascript
const SpeedMeasurePlugin=require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin();
module.exports = smp.wrap({
    // webpack配置
})
```
可以看到每个loader和插件执行耗时，重点的关注耗时较长的loader或插件，针对这些做优化。


  

    






