---
title: javascript 面向对象编程
---

## javascript 面向对象编程

### 工厂模式
通过声明一个传入属性值的函数，内部定义new Object创建对象并返回这个对象
```javascript
function createObj(name) {
  var o = new Object();
  o.name = name
  return o
}
```
缺陷： 无法得知创建的对象属于什么类型


### 构造函数模式
通过new首字母大写的函数来创建对象
```javascript
function Obj(name) {
  this.name = name
}

var o = new Obj('name')
```
new 操作符做了什么？
1.创建一个新对象
2.将构造函数的作用域指向新对象
3.执行构造函数的代码
4.返回新对象

当直接调用一个构造函数，属性、方法指向的是window.

缺陷：针对构造函数内部的方法，每创建一个对象都创建了一个不同的方法实例。可以采取引用外部声明的方式去解决
```javascript
function Obj(name) {
  this.name = name
  this.fn = fn
}
function fn() {} // 如果定义很多方法会产生很多的全局函数，但其实这些函数只被创建的对象使用。可以使用原型模式解决该问题
```

### 原型模式
通过构造函数的prototypt让实例共享方法和属性
1.最好不要通过prototypt共享属性，特别是引用类型的属性
2.可以赋值prototypt为新的对象并指定constructor属性减少xx.prototype的使用次数

最佳实战
```javascript
function P(name) {
  this.name = name
} 
P.prototype = {
  constructor: P,
  getName = function() {
    return this.name
  }
}
```

### 动态原型模式
判断原型是否存在某些方法，如果不存在则赋予prototype方法
```javascript
function P(name) {
  this.name = name
  // 只有第一次调用构造函数的时候才会执行
  if (typeof this.getName != 'function') {
    P.ptototype.getName = function() {
      return this.name
    }
  }
}
```
### 继承
javascript只支持实现继承，实现实现继承主要依靠原型链

### 原型链
依赖原型搜索机制，重写prototype对象等于另一个类型的实例。让当前原型对象和另一个类型的原型对象建立联系。向上查找。

### 原型链继承
子类构造函数的ptototype指向父类的实例
```javascript
function F() {}
function C() {}
C.prototype = new F()
```
缺陷
1.针对引用类型所有的实例都会共享
2.无法在不影响所有实例的情况下，给超类型的构造函数传递参数


### 经典继承（借用构造函数）
子类在构造函数中调用父类的构造函数(可以进行赋值)
```javascript
function F() {}
function C() {
  F.call(this)
}
```
缺陷
1.方法都在构造函数中定义，无法做到方法的复用
2.父类定义的方法对子类不可见，所有的类型只能使用构造函数模式

### 组合继承
通过原型链继承实现原型属性和方法的继承，通过经典继承（借用构造函数）实现实例属性的继承
```javascript
function F() {}
function C() {
  F.call(this)
}
C.prototype = new F()
```
缺陷
1.任何情况下构造函数都会执行两次

### 原型式继承
创建一个新的构造函数，构造函数的prototype指向继承的对象并返回新的对象实例
```javascript
function object(F) {
  function C() {}
  c.prototype = F
  return new C()
}
```
Object.create()方法规范了原型式继承
该方法有两个参数
第一个用作新对象原型的对象
第二个给新对象定义额外属性的对象（格式与Object.defineProperties类似）

缺陷
1.存在和原型链继承相同的问题，引用类型共享

### 寄生式继承
用原型式继承方式产生对象副本，然后对副本对象进行加强，最后返回副本对象
```javascript 
function createObj(F) {
  var c = object(F)
  c.xx = function () {

  }
  return c
}
```

### 寄生组合继承
为了解决组合继承调用2次父类构造函数的问题
通过构造函数来继承属性，通过原型链的混合形式来继承方法（用原型式方式创建父类原型对象的副本，副本的constructor指向子类构造函数，最后子类的原型对象指向父类原型对象的副本）
```javascript
function inheritPrototype(c, f) {
  var prototype = object(f.prototype)
  prototype.constructor = c
  c.prototype = prototype
}
```


