---
title: babel/traverse的使用
---

# @babel/traverse的使用

## 想使用@babel/traverse先了解它操作的对象
ast(抽象语法树): 用对象的结构来描述代码
源代码
```javascript
var name = 'xqs';
export default name;
```

转换成ast之后的结构
```javascript
Node {
  type: 'File',
  start: 0,
  end: 38,
  loc: SourceLocation {
    start: Position { line: 1, column: 0 },
    end: Position { line: 2, column: 20 },
    filename: undefined,
    identifierName: undefined
  },
  errors: [],
  program: Node {
    type: 'Program',
    start: 0,
    end: 38,
    loc: SourceLocation {
      start: [Position],
      end: [Position],
      filename: undefined,
      identifierName: undefined
    },
    sourceType: 'module',
    interpreter: null,
    body: [
      Node {
        type: 'VariableDeclaration',
        start: 0,
        end: 17,
        loc: SourceLocation {
          start: [Position],
          end: [Position],
          filename: undefined,
          identifierName: undefined
        },
        declarations: [ [Node] ],
        kind: 'var'
      },
      Node {
        type: 'ExportDefaultDeclaration',
        start: 18,
        end: 38,
        loc: SourceLocation {
          start: [Position],
          end: [Position],
          filename: undefined,
          identifierName: undefined
        },
        declaration: Node {
          type: 'Identifier',
          start: 33,
          end: 37,
          loc: [SourceLocation],
          name: 'name'
        }
      }
    ],
    directives: []
  },
  comments: []
}
```
type: 'File'是ast对象的最顶层类型，其次是type: 'Program'，program.body是真正的描述代码的对象。type有很多种类型，除了VariableDeclaration、ExportDefaultDeclaration还有近300种类型。会在后面针对常用的做详细的介绍

## 如何获取ast对象
```javascript
const { parse } = require('@babel/parser')
...
const ast = parse(code, option)
```
code是源代码字符串
option是配置项
```javascript
export interface ParserOptions {
  /**
   * 默认情况下，导入和导出声明只能出现在程序的顶层。
   * 如果将此选项设置为true，则可以在允许语句的任何位置使用它们。
   */
  allowImportExportEverywhere?: boolean;

  /**
   * 默认情况下，不允许在异步函数之外使用await
   */
  allowAwaitOutsideFunction?: boolean;

  /**
   * 默认情况下，顶层的return语句会引发错误.
   */
  allowReturnOutsideFunction?: boolean;
  allowSuperOutsideMethod?: boolean;

  /**
   * 默认情况下，导出的标识符必须引用已声明的变量
   */
  allowUndeclaredExports?: boolean;
  /**
   * 默认情况下，Babel在发现一些无效代码时总是抛出错误。.
   * 当此选项设置为true时，它将存储解析错误并尝试继续解析无效的输入文件。
   */
  errorRecovery?: boolean;
  /**
   * 指示应在其中解析代码的模式。
   */
  sourceType?: "script" | "module" | "unambiguous";=
  /**
   * 将输出AST节点与其源文件名关联。
   * 设置ast节点中loc.filename的值
   */
  sourceFilename?: string;
  /**
   * 默认情况下，解析的第一行代码被视为第1行。.
   */
  startLine?: number;
  plugins?: ParserPlugin[];

  /**
   * 设置解析器应该在严格模式下工作
   * 如果sourceType === 'module' 默认为true 反之为false
   */
  strictMode?: boolean;
  /**
   * 向每个节点添加范围属性：[node.start，node.end]
   */
  ranges?: boolean;

  /**
   * 将所有解析的token添加到文件节点上的token属性。
   */
  tokens?: boolean;
}
```
___个人认为默认配置就好,没必要自己设置___


## 如何处理ast对象
```javascript
traverse(ast, {
  // 遍历所有的节点
  enter(path) {},
  // 遍历修改之后的节点
  exit(path) {},
   // 根据具体类型遍历节点
  [type](path) {},
})
```
___path对象包含的属性和方法很多, path.node指向的是当前的节点对象.___

### 常用类型
1. Identifier: 变量名类型
```javascript
path.node = {
  type: 'Identifier', 
  name: 'x'// 表示具体的变量名称,
}
```

2. VariableDeclaration: 变量声明关键字类型(var/const/let)
```javascript
path.node = {
  kind: 'var', // 表示具体的声明方式
  declarations: [], // VariableDeclarator类型的数组
}
```

3. VariableDeclarator: 变量名描述类型
```javascript
path.node = {
  id: {
    type: 'Identifier', // Identifier类型
    name: 'x'// 表示具体的变量名称,
  },
  init: {
    type: '', // 基础类型
    value: 2, // 初始值
  }
}
```

4. FunctionDeclaration: 函数声明类型
```javascript
path.node = {
  id: {
    type: 'Identifier', // Identifier类型表示变量名
    name: 'x'// 表示具体的方法名称,
  },
  generator: false, // 是否是generator函数
  async: false, // 是否是异步函数
  params: [], // 描述参数类型和参数名的数组
  body: {
    type: 'BlockStatement', // 代码块类型{},
    body: [], // 函数体的内容
  }
}
```

5. ReturnStatement: 返回类型
+ 当值返回一个变量的时候
```javascript
path.node = {
  argument: {}, // Identifier类型
}
```

+ 当值返回一个变量的时候
```javascript
path.node = {
  argument: {}, // BinaryExpression类型,
}
```

6. BinaryExpression: 二元表达式类型
```javascript
path.node = {
  type: 'BinaryExpression',
  left: 'BinaryExpression' | 'Identifier', // 可以是Identifier 也可以是BinaryExpression类型
  operator: '+', // 操作符
  right: 'Identifier'
}
```

7. ArrowFunctionExpression: 箭头函数类型
其他同FunctionDeclaration类型一致

8. IfStatement: if语句类型
```javascript
path.node = {
  type: 'IfStatement',
  test: 'BinaryExpression', // 条件语句，是个BinaryExpression类型
  consequent: 'BlockStatement', // 满足条件执行的代码块
  alternate: 'IfStatement' | 'BlockStatement', // 不满足执行的代码块, if () {} else if () {} else {} 这种情况会后面的else if会当作一个新的IfStatement类型
}
```

9. ForInStatement: forin语句类型
```javascript
path.node = {
  type: 'ForInStatement',
  left: 'VariableDeclaration', // in 左边的
  right: 'Identifier', // in 右边的
  body: 'BlockStatement'
}
```

10. ForStatement: for语句类型
```javascript
path.node = {
  type: 'ForStatement',
  init: 'VariableDeclaration', // 初始化index
  test: 'BinaryExpression', // 跳出循环的条件
  update: 'UpdateExpression', // 更新index的值
  body: 'BlockStatement'
}
```

11. WhileStatement: while语句类型
```javascript
path.node = {
  type: 'WhileStatement',
  test: 'BinaryExpression', // 执行条件
  body: 'BlockStatement'
}
```

12. ExpressionStatement: 表达式语句类型
```javascript
path.node = {
  type: 'ExpressionStatement',
  expression: 'CallExpression' | 'MemberExpression' // 大多数的**Expression类型
}
```
13. CallExpression: 命令行语句类型
```javascript
path.node = {
  type: 'CallExpression',
  callee: 'MemberExpression', 
  arguments: [] // 参数数据
}
```

14. MemberExpression: 成员表达式类型(console、window、document)
```javascript
path.node = {
  type: 'MemberExpression',
  object: 'Identifier', // console.log的console
  property: 'Identifier' // console.log的log
}
```
___MemberExpression类型永远是CallExpression类型的callee字段___

14. Identifier: 标识符类型(变量)
15. StringLiteral: 字符串类型
16. NumericLiteral: 数字类型
17. ArrayExpression: 数组类型
```javascript
path.node = {
  type: 'ArrayExpression',
  elements: [], // 数据元素
}
```
18.  NullLiteral: null类型

___以上介绍的就是常用的类型.目前全部类型有290多种就需要根据需求了解学习了___
```javascript
AnyTypeAnnotation | ArgumentPlaceholder | ArrayExpression | ArrayPattern | ArrayTypeAnnotation | ArrowFunctionExpression | AssignmentExpression | AssignmentPattern | AwaitExpression | BigIntLiteral | Binary | BinaryExpression | BindExpression | Block | BlockParent | BlockStatement | BooleanLiteral | BooleanLiteralTypeAnnotation | BooleanTypeAnnotation | BreakStatement | CallExpression | CatchClause | Class | ClassBody | ClassDeclaration | ClassExpression | ClassImplements | ClassMethod | ClassPrivateMethod | ClassPrivateProperty | ClassProperty | CompletionStatement | Conditional | ConditionalExpression | ContinueStatement | DebuggerStatement | DecimalLiteral | Declaration | DeclareClass | DeclareExportAllDeclaration | DeclareExportDeclaration | DeclareFunction | DeclareInterface | DeclareModule | DeclareModuleExports | DeclareOpaqueType | DeclareTypeAlias | DeclareVariable | DeclaredPredicate | Decorator | Directive | DirectiveLiteral | DoExpression | DoWhileStatement | EmptyStatement | EmptyTypeAnnotation | EnumBody | EnumBooleanBody | EnumBooleanMember | EnumDeclaration | EnumDefaultedMember | EnumMember | EnumNumberBody | EnumNumberMember | EnumStringBody | EnumStringMember | EnumSymbolBody | ExistsTypeAnnotation | ExportAllDeclaration | ExportDeclaration | ExportDefaultDeclaration | ExportDefaultSpecifier | ExportNamedDeclaration | ExportNamespaceSpecifier | ExportSpecifier | Expression | ExpressionStatement | ExpressionWrapper | File | Flow | FlowBaseAnnotation | FlowDeclaration | FlowPredicate | FlowType | For | ForInStatement | ForOfStatement | ForStatement | ForXStatement | Function | FunctionDeclaration | FunctionExpression | FunctionParent | FunctionTypeAnnotation | FunctionTypeParam | GenericTypeAnnotation | Identifier | IfStatement | Immutable | Import | ImportAttribute | ImportDeclaration | ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier | IndexedAccessType | InferredPredicate | InterfaceDeclaration | InterfaceExtends | InterfaceTypeAnnotation | InterpreterDirective | IntersectionTypeAnnotation | JSX | JSXAttribute | JSXClosingElement | JSXClosingFragment | JSXElement | JSXEmptyExpression | JSXExpressionContainer | JSXFragment | JSXIdentifier | JSXMemberExpression | JSXNamespacedName | JSXOpeningElement | JSXOpeningFragment | JSXSpreadAttribute | JSXSpreadChild | JSXText | LVal | LabeledStatement | Literal | LogicalExpression | Loop | MemberExpression | MetaProperty | Method | MixedTypeAnnotation | ModuleDeclaration | ModuleExpression | ModuleSpecifier | NewExpression | Noop | NullLiteral | NullLiteralTypeAnnotation | NullableTypeAnnotation | NumberLiteral$1 | NumberLiteralTypeAnnotation | NumberTypeAnnotation | NumericLiteral | ObjectExpression | ObjectMember | ObjectMethod | ObjectPattern | ObjectProperty | ObjectTypeAnnotation | ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeInternalSlot | ObjectTypeProperty | ObjectTypeSpreadProperty | OpaqueType | OptionalCallExpression | OptionalIndexedAccessType | OptionalMemberExpression | ParenthesizedExpression | Pattern | PatternLike | PipelineBareFunction | PipelinePrimaryTopicReference | PipelineTopicExpression | Placeholder | Private | PrivateName | Program | Property | Pureish | QualifiedTypeIdentifier | RecordExpression | RegExpLiteral | RegexLiteral$1 | RestElement | RestProperty$1 | ReturnStatement | Scopable | SequenceExpression | SpreadElement | SpreadProperty$1 | Statement | StaticBlock | StringLiteral | StringLiteralTypeAnnotation | StringTypeAnnotation | Super | SwitchCase | SwitchStatement | SymbolTypeAnnotation | TSAnyKeyword | TSArrayType | TSAsExpression | TSBaseType | TSBigIntKeyword | TSBooleanKeyword | TSCallSignatureDeclaration | TSConditionalType | TSConstructSignatureDeclaration | TSConstructorType | TSDeclareFunction | TSDeclareMethod | TSEntityName | TSEnumDeclaration | TSEnumMember | TSExportAssignment | TSExpressionWithTypeArguments | TSExternalModuleReference | TSFunctionType | TSImportEqualsDeclaration | TSImportType | TSIndexSignature | TSIndexedAccessType | TSInferType | TSInterfaceBody | TSInterfaceDeclaration | TSIntersectionType | TSIntrinsicKeyword | TSLiteralType | TSMappedType | TSMethodSignature | TSModuleBlock | TSModuleDeclaration | TSNamedTupleMember | TSNamespaceExportDeclaration | TSNeverKeyword | TSNonNullExpression | TSNullKeyword | TSNumberKeyword | TSObjectKeyword | TSOptionalType | TSParameterProperty | TSParenthesizedType | TSPropertySignature | TSQualifiedName | TSRestType | TSStringKeyword | TSSymbolKeyword | TSThisType | TSTupleType | TSType | TSTypeAliasDeclaration | TSTypeAnnotation | TSTypeAssertion | TSTypeElement | TSTypeLiteral | TSTypeOperator | TSTypeParameter | TSTypeParameterDeclaration | TSTypeParameterInstantiation | TSTypePredicate | TSTypeQuery | TSTypeReference | TSUndefinedKeyword | TSUnionType | TSUnknownKeyword | TSVoidKeyword | TaggedTemplateExpression | TemplateElement | TemplateLiteral | Terminatorless | ThisExpression | ThisTypeAnnotation | ThrowStatement | TryStatement | TupleExpression | TupleTypeAnnotation | TypeAlias | TypeAnnotation | TypeCastExpression | TypeParameter | TypeParameterDeclaration | TypeParameterInstantiation | TypeofTypeAnnotation | UnaryExpression | UnaryLike | UnionTypeAnnotation | UpdateExpression | UserWhitespacable | V8IntrinsicIdentifier | VariableDeclaration | VariableDeclarator | Variance | VoidTypeAnnotation | While | WhileStatement | WithStatement | YieldExpression
```











