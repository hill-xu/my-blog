
---
title: webpack loader plugin
---

### webpack loader
*定义*：loader是一个导出为function的node模块。可以将匹配到的文件进行一次转换，同时loader可以链式传递。
#### loader的特点
- loader 的执行顺序和代码书写的顺序是相反的，即：从下至上，从右至左。
- 第一个执行的 loader 会接收源文件做为参数，下一次执行的 loader 会接收前一个 loader 执行的返回值做为参数
- 需要严格遵循“单一职责”原则，即每个 loader 只负责自己需要负责的事情
- 顺序最后的 loader 第一个被调用，它拿到的参数是 source 的内容
- 顺序第一的 loader 最后被调用， webpack 期望它返回 JS 代码，source map 如前面所说是可选的返回值。
- 夹在中间的 loader 被链式调用，他们拿到上个 loader 的返回值，为下一个 loader 提供输入。

#### loader的使用方式
##### 1：在配置文件webpack.config.js中配置
```
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: path.resolve(__dirname, 'var_to_const')
      }]
    }]
  },
  resolveLoader: {
    // 告诉 webpack 该去那个目录下找 loader 模块
    modules: ['node_modules', path.resolve(__dirname, 'loaders')]
  }
```
##### 2：通过命令行参数方式
```
  webpack --module-bind 'txt=var_to_const'
```

##### 3：通过内联使用（相当于使用 var_to_const来导入 file.txt 文件）
```
import txt from 'var_to_const!./file.txt';
```


#### loader的自定义
```
module.exports = function(source){
  var content="";
  content = source.replace(/var/g, "const");
  return content; 
}
```
source为匹配文件的文件内容，在这里你可以为所欲为，用正则或者AST处理内容并返回。

#### loader的API
methods|含义
--|:--:|
this.request | 被解析出来的 request 字符串。例子："/abc/loader1.js?xyz!/abc/node_modules/loader2/index.js!/abc/resource.js?rrr"
this.loaders | 所有 loader 组成的数组。它在 pitch 阶段的时候是可以写入的。
this.async | 告诉 loader-runner 这个 loader 将会异步地回调
this.callback | 一个可以同步或者异步调用的可以返回多个结果的函数
this.resourcePath | 资源文件的路径。
[loader API](https://www.webpackjs.com/api/loaders/)


### webpack plugin
#### 写一个plugin
主要的步骤如下:
1. 编写一个JavaScript命名函数。
2. 在它的原型上定义一个apply方法。
3. 指定挂载的webpack事件钩子。
4. 处理webpack内部实例的特定数据。
5. 功能完成后调用webpack提供的回调。


编写插件之前要理解compiler和compilation两个对象，以及webpack生命周期的各个阶段和钩子，plugin比loader强大，通过plugin你可以访问compliler和compilation过程，通过钩子拦截webpack的执行。

比如我们可以在构建生成文件时，将所有生成的文件名生成到filelist.md的文件中

```
class FileListPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compliation, cb) => {
      let assets = compliation.assets;
      let content = `##  文件名   文件大小\r\n`;
      Object.entries(assets).forEach(([filename, stateObj]) => {
          content += `- ${filename}    ${stateObj.size()}\r\n`
      });
      assets[this.filename] = {
          source() {
              return content;
          },
          size() {
              return content.length;
          }
      };
      cb();
    })
  }
}

module.exports = FileListPlugin;
```

> webpack会将compilation.assets的内容生成文件，所以可以在构建中利用它生成我们想要的文件。


#### webpack 插件分析
##### 1. 首先介绍webpack源码分析方法
- node --inspect-brk ./node_modules/webpack/bin/webpack.js --config ./webpack.config.js
- chrome输入 chrome://inspect/
##### 2. 主要的流程是：
![blockchain](https://pic2.zhimg.com/80/v2-e2a3d16099153701cab0cb8cebc78e01_720w.png "流程")


