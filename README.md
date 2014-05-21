## json-schema-helper

Helpers for json-schema. 相关的各种有用的方法

## 安装

[TBower](http://bower.fed.taobao.net/#/home)

```
tbower install json-schema-helper

```

npm

```
npm install json-schema-helper

```

## 方法们

```
/**
 * 获取关键词
 * @param {string} key
 * @returns {*}
 */
getDefaultValue: function( key ){}

/**
 * 获取关键词
 * @param {string} key
 * @returns {*}
 */
getDefaultValue: function( key ){}

/**
 * 当前路径是否为关键词
 * @param path
 * @returns {boolean}
 */
ifKeyword: function( path ){}

/**
 * 根据当前的path，给出可以继续添加的关键词
 * @param schema
 * @param path
 * @returns {Array}
 */
getPossibleKeywords: function( schema, path ){}

/**
 * 根据路径获取数据
 * @param {Object} schema
 * @param {String} path  --> #/properties/name/type
 * @param {number} [offset] 路径的往前偏移 如offset为1，则路径变为: #/properties/name/
 */
getChunkByPath: function getChunk( schema, path, offset ){}

/**
 * 去掉路径前后的/
 * @param path
 */
clearPath: function( path ){}

/**
 * 整合路径
 */
joinPath: function( pathA, pathB ){}

/**
 * 根据指定路径删除schema中的值，返回修改后的schema，若path为跟路径，则直接返回
 * @param schema
 * @param path
 * @returns schema
 */
removeChunkByPath: function( schema, path ){}

/**
 * 根据路径设置schema的值
 * @param schema
 * @param {String} path #/lalala 若给定根节点路径，则直接返回value.
 * @param value
 * @returns schema 返回修改后的schema
 */
setChunkByPath: function setChunk( schema, path, value ){}

/**
 * 获取当前路径下required需要的值
 * @param schema
 * @param currentPath
 */
getProperties: function( schema, currentPath ){}

/**
 * 获取当前路径结尾的key，如 properties/name --> name, #/type --> type
 * @param currentPath
 * @returns {*|string}
 */
getCurrentKey: function( currentPath ){}

/**
 * 获取当前路径上一层路径的key，如 properties/name --> properties, #/type --> #
 * @param path
 * @returns {*|string}
 */
getParentKey: function( path ){}

/**
 * 获取当前路径的上一层路径  #/properties/name/type --> #/properties/name
 * @param path
 * @returns {*}
 */
getParentPath: function( path ){}

/**
 * 返回json-schema v4 中的所有关键词列表
 * @returns {*}
 */
getAllKeywords: function(){}

/**
 * 返回json-schema 的所有数据类型列表
 * @returns {*}
 */
getAllTypes: function(){}

```
