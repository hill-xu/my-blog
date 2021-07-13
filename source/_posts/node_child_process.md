---
title: node child_process
---
# 很重要的两个api

区别 | child_process.exec() | child_process.exexFile()
---|---|---
 适用平台 |Windows | 在 Unix 类型的操作系统（Unix、Linux、macOS）上，child_process.execFile() 可以更高效
 参数 | child_process.exec(command[, options][, callback]) | child_process.execFile(file[, args][, options][, callback])
 

## child_process.exec(command[, options][, callback])


```javascript
const { exec } = require('child_process')
const cp = exec('node --version', {}, (err, stdout, stderr) => {
  console.log(err, stdout, stderr);
})

cp.stdout.on('data', (data) => {
  console.log(data);
})

cp.stdout.on('data', (data) => {
  console.log(data);
})

cp.on('exit', () => {
  console.log('退出');
})
```

++**exec的回调在exit之后**++