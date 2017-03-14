const request = require('request');
const crypto = require('crypto');

module.exports = function(config){
    const tfsUrl = config.url + (config.url.substr(-1) == '/' ? '' : '/');

    const projectCollectionApi = '_api/_common/GetJumpList?showTeamsOnly=true&__v=5&navigationContextPackage=%7B%7D&showStoppedCollections=false&ignoreDefaultLoad=true';

    const cache = {};
    const cacheTime = 60 * 1000;

    function getProjectCollectionsFromTfs(user, password){
        return new Promise(function(resolve, reject){
            request.get(tfsUrl + projectCollectionApi, {
                auth:{
                    user: user,
                    password: password,
                    sendImmediately: true
                }
            },
            function (error, response) {
                if (error || response.statusCode != 200) {
                    resolve(false, false);
                } else {
                    var body = JSON.parse(response.body);
                    var groups = [user]
                    for(var pc of body.__wrappedArray){
                        groups.push(pc.path);
                    }
                    resolve(groups);
                }
            });
        });
    }

    function getCachedGroups(user, password, getFromTfs){
        const hash = crypto.createHash('sha256');
        var hashedPW = hash.digest(password, 'hex');
        var c = cache[user];
        if(c && Date.now() - c.created < cacheTime && c.password == hashedPW){
            c.groups;
        }else{
            return getFromTfs(user, password).then(function(groups){
                cache[user] = {
                    groups: groups,
                    password: hashedPW,
                    created: Date.now()
                }
                return groups;
            });
        }
    }

    return{
        authenticate: function(user, password, cb){
            getCachedGroups(user, password, getProjectCollectionsFromTfs).then(function(groups){
                cb(false, groups);
            }).catch(function(){
                cb(false, false);
            });
        },

        addUser: function(user, password, cb){
            // adding users is not supported.
            cb(null, false);
        }
    };
};

