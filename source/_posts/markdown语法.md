
---
title: markdown 语法
---

### 1. 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

---

### 2. 引用

Markdown 标记区块引用和 email 中用 『>』的引用方式类似，只需要在整个段落的第一行最前面加上 『>』 ：

```markdown
> Coding.net 为软件开发者提供基于云计算技术的软件开发平台，包括项目管理，代码托管，运行空间和质量控制等等。
```

> 一级引用
>
> > 二级引用
> >
> > > 三级引用

### 3. 列表

- 有序列表

  ```markdown
  1. 第一项
  2，第二项
  ```

- 无序列表

  ```markdown
  - 无序列表项
  ```

- 待办列表

  ```markdown
  - [ ] 不勾选（中括号前后有空格，内部也有空格）
  - [x] 勾选（括号中是字母x）
  ```

- [ ] 不勾选

- [x] 勾选

### 4. 代码段

```markdown
​```javascript
console.log('hello, javasctipt');
​```
```

```javascript
console.log('hello, javasctipt');
```



### 5. 强调

- 斜体

  ```markdown
  *斜体*
  ```

  **斜体**

- 加粗

  ```markdown
  **加粗**
  ```

  **加粗**

  ***加粗斜体***

### 6. 链接

```markdown
[百度一下](www.baidu.com)
```

[百度一下](www.baidu.com)

### 7. 表格

```markdown
First Header | Second Header | Third Header
------------ | ------------- | ------------
Content Cell | Content Cell  | Content Cell
Content Cell | Content Cell  | Content Cell
```

| First Header | Second Header | Third Header |
| ------------ | ------------- | ------------ |
| Content Cell | Content Cell  | Content Cell |
| Content Cell | Content Cell  | Content Cell |

或者也可以让表格两边内容对齐，中间内容居中，例如：

```markdown
First Header | Second Header | Third Header
:----------- | :-----------: | -----------:
Left         | Center        | Right
Left         | Center        | Right
```

| First Header | Second Header | Third Header |
| :----------- | :-----------: | -----------: |
| 左对齐       |   文字居中    |       右对齐 |
| Left         |    Center     |        Right |

### 8. 分割线

```markdown
---
```

---

### 9.  内联图片

```markdown
![Alt text](/path/to/img.jpg)
或
![Alt text](/path/to/img.jpg "Optional title")
```

![Alt text](/path/to/img.jpg)