//-- Import Class Objects
const { classCluster, classInstance, classRedisEngine, classMongoDBEngine, classPostgresqlEngine, classMysqlEngine, classSqlserverEngine, classOracleEngine, classDocumentDBElasticCluster, classElasticacheServerlessCluster, classDynamoDB } = require('./class.engine.js');
const { classAWS } = require('./class.aws.js');
const AWSObject = new classAWS();

//-- Engine Objects
var elasticacheObjectContainer = [];
var memoryDBObjectContainer = [];
var documentDBObjectContainer = [];
var auroraPostgresqlObjectContainer = [];
var auroraMysqlObjectContainer = [];
var rdsMysqlObjectContainer = [];
var rdsPostgresqlObjectContainer = [];
var rdsSqlserverObjectContainer = [];
var rdsOracleObjectContainer = [];
var dynamoDBObjectContainer = [];

//-- Scheduler
const schedule = require('node-schedule');
var scheduleObjects = [];


// AWS API Variables
const fs = require('fs');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));

// API Application Variables
const express = require('express');
const cors = require('cors')
const uuid = require('uuid');

const app = express();
const port = configData.aws_api_port;
app.use(cors());
app.use(express.json())

// API Protection
var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var bodyParser = require('body-parser')
const csrfProtection = csrf({
  cookie: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrfProtection);


// Security Variables
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
var request = require('request');
var secretKey =  crypto.randomBytes(32).toString('hex')
var pems;
var issCognitoIdp = "https://cognito-idp." + configData.aws_region + ".amazonaws.com/" + configData.aws_cognito_user_pool_id;
        


// Startup - Download PEMs Keys
gatherPemKeys(issCognitoIdp);


//--#################################################################################################### 
//   ---------------------------------------- SCHEDULER
//--#################################################################################################### 

function scheduleJob5s(){
    
    var timestamp = new Date();
    console.log({ time : timestamp.toTimeString().split(' ')[0], message : "5s - Scheduler" });
    
    //-- Elasticache
    for (let engineId of Object.keys(elasticacheObjectContainer)) {
            elasticacheObjectContainer[engineId].refreshData();
    }
    
    //-- MemoryDB
    for (let engineId of Object.keys(memoryDBObjectContainer)) {
            memoryDBObjectContainer[engineId].refreshData();
    }
    
    //-- DocumentDB
    for (let engineId of Object.keys(documentDBObjectContainer)) {
            documentDBObjectContainer[engineId].refreshData();
    }
    
    
    //-- Aurora-Postgresql
    for (let engineId of Object.keys(auroraPostgresqlObjectContainer)) {
            auroraPostgresqlObjectContainer[engineId].refreshData();
    }
    
    //-- Aurora-Mysql
    for (let engineId of Object.keys(auroraMysqlObjectContainer)) {
            auroraMysqlObjectContainer[engineId].refreshData();
    }
    
    
    //-- Rds-Mysql
    for (let engineId of Object.keys(rdsMysqlObjectContainer)) {
            rdsMysqlObjectContainer[engineId].refreshData();
    }
    
    
    //-- Rds-Postgresql
    for (let engineId of Object.keys(rdsPostgresqlObjectContainer)) {
            rdsPostgresqlObjectContainer[engineId].refreshData();
    }
    
    
    //-- Rds-Sqlserver
    for (let engineId of Object.keys(rdsSqlserverObjectContainer)) {
            rdsSqlserverObjectContainer[engineId].refreshData();
    }
    
    
    //-- Rds-Oracle
    for (let engineId of Object.keys(rdsOracleObjectContainer)) {
            rdsOracleObjectContainer[engineId].refreshData();
    }
    
    
    //-- DynamoDB
    for (let engineId of Object.keys(dynamoDBObjectContainer)) {
            dynamoDBObjectContainer[engineId].refreshData();
    }
    
    
    
}

scheduleObjects['5s'] = schedule.scheduleJob('*/5 * * * * *', function(){
                                            scheduleJob5s();
                                            });
            


//--#################################################################################################### 
//   ---------------------------------------- SECURITY
//--#################################################################################################### 


//-- Generate new standard token
function generateToken(tokenData){
    const token = jwt.sign(tokenData, secretKey, { expiresIn: 60 * 60 * configData.aws_token_expiration });
    return token ;
};


//-- Verify standard token
const verifyToken = (token) => {

    try {
        const decoded = jwt.verify(token, secretKey);
        return {isValid : true, session_id: decoded.session_id};
    }
    catch (ex) { 
        return {isValid : false, session_id: ""};
    }

};


//-- Gather PEMs keys from Cognito
function gatherPemKeys(iss)
{

    if (!pems) {
        //Download the JWKs and save it as PEM
        return new Promise((resolve, reject) => {
                    request({
                       url: iss + '/.well-known/jwks.json',
                       json: true
                     }, function (error, response, body) {
                         
                        if (!error && response.statusCode === 200) {
                            pems = {};
                            var keys = body['keys'];
                            for(var i = 0; i < keys.length; i++) {
                                //Convert each key to PEM
                                var key_id = keys[i].kid;
                                var modulus = keys[i].n;
                                var exponent = keys[i].e;
                                var key_type = keys[i].kty;
                                var jwk = { kty: key_type, n: modulus, e: exponent};
                                var pem = jwkToPem(jwk);
                                pems[key_id] = pem;
                            }
                        } else {
                            //Unable to download JWKs, fail the call
                            console.log("error");
                        }
                        
                        resolve(body);
                        
                    });
        });
        
        } 
    
    
}


//-- Validate Cognito Token
function verifyTokenCognito(token) {

   try {
        //Fail if the token is not jwt
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
            console.log("Not a valid JWT token");
            return {isValid : false, session_id: ""};
        }
        
        
        if (decodedJwt.payload.iss != issCognitoIdp) {
            console.log("invalid issuer");
            return {isValid : false, session_id: ""};
        }
        
        //Reject the jwt if it's not an 'Access Token'
        if (decodedJwt.payload.token_use != 'access') {
            console.log("Not an access token");
            return {isValid : false, session_id: ""};
        }
    
        //Get the kid from the token and retrieve corresponding PEM
        var kid = decodedJwt.header.kid;
        var pem = pems[kid];
        if (!pem) {
            console.log('Invalid access token');
            return {isValid : false, session_id: ""};
        }

        const decoded = jwt.verify(token, pem, { issuer: issCognitoIdp });
        return {isValid : true, session_id: ""};
    }
    catch (ex) { 
        console.log("Unauthorized Token");
        return {isValid : false, session_id: ""};
    }
    
};



//--#################################################################################################### 
//   ---------------------------------------- ELASTICACHE
//--#################################################################################################### 


//--++ ELASTICACHE : Open Connection - ElastiCache Cluster
app.post("/api/elasticache/redis/cluster/authentication/", authenticationElasticacheRedisCluster);
async function authenticationElasticacheRedisCluster(req, res) {
 
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
        
    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
    
    console.log(params);
    
    try {
            
            var objConnection = new classRedisEngine({...params});
            var authenticated = await objConnection.authentication();
            if ( authenticated == true ){
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ ELASTICACHE : Open Connection - ElastiCache Cluster
app.post("/api/elasticache/redis/cluster/open/connection/", openConnectionElasticacheRedisCluster);
async function openConnectionElasticacheRedisCluster(req, res) {
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            
            if (!(objectId in elasticacheObjectContainer)) {
                console.log("Creating new object : " + objectId);
                elasticacheObjectContainer[objectId] = new classCluster({
                                    properties : { name : params.clusterId, clusterId: params.clusterId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, totalShards : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    connection : { ...params },
                                    metrics : [
                                                { name : "cpu", type : 4, history : 20 },
                                                { name : "cpuUser", type : 1, history : 20 },
                                                { name : "cpuSys", type : 1, history : 20 },
                                                { name : "memory", type : 4, history : 20 },
                                                { name : "memoryUsed", type : 2, history : 20 },
                                                { name : "memoryTotal", type : 2, history : 20 },
                                                { name : "operations", type : 1, history : 20 },
                                                { name : "getCalls", type : 1, history : 20 },
                                                { name : "setCalls", type : 1, history : 20 },
                                                { name : "getUsec", type : 1, history : 20 },
                                                { name : "setUsec", type : 1, history : 20 },
                                                { name : "totalUsec", type : 1, history : 20 },
                                                { name : "connectedClients", type : 2, history : 20 },
                                                { name : "getLatency", type : 4, history : 20 },
                                                { name : "setLatency", type : 4, history : 20 },
                                                { name : "globalLatency", type : 4, history : 20 },
                                                { name : "keyspaceHits", type : 1, history : 20 },
                                                { name : "keyspaceMisses", type : 1, history : 20 },
                                                { name : "cacheHitRate", type : 4, history : 20 },
                                                { name : "netIn", type : 1, history : 20 },
                                                { name : "netOut", type : 1, history : 20 },
                                                { name : "network", type : 4, history : 20 },
                                                { name : "connectionsTotal", type : 1, history : 20 },
                                                { name : "commands", type : 1, history : 20 },
                                                { name : "cmdExec", type : 1, history : 20 },
                                                { name : "cmdAuth", type : 1, history : 20 },
                                                { name : "cmdInfo", type : 1, history : 20 },
                                                { name : "cmdScan", type : 1, history : 20 },
                                                { name : "cmdXadd", type : 1, history : 20 },
                                                { name : "cmdZadd", type : 1, history : 20 },
                                            ]
                                    }
                                );
                                
                await elasticacheObjectContainer[objectId].addNodeList();
                await elasticacheObjectContainer[objectId].connectNodes();
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = elasticacheObjectContainer[objectId].objectProperties.connectionId;
                creationTime = elasticacheObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", nodes : elasticacheObjectContainer[objectId].getClusterNodeListIds(), newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ ELASTICACHE : Gather Information
app.get("/api/elasticache/redis/cluster/gather/stats/", gatherStatsElasticacheCluster);
async function gatherStatsElasticacheCluster(req, res) {
    
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                var cluster = elasticacheObjectContainer[params.engineType + ":" + params.clusterId].getAllDataCluster({ includeSessions : 0});
                var nodes = cluster.nodes.slice(params.beginItem,params.endItem);
                res.status(200).send({ 
                                        cluster : {...cluster,nodes : nodes}
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ ELASTICACHE : Close Connection
app.get("/api/elasticache/redis/cluster/close/connection/", closeConnectionElasticacheRedisCluster);
async function closeConnectionElasticacheRedisCluster(req, res) {
        
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

 
        try
            {
                var params = req.query;
                
                elasticacheObjectContainer[params.engineType + ":"  + params.clusterId].disconnectNodes();
                delete elasticacheObjectContainer[params.engineType + ":" + params.clusterId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}




//--#################################################################################################### 
//   ---------------------------------------- ELASTICACHE - SERVERLESS
//--#################################################################################################### 


//--++ ELASTICACHE - SERVERLESS : Open Connection - ElastiCache Cluster
app.post("/api/elasticache/redis/serverless/cluster/authentication/", authenticationElasticacheRedisServerlessCluster);
async function authenticationElasticacheRedisServerlessCluster(req, res) {
 
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
        
    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classElasticacheServerlessCluster({ properties : { clusterId: params.cluster },
                                                                        connection : { ...params },
                
            });
            if (await objConnection.authentication()==true){
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ ELASTICACHE - SERVERLESS : Open Connection - ElastiCache Cluster
app.post("/api/elasticache/redis/serverless/cluster/open/connection/", openConnectionElasticacheRedisServerlessCluster);
async function openConnectionElasticacheRedisServerlessCluster(req, res) {
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            
            if (!(objectId in elasticacheObjectContainer)) {
                console.log("Creating new object : " + objectId);
                elasticacheObjectContainer[objectId] = new classElasticacheServerlessCluster({
                                    properties : { name : params.clusterId, clusterId: params.clusterId, uid: objectId, engineType : engineType, status : "-", ecpu : "-", storage : "-", connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    connection : { ...params },
                                    }
                                );
                
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = elasticacheObjectContainer[objectId].objectProperties.connectionId;
                creationTime = elasticacheObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ ELASTICACHE - SERVERLESS : Gather Information
app.get("/api/elasticache/redis/serverless/cluster/gather/stats/", gatherStatsElasticacheServerlessCluster);
async function gatherStatsElasticacheServerlessCluster(req, res) {
    
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                var cluster = elasticacheObjectContainer[params.engineType + ":" + params.clusterId].getAllDataCluster();
                res.status(200).send({ 
                                        cluster : {...cluster }
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ ELASTICACHE - SERVERLESS : Gather Information
app.get("/api/elasticache/redis/serverless/cluster/gather/analytics/", gatherAnalyticsElasticacheServerlessCluster);
async function gatherAnalyticsElasticacheServerlessCluster(req, res) {
    
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                var metricInfo = await elasticacheObjectContainer[params.engineType + ":" + params.clusterId].getAnalyticsData({ metricName : params.metricName, period : params.period, interval : params.interval, factor : params.factor });
                res.status(200).send({ 
                                        metric : metricInfo 
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}


//--++ ELASTICACHE - SERVERLESS : Close Connection
app.get("/api/elasticache/redis/serverless/cluster/close/connection/", closeConnectionElasticacheRedisServerlessCluster);
async function closeConnectionElasticacheRedisServerlessCluster(req, res) {
        
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

 
        try
            {
                var params = req.query;
                
                elasticacheObjectContainer[params.engineType + ":"  + params.clusterId].disconnect();
                delete elasticacheObjectContainer[params.engineType + ":" + params.clusterId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}




//--#################################################################################################### 
//   ---------------------------------------- MEMORYDB
//--#################################################################################################### 


//--++ MEMORYDB : Open Connection - ElastiCache Cluster
app.post("/api/memorydb/redis/cluster/authentication/", authenticationMemoryDBRedisCluster);
async function authenticationMemoryDBRedisCluster(req, res) {
    
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

 
    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classRedisEngine({...params});
            if (await objConnection.authentication()==true){
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ MEMORYDB : Open Connection - ElastiCache Cluster
app.post("/api/memorydb/redis/cluster/open/connection/", openConnectionMemoryDBRedisCluster);
async function openConnectionMemoryDBRedisCluster(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            
            if (!(objectId in memoryDBObjectContainer)) {
                console.log("Creating new object : " + objectId);
                memoryDBObjectContainer[objectId] = new classCluster({
                                    properties : { name : params.clusterId, clusterId: params.clusterId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, totalShards : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    connection : { ...params },
                                    metrics : [
                                                { name : "cpu", type : 4, history : 20 },
                                                { name : "cpuUser", type : 1, history : 20 },
                                                { name : "cpuSys", type : 1, history : 20 },
                                                { name : "memory", type : 4, history : 20 },
                                                { name : "memoryUsed", type : 2, history : 20 },
                                                { name : "memoryTotal", type : 2, history : 20 },
                                                { name : "operations", type : 1, history : 20 },
                                                { name : "getCalls", type : 1, history : 20 },
                                                { name : "setCalls", type : 1, history : 20 },
                                                { name : "getUsec", type : 1, history : 20 },
                                                { name : "setUsec", type : 1, history : 20 },
                                                { name : "totalUsec", type : 1, history : 20 },
                                                { name : "connectedClients", type : 2, history : 20 },
                                                { name : "getLatency", type : 4, history : 20 },
                                                { name : "setLatency", type : 4, history : 20 },
                                                { name : "globalLatency", type : 4, history : 20 },
                                                { name : "keyspaceHits", type : 1, history : 20 },
                                                { name : "keyspaceMisses", type : 1, history : 20 },
                                                { name : "cacheHitRate", type : 4, history : 20 },
                                                { name : "netIn", type : 1, history : 20 },
                                                { name : "netOut", type : 1, history : 20 },
                                                { name : "network", type : 4, history : 20 },
                                                { name : "connectionsTotal", type : 1, history : 20 },
                                                { name : "commands", type : 1, history : 20 },
                                                { name : "cmdExec", type : 1, history : 20 },
                                                { name : "cmdAuth", type : 1, history : 20 },
                                                { name : "cmdInfo", type : 1, history : 20 },
                                                { name : "cmdScan", type : 1, history : 20 },
                                                { name : "cmdXadd", type : 1, history : 20 },
                                                { name : "cmdZadd", type : 1, history : 20 },
                                            ]
                                    }
                                );
                                
                await memoryDBObjectContainer[objectId].addNodeList();
                await memoryDBObjectContainer[objectId].connectNodes();
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = memoryDBObjectContainer[objectId].objectProperties.connectionId;
                creationTime = memoryDBObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", nodes : memoryDBObjectContainer[objectId].getClusterNodeListIds(), newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ MEMORYDB : Gather Information
app.get("/api/memorydb/redis/cluster/gather/stats/", gatherStatsMemoryDBCluster);
async function gatherStatsMemoryDBCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                var cluster = memoryDBObjectContainer[params.engineType + ":" + params.clusterId].getAllDataCluster({ includeSessions : 0});
                var nodes = cluster.nodes.slice(params.beginItem,params.endItem);
                res.status(200).send({ 
                                        cluster : {...cluster,nodes : nodes}
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ MEMORYDB : Close Connection
app.get("/api/memorydb/redis/cluster/close/connection/", closeConnectionMemoryDBRedisCluster);
async function closeConnectionMemoryDBRedisCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                memoryDBObjectContainer[params.engineType + ":"  + params.clusterId].disconnectNodes();
                delete memoryDBObjectContainer[params.engineType + ":" + params.clusterId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}





//--#################################################################################################### 
//   ---------------------------------------- DOCUMENTDB - STANDARD
//--#################################################################################################### 


//--++ DOCUMENTDB : Open Connection - DocumentDB Cluster
app.post("/api/documentdb/cluster/authentication/", authenticationDocumentDBCluster);
async function authenticationDocumentDBCluster(req, res) {
 
     // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classMongoDBEngine({...params});
            if (await objConnection.authentication()==true){
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ DOCUMENTDB : Open Connection - DocumentDB Cluster
app.post("/api/documentdb/cluster/open/connection/", openConnectionDocumentDBCluster);
async function openConnectionDocumentDBCluster(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            
            if (!(objectId in documentDBObjectContainer)) {
                console.log("Creating new object : " + objectId);
                documentDBObjectContainer[objectId] = new classCluster({
                                    properties : { name : params.clusterId, clusterId: params.clusterId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    connection : { ...params },
                                    metrics : [
                                                { name : "cpu", type : 5, history : 20 },
                                                { name : "memory", type : 5, history : 20 },
                                                { name : "ioreads", type : 5, history : 20 },
                                                { name : "iowrites", type : 5, history : 20 },
                                                { name : "netin", type : 5, history : 20 },
                                                { name : "netout", type : 5, history : 20 },
                                                { name : "network", type : 5, history : 20 },
                                                { name : "iops", type : 5, history : 20 },
                                                { name : "connectionsCurrent", type : 2, history : 20 },
                                                { name : "connectionsAvailable", type : 2, history : 20 },
                                                { name : "connectionsCreated", type : 1, history : 20 },
                                                { name : "opsInsert", type : 1, history : 20 },
                                                { name : "opsQuery", type : 1, history : 20 },
                                                { name : "opsUpdate", type : 1, history : 20 },
                                                { name : "opsDelete", type : 1, history : 20 },
                                                { name : "opsGetmore", type : 1, history : 20 },
                                                { name : "opsCommand", type : 1, history : 20 },
                                                { name : "operations", type : 1, history : 20 },
                                                { name : "docsDeleted", type : 1, history : 20 },
                                                { name : "docsInserted", type : 1, history : 20 },
                                                { name : "docsReturned", type : 1, history : 20 },
                                                { name : "docsUpdated", type : 1, history : 20 },
                                                { name : "docops", type : 1, history : 20 },
                                                { name : "transactionsActive", type : 1, history : 20 },
                                                { name : "transactionsCommited", type : 1, history : 20 },
                                                { name : "transactionsAborted", type : 1, history : 20 },
                                                { name : "transactionsStarted", type : 1, history : 20 },
                                            ]
                                    }
                                );
                                
                await documentDBObjectContainer[objectId].addNodeList();
                await documentDBObjectContainer[objectId].connectNodes();
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = documentDBObjectContainer[objectId].objectProperties.connectionId;
                creationTime = documentDBObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", nodes : documentDBObjectContainer[objectId].getClusterNodeListIds(), newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ DOCUMENTDB : Gather Information
app.get("/api/documentdb/cluster/gather/stats/", gatherStatsDocumentDBCluster);
async function gatherStatsDocumentDBCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var cluster = documentDBObjectContainer[params.engineType + ":" + params.clusterId].getAllDataCluster({ includeSessions : params.includeSessions});
                var nodes = cluster.nodes.slice(params.beginItem,params.endItem);
                res.status(200).send({ 
                                        cluster : {...cluster,nodes : nodes}
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ DOCUMENTDB : Close Connection
app.get("/api/documentdb/cluster/close/connection/", closeConnectionDocumentDBCluster);
async function closeConnectionDocumentDBCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                documentDBObjectContainer[params.engineType + ":"  + params.clusterId].disconnectNodes();
                delete documentDBObjectContainer[params.engineType + ":" + params.clusterId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}



//--#################################################################################################### 
//   ---------------------------------------- DOCUMENTDB - ELASTIC
//--#################################################################################################### 


//--++ DOCUMENTDB - ELASTIC : Open Connection - DocumentDB Cluster
app.post("/api/documentdb/elastic/cluster/authentication/", authenticationDocumentDBElasticCluster);
async function authenticationDocumentDBElasticCluster(req, res) {
 
     // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classDocumentDBElasticCluster( { connection : params } );
            if (await objConnection.authentication()==true){
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ DOCUMENTDB - ELASTIC : Open Connection - DocumentDB Cluster
app.post("/api/documentdb/elastic/cluster/open/connection/", openConnectionDocumentDBElasticCluster);
async function openConnectionDocumentDBElasticCluster(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            var clusterArn = params.clusterArn;
            var clusterUid = (clusterArn.split("/"))[1];
            
            if (!(objectId in documentDBObjectContainer)) {
                console.log("Creating new object : " + objectId);
                documentDBObjectContainer[objectId] = new classDocumentDBElasticCluster({
                                    properties : { name : params.clusterId, clusterId: params.clusterId, clusterUid : clusterUid, clusterArn : clusterArn, uid: objectId, engineType : engineType,  shardCapacity : "-", shardCount: "-", status : "-", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    connection : { ...params }
                                    }
                                );
                                
                await documentDBObjectContainer[objectId].connect();
                await documentDBObjectContainer[objectId].addShards();
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = documentDBObjectContainer[objectId].objectProperties.connectionId;
                creationTime = documentDBObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", nodes : documentDBObjectContainer[objectId].getClusterShardIds(), newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ DOCUMENTDB - ELASTIC : Gather Information
app.get("/api/documentdb/elastic/cluster/gather/stats/", gatherStatsDocumentDBElasticCluster);
async function gatherStatsDocumentDBElasticCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var cluster = documentDBObjectContainer[params.engineType + ":" + params.clusterId].getAllDataCluster();
                var nodes = cluster.nodes.slice(params.beginItem,params.endItem);
                res.status(200).send({ 
                                        cluster : {...cluster, nodes : nodes }
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}


//--++ DOCUMENTDB - ELASTIC : Gather Information
app.get("/api/documentdb/elastic/shard/gather/stats/", gatherStatsDocumentDBElasticShard);
async function gatherStatsDocumentDBElasticShard(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var shards = documentDBObjectContainer[params.engineType + ":" + params.clusterId].getAllDataShards();
                res.status(200).send(shards);
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ DOCUMENTDB - ELASTIC : Shard Analytics
app.get("/api/documentdb/elastic/shard/gather/analytics/", gatherDocumentDBElasticShardAnalytics);
async function gatherDocumentDBElasticShardAnalytics(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var data = await documentDBObjectContainer[params.engineType + ":" + params.clusterId].getDataShardsAnalytics({ metricName : params.metricName });
                res.status(200).send(data);
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ DOCUMENTDB - ELASTIC : Shard Analytics
app.get("/api/documentdb/elastic/shard/gather/analytics/details/", gatherDocumentDBElasticShardAnalyticsDetails);
async function gatherDocumentDBElasticShardAnalyticsDetails(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var data = await documentDBObjectContainer[params.engineType + ":" + params.clusterId].getDataShardsAnalyticsDetails({ metricName : params.metricName, shardId : params.shardId });
                res.status(200).send(data);
                
        }
        catch(err){
                console.log(err);
        }
}


//--++ DOCUMENTDB - ELASTIC : Close Connection
app.get("/api/documentdb/elastic/cluster/close/connection/", closeConnectionDocumentDBElasticCluster);
async function closeConnectionDocumentDBElasticCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                documentDBObjectContainer[params.engineType + ":"  + params.clusterId].disconnect();
                delete documentDBObjectContainer[params.engineType + ":" + params.clusterId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}





//--#################################################################################################### 
//   ---------------------------------------- AURORA - POSTGRESQL
//--#################################################################################################### 


//--++ AURORA - POSTGRESQL : Authentication - Cluster
app.post("/api/aurora/cluster/postgresql/authentication/", authenticationAuroraPostgresqlCluster);
async function authenticationAuroraPostgresqlCluster(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

 
    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classPostgresqlEngine({...params});
            if (await objConnection.authentication()==true){
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ AURORA - POSTGRESQL : Open Connection - Cluster
app.post("/api/aurora/cluster/postgresql/open/connection/", openConnectionAuroraPostgresqlCluster);
async function openConnectionAuroraPostgresqlCluster(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            
            if (!(objectId in auroraPostgresqlObjectContainer)) {
                console.log("Creating new object : " + objectId);
                auroraPostgresqlObjectContainer[objectId] = new classCluster({
                                    properties : { name : params.clusterId, clusterId: params.clusterId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    connection : { ...params },
                                    metrics : [
                                                {name : "cpu", type : 2,history : 20 },
                                                {name : "memory", type : 2, history : 20 },
                                                {name : "ioreads", type : 2, history : 20 },
                                                {name : "iowrites",type : 2,  history : 20 },
                                                {name : "netin", type : 2, history : 20 },
                                                {name : "netout", type : 2, history : 20 },
                                                {name : "network", type : 2, history: 20 },
                                                {name : "iops", type : 2, history: 20 },
                                                {name : "xactTotal", type : 1, history: 20 },
                                                {name : "xactCommit", type : 1, history: 20 },
                                                {name : "xactRollback", type : 1, history: 20 },
                                                {name : "tuples", type : 1, history: 20 },
                                                {name : "tupReturned", type : 1, history: 20 },
                                                {name : "tupFetched", type : 1, history: 20 },
                                                {name : "tupInserted", type : 1, history: 20 },
                                                {name : "tupDeleted", type : 1, history: 20 },
                                                {name : "tupUpdated", type : 1, history: 20 },
                                                {name : "numbackends", type : 2, history: 20 },
                                                {name : "numbackendsActive", type : 2, history: 20 },
                                            ]
                                    }
                                );
                                
                await auroraPostgresqlObjectContainer[objectId].addNodeList();
                await auroraPostgresqlObjectContainer[objectId].connectNodes();
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = auroraPostgresqlObjectContainer[objectId].objectProperties.connectionId;
                creationTime = auroraPostgresqlObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", nodes : auroraPostgresqlObjectContainer[objectId].getClusterNodeListIds(), newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ AURORA - POSTGRESQL : Gather Information
app.get("/api/aurora/cluster/postgresql/gather/stats/", gatherStatsAuroraPostgresqlCluster);
async function gatherStatsAuroraPostgresqlCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

 
        try
            {
                var params = req.query;
                
                var cluster = auroraPostgresqlObjectContainer[params.engineType + ":" + params.clusterId].getAllDataCluster({ includeSessions : params.includeSessions});
                var nodes = cluster.nodes.slice(params.beginItem,params.endItem);
                res.status(200).send({ 
                                        cluster : {...cluster,nodes : nodes}
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ AURORA - POSTGRESQL : Close Connection
app.get("/api/aurora/cluster/postgresql/close/connection/", closeConnectionAuroraPostgresqlCluster);
async function closeConnectionAuroraPostgresqlCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                auroraPostgresqlObjectContainer[params.engineType + ":"  + params.clusterId].disconnectNodes();
                delete auroraPostgresqlObjectContainer[params.engineType + ":" + params.clusterId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}




//--#################################################################################################### 
//   ---------------------------------------- AURORA - MYSQL
//--#################################################################################################### 


//--++ AURORA - MYSQL : Authentication - Cluster
app.post("/api/aurora/cluster/mysql/authentication/", authenticationAuroraMysqlCluster);
async function authenticationAuroraMysqlCluster(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
 
    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classMysqlEngine({...params});
            if (await objConnection.authentication()==true){
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ AURORA - MYSQL : Open Connection - Cluster
app.post("/api/aurora/cluster/mysql/open/connection/", openConnectionAuroraMysqlCluster);
async function openConnectionAuroraMysqlCluster(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.clusterId;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            
            if (!(objectId in auroraMysqlObjectContainer)) {
                console.log("Creating new object : " + objectId);
                auroraMysqlObjectContainer[objectId] = new classCluster({
                                    properties : { name : params.clusterId, clusterId: params.clusterId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    connection : { ...params },
                                    metrics : [
                                                {name : "cpu", type : 2,history : 20 },
                                                {name : "memory", type : 2, history : 20 },
                                                {name : "ioreads", type : 2, history : 20 },
                                                {name : "iowrites",type : 2,  history : 20 },
                                                {name : "netin", type : 2, history : 20 },
                                                {name : "netout", type : 2, history : 20 },
                                                {name : "network", type : 2, history: 20 },
                                                {name : "iops", type : 2, history: 20 },
                                                {name : "queries", type : 1, history: 20 },
                                                {name : "questions", type : 1, history: 20 },
                                                {name : "operations", type : 1, history: 20 },
                                                {name : "comSelect", type : 1, history: 20 },
                                                {name : "comInsert", type : 1, history: 20 },
                                                {name : "comDelete", type : 1, history: 20 },
                                                {name : "comUpdate", type : 1, history: 20 },
                                                {name : "comCommit", type : 1, history: 20 },
                                                {name : "comRollback", type : 1, history: 20 },
                                                {name : "threads", type : 2, history: 20 },
                                                {name : "threadsRunning", type : 2, history: 20 },
                                            ]
                                    }
                                );
                                
                await auroraMysqlObjectContainer[objectId].addNodeList();
                await auroraMysqlObjectContainer[objectId].connectNodes();
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = auroraMysqlObjectContainer[objectId].objectProperties.connectionId;
                creationTime = auroraMysqlObjectContainer[objectId].objectProperties.creationTime;
                
            }
            res.status(200).send({ data : "Connection request completed", nodes : auroraMysqlObjectContainer[objectId].getClusterNodeListIds(), newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ AURORA - MYSQL : Gather Information
app.get("/api/aurora/cluster/mysql/gather/stats/", gatherStatsAuroraMysqlCluster);
async function gatherStatsAuroraMysqlCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var cluster = auroraMysqlObjectContainer[params.engineType + ":" + params.clusterId].getAllDataCluster({ includeSessions : params.includeSessions});
                var nodes = cluster.nodes.slice(params.beginItem,params.endItem);
                res.status(200).send({ 
                                        cluster : {...cluster,nodes : nodes}
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}



//--++ AURORA - MYSQL : Close Connection
app.get("/api/aurora/cluster/mysql/close/connection/", closeConnectionAuroraMysqlCluster);
async function closeConnectionAuroraMysqlCluster(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                auroraMysqlObjectContainer[params.engineType + ":"  + params.clusterId].disconnectNodes();
                delete auroraMysqlObjectContainer[params.engineType + ":" + params.clusterId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}





//--#################################################################################################### 
//   ---------------------------------------- RDS - MYSQL, MARIADB
//--#################################################################################################### 


//--++ RDS - MYSQL : Authentication - Cluster
app.post("/api/rds/instance/mysql/authentication/", authenticationRdsMysqlInstance);
async function authenticationRdsMysqlInstance(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

 
    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classMysqlEngine({...params});
            
            if (await objConnection.authentication()==true){
                
                var engineType = params.engineType;        
                var objectId = engineType + ":" + params.instanceId;
                var newObject = false;
                var creationTime = new Date().toISOString();
                var connectionId = session_id;
                
                if (!(objectId in rdsMysqlObjectContainer)) {
                    console.log("Creating new object : " + objectId);
                    rdsMysqlObjectContainer[objectId] = new classInstance({
                                        properties : { name : params.instanceId, instanceId: params.instanceId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                        connection : { ...params },
                                        metrics : [
                                                    {name : "cpuUsage", type : 2,history : 20 },
                                                    {name : "cpuUser", type : 2,history : 20 },
                                                    {name : "cpuSys", type : 2,history : 20 },
                                                    {name : "cpuWait", type : 2,history : 20 },
                                                    {name : "cpuIrq", type : 2,history : 20 },
                                                    {name : "cpuGuest", type : 2,history : 20 },
                                                    {name : "cpuSteal", type : 2,history : 20 },
                                                    {name : "cpuNice", type : 2,history : 20 },
                                                    {name : "vCpus", type : 2,history : 20 },
                                                    {name : "memoryUsage", type : 2,history : 20 },
                                                    {name : "memoryTotal", type : 2,history : 20 },
                                                    {name : "memoryActive", type : 2,history : 20 },
                                                    {name : "memoryInactive", type : 2,history : 20 },
                                                    {name : "memoryFree", type : 2,history : 20 },
                                                    {name : "ioreadsRsdev", type : 2,history : 20 },
                                                    {name : "ioreadsFilesystem", type : 2,history : 20 },
                                                    {name : "ioreads", type : 2,history : 20 },
                                                    {name : "iowritesRsdev", type : 2,history : 20 },
                                                    {name : "iowritesFilesystem", type : 2,history : 20 },
                                                    {name : "iowrites", type : 2,history : 20 },
                                                    {name : "iops", type : 2,history : 20 },
                                                    {name : "networkTx", type : 2,history : 20 },
                                                    {name : "networkRx", type : 2,history : 20 },
                                                    {name : "network", type : 2,history : 20 },
                                                    {name : "queries", type : 1, history: 20 },
                                                    {name : "questions", type : 1, history: 20 },
                                                    {name : "operations", type : 1, history: 20 },
                                                    {name : "comSelect", type : 1, history: 20 },
                                                    {name : "comInsert", type : 1, history: 20 },
                                                    {name : "comDelete", type : 1, history: 20 },
                                                    {name : "comUpdate", type : 1, history: 20 },
                                                    {name : "comCommit", type : 1, history: 20 },
                                                    {name : "comRollback", type : 1, history: 20 },
                                                    {name : "threads", type : 2, history: 20 },
                                                    {name : "threadsRunning", type : 2, history: 20 },
                                                ]
                                        }
                                    );
                    
                    await rdsMysqlObjectContainer[objectId].connect();
                    newObject = true;
                }
                else {
                    console.log("Reusing object : " + objectId);
                    connectionId = rdsMysqlObjectContainer[objectId].objectProperties.connectionId;
                    creationTime = rdsMysqlObjectContainer[objectId].objectProperties.creationTime;
                    
                }
                
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token, newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ RDS - MYSQL : Execute Query
app.get("/api/rds/instance/mysql/execute/query/", executeQueryRdsMysqlInstance);
async function executeQueryRdsMysqlInstance(req, res) {

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

 
    var params = req.query;
    
    try {
            
            var objectId = params.engineType + ":" + params.instanceId;
                
            var data = await rdsMysqlObjectContainer[objectId].executeQuery({ query : params.query });
            
            res.status(200).send(data);
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ RDS - MYSQL : Gather Information
app.get("/api/rds/instance/mysql/gather/stats/", gatherStatsRdsMysqlInstance);
async function gatherStatsRdsMysqlInstance(req, res) {
 
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
        
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var instanceInfo = rdsMysqlObjectContainer[params.engineType + ":" + params.instanceId].getAllDataInstance({ includeProcesses : params.includeProcesses});
                
                res.status(200).send({ 
                                        instance : instanceInfo
                                    });
                
        }
        catch(err){
                console.log(err);
                res.status(500).send(err);
        }
}



//--++ RDS - MYSQL : Close Connection
app.get("/api/rds/instance/mysql/close/connection/", closeConnectionRdsMysqlInstance);
async function closeConnectionRdsMysqlInstance(req, res) {
 
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
        
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                rdsMysqlObjectContainer[params.engineType + ":"  + params.instanceId].disconnect();
                delete rdsMysqlObjectContainer[params.engineType + ":" + params.instanceId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}




//--#################################################################################################### 
//   ---------------------------------------- RDS - POSTGRESQL
//--#################################################################################################### 


//--++ RDS - POSTGRESQL : Authentication - Cluster
app.post("/api/rds/instance/postgresql/authentication/", authenticationRdsPostgresqlInstance);
async function authenticationRdsPostgresqlInstance(req, res) {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classPostgresqlEngine({...params});
            
            if (await objConnection.authentication()==true){
                
                var engineType = params.engineType;        
                var objectId = engineType + ":" + params.instanceId;
                var newObject = false;
                var creationTime = new Date().toISOString();
                var connectionId = session_id;
                
                if (!(objectId in rdsPostgresqlObjectContainer)) {
                    console.log("Creating new object : " + objectId);
                    rdsPostgresqlObjectContainer[objectId] = new classInstance({
                                        properties : { name : params.instanceId, instanceId: params.instanceId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                        connection : { ...params },
                                        metrics : [
                                                    {name : "cpuUsage", type : 2,history : 20 },
                                                    {name : "cpuUser", type : 2,history : 20 },
                                                    {name : "cpuSys", type : 2,history : 20 },
                                                    {name : "cpuWait", type : 2,history : 20 },
                                                    {name : "cpuIrq", type : 2,history : 20 },
                                                    {name : "cpuGuest", type : 2,history : 20 },
                                                    {name : "cpuSteal", type : 2,history : 20 },
                                                    {name : "cpuNice", type : 2,history : 20 },
                                                    {name : "vCpus", type : 2,history : 20 },
                                                    {name : "memoryUsage", type : 2,history : 20 },
                                                    {name : "memoryTotal", type : 2,history : 20 },
                                                    {name : "memoryActive", type : 2,history : 20 },
                                                    {name : "memoryInactive", type : 2,history : 20 },
                                                    {name : "memoryFree", type : 2,history : 20 },
                                                    {name : "ioreadsRsdev", type : 2,history : 20 },
                                                    {name : "ioreadsFilesystem", type : 2,history : 20 },
                                                    {name : "ioreads", type : 2,history : 20 },
                                                    {name : "iowritesRsdev", type : 2,history : 20 },
                                                    {name : "iowritesFilesystem", type : 2,history : 20 },
                                                    {name : "iowrites", type : 2,history : 20 },
                                                    {name : "iops", type : 2,history : 20 },
                                                    {name : "networkTx", type : 2,history : 20 },
                                                    {name : "networkRx", type : 2,history : 20 },
                                                    {name : "network", type : 2,history : 20 },
                                                    {name : "tuples", type : 1, history: 20 },
                                                    {name : "xactTotal", type : 1, history: 20 },
                                                    {name : "xactCommit", type : 1, history: 20 },
                                                    {name : "xactRollback", type : 1, history: 20 },
                                                    {name : "tupReturned", type : 1, history: 20 },
                                                    {name : "tupFetched", type : 1, history: 20 },
                                                    {name : "tupInserted", type : 1, history: 20 },
                                                    {name : "tupDeleted", type : 1, history: 20 },
                                                    {name : "tupUpdated", type : 1, history: 20 },
                                                    {name : "numbackends", type : 2, history: 20 },
                                                    {name : "numbackendsActive", type : 2, history: 20 },
                                                ]
                                        }
                                    );
                    
                    await rdsPostgresqlObjectContainer[objectId].connect();
                    newObject = true;
                }
                else {
                    console.log("Reusing object : " + objectId);
                    connectionId = rdsPostgresqlObjectContainer[objectId].objectProperties.connectionId;
                    creationTime = rdsPostgresqlObjectContainer[objectId].objectProperties.creationTime;
                    
                }
                
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token, newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ RDS - POSTGRESQL : Execute Query
app.get("/api/rds/instance/postgresql/execute/query/", executeQueryRdsPostgresqlInstance);
async function executeQueryRdsPostgresqlInstance(req, res) {

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
    var params = req.query;
    
    try {
            
            var objectId = params.engineType + ":" + params.instanceId;
                
            var data = await rdsPostgresqlObjectContainer[objectId].executeQuery({ query : params.query });
            
            res.status(200).send(data);
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ RDS - POSTGRESQL : Gather Information
app.get("/api/rds/instance/postgresql/gather/stats/", gatherStatsRdsPostgresqlInstance);
async function gatherStatsRdsPostgresqlInstance(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                var instanceInfo = rdsPostgresqlObjectContainer[params.engineType + ":" + params.instanceId].getAllDataInstance({ includeProcesses : params.includeProcesses});
                
                res.status(200).send({ 
                                        instance : instanceInfo
                                    });
                
        }
        catch(err){
                console.log(err);
                res.status(500).send(err);
        }
}



//--++ RDS - POSTGRESQL : Close Connection
app.get("/api/rds/instance/postgresql/close/connection/", closeConnectionRdsPostgresqlInstance);
async function closeConnectionRdsPostgresqlInstance(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
 
        try
            {
                var params = req.query;
                
                rdsPostgresqlObjectContainer[params.engineType + ":"  + params.instanceId].disconnect();
                delete rdsPostgresqlObjectContainer[params.engineType + ":" + params.instanceId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}




//--#################################################################################################### 
//   ---------------------------------------- RDS - SQLSERVER
//--#################################################################################################### 


//--++ RDS - SQLSERVER : Authentication - Cluster
app.post("/api/rds/instance/sqlserver/authentication/", authenticationRdsSqlserverInstance);
async function authenticationRdsSqlserverInstance(req, res) {
 
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
    
    
    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classSqlserverEngine({...params});
            
            if (await objConnection.authentication()==true){
                
                var engineType = params.engineType;        
                var objectId = engineType + ":" + params.instanceId;
                var newObject = false;
                var creationTime = new Date().toISOString();
                var connectionId = session_id;
                
                if (!(objectId in rdsSqlserverObjectContainer)) {
                    console.log("Creating new object : " + objectId);
                    rdsSqlserverObjectContainer[objectId] = new classInstance({
                                        properties : { name : params.instanceId, instanceId: params.instanceId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                        connection : { ...params },
                                        metrics : [
                                                    {name : "cpuUsage", type : 2,history : 20 },
                                                    {name : "cpuUser", type : 2,history : 20 },
                                                    {name : "cpuSys", type : 2,history : 20 },
                                                    {name : "cpuWait", type : 2,history : 20 },
                                                    {name : "cpuIrq", type : 2,history : 20 },
                                                    {name : "cpuGuest", type : 2,history : 20 },
                                                    {name : "cpuSteal", type : 2,history : 20 },
                                                    {name : "cpuNice", type : 2,history : 20 },
                                                    {name : "vCpus", type : 2,history : 20 },
                                                    {name : "memoryUsage", type : 2,history : 20 },
                                                    {name : "memoryTotal", type : 2,history : 20 },
                                                    {name : "memorySqlserver", type : 2,history : 20 },
                                                    {name : "memoryCommit", type : 2,history : 20 },
                                                    {name : "memoryFree", type : 2,history : 20 },
                                                    {name : "ioreads", type : 2,history : 20 },
                                                    {name : "iowrites", type : 2,history : 20 },
                                                    {name : "iops", type : 2,history : 20 },
                                                    {name : "networkTx", type : 2,history : 20 },
                                                    {name : "networkRx", type : 2,history : 20 },
                                                    {name : "network", type : 2,history : 20 },
                                                    {name : "batchRequests", type : 1,history : 20 },
                                                    {name : "transactions", type : 1,history : 20 },
                                                    {name : "sqlCompilations", type : 1,history : 20 },
                                                    {name : "sqlReCompilations", type : 1,history : 20 },
                                                    {name : "logins", type : 1,history : 20 },
                                                    {name : "connections", type : 2,history : 20 },
                                                    {name : "pageWrites", type : 1,history : 20 },
                                                    {name : "pageReads", type : 1,history : 20 },
                                                ]
                                        }
                                    );
                    
                    await rdsSqlserverObjectContainer[objectId].connect();
                    newObject = true;
                }
                else {
                    console.log("Reusing object : " + objectId);
                    connectionId = rdsSqlserverObjectContainer[objectId].objectProperties.connectionId;
                    creationTime = rdsSqlserverObjectContainer[objectId].objectProperties.creationTime;
                    
                }
                
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token, newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ RDS - SQLSERVER : Execute Query
app.get("/api/rds/instance/sqlserver/execute/query/", executeQueryRdsSqlserverInstance);
async function executeQueryRdsSqlserverInstance(req, res) {

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
            
    var params = req.query;
    
    try {
            
            var objectId = params.engineType + ":" + params.instanceId;
                
            var data = await rdsSqlserverObjectContainer[objectId].executeQuery({ query : params.query });
            
            res.status(200).send(data);
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ RDS - SQLSERVER : Gather Information
app.get("/api/rds/instance/sqlserver/gather/stats/", gatherStatsRdsSqlserverInstance);
async function gatherStatsRdsSqlserverInstance(req, res) {
 
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
        
        
        try
            {
                var params = req.query;
                
                var instanceInfo = rdsSqlserverObjectContainer[params.engineType + ":" + params.instanceId].getAllDataInstance({ includeProcesses : params.includeProcesses});
                
                res.status(200).send({ 
                                        instance : instanceInfo
                                    });
                
        }
        catch(err){
                console.log(err);
                res.status(500).send(err);
        }
}



//--++ RDS - SQLSERVER : Close Connection
app.get("/api/rds/instance/sqlserver/close/connection/", closeConnectionRdsSqlserverInstance);
async function closeConnectionRdsSqlserverInstance(req, res) {
 
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });
            
            
        try
            {
                var params = req.query;
                
                rdsSqlserverObjectContainer[params.engineType + ":"  + params.instanceId].disconnect();
                delete rdsSqlserverObjectContainer[params.engineType + ":" + params.instanceId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}




//--#################################################################################################### 
//   ---------------------------------------- RDS - ORACLE
//--#################################################################################################### 


//--++ RDS - ORACLE : Authentication - Cluster
app.post("/api/rds/instance/oracle/authentication/", authenticationRdsOracleInstance);
async function authenticationRdsOracleInstance(req, res) {
 
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});


    var params = req.body.params;
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
            var objConnection = new classOracleEngine({...params});
            
            if (await objConnection.authentication()==true){
                
                var engineType = params.engineType;        
                var objectId = engineType + ":" + params.instanceId;
                var newObject = false;
                var creationTime = new Date().toISOString();
                var connectionId = session_id;
                
                if (!(objectId in rdsOracleObjectContainer)) {
                    console.log("Creating new object : " + objectId);
                    rdsOracleObjectContainer[objectId] = new classInstance({
                                        properties : { name : params.instanceId, instanceId: params.instanceId, uid: objectId, engineType : engineType, size : "", totalNodes : 0, status : "", networkRate : 0, connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                        connection : { ...params },
                                        metrics : [
                                                    {name : "cpuUsage", type : 2,history : 20 },
                                                    {name : "cpuUser", type : 2,history : 20 },
                                                    {name : "cpuSys", type : 2,history : 20 },
                                                    {name : "cpuWait", type : 2,history : 20 },
                                                    {name : "cpuIrq", type : 2,history : 20 },
                                                    {name : "cpuGuest", type : 2,history : 20 },
                                                    {name : "cpuSteal", type : 2,history : 20 },
                                                    {name : "cpuNice", type : 2,history : 20 },
                                                    {name : "vCpus", type : 2,history : 20 },
                                                    {name : "memoryUsage", type : 2,history : 20 },
                                                    {name : "memoryTotal", type : 2,history : 20 },
                                                    {name : "memoryActive", type : 2,history : 20 },
                                                    {name : "memoryInactive", type : 2,history : 20 },
                                                    {name : "memoryFree", type : 2,history : 20 },
                                                    {name : "ioreadsRsdev", type : 2,history : 20 },
                                                    {name : "ioreadsFilesystem", type : 2,history : 20 },
                                                    {name : "ioreads", type : 2,history : 20 },
                                                    {name : "iowritesRsdev", type : 2,history : 20 },
                                                    {name : "iowritesFilesystem", type : 2,history : 20 },
                                                    {name : "iowrites", type : 2,history : 20 },
                                                    {name : "iops", type : 2,history : 20 },
                                                    {name : "networkTx", type : 2,history : 20 },
                                                    {name : "networkRx", type : 2,history : 20 },
                                                    {name : "network", type : 2,history : 20 },
                                                    {name : "userCalls", type : 1, history: 20 },
                                                    {name : "userCommits", type : 1, history: 20 },
                                                    {name : "dbIOWrites", type : 1, history: 20 },
                                                    {name : "dbIOReads", type : 1, history: 20 },
                                                    {name : "redoWrites", type : 1, history: 20 },
                                                    {name : "logons", type : 2, history: 20 },
                                                    {name : "dbBlockChanges", type : 1, history: 20 },
                                                    {name : "dbBlockGets", type : 1, history: 20 },
                                                ]
                                        }
                                    );
                    
                    await rdsOracleObjectContainer[objectId].connect();
                    newObject = true;
                }
                else {
                    console.log("Reusing object : " + objectId);
                    connectionId = rdsOracleObjectContainer[objectId].objectProperties.connectionId;
                    creationTime = rdsOracleObjectContainer[objectId].objectProperties.creationTime;
                    
                }
                
                res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token, newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
            }
            else {
                res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
            }
            
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ RDS - ORACLE : Execute Query
app.get("/api/rds/instance/oracle/execute/query/", executeQueryRdsOracleInstance);
async function executeQueryRdsOracleInstance(req, res) {
 
    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

            
    var params = req.query;
    
    try {
            
            var objectId = params.engineType + ":" + params.instanceId;
                
            var data = await rdsOracleObjectContainer[objectId].executeQuery({ query : params.query });
            
            res.status(200).send(data);
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



//--++ RDS - POSTGRESQL : Gather Information
app.get("/api/rds/instance/oracle/gather/stats/", gatherStatsRdsOracleInstance);
async function gatherStatsRdsOracleInstance(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

 
        try
            {
                var params = req.query;
                
                var instanceInfo = rdsOracleObjectContainer[params.engineType + ":" + params.instanceId].getAllDataInstance({ includeProcesses : params.includeProcesses});
                
                res.status(200).send({ 
                                        instance : instanceInfo
                                    });
                
        }
        catch(err){
                console.log(err);
                res.status(500).send(err);
        }
}



//--++ RDS - ORACLE : Close Connection
app.get("/api/rds/instance/oracle/close/connection/", closeConnectionRdsOracleInstance);
async function closeConnectionRdsOracleInstance(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                rdsOracleObjectContainer[params.engineType + ":"  + params.instanceId].disconnect();
                delete rdsOracleObjectContainer[params.engineType + ":" + params.instanceId];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}



//--#################################################################################################### 
//   ---------------------------------------- DYNAMODB 
//--#################################################################################################### 

//--++ DYNAMODB - Authentication
app.post("/api/dynamodb/authentication/", authenticationDynamoDB);
async function authenticationDynamoDB(req, res) {
 
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    var session_id=uuid.v4();
    var token = generateToken({ session_id: session_id});
            
    try {
            
        res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
                
    }
    catch(err){
        console.log(err);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }

}



//--++ DYNAMODB - Open Connection
app.post("/api/dynamodb/open/connection/", openConnectionDynamoDB);
async function openConnectionDynamoDB(req, res) {
 
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
       
 
    var params = req.body.params;
    
    try {
        
            var engineType = params.engineType;        
            var objectId = engineType + ":" + params.tableName;
            var newObject = false;
            var creationTime = new Date().toISOString();
            var connectionId = params.connectionId;
            
            if (!(objectId in dynamoDBObjectContainer )) {
                console.log("Creating new object : " + objectId);
                dynamoDBObjectContainer[objectId] = new classDynamoDB({
                                    properties : { name : params.tableName, tableName: params.tableName, uid: objectId, engineType : engineType, status : "-", wcu : "-", rcu : "-", connectionId: connectionId, creationTime : creationTime, lastUpdate : "" },
                                    }
                                );
                await dynamoDBObjectContainer[objectId].refreshData();
                newObject = true;
            }
            else {
                console.log("Reusing object : " + objectId);
                connectionId = dynamoDBObjectContainer[objectId].objectProperties.connectionId;
                creationTime = dynamoDBObjectContainer[objectId].objectProperties.creationTime;
                
            }
            
            res.status(200).send({ newObject : newObject, connectionId : connectionId, creationTime :  creationTime });
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}




//--++ DYNAMODB - Gather Information
app.get("/api/dynamodb/gather/stats/", gatherStatsDynamoDB);
async function gatherStatsDynamoDB(req, res) {
    
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                var table = dynamoDBObjectContainer[params.engineType + ":" + params.tableName].getAllTableData();
                res.status(200).send({ 
                                        table : {...table }
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}


//--++ DYNAMODB - Gather Information
app.get("/api/dynamodb/gather/index/stats/", gatherIndexStatsDynamoDB);
async function gatherIndexStatsDynamoDB(req, res) {
    
        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                
                var index = await dynamoDBObjectContainer[params.engineType + ":" + params.tableName].getIndexData({ indexName : params.indexName });
                res.status(200).send({ 
                                        index : {...index }
                                    });
                
        }
        catch(err){
                console.log(err);
        }
}


//--++ DYNAMODB - Close Connection
app.get("/api/dynamodb/close/connection/", closeConnectionDynamoDB);
async function closeConnectionDynamoDB(req, res) {

        // Token Validation
        var standardToken = verifyToken(req.headers['x-token']);
        var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
        if (standardToken.isValid === false || cognitoToken.isValid === false)
            return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

        try
            {
                var params = req.query;
                delete dynamoDBObjectContainer[params.engineType + ":" + params.tableName];
                res.status(200).send( {"result":"Disconnection completed"});
                
                
        }
        catch(err){
                console.log(err);
                res.status(401).send( {"error": String(err)});
        }
}



//--#################################################################################################### 
//   ---------------------------------------- AWS
//--#################################################################################################### 


//--## AWS : List Aurora Clusters
app.get("/api/aws/aurora/cluster/region/list/", async (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var params = {
        MaxRecords: 100
    };

    try {
        var data = await AWSObject.getRDSClustersAPI(params);
        res.status(200).send({ csrfToken: req.csrfToken(), data:data });
        
    } catch(error) {
        console.log(error)
                
    }

});



//--## AWS : List RDS Instances
app.get("/api/aws/aurora/cluster/region/endpoints/", async (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var paramsQuery = req.query;
    
    var params = {
        MaxRecords: 100,
        Filters: [
                {
                  Name: 'db-cluster-id',
                  Values: [paramsQuery.cluster]
                },
        ],
    };

    try {
        
        var data = await AWSObject.getRDSInstancesAPI(params);
        res.status(200).send({ csrfToken: req.csrfToken(), data:data });
    
    } catch(error) {
        console.log(error)
                
    }

});




//-## AWS : List RDS Instances
app.get("/api/aws/rds/instance/region/list/", async (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var params = {
        MaxRecords: 100
    };

    try {
        
        var data = await AWSObject.getRDSInstancesAPI(params);
        res.status(200).send({ csrfToken: req.csrfToken(), data:data });
        
    } catch(error) {
        console.log(error)
                
    }

});






//--## AWS : Cloudwatch Information
app.get("/api/aws/clw/query/", async (req,res)=>{
    
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    try {
            
            var params = req.query;
            
            params.MetricDataQueries.forEach(function(metric) {
                                metric.MetricStat.Metric.Dimensions[0]={ Name: metric.MetricStat.Metric.Dimensions[0]['[Name]'], Value: metric.MetricStat.Metric.Dimensions[0]['[Value]']};
                     
            })
            
            params.StartTime = new Date(params.StartTime);
            params.EndTime = new Date(params.EndTime);
        
            var data = await AWSObject.getCloudwatchMetricDataAPI(params);
            res.status(200).send(data);
            
                   
    } catch(error) {
            console.log(error)
                    
    }
    

});


//--## AWS : Cloudwatch Information
app.get("/api/aws/clw/region/query/", async (req,res)=>{

    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    try {
        
        var params = req.query;
        params.MetricDataQueries.forEach(function(metric) {
                
                for(let i_dimension=0; i_dimension <  metric.MetricStat.Metric.Dimensions.length; i_dimension++) {
                    metric.MetricStat.Metric.Dimensions[i_dimension]={ Name: metric.MetricStat.Metric.Dimensions[i_dimension]['[Name]'], Value: metric.MetricStat.Metric.Dimensions[i_dimension]['[Value]']};
                }          
        })
        
        params.StartTime = new Date(params.StartTime);
        params.EndTime = new Date(params.EndTime);
        
        var data = await AWSObject.getCloudwatchMetricDataAPI(params);
        res.status(200).send(data);
        
               
    } catch(error) {
        console.log(error)
                
    }


});


//--## AWS : Cloudwatch Information
app.get("/api/aws/clw/region/logs/", async (req,res)=>{
    
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    
    try {
        
        var params = req.query;
        var params_logs = {
          logStreamName: params.resource_id,
          limit: 1,
          logGroupName: 'RDSOSMetrics',
          startFromHead: false
        };
    
        var data = await AWSObject.getCloudwatchLogsAPI(params_logs);
        res.status(200).send(data);
  

    } catch(error) {
        console.log(error);
        return[];
                
    }


});



//--## AWS : Elasticache Clusters
app.get("/api/aws/region/elasticache/cluster/nodes/", async (req,res)=>{

    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});


    var params = req.query;

    var parameter = {
      MaxRecords: 100,
      ReplicationGroupId: params.cluster
    };
    
    
    try {
        
        var data = await AWSObject.getElasticacheClustersAPI(parameter);
        res.status(200).send({ csrfToken: req.csrfToken(), ReplicationGroups : data.ReplicationGroups})
        
    } catch(error) {
        console.log(error);
        res.status(401).send({ ReplicationGroups : []});
    }
    
});


//--## AWS : Elasticache Serverless Clusters
app.get("/api/aws/region/elasticache/serverless/cluster/", async (req,res)=>{

    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    var parameter = {
      MaxResults: 100
    };
    
    try {
        
        var data = await AWSObject.getElasticacheServelesssAPI(parameter);
        res.status(200).send(data);
        
    } catch(error) {
        console.log(error);
        return[];
    }

});




//--## AWS : MemoryDB Clusters
app.get("/api/aws/region/memorydb/cluster/nodes/", async (req,res)=>{
    
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});


    var params = req.query;

    var parameter = {
      ClusterName: params.cluster,
      ShowShardDetails: true
    };
    
    
    try {
        
        var data = await AWSObject.getMemoryDBClustersAPI(parameter);
        res.status(200).send({ csrfToken: req.csrfToken(), Clusters : data.Clusters})
        
    } catch(error) {
        console.log(error);
        res.status(401).send({ Clusters : []});
    }


});





//--## AWS : DocumentDB List clusters - by Region
app.get("/api/aws/docdb/cluster/region/list/", async (req,res)=>{

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    var paramsQuery = req.query;
    
    var paramsStandard = {
        DBClusterIdentifier: paramsQuery.cluster,
        MaxRecords: 100
    };

    var paramsElastic = {
        maxResults: 100
    };

    try {
        
        
        
        var standardClusters = await AWSObject.getDocumentDBClustersAPI(paramsStandard);
        
        var elasticClusters = await AWSObject.getDocumentDBClustersElasticAPI(paramsElastic);
        
        var accountInfo = await AWSObject.getSTSCallerIdentityAPI({});
        
        res.status(200).send({ csrfToken: req.csrfToken(), standard : standardClusters, elastic : {...elasticClusters, endPoint : accountInfo.Account + "." + configData.aws_region + ".docdb-elastic.amazonaws.com" }  });
        
        

    } catch(error) {
        console.log(error)
                
    }

});


//--## AWS : DynamoDB list tables
app.get("/api/aws/region/dynamodb/tables/", async (req,res)=>{
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});


    var parameter = {};
    
    try {
        
        var data = await AWSObject.getDynamoDBTablesAPI(parameter);
        res.status(200).send({ csrfToken: req.csrfToken(), tables : data.TableNames })
        
    } catch(error) {
        console.log(error);
        res.status(401).send({ tables : []});
    }
    


});



// AWS : DynamoDB list tables with details
app.get("/api/aws/region/dynamodb/tables/details/", async (req,res)=>{

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    try {
        
        var tableList = await AWSObject.getDynamoDBTablesAPI({});
        var tableResult = [];
        if (tableList.TableNames.length > 0) {
            
            for(let index=0; index < tableList.TableNames.length ; index ++) {
                var tableInfo = await AWSObject.getDynamoDBTableInfo(tableList.TableNames[index]); 
                delete tableInfo.metadata;
                tableResult.push(tableInfo);
            }
                                  
        }
        
        res.status(200).send({ csrfToken: req.csrfToken(), tables : tableResult })
        
    }
    catch{
        res.status(401).send({ tables : []});
    }
    

});


//--#################################################################################################### 
//   ---------------------------------------- MAIN API CORE
//--#################################################################################################### 


app.listen(port, ()=>{
    console.log(`Server is running on ${port}`)
})