---
title: 缓存
---

# 强缓存
## cache-control
max-age：number 相对值  第一次请求的时间和max-age设置的时间计算过期时间  再拿请求时间和过期时间对比确定是否走缓存
no-cache: 不适用本地缓存，需要使用协商缓存
no-store:禁止浏览器使用缓存，每次都会下载资源
public：可以被所有用户缓存，包括终端用户和CDN等代理服务器
private:只能被终端的浏览器缓存
## expires
他的值是一个绝对时间的GMT时间格式的字符串，如果请求时间在expires之前本地缓存始终有效
## 注意
1.如果cache-control和expires同事存在  cache-control优先级较高
2.Expires要求客户端和服务端的时钟严格同步


# 协商缓存：有服务器决定资源是否缓存。响应头Last-Modified/请求头If-Modified-Since  响应头Etag/请求头If-None-Match 成对出现，若响应头没有Etag或Last-Modified则请求头没有响应字段
## Last-Modified/If-Modified-Since 都是GMT时间格式的字符串
1.浏览器第一次请求资源的时，在服务器返回资源的同时在response的header设置Last-Modified为资源在服务器上最后修改的时间

2.浏览器再次请求资源时,resquest的header设置If-Modified-Since为上次response的header.Last-Modified的值

3.浏览器再次请求资源时，对比If-Modified-Since和资源最后的修改时间，相同的话返回304（no Modified） 不会返回资源。也不会返回Last-Modified. 并从缓存读取资源

4.如果缓存没有命中，重新请求资源，更新Last-Modified
## Etag/If-None-Match
都是由服务器生成的每个资源的唯一标识。只要资源有变化这个值就会变化。判断过程与Last-Modified/If-Modified-Since一致。不同的是返回304时 依旧会返回Etag
## 注意
Last-Modified与ETag是可以一起使用的，服务器会优先验证ETag，一致的情况下，才会继续比对Last-Modified，最后才决定是否返回304。





