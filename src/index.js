!(function(){

    /**
     * 判断当前JS环境
     */
    var hasDefine = typeof define === 'function';
    var hasExports = typeof module !== 'undefined' && module.exports;

    var Utils = {

        isType: function( type, value ){

            if( typeof type === 'string' && value ){
                var ret = /\[object\s+(\w+)\]/.exec( Object.prototype.toString.call( value ) );
                return ret && ret[1] && ret[1].toLowerCase() === type.toLowerCase();
            }
            else {
                return false;
            }
        },

        isObject: function( value ){
            return this.isType( 'object', value );
        },

        isArray: function( value ){
            return this.isType( 'array', value );
        },

        isNumber: function( value ){
            return this.isType( 'number', value );
        },

        isString: function( value ){
            return this.isType( 'string', value );
        },

        isBoolean: function( value ){
            return this.isType( 'boolean', value );
        },

        isNull: function( value ){
            return this.isType( 'null', value );
        },

        copy: function( value ){
            if( this.isArray( value ) || this.isObject( value ) ){
                return this.clone( value );
            }
            else {
                return value;
            }
        },

        clone: function( obj ){
            return JSON.parse( JSON.stringify( obj ) );
        }
    };



    /**
     * SchemaV4 的关键词，部分支持，需要的时候去掉注释
     * @type {Array}
     */
    var KEYWORDS = [
//        '$schema',
        '$ref',
//        'id',
//        'multipleOf',
        'maximum',
        'exclusiveMaximum',
        'minimum',
        'exclusiveMinimum',
        'maxLength',
        'minLength',
        'pattern',
        'format',
//        'additionalItems',
        'items',
        'maxItems',
        'minItems',
        'uniqueItems',
//        'maxProperties',
//        'minProperties',
        'required',
        'additionalProperties',
        'properties',
//        'patternProperties',
//        'dependence',
        'title',
        'type',
        'description',
        'enum',
//        'allOf',
//        'anyOf',
//        'oneOf',
//        'not',
        'definitions',
        'default'
    ];

    var KEYWORDS_GROUP_BY_TYPE = {
        string: [
            'pattern',
            'maxLength',
            'minLength'
        ],
        number: [
//            'multipleOf',
            'maximum',
            'exclusiveMaximum',
            'minimum',
            'exclusiveMinimum'
        ],
        array: [
//            'additionalItems',
            'items',
            'maxItems',
            'minItems',
            'uniqueItems'
        ],
        object: [
//            'dependence',
//            'maxProperties',
//            'minProperties',
            'required',
//            'additionalProperties',
//            'patternProperties',
            'properties'
        ],
        core: [
//            'id',
//            '$schema',
            '$ref'
        ],
        any: [
            'title',
            'type',
            'description',
            'enum',
            'format',
//            'allOf',
//            'anyOf',
//            'oneOf',
//            'not',
            'definitions',
            'default'
        ]
    };

    KEYWORDS_GROUP_BY_TYPE.integer = KEYWORDS_GROUP_BY_TYPE.number;

    var TYPES = [
        'object',
        'string',
        'array',
        'boolean',
        'number',
        'integer',
        'null'
    ];

    var DEFAULT_VALUES = {
//        '$schema': 'http://json-schema.org/draft-04/schema#',
        '$ref': '#',
        'id': '#',
        'format': '',
        'multipleOf': 0,
        'maximum': 0,
        'exclusiveMaximum': true,
        'minimum': 0,
        'exclusiveMinimum': true,
        'maxLength': 0,
        'minLength': 0,
        'pattern': '',
        'additionalItems': true,
        'items': {},
        'maxItems': 0,
        'minItems': 0,
        'uniqueItems': true,
        'maxProperties': 0,
        'minProperties': 0,
        'required': [],
        'additionalProperties': true,
        'properties': {},
        'patternProperties': {},
        'dependence': {},
        'title': '添加标题',
        'type': 'object',
        'description': '添加描述',
        'enum': [],
        'default': '这是默认值',
        'allOf': [],
        'anyOf': [],
        'oneOf': [],
        'not': {},
        'definitions': {},

        /**
         * 默认的非关键字内容
         */
        'schema': {
            type: 'object',
            description: '这是描述'
        }
    };


    var Mod = {

        /**
         * 获取关键词
         * @param {string} key
         * @returns {*}
         */
        getDefaultValue: function( key ){
            return Utils.clone( DEFAULT_VALUES[ key ] );
        },

        /**
         * 当前路径是否为关键词
         * @param path
         * @returns {boolean}
         */
        ifKeyword: function( path ){

            var keys = path.split( '/' ).slice( 1 );
            var index = 0;
            var currentSlug = keys[ index ];
            var ifKeyword = false;

            while( currentSlug ){
                if( index === 0 ){
                    ifKeyword = this._ifKeyword( currentSlug );
                }
                else {
                    ifKeyword = this._ifKeyword( currentSlug, keys[ index - 1 ], ifKeyword );
                }

                index++;
                currentSlug = keys[ index ];
            }

            return ifKeyword;
        },

        _ifKeyword: function( key, parentKey, parentKeyKeyword ){

            var allKeywords = this.getAllKeywords();

            if( !parentKey ){
                return allKeywords.indexOf( key ) >= 0;
            }

            else {
                if( allKeywords.indexOf( key ) >= 0 ) {
                    // 若夫路径为关键词
                    if( parentKeyKeyword ){

                        // 若父路径为以下关键词，则即使子路径长的像是关键词也不认为是关键词（实际是自定义字段）
                        return [
                            'properties',
                            'patternProperties',
                            'dependencies',
                            'definitions' ].indexOf(parentKey) < 0;
                    }
                    // 若父路径长的虽然像是关键词，但是实际上不是（自定义字段）
                    else {
                        return true;
                    }
                }
                else {
                    return false;
                }
            }
        },

        _getPossibleKeywordsBySchema: function( schema ){

            var allKeywords = [];
            var key;

            // 类型可能是数组
            var types = [];
            if( Utils.isString( schema.type ) ){
                types.push( schema.type );
            }
            else {
                types = types.concat( schema.type );
            }

            // 先获取当前类型会需要到的关键字
            for( key in types ){
                allKeywords = allKeywords.concat( KEYWORDS_GROUP_BY_TYPE[ types[ key ] ] || [] )
            }

            // 添加core和通用
            allKeywords = allKeywords.concat( KEYWORDS_GROUP_BY_TYPE.core );
            allKeywords = allKeywords.concat( KEYWORDS_GROUP_BY_TYPE.any );

            // 去掉已经包含的关键词
            for( key in schema ){
                allKeywords.splice( allKeywords.indexOf( key ), 1 );
            }

            return allKeywords;
        },

        /**
         * 根据当前的path，给出可以继续添加的关键词
         * @param schema
         * @param path
         * @returns {Array}
         */
        getPossibleKeywords: function( schema, path ){

            var chunk = this.getChunkByPath( schema, path );
            var possibleKeywords = [];

            // 若为关键词
            if( this.ifKeyword( path ) ){

                var keyword = this.getCurrentKeyword( path );
                switch( keyword ){

                /**
                 * 字符串类型
                 */
                    case '$ref':
                    case '$schema':
                    case 'id':
                    case 'description':
                    case 'default':
                    case 'pattern':
                    case 'title':
                    case 'format':
                /**
                 * 数字类型
                 */
                    case 'multipleOf':
                    case 'maximum':
                    case 'minimum':
                    case 'maxLength':
                    case 'minLength':
                    case 'maxItems':
                    case 'minItems':
                    case 'maxProperties':
                    case 'minProperties':
                /**
                 * 布尔值类型
                 */
                    case 'exclusiveMinimum':
                    case 'exclusiveMaximum':
                    case 'uniqueItems':
                /**
                 * 选项菜单类型，都是数组
                 */
                    case 'type':
                    case 'required':
                /**
                 * properties属性， 自定义字段对象
                 */
                    case 'properties':
                    case 'patternProperties':
                        break;

                /**
                 * 数组items，有数组和对象两种情况
                 */
                    case 'items':
                        // 检查items是数组还是对象，若是对象则需要添加关键词
                        if( Utils.isObject( chunk ) && !Utils.isArray( chunk ) ){
                            possibleKeywords = this._getPossibleKeywordsBySchema( chunk );
                        }
                        break;
                /**
                 * additional类型， 有布尔值和对象两种情况
                 */
                    case 'additionalItems':
                    case 'additionalProperties':
                        // 检查是布尔值还是对象，若是对象则需要添加关键词
                        if( Utils.isObject( chunk ) ){
                            possibleKeywords = this._getPossibleKeywordsBySchema( chunk );
                        }
                        break;
                /**
                 * dependencies，自定义字段对象
                 */
                    case 'dependencies':
                        break;
                /**
                 * 枚举类型，数组
                 */
                    case 'enum':
                        break;
                /**
                 * definitions，自定义字段对象
                 */
                    case 'definitions':
                        break;
                /**
                 * 条件限制类型
                 */
                    case 'allOf':
                    case 'oneOf':
                    case 'anyOf':
                        break;
                    case 'not':
                        possibleKeywords = this._getPossibleKeywordsBySchema( chunk );
                        break;

                /**
                 * 其他都先归为schema类型
                 */
                    default:
                        if( Utils.isObject( chunk ) ){
                            possibleKeywords = this._getPossibleKeywordsBySchema( chunk );
                        }

                }
            }
            else {
                if( Utils.isObject( chunk ) ){
                    possibleKeywords = this._getPossibleKeywordsBySchema( chunk );
                }
            }

            return possibleKeywords;
        },

        /**
         * 根据路径获取数据
         * @param {Object} schema
         * @param {String} path  --> #/properties/name/type
         * @param {number} [offset] 路径的往前偏移 如offset为1，则路径变为: #/properties/name/
         */
        getChunkByPath: function getChunk( schema, path, offset ){

            offset = offset || 0;

            var keys = this.clearPath( path ).split( '/' ).slice( 1 );
            var current = schema;
            var key;
            var keysLen = keys.length - offset;

            for( var index = 0; index < keysLen; index++ ){

                key = keys[ index ];

                if( Utils.isArray( current ) ){
                    current = isNaN( parseInt( key ) ) ? null : current[ parseInt( key ) ];
                }
                else if( Utils.isObject( current ) ){
                    current = current[ key ];
                }
                // 已经为基础类型了，但是路径还要记录，则说明值不存在了
                else if( index < keysLen - 1 ){
                    return null;
                }
            }

            return current;
        },

        /**
         * 去掉路径前后的/
         * @param path
         */
        clearPath: function( path ){
            return path.replace( /^\/|\/$/g, '' );
        },

        joinPath: function( pathA, pathB ){
            return this.clearPath( pathA ) + '/' + this.clearPath( pathB );
        },

        /**
         * 根据指定路径删除schema中的值，返回修改后的schema，若path为跟路径，则直接返回
         * @param schema
         * @param path
         * @returns schema
         */
        removeChunkByPath: function( schema, path ){
            var keys = this.clearPath( path ).split( '/').slice( 1 );
            var endKey = keys[ keys.length - 1 ];
            var parentChunk = this.getChunkByPath( schema, path, 1 );

            if( keys.length > 0 ){
                delete parentChunk[ endKey ];
            }

            return schema;
        },

        /**
         * 根据路径设置schema的值
         * @param schema
         * @param {String} path #/lalala 若给定根节点路径，则直接返回value.
         * @param value
         * @returns schema 返回修改后的schema
         */
        setChunkByPath: function setChunk( schema, path, value ){
            var keys = this.clearPath( path ).split( '/').slice( 1 );
            var endKey = keys[ keys.length - 1 ];
            var parentChunk = this.getChunkByPath( schema, path, 1 );

            if( keys.length > 0 ){

                // 若为数组
                if( Utils.isArray( parentChunk ) ){
                    // 若key不是数字，则设置失败，直接返回
                    if( isNaN( parseInt( endKey ) ) ){
                        return schema;
                    }
                    else {
                        parentChunk[ parseInt( endKey ) ] = value;
                    }
                }
                // 若为对象
                else if( Utils.isObject( parentChunk ) ){
                    parentChunk[ endKey ] = value;
                }
                // 若需要设置的路径上一层节点都不是数组或者对象，则路径有误，直接反悔
                else {
                    return schema;
                }

                return schema;
            }
            // 为根节点 #
            else {
                return value;
            }
        },

        /**
         * 获取当前路径下required需要的值
         * @param schema
         * @param currentPath
         */
        getProperties: function( schema, currentPath ){

            var chunk = this.getChunkByPath( schema, currentPath, 1 );
            var required = [];
            var properties = chunk.properties || {};

            var key;
            var value;

            for( key in properties ){
                value = properties[ key ];
                required.push( key );
            }

            return required;
        },

        /**
         * 获取当前路径结尾的key，如 properties/name --> name, #/type --> type
         * @param currentPath
         * @returns {*|string}
         */
        getCurrentKey: function( currentPath ){
            var keys = this.clearPath( currentPath ).split( '/').slice( 1 );
            return keys[ keys.length - 1 ] || '#';
        },

        /**
         * 获取当前路径上一层路径的key，如 properties/name --> properties, #/type --> #
         * @param path
         * @returns {*|string}
         */
        getParentKey: function( path ){
            var keys = this.clearPath( path ).split( '/' ).slice( 1 );
            return keys[ keys.length - 2 ] || '#';
        },

        /**
         * 获取当前路径的上一层路径  #/properties/name/type --> #/properties/name
         * @param path
         * @returns {*}
         */
        getParentPath: function( path ){
            var keys = this.clearPath( path ).split( '/' );
            var keysLen = keys.length;

            if( keys.length > 1 ){
                return keys.slice( 0, keysLen - 1 ).join( '/' );
            }
            else {
                return this.clearPath( path );
            }
        },

        /**
         * 返回json-schema v4 中的所有关键词列表
         * @returns {*}
         */
        getAllKeywords: function(){
            return Utils.copy( KEYWORDS );
        },

        /**
         * 返回json-schema 的所有数据类型列表
         * @returns {*}
         */
        getAllTypes: function(){
            return Utils.copy( TYPES );
        }
    };

    /**
     * 根据不同的JS环境输出内容
     */

    if( hasExports ){
        module.exports = Mod;
    }
    else if( hasDefine ){
        define(function(){
            return Mod;
        });
    }
    else {
        this.JsonSchemaHelper = Mod;
    }

})();