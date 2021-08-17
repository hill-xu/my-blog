# ts基础知识
<!-- 和相关报错处理 -->

<!-- ## 基础知识 -->

### 基础类型
1. 
```javascript
const myName: string = 'hill-xu'; // 字符串类型
const myMoney: number = 100; // 数字类型
const bStop: boolean = false; // 布尔类型
const arr: number[] = [1, 2]; // 数组类型
const arrT: Array<number> = [2, 4]; // 数组类型
const tupleArr: [string, number] = ['xq', 2]; // 元组: 定死数组长度和对应的类型 
```

2. 枚举
```javascript
enum myInfo { name = 'xqs', age = 26, money = 10000 }
// 针对值是number类型的可以做到相互映射
// 编译成js之后的代码
var myInfo;
(function (myInfo) {
    myInfo["name"] = "xqs";
    myInfo[myInfo["age"] = 26] = "age";
    myInfo[myInfo["money"] = 10000] = "money";
})(myInfo || (myInfo = {}));
```
__针对字符串和数值的相互映射就可以使用枚举，避免声明两个对象进行映射__


3. any和Object和object
```javascript
const x: any = 10; // 跳过检查
const xx: Object = 20; // 类似any
xx.toFixed(); //error 允许进行任意类型的赋值，但是不允许在它上面调用任意的方法，就算本身存在这个方法
const xxx: object = 30; // error object 类型不包括原始值
```

4. void: 表示没有任何类型，一般用来描述没有返回值的函数。用来声明变量没有意义因为只能赋值undefined和null
```javascript
function setXX(name: string): void {}
```

5. Null 和 Undefined
默认情况下null和undefined是所有类型的子类型。 就是说你可以把 null和undefined赋值给number类型的变量。当你指定了--strictNullChecks标记，null和undefined只能赋值给void和它们各自, 在变量初始化的时候可能会赋值null或者undefined后期在赋值真实的类型，这个时候可以使用(type | null | undefined)联合类型。

6. never: 没啥用

### 接口(interface)
1. 
```javascript
interface myInterFace {
    props1: string;
    props2?: string; // 可选属性
    readonly props3: string; // 只读属性
    [propName: string]: any; // 字符串索引签名 允许额外的属性存在
}
```

2. 函数类型
```javascript
interface funcInterface {
    (args1: string, args2: string): string
}
const fn: funcInterface
fn = function(str1: string, str2: string) {
    return ''
}
// 函数的参数名不需要与接口里定义的名字相匹配
```

3. 可索引的类型
```javascript
interface StringArray {
  [index: number]: string;
}
```
__TypeScript支持两种索引签名：字符串和数字。 可以同时使用两种类型的索引，但是数字索引的返回值必须是字符串索引返回值类型的子类型。因为最后是把数字索引处理成字符串索引__
```javascript
class Animal {
    name: string;
}
class Dog extends Animal {
    breed: string;
}
// 错误Animal不是Dog的子类
interface NotOkay {
    [x: number]: Animal;
    [x: string]: Dog;
}
// 正确的方式
interface Okay {
    [x: number]: Dog;
    [x: string]: Animal;
}
```
__声明字符串索引要注意其他属性的类型__
```javascript
interface NumberDictionary {
  [index: string]: number;
  length: number;    // 可以，length是number类型
  name: string       // 错误，`name`的类型与索引类型返回值的类型不匹配
}
```

4. 接口继承: 通过extends关键字

### 函数
```javascript
function fn(
    arg1: string, // 默认参数
    arg2?: string, // 可选参数
    ...otherArgs: string[], // 剩余参数
): void {

}
```

### 泛型
```javascript
function fn1<T> (args: T ): T {
    return '' // args.length会报错 泛型代表任意类型，有些类型没有length属性。可以声明泛型数组args: T[]
}
fn1('') // 可以是任意的类型
fn1<string>('') // 参数必须是字符串
```
__使用泛型先要声明<T>, T可以替换成任意的字母__

泛型约束，可以让泛型包含一些特定的属性
```javascript
interface havelen {
    length: number
}
function fn1<T extends havelen> (args: T ): void {}

// 两个类型之间使用约束
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}
// 这个时候K就必须要是T的索引
```

### 交叉类型
可以让一个类型拥有多个类型的成员(K = U & T)
```javascript
interface a {
    name: string
    money: number
}
interface b {
    name: string;
    age: number
}
const xx: a & b = {
    name: "xqs",
    age: 20,
    money: 20,
    sex: '男'  // error 类型a | b 不存在属性sex
}
xx.age 
xx.name
xx.money
```

### 联合类型
对于基础类型:可以让一个类型在多个类型中自由选择(string | number)
对于非基础类型: 只能访问此联合类型的所有类型里共有的成员
```javascript
interface a {
    name: string
    money: number
}
interface b {
    name: string;
    age: number
}
const xx: a | b = {
    name: "xqs",
    age: 20,
    money: 20,
    sex: '男' // error 类型a | b 不存在属性sex
}
xx.age // error 类型a不存在age属性
xx.name
xx.money // error 类型b不存在money属性
```
__交叉类型和联合类型在对象声明的时候没有区别，联合类型在成员的访问上有只能访问共有的成员的限制。__

### 类型保护
在对象调用成员之前告知属于那个类型。可以解决上述联合类型的属性调用报错的问题
```javascript
interface a {
    name: string
    money: number
}
interface b {
    name: string;
    age: number
}
const xx: a | b = {
    name: "xqs",
    age: 20,
    money: 20
}
(<b>xx).age // 可以调用不属于共有成员的age
xx.name
(<a>xx).money // 可以调用不属于共有成员的money
```

#### 用户自定义的类型保护
上面的例子每次访问成员都要使用类型断言，代码比较繁琐。可以通过一次类型检查确定当前分支的的类型的方法减少使用类型断言。
```javascript
interface a {
    name: string
    money: number
}
interface b {
    name: string;
    age: number
}
const xx: a | b = {
    name: "xqs",
    age: 20,
    money: 20,
};
function isA(obj: a|b): obj is a {
    return (<a>obj).money !== undefined;
}
if (isA(xx)) {
    // 就可以在这个分支中不使用类型断言的调用a类型的成员了
    xx.money
} else {
    xx.age
}
```
__obj is a就是类型谓词。 谓词为 parameterName is Type这种形式， parameterName必须是来自于当前函数签名里的一个参数名。__

#### typeof类型保护
针对基础类型的类型判断不需要像上面的声明一个判断函数。
```javascript
function fn2(type: string|number) {
    if (typeof type === 'string') {
        return type.length
    }
    if (typeof type === 'number') {
        return type * 1
    }
}
```
__typeof类型保护*只有两种形式能被识别： typeof v === "typename"和 typeof v !== "typename"， "typename"必须是 "number"， "string"， "boolean"或 "symbol"。__


#### instanceof类型保护
```javascript
interface P {
    getValue(): string
}
class C1 implements P {
    constructor(private num: number) {}
    numName: any
    getValue() {
        return '1'
    }
}
class C2 implements P {
    constructor(private str: string) {}
    strName: any
    getValue() {
        return '2'
    }
}

function getRandomPadder() {
    return Math.random() < 0.5 ?
        new C1(4) :
        new C2("");
}
let p = getRandomPadder()
p.getValue()
p.numName // error 类型C2不存在属性numName
p.strName // error 类型C1不存在属性strName
if (p instanceof C1) {
    p.getValue()
    p.numName
}
if (p instanceof C2) {
    p.getValue()
    p.strName
}
```

### 类型别名
```javascript
type Var = string;
type Fn = () => string;
type Obj<T> = { value: T }
type Tree<T> = {
    value: T;
    left: Tree<T>;
    right: Tree<T>
}
type Info = "name" | "age";
```
__类型别名不能被 extends和 implements（自己也不能 extends和 implements其它类型),如果你无法通过接口来描述一个类型并且需要使用联合类型或元组类型，这时通常会使用类型别名__

### 索引类型
```javascript
//索引类型查询操作符keyof T的结果为 T上已知的公共属性名的联合
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}
// 索引访问操作符T[K]
```

### 映射类型
```javascript
// 声明一个属性全部可选的类型
type Optional<T> = {
    [P in keyof T]?: T[P] 
}
// 声明一个属性全部只读的类型
type ReadOnly<T> = {
    readonly [P in keyof T]: T[P] 
}
```


