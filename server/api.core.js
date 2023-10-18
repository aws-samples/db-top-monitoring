// AWS API Variables
const fs = require('fs');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));
var nodeCatalog = JSON.parse(fs.readFileSync('./aws-node-types.json'));

// API Application Variables
const express = require('express');
const cors = require('cors')
const uuid = require('uuid');
const axios = require('axios');

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



// AWS Variables
var AWS = require('aws-sdk');
AWS.config.update({region: configData.aws_region});

var rds = new AWS.RDS({region: configData.aws_region});
var cloudwatch = new AWS.CloudWatch({region: configData.aws_region, apiVersion: '2010-08-01'});
var cloudwatchlogs = new AWS.CloudWatchLogs();
var docDB = new AWS.DocDB({region: configData.aws_region});
            



// Security Variables
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
var request = require('request');
var secretKey =  crypto.randomBytes(32).toString('hex')
var pems;
var issCognitoIdp = "https://cognito-idp." + configData.aws_region + ".amazonaws.com/" + configData.aws_cognito_user_pool_id;
        

// Mysql Variables
const mysql = require('mysql2')
var db=[];
var aurora=[];
var auroraCluster=[];

// Postgresql Variables
const postgresql = require('pg').Pool
var nodeTypeAuroraPostgreSQL = {
        name : "",
        cpu: 0,
        memory: 0,
        ioreads: 0,
        iowrites: 0,
        netin: 0,
        netout: 0,
        xactTotal: 0,
        xactCommit: 0,
        xactRollback: 0,
        tupReturned: 0,
        tupFetched: 0,
        tupInserted: 0,
        tupDeleted: 0,
        tupInserted: 0,
        tupUpdated: 0,
        numbackends : 0,
        numbackendsActive : 0,
        timestamp : 0 
    
};

// SQLServer Variables
const mssql = require('mssql')

// ORACLE Variables
const oracle = require('oracledb')

// REDIS Variables
const redis = require("redis");
const redisInfo = require('redis-info');
var redisClient=[];
var elasticache = new AWS.ElastiCache();
var memorydb = new AWS.MemoryDB();
var dbRedis = {};
var dbRedisCluster = {};

var nodeType = {
        name : "",
        cpuUser: 0,
        cpuSys: 0,
        memory: 0,
        memoryUsed: 0,
        memoryTotal: 0,
        operations: 0,
        getCalls: 0,
        getUsec: 0,
        setCalls: 0,
        setUsec: 0,
        connectedClients: 0,
        getLatency: 0,
        setLatency: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        netIn: 0,
        netOut: 0,
        connectionsTotal: 0,
        commands: 0,
        timestamp : 0
    
};



// DocumentDB Variables
const { MongoClient } = require("mongodb");
var docdb = {};
var documentDBCluster = {};

var nodeTypeDocumentDB = {
        name : "",
        cpu: 0,
        memory: 0,
        ioreads: 0,
        iowrites: 0,
        netin: 0,
        netout: 0,
        connectionsCurrent : 0,
        connectionsAvailable : 0,
        connectionsCreated : 0,
        opsInsert : 0,
        opsQuery : 0,
        opsUpdate : 0,
        opsDelete : 0,
        opsGetmore : 0,
        opsCommand : 0,
        docsDeleted : 0,
        docsInserted : 0,
        docsReturned : 0,
        docsUpdated : 0,
        transactionsActive : 0,
        transactionsCommited : 0,
        transactionsAborted : 0,
        transactionsStarted : 0,
        timestamp : 0,
};


// Startup - Download PEMs Keys
gatherPemKeys(issCognitoIdp);



//--#################################################################################################### 
//   ---------------------------------------- CLASS OBJECTS
//--#################################################################################################### 



class classMetric {

          
          constructor(id,name,arrayMetrics) { 
                  
                    this.id = id;  
                    this.name = name;
                    this.dataHistory = {};
                    this.totalSnaps = 0;
                    
                    arrayMetrics.forEach(metric => {
                    
                        this.dataHistory =  {...this.dataHistory, [metric.name]: { name : metric.name, history : metric.history, data : Array(metric.history).fill(null), timestamp: "" } }
                        
                    });
                    
                    
          }
          
          init(currentObject,currentTime,oldObject,oldTime) {
                    this.currentObject = currentObject;
                    this.currentTime = currentTime;
                    this.oldObject = oldObject;
                    this.oldTime = oldTime;
          }
          
          newSnapshot(currentObject,currentTime) {
                    
                    this.oldObject = this.currentObject;
                    this.oldTime = this.currentTime;
                    
                    this.currentObject = currentObject;
                    this.currentTime = currentTime;
                    this.totalSnaps++;
                    
          }

          getObjectName() {
              return this.name;
          }
          
          getObjectId() {
              return this.id;
          }
          
          getDeltaByIndex(propertyName) { 
              try
              {
                    if ( this.totalSnaps > 2 ) {
                                if (  (this.currentObject[propertyName] - this.oldObject[propertyName]) > 0)
                                    return ( 
                                                    (
                                                            (this.currentObject[propertyName] - this.oldObject[propertyName]) / 
                                                            (Math.abs(this.currentTime - this.oldTime) / 1000)
                                                    ) || 0
                                    ) ;
                                else 
                                    return 0;
                    }
                    else
                        return 0;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          
          getValueByIndex(propertyName) { 
          try
              {
                    return (this.currentObject[propertyName]) ;
              } 
              catch(e) {
                        return 0;       
            }
          }
          
          addPropertyValue (propertyName,propertyValue){
                  this.dataHistory[propertyName].data.push(propertyValue);
                  this.dataHistory[propertyName].data = this.dataHistory[propertyName].data.slice(this.dataHistory[propertyName].data.length-this.dataHistory[propertyName].history);
                  
          }
          
          addPropertyValueWithTimestamp (propertyName,propertyValue,propertyTimestamp){
              
                    if ( this.dataHistory[propertyName].timestamp != propertyTimestamp){
                        this.dataHistory[propertyName].data.push(propertyValue);
                        this.dataHistory[propertyName].data = this.dataHistory[propertyName].data.slice(this.dataHistory[propertyName].data.length-this.dataHistory[propertyName].history);
                        this.dataHistory[propertyName].timestamp = propertyTimestamp;
                    }
                  
          }
          
          getPropertyValues (propertyName){
                  return this.dataHistory[propertyName];
          }
          

}





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



//-- Authenticate User Database 
app.post("/api/security/rds/auth/", csrfProtection, (req,res)=>{
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var params = req.body.params;
    
    
    try {
        
        switch(params.engine)
        {
            //-- MYSQL CONNECTION
            case 'mysql':
            case 'mariadb':   
            case 'aurora-mysql':
                    var dbconnection= mysql.createConnection({
                    host: params.host,
                    user: params.username,
                    password: params.password,
                    port: params.port
                    })
                
                    dbconnection.connect(function(err) {
                      if (err) {
                        res.status(200).send( {"result":"auth0", "session_id": 0});
                      } else {
                        dbconnection.end();
                        var session_id=uuid.v4();
                        
                        if (params.mode == "cluster") {
                            
                            aurora["$" + session_id] = {};
                            
                            auroraCluster["$" + session_id] = {}
                            auroraCluster["$" + session_id][ "$" + params.cluster] = {};
                            auroraCluster["$" + session_id][ "$" + params.cluster]["cluster"] = new classMetric(
                                                                                                                    0,
                                                                                                                    "cluster",[
                                                                                                                            { name: "cpu", history: 20 },
                                                                                                                            { name: "memory", history: 20 },
                                                                                                                            { name: "ioreads", history: 20 },
                                                                                                                            { name: "iowrites", history: 20 },
                                                                                                                            { name: "netin", history: 20 },
                                                                                                                            { name: "netout", history: 20 },
                                                                                                                            { name: "queries", history: 20 },
                                                                                                                            { name: "questions", history: 20 },
                                                                                                                            { name: "comSelect", history: 20 },
                                                                                                                            { name: "comInsert", history: 20 },
                                                                                                                            { name: "comDelete", history: 20 },
                                                                                                                            { name: "comUpdate", history: 20 },
                                                                                                                            { name: "comCommit", history: 20 },
                                                                                                                            { name: "comRollback", history: 20 },
                                                                                                                            { name: "threads", history: 20 },
                                                                                                                            { name: "threadsRunning", history: 20 },
                                                                                                                            {name : "network", history: 20 },
                                                                                                                            {name : "iops", history: 20 },
                                                                                                                    ]
                                                                                                    ) ;
                            auroraCluster["$" + session_id][ "$" + params.cluster]["property"]  = function(){};
                            auroraCluster["$" + session_id][ "$" + params.cluster]["property"]  = { clusterId: params.cluster, timestamp : "" }
                            
                            
                        }
                        else
                            mysqlOpenConnection(session_id,params.host,params.port,params.username,params.password);
                        
                        var token = generateToken({ session_id: session_id });
                        res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
                      }
                      
                    });
                    
                    break;
                    
            //-- POSTGRESQL CONNECTION
            case 'postgres':
            case 'aurora-postgresql':
                    
                    var dbconnection = new postgresql({
                      user: params.username,
                      host: params.host,
                      database: 'postgres',
                      password: params.password,
                      port: params.port,
                      max: 1,
                    })
                    dbconnection.connect(function(err) {
                      if (err) {
                        res.status(200).send( {"result":"auth0", "session_id": 0});
                      } else {
                        dbconnection.end();
                        var session_id=uuid.v4();
                        
                        if (params.mode == "cluster") {
                            aurora["$" + session_id] = {};
                            
                            auroraCluster["$" + session_id] = {}
                            auroraCluster["$" + session_id][ "$" + params.cluster] = {};
                            auroraCluster["$" + session_id][ "$" + params.cluster]["cluster"] = new classMetric(
                                                                                                                    0,
                                                                                                                    "cluster",[
                                                                                                                        {name : "cpu", history : 20 },
                                                                                                                        {name : "memory", history : 20 },
                                                                                                                        {name : "ioreads", history : 20 },
                                                                                                                        {name : "iowrites", history : 20 },
                                                                                                                        {name : "netin", history : 20 },
                                                                                                                        {name : "netout", history : 20 },
                                                                                                                        {name : "xactTotal", history: 20 },
                                                                                                                        {name : "xactCommit", history: 20 },
                                                                                                                        {name : "xactRollback", history: 20 },
                                                                                                                        {name : "tupReturned", history: 20 },
                                                                                                                        {name : "tupFetched", history: 20 },
                                                                                                                        {name : "tupInserted", history: 20 },
                                                                                                                        {name : "tupDeleted", history: 20 },
                                                                                                                        {name : "tupUpdated", history: 20 },
                                                                                                                        {name : "numbackends", history: 20 },
                                                                                                                        {name : "numbackendsActive", history: 20 },
                                                                                                                        {name : "network", history: 20 },
                                                                                                                        {name : "iops", history: 20 },
                                                                                                                    ]
                                                                                                    ) ;
                            auroraCluster["$" + session_id][ "$" + params.cluster]["property"]  = function(){};
                            auroraCluster["$" + session_id][ "$" + params.cluster]["property"]  = { clusterId: params.cluster, timestamp : "" }
                    
                    
                            
                        }
                        else
                            postgresqlOpenConnection(session_id,params.host,params.port,params.username,params.password);
                            
                        var token = generateToken({ session_id: session_id});
                        res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token});
                      }
                      
                    });
                    break;
            
            //-- MSSQL CONNECTION    
            case 'sqlserver-se':
            case 'sqlserver-ee':
            case 'sqlserver-ex':
            case 'sqlserver-web':
                    
                    
                    var dbconnection = new mssql.ConnectionPool({
                        user: params.username,
                        password: params.password,
                        server: params.host,
                        database: 'master',
                        port : params.port,
                        pool: {
                            max: 2,
                            min: 0,
                            idleTimeoutMillis: 30000
                        },
                        options: {
                            trustServerCertificate: true,
                        }
                    });
    
                   
                    dbconnection.connect(function(err) {
                      if (err) {
                        res.status(200).send( {"result":"auth0", "session_id": 0});
                      } else {
                        dbconnection.close();
                        var session_id=uuid.v4();
                        mssqlOpenConnection(session_id,params.host,params.port,params.username,params.password);
                        
                        var token = generateToken({ session_id: session_id});
                        res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token});
                      }
                      
                    });
                    
                    break;
            
            //-- ORACLE CONNECTION
            case 'oracle-ee':
            case 'oracle-ee-cdb':
            case 'oracle-se2':
            case 'oracle-se2-cdb':
                    
                    oracle.getConnection({
                    user: params.username,
                    password: params.password,
                    connectString: params.host + ":" + params.port + "/" + params.instance 
                    }, function(err,connection) {
                        if (err) {
                            console.log(err);
                            res.status(200).send( {"result":"auth0", "session_id": 0});
                        } 
                        else {
                            connection.close(function(err) {
                              if (err) {console.log(err);}
                            });
                            var session_id=uuid.v4();
                            oracleOpenConnection(session_id,params.host,params.port,params.username,params.password,params.instance);
                            
                            var token = generateToken({ session_id: session_id});
                            res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token});
                        
                        }
                        
                    });
                
                    break;
                    
            
  
        }
        


    } catch(error) {
        console.log(error)
        res.status(200).send({"result":"auth0"});
                
    }
    
    
});


//-- Database Disconnection
app.get("/api/security/rds/disconnect/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });


    // API Call
    
    try {
        
        switch(req.query.engine)
        {
            case 'mysql':
            case 'aurora-mysql':
                console.log("API MYSQL Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].end();
                delete db[req.query.session_id];
                res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                break;
                
            case 'postgres':
            case 'aurora-postgresql':
                console.log("API POSTGRESQL Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].end();
                delete db[req.query.session_id];
                res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                break;
            
            case 'mariadb':
                console.log("API MARIADB Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].end();
                delete db[req.query.session_id];
                res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                break;
            
            case 'sqlserver-se':
            case 'sqlserver-ee':
            case 'sqlserver-ex':
            case 'sqlserver-web':
                console.log("API MSSQL Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].close();
                delete db[req.query.session_id];
                res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                break;

            case 'oracle-ee':
            case 'oracle-ee-cdb':
            case 'oracle-se2':
            case 'oracle-se2-cdb':
                
                console.log("API ORACLE Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].close(function(err) {
                        if (err) {
                            delete db[req.query.session_id];
                            res.status(401).send( {"result":"disconnected", "session_id": req.query.session_id});
                        } 
                        else {
                            delete db[req.query.session_id];
                            res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                            
                        }
                        
                    });
                
                break;

        }
        
    
    }
    
    catch(error) {

        res.status(200).send( {"result":"failed", "session_id": req.query.session_id});
        console.log(error)
        
    }
    
});



//--#################################################################################################### 
//   ---------------------------------------- MSSQL
//--#################################################################################################### 

// MSSQL : STANDALONE Create Connection
function mssqlOpenConnection(session_id,host,port,user,password){
    
    db[session_id] = new mssql.ConnectionPool({
                        user: user,
                        password: password,
                        server: host,
                        database: 'master',
                        port : port,
                        pool: {
                            max: 2,
                            min: 0,
                            idleTimeoutMillis: 30000
                        },
                        options: {
                            trustServerCertificate: true,
                        }
                    });
    
    db[session_id].connect(function(err) {
                      if (err) {
                        console.log("mssql error connection");
                      }
                      
    });
    
    console.log("Mssql Connection opened for session_id : " + session_id);
    
    
}


// MSSQL : STANDALONE : API Execute SQL Query
app.get("/api/mssql/sql/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });


    // API Call
    var params = req.query;
    
    try {
        
        db[standardToken.session_id].query(params.sql_statement, (err,result)=>{
                        if(err) {
                            console.log(err)
                            res.status(404).send(err);
                        } 
                        else {
                            res.status(200).send(result);
                        }

                }
            );   


    } catch(error) {
        console.log(error)
                
    }

});


//--#################################################################################################### 
//   ---------------------------------------- POSTGRESQL
//--#################################################################################################### 


// POSTGRESQL : STANDALONE : Create Connection
function postgresqlOpenConnection(session_id,host,port,user,password){
    
    db[session_id]  = new postgresql({
            host: host,
            user: user,
            password: password,
            database: "postgres",
            port: port,
            max: 2,
    })
    
    console.log("Postgresql Connection opened for session_id : " + session_id);
    
    
}


// POSTGRESQL : STANDALONE :  API Execute SQL Query
app.get("/api/postgres/sql/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });


    // API Call
    var params = req.query;
    
    try {
        
        db[standardToken.session_id].query(params.sql_statement, (err,result)=>{
                        if(err) {
                            console.log(err)
                            res.status(404).send(err);
                        } 
                        else {
                            res.status(200).send(result);
                        }

                }
            );   


    } catch(error) {
        console.log(error)
                
    }

});


//---+++ POSTGRESQL : CLUSTER : Open Connection - Aurora Cluster  
app.post("/api/aurora/postgresql/cluster/connection/open/", openAuroraPostgresqlConnectionCluster);
async function openAuroraPostgresqlConnectionCluster(req, res) {
 
    var params = req.body.params;
    
    try {
        
        
            // Gather Roles
            var parameterCluster = {
                DBClusterIdentifier: params.clusterId,
                MaxRecords: 100
            };

            var clusterData = await rds.describeDBClusters(parameterCluster).promise();
            var roleType = [];
            
            clusterData['DBClusters'][0]['DBClusterMembers'].forEach(function(instance) {
                roleType[instance['DBInstanceIdentifier']] =  ( String(instance['IsClusterWriter']) == "true" ? "P" : "R" );
            });
            
            
            // Gather Instances
            var parameter = {
                MaxRecords: 100,
                Filters: [
                        {
                          Name: 'db-cluster-id',
                          Values: [params.clusterId]
                        },
                ],
            };
            
            var data = await rds.describeDBInstances(parameter).promise();
            var nodeList = "";
            
            if (data.DBInstances.length> 0) {
                            
                           
                            var clusterNodes = data.DBInstances;
                             
                            var nodeList = [];
                            var nodeUid = 0;
                       
                            clusterNodes.forEach(function(node) {
                                
                                openAuroraPostgresqlConnectionNode({
                                                                connectionId : params.connectionId,
                                                                clusterId: params.clusterId,
                                                                nodeId : node['DBInstanceIdentifier'],
                                                                host : node['Endpoint']['Address'],
                                                                port : node['Endpoint']['Port'],
                                                                username: params.username,
                                                                password: params.password,
                                                                nodeUid : nodeUid,
                                                                size : node['DBInstanceClass'],
                                                                az : node['AvailabilityZone'],
                                                                status : node['DBInstanceStatus'],
                                                                monitoring :  ( String(node['MonitoringInterval']) == "0" ? "clw" : "em" ),
                                                                resourceId : node['DbiResourceId'],
                                                                role : roleType[node['DBInstanceIdentifier']],
                                                });
                                
                               
                                                                
                                nodeList = nodeList +  node['DBInstanceIdentifier']  + "," 
                                nodeUid ++;
                                
                        
                            });
                            
                            
                            res.status(200).send({ data : "Connection Request Opened", nodes : nodeList.slice(0, -1)});
                            
                                    
                            
            }
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}



    
//---+++ POSTGRESQL : CLUSTER : Open Connection - Aurora Node  
async function openAuroraPostgresqlConnectionNode(node){
    
    try {
            
            
            var connectionId = "$" + node.connectionId;
            var clusterId = "$" + node.clusterId;
            var instanceId = "$" + node.nodeId;
            
            
            if (!(instanceId in auroraCluster[connectionId][clusterId])) {
            
                var timeNow = new Date();
                
                auroraCluster[connectionId][clusterId][instanceId] = function(){};
                
                
                auroraCluster[connectionId][clusterId][instanceId]["connection"] = function(){};
                auroraCluster[connectionId][clusterId][instanceId]["connection"] = new postgresql({
                                                                                                        host: node.host,
                                                                                                        user: node.username,
                                                                                                        password: node.password,
                                                                                                        database: "postgres",
                                                                                                        port: node.port,
                                                                                                        max: 2,
                });
                
                auroraCluster[connectionId][clusterId][instanceId]["node"] = function(){};
                auroraCluster[connectionId][clusterId][instanceId]["node"] = new classMetric(
                                                                                                node.nodeUid,
                                                                                                node.nodeId,[
                                                                                                                {name : "cpu", history : 20 },
                                                                                                                {name : "memory", history : 20 },
                                                                                                                {name : "ioreads", history : 20 },
                                                                                                                {name : "iowrites", history : 20 },
                                                                                                                {name : "netin", history : 20 },
                                                                                                                {name : "netout", history : 20 },
                                                                                                                {name : "xactTotal", history: 20 },
                                                                                                                {name : "xactCommit", history: 20 },
                                                                                                                {name : "xactRollback", history: 20 },
                                                                                                                {name : "tupReturned", history: 20 },
                                                                                                                {name : "tupFetched", history: 20 },
                                                                                                                {name : "tupInserted", history: 20 },
                                                                                                                {name : "tupDeleted", history: 20 },
                                                                                                                {name : "tupUpdated", history: 20 },
                                                                                                                {name : "numbackends", history: 20 },
                                                                                                                {name : "numbackendsActive", history: 20 },
                                                                                                                {name : "network", history: 20 },
                                                                                                                {name : "iops", history: 20 },
                                                                                                                {name : "tuples", history: 20 }
                                                                                                            ]
                                                                        );
                
                
                auroraCluster[connectionId][clusterId][instanceId]["property"] = function(){};
                auroraCluster[connectionId][clusterId][instanceId]["property"] = { 
                                                                                            instanceId: node.nodeId, 
                                                                                            resourceId : node.resourceId, 
                                                                                            monitoring : node.monitoring, 
                                                                                            size : node.size,
                                                                                            az : node.az,
                                                                                            status : node.status,
                                                                                            role : node.role, 
                                                                                            timestamp : ""
                }
                    
                auroraCluster[connectionId][clusterId][instanceId]["node"].newSnapshot(nodeTypeAuroraPostgreSQL,timeNow.getTime());
                
                console.log("Aurora Postgresql Instance Connected : " + node.connectionId + " # " + node.clusterId + " # " + node.nodeId );
                

            }
            else {
                console.log("Re-using - Aurora Postgresql  Instance connection : " +  node.connectionId + " # " + node.clusterId + " # " + node.nodeId );
                
            }
    
        
    }
    catch (error) {
        console.log(error)
        
    }
   
    
}


//---+++ POSTGRESQL : CLUSTER : Request Update Stats per Cluster
app.get("/api/aurora/postgresql/cluster/stats/update", updateStatsAuroraClusterPostgresql);
async function updateStatsAuroraClusterPostgresql(req, res) {
 
        try
            {
                var params = req.query;
                
                var nodes = auroraCluster["$" + params.connectionId]["$" + params.clusterId];
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster"  && nodeId != "property" ){
                            updateStatsAuoraPostgresqlNode("$" + params.connectionId, "$" + params.clusterId, nodeId, nodes[nodeId]['property']['resourceId'], nodes[nodeId]['property']['monitoring'] );
                        }
                       
                }
                
                res.status(200).send( {"result":"Cluster Update Stats Requested"});
                
        }
        catch(err){
                console.log(err);
        }
        
}

async function updateStatsAuoraPostgresqlNode(connectionId,clusterId,nodeId, resourceId, monitoring) {
    
    try
    {
            var timeNow = new Date();
            var sql_statement = `
                                        SELECT 
                                            SUM(numbackends) as numbackends,
                                            SUM(tup_returned) as tup_returned, 
                                            SUM(tup_fetched) as tup_fetched, 
                                            SUM(tup_inserted) as tup_inserted,
                                            SUM(tup_updated) as tup_updated,
                                            SUM(tup_deleted) as tup_deleted, 
                                            SUM(blk_read_time) as blk_read_time, 
                                            SUM(blk_write_time) as blk_write_time, 
                                            SUM(xact_commit) as xact_commit, 
                                            SUM(xact_rollback) as xact_rollback,
                                            (select count(*) from pg_stat_activity where pid <> pg_backend_pid() and state = \'active\' ) numbackendsactive
                                        FROM pg_stat_database
                                `;
            
            
            var currentOperations = await auroraCluster[connectionId][clusterId][nodeId]["connection"].query(sql_statement);
            currentOperations=currentOperations.rows[0];
            
            //-- OS Metrics
            const osMetrics = await gatherAuroraOsMetrics({ resourceId : resourceId, instanceId : nodeId.substring(1), monitoring : monitoring });
            
            auroraCluster[connectionId][clusterId][nodeId]["node"].newSnapshot({
                                                                                        cpu: osMetrics.cpu,
                                                                                        cpuTimestamp: osMetrics.cpuTimestamp,
                                                                                        memory: osMetrics.memory,
                                                                                        memoryTimestamp: osMetrics.memoryTimestamp,
                                                                                        ioreads: osMetrics.ioreads,
                                                                                        ioreadsTimestamp: osMetrics.ioreadsTimestamp,
                                                                                        iowrites: osMetrics.iowrites,
                                                                                        iowritesTimestamp: osMetrics.iowritesTimestamp,
                                                                                        netin: osMetrics.netin,
                                                                                        netinTimestamp: osMetrics.netinTimestamp,
                                                                                        netout: osMetrics.netout,
                                                                                        netoutTimestamp: osMetrics.netoutTimestamp,
                                                                                        xactTotal: currentOperations['xact_commit'] + currentOperations['xact_rollback'],
                                                                                        xactCommit: currentOperations['xact_commit'],
                                                                                        xactRollback: currentOperations['xact_rollback'],
                                                                                        tupReturned: currentOperations['tup_returned'],
                                                                                        tupFetched: currentOperations['tup_fetched'],
                                                                                        tupInserted: currentOperations['tup_inserted'],
                                                                                        tupDeleted: currentOperations['tup_deleted'],
                                                                                        tupUpdated: currentOperations['tup_updated'],
                                                                                        numbackends : parseFloat(currentOperations['numbackends']),
                                                                                        numbackendsActive : parseFloat(currentOperations['numbackendsactive']),
                                                                                    
                                                                                },
                                                                                timeNow.getTime());
            
            auroraCluster[connectionId][clusterId][nodeId]["property"]["timestamp"] =  osMetrics.timestamp;
            
          
          
            
    }
    catch(err){
                console.log(err);
    }
                
}
                


async function gatherAuroraOsMetrics(node){
    
    var nodeMetrics = { 
                        cpu : 0, 
                        cpuTimestamp : "",
                        memory : 0, 
                        memoryTimestamp : "",
                        ioreads : 0, 
                        ioreadsTimestamp : "",
                        iowrites : 0, 
                        iowritesTimestamp : "",
                        netin : 0,
                        netinTimestamp : "",
                        netout : 0,
                        netoutTimestamp : "",
                        timestamp : ""
    };
    
    try {
            //-- OS Metrics
            if ( node.monitoring == "em") {
                
                    var params_logs = {
                        logStreamName: node.resourceId,
                        limit: '1',
                        logGroupName: 'RDSOSMetrics',
                        startFromHead: false
                    };
                
                    var data = await cloudwatchlogs.getLogEvents(params_logs).promise();
                    
                    var message=JSON.parse(data.events[0].message);
                            
                    nodeMetrics.cpu = message.cpuUtilization.total;
                    nodeMetrics.cpuTimestamp = message.timestamp;
                    nodeMetrics.memory = message.memory.free;
                    nodeMetrics.memoryTimestamp = message.timestamp;
                    nodeMetrics.ioreads = message.diskIO[0].readIOsPS + message.diskIO[1].readIOsPS;
                    nodeMetrics.ioreadsTimestamp = message.timestamp;
                    nodeMetrics.iowrites = message.diskIO[0].writeIOsPS + message.diskIO[1].writeIOsPS;
                    nodeMetrics.iowritesTimestamp = message.timestamp;
                    nodeMetrics.netin = message.network[0].rx;
                    nodeMetrics.netinTimestamp = message.timestamp;
                    nodeMetrics.netout = message.network[0].tx;
                    nodeMetrics.netoutTimestamp = message.timestamp;
                    nodeMetrics.timestamp = message.timestamp;  
                        
            }
            else {
                
                    //-- Gather Metrics from CloudWatch
                
                    var dimension = [ { Name: "DBInstanceIdentifier", Value: node.instanceId } ];
                    var metrics = [{
                                        namespace : "AWS/RDS",
                                        metric : "CPUUtilization",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/RDS",
                                        metric : "FreeableMemory",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/RDS",
                                        metric : "ReadIOPS",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/RDS",
                                        metric : "WriteIOPS",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/RDS",
                                        metric : "NetworkReceiveThroughput",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/RDS",
                                        metric : "NetworkTransmitThroughput",
                                        dimension : dimension
                                    },
                                ];
          
                    var dataQueries = [];
                    var queryId = 0;
                    metrics.forEach(function(item) {
                        
                        dataQueries.push({
                                Id: "m0" + String(queryId),
                                MetricStat: {
                                    Metric: {
                                        Namespace: item.namespace,
                                        MetricName: item.metric,
                                        Dimensions: item.dimension
                                    },
                                    Period: "60",
                                    Stat: "Average"
                                },
                                Label: item.metric
                        });
                        
                        queryId++;
                        
                    });
                    
                    var d_end_time = new Date();
                    var d_start_time = new Date(d_end_time - ((3*1) * 60000) );
                    var queryClw = {
                        MetricDataQueries: dataQueries,
                        "StartTime": d_start_time,
                        "EndTime": d_end_time
                    };
                   
                    var data = await cloudwatch.getMetricData(queryClw).promise();
                    
                    data.MetricDataResults.forEach(function(item) {
                            
                                    switch(item.Label){
                                        
                                        case "CPUUtilization":
                                                nodeMetrics.cpu = item.Values[0];
                                                nodeMetrics.cpuTimestamp = String(item.Timestamps[0]);
                                                break;
                                        
                                        case "FreeableMemory":
                                                nodeMetrics.memory = item.Values[0];
                                                nodeMetrics.memoryTimestamp = String(item.Timestamps[0]);
                                                break;
                                                
                                        case "ReadIOPS":
                                                nodeMetrics.ioreads = item.Values[0];
                                                nodeMetrics.ioreadsTimestamp = String(item.Timestamps[0]);
                                                break;
                                        
                                        case "WriteIOPS":
                                                nodeMetrics.iowrites = item.Values[0];
                                                nodeMetrics.iowritesTimestamp = String(item.Timestamps[0]);
                                                break;
                                                
                                        case "NetworkReceiveThroughput":
                                                nodeMetrics.netin = item.Values[0];
                                                nodeMetrics.netinTimestamp = String(item.Timestamps[0]);
                                                break;
                                                
                                        case "NetworkTransmitThroughput":
                                                nodeMetrics.netout = item.Values[0];
                                                nodeMetrics.netoutTimestamp = String(item.Timestamps[0]);
                                                break;
                                            
                                            
                                            
                                    }
                                    nodeMetrics.timestamp = item.Timestamps[0];
                                    
                                
                    });
                            
            }
    }
    catch(err){
        
        console.log(err);
        
    }
    
    return nodeMetrics;
    
        
}


//---+++ POSTGRESQL : CLUSTER : Request Stats per Cluster
app.get("/api/aurora/postgresql/cluster/stats/gather", gatherStatsAuroraClusterPostgresql);
async function gatherStatsAuroraClusterPostgresql(req, res) {
 
        try
            {
                
                var params = req.query;
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = auroraCluster[connectionId][clusterId];
                var clusterInfo = {
                                    cpu: 0,
                                    memory: 0,
                                    ioreads: 0,
                                    iowrites: 0,
                                    netin: 0,
                                    netout: 0,
                                    xactTotal: 0,
                                    xactCommit: 0,
                                    xactRollback: 0,
                                    tupReturned: 0,
                                    tupFetched: 0,
                                    tupDeleted: 0,
                                    tupInserted: 0,
                                    tupUpdated: 0,
                                    numbackends : 0,
                                    numbackendsActive : 0,
                                    network : 0,
                                    iops : 0
                                
                };
                
                var timestampValues = [];
                var nodesInfo = [];
                var totalNodes = 0;
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster" && nodeId != "property" ) {
                            
                                
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('cpu',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpu"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpuTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('memory',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memory"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memoryTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('ioreads',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreadsTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('iowrites',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowritesTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('netin',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netinTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('netout',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netoutTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('network',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netoutTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('iops',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowritesTimestamp"));
                            
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('numbackends',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("numbackends"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('numbackendsActive',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("numbackendsActive"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('xactTotal',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactCommit") + auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactRollback"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('xactCommit',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactCommit"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('xactRollback',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactRollback"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('tupReturned',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupReturned"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('tupFetched',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupFetched"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('tupInserted',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupInserted"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('tupDeleted',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupDeleted"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('tupUpdated',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupUpdated"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('tuples',
                                                                                                              auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupFetched") + 
                                                                                                              auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupInserted") +
                                                                                                              auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupDeleted") +
                                                                                                              auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupUpdated")
                                                                                                    );
                            
                            
                            
                            var nodeStats = {
                                    name : auroraCluster[connectionId][clusterId][nodeId]["property"]["instanceId"],
                                    monitoring : auroraCluster[connectionId][clusterId][nodeId]["property"]["monitoring"],
                                    role : auroraCluster[connectionId][clusterId][nodeId]["property"]["role"],
                                    size : auroraCluster[connectionId][clusterId][nodeId]["property"]["size"],
                                    az : auroraCluster[connectionId][clusterId][nodeId]["property"]["az"],
                                    status : auroraCluster[connectionId][clusterId][nodeId]["property"]["status"],
                                    nodeId : auroraCluster[connectionId][clusterId][nodeId]["node"].getObjectId(),
                                    cpu : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpu"),
                                    memory : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memory"),
                                    ioreads : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"),
                                    iowrites : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"),
                                    netin : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"),
                                    netout : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"),
                                    network : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"),
                                    iops : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"),
                                    xactTotal: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactCommit") + auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactRollback"),
                                    xactCommit: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactCommit"),
                                    xactRollback: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("xactRollback"),
                                    tupReturned: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupReturned"),
                                    tupFetched: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupFetched"),
                                    tupDeleted: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupDeleted"),
                                    tupInserted: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupInserted"),
                                    tupUpdated: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("tupUpdated"),
                                    numbackends : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("numbackends"),
                                    numbackendsActive : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("numbackendsActive"),
                                    history : {
                                            cpu : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('cpu'),
                                            memory : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('memory'),
                                            ioreads : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('ioreads'),
                                            iowrites : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('iowrites'),
                                            netin : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netin'),
                                            netout : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netout'),
                                            xactTotal: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('xactTotal'),
                                            xactCommit: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('xactCommit'),
                                            xactRollback: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('xactRollback'),
                                            tupReturned: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('tupReturned'),
                                            tupFetched: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('tupFetched'),
                                            tupDeleted: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('tupDeleted'),
                                            tupInserted: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('tupInserted'),
                                            tupUpdated: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('tupUpdated'),
                                            numbackends : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('numbackends'),
                                            numbackendsActive : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('numbackendsActive'),
                                            network : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('network'),
                                            iops : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('iops'),
                                            tuples : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('tuples'),
                                            
                                    }
                            };
                            
                            
                            if ( auroraCluster[connectionId][clusterId][nodeId]["node"].getObjectId() >= params.beginItem &&  auroraCluster[connectionId][clusterId][nodeId]["node"].getObjectId() < params.endItem )
                                nodesInfo.push(nodeStats);
                            
                            clusterInfo.cpu = clusterInfo.cpu +  nodeStats.cpu;
                            clusterInfo.memory = clusterInfo.memory +  nodeStats.memory;
                            clusterInfo.ioreads = clusterInfo.ioreads +  nodeStats.ioreads;
                            clusterInfo.iowrites = clusterInfo.iowrites +  nodeStats.iowrites;
                            clusterInfo.netin = clusterInfo.netin +  nodeStats.netin;
                            clusterInfo.netout = clusterInfo.netout +  nodeStats.netout;
                            
                            clusterInfo.xactTotal = clusterInfo.xactTotal +  nodeStats.xactTotal;
                            clusterInfo.xactCommit = clusterInfo.xactCommit +  nodeStats.xactCommit;
                            clusterInfo.xactRollback = clusterInfo.xactRollback +  nodeStats.xactRollback;
                            clusterInfo.tupReturned = clusterInfo.tupReturned +  nodeStats.tupReturned;
                            clusterInfo.tupFetched = clusterInfo.tupFetched +  nodeStats.tupFetched;
                            clusterInfo.tupDeleted = clusterInfo.tupDeleted +  nodeStats.tupDeleted;
                            clusterInfo.tupInserted = clusterInfo.tupInserted +  nodeStats.tupInserted;
                            clusterInfo.tupUpdated = clusterInfo.tupUpdated +  nodeStats.tupUpdated;
                            clusterInfo.numbackends = clusterInfo.numbackends +  nodeStats.numbackends;
                            clusterInfo.numbackendsActive = clusterInfo.numbackendsActive +  nodeStats.numbackendsActive;
                            clusterInfo.network = clusterInfo.network +  nodeStats.network;
                            clusterInfo.iops = clusterInfo.iops +  nodeStats.iops;
                            
                            timestampValues.push(String(auroraCluster[connectionId][clusterId][nodeId]["property"]["timestamp"]));
                            
                            totalNodes++;
                            
                        }
                        
                       
                }
                
                clusterInfo.cpu = clusterInfo.cpu / totalNodes;
                clusterInfo.memory = clusterInfo.memory / totalNodes;
                
                //if ( timestampEqual(timestampValues) && (auroraCluster[connectionId][clusterId]["property"]["timestamp"] != timestampValues[0] ) ){
            
                    //auroraCluster[connectionId][clusterId]["property"]["timestamp"] = timestampValues[0];
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('cpu',clusterInfo.cpu);
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('memory',clusterInfo.memory);
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('ioreads',clusterInfo.ioreads);
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('iowrites',clusterInfo.iowrites);
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('netin',clusterInfo.netin);
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('netout',clusterInfo.netout);
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('network',clusterInfo.network);
                    auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('iops',clusterInfo.iops);
        
                //}   
                
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('xactTotal',clusterInfo.xactTotal);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('xactCommit',clusterInfo.xactCommit);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('xactRollback',clusterInfo.xactRollback);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('tupReturned',clusterInfo.tupReturned);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('tupFetched',clusterInfo.tupFetched);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('tupDeleted',clusterInfo.tupDeleted);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('tupInserted',clusterInfo.tupInserted);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('tupUpdated',clusterInfo.tupUpdated);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('numbackends',clusterInfo.numbackends);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('numbackendsActive', clusterInfo.numbackendsActive);

                
                res.status(200).send( { 
                                        cluster : {
                                                    ...clusterInfo,
                                                    history : {
                                                                cpu: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('cpu'),
                                                                memory: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('memory'),
                                                                ioreads: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('ioreads'),
                                                                iowrites: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('iowrites'),
                                                                netin: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('netin'),
                                                                netout: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('netout'),
                                                                network: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('network'),
                                                                iops: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('iops'),
                                                                xactTotal: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('xactTotal'),
                                                                xactCommit: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('xactCommit'),
                                                                xactRollback: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('xactRollback'),
                                                                tupReturned: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('tupReturned'),
                                                                tupFetched: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('tupFetched'),
                                                                tupDeleted: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('tupDeleted'),
                                                                tupInserted: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('tupInserted'),
                                                                tupUpdated: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('tupUpdated'),
                                                                numbackends : auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('numbackends'),
                                                                numbackendsActive : auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('numbackendsActive')
                                    
                                                    }
                                        },
                                        nodes : nodesInfo 
                });
                
        }
        catch(err){
                console.log(err);
        }
}



//---+++ POSTGRESQL : CLUSTER : API Execute SQL Query per Node
app.get("/api/aurora/postgresql/cluster/sql/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });


    // API Call
    var params = req.query;
    try {
        
        var connectionId =  "$" + standardToken.session_id;
        var clusterId = "$" + params.clusterId;
        var instanceId = "$" + params.instanceId;
    
        auroraCluster[connectionId][clusterId][instanceId]["connection"].query(params.sql_statement, (err,result)=>{
                        if(err) {
                            console.log(err)
                            res.status(404).send(err);
                        } 
                        else
                        {
                            res.status(200).send(result);
                         }
                        
                }
            );   

           
    } catch(error) {
        console.log(error)
                
    }

});




//---+++ POSTGRESQL : CLUSTER : Close Connection per cluster node
app.get("/api/aurora/postgresql/cluster/connection/close/", (req,res)=>{
    
    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    var params = req.query;
    
    try
        {
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = auroraCluster[connectionId][clusterId];
                
                for (let nodeId of Object.keys(nodes)) {
                        try {
                                    if (nodeId != "cluster"  && nodeId != "property" ) {
                                        console.log("Aurora Postgresql Disconnection  : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                                        nodes[nodeId]["connection"].end();
                                    }
                            }
                        catch{
                              console.log("Aurora Postgresql Disconnection error : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                          }
                        
                }
                
                delete auroraCluster[params.connectionId];
                res.status(200).send( {"result":"disconnected"});
                
                
        }
        catch(err){
                console.log(err);
    }
    
    
})






//--#################################################################################################### 
//   ---------------------------------------- MYSQL
//--#################################################################################################### 


//--++ MYSQL : STANDALONE : Create Connection
function mysqlOpenConnection(session_id,host,port,user,password){

    db[session_id]  = mysql.createPool({
            host: host,
            user: user,
            password: password,
            database: "",
            //acquireTimeout: 3000,
            port: port,
            connectionLimit:2
    })

    console.log("Mysql Connection opened for session_id : " + session_id);

}



//--++ MYSQL : STANDALONE : API Execute SQL Query
app.get("/api/mysql/sql/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    // API Call
    var params = req.query;

    try {
        
        db[standardToken.session_id].query(params.sql_statement, (err,result)=>{
                        if(err) {
                            console.log(err)
                            res.status(404).send(err);
                        } 
                        else
                        {
                            res.status(200).send(result);
                         }
                        
                }
            );   

           
    } catch(error) {
        console.log(error)
                
    }

});



//---+++ MYSQL : CLUSTER : Open Connection - Aurora Cluster  
app.post("/api/aurora/mysql/cluster/connection/open/", openAuroraMysqlConnectionCluster);
async function openAuroraMysqlConnectionCluster(req, res) {
 
    var params = req.body.params;
    
    try {
        
        
            // Gather Roles
            var parameterCluster = {
                DBClusterIdentifier: params.clusterId,
                MaxRecords: 100
            };

            var clusterData = await rds.describeDBClusters(parameterCluster).promise();
            var roleType = [];
            
            clusterData['DBClusters'][0]['DBClusterMembers'].forEach(function(instance) {
                roleType[instance['DBInstanceIdentifier']] =  ( String(instance['IsClusterWriter']) == "true" ? "P" : "R" );
            });
            
            
            // Gather Instances
            var parameter = {
                MaxRecords: 100,
                Filters: [
                        {
                          Name: 'db-cluster-id',
                          Values: [params.clusterId]
                        },
                ],
            };
            
            var data = await rds.describeDBInstances(parameter).promise();
            var nodeList = "";
            
            if (data.DBInstances.length> 0) {
                            
                           
                            var clusterNodes = data.DBInstances;
                             
                            var nodeList = [];
                            var nodeUid = 0;
                       
                            clusterNodes.forEach(function(node) {
                                
                                openAuroraMysqlConnectionNode({
                                                                connectionId : params.connectionId,
                                                                clusterId: params.clusterId,
                                                                nodeId : node['DBInstanceIdentifier'],
                                                                host : node['Endpoint']['Address'],
                                                                port : node['Endpoint']['Port'],
                                                                username: params.username,
                                                                password: params.password,
                                                                nodeUid : nodeUid,
                                                                size : node['DBInstanceClass'],
                                                                az : node['AvailabilityZone'],
                                                                status : node['DBInstanceStatus'],
                                                                monitoring :  ( String(node['MonitoringInterval']) == "0" ? "clw" : "em" ),
                                                                resourceId : node['DbiResourceId'],
                                                                role : roleType[node['DBInstanceIdentifier']],
                                                });
                                
                               
                                                                
                                nodeList = nodeList +  node['DBInstanceIdentifier']  + "," 
                                nodeUid ++;
                                
                        
                            });
                            
                            
                            res.status(200).send({ data : "Connection Request Opened", nodes : nodeList.slice(0, -1)});
                            
                                    
                            
            }
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }

}


//---+++ MYSQL : CLUSTER : Open Connection - Aurora Node  
async function openAuroraMysqlConnectionNode(node){
    
    try {
            
            
            var connectionId = "$" + node.connectionId;
            var clusterId = "$" + node.clusterId;
            var instanceId = "$" + node.nodeId;
            
            
            if (!(instanceId in auroraCluster[connectionId][clusterId])) {
            
                var timeNow = new Date();
                
                auroraCluster[connectionId][clusterId][instanceId] = function(){};
                
                
                auroraCluster[connectionId][clusterId][instanceId]["connection"] = function(){};
                auroraCluster[connectionId][clusterId][instanceId]["connection"] =  mysql.createPool({
                                                                                            host: node.host,
                                                                                            user: node.username,
                                                                                            password: node.password,
                                                                                            database: "",
                                                                                            //acquireTimeout: 3000,
                                                                                            port: node.port,
                                                                                            connectionLimit:2
                                                                                    });
                
                
                auroraCluster[connectionId][clusterId][instanceId]["connectionPromise"] = function(){};
                auroraCluster[connectionId][clusterId][instanceId]["connectionPromise"] = auroraCluster[connectionId][clusterId][instanceId]["connection"].promise();
                
                
                
                auroraCluster[connectionId][clusterId][instanceId]["node"] = function(){};
                auroraCluster[connectionId][clusterId][instanceId]["node"] = new classMetric(
                                                                                                node.nodeUid,
                                                                                                node.nodeId,[
                                                                                                                { name: "cpu", history: 20 },
                                                                                                                { name: "memory", history: 20 },
                                                                                                                { name: "ioreads", history: 20 },
                                                                                                                { name: "iowrites", history: 20 },
                                                                                                                { name: "netin", history: 20 },
                                                                                                                { name: "netout", history: 20 },
                                                                                                                { name: "queries", history: 20 },
                                                                                                                { name: "questions", history: 20 },
                                                                                                                { name: "comSelect", history: 20 },
                                                                                                                { name: "comInsert", history: 20 },
                                                                                                                { name: "comDelete", history: 20 },
                                                                                                                { name: "comUpdate", history: 20 },
                                                                                                                { name: "comCommit", history: 20 },
                                                                                                                { name: "comRollback", history: 20 },
                                                                                                                { name: "threads", history: 20 },
                                                                                                                { name: "threadsRunning", history: 20 },
                                                                                                                {name : "network", history: 20 },
                                                                                                                {name : "iops", history: 20 }
                                                                                                            ]
                                                                        );
                
                
                auroraCluster[connectionId][clusterId][instanceId]["property"] = function(){};
                auroraCluster[connectionId][clusterId][instanceId]["property"] = { 
                                                                                            instanceId: node.nodeId, 
                                                                                            resourceId : node.resourceId, 
                                                                                            monitoring : node.monitoring, 
                                                                                            size : node.size,
                                                                                            az : node.az,
                                                                                            status : node.status,
                                                                                            role : node.role, 
                                                                                            timestamp : ""
                }
                    
                auroraCluster[connectionId][clusterId][instanceId]["node"].newSnapshot(
                                                                                        {
                                                                                            cpu: 0,
                                                                                            memory: 0,
                                                                                            ioreads: 0,
                                                                                            iowrites: 0,
                                                                                            netin: 0,
                                                                                            netout: 0,
                                                                                            queries: 0,
                                                                                            questions: 0,
                                                                                            comSelect: 0,
                                                                                            comInsert: 0,
                                                                                            comDelete: 0,
                                                                                            comUpdate: 0,
                                                                                            comCommit: 0,
                                                                                            comRollback : 0,
                                                                                            threads : 0,
                                                                                            threadsRunning : 0,
                                                                                        }
                                                                                        ,timeNow.getTime()
                );
                
                console.log("Aurora MySQL Instance Connected : " + node.connectionId + " # " + node.clusterId + " # " + node.nodeId );
                    
            }
            else {
                console.log("Re-using - Aurora MySQL Instance connection : " +  node.connectionId + " # " + node.clusterId + " # " + node.nodeId );
                
            }
    
        
    }
    catch (error) {
        console.log(error)
        
    }
   
    
}



//---+++ MYSQL : CLUSTER : Request Update Stats per Cluster
app.get("/api/aurora/mysql/cluster/stats/update", updateStatsAuroraClusterMysql);
async function updateStatsAuroraClusterMysql(req, res) {
 
        try
            {
                var params = req.query;
                
                var nodes = auroraCluster["$" + params.connectionId]["$" + params.clusterId];
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster"  && nodeId != "property" ){
                            updateStatsAuoraMysqlNode("$" + params.connectionId, "$" + params.clusterId, nodeId, nodes[nodeId]['property']['resourceId'], nodes[nodeId]['property']['monitoring'] );
                        }
                       
                }
                
                res.status(200).send( {"result":"Cluster Update Stats Requested"});
                
        }
        catch(err){
                console.log(err);
        }
        
}


async function updateStatsAuoraMysqlNode(connectionId,clusterId,nodeId, resourceId, monitoring) {
    
    try
    {
            var timeNow = new Date();
            var sql_statement = "SHOW GLOBAL STATUS";
            
            var currentOperations = await auroraCluster[connectionId][clusterId][nodeId]["connectionPromise"].query(sql_statement);
            currentOperations = convertArrayToObject(currentOperations[0],'Variable_name');
            
            //-- OS Metrics
            const osMetrics = await gatherAuroraOsMetrics({ resourceId : resourceId, instanceId : nodeId.substring(1), monitoring : monitoring });
            
            auroraCluster[connectionId][clusterId][nodeId]["node"].newSnapshot({
                                                                                        cpu: osMetrics.cpu,
                                                                                        cpuTimestamp: osMetrics.cpuTimestamp,
                                                                                        memory: osMetrics.memory,
                                                                                        memoryTimestamp: osMetrics.memoryTimestamp,
                                                                                        ioreads: osMetrics.ioreads,
                                                                                        ioreadsTimestamp: osMetrics.ioreadsTimestamp,
                                                                                        iowrites: osMetrics.iowrites,
                                                                                        iowritesTimestamp: osMetrics.iowritesTimestamp,
                                                                                        netin: osMetrics.netin,
                                                                                        netinTimestamp: osMetrics.netinTimestamp,
                                                                                        netout: osMetrics.netout,
                                                                                        netoutTimestamp: osMetrics.netoutTimestamp,
                                                                                        queries: currentOperations['Queries']['Value'],
                                                                                        questions: currentOperations['Questions']['Value'],
                                                                                        comSelect: currentOperations['Com_select']['Value'],
                                                                                        comInsert: currentOperations['Com_insert']['Value'],
                                                                                        comDelete: currentOperations['Com_delete']['Value'],
                                                                                        comUpdate: currentOperations['Com_update']['Value'],
                                                                                        comCommit: currentOperations['Com_commit']['Value'],
                                                                                        comRollback : currentOperations['Com_rollback']['Value'],
                                                                                        threads : parseFloat(currentOperations['Threads_connected']['Value']),
                                                                                        threadsRunning : parseFloat(currentOperations['Threads_running']['Value']),
                                                                     
                                                                                    
                                                                                },
                                                                                timeNow.getTime());
            
            auroraCluster[connectionId][clusterId][nodeId]["property"]["timestamp"] =  osMetrics.timestamp;
            
          
          
            
    }
    catch(err){
                console.log(err);
    }
                
}
                

//---+++ MYSQL : CLUSTER : Request Stats per Cluster
app.get("/api/aurora/mysql/cluster/stats/gather", gatherStatsAuroraClusterMysql);
async function gatherStatsAuroraClusterMysql(req, res) {
 
        try
            {
                
                var params = req.query;
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = auroraCluster[connectionId][clusterId];
                var clusterInfo = {
                                    cpu: 0,
                                    memory: 0,
                                    ioreads: 0,
                                    iowrites: 0,
                                    netin: 0,
                                    netout: 0,
                                    queries: 0,
                                    questions: 0,
                                    comSelect: 0,
                                    comInsert: 0,
                                    comDelete: 0,
                                    comUpdate: 0,
                                    comCommit: 0,
                                    comRollback : 0,
                                    threads : 0,
                                    threadsRunning : 0,
                                    network : 0,
                                    iops : 0
                                
                };
                
                var timestampValues = [];
                var nodesInfo = [];
                var totalNodes = 0;
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster" && nodeId != "property" ) {
                            
                                
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('cpu',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpu"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpuTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('memory',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memory"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memoryTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('ioreads',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreadsTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('iowrites',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowritesTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('netin',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netinTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('netout',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netoutTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('network',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netoutTimestamp"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('iops',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"), auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowritesTimestamp"));
                            
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('queries',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("queries"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('questions',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("questions"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('comSelect',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comSelect"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('comInsert',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comInsert"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('comDelete',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comDelete"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('comUpdate',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comUpdate"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('comCommit',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comCommit"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('comRollback',auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comRollback"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('threads',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("threads"));
                            auroraCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('threadsRunning',auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("threadsRunning"));
                            
                            
                            
                            var nodeStats = {
                                    name : auroraCluster[connectionId][clusterId][nodeId]["property"]["instanceId"],
                                    monitoring : auroraCluster[connectionId][clusterId][nodeId]["property"]["monitoring"],
                                    role : auroraCluster[connectionId][clusterId][nodeId]["property"]["role"],
                                    size : auroraCluster[connectionId][clusterId][nodeId]["property"]["size"],
                                    az : auroraCluster[connectionId][clusterId][nodeId]["property"]["az"],
                                    status : auroraCluster[connectionId][clusterId][nodeId]["property"]["status"],
                                    nodeId : auroraCluster[connectionId][clusterId][nodeId]["node"].getObjectId(),
                                    cpu : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpu"),
                                    memory : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memory"),
                                    ioreads : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"),
                                    iowrites : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"),
                                    netin : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"),
                                    netout : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"),
                                    network : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"),
                                    iops : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads") + auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"),
                                    
                                    queries: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("queries"),
                                    questions: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("questions"),
                                    comSelect: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comSelect"),
                                    comInsert: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comInsert"),
                                    comDelete: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comDelete"),
                                    comUpdate: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comUpdate"),
                                    comCommit: auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comCommit"),
                                    comRollback : auroraCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("comRollback"),
                                    threads : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("threads"),
                                    threadsRunning : auroraCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("threadsRunning"),
                                    history : {
                                            cpu : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('cpu'),
                                            memory : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('memory'),
                                            ioreads : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('ioreads'),
                                            iowrites : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('iowrites'),
                                            netin : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netin'),
                                            netout : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netout'),
                                            queries: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('queries'),
                                            questions: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('questions'),
                                            comSelect: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('comSelect'),
                                            comInsert: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('comInsert'),
                                            comDelete: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('comDelete'),
                                            comUpdate: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('comUpdate'),
                                            comCommit: auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('comCommit'),
                                            comRollback : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('comRollback'),
                                            threads : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('threads'),
                                            threadsRunning : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('threadsRunning'),
                                            network : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('network'),
                                            iops : auroraCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('iops'),
                                            
                                    }
                            };
                            
                            
                            if ( auroraCluster[connectionId][clusterId][nodeId]["node"].getObjectId() >= params.beginItem &&  auroraCluster[connectionId][clusterId][nodeId]["node"].getObjectId() < params.endItem )
                                nodesInfo.push(nodeStats);
                            
                            clusterInfo.cpu = clusterInfo.cpu +  nodeStats.cpu;
                            clusterInfo.memory = clusterInfo.memory +  nodeStats.memory;
                            clusterInfo.ioreads = clusterInfo.ioreads +  nodeStats.ioreads;
                            clusterInfo.iowrites = clusterInfo.iowrites +  nodeStats.iowrites;
                            clusterInfo.netin = clusterInfo.netin +  nodeStats.netin;
                            clusterInfo.netout = clusterInfo.netout +  nodeStats.netout;
                            
                            clusterInfo.queries  = clusterInfo.queries +  nodeStats.queries;
                            clusterInfo.questions  = clusterInfo.questions +  nodeStats.questions;
                            clusterInfo.comSelect  = clusterInfo.comSelect +  nodeStats.comSelect;
                            clusterInfo.comInsert = clusterInfo.comInsert +  nodeStats.comInsert;
                            clusterInfo.comDelete = clusterInfo.comDelete +  nodeStats.comDelete;
                            clusterInfo.comUpdate = clusterInfo.comUpdate +  nodeStats.comUpdate;
                            clusterInfo.comCommit = clusterInfo.comCommit +  nodeStats.comCommit;
                            clusterInfo.comRollback  = clusterInfo.comRollback +  nodeStats.comRollback;
                            clusterInfo.threads = clusterInfo.threads +  nodeStats.threads;
                            clusterInfo.threadsRunning = clusterInfo.threadsRunning +  nodeStats.threadsRunning;
                                        
                            clusterInfo.network = clusterInfo.network +  nodeStats.network;
                            clusterInfo.iops = clusterInfo.iops +  nodeStats.iops;
                            
                            timestampValues.push(String(auroraCluster[connectionId][clusterId][nodeId]["property"]["timestamp"]));
                            
                            totalNodes++;
                            
                        }
                        
                       
                }
                
                clusterInfo.cpu = clusterInfo.cpu / totalNodes;
                clusterInfo.memory = clusterInfo.memory / totalNodes;
                
                //if ( timestampEqual(timestampValues) && (auroraCluster[connectionId][clusterId]["property"]["timestamp"] != timestampValues[0] ) ){
                //auroraCluster[connectionId][clusterId]["property"]["timestamp"] = timestampValues[0];
                //}   
                
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('cpu',clusterInfo.cpu);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('memory',clusterInfo.memory);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('ioreads',clusterInfo.ioreads);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('iowrites',clusterInfo.iowrites);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('netin',clusterInfo.netin);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('netout',clusterInfo.netout);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('network',clusterInfo.network);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('iops',clusterInfo.iops);
    
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('queries',clusterInfo.queries);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('questions',clusterInfo.questions);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('comSelect',clusterInfo.comSelect);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('comInsert',clusterInfo.comInsert);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('comDelete',clusterInfo.comDelete);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('comUpdate',clusterInfo.comUpdate);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('comCommit',clusterInfo.comCommit);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('comRollback',clusterInfo.comRollback);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('threads',clusterInfo.threads);
                auroraCluster[connectionId][clusterId]["cluster"].addPropertyValue('threadsRunning',clusterInfo.threadsRunning);
                
                res.status(200).send( { 
                                        cluster : {
                                                    ...clusterInfo,
                                                    history : {
                                                                cpu: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('cpu'),
                                                                memory: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('memory'),
                                                                ioreads: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('ioreads'),
                                                                iowrites: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('iowrites'),
                                                                netin: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('netin'),
                                                                netout: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('netout'),
                                                                network: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('network'),
                                                                iops: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('iops'),
                                                                queries: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('queries'),
                                                                questions: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('questions'),
                                                                comSelect: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('comSelect'),
                                                                comInsert: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('comInsert'),
                                                                comDelete: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('comDelete'),
                                                                comUpdate: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('comUpdate'),
                                                                comCommit: auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('comCommit'),
                                                                comRollback : auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('comRollback'),
                                                                threads : auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('threads'),
                                                                threadsRunning : auroraCluster[connectionId][clusterId]["cluster"].getPropertyValues('threadsRunning'),
                                    
                                                    }
                                        },
                                        nodes : nodesInfo 
                });
                
        }
        catch(err){
                console.log(err);
        }
}




const convertArrayToObject = (array, key) => 
      array.reduce((acc, curr) =>(acc[curr[key]] = curr, acc), {});
    
    


//---+++ MYSQL : CLUSTER : API Execute SQL Query per Node
app.get("/api/aurora/mysql/cluster/sql/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });


    // API Call
    var params = req.query;
    try {
        
        var connectionId =  "$" + standardToken.session_id;
        var clusterId = "$" + params.clusterId;
        var instanceId = "$" + params.instanceId;
    
        auroraCluster[connectionId][clusterId][instanceId]["connection"].query(params.sql_statement, (err,result)=>{
                        if(err) {
                            console.log(err)
                            res.status(404).send(err);
                        } 
                        else
                        {
                            res.status(200).send(result);
                         }
                        
                }
            );   

           
    } catch(error) {
        console.log(error)
                
    }

});



//---+++ MYSQL : CLUSTER : Close Connection per cluster node
app.get("/api/aurora/mysql/cluster/connection/close/", (req,res)=>{
    
    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    var params = req.query;
    
    try
        {
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = auroraCluster[connectionId][clusterId];
                
                for (let nodeId of Object.keys(nodes)) {
                        try {
                                    if (nodeId != "cluster"  && nodeId != "property" ) {
                                        console.log("Aurora Mysql Disconnection  : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                                        nodes[nodeId]["connection"].end();
                                    }
                            }
                        catch{
                              console.log("Aurora Mysql Disconnection error : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                          }
                        
                }
                
                delete auroraCluster[params.connectionId];
                res.status(200).send( {"result":"disconnected"});
                
                
        }
        catch(err){
                console.log(err);
    }
    
    
})



//--#################################################################################################### 
//   ---------------------------------------- ORACLE
//--#################################################################################################### 



app.get('/api/oracle/sql/', function (req, res) {

    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    // API Call
    var params = req.query;
    db[standardToken.session_id].execute(params.sql_statement, (err,result)=>{
                    if(err) {
                        console.log(err)
                        res.status(404).send(err);
                    } 
                    else {
                        return res.status(200).send({ rows : result.rows, metadata : result.metaData });
                    }

            }
    );   

})

// ORACLE : Create Connection
async function oracleOpenConnection(session_id,host,port,user,password,instance){

    try {
         db[session_id] = await oracle.getConnection({
                    user: user,
                    password: password,
                    connectString: host + ":" + port + "/" + instance
                    });
     } 
    catch (err) {
        console.log(err.message);
    } 
    console.log("Oracle Connection opened for session_id : " + session_id);

}


//--#################################################################################################### 
//   ---------------------------------------- REDIS
//--#################################################################################################### 


// REDIS : Auth Connection
app.post("/api/redis/connection/auth/", authRedisConnection);

async function authRedisConnection(req, res) {
 

    var params = req.body.params;

    try {
        
            
                    var options = {};
                    var protocol = "redis://";
                    
                    if ( params.ssl == "required" )
                        protocol = "rediss://";
    
                    switch (params.auth){
                        
                        case "modeIam" :
                        case "modeNonAuth":
                        case "modeOpen":
                                options = {
                                        url: protocol + params.host + ":" + params.port,
                                        socket : { reconnectStrategy : false},
                                        
                                };
                                break;
                                
                                
                        
                        case "modeAuth":
                        
                                options = {
                                        url: protocol + params.host + ":" + params.port,
                                        password : params.password,
                                        socket : { reconnectStrategy : false},
                                        
                                };
                                break;
                
                        case "modeRbac" :
                        case "modeAcl" :
                                
                                options = {
                                        url: protocol + params.username + ":" + params.password + "@" + params.host + ":" + params.port,
                                        socket : { reconnectStrategy : false},
                                        
                                };
                                break;
                        
                    }
                    
                    
                    var dbconnection = redis.createClient(options);
                    dbconnection.on('error', err => {       
                              console.log(err.message);
                    });   
                
                    var session_id=uuid.v4();
                    var token = generateToken({ session_id: session_id});
                    await dbconnection.connect();
                    var command = await dbconnection.info();
                    dbRedis["$" + session_id] = {}
                    dbRedisCluster["$" + session_id] = {}
                    dbRedisCluster["$" + session_id][ "$" + params.cluster] = {};
                    dbRedisCluster["$" + session_id][ "$" + params.cluster]["cluster"] = new classMetric(
                                                                                                            0,
                                                                                                            "cluster",[
                                                                                                                {name : "operations", history : 20 },
                                                                                                                {name : "getCalls", history : 20 },
                                                                                                                {name : "setCalls", history : 20 },
                                                                                                                {name : "getLatency", history : 20 },
                                                                                                                {name : "setLatency", history : 20 },
                                                                                                                {name : "keyspaceHits", history : 20 },
                                                                                                                {name : "keyspaceMisses", history : 20 }
                                                                                                            ]
                                                                                            ) ;
                    dbconnection.quit();
                    res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
                   
                   
      } catch (error) {
        console.log(error);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }
    
    
}


// REDIS : Open Connection - ElastiCache Cluster
app.post("/api/redis/elasticache/cluster/connection/open/", openRedisElasticConnectionCluster);
async function openRedisElasticConnectionCluster(req, res) {
 
    var params = req.body.params;
    
    try {
        
             var parameter = {
                      MaxRecords: 100,
                      ReplicationGroupId: params.clusterId
                    };
                    
            var data = await elasticache.describeReplicationGroups(parameter).promise();
            var nodeList = "";
            
            
            if (data.ReplicationGroups.length> 0) {
                            
                            var rg = data.ReplicationGroups[0];
                            
                            var nodePort;
                            var clusterEndpoint;
                            var nodeUid = 0;
                            //-- Cluster Enable Mode
                            
                            if( rg['ClusterEnabled'] == true ){
                            
                                nodePort = rg.ConfigurationEndpoint.Port;
                                clusterEndpoint = rg.ConfigurationEndpoint.Address;
                                var clusterUid = clusterEndpoint.split('.');
                                rg.NodeGroups.forEach(function(nodeGroup) {
                                             nodeGroup.NodeGroupMembers.forEach(function(nodeItem) {
                                                var endPoint = "";
                                                if (clusterUid[0] == "clustercfg" )
                                                    endPoint = nodeItem.CacheClusterId + "." + rg.ReplicationGroupId +  "." + clusterUid[2] + "."  + clusterUid[3] + "." + clusterUid[4] + "." + clusterUid[5] + "." + clusterUid[6];
                                                
                                                if (clusterUid[2] == "clustercfg" )
                                                    endPoint = nodeItem.CacheClusterId + "." + clusterUid[1] + "." + nodeItem.CacheNodeId + "." + clusterUid[3] + "." + clusterUid[4] + "." + clusterUid[5] + "." + clusterUid[6];
                                                
                                                    
                                                 openRedisConnectionNode({
                                                                connectionId : params.connectionId,
                                                                clusterId: params.clusterId,
                                                                username: params.username,
                                                                password: params.password,
                                                                auth: params.auth,
                                                                ssl : params.ssl,
                                                                nodeId : nodeItem.CacheClusterId,
                                                                endPoint : endPoint,
                                                                port : nodePort,
                                                                nodeUid : nodeUid,
                                                                nodeType : rg['CacheNodeType']
                                                                });
                                                
                                                nodeUid ++;
                                                nodeList = nodeList + ( nodeItem.CacheClusterId + "|" + nodeItem.CacheNodeId) + "," 
                                                 
                                             });
                                            
                                });
                            }
                            else{
                                
                                rg.NodeGroups.forEach(function(nodeGroup) {
                                    
                                             
                                            nodePort = nodeGroup['PrimaryEndpoint']['Port'];
                                            clusterEndpoint = nodeGroup['PrimaryEndpoint']['Address'];
                                
                                            nodeGroup.NodeGroupMembers.forEach(function(nodeItem) {
                               
                                                 openRedisConnectionNode({
                                                                connectionId : params.connectionId,
                                                                clusterId: params.clusterId,
                                                                username: params.username,
                                                                password: params.password,
                                                                auth: params.auth,
                                                                ssl : params.ssl,
                                                                nodeId : nodeItem.CacheClusterId,
                                                                endPoint : nodeItem['ReadEndpoint']['Address'],
                                                                port : nodePort,
                                                                nodeUid : nodeUid,
                                                                nodeType : rg['CacheNodeType']
                                                                });
                                                
                                                nodeUid++;
                                                nodeList = nodeList + ( nodeItem.CacheClusterId + "|" + nodeItem.CacheNodeId) + "," 
                                                 
                                                 
                                             });
                                            
                                });
                                
                            }
                            
                            res.status(200).send({ data : "Connection Request Opened", nodes : nodeList.slice(0, -1)});
                            
                            
            }
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
    
    
    
    
    
    
}

// REDIS : Open Connection - MemoryDB Cluster 
app.post("/api/redis/memorydb/cluster/connection/open/", openRedisMemoryDBConnectionCluster);
async function openRedisMemoryDBConnectionCluster(req, res) {
 
    var params = req.body.params;
    
    try {
        
            var parameter = {
                  ClusterName: params.clusterId,
                  ShowShardDetails: true
            };
            
            var data = await memorydb.describeClusters(parameter).promise();
            var nodeList = "";
            
            if (data.Clusters.length> 0) {
                            
                            var rg = data.Clusters[0];
                    
                            var nodePort = rg['ClusterEndpoint']['Port'];
                            var nodeUid = 0;
                            
                            rg['Shards'].forEach(function(shard) {
                                
                                    shard['Nodes'].forEach(function(node) {
                                        
                                        openRedisConnectionNode({
                                                                connectionId : params.connectionId,
                                                                clusterId: params.clusterId,
                                                                username: params.username,
                                                                password: params.password,
                                                                auth: params.auth,
                                                                ssl : params.ssl,
                                                                nodeId : node['Name'],
                                                                endPoint : node['Endpoint']['Address'],
                                                                port : nodePort,
                                                                nodeUid : nodeUid,
                                                                nodeType : rg['NodeType']
                                                                });
                                                
                                        nodeUid ++;
                                        nodeList = nodeList + ( rg['Name'] + "|" + node['Name'] ) + "," 
                                         
                                
                                    });
                                    
                                
                            });
                            
                            res.status(200).send({ data : "Connection Request Opened", nodes : nodeList.slice(0, -1)});
                            
                                    
                            
            }
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
    
    
    
}

    
//-- REDIS : Open Connection per Node
async function openRedisConnectionNode(node){
    
    try {
        
            var options = {};
            var protocol = "redis://";
            
            if ( node.ssl == "required" )
                protocol = "rediss://";
            
            switch (node.auth){
                
                case "modeIam" :
                case "modeNonAuth":
                case "modeOpen":
                        options = {
                            url: protocol + node.endPoint + ":" + node.port,
                            socket : { reconnectStrategy : false}
                        };
                        
                        break;
                
                case "modeAuth":
                        
                        options = {
                            url: protocol + node.endPoint + ":" + node.port,
                            password : node.password ,
                            socket : { reconnectStrategy : false}
                        };
                        
                        break;
        
        
        
                case "modeRbac" :
                case "modeAcl" :    
                        options = {
                            url: protocol + node.username + ":" + node.password + "@" + node.endPoint + ":" + node.port,
                            socket : { reconnectStrategy : false}
                        };
                        
                        break;
                
            }
            
            
            var connectionId = "$" + node.connectionId;
            var clusterId = "$" + node.clusterId;
            var instanceId = "$" + node.nodeId;
            
            
            if (!(instanceId in dbRedisCluster[connectionId][clusterId])) {
            
                var timeNow = new Date();
                
                dbRedisCluster[connectionId][clusterId][instanceId] = function(){};
                
                
                dbRedisCluster[connectionId][clusterId][instanceId]["connection"] = function(){};
                dbRedisCluster[connectionId][clusterId][instanceId]["connection"] = redis.createClient(options);
                
                dbRedisCluster[connectionId][clusterId][instanceId]["node"] = function(){};
                dbRedisCluster[connectionId][clusterId][instanceId]["node"] = new classMetric(
                                                                                                node.nodeUid,
                                                                                                node.nodeId,[
                                                                                                                {name : "cpu", history : 20 },
                                                                                                                {name : "memory", history : 20 },
                                                                                                                {name : "netin", history : 20 },
                                                                                                                {name : "netout", history : 20 },
                                                                                                                {name : "network", history : 20 },
                                                                                                                {name : "connectedClients", history : 20 },
                                                                                                                {name : "operations", history : 20 },
                                                                                                                {name : "getCalls", history : 20 },
                                                                                                                {name : "setCalls", history : 20 },
                                                                                                                {name : "getLatency", history : 20 },
                                                                                                                {name : "setLatency", history : 20 },
                                                                                                                {name : "keyspaceHits", history : 20 },
                                                                                                                {name : "keyspaceMisses", history : 20 },
                                                                                                                {name : "cacheHitRate", history : 20 }
                                                                                                                ]
                                                                        );
                var nodeNetworkRate = 0;
                try {
                        nodeNetworkRate = nodeCatalog[node.nodeType];
                }
                catch {
                    nodeNetworkRate = 0;
                }
                
                dbRedisCluster[connectionId][clusterId][instanceId]["property"] = function(){};
                dbRedisCluster[connectionId][clusterId][instanceId]["property"] = { nodeType : node.nodeType, nodeNetworkRate : nodeNetworkRate};
                
                
                dbRedisCluster[connectionId][clusterId][instanceId]["node"].newSnapshot(nodeType,timeNow.getTime());
                dbRedisCluster[connectionId][clusterId][instanceId]["connection"].on('error', err => {       
                              console.log(err.message);
                });   

                dbRedisCluster[connectionId][clusterId][instanceId]["connection"].connect()
                    .then(()=> {
                        console.log("Redis Instance Connected : " + node.connectionId + " # " + node.clusterId + " # " + node.nodeId );
                        
                        
                    })
                    .catch(()=> {
                        console.log("Redis Instance Connected with Errors : "  + node.connectionId + " # " + node.clusterId + " # " + node.nodeId );
                        
                    });
                    
            }
            else {
                console.log("Re-using - Redis Instance connection : " +  node.connectionId + " # " + node.clusterId + " # " + node.nodeId );
                
            }
    
        
    }
    catch (error) {
        console.log(error)
        
    }
   
    
}



// REDIS : Request Update Stats per Cluster
app.get("/api/redis/cluster/stats/update", updateStatsRedisCluster);
async function updateStatsRedisCluster(req, res) {
 
        try
            {
                var params = req.query;
                
                updateStatsRedisClusterCommand(params.connectionId, params.clusterId);
                
                res.status(200).send( {"result":"Cluster Update Stats Requested"});
                
        }
        catch(err){
                console.log(err);
        }
}


async function updateStatsRedisClusterCommand(connectionId,clusterId) {
 
        try
            {
                
                var nodes = dbRedisCluster["$" + connectionId]["$" + clusterId];
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster" )
                            updateStatsRedisNode("$" + connectionId, "$" + clusterId, nodeId );
                       
                }
                
                
        }
        catch(err){
                console.log(err);
        }
}

async function updateStatsRedisNode(connectionId,clusterId,nodeId) {
    
    
    try
    {
            var timeNow = new Date();
            
            //-- Node Info Stats 
            
            var rawInfo = await dbRedisCluster[connectionId][clusterId][nodeId]["connection"].info();
            var jsonInfo = redisInfo.parse(rawInfo);
            
            //-- Node Command Stats
            var command = await dbRedisCluster[connectionId][clusterId][nodeId]["connection"].sendCommand(['INFO','Commandstats']);
            
            var totalCalls = 0;
            var iRowLine = 0;
            var dataResult = "";
            command.split(/\r?\n/).forEach((line) => {
                  try
                  {
                      if (iRowLine > 0) {
                          var record =  line.split(":");
                          var metricGropuName = record[0];
                          var counterList = record[1].split(",");
                          var metricList = "";
                          counterList.forEach((line) => {
                                var metric = line.split("=");
                                var key = metric[0];
                                var value = metric[1];
                                metricList = metricList + '"' + key + '":' + value + ",";
                                if (key == "calls")
                                    totalCalls = totalCalls + parseFloat(value);
                                
                          });
                          dataResult = dataResult + '"' + metricGropuName + '": { ' + metricList.slice(0, -1) + ' },';
                      }
                      iRowLine ++;
                  }
                  catch {
                    
                  }
                  
                  
              });
              
            var jsonCommands = JSON.parse('{' + dataResult.slice(0, -1) + ' } ');
            
            dbRedisCluster[connectionId][clusterId][nodeId]["node"].newSnapshot({
                                                                                        name : "",
                                                                                        role : jsonInfo['role'],
                                                                                        cpuUser: parseFloat(jsonInfo['used_cpu_user']),
                                                                                        cpuSys: parseFloat(jsonInfo['used_cpu_sys']),
                                                                                        memory: 0,
                                                                                        memoryUsed: parseFloat(jsonInfo['used_memory']),
                                                                                        memoryTotal: parseFloat(jsonInfo['maxmemory']),
                                                                                        operations: totalCalls,
                                                                                        getCalls: (( jsonCommands.hasOwnProperty('cmdstat_get') ) ? parseFloat(jsonCommands['cmdstat_get']['calls']) : 0) ,
                                                                                        getUsec: (( jsonCommands.hasOwnProperty('cmdstat_get') ) ? parseFloat(jsonCommands['cmdstat_get']['usec']) : 0) ,
                                                                                        setCalls : (( jsonCommands.hasOwnProperty('cmdstat_set') ) ? parseFloat(jsonCommands['cmdstat_set']['calls']) : 0) ,
                                                                                        setUsec : (( jsonCommands.hasOwnProperty('cmdstat_set') ) ? parseFloat(jsonCommands['cmdstat_set']['usec']) : 0) ,
                                                                                        connectedClients: parseFloat(jsonInfo['connected_clients']),
                                                                                        getLatency: 0,
                                                                                        setLatency: 0,
                                                                                        keyspaceHits: parseFloat(jsonInfo['keyspace_hits']),
                                                                                        keyspaceMisses: parseFloat(jsonInfo['keyspace_misses']),
                                                                                        netIn: parseFloat(jsonInfo['instantaneous_input_kbps']),
                                                                                        netOut: parseFloat(jsonInfo['instantaneous_output_kbps']),
                                                                                        connectionsTotal: parseFloat(jsonInfo['total_connections_received']),
                                                                                        commands: parseFloat(jsonInfo['total_commands_processed']),
                                                                                        timestamp : 0
                                                                                    
                                                                                },
                                                                                timeNow.getTime());
          
          
            
    }
    catch(err){
                console.log(err);
    }
                
}



// REDIS : Request Update Stats per Cluster
app.get("/api/redis/cluster/stats/gather", gatherStatsRedisCluster);
async function gatherStatsRedisCluster(req, res) {
 
        try
            {
                
                var params = req.query;
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = dbRedisCluster[connectionId][clusterId];
                var clusterInfo = {
                                cpu: 0,
                                memory: 0,
                                memoryUsed: 0,
                                memoryTotal: 0,
                                operations: 0,
                                getCalls: 0,
                                setCalls: 0,
                                connectedClients: 0,
                                getLatency: 0,
                                setLatency: 0,
                                keyspaceHits: 0,
                                keyspaceMisses: 0,
                                cacheHitRate : 0,
                                netIn: 0,
                                netOut: 0,
                                network : 0,
                                connectionsTotal: 0,
                                commands: 0,
                };
                
                var nodesInfo = [];
                var totalNodes = 0;
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster" ) {
                            
                            var currentNode = dbRedisCluster[connectionId][clusterId][nodeId]["node"];
                            var nodeNetworkRate = dbRedisCluster[connectionId][clusterId][nodeId]["property"]['nodeNetworkRate'];
                            
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('cpu',(currentNode.getDeltaByIndex("cpuUser") * 100 ) +  (currentNode.getDeltaByIndex("cpuSys") * 100 ));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('memory',(currentNode.getValueByIndex("memoryUsed")/currentNode.getValueByIndex("memoryTotal") ) * 100);
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('netin',currentNode.getValueByIndex("netIn") * 1024);
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('netout',currentNode.getValueByIndex("netOut") * 1024);
                            
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('network',
                                                                                                         ( 
                                                                                                            ( 
                                                                                                                (currentNode.getValueByIndex("netOut") + currentNode.getValueByIndex("netIn") ) * 1024 
                                                                                                            ) / nodeNetworkRate 
                                                                                                         ) * 100
                                                                                                    );
                            
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('connectedClients',currentNode.getValueByIndex("connectedClients"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('operations',currentNode.getDeltaByIndex("operations"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('getCalls',currentNode.getDeltaByIndex("getCalls"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('setCalls',currentNode.getDeltaByIndex("setCalls"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('getLatency',currentNode.getDeltaByIndex("getUsec") / currentNode.getDeltaByIndex("getCalls"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('setLatency',currentNode.getDeltaByIndex("setUsec") / currentNode.getDeltaByIndex("setCalls"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('keyspaceHits',currentNode.getDeltaByIndex("keyspaceHits"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('keyspaceMisses',currentNode.getDeltaByIndex("keyspaceMisses"));
                            dbRedisCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('cacheHitRate',(currentNode.getDeltaByIndex("keyspaceHits") /
                                                                                                                    ( currentNode.getDeltaByIndex("keyspaceHits") + currentNode.getDeltaByIndex("keyspaceMisses"))
                                                                                                                    ) * 100);
                            
                            
                            
                            var nodeStats = {
                                    name : currentNode.getObjectName(),
                                    nodeId : currentNode.getObjectId(),
                                    role : currentNode.getValueByIndex("role"),
                                    cpu: (currentNode.getDeltaByIndex("cpuUser") * 100 ) +  (currentNode.getDeltaByIndex("cpuSys") * 100 ),
                                    memory: (currentNode.getValueByIndex("memoryUsed")/currentNode.getValueByIndex("memoryTotal") ) * 100,
                                    memoryUsed: currentNode.getValueByIndex("memoryUsed"),
                                    memoryTotal: currentNode.getValueByIndex("memoryTotal"),
                                    operations: currentNode.getDeltaByIndex("operations"),
                                    getCalls: currentNode.getDeltaByIndex("getCalls"),
                                    setCalls: currentNode.getDeltaByIndex("setCalls"),
                                    connectedClients: currentNode.getValueByIndex("connectedClients"),
                                    getLatency: currentNode.getDeltaByIndex("getUsec") / currentNode.getDeltaByIndex("getCalls"),
                                    setLatency: currentNode.getDeltaByIndex("setUsec") / currentNode.getDeltaByIndex("setCalls"),
                                    keyspaceHits: currentNode.getDeltaByIndex("keyspaceHits"),
                                    keyspaceMisses: currentNode.getDeltaByIndex("keyspaceMisses"),
                                    cacheHitRate: (currentNode.getDeltaByIndex("keyspaceHits") /
                                                    ( currentNode.getDeltaByIndex("keyspaceHits") + currentNode.getDeltaByIndex("keyspaceMisses"))
                                                   ) * 100,
                                    netIn: currentNode.getValueByIndex("netIn") * 1024,
                                    netOut: currentNode.getValueByIndex("netOut") * 1024,
                                    network : ( ( ( currentNode.getValueByIndex("netIn") + currentNode.getValueByIndex("netOut")) * 1024 ) / nodeNetworkRate ) * 100,
                                    connectionsTotal: currentNode.getDeltaByIndex("connectionsTotal"),
                                    commands: currentNode.getDeltaByIndex("commands"),
                                    history : {
                                            cpu : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('cpu'),
                                            memory : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('memory'),
                                            netin : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netin'),
                                            netout : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netout'),
                                            network : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('network'),
                                            connectedClients : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('connectedClients'),
                                            operations : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('operations'),
                                            getCalls : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('getCalls'),
                                            setCalls : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('setCalls'),
                                            getLatency : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('getLatency'),
                                            setLatency : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('setLatency'),
                                            keyspaceHits : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('keyspaceHits'),
                                            keyspaceMisses : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('keyspaceMisses'),
                                            cacheHitRate : dbRedisCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('cacheHitRate'),
                                    }
                            };
                            
                            
                            if ( currentNode.getObjectId() >= params.beginItem &&  currentNode.getObjectId() < params.endItem )
                                nodesInfo.push(nodeStats);
                            
                            
                            clusterInfo.cpu = clusterInfo.cpu +  ( nodeStats.cpu || 0 );
                            clusterInfo.memory = clusterInfo.memory +  ( nodeStats.memory || 0 );
                            clusterInfo.memoryUsed = clusterInfo.memoryUsed +  ( nodeStats.memoryUsed || 0 );
                            clusterInfo.memoryTotal = clusterInfo.memoryTotal +  ( nodeStats.memoryTotal || 0 );
                            clusterInfo.operations = clusterInfo.operations +  ( nodeStats.operations || 0 );
                            clusterInfo.getCalls = clusterInfo.getCalls +  ( nodeStats.getCalls || 0 );
                            clusterInfo.setCalls = clusterInfo.setCalls +  ( nodeStats.setCalls || 0 );
                            clusterInfo.connectedClients = clusterInfo.connectedClients +  ( nodeStats.connectedClients || 0 );
                            clusterInfo.getLatency = clusterInfo.getLatency +  ( nodeStats.getLatency || 0 );
                            clusterInfo.setLatency = clusterInfo.setLatency +  ( nodeStats.setLatency || 0 );
                            clusterInfo.keyspaceHits = clusterInfo.keyspaceHits +  ( nodeStats.keyspaceHits || 0 );
                            clusterInfo.keyspaceMisses = clusterInfo.keyspaceMisses +  ( nodeStats.keyspaceMisses || 0 );
                            clusterInfo.cacheHitRate = clusterInfo.cacheHitRate +  ( nodeStats.cacheHitRate || 0 );
                            clusterInfo.netIn = clusterInfo.netIn +  ( nodeStats.netIn || 0 );
                            clusterInfo.netOut = clusterInfo.netOut +  ( nodeStats.netOut || 0 );
                            clusterInfo.network = clusterInfo.network +  ( nodeStats.network || 0 );
                            clusterInfo.connectionsTotal = clusterInfo.connectionsTotal +  ( nodeStats.connectionsTotal || 0 );
                            clusterInfo.commands = clusterInfo.commands +  ( nodeStats.commands || 0 );
                                    
                            totalNodes++;
                        
                            
                        }
                        
                       
                }
                
                clusterInfo.cpu = clusterInfo.cpu / totalNodes;
                clusterInfo.memory = clusterInfo.memory / totalNodes;
                clusterInfo.network = clusterInfo.network / totalNodes;
                clusterInfo.getLatency = clusterInfo.getLatency / totalNodes;
                clusterInfo.setLatency = clusterInfo.setLatency / totalNodes;
                clusterInfo.cacheHitRate = clusterInfo.cacheHitRate / totalNodes;
                
                dbRedisCluster[connectionId][clusterId]["cluster"].addPropertyValue('operations',clusterInfo.operations);
                dbRedisCluster[connectionId][clusterId]["cluster"].addPropertyValue('getCalls',clusterInfo.getCalls);
                dbRedisCluster[connectionId][clusterId]["cluster"].addPropertyValue('setCalls',clusterInfo.setCalls);
                dbRedisCluster[connectionId][clusterId]["cluster"].addPropertyValue('getLatency',clusterInfo.getLatency);
                dbRedisCluster[connectionId][clusterId]["cluster"].addPropertyValue('setLatency',clusterInfo.setLatency);
                dbRedisCluster[connectionId][clusterId]["cluster"].addPropertyValue('keyspaceHits',clusterInfo.keyspaceHits);
                dbRedisCluster[connectionId][clusterId]["cluster"].addPropertyValue('keyspaceMisses',clusterInfo.keyspaceMisses);
                
                res.status(200).send( { 
                                        cluster : {
                                                    ...clusterInfo,
                                                    history : {
                                                        operations : dbRedisCluster[connectionId][clusterId]["cluster"].getPropertyValues('operations'),
                                                        getCalls : dbRedisCluster[connectionId][clusterId]["cluster"].getPropertyValues('getCalls'),
                                                        setCalls : dbRedisCluster[connectionId][clusterId]["cluster"].getPropertyValues('setCalls'),
                                                        getLatency : dbRedisCluster[connectionId][clusterId]["cluster"].getPropertyValues('getLatency'),
                                                        setLatency : dbRedisCluster[connectionId][clusterId]["cluster"].getPropertyValues('setLatency'),
                                                        keyspaceHits : dbRedisCluster[connectionId][clusterId]["cluster"].getPropertyValues('keyspaceHits'),
                                                        keyspaceMisses : dbRedisCluster[connectionId][clusterId]["cluster"].getPropertyValues('keyspaceMisses'),
                                                        
                                                    }
                                        },
                                        nodes : nodesInfo 
                });
                
        }
        catch(err){
                console.log(err);
        }
}


// REDIS : Close Connection
app.get("/api/redis/connection/close/", closeRedisConnectionAll);
async function closeRedisConnectionAll(req, res) {
 
        try
            {
                var params = req.query;
                
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = dbRedisCluster[connectionId][clusterId];
                
                for (let nodeId of Object.keys(nodes)) {
                        try {
                                    if (nodeId != "cluster" ) {
                                        console.log("Redis Disconnection  : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                                        nodes[nodeId]["connection"].quit();
                                    }
                            }
                        catch{
                              console.log("Redis Disconnection error : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                          }
                        
                }
                delete dbRedisCluster[params.connectionId];
                res.status(200).send( {"result":"disconnected"});
                
                
        }
        catch(err){
                console.log(err);
        }
}


//--#################################################################################################### 
//   ---------------------------------------- DOCUMENTDB
//--#################################################################################################### 


// DOCUMENTDB : Auth Connection
app.post("/api/documentdb/connection/auth/", authDocumentDBConnection);

async function authDocumentDBConnection(req, res) {

    var params = req.body.params;

    try {
        
                    const uri = "mongodb://" + params.username  + ":" + params.password +"@" + params.host + ":" + params.port +"/?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false";
                    
                    const client = new MongoClient(uri);

                    var session_id=uuid.v4();
                    var token = generateToken({ session_id: session_id});
    
                    await client.connect();
                    await client.db("admin").command({ ping: 1 });
    
                    docdb["$" + session_id] = {}
                    
                    documentDBCluster["$" + session_id] = {}
                    documentDBCluster["$" + session_id][ "$" + params.clusterId] = {};
                    documentDBCluster["$" + session_id][ "$" + params.clusterId]["cluster"] = new classMetric(
                                                                                                            0,
                                                                                                            "cluster",[
                                                                                                                { name: "cpu", history : 20 },
                                                                                                                { name: "memory", history : 20 },
                                                                                                                { name: "ioreads", history : 20 },
                                                                                                                { name: "iowrites", history : 20 },
                                                                                                                { name: "netin", history : 20 },
                                                                                                                { name: "netout", history : 20 },
                                                                                                                { name: "connectionsCurrent", history : 20 },
                                                                                                                { name: "connectionsAvailable", history : 20 },
                                                                                                                { name: "connectionsCreated", history : 20 },
                                                                                                                { name: "opsInsert", history : 20 },
                                                                                                                { name: "opsQuery", history : 20 },
                                                                                                                { name: "opsUpdate", history : 20 },
                                                                                                                { name: "opsDelete", history : 20 },
                                                                                                                { name: "opsGetmore", history : 20 },
                                                                                                                { name: "opsCommand", history : 20 },
                                                                                                                { name: "docsDeleted", history : 20 },
                                                                                                                { name: "docsInserted", history : 20 },
                                                                                                                { name: "docsReturned", history : 20 },
                                                                                                                { name: "docsUpdated", history : 20 },
                                                                                                            ]
                                                                                            ) ;
                    documentDBCluster["$" + session_id][ "$" + params.clusterId]["property"]  = function(){};
                    documentDBCluster["$" + session_id][ "$" + params.clusterId]["property"]  = { clusterId: params.clusterId, timestamp : "" }
                    
                    
                    await client.close();
                    res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
                   
                   
      } 
      catch (error) {
        console.log(error);
        res.status(200).send( {"result":"auth0", "session_id": session_id, "session_token": token });
    }
    
    
}



// DOCUMENTDB : API Cluster Stats - Single
app.get("/api/documentdb/cluster/command/", getDocumentDBCommand);
async function getDocumentDBCommand(req, res) {
    
    var params = req.query;
 
    try {
          const result = await documentDBCluster["$" + params.connectionId]["$" + params.clusterId]["$" + params.instanceId]["connection"].db("admin").command(JSON.parse(params.command));
          return res.status(200).send(result);
    
      } catch (error) {
        console.error(error);
        res.status(404).send("Data unavailable");
    }
}



// DOCUMENTDB : Open Connection - DocumentDB Cluster 
app.post("/api/documentdb/cluster/connection/open/", openDocumentDBConnectionCluster);
async function openDocumentDBConnectionCluster(req, res) {
 
    var params = req.body.params;
    
    try {
        

            // Gather Roles
            var parameterCluster = {
                DBClusterIdentifier: params.clusterId,
                MaxRecords: 100
            };

            var clusterData = await docDB.describeDBClusters(parameterCluster).promise();
            var roleType = [];
            
            clusterData['DBClusters'][0]['DBClusterMembers'].forEach(function(instance) {
                roleType[instance['DBInstanceIdentifier']] =  ( String(instance['IsClusterWriter']) == "true" ? "P" : "R" );
            });
            
            
            
            
            // Gather Instances
            var parameter = {
                MaxRecords: 100,
                Filters: [
                        {
                          Name: 'db-cluster-id',
                          Values: [params.clusterId]
                        },
                ],
            };

            
            var Instancedata = await rds.describeDBInstances(parameter).promise();
            var nodeList = "";
            
            if (Instancedata.DBInstances.length > 0) {
                        
                            var clusterNodes = Instancedata.DBInstances;
                            var nodeUid = 0;
                          
                            clusterNodes.forEach(function(node) {
                                
                                openDocumentDBConnectionNode({
                                                connectionId : params.connectionId,
                                                clusterId : params.clusterId,
                                                instanceId : node['DBInstanceIdentifier'],
                                                host : node['Endpoint']['Address'],
                                                port : node['Endpoint']['Port'],
                                                username : params.username,
                                                password : params.password,
                                                nodeUid : nodeUid,
                                                resourceId : node['DbiResourceId'],
                                                monitoring : ( String(node['MonitoringInterval']) == "0" ? "clw" : "em" ),
                                                role : roleType[node['DBInstanceIdentifier']],
                                                size : node['DBInstanceClass'],
                                                az : node['AvailabilityZone'],
                                                status : node['DBInstanceStatus'],
                                                });
                                
                                                                
                                nodeUid++;
                                nodeList = nodeList + node['DBInstanceIdentifier']  + "," 
                        
                            });
                            
                            res.status(200).send({ data : "Connection Request Opened", nodes : nodeList.slice(0, -1)});
                            
                              
            }
                    
            
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
    
    
    
}


async function openDocumentDBConnectionNode(node) {

    try {
        
            const uriDocDB = "mongodb://" + node.username  + ":" + node.password +"@" + node.host + ":" + node.port +"/?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false&directConnection=true";
            
            var connectionId = "$" + node.connectionId;
            var clusterId = "$" + node.clusterId;
            var instanceId = "$" + node.instanceId;
            
            
            if (!(instanceId in documentDBCluster[connectionId][clusterId])) {
            
                try {
                    
                    var timeNow = new Date();
                
                    documentDBCluster[connectionId][clusterId][instanceId] = function(){};
                    
                    
                    documentDBCluster[connectionId][clusterId][instanceId]["connection"] = function(){};
                    documentDBCluster[connectionId][clusterId][instanceId]["connection"] = new MongoClient(uriDocDB);
                    
                    documentDBCluster[connectionId][clusterId][instanceId]["node"] = function(){};
                    documentDBCluster[connectionId][clusterId][instanceId]["node"] = new classMetric(
                                                                                                    node.nodeUid,
                                                                                                    node.nodeId,[
                                                                                                                    { name: "cpu", history : 20 },
                                                                                                                    { name: "memory", history : 20 },
                                                                                                                    { name: "ioreads", history : 20 },
                                                                                                                    { name: "iowrites", history : 20 },
                                                                                                                    { name: "netin", history : 20 },
                                                                                                                    { name: "netout", history : 20 },
                                                                                                                    { name: "connectionsCurrent", history : 20 },
                                                                                                                    { name: "connectionsAvailable", history : 20 },
                                                                                                                    { name: "connectionsCreated", history : 20 },
                                                                                                                    { name: "opsInsert", history : 20 },
                                                                                                                    { name: "opsQuery", history : 20 },
                                                                                                                    { name: "opsUpdate", history : 20 },
                                                                                                                    { name: "opsDelete", history : 20 },
                                                                                                                    { name: "opsGetmore", history : 20 },
                                                                                                                    { name: "opsCommand", history : 20 },
                                                                                                                    { name: "docsDeleted", history : 20 },
                                                                                                                    { name: "docsInserted", history : 20 },
                                                                                                                    { name: "docsReturned", history : 20 },
                                                                                                                    { name: "docsUpdated", history : 20 },
                                                                                                                    { name: "operations", history : 20 },
                                                                                                                    { name: "docops", history : 20 },
                                                                                                                    { name: "network", history : 20 },
                                                                                                                    { name: "iops", history : 20 },
                                                                                                    ]
                                                                                                ) ;
                    
                    documentDBCluster[connectionId][clusterId][instanceId]["property"] = function(){};
                    documentDBCluster[connectionId][clusterId][instanceId]["property"] = { 
                                                                                            instanceId: node.instanceId, 
                                                                                            resourceId : node.resourceId, 
                                                                                            monitoring : node.monitoring, 
                                                                                            size : node.size,
                                                                                            az : node.az,
                                                                                            status : node.status,
                                                                                            role : node.role, 
                                                                                            timestamp : ""
                    }
                    
                    
                    documentDBCluster[connectionId][clusterId][instanceId]["node"].newSnapshot(nodeTypeDocumentDB,timeNow.getTime());
                
                    await documentDBCluster[connectionId][clusterId][instanceId]["connection"].connect();
                    await documentDBCluster[connectionId][clusterId][instanceId]["connection"].db("admin").command({ ping: 1 });
                    
                    console.log("DocumentDB Instance Connected : " + node.connectionId + " # " + node.clusterId + " # " + node.instanceId );
                        
                }
                catch {
                    
                    console.log("DocumentDB Instance Connected with Errors : " + node.connectionId + " # " + node.clusterId + " # " + node.instanceId );
                    
                }
                    
            }
            else {
                console.log("Re-using - DocumentDB Instance connection : " + node.connectionId + " # " + node.clusterId + " # " + node.instanceId );
                
            }
    
        
    }
    catch (error) {
        console.log(error)
        
    }}
    


// DOCUMENTDB : Request Update Stats per Cluster
app.get("/api/documentdb/cluster/stats/update", updateStatsDocumentDBCluster);
async function updateStatsDocumentDBCluster(req, res) {
 
        try
            {
                var params = req.query;
                
                var nodes = documentDBCluster["$" + params.connectionId]["$" + params.clusterId];
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster"  && nodeId != "property" ){
                            updateStatsDocumentDBNode("$" + params.connectionId, "$" + params.clusterId, nodeId, nodes[nodeId]['property']['resourceId'], nodes[nodeId]['property']['monitoring'] );
                        }
                       
                }
                
                res.status(200).send( {"result":"Cluster Update Stats Requested"});
                
        }
        catch(err){
                console.log(err);
        }
}


async function updateStatsDocumentDBNode(connectionId,clusterId,nodeId, resourceId, monitoring) {
    
    
    try
    {
            var timeNow = new Date();
            
    
    
            // Current Instance Status
            var parameter = {
                DBInstanceIdentifier : nodeId.substring(1)
            };

            var instanceInfo = { status : "", size : ""};
            var instanceData = await rds.describeDBInstances(parameter).promise();
            
            if (instanceData.DBInstances.length > 0) {
                instanceInfo.status = instanceData.DBInstances[0]['DBInstanceStatus'];
                instanceInfo.size = instanceData.DBInstances[0]['DBInstanceClass'];
                
            }
            
            //-- Current Operations
            const currentOperations = await documentDBCluster[connectionId][clusterId][nodeId]["connection"].db("admin").command({ serverStatus: 1 });
    
            //-- Current Operations
            const currentStatus = await documentDBCluster[connectionId][clusterId][nodeId]["connection"].db("admin").command({ isMaster : 1 });
    
    
            //-- OS Metrics
            const osMetrics = await gatherDocumentDBOsMetrics({ resourceId : resourceId, instanceId : nodeId.substring(1), monitoring : monitoring });
            documentDBCluster[connectionId][clusterId][nodeId]["node"].newSnapshot({
                                                                                        cpu: osMetrics.cpu,
                                                                                        cpuTimestamp: osMetrics.cpuTimestamp,
                                                                                        memory: osMetrics.memory,
                                                                                        memoryTimestamp: osMetrics.memoryTimestamp,
                                                                                        ioreads: osMetrics.ioreads,
                                                                                        ioreadsTimestamp: osMetrics.ioreadsTimestamp,
                                                                                        iowrites: osMetrics.iowrites,
                                                                                        iowritesTimestamp: osMetrics.iowritesTimestamp,
                                                                                        netin: osMetrics.netin,
                                                                                        netinTimestamp: osMetrics.netinTimestamp,
                                                                                        netout: osMetrics.netout,
                                                                                        netoutTimestamp: osMetrics.netoutTimestamp,
                                                                                        connectionsCurrent : currentOperations['connections']['current'],
                                                                                        connectionsAvailable : currentOperations['connections']['available'],
                                                                                        connectionsCreated : currentOperations['connections']['totalCreated'],
                                                                                        opsInsert : currentOperations['opcounters']['insert'],
                                                                                        opsQuery : currentOperations['opcounters']['query'],
                                                                                        opsUpdate : currentOperations['opcounters']['update'],
                                                                                        opsDelete : currentOperations['opcounters']['delete'],
                                                                                        opsGetmore : currentOperations['opcounters']['getmore'],
                                                                                        opsCommand : currentOperations['opcounters']['command'],
                                                                                        docsDeleted : currentOperations['metrics']['document']['deleted'],
                                                                                        docsInserted : currentOperations['metrics']['document']['inserted'],
                                                                                        docsReturned : currentOperations['metrics']['document']['returned'],
                                                                                        docsUpdated : currentOperations['metrics']['document']['updated'],
                                                                                        transactionsActive : currentOperations['transactions']['currentActive'],
                                                                                        transactionsCommited : currentOperations['transactions']['totalCommitted'],
                                                                                        transactionsAborted : currentOperations['transactions']['totalAborted'],
                                                                                        transactionsStarted : currentOperations['transactions']['totalStarted']
                                                                                    
                                                                                },
                                                                                timeNow.getTime());
            
            documentDBCluster[connectionId][clusterId][nodeId]["property"]["timestamp"] =  osMetrics.timestamp;
            documentDBCluster[connectionId][clusterId][nodeId]["property"] = {...documentDBCluster[connectionId][clusterId][nodeId]["property"],
                                                                              role : (currentStatus.ismaster == true ? "P" : "R" ),
                                                                              status : instanceInfo.status,
                                                                              size : instanceInfo.size
            };  
          
          
            
    }
    catch(err){
                console.log(err);
    }
                
}



async function gatherDocumentDBOsMetrics(node){
    
    var nodeMetrics = { 
                        cpu : 0, 
                        cpuTimestamp : "",
                        memory : 0, 
                        memoryTimestamp : "",
                        ioreads : 0, 
                        ioreadsTimestamp : "",
                        iowrites : 0, 
                        iowritesTimestamp : "",
                        netin : 0,
                        netinTimestamp : "",
                        netout : 0,
                        netoutTimestamp : "",
                        timestamp : ""
    };
    
    try {
            //-- OS Metrics
            if ( node.monitoring == "em") {
                
                    var params_logs = {
                        logStreamName: node.resourceId,
                        limit: '1',
                        logGroupName: 'RDSOSMetrics',
                        startFromHead: false
                    };
                
                    var data = await cloudwatchlogs.getLogEvents(params_logs).promise();
                    
                    var message=JSON.parse(data.events[0].message);
                            
                    nodeMetrics.cpu = message.cpuUtilization.total;
                    nodeMetrics.cpuTimestamp = message.timestamp;
                    nodeMetrics.memory = message.memory.free;
                    nodeMetrics.memoryTimestamp = message.timestamp;
                    nodeMetrics.ioreads = message.diskIO[0].readIOsPS + message.diskIO[1].readIOsPS;
                    nodeMetrics.ioreadsTimestamp = message.timestamp;
                    nodeMetrics.iowrites = message.diskIO[0].writeIOsPS + message.diskIO[1].writeIOsPS;
                    nodeMetrics.iowritesTimestamp = message.timestamp;
                    nodeMetrics.netin = message.network[0].rx;
                    nodeMetrics.netinTimestamp = message.timestamp;
                    nodeMetrics.netout = message.network[0].tx;
                    nodeMetrics.netoutTimestamp = message.timestamp;
                    nodeMetrics.timestamp = message.timestamp;  
                        
                        
            }
            else {
                
                    //-- Gather Metrics from CloudWatch
                
                    var dimension = [ { Name: "DBInstanceIdentifier", Value: node.instanceId } ];
                    var metrics = [{
                                        namespace : "AWS/DocDB",
                                        metric : "CPUUtilization",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/DocDB",
                                        metric : "FreeableMemory",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/DocDB",
                                        metric : "ReadIOPS",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/DocDB",
                                        metric : "WriteIOPS",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/DocDB",
                                        metric : "NetworkReceiveThroughput",
                                        dimension : dimension
                                    },
                                    {
                                        namespace : "AWS/DocDB",
                                        metric : "NetworkTransmitThroughput",
                                        dimension : dimension
                                    },
                                ];
          
                    var dataQueries = [];
                    var queryId = 0;
                    metrics.forEach(function(item) {
                        
                        dataQueries.push({
                                Id: "m0" + String(queryId),
                                MetricStat: {
                                    Metric: {
                                        Namespace: item.namespace,
                                        MetricName: item.metric,
                                        Dimensions: item.dimension
                                    },
                                    Period: "60",
                                    Stat: "Average"
                                },
                                Label: item.metric
                        });
                        
                        queryId++;
                        
                    });
                    
                    var d_end_time = new Date();
                    var d_start_time = new Date(d_end_time - ((3*1) * 60000) );
                    var queryClw = {
                        MetricDataQueries: dataQueries,
                        "StartTime": d_start_time,
                        "EndTime": d_end_time
                    };
                   
                    var data = await cloudwatch.getMetricData(queryClw).promise();
                    
                    data.MetricDataResults.forEach(function(item) {
                            
                                    switch(item.Label){
                                        
                                        case "CPUUtilization":
                                                nodeMetrics.cpu = item.Values[0];
                                                nodeMetrics.cpuTimestamp = String(item.Timestamps[0]);
                                                break;
                                        
                                        case "FreeableMemory":
                                                nodeMetrics.memory = item.Values[0];
                                                nodeMetrics.memoryTimestamp = String(item.Timestamps[0]);
                                                break;
                                                
                                        case "ReadIOPS":
                                                nodeMetrics.ioreads = item.Values[0];
                                                nodeMetrics.ioreadsTimestamp = String(item.Timestamps[0]);
                                                break;
                                        
                                        case "WriteIOPS":
                                                nodeMetrics.iowrites = item.Values[0];
                                                nodeMetrics.iowritesTimestamp = String(item.Timestamps[0]);
                                                break;
                                                
                                        case "NetworkReceiveThroughput":
                                                nodeMetrics.netin = item.Values[0];
                                                nodeMetrics.netinTimestamp = String(item.Timestamps[0]);
                                                break;
                                                
                                        case "NetworkTransmitThroughput":
                                                nodeMetrics.netout = item.Values[0];
                                                nodeMetrics.netoutTimestamp = String(item.Timestamps[0]);
                                                break;
                                            
                                            
                                            
                                    }
                                    nodeMetrics.timestamp = item.Timestamps[0];
                                    
                                
                    });
                            
            }
    }
    catch(err){
        
        console.log(err);
        
    }
    
    return nodeMetrics;
    
        
}

// GENERAL : Compare Array Elements
const timestampEqual =
    arr => arr.every(v => v === arr[0]);
    

// DOCUMENTDB : Request Update Stats per Cluster
app.get("/api/documentdb/cluster/stats/gather", gatherStatsDocumentDBCluster);
async function gatherStatsDocumentDBCluster(req, res) {
 
        try
            {
                
                var params = req.query;
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = documentDBCluster[connectionId][clusterId];
                var clusterInfo = {
                                    cpu: 0,
                                    memory: 0,
                                    ioreads: 0,
                                    iowrites: 0,
                                    netin: 0,
                                    netout: 0,
                                    connectionsCurrent : 0,
                                    connectionsAvailable : 0,
                                    connectionsCreated : 0,
                                    opsInsert : 0,
                                    opsQuery : 0,
                                    opsUpdate : 0,
                                    opsDelete : 0,
                                    opsGetmore : 0,
                                    opsCommand : 0,
                                    docsDeleted : 0,
                                    docsInserted : 0,
                                    docsReturned : 0,
                                    docsUpdated : 0,
                                    transactionsActive : 0,
                                    transactionsCommited : 0,
                                    transactionsAborted : 0,
                                    transactionsStarted : 0
                                
                };
                
                var timestampValues = [];
                var nodesInfo = [];
                var totalNodes = 0;
                for (let nodeId of Object.keys(nodes)) {
                        if (nodeId != "cluster" && nodeId != "property" ) {
                            
                                
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('cpu',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpu"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpuTimestamp"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('memory',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memory"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memoryTimestamp"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('ioreads',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreadsTimestamp"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('iowrites',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowritesTimestamp"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('netin',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netinTimestamp"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('netout',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netoutTimestamp"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('network',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout") + documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netoutTimestamp"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValueWithTimestamp('iops',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites") + documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"), documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowritesTimestamp"));
                            
                            
                            
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('connectionsCurrent',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("connectionsCurrent"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('connectionsAvailable',documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("connectionsAvailable"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('connectionsCreated',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("connectionsCreated"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('opsInsert',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsInsert"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('opsQuery',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsQuery"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('opsUpdate',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsUpdate"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('opsDelete',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsDelete"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('opsGetmore',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsGetmore"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('opsCommand',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsCommand"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('docsDeleted',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsDeleted"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('docsInserted',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsInserted"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('docsReturned',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsReturned"));
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('docsUpdated',documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsUpdated"));
                            
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('operations',
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsQuery") +
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsUpdate") +
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsDelete") +
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsInsert") +
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsCommand") 
                                                                                                        );
                            
                            documentDBCluster[connectionId][clusterId][nodeId]["node"].addPropertyValue('docops',
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsDeleted") +
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsInserted") +
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsReturned") +
                                                                                                        documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsUpdated")
                                                                                                        );
                            
                                                                                                                
                            
                            
                            var nodeStats = {
                                    name : documentDBCluster[connectionId][clusterId][nodeId]["property"]["instanceId"],
                                    role : documentDBCluster[connectionId][clusterId][nodeId]["property"]["role"],
                                    size : documentDBCluster[connectionId][clusterId][nodeId]["property"]["size"],
                                    az : documentDBCluster[connectionId][clusterId][nodeId]["property"]["az"],
                                    status : documentDBCluster[connectionId][clusterId][nodeId]["property"]["status"],
                                    nodeId : documentDBCluster[connectionId][clusterId][nodeId]["node"].getObjectId(),
                                    cpu : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("cpu"),
                                    memory : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("memory"),
                                    ioreads : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("ioreads"),
                                    iowrites : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("iowrites"),
                                    netin : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netin"),
                                    netout : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("netout"),
                                    connectionsCurrent : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("connectionsCurrent"),
                                    connectionsAvailable : documentDBCluster[connectionId][clusterId][nodeId]["node"].getValueByIndex("connectionsAvailable"),
                                    connectionsCreated : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("connectionsCreated"),
                                    opsInsert : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsInsert"),
                                    opsQuery : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsQuery"),
                                    opsUpdate : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsUpdate"),
                                    opsDelete : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsDelete"),
                                    opsGetmore : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsGetmore"),
                                    opsCommand : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("opsCommand"),
                                    docsDeleted : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsDeleted"),
                                    docsInserted : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsInserted"),
                                    docsReturned : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsReturned"),
                                    docsUpdated : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("docsUpdated"),
                                    transactionsActive : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("transactionsActive"),
                                    transactionsCommited : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("transactionsCommited"),
                                    transactionsAborted : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("transactionsAborted"),
                                    transactionsStarted : documentDBCluster[connectionId][clusterId][nodeId]["node"].getDeltaByIndex("transactionsStarted"),
                                    history : {
                                            cpu : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('cpu'),
                                            memory : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('memory'),
                                            ioreads : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('ioreads'),
                                            iowrites : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('iowrites'),
                                            netin : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netin'),
                                            netout : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('netout'),
                                            connectionsCurrent : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('connectionsCurrent'),
                                            connectionsAvailable : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('connectionsAvailable'),
                                            connectionsCreated : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('connectionsCreated'),
                                            opsInsert : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('opsInsert'),
                                            opsQuery : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('opsQuery'),
                                            opsUpdate : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('opsUpdate'),
                                            opsDelete : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('opsDelete'),
                                            opsGetmore : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('opsGetmore'),
                                            opsCommand : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('opsCommand'),
                                            docsDeleted : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('docsDeleted'),
                                            docsInserted : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('docsInserted'),
                                            docsReturned : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('docsReturned'),
                                            docsUpdated : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('docsUpdated'),
                                            network : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('network'),
                                            iops : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('iops'),
                                            operations : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('operations'),
                                            docops : documentDBCluster[connectionId][clusterId][nodeId]["node"].getPropertyValues('docops'),
                                    }
                            };
                            
                            
                            if ( documentDBCluster[connectionId][clusterId][nodeId]["node"].getObjectId() >= params.beginItem &&  documentDBCluster[connectionId][clusterId][nodeId]["node"].getObjectId() < params.endItem )
                                nodesInfo.push(nodeStats);
                            
                            clusterInfo.cpu = clusterInfo.cpu +  nodeStats.cpu;
                            clusterInfo.memory = clusterInfo.memory +  nodeStats.memory;
                            clusterInfo.ioreads = clusterInfo.ioreads +  nodeStats.ioreads;
                            clusterInfo.iowrites = clusterInfo.iowrites +  nodeStats.iowrites;
                            clusterInfo.netin = clusterInfo.netin +  nodeStats.netin;
                            clusterInfo.netout = clusterInfo.netout +  nodeStats.netout;
                            clusterInfo.connectionsCurrent = clusterInfo.connectionsCurrent +  nodeStats.connectionsCurrent;
                            clusterInfo.connectionsAvailable = clusterInfo.connectionsAvailable +  nodeStats.connectionsAvailable;
                            clusterInfo.connectionsCreated = clusterInfo.connectionsCreated +  nodeStats.connectionsCreated;
                            clusterInfo.opsInsert = clusterInfo.opsInsert +  nodeStats.opsInsert;
                            clusterInfo.opsQuery = clusterInfo.opsQuery +  nodeStats.opsQuery;
                            clusterInfo.opsUpdate = clusterInfo.opsUpdate +  nodeStats.opsUpdate;
                            clusterInfo.opsDelete = clusterInfo.opsDelete +  nodeStats.opsDelete;
                            clusterInfo.opsGetmore = clusterInfo.opsGetmore +  nodeStats.opsGetmore;
                            clusterInfo.opsCommand = clusterInfo.opsCommand +  nodeStats.opsCommand;
                            clusterInfo.docsDeleted = clusterInfo.docsDeleted +  nodeStats.docsDeleted;
                            clusterInfo.docsInserted = clusterInfo.docsInserted +  nodeStats.docsInserted;
                            clusterInfo.docsReturned = clusterInfo.docsReturned +  nodeStats.docsReturned;
                            clusterInfo.docsUpdated = clusterInfo.docsUpdated +  nodeStats.docsUpdated;
                            clusterInfo.transactionsActive = clusterInfo.transactionsActive +  nodeStats.transactionsActive;
                            clusterInfo.transactionsCommited = clusterInfo.transactionsCommited +  nodeStats.transactionsCommited;
                            clusterInfo.transactionsAborted = clusterInfo.transactionsAborted +  nodeStats.transactionsAborted;
                            clusterInfo.transactionsStarted = clusterInfo.transactionsStarted +  nodeStats.transactionsStarted;
                            totalNodes++;
                            
                            timestampValues.push(String(documentDBCluster[connectionId][clusterId][nodeId]["property"]["timestamp"]));
                            
                        }
                        
                       
                }
                
                clusterInfo.cpu = clusterInfo.cpu / totalNodes;
                clusterInfo.memory = clusterInfo.memory / totalNodes;
                
                if ( timestampEqual(timestampValues) && (documentDBCluster[connectionId][clusterId]["property"]["timestamp"] != timestampValues[0] ) ){
            
                    documentDBCluster[connectionId][clusterId]["property"]["timestamp"] = timestampValues[0];
                    documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('cpu',clusterInfo.cpu);
                    documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('memory',clusterInfo.memory);
                    documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('ioreads',clusterInfo.ioreads);
                    documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('iowrites',clusterInfo.iowrites);
                    documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('netin',clusterInfo.netin);
                    documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('netout',clusterInfo.netout);
        
                }   
        
                
                
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('connectionsCurrent',clusterInfo.connectionsCurrent);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('connectionsAvailable',clusterInfo.connectionsAvailable);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('connectionsCreated',clusterInfo.connectionsCreated);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('opsInsert',clusterInfo.opsInsert);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('opsQuery',clusterInfo.opsQuery);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('opsUpdate',clusterInfo.opsUpdate);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('opsDelete',clusterInfo.opsDelete);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('opsGetmore',clusterInfo.opsGetmore);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('opsCommand',clusterInfo.opsCommand);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('docsDeleted',clusterInfo.docsDeleted);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('docsInserted',clusterInfo.docsInserted);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('docsReturned',clusterInfo.docsReturned);
                documentDBCluster[connectionId][clusterId]["cluster"].addPropertyValue('docsUpdated',clusterInfo.docsUpdated);
                
                res.status(200).send( { 
                                        cluster : {
                                                    ...clusterInfo,
                                                    history : {
                                                                cpu: documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('cpu'),
                                                                memory: documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('memory'),
                                                                ioreads: documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('ioreads'),
                                                                iowrites: documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('iowrites'),
                                                                netin: documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('netin'),
                                                                netout: documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('netout'),
                                                                connectionsCurrent : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('connectionsCurrent'),
                                                                connectionsAvailable : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('connectionsAvailable'),
                                                                connectionsCreated : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('connectionsCreated'),
                                                                opsInsert : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('opsInsert'),
                                                                opsQuery : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('opsQuery'),
                                                                opsUpdate : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('opsUpdate'),
                                                                opsDelete : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('opsDelete'),
                                                                opsGetmore : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('opsGetmore'),
                                                                opsCommand : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('opsCommand'),
                                                                docsDeleted : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('docsDeleted'),
                                                                docsInserted : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('docsInserted'),
                                                                docsReturned : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('docsReturned'),
                                                                docsUpdated : documentDBCluster[connectionId][clusterId]["cluster"].getPropertyValues('docsUpdated'),
                                    
                                                    }
                                        },
                                        nodes : nodesInfo 
                });
                
        }
        catch(err){
                console.log(err);
        }
}



// DOCUMENTDB : Close Connection
app.get("/api/documentdb/cluster/connection/close/", closeDocumentDBConnectionAll);
async function closeDocumentDBConnectionAll(req, res) {
 
        try
            {
                var params = req.query;
                
                var connectionId = "$" + params.connectionId;
                var clusterId = "$" + params.clusterId;
                var nodes = documentDBCluster[connectionId][clusterId];
                
                for (let nodeId of Object.keys(nodes)) {
                        try {
                                    if (nodeId != "cluster"  && nodeId != "property" ) {
                                        console.log("DocumentDB Disconnection  : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                                        nodes[nodeId]["connection"].close();
                                    }
                            }
                        catch{
                              console.log("DocumentDB Disconnection error : " +  params.connectionId + " # " + params.clusterId + " # " + nodeId );
                          }
                        
                }
                
                delete documentDBCluster[params.connectionId];
                res.status(200).send( {"result":"disconnected"});
                
                
        }
        catch(err){
                console.log(err);
        }
}




//--#################################################################################################### 
//   ---------------------------------------- AWS
//--#################################################################################################### 


// AWS : List Instances - by Region
app.get("/api/aws/aurora/cluster/region/list/", (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var rds_region = new AWS.RDS({region: configData.aws_region});
    
    var params = {
        MaxRecords: 100
    };

    try {
        rds_region.describeDBClusters(params, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            res.status(200).send({ csrfToken: req.csrfToken(), data:data });
        });

    } catch(error) {
        console.log(error)
                
    }

});



// AWS : List Instances - by Region
app.get("/api/aws/aurora/cluster/region/endpoints/", (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var rds_region = new AWS.RDS({region: configData.aws_region});
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
        rds_region.describeDBInstances(params, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            res.status(200).send({ csrfToken: req.csrfToken(), data:data });
        });

    } catch(error) {
        console.log(error)
                
    }

});




// AWS : List Instances - by Region
app.get("/api/aws/rds/instance/region/list/", (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var rds_region = new AWS.RDS({region: configData.aws_region});
    
    var params = {
        MaxRecords: 100
    };

    try {
        rds_region.describeDBInstances(params, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            res.status(200).send({ csrfToken: req.csrfToken(), data:data });
        });

    } catch(error) {
        console.log(error)
                
    }

});






// AWS : Cloudwatch Information
app.get("/api/aws/clw/query/", (req,res)=>{
    
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    try {
            
            var params = req.query;
            
            params.MetricDataQueries.forEach(function(metric) {
                                metric.MetricStat.Metric.Dimensions[0]={ Name: metric.MetricStat.Metric.Dimensions[0]['[Name]'], Value: metric.MetricStat.Metric.Dimensions[0]['[Value]']};
                     
            })
                        
            cloudwatch.getMetricData(params, function(err, data) {
                if (err) 
                    console.log(err, err.stack); // an error occurred
                res.status(200).send(data);
            });
            
    
                   
    } catch(error) {
            console.log(error)
                    
    }
    

});


// AWS : Cloudwatch Information
app.get("/api/aws/clw/region/query/", (req,res)=>{

    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    try {
        
        var params = req.query;
        var cloudwatch_region = new AWS.CloudWatch({region: configData.aws_region, apiVersion: '2010-08-01'});
        params.MetricDataQueries.forEach(function(metric) {
                
                for(i_dimension=0; i_dimension <  metric.MetricStat.Metric.Dimensions.length; i_dimension++) {
                    metric.MetricStat.Metric.Dimensions[i_dimension]={ Name: metric.MetricStat.Metric.Dimensions[i_dimension]['[Name]'], Value: metric.MetricStat.Metric.Dimensions[i_dimension]['[Value]']};
                }          
        })
                    
        cloudwatch_region.getMetricData(params, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            res.status(200).send(data);
        });
        

               
    } catch(error) {
        console.log(error)
                
    }


});


// AWS : Cloudwatch Information
app.get("/api/aws/clw/region/logs/", (req,res)=>{
    
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    
    try {
        
        var params = req.query;
        var params_logs = {
          logStreamName: params.resource_id,
          limit: '1',
          logGroupName: 'RDSOSMetrics',
          startFromHead: false
        };
    
        cloudwatchlogs.getLogEvents(params_logs, function(err, data) {
          if (err) 
            console.log(err, err.stack); // an error occurred
          else   {
              res.status(200).send(data);
            
            }
        });
            
            

  

    } catch(error) {
        console.log(error)
                
    }


});



// AWS : Elasticache List nodes
app.get("/api/aws/region/elasticache/cluster/nodes/", (req,res)=>{

    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});


    var params = req.query;

    var parameter = {
      MaxRecords: 100,
      ReplicationGroupId: params.cluster
    };
    elasticache.describeReplicationGroups(parameter, function(err, data) {
      if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(401).send({ ReplicationGroups : []});
      }
      else {
            res.status(200).send({ csrfToken: req.csrfToken(), ReplicationGroups : data.ReplicationGroups})
          }
    });


});





// AWS : MemoryDB List nodes
app.get("/api/aws/region/memorydb/cluster/nodes/", (req,res)=>{
    
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});


    var params = req.query;

    var parameter = {
      ClusterName: params.cluster,
      ShowShardDetails: true
    };
    memorydb.describeClusters(parameter, function(err, data) {
      if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(401).send({ Clusters : []});
      }
      else {
            res.status(200).send({ csrfToken: req.csrfToken(), Clusters : data.Clusters})
          }
    });


});



// AWS : DocumentDB List clusters - by Region
app.get("/api/aws/docdb/cluster/region/list/", (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    var paramsQuery = req.query;
    
    var params = {
        DBClusterIdentifier: paramsQuery.cluster,
        MaxRecords: 100
    };

    try {
        docDB.describeDBClusters(params, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            res.status(200).send({ csrfToken: req.csrfToken(), data:data });
        });

    } catch(error) {
        console.log(error)
                
    }

});


//--#################################################################################################### 
//   ---------------------------------------- MAIN API CORE
//--#################################################################################################### 


app.listen(port, ()=>{
    console.log(`Server is running on ${port}`)
})