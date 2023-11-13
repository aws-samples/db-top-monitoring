
//-- Redis 
const redis = require("redis");
const redisInfo = require('redis-info');


//-- MongoDB
const { MongoClient } = require("mongodb");


//-- Postgresql
const postgresql = require('postgres-pool').Pool


//-- MySQL
const mysql = require('mysql2/promise')


//-- Mssql
const mssql = require('mssql')


//-- Oracle
const oracle = require('oracledb')


//-- AWS Object
const {classAWS} = require('./class.aws.js');
const AWSObject = new classAWS();


//-- Logging Object
const {classLogging} = require('./class.logging.js');



//--#################################################################################################### 
//   ---------------------------------------- GENERIC FUNCTIONS
//--#################################################################################################### 



const timestampEqual =
        arr => arr.every(v => v === arr[0]);


const convertArrayToObject = (array, key) => 
      array.reduce((acc, curr) =>(acc[curr[key]] = curr, acc), {});
      

//--#################################################################################################### 
//   ---------------------------------------- CLASS OBJECTS
//--#################################################################################################### 


//--#############
//--############# CLASS : classMetric                                                                                                
//--#############

class classMetrics {

          #objLog = new classLogging({ name : "classMetrics", instance : "generic" });
          //-- Constructor method
          constructor(object) { 
                    this.metricList = {};
                    this.metricDictionary=object.metrics;
                    this.totalSnaps = 0;
                    
                    this.currentObject = {};
                    this.oldObject = {};
                    
                    object.metrics.forEach(metric => {
                        this.metricList =  {...this.metricList, [metric.name]: { name : metric.name, label : metric.label, value : 0, type : metric.type, history : metric.history, data : Array(metric.history).fill(null), timestamp: "" } }
                        
                    });
                    
                    
          }
          
          
          //-- Object Init manual
          init(currentObject,currentTime,oldObject,oldTime) {
                    this.currentObject = currentObject;
                    this.currentTime = currentTime;
                    this.oldObject = oldObject;
                    this.oldTime = oldTime;
          }
          
          
          
          //-- Update values after snapshot
          #updateData(){
              
            try {
                
        
                for (let metric of Object.keys(this.metricList)) {
                    
                        
                        switch(this.metricList[metric].type){
                            
                            case 1 :         
                                if (  (this.currentObject[metric] - this.oldObject[metric]) > 0)
                                    this.metricList[metric].value = ( 
                                                    (
                                                            (this.currentObject[metric] - this.oldObject[metric]) / 
                                                            (Math.abs(this.currentTime - this.oldTime) / 1000)
                                                    ) || 0
                                    );
                                else 
                                    this.metricList[metric].value = 0;
                                
                                this.metricList[metric].data.push(this.metricList[metric].value);
                                this.metricList[metric].data = this.metricList[metric].data.slice(this.metricList[metric].data.length-this.metricList[metric].history);
                        
                                break;
                            
                            case 2: 
                                this.metricList[metric].value = this.currentObject[metric];
                                this.metricList[metric].data.push(this.metricList[metric].value);
                                this.metricList[metric].data = this.metricList[metric].data.slice(this.metricList[metric].data.length-this.metricList[metric].history);
                                
                                break;
                            
                            
                            case 3:
                                this.metricList[metric].value = this.currentObject[metric];
                                if ( this.metricList[metric].timestamp != this.currentTime){
                                            this.metricList[metric].data.push(this.metricList[metric].value);
                                            this.metricList[metric].data = this.metricList[metric].data.slice(this.metricList[metric].data.length-this.metricList[metric].history);
                                            this.metricList[metric].timestamp = this.currentTime;
                                }
                                break;
                                
                            case 4:
                                this.metricList[metric].value = this.currentObject[metric];
                                break;
                                
                                
                            case 5: 
                                if ( this.currentObject[metric + "Timestamp"] != this.oldObject[metric + "Timestamp"]) {
                                    this.metricList[metric].value = this.currentObject[metric];
                                    this.metricList[metric].data.push(this.metricList[metric].value);
                                    this.metricList[metric].data = this.metricList[metric].data.slice(this.metricList[metric].data.length-this.metricList[metric].history);
                                }
                                
                                break;
                                        
                            
                        }
                       
                }
            
            }
            catch(err){
                
                this.#objLog.write("#updateData","err",err)
                
            }
           
              
          }
          
          //-- Take new snapshot
          newSnapshot(currentObject,currentTime) {
                    
                    this.oldObject = this.currentObject;
                    this.oldTime = this.currentTime;
                    
                    this.currentObject = currentObject;
                    this.currentTime = currentTime;
                    this.totalSnaps++;
                    if (this.totalSnaps > 2)
                        this.#updateData();
                        
          }
          
          
          setItemValue(itemName,itemValue) {
                    this.metricList[itemName].value = itemValue;
                    if ( this.metricList[itemName].type == 1 ||  this.metricList[itemName].type == 2){
                        this.metricList[itemName].data.push(this.metricList[itemName].value);
                        this.metricList[itemName].data = this.metricList[itemName].data.slice(this.metricList[itemName].data.length-this.metricList[itemName].history);
                    }
          }
          
          
          setItemValueCustom(itemName,itemValue) {
                if ( this.metricList[itemName].type == 3 || this.metricList[itemName].type == 4 || this.metricList[itemName].type == 5 ){
                    this.metricList[itemName].value = itemValue;
                    this.metricList[itemName].data.push(this.metricList[itemName].value);
                    this.metricList[itemName].data = this.metricList[itemName].data.slice(this.metricList[itemName].data.length-this.metricList[itemName].history);
                }
          }
          
          getItemValue(itemName) {
                  return this.metricList[itemName].value;
          }
          
          getItemValueTimestamp(itemName) {
                if (this.metricList[itemName].type == 5 &&  this.totalSnaps > 1 )
                    return this.currentObject[itemName+"Timestamp"];
                else
                    return null;
                    
          }
          
          getItem(itemName) {
                  return { value : this.metricList[itemName].value , history : { name : itemName, data : this.metricList[itemName].data } };
          }
          
                   
          
          getMetricList(){
              
            try {
              
                var metrics = {};
                var history = {};
                for (let metric of Object.keys(this.metricList)) {
                    metrics = { ...metrics, [metric] : this.metricList[metric].value };
                    history = { ...history, [metric] : { name : metric, data : this.metricList[metric].data } }
                };
                
                return { ...metrics, history : history };
            
            }
            catch(err){
                this.#objLog.write("getMetricList","err",err)
            }
                
          }
          
          getMetricDictionary(){
           
             return this.metricDictionary;
                
          }
          
          
          
          
}



//--#############
//--############# CLASS : classCluster                                                                                                
//--#############



class classCluster {

          objectProperties;
          #objLog = new classLogging({ name : "classCluster", instance : "generic" });
          #osMetricTimestamp = [];
        
          //-- Constructor method
          constructor(object) { 
                 
                    this.objectProperties = object.properties;
                    this.objectConnection = object.connection;
                    this.objectMetricList = object.metrics;
                    this.objectNodes = [];
                    this.objectMetrics = new classMetrics({ metrics : object.metrics }) ;
                    this.#objLog.properties = {...this.#objLog.properties, instance : object.properties.name}
                    
          }
          

          //-- Refresh Data
          async refreshData() {
              
                try{
                
                    this.objectProperties.lastUpdate = new Date().toTimeString().split(' ')[0];
                    var clusterInfo;
                    switch(this.objectProperties.engineType){
                        
                        case "elasticache":
                        case "memorydb":
                                
                                //-- Update Cluster State        
                                if ( this.objectProperties.engineType == "elasticache" )
                                    clusterInfo = await AWSObject.getElasticacheClusterStatus(this.objectProperties.clusterId);
                                else 
                                    clusterInfo = await AWSObject.getMemoryDBClusterStatus(this.objectProperties.clusterId);
                                
                                //-- Update Metrics
                                var nodeActivity = {};
                                var metrics= {};
                                
                                this.objectMetrics.getMetricDictionary().forEach(metric => {
                                    nodeActivity[metric.name] = 0;
                                    metrics[metric.name] = 0;
                                    for (let node of Object.keys(this.objectNodes)) {
                                        metrics[metric.name] = metrics[metric.name] + ( this.objectNodes[node].getMetricValue(metric.name) || 0 );
                                        if ( ( this.objectNodes[node].getMetricValue(metric.name) || 0 ) > 0)
                                            nodeActivity[metric.name] = nodeActivity[metric.name] + 1 ;
                                    }
                                });
                                
                                
                                //-- Update generic metrics
                                for (let item of Object.keys(metrics)) {
                                    this.objectMetrics.setItemValue(item, metrics[item]);
                                }
                                
                                //-- Update special metrics : cpu, memory, getLatency, setLatency, cacheHitRate
                                this.objectMetrics.setItemValueCustom("cpu" , metrics["cpu"] / nodeActivity["cpu"]);
                                this.objectMetrics.setItemValueCustom("memory" , metrics["memory"] / nodeActivity["memory"]);
                                this.objectMetrics.setItemValueCustom("getLatency" , metrics["getLatency"] / nodeActivity["getLatency"]);
                                this.objectMetrics.setItemValueCustom("setLatency" , metrics["setLatency"] / nodeActivity["setLatency"]);
                                this.objectMetrics.setItemValueCustom("cacheHitRate" , metrics["cacheHitRate"] / nodeActivity["cacheHitRate"]);
                        break;
                        
                        
                        
                        
                        case "documentdb":
                        
                                
                                //-- Update Cluster State   
                                
                                clusterInfo = await AWSObject.getDocumentDBClusterStatus(this.objectProperties.clusterId);
                                
                                
                                //-- Update Metrics
                                
                                var nodeActivity = {};
                                var metrics= {};
                                var metricTimestamp = [];
                                
                                this.objectMetrics.getMetricDictionary().forEach(metric => {
                                    if (metric.type != 6 ) {
                                        
                                        nodeActivity[metric.name] = 0;
                                        metrics[metric.name] = 0;
                                        metricTimestamp[metric.name] = [];
                                        
                                        for (let node of Object.keys(this.objectNodes)) {
                                            
                                            if (metric.type == 5 )
                                                metricTimestamp[metric.name].push(this.objectNodes[node].getMetricValueTimestamp(metric.name));
                                            
                                            metrics[metric.name] = metrics[metric.name] + ( this.objectNodes[node].getMetricValue(metric.name) || 0 );
                                            
                                            if ( ( this.objectNodes[node].getMetricValue(metric.name) || 0 ) > 0)
                                                nodeActivity[metric.name] = nodeActivity[metric.name] + 1 ;
                                            
                                        }
                                        
                                    }
                                });
                                
                                
                                //-- Update generic metrics
                                
                                for (let item of Object.keys(metrics)) {
                                    if ( !(['cpu','memory','ioreads','iowrites','netin','netout'].includes(item)))
                                        this.objectMetrics.setItemValue(item, metrics[item]);
                                }
                                
                                
                                //-- Update special metrics : cpu, memory, ioreads, iowrites, netin, netout
                               
                                if ( timestampEqual(metricTimestamp["cpu"]) &&  this.#osMetricTimestamp['cpu'] != metricTimestamp["cpu"][0] ) {
                                    this.objectMetrics.setItemValueCustom("cpu" , metrics["cpu"] / nodeActivity["cpu"]);
                                    this.#osMetricTimestamp['cpu'] = metricTimestamp["cpu"][0];
                                }
                                
                                if ( timestampEqual(metricTimestamp['memory']) &&  this.#osMetricTimestamp['memory'] != metricTimestamp["memory"][0] ) {
                                    this.objectMetrics.setItemValueCustom("memory" , metrics["memory"] / nodeActivity["memory"]);
                                    this.#osMetricTimestamp['memory'] = metricTimestamp["memory"][0];
                                } 
                                
                                if ( timestampEqual(metricTimestamp['ioreads']) &&  this.#osMetricTimestamp['ioreads'] != metricTimestamp["ioreads"][0] ) {
                                    this.objectMetrics.setItemValueCustom("ioreads" , metrics["ioreads"]);
                                    this.#osMetricTimestamp['ioreads'] = metricTimestamp["ioreads"][0];
                                } 
                                
                                if ( timestampEqual(metricTimestamp['iowrites']) &&  this.#osMetricTimestamp['iowrites'] != metricTimestamp["iowrites"][0] ) {
                                    this.objectMetrics.setItemValueCustom("iowrites" , metrics["iowrites"]);
                                    this.#osMetricTimestamp['iowrites'] = metricTimestamp["iowrites"][0];
                                } 
                               
                                if ( timestampEqual(metricTimestamp['netin']) &&  this.#osMetricTimestamp['netin'] != metricTimestamp["netin"][0] ) {
                                    this.objectMetrics.setItemValueCustom("netin" , metrics["netin"]);
                                    this.#osMetricTimestamp['netin'] = metricTimestamp["netin"][0];
                                }
                                
                                if ( timestampEqual(metricTimestamp['netout']) &&  this.#osMetricTimestamp['netout'] != metricTimestamp["netout"][0] ) {
                                    this.objectMetrics.setItemValueCustom("netout" , metrics["netout"]);
                                    this.#osMetricTimestamp['netout'] = metricTimestamp["netout"][0];
                                } 
                                
                        break;
                        
                        
                        case "aurora-postgresql":
                        case "aurora-mysql":
                        
                                
                                //-- Update Cluster State   
                                clusterInfo = await AWSObject.getAuroraClusterStatus(this.objectProperties.clusterId);
                                
                                //-- Update Instance Status
                                var instancesInfo = await AWSObject.getAuroraNodesStatus(this.objectProperties.clusterId);
                                
                                
                                //-- Update Metrics
                                var nodeActivity = {};
                                var metrics= {};
                                var metricTimestamp = [];
                                
                                this.objectMetrics.getMetricDictionary().forEach(metric => {
                                        
                                        nodeActivity[metric.name] = 0;
                                        metrics[metric.name] = 0;
                                        
                                        for (let node of Object.keys(this.objectNodes)) {
                                            
                                            metrics[metric.name] = metrics[metric.name] + ( this.objectNodes[node].getMetricValue(metric.name) || 0 );
                                            
                                            if ( ( this.objectNodes[node].getMetricValue(metric.name) || 0 ) > 0)
                                                nodeActivity[metric.name] = nodeActivity[metric.name] + 1 ;
                                            
                                            this.objectNodes[node].objectProperties.status = instancesInfo[node].status;
                                            this.objectNodes[node].objectProperties.size = instancesInfo[node].size;
                                            this.objectNodes[node].objectProperties.monitoring = instancesInfo[node].monitoring;
                                            
                                        }
                                     
                                });
                                
                                
                                //-- Update generic metrics
                                for (let item of Object.keys(metrics)) {
                                    if ( !(['cpu','memory'].includes(item)))
                                        this.objectMetrics.setItemValue(item, metrics[item]);
                                }
                                
                                 //-- Update special metrics : cpu, memory
                                this.objectMetrics.setItemValue("cpu" , metrics["cpu"] / nodeActivity["cpu"]);
                                this.objectMetrics.setItemValue("memory" , metrics["memory"] / nodeActivity["memory"]);
                                
                        break;
                        
                        
                    }
                    
                    
                    this.objectProperties = {...this.objectProperties, ...clusterInfo};
                    
                    //-- Gather new node stats
                    for (let node of Object.keys(this.objectNodes)) {
                            this.objectNodes[node].gatherMetrics();
                    }
            
            }
            catch(err){
                this.#objLog.write("refreshData","err",err);
            }
            
              
          }
          
          
          
          //-- Get Metric List
          async addNodeList() {
                try {
                
                    switch(this.objectProperties.engineType){
                        
                            case "elasticache":
                            case "memorydb":
                                    var nodeList = [];
                                    if ( this.objectProperties.engineType == "elasticache")
                                        nodeList = await AWSObject.getElasticacheNodes(this.objectProperties.clusterId);
                                    else
                                        nodeList = await AWSObject.getMemoryDBNodes(this.objectProperties.clusterId);
                                    
                                    var nodeId = 1;
                                    nodeList.forEach((node) => {
                                             this.objectNodes[node.nodeId] = new classNode({ 
                                                                                properties : {...this.objectProperties, name : node.nodeId, uid : this.objectProperties.engineType + ":" + node.nodeId, networkRate : node.networkRate, size : node.nodeType, nodeId : nodeId, cacheClusterId : node.cacheClusterId,cacheNodeId : node.cacheNodeId, }, 
                                                                                connection : {...this.objectConnection,...node}, 
                                                                                metrics : this.objectMetricList 
                                                                            });
                                            nodeId++;
                                    });
                            break;
                         
                                                        
                            case "documentdb":
                                    var nodeList = await AWSObject.getDocumentDBNodes(this.objectProperties.clusterId);
                                    var nodeId = 1;
                                    nodeList.forEach((node) => {
                                             this.objectNodes[node.nodeId] = new classNode({ 
                                                                                properties : {...this.objectProperties, 
                                                                                              name : node.nodeId, 
                                                                                              uid : this.objectProperties.engineType + ":" + node.nodeId, 
                                                                                              networkRate : node.networkRate, 
                                                                                              size : node.nodeType, 
                                                                                              nodeId : nodeId, 
                                                                                              instanceId : node.instanceId, 
                                                                                              resourceId : node.resourceId, 
                                                                                              monitoring : node.monitoring,
                                                                                              role : node.role,
                                                                                              status : node.status,
                                                                                              az : node.az,
                                                                                              
                                                                                }, 
                                                                                connection : {...this.objectConnection,...node}, 
                                                                                metrics : this.objectMetricList 
                                                                            });
                                            nodeId++;
                                    });
                                    this.#osMetricTimestamp['cpu'] = "";
                                    this.#osMetricTimestamp['memory'] = "";
                                    this.#osMetricTimestamp['ioreads'] = "";
                                    this.#osMetricTimestamp['iowrites'] = "";
                                    this.#osMetricTimestamp['netin'] = "";
                                    this.#osMetricTimestamp['netout'] = "";
                                    
                            break;
                            
                            
                            
                            case "aurora-postgresql":
                            case "aurora-mysql":
                                    var nodeList = await AWSObject.getAuroraNodes(this.objectProperties.clusterId);
                                    var nodeId = 1;
                                    nodeList.forEach((node) => {
                                             this.objectNodes[node.nodeId] = new classNode({ 
                                                                                properties : {...this.objectProperties, 
                                                                                              name : node.nodeId, 
                                                                                              uid : this.objectProperties.engineType + ":" + node.nodeId, 
                                                                                              networkRate : node.networkRate, 
                                                                                              size : node.nodeType, 
                                                                                              nodeId : nodeId, 
                                                                                              instanceId : node.instanceId, 
                                                                                              resourceId : node.resourceId, 
                                                                                              monitoring : node.monitoring,
                                                                                              role : node.role,
                                                                                              status : node.status,
                                                                                              az : node.az,
                                                                                              
                                                                                }, 
                                                                                connection : {...this.objectConnection,...node}, 
                                                                                metrics : this.objectMetricList 
                                                                            });
                                            nodeId++;
                                    });
                                    
                            break;
                        
                        
                        
                        
                    }
                
                
                                                                        
                }
                catch(err){
                    this.#objLog.write("addNodeList","err",err);
                }
            
          }
          
          //-- Get Metric List
          getMetricList() {
                try {
                      var nodes = [];
                      for (let node of Object.keys(this.objectNodes)) {
                                nodes.push(this.objectNodes[node].getMetricList());;
                      }
                      return {...this.objectMetrics.getMetricList(), nodes : nodes };
                }
                catch(err){
                    this.#objLog.write("getMetricList","err",err);
                }
            
          }
          
          
          //-- Get Metric List
          getAllDataCluster(object) {
                try{
                      var nodes = [];
                      var sessions = [];
                      for (let node of Object.keys(this.objectNodes)) {
                                var data = this.objectNodes[node].getAllDataNode();
                                nodes.push(data);
                                if (object.includeSessions == 1)
                                    sessions = sessions.concat(data.sessions);
                      }
                      return {...this.objectProperties,...this.objectMetrics.getMetricList(), nodes : nodes, sessions : sessions };
                }
                catch(err){
                    this.#objLog.write("getAllDataCluster","err",err);
                }
          }
          
          
          //-- Get Metric List
          getClusterNodeListIds() {
                try {
                        var list = "";
                        switch(this.objectProperties.engineType){
                            
                            case "elasticache":
                            case "memorydb":
                                      for (let node of Object.keys(this.objectNodes)) {
                                            list = list + this.objectNodes[node].objectProperties.cacheClusterId + "|" + this.objectNodes[node].objectProperties.cacheNodeId + ",";
                                      }
                                    break;
                                    
                                    
                            case "documentdb":
                                      for (let node of Object.keys(this.objectNodes)) {
                                            list = list + this.objectNodes[node].objectProperties.instanceId + ",";
                                      }
                                    break;
                            
                            case "aurora-postgresql":
                            case "aurora-mysql":
                                      for (let node of Object.keys(this.objectNodes)) {
                                            list = list + this.objectNodes[node].objectProperties.instanceId + ",";
                                      }
                                    break;
                                    
                       }
                      return list.slice(0, -1);
                }
                catch(err){
                    this.#objLog.write("getClusterNodeListIds","err",err);
                }
                
          }
          

          //-- Get Properties
          getProperties() {
            return this.objectProperties;
          }
          
          //-- Set Properties
          setProperties(objectProperties) {
             this.objectProperties = { ... objectProperties } ;
          }
          
          
          //-- Get Connection
          getConnection() {
            return this.objectConnection;
          }
          
          //-- Set Connection
          setConnection(objectConnection) {
            this.objectConnection = {...objectConnection };
            
          }
          
          //-- Open Connection
          async connectNodes(){
                try{
                        for (let node of Object.keys(this.objectNodes)) {
                                this.objectNodes[node].connect();
                        }
                }
                catch(err){
                    this.#objLog.write("connectNodes","err",err);
                }
          }
          
          
          //-- Close Connection
          async disconnectNodes(){
                try {
                        for (let node of Object.keys(this.objectNodes)) {
                                    this.objectNodes[node].disconnect();
                                    delete this.objectNodes[node];
                        }
                }
                catch(err){
                    this.#objLog.write("disconnectNodes","err",err);
                }
          }
          

}


//--#############
//--############# CLASS : classNode                                                                                                
//--#############

class classNode {

        objectProperties;
        objectSessions;
        #engineConnector = {};
        #objLog = new classLogging({ name : "classNode", instance : "generic" });

          //-- Constructor method
          constructor(object) { 
               
                    this.objectProperties = object.properties;
                    this.objectConnection = {...object.connection, engineType : object.properties.engineType};
                    this.objectMetricList = object.metrics;
                    this.objectMetrics = new classMetrics({ metrics : object.metrics }) ;
                    this.#objLog.properties = {...this.#objLog.properties, instance : object.properties.name}
                    this.objectSessions = [];
          }
          
          
          //-- Update node properties
          updateNodeProperties(objectProperties) { 
               this.objectProperties = {...objectProperties};
          }
          
          //-- Update node properties
          updateNodeConnection(objectConnection) { 
               this.objectConnection = {...objectConnection};
          }
          
          async connect(){
                try {
                      switch(this.objectProperties.engineType) {
                          
                            case "elasticache":
                            case "memorydb":
                                  this.#engineConnector = new classRedisEngine(this.objectConnection);
                                  break;
                                  
                            
                            case "documentdb":
                                  this.#engineConnector = new classMongoDBEngine(this.objectConnection);
                                  break;
                                  
                            case "aurora-postgresql":
                                  this.#engineConnector = new classPostgresqlEngine(this.objectConnection);
                                  break;
                            
                            case "aurora-mysql":
                                  this.#engineConnector = new classMysqlEngine(this.objectConnection);
                                  break;
                        
                      }
                      this.#engineConnector.connect();
                }
                catch(err){
                    this.#objLog.write("connect","err",err);
                }
              
              //...
          }
          
          async disconnect() {
              this.#engineConnector.disconnect();
              
          }
          
          async gatherMetrics(){
                
                try {
                    
                    //-- Snapshot metrics
                    var timeNow = new Date();
                    var currentData = await this.#engineConnector.getSnapshot();
                    var snapshot = {};
                    
                    this.objectProperties = {...this.objectProperties, ...currentData['properties'] }
                    for (let metric of Object.keys(currentData['metrics'])) {
                        snapshot = {...snapshot, [metric] : currentData['metrics'][metric]};
                    }
                    this.objectMetrics.newSnapshot(snapshot,timeNow.getTime());
                    
                    
                    
                    //-- Active Sessions 
                    switch(this.objectProperties.engineType) {
                      
                            case "documentdb":
                                            this.objectSessions = await this.#engineConnector.getActiveSessions();
                            
                            case "aurora-postgresql":
                            case "aurora-mysql":
                                            this.objectSessions = await this.#engineConnector.getActiveSessions();
                                            
                            break;    
                    }
                    
                    
                    //-- Update Custom metrics
                    switch(this.objectProperties.engineType) {
                      
                            case "elasticache":
                            case "memorydb":
                                            this.objectMetrics.setItemValueCustom("cpu",(this.objectMetrics.getItemValue("cpuUser") * 100 ) +  (this.objectMetrics.getItemValue("cpuSys") * 100 ));
                                            this.objectMetrics.setItemValueCustom("memory", (this.objectMetrics.getItemValue("memoryUsed") / this.objectMetrics.getItemValue("memoryTotal") ) * 100);
                                            this.objectMetrics.setItemValueCustom("getLatency", this.objectMetrics.getItemValue("getUsec") / this.objectMetrics.getItemValue("getCalls"));
                                            this.objectMetrics.setItemValueCustom("setLatency", this.objectMetrics.getItemValue("setUsec") / this.objectMetrics.getItemValue("setCalls"));
                                            this.objectMetrics.setItemValueCustom("cacheHitRate", (this.objectMetrics.getItemValue("keyspaceHits") /
                                                            ( this.objectMetrics.getItemValue("keyspaceHits") + this.objectMetrics.getItemValue("keyspaceMisses"))
                                                           ) * 100);
                                            this.objectMetrics.setItemValueCustom("network", ( ( ( this.objectMetrics.getItemValue("netIn") + this.objectMetrics.getItemValue("netOut")) ) / this.objectProperties.networkRate ) * 100 );
                            
                            break;    
                    }
                    
                    
                    
                    
                }
                catch(err){
                    this.#objLog.write("gatherMetrics","err",err);
                }
                
          }
          
          
            
          
            getMetricList(){
                return this.objectMetrics.getMetricList();
            }
          
            getAllDataNode(){
                return {...this.objectMetrics.getMetricList(),...this.objectProperties, sessions : this.objectSessions };
            }
          
            getMetricValue(itemName){
                return this.objectMetrics.getItemValue(itemName);
            }
          
            getMetricValueTimestamp(itemName){
                return this.objectMetrics.getItemValueTimestamp(itemName);
            }
          
            setConnection(objectConnection) {
                this.objectConnection = {...objectConnection };
            }
          
            getProperties(){
                return this.objectProperties;
            }
          
          
}




//--#############
//--############# CLASS : classInstance                                                                                                
//--#############

class classInstance {

        objectProperties;
        objectSessions;
        objectProcesses;
        #engineConnector = {};
        #objLog = new classLogging({ name : "classInstance", instance : "generic" });

          //-- Constructor method
          constructor(object) { 
               
                    this.objectProperties = object.properties;
                    this.objectConnection = {...object.connection, engineType : object.properties.engineType};
                    this.objectMetricList = object.metrics;
                    this.objectMetrics = new classMetrics({ metrics : object.metrics }) ;
                    this.#objLog.properties = {...this.#objLog.properties, instance : object.properties.name}
                    this.objectSessions = [];
          }
          
          
          
            async connect(){
                try {
                      switch(this.objectProperties.engineType) {
                          
                           
                            
                            case 'mysql':
                            case 'mariadb':   
                            case 'aurora-mysql':
                                    this.#engineConnector = new classMysqlEngine(this.objectConnection);
                                    break;
                                  
                            case 'postgres':
                            case 'aurora-postgresql':
                                    this.#engineConnector = new classPostgresqlEngine(this.objectConnection);
                                    break;
                                  
                            case 'sqlserver-se':
                            case 'sqlserver-ee':
                            case 'sqlserver-ex':
                            case 'sqlserver-web':
                                    this.#engineConnector = new classSqlserverEngine(this.objectConnection);
                                    break;
                                    
                            
                            case 'oracle-ee':
                            case 'oracle-ee-cdb':
                            case 'oracle-se2':
                            case 'oracle-se2-cdb':
                                    this.#engineConnector = new classOracleEngine(this.objectConnection);
                                    break;
                                
                        
                      }
                      this.#engineConnector.connect();
                }
                catch(err){
                    this.#objLog.write("connect","err",err);
                }
              
            }
          
            async disconnect() {
              
              this.#engineConnector.disconnect();
              
            }
          
            async refreshData(){
                
                try {
                    
                    // Instance Status
                    var instanceInfo =  await AWSObject.getRdsInstanceStatus(this.objectProperties.instanceId);
                    this.objectProperties.lastUpdate = new Date().toTimeString().split(' ')[0];
                    this.objectProperties.status = instanceInfo.status;
                    this.objectProperties.az = instanceInfo.az;
                    this.objectProperties.size = instanceInfo.size;
                    
                    //-- Snapshot metrics
                    var timeNow = new Date();
                    var currentData = await this.#engineConnector.getSnapshotInstance();
                    var snapshot = {};
                    
                    this.objectProperties = {...this.objectProperties, ...currentData['properties'] };
                    
                    for (let metric of Object.keys(currentData['metrics'])) {
                        snapshot = {...snapshot, [metric] : currentData['metrics'][metric]};
                    }
                    this.objectMetrics.newSnapshot(snapshot,timeNow.getTime());
                    
                    this.objectProcesses = currentData['processes'];
                    
                    //-- Active Sessions 
                    this.objectSessions = await this.#engineConnector.getActiveSessions();
                    
                    
                }
                catch(err){
                    this.#objLog.write("gatherMetrics","err",err);
                }
                
            }
          
            getAllDataInstance(object){
                return {...this.objectMetrics.getMetricList(),...this.objectProperties, sessions : this.objectSessions, processes : ( object.includeProcesses == true ? this.objectProcesses : []) };
            }
            
            
            executeQuery(object){
                try {
                    
                    return this.#engineConnector.executeQuery(object);
                    
                }
                catch(err){
                    this.#objLog.write("executeQuery","err",err);
                }
            }
          
            
          
}




//--#############
//--############# CLASS : classRedisNode                                                                                               
//--#############


class classRedisEngine {

        #objLog = new classLogging({ name : "classRedisEngine", instance : "generic" });
        #connection = {};
        //-- Constructor method
        constructor(objectConnection) { 
                this.objectConnection = objectConnection;
                this.isAuthenticated = false;
                this.#objLog.properties = {...this.#objLog.properties, instance : objectConnection.host }
        }
          
        
        //-- Open Connection
        async #openConnection() { 
            
            
                this.isAuthenticated = false;
                var params = this.objectConnection;
            
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
                                
                                this.#connection = redis.createClient(options);
                                this.#connection.on('error', err => {       
                                          this.#objLog.write("#openConnection","err","Error :" + err.message + ", host : " +  + params.host);
                                });   
                            
                            
                    
                                this.#connection.connect()
                                    .then(()=> {
                                        this.#objLog.write("#openConnection","info","Redis Instance Connected : " + params.host);
                                    })
                                    .catch((err)=> {
                                        this.#objLog.write("#openConnection","err","Redis Instance Connected with Errors : "  + params.host);
                                        this.#objLog.write("#openConnection","err",err);
                                        
                                });
                                
                                
                                
                                var command = await this.#connection.ping();
                                this.isAuthenticated = true;
                                
                               
                }
                catch(err){
                    this.#objLog.write("#openConnection","err",err);
                }
            

        }
        
        connect() { 
            this.#openConnection();
        }
        
        
        //-- Close Connection
        async #closeConnection() { 
            try {
                this.#objLog.write("#closeConnection","info", "Disconnection completed : " + this.objectConnection.host );
                if (this.#connection.isReady)
                    this.#connection.quit();
            }
            catch(err){
                    this.#objLog.write("#closeConnection","err", String(err) + "-" + this.objectConnection.host );
            }
            
        }
        
        //-- Close Connection
        disconnect() { 
            this.#closeConnection();
        }
    
        
        //-- Verify connection
        async isConnected() { 
                try {
                        
                            var command = await this.#connection.ping();
                            if (command =="PONG")
                                return true;
                            else
                                return false;
                }
                catch(err){
                    return false;
                }
            
        }
        
        
        //-- Authentication
        async authentication() { 
            try {
                    await this.#openConnection();
                    await this.#closeConnection();
                    return this.isAuthenticated;
            }
            catch(err){
                return this.isAuthenticated;;
            }
        }
        
        
        
        //-- Gather metrics
        async getSnapshot(){
                try
                {
                        
                            //-- Node Info Stats 
                            var rawInfo = await this.#connection.info();
                            var jsonInfo = redisInfo.parse(rawInfo);
                            
                            //-- Node Command Stats
                            var commands = await this.#connection.sendCommand(['INFO','Commandstats']);
                            
                            var totalCalls = 0;
                            var iRowLine = 0;
                            var dataResult = "";
                            commands.split(/\r?\n/).forEach((line) => {
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
                            
                            var metrics = {
                                            cpuUser: parseFloat(jsonInfo['used_cpu_user']),
                                            cpuSys: parseFloat(jsonInfo['used_cpu_sys']),
                                            memoryUsed: parseFloat(jsonInfo['used_memory']),
                                            memoryTotal: parseFloat(jsonInfo['maxmemory']),
                                            operations: totalCalls,
                                            getCalls: (( jsonCommands.hasOwnProperty('cmdstat_get') ) ? parseFloat(jsonCommands['cmdstat_get']['calls']) : 0) ,
                                            getUsec: (( jsonCommands.hasOwnProperty('cmdstat_get') ) ? parseFloat(jsonCommands['cmdstat_get']['usec']) : 0) ,
                                            setCalls : (( jsonCommands.hasOwnProperty('cmdstat_set') ) ? parseFloat(jsonCommands['cmdstat_set']['calls']) : 0) ,
                                            setUsec : (( jsonCommands.hasOwnProperty('cmdstat_set') ) ? parseFloat(jsonCommands['cmdstat_set']['usec']) : 0) ,
                                            connectedClients: parseFloat(jsonInfo['connected_clients']),
                                            keyspaceHits: parseFloat(jsonInfo['keyspace_hits']),
                                            keyspaceMisses: parseFloat(jsonInfo['keyspace_misses']),
                                            netIn: parseFloat(jsonInfo['total_net_input_bytes']),
                                            netOut: parseFloat(jsonInfo['total_net_output_bytes']),
                                            connectionsTotal: parseFloat(jsonInfo['total_connections_received']),
                                            commands: parseFloat(jsonInfo['total_commands_processed']),
                                            cmdExec: (( jsonCommands.hasOwnProperty('cmdstat_exec') ) ? parseFloat(jsonCommands['cmdstat_exec']['calls']) : 0) ,
                                            cmdAuth: (( jsonCommands.hasOwnProperty('cmdstat_auth') ) ? parseFloat(jsonCommands['cmdstat_auth']['calls']) : 0) ,
                                            cmdInfo: (( jsonCommands.hasOwnProperty('cmdstat_info') ) ? parseFloat(jsonCommands['cmdstat_info']['calls']) : 0) ,
                                            cmdScan: (( jsonCommands.hasOwnProperty('cmdstat_scan') ) ? parseFloat(jsonCommands['cmdstat_scan']['calls']) : 0) ,
                                            cmdXadd: (( jsonCommands.hasOwnProperty('cmdstat_xadd') ) ? parseFloat(jsonCommands['cmdstat_xadd']['calls']) : 0) ,
                                            cmdZadd: (( jsonCommands.hasOwnProperty('cmdstat_zadd') ) ? parseFloat(jsonCommands['cmdstat_zadd']['calls']) : 0) ,
                            };
                                        
                            var properties = { role : jsonInfo['role'] };
                            return { properties : properties, metrics : metrics };
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { role : "-" }, metrics : {} };
                 
                }
            
        }
        
          
}


//--#############
//--############# CLASS : classMongoDBEngine                                                                                               
//--#############


class classMongoDBEngine {

        //-- Looging
        #objLog = new classLogging({ name : "classMongoDBNode", instance : "generic" });
        #connection = {};
        
        //-- OS Metrics
        #dimension;
        #metricList;
                  
        
        //-- Constructor method
        constructor(objectConnection) { 
                this.objectConnection = objectConnection;
                this.isAuthenticated = false;
                this.#objLog.properties = {...this.#objLog.properties, instance : objectConnection.host }
                
                this.#dimension = [ { Name: "DBInstanceIdentifier", Value: this.objectConnection.instanceId } ];
                this.#metricList = [{
                            namespace : "AWS/DocDB",
                            metric : "CPUUtilization",
                            dimension : this.#dimension
                        },
                        {
                            namespace : "AWS/DocDB",
                            metric : "FreeableMemory",
                            dimension : this.#dimension
                        },
                        {
                            namespace : "AWS/DocDB",
                            metric : "ReadIOPS",
                            dimension : this.#dimension
                        },
                        {
                            namespace : "AWS/DocDB",
                            metric : "WriteIOPS",
                            dimension : this.#dimension
                        },
                        {
                            namespace : "AWS/DocDB",
                            metric : "NetworkReceiveThroughput",
                            dimension : this.#dimension
                        },
                        {
                            namespace : "AWS/DocDB",
                            metric : "NetworkTransmitThroughput",
                            dimension : this.#dimension
                        },
                        {
                            namespace : "AWS/DocDB",
                            metric : "NetworkThroughput",
                            dimension : this.#dimension
                        },
                ];
        
        }
          
        
        //-- Open Connection
        async #openConnection() { 
            
            
                this.isAuthenticated = false;
                var params = this.objectConnection;
            
                try {
                    
                                this.#objLog.write("#openConnection","info","DocumentDB Instance Connected : " + params.host);
                                
                                const uri = "mongodb://" + params.username  + ":" + params.password +"@" + params.host + ":" + params.port +"/?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false&directConnection=true";
                    
                                this.#connection = new MongoClient(uri);
            
                                await this.#connection.connect();
                                var command = await this.#connection.db("admin").command({ ping: 1 });
                                this.isAuthenticated = true;
                                
                               
                }
                catch(err){
                    this.#objLog.write("#openConnection","err",err);
                }
            

        }
        
        connect() { 
            this.#openConnection();
        }
        
        
        //-- Close Connection
        async #closeConnection() { 
            try {
                this.#objLog.write("#closeConnection","info", "Disconnection completed : " + this.objectConnection.host );
                    this.#connection.close();
            }
            catch(err){
                    this.#objLog.write("#closeConnection","err", String(err) + "-" + this.objectConnection.host );
            }
            
        }
        
        //-- Close Connection
        disconnect() { 
            this.#closeConnection();
        }
    
        
        //-- Verify connection
        async isConnected() { 
                try {
                        
                            var command = await this.#connection.db("admin").command({ ping: 1 });
                            if (command =="OK")
                                return true;
                            else
                                return false;
                }
                catch(err){
                    return false;
                }
            
        }
        
        
        //-- Authentication
        async authentication() { 
            try {
                    await this.#openConnection();
                    await this.#closeConnection();
                    return this.isAuthenticated;
            }
            catch(err){
                return this.isAuthenticated;;
            }
        }
        
        
        
        //-- Gather metrics
        async getSnapshot(){
                try
                {
            
                            //-- Current Operations
                            const currentOperations = await this.#connection.db("admin").command({ serverStatus: 1 });
                    
                    
                            //-- Current Role
                            const currentStatus = await this.#connection.db("admin").command({ isMaster : 1 });
                    
                    
                            //-- OS Metrics
                            const osMetrics = await AWSObject.getOSMetrics({ monitoring : this.objectConnection.monitoring,
                                                                             resourceId : this.objectConnection.resourceId,
                                                                             metrics : this.#metricList
                                                                            });
                            var metrics = {
                                            cpu: osMetrics.cpu,
                                            cpuTimestamp: osMetrics.cpuTimestamp,
                                            memory: osMetrics.memory,
                                            memoryTimestamp: osMetrics.memoryTimestamp,
                                            ioreads: osMetrics.ioreads,
                                            ioreadsTimestamp: osMetrics.ioreadsTimestamp,
                                            iowrites: osMetrics.iowrites,
                                            iowritesTimestamp: osMetrics.iowritesTimestamp,
                                            iops: osMetrics.iowrites + osMetrics.ioreads,
                                            iopsTimestamp: osMetrics.iowritesTimestamp,
                                            netin: osMetrics.netin,
                                            netinTimestamp: osMetrics.netinTimestamp,
                                            netout: osMetrics.netout,
                                            netoutTimestamp: osMetrics.netoutTimestamp,
                                            network: osMetrics.netin + osMetrics.netout,
                                            networkTimestamp: osMetrics.netoutTimestamp,
                                            connectionsCurrent : currentOperations['connections']['current'],
                                            connectionsAvailable : currentOperations['connections']['available'],
                                            connectionsCreated : currentOperations['connections']['totalCreated'],
                                            opsInsert : currentOperations['opcounters']['insert'],
                                            opsQuery : currentOperations['opcounters']['query'],
                                            opsUpdate : currentOperations['opcounters']['update'],
                                            opsDelete : currentOperations['opcounters']['delete'],
                                            opsGetmore : currentOperations['opcounters']['getmore'],
                                            opsCommand : currentOperations['opcounters']['command'],
                                            operations : ( 
                                                            currentOperations['opcounters']['insert'] + 
                                                            currentOperations['opcounters']['query'] +
                                                            currentOperations['opcounters']['update'] +
                                                            currentOperations['opcounters']['delete'] +
                                                            currentOperations['opcounters']['command']
                                            ),
                                            docsDeleted : currentOperations['metrics']['document']['deleted'],
                                            docsInserted : currentOperations['metrics']['document']['inserted'],
                                            docsReturned : currentOperations['metrics']['document']['returned'],
                                            docsUpdated : currentOperations['metrics']['document']['updated'],
                                            docops : (
                                                        currentOperations['metrics']['document']['deleted'] +
                                                        currentOperations['metrics']['document']['inserted'] + 
                                                        currentOperations['metrics']['document']['returned'] +
                                                        currentOperations['metrics']['document']['updated']
                                            ),
                                            transactionsActive : currentOperations['transactions']['currentActive'],
                                            transactionsCommited : currentOperations['transactions']['totalCommitted'],
                                            transactionsAborted : currentOperations['transactions']['totalAborted'],
                                            transactionsStarted : currentOperations['transactions']['totalStarted']
                            };
                            
                                        
                            var properties = { role : (currentStatus.ismaster == true ? "P" : "R" ) };
                            return { properties : properties, metrics : metrics };
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { role : "-" }, metrics : {} };
                 
                }
            
        }
        
        async getActiveSessions(){
            
            try {
                
                var sessions = (await this.#connection.db("admin").command( { currentOp: 1, microsecs_running : {"$gte" : 1000000}, "$sort" : { microsecs_running : 1 } } ) ).inprog;
                if (sessions.length > 0 ) {
                        sessions.forEach(element => {
                          element.instanceId = this.objectConnection.instanceId;
                        });
                }
              
                return sessions;
              
            }
            catch(err){
                        this.#objLog.write("getActiveSessions","err",err);
                        return [];
            }
            
        }
        
          
}



//--#############
//--############# CLASS : classPostgresqlEngine                                                                                               
//--#############


class classPostgresqlEngine {

        //-- Looging
        #objLog = new classLogging({ name : "classPostgresqlEngine", instance : "generic" });
        #connection = {};
        
        //-- OS Metrics
        #dimension;
        #metricList;
        
        ///-- Database Queries
        #sql_statement_metrics = `
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
        
        #sql_statement_sessions = `
                            SELECT 
                                pid as "PID",
                                usename as "Username",
                                state as "State",
                                wait_event as "WaitEvent",
                                datname as "Database",
                                CAST(CURRENT_TIMESTAMP-query_start AS VARCHAR)  as "ElapsedTime",
                                application_name as "AppName",
                                client_addr as "Host",
                                query as "SQLText" 
                            FROM 
                                pg_stat_activity 
                            WHERE 
                                pid <> pg_backend_pid() and 
                                state = \'active\' and
                                (now() - pg_stat_activity.query_start) > interval '1 seconds'
                            ORDER BY 
                                query_start asc limit 10;
        `;
                
        
        #sql_statement_aurora_role = `
                            SELECT 
                                CASE WHEN 'MASTER_SESSION_ID' = session_id THEN 'P' ELSE 'R' END AS role 
                            FROM 
                                aurora_replica_status() rt, aurora_db_instance_identifier() di 
                            WHERE 
                                rt.server_id = di
        `;                             
                  
        
        #sql_statement_hostname = `SELECT inet_server_addr() as hostname, CAST (date_trunc('second', current_timestamp - pg_postmaster_start_time()) AS VARCHAR) as uptime`;
        
        
        
        //-- Constructor method
        constructor(objectConnection) { 
                this.objectConnection = objectConnection;
                this.isAuthenticated = false;
                this.#objLog.properties = {...this.#objLog.properties, instance : objectConnection.host }
                
        }
          
        
        //-- Open Connection
        async #openConnection() { 
            
            
                this.isAuthenticated = false;
                var params = this.objectConnection;
            
                try {
                    
                                this.#objLog.write("#openConnection","info","Postgresql Instance Connected : " + params.host);
                             
                                this.#connection = new postgresql({
                                                                      user: params.username,
                                                                      host: params.host,
                                                                      database: 'postgres',
                                                                      password: params.password,
                                                                      port: params.port,
                                                                      connectionReconnectTimeoutMillis: 90000,
                                });
                                
                                
                                this.#connection.on('error', (err, client) => {
                                            console.log(err);
                                            this.#objLog.write("#openConnection","err",err);
                                            
                                });
                            
                                await this.#connection.connect();
                                var command = await this.#connection.query('SELECT 1 as value');
                                this.isAuthenticated = true;
                                
                               
                }
                catch(err){
                    this.#objLog.write("#openConnection","err",err);
                }
            

        }
        
        connect() { 
            this.#openConnection();
        }
        
        
        //-- Close Connection
        async #closeConnection() { 
            try {
                this.#objLog.write("#closeConnection","info", "Disconnection completed : " + this.objectConnection.host );
                    this.#connection.end();
            }
            catch(err){
                    this.#objLog.write("#closeConnection","err", String(err) + "-" + this.objectConnection.host );
            }
            
        }
        
        //-- Close Connection
        disconnect() { 
            this.#closeConnection();
        }
    
        
        //-- Verify connection
        async isConnected() { 
                try {
                        
                            var command = await this.#connection.query('SELECT 1 as value');
                            console.log(command);
                            if (command.rows[0]['value'] =="1")
                                return true;
                            else
                                return false;
                }
                catch(err){
                    return false;
                }
            
        }
        
        
        //-- Authentication
        async authentication() { 
            try {
                    await this.#openConnection();
                    await this.#closeConnection();
                    return this.isAuthenticated;
            }
            catch(err){
                return this.isAuthenticated;;
            }
        }
        
        
        
        //-- Gather metrics
        async getSnapshot(){
                
                var role = "-";
                
                try
                {
                 
                            
                            //-- Database Metrics
                            var currentOperations = (await this.#connection.query(this.#sql_statement_metrics)).rows[0];
                            
                            //-- Instance Role
                            if (this.objectConnection.engineType = "aurora-postgresql")
                                role = (await this.#connection.query(this.#sql_statement_aurora_role)).rows[0]['role'];
                            
                            
                            //-- OS Metrics
                            const osMetrics = await AWSObject.getOSMetrics({ monitoring : this.objectConnection.monitoring,
                                                                             resourceId : this.objectConnection.resourceId,
                                                                             metrics : this.#metricList
                                                                            });
                            
                            var metrics = {
                                            cpu: osMetrics.cpu,
                                            memory: osMetrics.memory,
                                            ioreads: osMetrics.ioreads,
                                            iowrites: osMetrics.iowrites,
                                            netin: osMetrics.netin,
                                            netout: osMetrics.netout,
                                            network : osMetrics.netin + osMetrics.netout,
                                            iops : osMetrics.ioreads + osMetrics.iowrites,
                                            tuples : parseFloat(currentOperations['tup_fetched']) +
                                                     parseFloat(currentOperations['tup_inserted']) +
                                                     parseFloat(currentOperations['tup_updated']) +
                                                     parseFloat(currentOperations['tup_deleted']),
                                            xactTotal: parseFloat(currentOperations['xact_commit']) + parseFloat(currentOperations['xact_rollback']),
                                            xactCommit: parseFloat(currentOperations['xact_commit']),
                                            xactRollback: parseFloat(currentOperations['xact_rollback']),
                                            tupReturned: parseFloat(currentOperations['tup_returned']),
                                            tupFetched: parseFloat(currentOperations['tup_fetched']),
                                            tupInserted: parseFloat(currentOperations['tup_inserted']),
                                            tupDeleted: parseFloat(currentOperations['tup_deleted']),
                                            tupUpdated: parseFloat(currentOperations['tup_updated']),
                                            numbackends : parseFloat(currentOperations['numbackends']),
                                            numbackendsActive : parseFloat(currentOperations['numbackendsactive']),
                            };
                            
                            
                            return { properties : { role : role }, metrics : metrics };            
                            
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { role : role }, metrics : {}  };            
                 
                }
            
        }
        
        //-- Gather metrics per Instance
        async getSnapshotInstance(){
                
                
                try
                {
                 
                            
                            //-- Database Metrics
                            var currentOperations = (await this.#connection.query(this.#sql_statement_metrics)).rows[0];
                            
                            //-- hostname
                            var infoServer = (await this.#connection.query(this.#sql_statement_hostname)).rows[0];
                            var hostname = infoServer['hostname'];
                            var uptime = infoServer['uptime'];
                            

                            //-- OS Metrics
                            const osMetrics = await AWSObject.getOSMetricsDetails({ resourceId : this.objectConnection.resourceId });
                            
                            //-- Metric Object
                            var metrics = {
                                            ...osMetrics['metrics'],
                                            tuples : parseFloat(currentOperations['tup_fetched']) +
                                                     parseFloat(currentOperations['tup_inserted']) +
                                                     parseFloat(currentOperations['tup_updated']) +
                                                     parseFloat(currentOperations['tup_deleted']),
                                            xactTotal: parseFloat(currentOperations['xact_commit']) + parseFloat(currentOperations['xact_rollback']),
                                            xactCommit: parseFloat(currentOperations['xact_commit']),
                                            xactRollback: parseFloat(currentOperations['xact_rollback']),
                                            tupReturned: parseFloat(currentOperations['tup_returned']),
                                            tupFetched: parseFloat(currentOperations['tup_fetched']),
                                            tupInserted: parseFloat(currentOperations['tup_inserted']),
                                            tupDeleted: parseFloat(currentOperations['tup_deleted']),
                                            tupUpdated: parseFloat(currentOperations['tup_updated']),
                                            numbackends : parseFloat(currentOperations['numbackends']),
                                            numbackendsActive : parseFloat(currentOperations['numbackendsactive']),
                            };
                            
                            
                            return { properties : { hostname : hostname, uptime : uptime  }, metrics : metrics, processes : osMetrics['processes'], timestamp : osMetrics['timestamp'] };            
                            
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { hostname : "-", uptime : "-" }, metrics : {}, processes : [], timestamp : 0 };            
                 
                }
            
        }
        
        async getActiveSessions(){
            
            try {
                
                var sessions = await this.#connection.query(this.#sql_statement_sessions);
                if (sessions.rows.length > 0 ) {
                        sessions.rows.forEach(element => {
                          element.instanceId = this.objectConnection.instanceId;
                        });
                }
              
                return sessions.rows;
              
            }
            catch(err){
                        this.#objLog.write("getActiveSessions","err",err);
                        return [];
            }
            
        }
        
        
        //-- Execute a query
        async executeQuery(object) { 
                try {
                        
                            var command = (await this.#connection.query(object.query));
                            return command;
                            
                }
                catch(err){
                    this.#objLog.write("executeQuery","err",err);
                    return [];
                }
            
        }
          
}



//--#############
//--############# CLASS : classMysqlEngine                                                                                               
//--#############

class classMysqlEngine {

        //-- Looging
        #objLog = new classLogging({ name : "classMysqlEngine", instance : "generic" });
        #connection = {};
        
        //-- OS Metrics
        #dimension;
        #metricList;
        
        ///-- Database Queries
        #sql_statement_metrics = "SHOW GLOBAL STATUS";
        
        #sql_statement_sessions = `
                            SELECT 
                                ID as 'ThreadID',
                                USER as 'Username',
                                HOST as 'Host',
                                DB as 'Database',
                                COMMAND as 'Command',
                                SEC_TO_TIME(TIME) as 'Time',
                                STATE as 'State',
                                INFO as 'SQLText' 
                            FROM 
                                INFORMATION_SCHEMA.PROCESSLIST 
                            WHERE 
                                COMMAND <> 'Sleep' 
                                AND 
                                COMMAND <> 'Daemon' 
                                AND 
                                CONNECTION_ID()<> ID 
                                AND 
                                TIME > 1 
                            ORDER 
                                BY TIME DESC 
                            LIMIT 10
        `;
                
        
        #sql_statement_aurora_role = `
                           select 
                                if(session_id = 'MASTER_SESSION_ID', 'P', 'R') as role 
                           from 
                                information_schema.replica_host_status 
                            where server_id =
        `;                            
          
        #sql_statement_hostname = `
                           select @@hostname as hostname
        `;        

        //-- Constructor method
        constructor(objectConnection) { 
                this.objectConnection = objectConnection;
                this.isAuthenticated = false;
                this.#objLog.properties = {...this.#objLog.properties, instance : objectConnection.host };
                this.#sql_statement_aurora_role = this.#sql_statement_aurora_role + "'" + objectConnection.instanceId + "'";
                
        }
          
        
        //-- Open Connection
        async #openConnection() { 
            
            
                this.isAuthenticated = false;
                var params = this.objectConnection;
            
                try {
                    
                                this.#objLog.write("#openConnection","info","MySQL Instance Connected : " + params.host);
                            
                                this.#connection = new  mysql.createPool({
                                                                            host: params.host,
                                                                            user: params.username,
                                                                            password: params.password,
                                                                            database: "",
                                                                            //acquireTimeout: 3000,
                                                                            port: params.port,
                                                                            connectionLimit:2
                                                                            });
                                                                                    
                                
                                
                                this.#connection.on('error', (err, client) => {
                                            console.log(err);
                                            this.#objLog.write("#openConnection","err",err);
                                            
                                });
                                
                                var command = await this.#connection.query('SELECT @@hostname as value');
                                this.isAuthenticated = true;
                                
                               
                }
                catch(err){
                    this.#objLog.write("#openConnection","err",err);
                }
            

        }
        
        connect() { 
            this.#openConnection();
        }
        
        
        //-- Close Connection
        async #closeConnection() { 
            try {
                this.#objLog.write("#closeConnection","info", "Disconnection completed : " + this.objectConnection.host );
                    this.#connection.end();
            }
            catch(err){
                    this.#objLog.write("#closeConnection","err", String(err) + "-" + this.objectConnection.host );
            }
            
        }
        
        //-- Close Connection
        disconnect() { 
            this.#closeConnection();
        }
    
        
        //-- Verify connection
        async isConnected() { 
                try {
                        
                            var command = await this.#connection.query('SELECT 1 as value');
                            if (command[0][0]['value'] =="1")
                                return true;
                            else
                                return false;
                }
                catch(err){
                    return false;
                }
            
        }
        
        
        //-- Authentication
        async authentication() { 
            try {
                    await this.#openConnection();
                    await this.#closeConnection();
                    return this.isAuthenticated;
            }
            catch(err){
                return this.isAuthenticated;
            }
        }
        
        
        //-- Execute a query
        async executeQuery(object) { 
                try {
                        
                            var command = await this.#connection.query(object.query);
                            return command;
                            
                }
                catch(err){
                    this.#objLog.write("executeQuery","err",err);
                    return [];
                }
            
        }
        
        
        //-- Gather Snapshot Cluster Node
        async getSnapshot(){
                
                var role = "-";
                
                try
                {
                 
                            
                            //-- Database Metrics
                            var currentOperations = await this.#connection.query(this.#sql_statement_metrics);
                            currentOperations = convertArrayToObject(currentOperations[0],'Variable_name');
                           
                            
                            //-- Instance Role
                            if (this.objectConnection.engineType = "aurora-mysql")
                                role = (await this.#connection.query(this.#sql_statement_aurora_role))[0][0]['role'];
                            
                            //-- OS Metrics
                            const osMetrics = await AWSObject.getOSMetrics({ monitoring : this.objectConnection.monitoring,
                                                                             resourceId : this.objectConnection.resourceId,
                                                                             metrics : this.#metricList
                                                                            });
                            
                            var metrics = {
                                            cpu: osMetrics.cpu,
                                            memory: osMetrics.memory,
                                            ioreads: osMetrics.ioreads,
                                            iowrites: osMetrics.iowrites,
                                            netin: osMetrics.netin,
                                            netout: osMetrics.netout,
                                            network : osMetrics.netin + osMetrics.netout,
                                            iops : osMetrics.ioreads + osMetrics.iowrites,
                                            queries: currentOperations['Queries']['Value'],
                                            questions: currentOperations['Questions']['Value'],
                                            operations : ( currentOperations['Com_select']['Value'] + 
                                                           currentOperations['Com_insert']['Value'] +
                                                           currentOperations['Com_delete']['Value'] +
                                                           currentOperations['Com_update']['Value']
                                            ),
                                            comSelect: currentOperations['Com_select']['Value'],
                                            comInsert: currentOperations['Com_insert']['Value'],
                                            comDelete: currentOperations['Com_delete']['Value'],
                                            comUpdate: currentOperations['Com_update']['Value'],
                                            comCommit: currentOperations['Com_commit']['Value'],
                                            comRollback : currentOperations['Com_rollback']['Value'],
                                            threads : parseFloat(currentOperations['Threads_connected']['Value']),
                                            threadsRunning : parseFloat(currentOperations['Threads_running']['Value']),
                            };
                            
                            
                            return { properties : { role : role }, metrics : metrics };            
                            
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { role : role }, metrics : {} };            
                 
                }
            
        }
        
        
        //-- Gather metrics per Instance
        async getSnapshotInstance(){
                
                
                try
                {
                 
                            
                            //-- Database Metrics
                            var currentOperations = await this.#connection.query(this.#sql_statement_metrics);
                            currentOperations = convertArrayToObject(currentOperations[0],'Variable_name');
                            
                            //-- hostname
                            var hostname = (await this.#connection.query(this.#sql_statement_hostname))[0][0]['hostname'];

                            //-- OS Metrics
                            const osMetrics = await AWSObject.getOSMetricsDetails({ resourceId : this.objectConnection.resourceId });
                            
                            //-- Metric Object
                            var metrics = {
                                            ...osMetrics['metrics'],
                                            queries: currentOperations['Queries']['Value'],
                                            questions: currentOperations['Questions']['Value'],
                                            operations : ( parseFloat(currentOperations['Com_select']['Value']) + 
                                                           parseFloat(currentOperations['Com_insert']['Value']) +
                                                           parseFloat(currentOperations['Com_delete']['Value']) +
                                                           parseFloat(currentOperations['Com_update']['Value'])
                                            ),
                                            comSelect: currentOperations['Com_select']['Value'],
                                            comInsert: currentOperations['Com_insert']['Value'],
                                            comDelete: currentOperations['Com_delete']['Value'],
                                            comUpdate: currentOperations['Com_update']['Value'],
                                            comCommit: currentOperations['Com_commit']['Value'],
                                            comRollback : currentOperations['Com_rollback']['Value'],
                                            threads : parseFloat(currentOperations['Threads_connected']['Value']),
                                            threadsRunning : parseFloat(currentOperations['Threads_running']['Value']),
                            };
                            
                            var uptime = new Date(currentOperations['Uptime']['Value'] * 1000).toISOString().slice(11, 19);
                            
                            return { properties : { hostname : hostname, uptime : uptime  }, metrics : metrics, processes : osMetrics['processes'], timestamp : osMetrics['timestamp'] };            
                            
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { hostname : "-", uptime : "-" }, metrics : {}, processes : [], timestamp : 0 };            
                 
                }
            
        }
        
        async getActiveSessions(){
            
            try {
                
                var sessions = (await this.#connection.query(this.#sql_statement_sessions))[0];
                if (sessions.length > 0 ) {
                        sessions.forEach(element => {
                          element.instanceId = this.objectConnection.instanceId;
                        });
                }
              
                return sessions;
              
            }
            catch(err){
                        this.#objLog.write("getActiveSessions","err",err);
                        return [];
            }
            
        }
          
}






//--#############
//--############# CLASS : classMssqlEngine
//--#############

class classSqlserverEngine {

        //-- Looging
        #objLog = new classLogging({ name : "classSqlserverEngine", instance : "generic" });
        #connection = {};
        
        //-- OS Metrics
        #dimension;
        #metricList;
        
        ///-- Database Queries
        #sql_statement_metrics = `select rtrim(counter_name) counter_name,cntr_value from sys.dm_os_performance_counters
                                   where 
                                   rtrim(object_name) like '%SQLServer:General Statistics%'
                                   or
                                   (rtrim(object_name) like '%SQLServer:Databases%' and instance_name='_Total')
                                   or
                                   rtrim(object_name) like '%SQLServer:SQL Statistics%'
                                   or 
                                   rtrim(object_name) like '%SQLServer:Buffer Manager%'
                                  `;
        
        #sql_statement_sessions = `SELECT 
                                     TOP 10
                                  	 owt.session_id, 
                                  	 es.login_name,
                                  	 es.status,
                                  	 db_name(es.database_id) database_name,
                                  	 CONCAT(
                    										RIGHT('0' + CAST(er.total_elapsed_time/(1000*60*60) AS VARCHAR(2)),2), ':',
                    										RIGHT('0' + CAST((er.total_elapsed_time%(1000*60*60))/(1000*60) AS VARCHAR(2)),2), ':',
                    										RIGHT('0' + CAST(((er.total_elapsed_time%(1000*60*60))%(1000*60))/1000 AS VARCHAR(2)),2)
                    								 ) AS total_elapsed_time, 
                                  	 es.host_name,
                                  	 es.program_name, 
                                  	 owt.wait_type,
                                  	 est.text as sql_text
                                  FROM 
                                  		sys.dm_os_waiting_tasks [owt] 
                                  		INNER JOIN sys.dm_exec_sessions [es] ON 
                                  		[owt].[session_id] = [es].[session_id] 
                                  		INNER JOIN sys.dm_exec_requests [er] ON 
                                  		[es].[session_id] = [er].[session_id] 
                                  		OUTER APPLY sys.dm_exec_sql_text ([er].[sql_handle]) [est] 
                                  WHERE 
                                  	es.is_user_process = 1 
                                  	and
                                  	er.total_elapsed_time > 1000
                                  ORDER BY 
                                  	er.total_elapsed_time desc
                                  `;
                
       
       #sql_statement_hostname = `select 
                                    @@servername as hostname,  
                                    DATEDIFF(SECOND, sqlserver_start_time, getdate()) as uptime 
                                  from 
                                    sys.dm_os_sys_info`;        


        //-- Constructor method
        constructor(objectConnection) { 
                this.objectConnection = objectConnection;
                this.isAuthenticated = false;
                this.#objLog.properties = {...this.#objLog.properties, instance : objectConnection.host };
        }
          
        
        //-- Open Connection
        async #openConnection() { 
            
            
                this.isAuthenticated = false;
                var params = this.objectConnection;
            
                try {
                    
                       
    
                                this.#objLog.write("#openConnection","info","SQLServer Instance Connected : " + params.host);
                                this.#connection = new mssql.ConnectionPool({
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
                                
                                
                                this.#connection.on('error', (err, client) => {
                                            console.log(err);
                                            this.#objLog.write("#openConnection","err",err);
                                            
                                });
                                
                                await this.#connection.connect();
                                var command = await this.#connection.query('SELECT @@servername as servername');
                                this.isAuthenticated = true;
                                
                                
                                
                               
                }
                catch(err){
                    this.#objLog.write("#openConnection","err",err);
                }
            

        }
        
        connect() { 
            this.#openConnection();
        }
        
        
        //-- Close Connection
        async #closeConnection() { 
            try {
                this.#objLog.write("#closeConnection","info", "Disconnection completed : " + this.objectConnection.host );
                    this.#connection.close();
            }
            catch(err){
                    this.#objLog.write("#closeConnection","err", String(err) + "-" + this.objectConnection.host );
            }
            
        }
        
        //-- Close Connection
        disconnect() { 
            this.#closeConnection();
        }
    
        
        //-- Verify connection
        async isConnected() { 
                try {
                        
                            var command = await this.#connection.query('SELECT 1 as value');
                            if (command[0][0]['value'] =="1")
                                return true;
                            else
                                return false;
                }
                catch(err){
                    return false;
                }
            
        }
        
        
        //-- Authentication
        async authentication() { 
            try {
                    await this.#openConnection();
                    await this.#closeConnection();
                    return this.isAuthenticated;
            }
            catch(err){
                return this.isAuthenticated;
            }
        }
        
        
        //-- Execute a query
        async executeQuery(object) { 
                try {
                        
                            var command = (await this.#connection.query(object.query));
                            return command;
                            
                }
                catch(err){
                    this.#objLog.write("executeQuery","err",err);
                    return [];
                }
            
        }
        
        
        //-- Gather metrics per Instance
        async getSnapshotInstance(){
                
                
                try
                {
                 
                            
                            //-- Database Metrics
                            var currentOperations = await this.#connection.query(this.#sql_statement_metrics);
                            currentOperations = convertArrayToObject(currentOperations.recordset,'counter_name');
                            
                            
                            //-- Database Info
                            var instanceInfo = (await this.#connection.query(this.#sql_statement_hostname)).recordset;
                            
                            //-- OS Metrics
                            const osMetrics = await AWSObject.getOSMetricsDetails({ resourceId : this.objectConnection.resourceId, engineType : "sqlserver" });
                            
                            
                            //-- Metric Object
                            var metrics = {
                                            ...osMetrics['metrics'],
                                            batchRequests: currentOperations['Batch Requests/sec']['cntr_value'],
                                            transactions: currentOperations['Transactions/sec']['cntr_value'],
                                            sqlCompilations: currentOperations['SQL Compilations/sec']['cntr_value'],
                                            sqlReCompilations: currentOperations['SQL Re-Compilations/sec']['cntr_value'],
                                            logins: currentOperations['Logins/sec']['cntr_value'],
                                            connections : currentOperations['User Connections']['cntr_value'],
                                            pageWrites : currentOperations['Page writes/sec']['cntr_value'],
                                            pageReads : currentOperations['Page reads/sec']['cntr_value'],
                                            
                            };
                            
                            var hostname = instanceInfo[0]['hostname'];
                            var uptime = new Date(instanceInfo[0]['uptime'] * 1000).toISOString().slice(11, 19);
                            return { properties : { hostname : hostname, uptime : uptime  }, metrics : metrics, processes : osMetrics['processes'], timestamp : osMetrics['timestamp'] };            
                            
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { hostname : "-", uptime : "-" }, metrics : {}, processes : [], timestamp : 0 };            
                 
                }
            
        }
        
        async getActiveSessions(){
            
            try {
                
                var sessions = (await this.#connection.query(this.#sql_statement_sessions)).recordset;
                if (sessions.length > 0 ) {
                        sessions.forEach(element => {
                          element.instanceId = this.objectConnection.instanceId;
                        });
                }
              
                return sessions;
              
            }
            catch(err){
                        this.#objLog.write("getActiveSessions","err",err);
                        return [];
            }
            
        }
          
}




//--#############
//--############# CLASS : classOracleEngine
//--#############

class classOracleEngine {

        //-- Looging
        #objLog = new classLogging({ name : "classOracleEngine", instance : "generic" });
        #connection = {};
        
        //-- OS Metrics
        #dimension;
        #metricList;
        
        ///-- Database Queries
        #sql_statement_metrics = `select name,value from v$sysstat where name in 
                                    (
                                    'user calls',
                                    'user commits',
                                    'redo writes',
                                    'physical write total IO requests',
                                    'physical write total bytes',
                                    'physical read total IO requests',
                                    'physical read total bytes',
                                    'logons current',
                                    'db block gets',
                                    'db block changes',
                                    'consistent gets'
                                    )
                              `;
        
        #sql_statement_sessions = `SELECT SES.SID,   
                                   SES.STATUS,
                                   nvl(ses.username,'ORACLE PROC')||' ('||ses.sid||')' USERNAME,
                                   SES.MACHINE, 
                                   SES.PROGRAM,
                                   SES.EVENT,       
                                  ltrim(to_char(floor(SES.LAST_CALL_ET/3600), '09')) || ':'
                                   || ltrim(to_char(floor(mod(SES.LAST_CALL_ET, 3600)/60), '09')) || ':'
                                   || ltrim(to_char(mod(SES.LAST_CALL_ET, 60), '09')) LAST_CALL_ET,
                                   SES.SQL_ID,
                                   REPLACE(SQL.SQL_TEXT,CHR(128),'') SQL_TEXT
                              FROM V$SESSION SES,   
                                   V$SQLTEXT SQL 
                              WHERE 
                                SES.STATUS = 'ACTIVE'
                                and SES.USERNAME is not null
                                and SES.SQL_ADDRESS    = SQL.ADDRESS 
                                and SES.SQL_HASH_VALUE = SQL.HASH_VALUE 
                                and SES.AUDSID <> userenv('SESSIONID') 
                                and SES.LAST_CALL_ET > 5
                             ORDER BY 
                                SES.LAST_CALL_ET desc`;
                
       
       #sql_statement_hostname = `select host_name as hostname, ((sysdate - startup_time) * 24 * 60 * 60)  as uptime  from v$instance`;        


        //-- Constructor method
        constructor(objectConnection) { 
                this.objectConnection = objectConnection;
                this.isAuthenticated = false;
                this.#objLog.properties = {...this.#objLog.properties, instance : objectConnection.host };
        }
          
        
        //-- Open Connection
        async #openConnection() { 
            
            
                this.isAuthenticated = false;
                var params = this.objectConnection;
            
                try {
                    
                                this.#objLog.write("#openConnection","info","Oracle Instance Connected : " + params.host);
                                this.#connection = await oracle.createPool({
                                                                                user: params.username,
                                                                                password: params.password,
                                                                                connectString: params.host + ":" + params.port + "/" + params.instance ,
                                                                                poolMax : 2,
                                                                                poolMin : 1,
                                });
                                
                                
                                var command = await this.#execute('SELECT 1 as value from dual');
                                if (command.rows[0][0] =="1")
                                    this.isAuthenticated = true;
                                else
                                    this.isAuthenticated = false;
                               
                }
                catch(err){
                    this.#objLog.write("#openConnection","err",err);
                }
            

        }
        
        connect() { 
            this.#openConnection();
        }
        
        
        //-- Close Connection
        async #closeConnection() { 
            try {
                this.#objLog.write("#closeConnection","info", "Disconnection completed : " + this.objectConnection.host );
                    this.#connection.close(0);
            }
            catch(err){
                    this.#objLog.write("#closeConnection","err", String(err) + "-" + this.objectConnection.host );
            }
            
        }
        
        //-- Close Connection
        disconnect() { 
            this.#closeConnection();
        }
    
    
    
        //-- Execute Query
        async #execute(query){
            
            
            let connection;
            let result;
            try {
                    connection = await this.#connection.getConnection();
                    result = (await connection.execute(query));
                    
            } catch (err) {
                this.#objLog.write("#execute","err",err);
                throw (err);
            } finally {
                if (connection) {
                    try {
                        await connection.close(); // Put the connection back in the pool
                    } catch (err) {
                        this.#objLog.write("#execute","err",err);
                        throw (err);
                    }
                }
            }
            
            return result;
                            
                            
            
        }
        //-- Verify connection
        async isConnected() { 
                try {
                    
                            var command = (await this.#execute('SELECT 1 as value from dual'));
                            if (command.rows[0][0] =="1")
                                return true;
                            else
                                return false;
                            
                            
                }
                catch(err){
                    return false;
                }
            
        }
        
        
        //-- Authentication
        async authentication() { 
            try {
                    await this.#openConnection();
                    await this.#closeConnection();
                    return this.isAuthenticated;
            }
            catch(err){
                return this.isAuthenticated;
            }
        }
        
        
        //-- Execute a query
        async executeQuery(object) { 
                try {
                            
                            var command = (await this.#execute(object.query));
                            return command;
                            
                }
                catch(err){
                    this.#objLog.write("executeQuery","err",err);
                    return [];
                }
            
        }
        
        
        //-- Gather metrics per Instance
        async getSnapshotInstance(){
                
                
                try
                {
                 
                            //-- Database Metrics
                            var currentOperations = await this.#execute(this.#sql_statement_metrics);
                            currentOperations = convertArrayToObject(currentOperations.rows,0);
                            
                            //-- Database Info
                            var instanceInfo = (await this.#execute(this.#sql_statement_hostname)).rows;
                            
                            //-- OS Metrics
                            const osMetrics = await AWSObject.getOSMetricsDetails({ resourceId : this.objectConnection.resourceId, engineType : "" });
                            
                            //-- Metric Object
                            var metrics = {
                                            ...osMetrics['metrics'],
                                            userCalls: currentOperations['user calls'][1],
                                            userCommits: currentOperations['user commits'][1],
                                            dbIOWrites: currentOperations['physical write total IO requests'][1],
                                            dbIOReads: currentOperations['physical read total IO requests'][1],
                                            redoWrites: currentOperations['redo writes'][1],
                                            logons: currentOperations['logons current'][1],
                                            dbBlockChanges: currentOperations['db block changes'][1],
                                            dbBlockGets: currentOperations['db block gets'][1]
                            };
                            
                            var hostname = instanceInfo[0][0];
                            var uptime = new Date(instanceInfo[0][1] * 1000).toISOString().slice(11, 19);
                            return { properties : { hostname : hostname, uptime : uptime  }, metrics : metrics, processes : osMetrics['processes'], timestamp : osMetrics['timestamp'] };            
                            
                }
                catch(err){
                        this.#objLog.write("getSnapshot","err",err);
                        return { properties : { hostname : "-", uptime : "-" }, metrics : {}, processes : [], timestamp : 0 };            
                 
                }
            
        }
        
        async getActiveSessions(){
            
            try {
                
                
                var sessions = (await this.#execute(this.#sql_statement_sessions)).rows;
                if (sessions.length > 0 ) {
                        sessions.forEach(element => {
                          element.instanceId = this.objectConnection.instanceId;
                        });
                }
              
                return sessions;
              
            }
            catch(err){
                        this.#objLog.write("getActiveSessions","err",err);
                        return [];
            }
            
        }
          
}




module.exports = { classMetrics, classCluster, classNode, classInstance, classRedisEngine, classMongoDBEngine, classPostgresqlEngine, classMysqlEngine, classSqlserverEngine, classOracleEngine };

