var Assert = require( 'assert' );
var Helper = require( '../src/index' );

describe('json-schema-helper test', function(){

    it( 'getDefaultValue()', function( done ){

        // 仅仅测试普通和schema类型的
        Assert.equal( Helper.getDefaultValue( 'type' ), 'object' );
        Assert.deepEqual( Helper.getDefaultValue( 'schema' ), {
            type: 'object',
            description: '这是描述'
        } );
        done();
    });

    it( 'ifKeyword()', function( done ){
        Assert.equal( Helper.ifKeyword( '#/type' ), true );
        Assert.equal( Helper.ifKeyword( '#/properties' ), true );
        Assert.equal( Helper.ifKeyword( '#/properties/type' ), false );
        done();
    });

    it( 'getPossibleKeywords()', function( done ){
        Assert.deepEqual(
            Helper.getPossibleKeywords( { type: 'object' }, '#' ),
            [
                'required',
                'properties',
                '$ref',
                'title',
                'description',
                'enum',
                'format',
                'definitions',
                'default'
            ]
        );
        done();
    });

    it( 'getChunkByPath()', function( done ){

        var schema = {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                }
            }
        };

        Assert.deepEqual( Helper.getChunkByPath( schema, '#/' ), schema );
        Assert.deepEqual( Helper.getChunkByPath( schema, '#' ), schema );
        Assert.deepEqual( Helper.getChunkByPath( schema, '#/properties/name' ),
            schema.properties.name );

        Assert.deepEqual( Helper.getChunkByPath( schema, '#/properties/name', 1 ),
            schema.properties );
        done();
    });

    it( 'clearPath()', function( done ){
        Assert.equal( Helper.clearPath( '/lalala/' ), 'lalala' );
        done();
    });

    it( 'joinPath()', function( done ){
        Assert.equal( Helper.joinPath( 'a', 'b' ), 'a/b' );
        Assert.equal( Helper.joinPath( '/a', '/b/c' ), 'a/b/c' );
        done();
    });

    it( 'removeChunkByPath()', function( done ){
        var schema = {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                }
            }
        };

        Assert.deepEqual( Helper.removeChunkByPath( schema, '#' ), schema );
        Assert.deepEqual( Helper.removeChunkByPath( schema, '#/' ), schema );
        Assert.deepEqual( Helper.removeChunkByPath( schema, '#/properties/name' ),
            {
                type: 'object',
                properties: {}
            } );
        done();
    });

    it( 'setChunkByPath()', function( done ){
        var schema = {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                }
            }
        };

        var newValue = {
            type: 'string',
            'default': "hello"
        };

        Assert.deepEqual( Helper.setChunkByPath( schema, '#', newValue ), newValue );
        Assert.deepEqual( Helper.setChunkByPath( schema, '#/', newValue ), newValue );
        Assert.deepEqual( Helper.setChunkByPath( schema, '#/properties/sex', newValue ), {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                },
                sex: {
                    type: 'string',
                    'default': "hello"
                }
            }
        } );
        done();
    });

    it( 'getProperties()', function( done ){
        var schema = {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                },
                sex: {
                    type: 'string'
                }
            }
        };

        Assert.deepEqual( Helper.getProperties( schema, '#' ), [ 'name', 'sex' ] );

        done();
    });

    it( 'getCurrentKey()', function( done ){

        Assert.equal( Helper.getCurrentKey( '#/' ), '#' );
        Assert.equal( Helper.getCurrentKey( '#/type' ), 'type' );
        Assert.equal( Helper.getCurrentKey( '#/type/' ), 'type' );

        done();
    });

    it( 'getParentKey()', function( done ){

        Assert.equal( Helper.getParentKey( '#/' ), '#' );
        Assert.equal( Helper.getParentKey( '#/type' ), '#' );
        Assert.equal( Helper.getParentKey( '#/type/' ), '#' );

        done();
    });

    it( 'getParentPath()', function( done ){

        Assert.equal( Helper.getParentPath( '#/' ), '#' );
        Assert.equal( Helper.getParentPath( '#/type' ), '#' );
        Assert.equal( Helper.getParentPath( '#/type/properties' ), '#/type' );

        done();
    });
});