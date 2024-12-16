
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
                    this.currentTime = (new Date()).getTime();
                    
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
                    
                    if ( currentTime > this.currentTime ) {
                        this.oldObject = this.currentObject;
                        this.oldTime = this.currentTime;
                        
                        this.currentObject = currentObject;
                        this.currentTime = currentTime;
                        this.totalSnaps++;
                        if (this.totalSnaps > 2)
                            this.#updateData();
                }
                        
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
          

          setItemListValues(itemName,itemListValues){
                this.metricList[itemName].value = itemListValues[0];
                this.metricList[itemName].data = itemListValues;

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
                                this.objectMetrics.setItemValueCustom("globalLatency" , metrics["globalLatency"] / nodeActivity["globalLatency"]);
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
                                            
                                            //-- --- STRESS LOAD +500 NODES
                                            /*
                                            for (let i=0; i < 90; i++) {
                                                this.objectNodes[node.nodeId + String(i)] = new classNode({ 
                                                                                    properties : {...this.objectProperties, name : node.nodeId + String(i), uid : this.objectProperties.engineType + ":" + node.nodeId + String(i), networkRate : node.networkRate, size : node.nodeType, nodeId : ( (nodeId-1) * 90) + i + 1, cacheClusterId : node.cacheClusterId,cacheNodeId : node.cacheNodeId, }, 
                                                                                    connection : {...this.objectConnection,...node}, 
                                                                                    metrics : this.objectMetricList 
                                                                                });
                                            }        
                                            */
                                            
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
                            
                            case "documentdb-elastic":
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
                                            this.objectMetrics.setItemValueCustom("globalLatency", this.objectMetrics.getItemValue("totalUsec") / this.objectMetrics.getItemValue("operations"));
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
                                
                                this.isAuthenticated = await this.isConnected();
                                
                               
                }
                catch(err){
                    this.#objLog.write("#openConnection","err",err);
                    this.isAuthenticated = false;
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
                        
                            var command = await this.#connection.info();
                            return true;
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
                this.isAuthenticated = false;
                return this.isAuthenticated;
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
                            var totalCalls = 0;
                            var totalUsec = 0;
                            var commands = await this.#connection.info('Commandstats');
                            var jsonCommands = redisInfo.parse(commands);
                            
                            for (let commandType of Object.keys(jsonCommands.commands)) {
                                    totalCalls = totalCalls + jsonCommands.commands[commandType].calls;
                                    totalUsec = totalUsec + jsonCommands.commands[commandType].usec; 
                            }
                            
                            jsonCommands = jsonCommands.commands;
                            var metrics = {
                                            cpuUser: parseFloat(jsonInfo['used_cpu_user']),
                                            cpuSys: parseFloat(jsonInfo['used_cpu_sys']),
                                            memoryUsed: parseFloat(jsonInfo['used_memory']),
                                            memoryTotal: parseFloat(jsonInfo['maxmemory']),
                                            operations: totalCalls,
                                            totalUsec : totalUsec,
                                            getCalls: (( jsonCommands.hasOwnProperty('get') ) ? parseFloat(jsonCommands['get']['calls']) : 0) ,
                                            getUsec: (( jsonCommands.hasOwnProperty('get') ) ? parseFloat(jsonCommands['get']['usec']) : 0) ,
                                            setCalls : (( jsonCommands.hasOwnProperty('set') ) ? parseFloat(jsonCommands['set']['calls']) : 0) ,
                                            setUsec : (( jsonCommands.hasOwnProperty('set') ) ? parseFloat(jsonCommands['set']['usec']) : 0) ,
                                            connectedClients: parseFloat(jsonInfo['connected_clients']),
                                            keyspaceHits: parseFloat(jsonInfo['keyspace_hits']),
                                            keyspaceMisses: parseFloat(jsonInfo['keyspace_misses']),
                                            netIn: parseFloat(jsonInfo['total_net_input_bytes']),
                                            netOut: parseFloat(jsonInfo['total_net_output_bytes']),
                                            connectionsTotal: parseFloat(jsonInfo['total_connections_received']),
                                            commands: parseFloat(jsonInfo['total_commands_processed']),
                                            cmdExec: (( jsonCommands.hasOwnProperty('exec') ) ? parseFloat(jsonCommands['exec']['calls']) : 0) ,
                                            cmdAuth: (( jsonCommands.hasOwnProperty('auth') ) ? parseFloat(jsonCommands['auth']['calls']) : 0) ,
                                            cmdInfo: (( jsonCommands.hasOwnProperty('info') ) ? parseFloat(jsonCommands['info']['calls']) : 0) ,
                                            cmdScan: (( jsonCommands.hasOwnProperty('scan') ) ? parseFloat(jsonCommands['scan']['calls']) : 0) ,
                                            cmdXadd: (( jsonCommands.hasOwnProperty('xadd') ) ? parseFloat(jsonCommands['xadd']['calls']) : 0) ,
                                            cmdZadd: (( jsonCommands.hasOwnProperty('zadd') ) ? parseFloat(jsonCommands['zadd']['calls']) : 0) ,
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
//--############# CLASS : classMongoDBEngine - Standard
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
        


        //-- Gather Cloudwatch metrics
        async getCloudwatchMetrics(object){
            
            var result = {                 
                charts : [],                           
            };

            try {
                    var metrics = [      
                                    {
                                        namespace : "AWS/DocDB",
                                        label : this.objectConnection.instanceId,
                                        metric : object.metric,
                                        dimension : this.#dimension,
                                        stat : object.stat                    
                                    }
                    ];
                    
                    var dataset = await AWSObject.getGenericMetricsDataset({ metrics : metrics, interval : object.interval, period : object.period });
                    var charts = [];

                    dataset.forEach(item => {                  
                            var dataRecords = item.Timestamps.map((value, index) => {   
                                return [item.Timestamps[index], item.Values[index] ];                             
                            });
                            charts.push({ name : item.Label, data : dataRecords });                                                      

                    });
                    
                    result = { charts : charts };


            }
            catch(err){
                this.#objLog.write("getCloudwatchMetrics","err",err);
            }
            
            return result;

        }
          
}





//--#############
//--############# CLASS : classDocumentDBElasticShard
//--#############


class classDocumentDBElasticShard {

        //-- Looging
        #objLog = new classLogging({ name : "classDocumentDBElasticShard", instance : "generic" });
        
        //-- Shard Metrics
        #metricCatalog = [
                    'BufferCacheHitRatio',
                    'DocumentsDeleted',
                    'DocumentsInserted',
                    'DocumentsReturned',
                    'DocumentsUpdated',
                    'PrimaryInstanceCPUUtilization',
                    'PrimaryInstanceFreeableMemory',
                    'ReplicaInstanceCPUUtilization',
                    'ReplicaInstanceFreeableMemory',
                    'VolumeBytesUsed',
                    'VolumeReadIOPs',
                    'VolumeWriteIOPs',
                    'ReadThroughput',
                    'WriteThroughput',   
        ]; 
        #dimension;
        #metricList = [];
        #metrics = {};
        
        
        //-- Object Properties
        objectProperties;
        objectMetrics;
        
        //-- Constructor method
        constructor(object) { 
                this.objectProperties = object.properties;
                this.#objLog.properties = {...this.#objLog.properties, shardId : this.objectProperties.shardId }
                
                //-- Create AWS Metric Catalog
                this.#dimension = [ 
                                    { Name: "ShardId", Value: this.objectProperties.shardId }, 
                                    { Name: "ClusterId", Value: this.objectProperties.clusterUid }, 
                                    { Name: "ClusterName", Value: this.objectProperties.clusterId } 
                ];
                
                this.#metricCatalog.forEach(metric => {
                        this.#metricList.push({
                            namespace : "AWS/DocDB-Elastic",
                            metric : metric,
                            dimension : this.#dimension
                        });
                });
                
                
                //-- Generate list of metrics - AWS CloudWatch
                var metrics = [];
                this.#metricCatalog.forEach(metric  => {
                        metrics.push({ name : metric , type : 5, history : 20 });
                });
                
                this.objectMetrics = new classMetrics({ metrics : metrics }) ;
                
                            
        }
          
        
        
        
        //-- Refresh metrics
        async refreshData()
        {
                try
                {
            
                    var timeNow = new Date();
                    var operationalStats = {};
                    //-- Shards Metrics
                    const shardMetrics = await AWSObject.getGenericMetrics({ metrics : this.#metricList });
                    
                    
                    this.#metricCatalog.forEach(metric  => {
                        operationalStats[metric] = shardMetrics[metric].value;
                        operationalStats[metric+"Timestamp"] = shardMetrics[metric].timestamp;
                    });
                    
                    //-- Take new snapshot
                    this.objectMetrics.newSnapshot(operationalStats,timeNow.getTime());
                    
                                        
                }
                catch(err){
                        this.#objLog.write("refreshData","err",err);
                      
                }
            
        }
        
        //-- Get Shard Metrics
        getShardMetrics(){
            
            try {
                return this.objectMetrics.getMetricList();
            
            }
            catch(err){
                this.#objLog.write("getShardMetrics","err",err);
                      
            }
            
        }
        
        
        
          
}



//--#############
//--############# CLASS : classDocumentDBElasticCluster - Elastic
//--#############


class classDocumentDBElasticCluster {

        //-- Looging
        #objLog = new classLogging({ name : "classDocumentDBElasticCluster", instance : "generic" });
        #connection = {};
        objectProperties = {};
        
        
        //--Engine Statiatics
        #statsList = [];
        
        
        //-- Shard Objects
        #clusterShards = {};
        #metadata = {};
        
        //-- Object Metrics
        objectMetrics = {};
        #dimension;
        #metricList = [];
        #metrics = {};
        
        #metricCatalog = [
                        'PrimaryInstanceCPUUtilization',
                        'ReplicaInstanceCPUUtilization',
                        'PrimaryInstanceFreeableMemory',
                        'ReplicaInstanceFreeableMemory',
                        'DatabaseConnections',
                        'ReadThroughput',
                        'WriteThroughput',
                        'VolumeReadIOPs',
                        'VolumeWriteIOPs',
                        'DocumentsDeleted',
                        'DocumentsInserted',
                        'DocumentsReturned',
                        'DocumentsUpdated'
        ]; 
        
        
                
        //-- Constructor method
        constructor(object) { 
                this.objectConnection = object.connection;
                this.objectProperties = {...object.properties};
                this.isAuthenticated = false;
                this.#objLog.properties = {...this.#objLog.properties, instance : object.connection.host }
                
            
                //-- Create AWS Metric Catalog
                this.#dimension = [ 
                                    { Name: "ClusterId", Value: this.objectProperties.clusterUid }, 
                                    { Name: "ClusterName", Value: this.objectProperties.clusterId } 
                ];
                
                this.#metricCatalog.forEach(metric  => {
                        this.#metricList.push({
                            namespace : "AWS/DocDB-Elastic",
                            metric : metric,
                            dimension : this.#dimension
                        });
                });
                
                
                //-- Init Metric Catalog
                this.#metricCatalog.forEach(metric  => {
                        
                        this.#metrics[metric] = {} ;
                        this.#metrics[metric].value = 0;
                        this.#metrics[metric].timestamp = "";
                });
                
                
                
                
                //-- Init Command Stats
                ['total','insert','queries','update','remove','getmore','commands'].forEach(command  => {
                     ['count','time','latency'].forEach(type  => {
                         this.#statsList.push(command + ":" + type);
                     });
                });
                
                
        
        }
          
        
        //-- Open Connection
        async #openConnection() { 
            
            
                this.isAuthenticated = false;
                var params = this.objectConnection;
            
                try {
                    
                                this.#objLog.write("#openConnection","info","DocumentDB Instance Connected : " + params.host);
                                
                                const uri = "mongodb://" + params.username  + ":" + params.password +"@" + params.host + ":" + params.port +"/?ssl=true";
                                
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
        
        
        
        //-- Refresh metrics
        async refreshData(){
                try
                {
                            
                            //-- Update Cluster State
                            
                            var clusterInfo = await AWSObject.getDocumentDBElasticStatus(this.objectProperties.clusterArn);
                            
                            this.objectProperties.status = clusterInfo.status;
                            this.objectProperties.shardCapacity = clusterInfo.shardCapacity;
                            this.objectProperties.shardCount = clusterInfo.shardCount;
                            this.objectProperties.lastUpdate = new Date().toTimeString().split(' ')[0];
                            
                            
                            
                            //-- Update Cluster Operational Stats
                            var timeNow = new Date();
                            const currentOperations = await this.#connection.db("admin").command({ top: 1 });
                     
                            var operationalStats = {};
                            this.#statsList.forEach(function(stat) {
                                operationalStats['cluster:' + stat] = 0;
                            });
                            
                           
                            currentOperations.top.forEach(shard  => {
                                    
                                    this.#statsList.forEach(stat  => {
                                        operationalStats['shard:' + shard.shardName + ":" + stat] = 0;
                                    });
                                    
                                    
                                    for (let db of Object.keys(shard.totals)) {
                                            
                                            if (!( ('db:' + db ) in operationalStats)){
                                                
                                                    this.#statsList.forEach(stat  => {
                                                        operationalStats['db:' + db + ":" + stat] = 0;
                                                    });
                                                
                                            }
                                            
                                            for (let metric of Object.keys(shard.totals[db])) {
                                                
                                                    ['count','time'].forEach(stat  => {
                                                        
                                                            operationalStats['cluster:' +  metric + ":" + stat] =  operationalStats['cluster:' +  metric + ":" + stat] + shard.totals[db][metric][stat];
                                                            operationalStats['shard:' + shard.shardName + ":" + metric + ":" + stat] =  operationalStats['shard:' + shard.shardName + ":" + metric + ":" + stat] + shard.totals[db][metric][stat];
                                                            operationalStats['db:' + db + ":" + metric + ":" + stat] =  operationalStats['db:' + db + ":" + metric + ":" + stat] + shard.totals[db][metric][stat];
                                                    });
                                                    
                                                    ['latency'].forEach(stat  => {
                                                            operationalStats['cluster:' +  metric + ":" + stat] =  0;
                                                            operationalStats['shard:' + shard.shardName + ":" + metric + ":" + stat] =  0;
                                                            operationalStats['db:' + db + ":" + metric + ":" + stat] =  0;
                                                    });
                                                
                                                   
                                            }
                                            
                                    }
                                        
                            });
                            
                            
                            
                            
                            //-- Update Cluster Metrics - AWS CloudWatch
                            const clusterMetrics = await AWSObject.getGenericMetrics({ metrics : this.#metricList });
                            
                            
                            this.#metricCatalog.forEach(metric  => {
                                operationalStats[metric] = clusterMetrics[metric].value;
                                operationalStats[metric+"Timestamp"] = clusterMetrics[metric].timestamp;
                            });
                            
                            
                            //-- Take new snapshot
                            this.objectMetrics.newSnapshot(operationalStats,timeNow.getTime());
                            
                            
                            //-- Update Latency Stats - Cluster
                            ['total','insert','queries','update','remove','getmore','commands'].forEach(stat  => {
                                    this.objectMetrics.setItemValueCustom(
                                                                            "cluster:" + stat + ":latency",
                                                                            ( this.objectMetrics.getItemValue("cluster:" + stat + ":time") / this.objectMetrics.getItemValue("cluster:" + stat + ":count")) || 0
                                                                         );
                            });
                            
                            
                            //-- Update Latency Stats - Shards
                            this.#metadata['shards'].forEach(shard  => {
                                    ['total','insert','queries','update','remove','getmore','commands'].forEach(stat  => {
                                            this.objectMetrics.setItemValueCustom(
                                                                                    "shard:" +  shard + ":" + stat + ":latency", 
                                                                                    ( this.objectMetrics.getItemValue("shard:" +  shard + ":" + stat + ":time") / this.objectMetrics.getItemValue("shard:" +  shard + ":" + stat + ":count")) || 0
                                                                                );
                                    });
                            });
                            
                            
                            //-- Update Latency Stats - Databases
                            this.#metadata['dbs'].forEach(db  => {
                                    ['total','insert','queries','update','remove','getmore','commands'].forEach(stat  => {
                                            this.objectMetrics.setItemValueCustom(
                                                                                    "db:" +  db + ":" + stat + ":latency",
                                                                                    ( this.objectMetrics.getItemValue("db:" +  db + ":" + stat + ":time") / this.objectMetrics.getItemValue("db:" +  db + ":" + stat + ":count")) || 0
                                                                                );
                                    });
                            });


                            
                            //-- Update Shard Metrics - AWS CloudWatch
                            for (let shard of Object.keys(this.#clusterShards)) {
                                    this.#clusterShards[shard].refreshData();
                            }
                            
                                        
                }
                catch(err){
                        this.#objLog.write("refreshData","err",err);
                        
                 
                }
            
        }
        
        
        //-- Gather Metadata
        async getMetadata(){
                try
                {
                     
                            var metadata = {};
                            metadata['shards'] = [];
                            metadata['collections'] = [];
                            metadata['dbs'] = [];
                            
                            const shards = await this.#connection.db("admin").command({ top: 1 });
                            shards.top.forEach(shard  => {
                                
                                    metadata['shards'].push(shard.shardName);
                                    
                                    for (let db of Object.keys(shard.totals)) {
                                        if (!(metadata['collections'].includes(db)))
                                            metadata['collections'].push(db);
                                    }
                            });
                            
                            
                            const dbs = await this.#connection.db("admin").command({ listDatabases: 1 });
                            dbs.databases.forEach(db  => {
                                    metadata['dbs'].push(db.name);
                            });
                                        
                            
                            return { ...metadata };
                            
                }
                catch(err){
                        this.#objLog.write("getMetadata","err",err);
                        return { metadata : {} };
                 
                }
            
        }
        
        
        
        //-- Add Shards and Init Metrics
        async addShards(){
            try {
                
                //-- Add Shards
                this.#metadata = await this.getMetadata();
                
                this.#metadata['shards'].forEach(shard => {
                    this.#clusterShards[shard] = new classDocumentDBElasticShard({ properties : {...this.objectProperties, shardId : shard } });
                });
                
                //-- Generate list of metrics - Engine
                var metrics = [];
                
                this.#statsList.forEach(stat  => {
                        metrics.push({ name : "cluster:" + stat , type : (stat.includes("latency") ? 4 : 1), history : 20 });
                });
                
                
                this.#metadata['shards'].forEach(shard  => {
                        this.#statsList.forEach(stat  => {
                                metrics.push({ name : "shard:" + shard + ":" + stat , type : (stat.includes("latency") ? 4 : 1), history : 20 });
                        });
                });
                
                
                this.#metadata['dbs'].forEach(db  => {
                        this.#statsList.forEach(stat  => {
                                metrics.push({ name : "db:" + db + ":" + stat , type : (stat.includes("latency") ? 4 : 1), history : 20 });
                        });
                });
                
                
                //-- Generate list of metrics - AWS CloudWatch
                this.#metricCatalog.forEach(metric  => {
                        metrics.push({ name : metric , type : 5, history : 20 });
                });
                this.objectMetrics = new classMetrics({ metrics : metrics }) ;
                
                
            }
            catch(err){
                        this.#objLog.write("addShards","err",err);
            }
            
        }
        
        
        //-- Get All Cluster Data
        getAllDataCluster(){
            var results = {};
            try {
                
                
                var metrics = this.objectMetrics.getMetricList();
                var shards = [];
                var clusterMetrics = {};
                var clusterMetricsHistory = {};
                
                //-- Cluster Metrics - Engine
                this.#statsList.forEach(stat  => {
                        statItems = stat.split(":");
                        switch (statItems[1]) {
                            case "count":
                                clusterMetrics = { ...clusterMetrics, 
                                                [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Count" ] :  metrics['cluster'  + ":" + stat]
                                } ;
                                clusterMetricsHistory["Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Count"] = {...metrics['history']['cluster'  + ":" + stat], name : "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Count" };
                            break;
                            
                            case "latency":
                                clusterMetrics = { ...clusterMetrics, 
                                                    [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency" ] : metrics['cluster'  + ":" + statItems[0] + ":latency" ]
                                } ;
                                clusterMetricsHistory["Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency"] = {...metrics['history']['cluster'  + ":" + stat], name : "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency" };
                            break;
                        }
                });
                
                
                
                 //-- Cluster Metrics - AWS CloudWatch
                this.#metricCatalog.forEach(metric  => {
                        clusterMetrics = {...clusterMetrics, [metric] : metrics[metric] };
                        clusterMetricsHistory[metric] = {...metrics['history'][metric] };
                });
                
                        
                //-- Shard Metrics - Engine
                var nodeId = 0;
                for (let shard of Object.keys(this.#clusterShards)) {
                        
                        var shardMetrics = {};
                        var shardMetricsHistory = {};
                        var statItems;
                        this.#statsList.forEach(stat  => {
                                    statItems = stat.split(":");
                                    switch (statItems[1]) {
                                        case "count":
                                            shardMetrics = { ...shardMetrics, 
                                                            [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Count" ] :  metrics['shard:' + shard + ":" + stat],
                                                            [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency" ] : metrics['shard:' + shard + ":" + statItems[0] + ":time" ]  / ( metrics['shard:' + shard + ":" + stat]  || 0)
                                            } ;
                                            shardMetricsHistory[ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Count"] = {...metrics['history']['shard:' + shard + ":" + stat], name : "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Count" };
                                        break;
                                        
                                        
                                        case "latency":
                                            shardMetrics = { ...shardMetrics, 
                                                            [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency" ] :  metrics['shard:' + shard + ":" + stat]
                                                            
                                            } ;
                                            shardMetricsHistory[ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency"] = {...metrics['history']['shard:' + shard + ":" + stat], name : "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency" };
                                        break;
                                        
                                    }
                                 
                        });
                        
                        var clusterShardMetrics = this.#clusterShards[shard].getShardMetrics();
                        
                        
                        shards.push({ shardId : shard, name : shard, nodeId : nodeId, ...clusterShardMetrics, ...shardMetrics, history : {...shardMetricsHistory, ...clusterShardMetrics.history } });
                        nodeId++;
                    
                }
                    
                            
                results = {
                    //-- Cluster Properties
                    ...this.objectProperties,
                    //-- Cluster Stats - Engine
                    ...clusterMetrics,
                    history : {...clusterMetricsHistory},
                    //-- Cluster Metrics - AWS CloudWatch
                    //...this.#metrics,
                    //-- Shard Details
                    nodes : shards,
                };
                
                
            }
            catch(err){
                    this.#objLog.write("getAllDataCluster","err",err);
            }
            return results;
            
            
        }
        
        
        //-- Get Shard Details
        getAllDataShards(){
            var results = [];
            try {
                
                
                var metrics = this.objectMetrics.getMetricList();
                var shards = [];
                        
                //-- Shard Metrics - Engine
                var nodeId = 0;
                for (let shard of Object.keys(this.#clusterShards)) {
                        
                        var shardMetrics = {};
                        var statItems;
                        this.#statsList.forEach(stat  => {
                                    statItems = stat.split(":");
                                    switch (statItems[1]) {
                                        case "count":
                                            shardMetrics = { ...shardMetrics, 
                                                            [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Count" ] :  metrics['shard:' + shard + ":" + stat],
                                                            [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency" ] : metrics['shard:' + shard + ":" + statItems[0] + ":time" ]  / ( metrics['shard:' + shard + ":" + stat]  || 0)
                                            } ;
                                        break;
                                        
                                        
                                        case "latency":
                                            shardMetrics = { ...shardMetrics, 
                                                            [ "Ops" + (statItems[0].charAt(0).toUpperCase() + statItems[0].slice(1)) + "Latency" ] :  metrics['shard:' + shard + ":" + stat]
                                                            
                                            } ;
                                        break;
                                        
                                    }
                                 
                        });
                        
                        var clusterShardMetrics = this.#clusterShards[shard].getShardMetrics();
                        delete clusterShardMetrics.history;
                        shards.push({ shardId : shard, name : shard, nodeId : nodeId, ...clusterShardMetrics, ...shardMetrics, });
                        nodeId++;
                    
                }
                    
                            
                results = shards;
                
            }
            catch(err){
                    this.#objLog.write("getAllDataShards","err",err);
            }
            return results;
            
            
        }
        
        
        
        //-- Get Shard Analytics
        async getDataShardsAnalytics(object){
            try {
                
                
                //-- Shard Information
                var avgShardResults = await AWSObject.getGenericMetricsInsight({ 
                                                                sqlQuery : `SELECT AVG(${object.metricName}) FROM SCHEMA(\"AWS/DocDB-Elastic\", ShardId,ClusterId,ClusterName) WHERE ClusterId = '${this.objectProperties.clusterUid}' GROUP BY ShardId`, 
                                                                period : 60 * 180, 
                                                                interval : 180
                });
                
                
                var shards = [];
                avgShardResults.forEach(function(item) {
                        shards.push({ 
                                        shardId : item.Label, 
                                        value : item.Values[0],
                                        timestamp : item.Timestamps[0],
                        });
                });
                
                var maxResults = await AWSObject.getGenericMetricsInsight({ 
                                                                sqlQuery : `SELECT MAX(${object.metricName}) FROM SCHEMA(\"AWS/DocDB-Elastic\", ShardId,ClusterId,ClusterName) WHERE ClusterId = '${this.objectProperties.clusterUid}'`, 
                                                                period : 60  * 5, 
                                                                interval : 180 
                });
                
                
                var minResults = await AWSObject.getGenericMetricsInsight({ 
                                                                sqlQuery : `SELECT MIN(${object.metricName}) FROM SCHEMA(\"AWS/DocDB-Elastic\", ShardId,ClusterId,ClusterName) WHERE ClusterId = '${this.objectProperties.clusterUid}'`, 
                                                                period : 60  * 5, 
                                                                interval : 180 
                });
                
                
                var avgResults = await AWSObject.getGenericMetricsInsight({ 
                                                                sqlQuery : `SELECT AVG(${object.metricName}) FROM SCHEMA(\"AWS/DocDB-Elastic\", ShardId,ClusterId,ClusterName) WHERE ClusterId = '${this.objectProperties.clusterUid}'`, 
                                                                period : 60  * 5, 
                                                                interval : 180 
                });
                
                
                
    
                shards = (shards.sort(
                            (p1, p2) => 
                            (p1.value < p2.value) ? 1 : (p1.value > p2.value) ? -1 : 0)
                );
                
                
                //-- Max/Min/Avg values
                var maxValues = [];
                var minValues = [];
                var avgValues = [];
                
                if (Array.isArray(maxResults[0].Values))
                    maxValues = maxResults[0].Values.reverse();
                
                
                if (Array.isArray(minResults[0].Values))
                    minValues = minResults[0].Values.reverse();
                
                
                if (Array.isArray(avgResults[0].Values))
                    avgValues = avgResults[0].Values.reverse();
                
                return { shards : shards, maxValues : maxValues , minValues : minValues, avgValues : avgValues } ;
                
            }
            catch(err){
                    this.#objLog.write("getDataShardsAnalytics","err",err);
                    return { shards : [], maxValues : [], minValues : [] } ;
            }
            
            
            
        }
        
        
        //-- Get Shard Analytics
        async getDataShardsAnalyticsDetails(object){
            try {
                
                var results = await AWSObject.getGenericMetricsInsight({ 
                                                                sqlQuery : `SELECT AVG(${object.metricName}) FROM SCHEMA(\"AWS/DocDB-Elastic\", ShardId,ClusterId,ClusterName) WHERE ClusterId = '${this.objectProperties.clusterUid}' AND ShardId = '${object.shardId}' `, 
                                                                period : 60 * 5, 
                                                                interval : 180 
                });
                
                return results[0].Values.reverse();
                
            }
            catch(err){
                    this.#objLog.write("getDataShardsAnalytics","err",err);
                    return [];
            }
            
            
            
        }
        
        //-- Get Shard Ids
        getClusterShardIds(){
            
            var shardList = "";
            try {
                
                this.#metadata['shards'].forEach(shard  => {
                    shardList = shardList + ( shard + "|" + this.objectProperties.clusterUid + "|" + this.objectProperties.clusterId ) + ",";        
                });
                
                shardList = shardList.slice(0, -1);
                
            }
            catch(err){
                    this.#objLog.write("getClusterShardIds","err",err);
            }
            
            return shardList;
            
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
                
                console.log(params);
            
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










//--#############
//--############# CLASS : classElasticacheServerlessCluster
//--#############


class classElasticacheServerlessCluster {

        //-- Looging
        #objLog = new classLogging({ name : "classElasticacheServerlessCluster", instance : "generic" });
        
        //-- Shard Metrics
        #metricCatalog = {
                        'AuthenticationFailures' : { factor : 60 },
                        'BytesUsedForCache' : { factor : 1 },
                        'CacheHitRate' : { factor : ( 1 / 100 ) },
                        'CacheHits' : { factor : 60 },
                        'CommandAuthorizationFailures' : { factor : 60 },
                        'CurrConnections' : { factor : 1 },
                        'CurrItems' : { factor : 1 },
                        'CurrVolatileItems' : { factor : 1 },
                        'ElastiCacheProcessingUnits' : { factor : 60 },
                        'Evictions' : { factor : 60 },
                        'IamAuthenticationExpirations' : { factor : 60 },
                        'IamAuthenticationThrottling' : { factor : 60 },
                        'KeyAuthorizationFailures' : { factor : 60 },
                        'NetworkBytesIn' : { factor : 60 },
                        'NetworkBytesOut' : { factor : 60 },
                        'NewConnections' : { factor : 60 },
                        //'SuccessfulReadRequestLatency' : { factor : 0.000001 },
                        //'SuccessfulWriteRequestLatency' : { factor : 0.000001 },
                        'SuccessfulReadRequestLatency' : { factor : 1 },
                        'SuccessfulWriteRequestLatency' : { factor : 1 },
                        'ThrottledCmds' : { factor : 60 },
                        'TotalCmdsCount' : { factor : 60 },
                        //--Commands
                        'EvalBasedCmds' : { factor : 60 },
                        'EvalBasedCmdsECPUs' : { factor : 60 },
                        'GeoSpatialBasedCmds' : { factor : 60 },
                        'GeoSpatialBasedCmdsECPUs' : { factor : 60 },
                        'GetTypeCmds' : { factor : 60 },
                        'GetTypeCmdsECPUs' : { factor : 60 },
                        'HashBasedCmds' : { factor : 60 },
                        'HashBasedCmdsECPUs' : { factor : 60 },
                        'HyperLogLogBasedCmds' : { factor : 60 },
                        'HyperLogLogBasedCmdsECPUs' : { factor : 60 },
                        'JsonBasedCmds' : { factor : 60 },
                        'JsonBasedCmdsECPUs' : { factor : 60 },
                        'JsonBasedGetCmds' : { factor : 60 },
                        'JsonBasedGetCmdsECPUs' : { factor : 60 },
                        'JsonBasedSetCmds' : { factor : 60 },
                        'JsonBasedSetCmdsECPUs' : { factor : 60 },
                        'KeyBasedCmds' : { factor : 60 },
                        'KeyBasedCmdsECPUs' : { factor : 60 },
                        'ListBasedCmds' : { factor : 60 },
                        'ListBasedCmdsECPUs' : { factor : 60 },
                        'NonKeyTypeCmds' : { factor : 60 },
                        'NonKeyTypeCmdsECPUs' : { factor : 60 },
                        'PubSubBasedCmds' : { factor : 60 },
                        'PubSubBasedCmdsECPUs' : { factor : 60 },
                        'SetBasedCmds' : { factor : 60 },
                        'SetBasedCmdsECPUs' : { factor : 60 },
                        'SetTypeCmds' : { factor : 60 },
                        'SetTypeCmdsECPUs' : { factor : 60 },
                        'SortedSetBasedCmds' : { factor : 60 },
                        'SortedSetBasedCmdsECPUs' : { factor : 60 },
                        'StreamBasedCmds' : { factor : 60 },
                        'StreamBasedCmdsECPUs' : { factor : 60 },
                        'StringBasedCmds' : { factor : 60 },
                        'StringBasedCmdsECPUs' : { factor : 60 },
        };
        #dimension;
        #metrics = {};
        #metricList = [];
        
        
        //-- Object Properties
        objectProperties;
        
        
        //-- Object Connection
        #connection;
        
        //-- Constructor method
        constructor(object) { 
                this.objectProperties = object.properties;
                this.#objLog.properties = {...this.#objLog.properties, clusterId : this.objectProperties.clusterId }
                this.objectConnection = object.connection;
                this.isAuthenticated = false;
                
                //-- Create AWS Metric Catalog
                this.#dimension = [ 
                                    { Name: "clusterId", Value: this.objectProperties.clusterId }, 
                ];
                
                for (let metric of Object.keys(this.#metricCatalog)) {
                        this.#metricList.push({
                            namespace : "AWS/ElastiCache",
                            metric : metric,
                            label : metric,
                            dimension : this.#dimension,
                            stat : "Average"
                        });
                        this.#metrics[metric] = { timestamps : [], values : [] };
                        
                };
                
                
                
                            
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
        
        
        //-- Refresh metrics
        async refreshData() {
            
            
            const clusterStatus = await AWSObject.getElasticacheServerlessClusterStatus(this.objectProperties.clusterId);
            this.objectProperties = {...this.objectProperties, ...clusterStatus };
            this.objectProperties.lastUpdate = new Date().toTimeString().split(' ')[0];
            
            //-- Update Cluster Metrics - AWS CloudWatch
            const clusterMetrics = await AWSObject.getGenericMetricsDataset({ metrics : this.#metricList, interval : 60, period : 1 });
            var history = [];
            var value = 0;
            var delay = 0;
            clusterMetrics.forEach(item => {
                    try {
                            
                            if ( item.Timestamps.length > 0 ) {
                                
                                delay = this.#dateDiff(item.Timestamps[0]);
                                if ( delay <= 5 ) {
                                    if ( this.#metricCatalog[item.Label].factor == 1)
                                        value = item.Values[0];
                                    else
                                        value = item.Values[0] / this.#metricCatalog[item.Label].factor;
                                }
                                else    
                                    value = 0;
                                    
                                history = item.Timestamps.map((value, index) => {
                                 
                                  if ( this.#metricCatalog[item.Label].factor == 1)
                                    return [item.Timestamps[index], item.Values[index] ];
                                  else
                                    return [item.Timestamps[index], item.Values[index] / this.#metricCatalog[item.Label].factor ];
                                    
                                });
                                
                                
                                for (let iMinutes=1; iMinutes <= delay ; iMinutes++){
                                    history.push([this.#addMinutes(new Date(item.Timestamps[0]),iMinutes), null ]);         
                                }
                                
                            }
                            else {
                                history = [];
                                value = 0;
                            }
                            
                            this.#metrics[item.Label] = { value, value, history : history };
                    }
                    catch(err){
                        this.#objLog.write("refreshData","err",err);
                    }
            });
            
        }
        
        
        
        
        
        //-- Get Shard Details
        getAllDataCluster(){
            var results = {};
            try {
                
                var history = {};
                for (let metric of Object.keys(this.#metrics)) {
                    
                    if ( this.#metrics[metric].history.length > 0 ){
                        results = {...results, [metric] : this.#metrics[metric].value };
                        history = {...history, [metric] : this.#metrics[metric].history };
                    }
                    else {
                        results = {...results, [metric] : 0 };
                        history = { ...history, [metric] : [] };
                    }
                    
                }
                
                results = {...results, history : history, ...this.objectProperties };
                
                
            }
            catch(err){
                    this.#objLog.write("getAllClusterData","err",err);
            }
            return results;
            
        }
        
        
        
        #dateDiff(date){
            
            var diff = Math.abs(new Date(date) - new Date());
            return (Math.floor((diff/1000)/60));
            
        }
        
        #addMinutes(date, minutes) {
            
            date.setMinutes(date.getMinutes() + minutes);
            return date;
        
            
        }


        async getAnalyticsData(object)
        {
            var results = [];
            try {
                        
                //-- Gather Cluster Metrics - AWS CloudWatch
                const clusterMetrics = await AWSObject.getGenericMetricsDataset({ 
                                                                                    metrics : [
                                                                                                {
                                                                                                    namespace : "AWS/ElastiCache",
                                                                                                    metric : object.metricName,
                                                                                                    dimension : [{ Name: "clusterId", Value: this.objectProperties.clusterId }],
                                                                                                    stat : "Average",
                                                                                                    label : object.metricName,
                                                                                                }
                                                                                            ], 
                                                                                    interval : object.interval, 
                                                                                    period : object.period
                });
                
                
                if (clusterMetrics.length > 0) {
                    
                    results  = clusterMetrics[0].Timestamps.map((value, index) => {
                                      if ( object.factor == 1)
                                        return [clusterMetrics[0].Timestamps[index], clusterMetrics[0].Values[index] ];
                                      else
                                        return [clusterMetrics[0].Timestamps[index], clusterMetrics[0].Values[index] / object.factor ];
                        });
                }
                                
                
                
            }   
            catch(err){
                    this.#objLog.write("getAnalyticsData","err",err);
            }
            
            return results;
            
        }
        
        
        
}




//--#############
//--############# CLASS : classDynamoDB
//--#############


class classDynamoDB {

        //-- Looging
        #objLog = new classLogging({ name : "classDynamoDB", instance : "generic" });
        
        //-- Shard Metrics
        #metricCatalog = {};
        #dimension;
        #metrics = {};
        #metricList = [];
        
        
        //-- Object Properties
        objectProperties;
        
        //-- Constructor method
        constructor(object) { 
                this.objectProperties = object.properties;
                this.#objLog.properties = {...this.#objLog.properties, tableName : this.objectProperties.tableName }
                
                //-- Create AWS Metric Catalog
                this.#dimension = [ 
                                    { Name: "TableName", Value: this.objectProperties.tableName }, 
                ];
                
                this.#metricCatalog = {
                        'ConsumedReadCapacityUnits' : { metric : 'ConsumedReadCapacityUnits', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }]  },
                        'ConsumedWriteCapacityUnits' : { metric : 'ConsumedWriteCapacityUnits', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }]  },
                        'ReadThrottleEvents' : { metric : 'ReadThrottleEvents', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }]  },
                        'WriteThrottleEvents' : { metric : 'WriteThrottleEvents', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }]  },
                        'ProvisionedWriteCapacityUnits' : { metric : 'ProvisionedWriteCapacityUnits', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }]  },
                        'ProvisionedReadCapacityUnits' : { metric : 'ProvisionedReadCapacityUnits', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }]  },
                        'SuccessfulRequestLatencyGetItem' : { metric : 'SuccessfulRequestLatency', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "GetItem" }]  },
                        'SuccessfulRequestLatencyBatchGetItem' : { metric : 'SuccessfulRequestLatency', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "BatchGetItem" }]  },
                        'SuccessfulRequestLatencyPutItem' : { metric : 'SuccessfulRequestLatency', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "PutItem" }]  },
                        'SuccessfulRequestLatencyBatchWriteItem' : { metric : 'SuccessfulRequestLatency', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "BatchWriteItem" }]  },
                        'SuccessfulRequestLatencyQuery' : { metric : 'SuccessfulRequestLatency', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "Query" }]  },
                        'SuccessfulRequestLatencyScan' : { metric : 'SuccessfulRequestLatency', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "Scan" }]  },
                        'ThrottledRequestsGetItem' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "GetItem" }]  },
                        'ThrottledRequestsScan' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "Scan" }]  },
                        'ThrottledRequestsQuery' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "Query" }]  },
                        'ThrottledRequestsBatchGetItem' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "BatchGetItem" }]  },
                        'ThrottledRequestsPutItem' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "PutItem" }]  },
                        'ThrottledRequestsUpdateItem' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "UpdateItem" }]  },
                        'ThrottledRequestsDeleteItem' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "DeleteItem" }]  },
                        'ThrottledRequestsBatchWriteItem' : { metric : 'ThrottledRequests', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "Operation", Value: "BatchWriteItem" }]  },
                };
                
                
                for (let metric of Object.keys(this.#metricCatalog)) {
                        this.#metricList.push({
                            namespace : "AWS/DynamoDB",
                            label : metric,
                            metric : this.#metricCatalog[metric].metric,
                            dimension : this.#metricCatalog[metric].dimension,
                            stat : this.#metricCatalog[metric].stat
                        });
                        this.#metrics[metric] = { timestamps : [], values : [] };
                        
                };
                
                
                            
        }
          
        
        
        //-- Refresh metrics
        async refreshData() {
            
            const tableInfo = await AWSObject.getDynamoDBTableInfo(this.objectProperties.tableName);
            this.objectProperties = {...this.objectProperties, ...tableInfo };
            this.objectProperties.lastUpdate = new Date().toTimeString().split(' ')[0];
            
            //-- Update Cluster Metrics - AWS CloudWatch
            const tableMetrics = await AWSObject.getGenericMetricsDataset({ metrics : this.#metricList, interval : 60, period : (1 / 60) });
            var history = [];
            var value = 0;
            var delay = 0;
            tableMetrics.forEach(item => {
                    try {
                                
                            if ( item.Timestamps.length > 0 ) {
                                
                                item.Timestamps.shift();
                                item.Values.shift();
                                
                                delay = this.#dateDiff(item.Timestamps[0]);
                                if ( delay <= 5 ) {
                                    if ( this.#metricCatalog[item.Label].factor == 1)
                                        value = item.Values[0];
                                    else
                                        value = item.Values[0] / this.#metricCatalog[item.Label].factor;
                                }
                                else    
                                    if (item.Label == "ProvisionedWriteCapacityUnits" || item.Label == "ProvisionedReadCapacityUnits")
                                        value = item.Values[0];
                                    else
                                        value = 0;
                                    
                                history = item.Timestamps.map((value, index) => {
                                 
                                  if ( this.#metricCatalog[item.Label].factor == 1)
                                    return [item.Timestamps[index], item.Values[index] ];
                                  else
                                    return [item.Timestamps[index], item.Values[index] / this.#metricCatalog[item.Label].factor ];
                                    
                                });
                                
                                
                                for (let iMinutes=1; iMinutes <= delay ; iMinutes++){
                                    history.push([this.#addMinutes(new Date(item.Timestamps[0]),iMinutes), null ]);         
                                }
                                
                            }
                            else {
                                history = [];
                                value = 0;
                            }
                            
                            this.#metrics[item.Label] = { value, value, history : history };
                    }
                    catch(err){
                        this.#objLog.write("refreshData","err",err);
                    }
            });
            
        }
        
        
        //-- Get Table Details
        getAllTableData(){
            var results = {};
            try {
                
                var history = {};
                for (let metric of Object.keys(this.#metrics)) {
                    
                    if ( this.#metrics[metric].history.length > 0 ){
                        results = {...results, [metric] : this.#metrics[metric].value };
                        history = {...history, [metric] : this.#metrics[metric].history };
                    }
                    else {
                        results = {...results, [metric] : 0 };
                        history = { ...history, [metric] : [] };
                    }
                    
                }
                
                results = {...results, history : history, ...this.objectProperties };
                
                
            }
            catch(err){
                    this.#objLog.write("getAllTableData","err",err);
            }
            return results;
            
        }
        
        
        
        #dateDiff(date){
            
            var diff = Math.abs(new Date(date) - new Date());
            return (Math.floor((diff/1000)/60));
            
        }
        
        #addMinutes(date, minutes) {
            
            date.setMinutes(date.getMinutes() + minutes);
            return date;
        }
        
        
        
        //-- Get GSI metrics
        async getIndexData(object) {
            
            const indexInfo = await AWSObject.getDynamoDBIndexInfo(this.objectProperties.tableName, object.indexName);
            
            var metricList = [];
            var metricCatalog = {
                        'ConsumedReadCapacityUnits' : { metric : 'ConsumedReadCapacityUnits', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "GlobalSecondaryIndexName", Value: object.indexName } ]  },
                        'ConsumedWriteCapacityUnits' : { metric : 'ConsumedWriteCapacityUnits', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "GlobalSecondaryIndexName", Value: object.indexName } ]  },
                        'ReadThrottleEvents' : { metric : 'ReadThrottleEvents', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "GlobalSecondaryIndexName", Value: object.indexName } ]  },
                        'WriteThrottleEvents' : { metric : 'WriteThrottleEvents', factor : 60, stat : "Sum", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "GlobalSecondaryIndexName", Value: object.indexName } ]  },
                        'ProvisionedWriteCapacityUnits' : { metric : 'ProvisionedWriteCapacityUnits', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "GlobalSecondaryIndexName", Value: object.indexName }]  },
                        'ProvisionedReadCapacityUnits' : { metric : 'ProvisionedReadCapacityUnits', factor : 1, stat : "Average", dimension : [{ Name: "TableName", Value: this.objectProperties.tableName }, { Name: "GlobalSecondaryIndexName", Value: object.indexName }]  },
            };
            
            for (let metric of Object.keys(metricCatalog)) {
                        metricList.push({
                            namespace : "AWS/DynamoDB",
                            label : metric,
                            metric : metricCatalog[metric].metric,
                            dimension : metricCatalog[metric].dimension,
                            stat : metricCatalog[metric].stat
                        });
                };
            
            //-- Get index metrics - AWS CloudWatch
       
            const indexMetrics = await AWSObject.getGenericMetricsDataset({ metrics : metricList, interval : 60, period : (1 / 60) });
            var history = [];
            var value = 0;
            var delay = 0;
            var metrics = {...indexInfo};
            indexMetrics.forEach(item => {
                    try {
                                
                            if ( item.Timestamps.length > 0 ) {
                                
                                item.Timestamps.shift();
                                item.Values.shift();
                                
                                delay = this.#dateDiff(item.Timestamps[0]);
                                if ( delay <= 5 ) {
                                    if ( metricCatalog[item.Label].factor == 1)
                                        value = item.Values[0];
                                    else
                                        value = item.Values[0] / metricCatalog[item.Label].factor;
                                }
                                else    
                                    if (item.Label == "ProvisionedWriteCapacityUnits" || item.Label == "ProvisionedReadCapacityUnits")
                                        value = item.Values[0];
                                    else
                                        value = 0;
                                    
                                history = item.Timestamps.map((value, index) => {
                                 
                                  if ( this.#metricCatalog[item.Label].factor == 1)
                                    return [item.Timestamps[index], item.Values[index] ];
                                  else
                                    return [item.Timestamps[index], item.Values[index] / metricCatalog[item.Label].factor ];
                                    
                                });
                                
                                
                                for (let iMinutes=1; iMinutes <= delay ; iMinutes++){
                                    history.push([this.#addMinutes(new Date(item.Timestamps[0]),iMinutes), null ]);         
                                }
                                
                            }
                            else {
                                history = [];
                                value = 0;
                            }
                            
                            metrics = {...metrics, [item.Label] : value, history : { ...metrics.history, [item.Label] : history } };
                            
                    }
                    catch(err){
                        this.#objLog.write("getIndexData","err",err);
                    }
            });
            
            return metrics;
            
        }
        
        
}



//--#############
//--############# CLASS : classAuroraLimitlessPostgresqlEngine                                                                                               
//--#############


class classAuroraLimitlessPostgresqlEngine {

    //-- Looging
    #objLog = new classLogging({ name : "classAuroraLimitlessPostgresqlEngine", instance : "generic" });
    #connection = {};
    
    ///-- subclusters
    #sql_subclusters = `
                        SELECT 
                            subcluster_id,
                            subcluster_type                         
                        FROM 
                            rds_aurora.limitless_subclusters
                        order by 
                            subcluster_id
    `;

    ///-- Database Queries
    #sql_statement_metrics = `
                        SELECT 
                            a.subcluster_id,
                            a.subcluster_type,
                            SUM(a.numbackends) as numbackends,
                            SUM(a.tup_returned) as tup_returned, 
                            SUM(a.tup_fetched) as tup_fetched, 
                            SUM(a.tup_inserted) as tup_inserted,
                            SUM(a.tup_updated) as tup_updated,
                            SUM(a.tup_deleted) as tup_deleted, 
                            SUM(a.blk_read_time) as blk_read_time, 
                            SUM(a.blk_write_time) as blk_write_time, 
                            SUM(a.xact_commit) as xact_commit, 
                            SUM(a.xact_rollback) as xact_rollback,
                            MAX(b.numbackendsactive) as numbackendsactive
                        FROM 
                            rds_aurora.limitless_stat_database a,
                            (
                            select 
                                subcluster_id,
                                subcluster_type,
                                count(*) as numbackendsactive
                            from 
                                rds_aurora.limitless_stat_activity
                            where 
                                state != 'idle' 
                            group by
                                subcluster_id,
                                subcluster_type
                            ) b
                        WHERE
                            a.subcluster_id = b.subcluster_id
                        GROUP BY
                        a.subcluster_id,
                        a.subcluster_type
                        order by 
                        a.subcluster_id
    `;
    
    #sql_statement_sessions = `
                        SELECT 
                            subcluster_id,
                            subcluster_type,
                            distributed_session_id,
                            pid as "PID",
                            usename as "Username",
                            state as "State",
                            wait_event as "WaitEvent",
                            datname as "Database",
                            CAST(CURRENT_TIMESTAMP-query_start AS VARCHAR)  as "ElapsedTime",
                            application_name as "AppName",
                            client_addr as "Host",
                            distributed_query_id,
                            query_id,
                            query as "SQLText" 
                        FROM 
                            rds_aurora.limitless_stat_activity
                        ORDER BY 
                            query_start asc limit 10;
    `;

    #objectMetrics = [];
    #cluster = { 
                metrics : { global : {}, routers : {}, shards : {} } ,
        };
    
    #shards = {};    
    #subClustersIds = {};
    #clusterMetadata = {};
    #shardGroupMetadata = {};

    //-- Cloudwatch Metrics   
    
    #cloudwatchMetricsShards = {};
    #metricCatalog = [
                    'BufferCacheHitRatio',
                    'CommitLatency',
                    'CommitThroughput',
                    'NetworkReceiveThroughput',
                    'NetworkThroughput',
                    'NetworkTransmitThroughput',
                    'ReadIOPS',
                    'ReadLatency',
                    'ReadThroughput',
                    'StorageNetworkReceiveThroughput',
                    'StorageNetworkThroughput',
                    'StorageNetworkTransmitThroughput',
                    'TempStorageIOPS',
                    'TempStorageThroughput',
                    'WriteIOPS',
                    'WriteLatency',
                    'WriteThroughput'
    ];

    


    //-- Constructor method
    constructor(object) { 
            this.objectConnection = object.connection;
            this.objectMetrics = object.metrics;
            this.objectProperties = object.properties;
            this.isAuthenticated = false;            
            this.#objLog.properties = {...this.#objLog.properties, instance : this.objectConnection.host }  
            
            //Initialization cluster level metrics
            if (object.hasOwnProperty("metrics")) {                
                this.#cluster['metrics']['global'] = new classMetrics({ metrics : this.objectMetrics }) ;
                this.#cluster['metrics']['shards'] = new classMetrics({ metrics : this.objectMetrics }) ;
                this.#cluster['metrics']['routers'] = new classMetrics({ metrics : this.objectMetrics }) ;
            }           
            
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
                                                                  database: 'postgres_limitless',
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
    
    
    
    //-- Gather new snapshot
    async getSnapshot(){     

            try
            {
             
                //-- Gather metadata from AWS API
                this.#clusterMetadata = await AWSObject.getAuroraLimitlessClusterObject(this.objectProperties.clusterId);
                this.#shardGroupMetadata = await AWSObject.getAuroraLimitlessDbShardObject(this.objectProperties.clusterId);                

                //-- Database Metrics
                this.objectProperties.lastUpdate = new Date().toTimeString().split(' ')[0];
                var currentOperations = (await this.#connection.query(this.#sql_statement_metrics)).rows;
                
                        
                var result = {};
                var clusterSnapshot = {};
                var routerSnapshot = {};
                var shardSnapshot = {};
                var snapshotTime = new Date();
                for (let i = 0; i < currentOperations.length ; i++){                                
               
                                var item = currentOperations[i];                                                                                   
                                var logStreamName = this.#shards[item['subcluster_id']]?.['dbShardResourceId'] + "/" + 
                                                this.#shards[item['subcluster_id']]?.['codeType'] + "/" + 
                                                this.#shards[item['subcluster_id']]?.['subClusterId'] + "-" + 
                                                this.#shards[item['subcluster_id']]?.['subInstanceId'] ;
                                                                                
                                var result = await AWSObject.getCloudWatchRecords({ 
                                                                                            logStreamName: logStreamName,
                                                                                            limit: 1,
                                                                                            logGroupName: 'RDSOSMetrics',
                                                                                            startFromHead: false                                                                                               
                                                                                        
                                });

                                var record = JSON.parse(result.events[0].message);     
                                
                                var nodeSnapshot = {
                                                vcpu: parseFloat(record['numVCPUs']),                                                                                             
                                                readIOPS: parseFloat(record['diskIO']?.[0]?.['readIOsPS']),
                                                writeIOPS: parseFloat(record['diskIO']?.[0]?.['writeIOsPS']),
                                                totalIOPS: parseFloat(record['diskIO']?.[0]?.['readIOsPS']) + parseFloat(record['diskIO']?.[0]?.['writeIOsPS']),
                                                readIOBytes: parseFloat(record['diskIO']?.[0]?.['readThroughput']),
                                                writeIOBytes: parseFloat(record['diskIO']?.[0]?.['writeThroughput']),
                                                totalIOBytes: parseFloat(record['diskIO']?.[0]?.['readThroughput']) + parseFloat(record['diskIO']?.[0]?.['writeThroughput']),
                                                networkBytesIn: parseFloat(record['network']?.[0]?.['rx']),
                                                networkBytesOut: parseFloat(record['network']?.[0]?.['tx']),
                                                totalNetworkBytes: parseFloat(record['network']?.[0]?.['rx']) + parseFloat(record['network']?.[0]?.['tx']),
                                                tuples :    parseFloat(item['tup_fetched']) +
                                                            parseFloat(item['tup_inserted']) +
                                                            parseFloat(item['tup_updated']) +
                                                            parseFloat(item['tup_deleted']),
                                                tuplesWritten : parseFloat(item['tup_inserted']) +
                                                            parseFloat(item['tup_updated']) +
                                                            parseFloat(item['tup_deleted']),
                                                tuplesRead : parseFloat(item['tup_fetched']),
                                                xactTotal: parseFloat(item['xact_commit']) + parseFloat(item['xact_rollback']),
                                                xactCommit: parseFloat(item['xact_commit']),
                                                xactRollback: parseFloat(item['xact_rollback']),
                                                tupReturned: parseFloat(item['tup_returned']),
                                                tupFetched: parseFloat(item['tup_fetched']),
                                                tupInserted: parseFloat(item['tup_inserted']),
                                                tupDeleted: parseFloat(item['tup_deleted']),
                                                tupUpdated: parseFloat(item['tup_updated']),
                                                numbackends : parseFloat(item['numbackends']),
                                                numbackendsActive : parseFloat(item['numbackendsactive'])
                                };
                                
                                this.#shards[item['subcluster_id']].metrics.newSnapshot(nodeSnapshot,snapshotTime.getTime());                                                                  
                                this.#shards[item['subcluster_id']] = {...this.#shards[item['subcluster_id']], "processList" : record['processList'] };                                 
                                
                                
                                for (let metric of Object.keys(nodeSnapshot)) {
                                    if (!(clusterSnapshot.hasOwnProperty(metric)))
                                        clusterSnapshot[metric] = 0;

                                    if (!(shardSnapshot.hasOwnProperty(metric)))
                                        shardSnapshot[metric] = 0;

                                    if (!(routerSnapshot.hasOwnProperty(metric)))
                                        routerSnapshot[metric] = 0;
                                    
                                    clusterSnapshot[metric] = clusterSnapshot[metric] + nodeSnapshot[metric];                                

                                    if(item['subcluster_type'] == "shard")
                                        shardSnapshot[metric] = shardSnapshot[metric] + nodeSnapshot[metric]; 
                                    
                                    if(item['subcluster_type'] == "router")
                                        routerSnapshot[metric] = routerSnapshot[metric] + nodeSnapshot[metric]; 
                                    


                                }


                        }                          
              
                this.#cluster.metrics.global.newSnapshot(clusterSnapshot,snapshotTime.getTime());
                this.#cluster.metrics.shards.newSnapshot(shardSnapshot,snapshotTime.getTime());
                this.#cluster.metrics.routers.newSnapshot(routerSnapshot,snapshotTime.getTime());

            }
            catch(err){
                    this.#objLog.write("getSnapshot","err",err);                   
            }
        
    }
    
   
    //-- Gather Active sessions
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


    //-- Refresh Cluster Data
    async refreshData() {         
        await this.getSnapshot();      
        await this.getCloudwatchMetricsTable();        
    }


        

    //-- Refresh all metadata and shards globally
    async refreshClusterMedatadaGlobal(object){
        try {
            
            

            //-- Gather instances ids from CloudWatch
            var result = await AWSObject.getGenericMetricsInsight({ 
                                                            sqlQuery : `SELECT AVG(DBLoad) FROM \"AWS/RDS\" WHERE DBClusterIdentifier = '${this.objectProperties.clusterId}' GROUP BY DBShardGroupSubClusterIdentifier,DBShardGroupInstanceIdentifier`, 
                                                            period : 60 * 180, 
                                                            interval : 180
            });
            
            
            result.forEach(item => {                              
                var elements = item.Label.split(" ");
                this.#subClustersIds = { ...this.#subClustersIds, [elements[0]] : { subClusterId : elements[0], subInstanceId : elements[1] } };
                
            }); 

            
            //-- Gather metadata from AWS API
            this.#clusterMetadata = await AWSObject.getAuroraLimitlessClusterObject(this.objectProperties.clusterId);
            this.#shardGroupMetadata = await AWSObject.getAuroraLimitlessDbShardObject(this.objectProperties.clusterId);


            //-- Gather subclusters ids from db engine            
            var result = (await this.#connection.query(this.#sql_subclusters)).rows;            

            result.forEach(item => {                              
                if ( (!(this.#shards.hasOwnProperty(item['subcluster_id']))) && this.#subClustersIds.hasOwnProperty(item['subcluster_id']) ) {
                    this.#shards = {...this.#shards , 
                                    [item['subcluster_id']] : { 
                                                                dbShardResourceId : this.#shardGroupMetadata['DBShardGroupResourceId'], 
                                                                type : item['subcluster_type'], 
                                                                codeType : item['subcluster_type']=="shard" ? "DAS" : "DTR" , 
                                                                subClusterId : item['subcluster_id'],                                                                  
                                                                subInstanceId : this.#subClustersIds[item['subcluster_id']]?.['subInstanceId'], 
                                                                metrics : new classMetrics({ metrics : this.objectMetrics }) 
                                                            } 
                    } ;
                }                   
            });
            
            //-- Cloudwatch Metric initialization
            this.cloudwatchMetricInitialization();


        }
        catch(err){
                this.#objLog.write("refreshClusterMedatadaGlobal","err",err);                
        }
    }
     
    

    //-- Refresh cluster metadata from AWS API only
    async refreshClusterMedatadaSingle(object){
        try {
       
            //-- Gather instances ids from CloudWatch
            var result = await AWSObject.getGenericMetricsInsight({ 
                                                            sqlQuery : `SELECT AVG(DBLoad) FROM \"AWS/RDS\" WHERE DBClusterIdentifier = '${this.objectProperties.clusterId}' GROUP BY DBShardGroupSubClusterIdentifier,DBShardGroupInstanceIdentifier`, 
                                                            period : 60 * 180, 
                                                            interval : 180
            });
            
            
            result.forEach(item => {                              
                var elements = item.Label.split(" ");
                this.#subClustersIds = { ...this.#subClustersIds, [elements[0]] : { subClusterId : elements[0], subInstanceId : elements[1] } };
                
            }); 

            
            //-- Gather metadata from AWS API
            this.#clusterMetadata = await AWSObject.getAuroraLimitlessClusterObject(this.objectProperties.clusterId);
            this.#shardGroupMetadata = await AWSObject.getAuroraLimitlessDbShardObject(this.objectProperties.clusterId);


            //-- Gather subclusters ids from db engine            
            var result = (await this.#connection.query(this.#sql_subclusters)).rows;            

            result.forEach(item => {                              
                if ( (!(this.#shards.hasOwnProperty(item['subcluster_id']))) && this.#subClustersIds.hasOwnProperty[item['subcluster_id']] ) {
                    this.#shards = {...this.#shards , 
                                    [item['subcluster_id']] : { 
                                                                dbShardResourceId : this.#shardGroupMetadata['DBShardGroupResourceId'], 
                                                                type : item['subcluster_type'], 
                                                                codeType : item['subcluster_type']=="shard" ? "DAS" : "DTR" , 
                                                                subClusterId : item['subcluster_id'],                                                                  
                                                                subInstanceId : this.#subClustersIds[item['subcluster_id']]?.['subInstanceId'], 
                                                                metrics : new classMetrics({ metrics : this.objectMetrics }) 
                                                            } 
                    } ;
                }              
            });       


        }
        catch(err){
                this.#objLog.write("refreshClusterMedatadaSingle","err",err);
                
        }
    }


    //-- Gather Cluster Information
    getClusterInfo(){

        var shards = [];
        var routers = [];
        var chartSummary = { categories : [], data : [] } ;
        var chartRaw = [];
        try {
                for (let shardId of Object.keys(this.#shards)) {                                         
                    if (this.#shards[shardId].type == "shard"){
                        shards.push({ ...this.#shards[shardId],
                            metrics : this.#shards[shardId].metrics.getMetricList(), 
                        });
                    }
                    else{
                        routers.push({ ...this.#shards[shardId],
                            metrics : this.#shards[shardId].metrics.getMetricList(),
                        });
                    }                    
                    
                    chartRaw.push({ 
                                    name : this.#shards[shardId]?.['codeType'] + "-" + this.#shards[shardId]?.['subClusterId'] + "-" + this.#shards[shardId]?.['subInstanceId'] ,
                                    value : this.#shards[shardId].metrics.getItem("xactCommit")['value'] 
                    });
                }

                chartRaw.sort((a, b) => b.value - a.value);
                chartRaw.forEach(function(item, index) {    
                    chartSummary.categories.push(item.name);
                    chartSummary.data.push(Math.trunc(item.value));                                          
                });



        }
        catch(err){
            this.#objLog.write("getClusterInfo","err",err);
        }

        return { cluster : { 
                                status : this.#shardGroupMetadata['Status'],
                                maxACU : this.#shardGroupMetadata['MaxACU'],
                                minACU : this.#shardGroupMetadata['MinACU'],
                                shardId : this.#shardGroupMetadata['DBShardGroupIdentifier'],
                                lastUpdate : this.objectProperties.lastUpdate,
                                metrics : {...this.#cluster.metrics.global.getMetricList()},
                                shards : shards, 
                                routers : routers, 
                                global : { shards : {...this.#cluster.metrics.shards.getMetricList()}, routers : {...this.#cluster.metrics.routers.getMetricList()} },
                                chartSummary : chartSummary                           
                            }

            }

        }




        //--Gather Cluster Metrics
        getClusterMetricDetails(object){
            var history = [];                        
            var value = 0;
            try {
                for (let shardId of Object.keys(this.#shards)) {                                         
                
                    history.push({ 
                                name :  this.#shards[shardId]?.['codeType'] + "-" + this.#shards[shardId]?.['subClusterId'] + "-" + this.#shards[shardId]?.['subInstanceId'] ,
                                data : this.#shards[shardId].metrics.getItem(object.metricId)['history']?.['data'], 
                    });            
                }

                value = this.#cluster.metrics.global.getItem(object.metricId)['value'];
                history = history;

            }
            catch(err){
                this.#objLog.write("getClusterMetricDetails","err",err);
            }  
            return { value : value, history : history };
            
        }




        //-- Gather Cloudwatch metrics
        async getCloudwatchMetrics(object){
            
            var result = { 
                            labels : [], 
                            values : [], 
                            charts : [], 
                            summary : { total : 0, average : 0, min : 0, max : 0, count : 0  }, 
                            currentState : { 
                                                chart : { 
                                                            categories : [], 
                                                            data : [] }, 
                                                            value : 0 
                                                        } 
            };
            var metrics = [];      
            try {                  
                switch(object.type){
                    case "1" :
                                var isTypeRequested=false;
                                for (let shardId of Object.keys(this.#shards)) { 
                                    
                                    isTypeRequested=false;
                                    if (object.resourceType == "ALL"){
                                        isTypeRequested=true;
                                    }else{
                                        if (this.#shards[shardId]?.['codeType'] == object.resourceType){
                                            isTypeRequested=true;
                                        }
                                    }
                                    
                                    if (isTypeRequested){

                                        metrics.push({
                                            namespace : "AWS/RDS",
                                            label : this.#shards[shardId]?.['codeType'] + "-" + this.#shards[shardId]?.['subClusterId'] + "-" + this.#shards[shardId]?.['subInstanceId'],
                                            metric : object.metric,
                                            dimension : [   
                                                            {                                     
                                                                "Name" : "DBClusterIdentifier", 
                                                                "Value" : this.#shardGroupMetadata['DBClusterIdentifier'],
                                                            },
                                                            {                                     
                                                                "Name" : "DBShardGroupIdentifier", 
                                                                "Value" : this.#shardGroupMetadata['DBShardGroupIdentifier'], 
                                                            },
                                                            {                                     
                                                                "Name" : "DBShardGroupSubClusterIdentifier", 
                                                                "Value" : this.#shards[shardId]?.['subClusterId'], 
                                                            },
                                                            {                                     
                                                                "Name" : "DBShardGroupInstanceIdentifier", 
                                                                "Value" : this.#shards[shardId]?.['subInstanceId'], 
                                                            },
                                                            {                                     
                                                                "Name" : "DBShardGroupSubClusterType", 
                                                                "Value" : (this.#shards[shardId]?.['codeType'] == "DAS" ? "Data Access Shard" : "Distributed Transaction Router" ), 
                                                            },

                                                                ],
                                                    stat : object.stat                    
                                                });
                                    }



                                }

                    break;

                    case "2":
                            metrics.push({
                                            namespace : "AWS/RDS",
                                            label : "DBShardGroup-" + this.#shardGroupMetadata['DBShardGroupIdentifier'],
                                            metric : object.metric,
                                            dimension : [   
                                                            {                                     
                                                                "Name" : "DBShardGroupIdentifier", 
                                                                "Value" : this.#shardGroupMetadata['DBShardGroupIdentifier'], 
                                                            }

                                                        ],
                                                    stat : object.stat                    
                                });
                    break;

                    

                }
                
                var dataset = await AWSObject.getGenericMetricsDataset({ metrics : metrics, interval : object.interval, period : object.period });
                
                var charts = [];
                var currentState = { value : 0, chart : { categories : [], data : [] } };
                var values = [];
                var labels = [];

                var summary = { total : 0, average : 0, min : 0, max : 0, count : 0 };
                var max = [];
                var min = [];
                var rawData = [];
                dataset.forEach(item => {                  
                    
                    var total = 0;
                    var dataRecords = item.Timestamps.map((value, index) => {   
                        total = total + item.Values[index];               
                        summary.count = summary.count + 1;                                 
                        return [item.Timestamps[index], item.Values[index] ];                             
                    });
                    
                    max.push(Math.max(...item.Values));
                    min.push(Math.min(...item.Values));                   
                    summary.total = summary.total + total;

                    values.push(total);                    
                    labels.push(item.Label);
                    charts.push({ name : item.Label, total : total, data : dataRecords });                    
                    rawData.push({ name : item.Label, value : (dataRecords.length > 0 ? dataRecords[0][1] : 0 ) });
                    currentState.value = currentState.value + (dataRecords.length > 0 ? dataRecords[0][1] : 0 );

                });

                rawData.sort((a, b) => b.value - a.value);
                rawData.forEach(function(item, index) {    
                    currentState.chart.categories.push(item.name);
                    currentState.chart.data.push(Math.trunc(item.value));                      
                    
                });

                summary.max = Math.max(...max);
                summary.min = Math.max(...min);
                summary.average = summary.total / summary.count;
                result = { labels : labels, values : values, charts : charts, summary : summary, currentState : currentState };


            }
            catch(err){
                this.#objLog.write("getCloudwatchMetrics","err",err);
            }
            
            return result;

        }


        
        
        //-- Cloudwatch metric initiatlization
        cloudwatchMetricInitialization(){

            for (let shardId of Object.keys(this.#shards)) { 
                
                this.#cloudwatchMetricsShards[shardId] = [];                
                this.#metricCatalog.forEach(metric => {

                    this.#cloudwatchMetricsShards[shardId].push({
                                                                    namespace : "AWS/RDS",
                                                                    label : metric,
                                                                    metric : metric,
                                                                    dimension : [   
                                                                                    {                                     
                                                                                        "Name" : "DBClusterIdentifier", 
                                                                                        "Value" : this.#shardGroupMetadata['DBClusterIdentifier'],
                                                                                    },
                                                                                    {                                     
                                                                                        "Name" : "DBShardGroupIdentifier", 
                                                                                        "Value" : this.#shardGroupMetadata['DBShardGroupIdentifier'], 
                                                                                    },
                                                                                    {                                     
                                                                                        "Name" : "DBShardGroupSubClusterIdentifier", 
                                                                                        "Value" : this.#shards[shardId]?.['subClusterId'], 
                                                                                    },
                                                                                    {                                     
                                                                                        "Name" : "DBShardGroupInstanceIdentifier", 
                                                                                        "Value" : this.#shards[shardId]?.['subInstanceId'], 
                                                                                    },
                                                                                    {                                     
                                                                                        "Name" : "DBShardGroupSubClusterType", 
                                                                                        "Value" : (this.#shards[shardId]?.['codeType'] == "DAS" ? "Data Access Shard" : "Distributed Transaction Router" ), 
                                                                                    },

                                                                                        ],
                                                                        stat : "Average"                    
                    });


                });

                
            }

        }



        //-- Gather Cloudwatch metrics using table format
        async getCloudwatchMetricsTable(){
            var tableMetrics = [];
            var tableSummary = {};
            var chartSummary = { categories : [], data : [] };
            var chartHistory = { CommitThroughput : [], DBShardGroupACUUtilization : [], DBShardGroupCapacity : []  };
            try {
                    for (let shardId of Object.keys(this.#shards)) { 
                        
                        var dataset = await AWSObject.getGenericMetricsDataset({ metrics : this.#cloudwatchMetricsShards[shardId], interval : 5, period : 1 });
                        var columns = { resource : this.#shards[shardId]?.['codeType'] + "-" + this.#shards[shardId]?.['subClusterId'] + "-" + this.#shards[shardId]?.['subInstanceId'], type : this.#shards[shardId]?.['type'] };
                        
                        dataset.forEach( metric => {
                                
                                if (!(tableSummary.hasOwnProperty(metric.Label)))
                                    tableSummary[metric.Label] = 0;                                
                        
                                tableSummary[metric.Label] = tableSummary[metric.Label] + ( parseFloat(metric.Values[0] || 0 ) );
                                columns = { [metric.Label] : metric.Values[0], ...columns};
                                
                        });        
                        
                        tableMetrics.push(columns);  
                        chartSummary.categories.push(this.#shards[shardId]?.['codeType'] + "-" + this.#shards[shardId]?.['subClusterId'] + "-" + this.#shards[shardId]?.['subInstanceId']);                     
                        chartSummary.data.push(columns['CommitThroughput']);                       
                        
                    }

                    var dataset = await this.getCloudwatchMetrics({ 
                                                                        type : "1",                                                                        
                                                                        metric : 'CommitThroughput',
                                                                        period : 1,
                                                                        interval :  30,
                                                                        stat : "Average",
                                                                        resourceType : "ALL",
                     });                    
                     chartHistory['CommitThroughput'] = dataset['charts'];                 

                     dataset = await this.getCloudwatchMetrics({ 
                        type : "2",                                                                        
                        metric : 'DBShardGroupACUUtilization',
                        period : 1,
                        interval :  30,
                        stat : "Average",
                        resourceType : "ALL",
                    });                    
                    chartHistory['DBShardGroupACUUtilization'] = dataset['charts'];                 


                    dataset = await this.getCloudwatchMetrics({ 
                        type : "2",                                                                        
                        metric : 'DBShardGroupCapacity',
                        period : 1,
                        interval :  30,
                        stat : "Average",
                        resourceType : "ALL",
                    });                    
                    chartHistory['DBShardGroupCapacity'] = dataset['charts'];
            
            }
            catch(err){
                this.#objLog.write("getCloudwatchMetricsTable","err",err);
            }
            
            return { tableMetrics : tableMetrics, tableSummary : tableSummary, chartSummary : chartSummary, chartHistory : chartHistory };
            
        }

    }



module.exports = { classMetrics, classCluster, classNode, classInstance, classRedisEngine, classMongoDBEngine, classPostgresqlEngine, classMysqlEngine, classSqlserverEngine, classOracleEngine, classDocumentDBElasticCluster, classDocumentDBElasticShard, classElasticacheServerlessCluster, classDynamoDB, classAuroraLimitlessPostgresqlEngine };

