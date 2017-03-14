var plugin = require('../');
var assert = require('assert');
var express = require('express');

describe('auth plugin', function() {
    const stuff = null;

    it('should have plugin interface', function() {
        assert.equal(typeof plugin, 'function')
        var p = plugin({url: ''}, stuff)
        assert.equal(typeof p.authenticate, 'function')
        assert.equal(typeof p.addUser, 'function')
    });

    describe('using fake server', function(){
        var p = plugin({url: 'http://localhost:8099/tfs'}, stuff);

        var fakeServer = express();

        before(function(cb){
            fakeServer.get('/tfs/_api/_common/GetJumpList', function(req, res){
                const authHeaderB64 = req.header('Authorization');
                const authHeader = Buffer.from(authHeaderB64.substr(6), 'base64').toString('ascii');
                const user = authHeader.split(':')[0];

                if(user != 'foo'){
                    res.status(403).send();
                }
                else{
                    res.json({"__wrappedArray":[
                        {"url":"/tfs/CAMPUS_Legacy/_api","browseUrl":"/tfs/_api/_browse/browse?collectionId=00ae8ab9-2c7e-484b-843d-0b016914c56e","name":"CAMPUS_Legacy","description":null,"path":"CAMPUS_Legacy","projects":[],"hasMore":true,"collectionId":"00ae8ab9-2c7e-484b-843d-0b016914c56e"},
                        {"url":"/tfs/L2P2013/_api","browseUrl":"/tfs/_api/_browse/browse?collectionId=190dad3a-9877-476f-95be-26ef172d34ca","name":"L2P2013","description":null,"path":"L2P2013","projects":[],"hasMore":true,"collectionId":"190dad3a-9877-476f-95be-26ef172d34ca"},
                        {"url":"/tfs/PIT_Labs/_api","browseUrl":"/tfs/_api/_browse/browse?collectionId=217a7d30-fd3f-42e7-b55f-97d8c204bbc5","name":"PIT_Labs","description":null,"path":"PIT_Labs","projects":[],"hasMore":true,"collectionId":"217a7d30-fd3f-42e7-b55f-97d8c204bbc5"},
                        {"url":"/tfs/Spielwiese/_api","browseUrl":"/tfs/_api/_browse/browse?collectionId=341c41b1-f953-424c-b40e-f7e01d23b9cd","name":"Spielwiese","description":null,"path":"Spielwiese","projects":[],"hasMore":true,"collectionId":"341c41b1-f953-424c-b40e-f7e01d23b9cd"}]
                    });
                }
            });
            fakeServer.listen(8099, cb);
        });

        it('should authenticate user', function(cb) {
            p.authenticate('foo', 'bar', function(err, groups) {
                assert(!err);
                assert.deepEqual(groups, ['foo', 'CAMPUS_Legacy', 'L2P2013', 'PIT_Labs', 'Spielwiese']);
                cb();
            });
        });

        it('should fail for unknown user', function(cb) {
            p.authenticate('bar', 'bar', function(err, groups) {
                assert(!err);
                assert(!groups);
                cb();
            });
        });
    });
});