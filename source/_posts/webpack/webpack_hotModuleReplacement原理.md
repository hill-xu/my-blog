---
title: WEBPACK HMR 原理 
type: webpack
---
## 为什么要开启hmr
方便开发，代码更新后不需要手动刷新前端页面
## 如何开启hmr
1. webpack 配置
```javascript
module.exports = {
    devServer: {
        contentBase: path.resolve(__dirname, './dist'), // 设置静态资源目录
        hot: true, // 是否开启hmr
        port: 7000,
        host: '127.0.0.1'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}
```
除此之外还需要在代码中
```javascript
if (module.hot) {
    module.hot.accept('./a.js', () => {
        ...
    })
}
```
以上代码告诉webpack对./a.js进行监听 修改./a.js 会触发hmr
当然实际开发过程中不会这样处理都是借助第三方的插件
以react为例 需要react-hot-loader 插件
babel的配置文件在.babelrc
```javascript
"plugins": [
    "react-hot-loader/babel"
]
```

## hmr 原理
```seq
Compiler -> Server: 不同的编译阶段通知Server
Server -> client: 把编译进度告诉client
client -> devServer: 通过emitter 推送webpackHotUpdate
devServer -> bundle: 调用bundle 的hotCheck方法
bundle -> bundle: 请求新模块的内容 通过script引入

```
node_modules/webpack-dev-server/lib/Server.js
```javascript
const { compile, invalid, done } = compiler.hooks;
...
done.tap('webpack-dev-server', (stats) => {
    this._sendStats(this.sockets, this.getStats(stats)); // 
    this._stats = stats;
});
```
基于webpack compiler 生命周期通过this.sockWrite发送消息到client端
```javascript
this.sockWrite(sockets, 'hash', stats.hash);

if (stats.errors.length > 0) {
  this.sockWrite(sockets, 'errors', stats.errors);
} else if (stats.warnings.length > 0) {
  this.sockWrite(sockets, 'warnings', stats.warnings);
} else {
  this.sockWrite(sockets, 'ok');
}
```

node_modules/webpack-dev-server/client/index.js
接受来自Server.js 的sock的信息 在ok 和 warnings 调用reloadApp方法

```javascript
    var hotEmitter = require('webpack/hot/emitter');

    hotEmitter.emit('webpackHotUpdate', currentHash);

```
主要通过hotEmitter 和 node_modules/webpack/hot/dev-server.js 交互
```javascript
    var hotEmitter = require("./emitter");
	hotEmitter.on("webpackHotUpdate", function (currentHash) {
		lastHash = currentHash;
		if (!upToDate() && module.hot.status() === "idle") {
			log("info", "[HMR] Checking for updates on the server...");
			check();
		}
	});
```

```javascript
module.hot.check(true)
```
这里的module.hot 由bundle.js createModuleHotObject创建 module.hot.check(true) 调用

```javascript
function hotCheck(applyOnUpdate) {
    ...
    return __webpack_require__.hmrM().then(function (update) {
        ...
    });
}
```
__webpack_require__.hmrM()主要通过fetch请求服务端数据
```javascript
    fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
        ...
    // http://127.0.0.1:7000/main.a9229e35e308de66caf4.hot-update.json
    // chunk id 加 hash 请求后端
```
```javascript
{
    c:['main'], // 当前需要更新的chunk
    r:[],
    m:[]
}
```

返回结果调用
```javascript
Object.keys(__webpack_require__.hmrC).reduce(function (
    promises,
    key // 值为jsonp
) {
    // 所以调用的是
    __webpack_require__.hmrC[key](
        update.c,
        update.r,
        update.m,
    );
    return promises;
}
[])
// update 就是返回结果
```

遍历chunkIds 当installedChunks 中包含chunkId 时调用loadUpdateChunk
```javascript
__webpack_require__.hmrC.jsonp = function (
    chunkIds,
    ...
) {
    ...
    chunkIds.forEach(function (chunkId) {
        if (
            __webpack_require__.o(installedChunks, chunkId) &&
            installedChunks[chunkId] !== undefined
        ) {
            promises.push(loadUpdateChunk(chunkId, updatedModulesList));
            currentUpdateChunks[chunkId] = true;
        }
    });
};
```

loadUpdateChunk 通过__webpack_require__.l 创建script标签引入更新的模块
```javascript
...
return new Promise((resolve, reject) => {
    waitingUpdateResolves[chunkId] = resolve;
    ...
})
```
每次调用loadUpdateChunk返回一个Promise 以waitingUpdateResolves 收集resolve 当本次更新完成执行resolve
```javascript
self["webpackHotUpdatehmr"] = (chunkId, moreModules, runtime) => {
    ...
    if (runtime) currentUpdateRuntime.push(runtime);
    if (waitingUpdateResolves[chunkId]) {
        waitingUpdateResolves[chunkId]();
        waitingUpdateResolves[chunkId] = undefined;
    }
};
```
bundle.js 声明webpackHotUpdatehmr 方法 当__webpack_require__.l 引入新内容并成功加载时触发
```javascript
self["webpackHotUpdatehmr"]("main",{
      "./src/a.js":((module, __unused_webpack_exports, __webpack_require__) => {
              eval("const b = __webpack_require__(/*! ./b */ \"./src/b.js\")\nmodule.exports = {\n    a: 'abcdedfd',\n    b: b\n}\n\n//# sourceURL=webpack://hmr/./src/a.js?");
          })
      },
);
```
当所有的更新资源加载完成时调用hotCheck 中的如下代码
```javascript
return Promise.all(
    Object.keys(__webpack_require__.hmrC).reduce(function (
            promises,
            key
        ) {
            // 这里执行的是__webpack_require__.hmrC.jsonp
            __webpack_require__.hmrC[key](
                update.c,
                update.r,
                update.m,
                promises, // promises.push(loadUpdateChunk(chunkId, updatedModulesList));
                ...
            );
            return promises;
        },
        [])
).then(function () {
    return waitForBlockingPromises(function () {
        if (applyOnUpdate) {
            return internalApply(applyOnUpdate);
        } else {
            setStatus("ready");
            return updatedModules;
        }
    });
});
```

```javascript
function internalApply(options) {
    results.forEach(function (result) {
        if (result.apply) {
            var modules = result.apply(reportError); 
            ...
        }
    });
}
```

internalApply 调用result.apply 方法执行在代码中添加的回调 module.hot.accept('./a.js', () => {}) 做到更新页面的效果
result.apply 调用 applyHandler
```javascript
function applyHandler(options) {
    return {
        dispose:() => {},
        apply: () => {
            ...
            var acceptCallback = module.hot._acceptedDependencies[dependency];
            if (acceptCallback) {
                callbacks.push(acceptCallback);
            }
            for (var k = 0; k < callbacks.length; k++) {
                callbacks[k].call(); // 执行回调里面的逻辑
            }
            ...
        }
    }
}
```



## 关于react状态保存
单纯的hmr就是更新通知，请求新模块代码 通过script动态引入。无法做到react开发过程中对状态保存。
[react 状态保存原理](https://zhuanlan.zhihu.com/p/34193549)


