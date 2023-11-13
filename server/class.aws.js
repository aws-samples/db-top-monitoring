// AWS Config Variables
const fs = require('fs');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));

//-- AWS Catalog Resources
var nodeCatalog = JSON.parse(fs.readFileSync('./aws-node-types.json'));


// AWS Variables
var AWS = require('aws-sdk');
AWS.config.update({region: configData.aws_region});

var elasticache = new AWS.ElastiCache();
var memorydb = new AWS.MemoryDB();
var rds = new AWS.RDS({region: configData.aws_region});
var documentDB = new AWS.DocDB({region: configData.aws_region});
var cloudwatch = new AWS.CloudWatch({region: configData.aws_region, apiVersion: '2010-08-01'});
var cloudwatchlogs = new AWS.CloudWatchLogs({region: configData.aws_region });


class classAWS {

        constructor() { 
        }
          
        //------#################
        //------################# ELASTICACHE
        //------#################
        
        //-- Get Cluster Object
        async getElasticacheClusterObject(clusterId){

                 var parameter = {
                          MaxRecords: 100,
                          ReplicationGroupId: params.clusterId
                        };
                        
                var data = await elasticache.describeReplicationGroups(parameter).promise();
                
                return data;

        }
        
        //-- Get Cluster Status
        async getElasticacheClusterStatus(clusterId) { 
          
                var result = { status : "pending", size : "-", totalShards : 0, totalNodes : 0 };
                
                try
                    {
                        
                        var parameter = {
                                  MaxRecords: 100,
                                  ReplicationGroupId: clusterId
                                };
                                
                        var clusterInfo = await elasticache.describeReplicationGroups(parameter).promise();
                        
                        if (clusterInfo.ReplicationGroups.length> 0) 
                            result = { status : clusterInfo.ReplicationGroups[0]["Status"], size : clusterInfo.ReplicationGroups[0]["CacheNodeType"], totalShards : clusterInfo.ReplicationGroups[0]["NodeGroups"].length, totalNodes : clusterInfo.ReplicationGroups[0]["MemberClusters"].length };
    
                        
                       
                }
                catch(err){
                        console.log(err);
                }
                
                return result;
                
         
        }
        
        
        //-- Get Nodes
        async getElasticacheNodes(clusterId){
            
            var nodeList = [];    
            
            try {
                    
                     var parameter = {
                              MaxRecords: 100,
                              ReplicationGroupId: clusterId
                            };
                            
                    var data = await elasticache.describeReplicationGroups(parameter).promise();
                    
                    if (data.ReplicationGroups.length> 0) {
                                    
                                    var rg = data.ReplicationGroups[0];
                                    
                                    var nodePort;
                                    var clusterEndpoint;
                                    
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
                                                        
                                                        nodeList.push({
                                                                        
                                                                        clusterId: clusterId,
                                                                        nodeId : nodeItem.CacheClusterId,
                                                                        host : endPoint,
                                                                        port : nodePort,
                                                                        nodeType : rg['CacheNodeType'],
                                                                        cacheClusterId : nodeItem.CacheClusterId,
                                                                        cacheNodeId : nodeItem.CacheNodeId,
                                                                        networkRate : nodeCatalog[rg['CacheNodeType']]
                                                        });
                                                        
                                                         
                                                     });
                                                    
                                        });
                                    }
                                    else{
                                        
                                        rg.NodeGroups.forEach(function(nodeGroup) {
                                            
                                                     
                                                    nodePort = nodeGroup['PrimaryEndpoint']['Port'];
                                                    clusterEndpoint = nodeGroup['PrimaryEndpoint']['Address'];
                                        
                                                    nodeGroup.NodeGroupMembers.forEach(function(nodeItem) {
                                        
                                                        nodeList.push({
                                                                        
                                                                        clusterId: clusterId,
                                                                        nodeId : nodeItem.CacheNodeId,
                                                                        host : nodeItem['ReadEndpoint']['Address'],
                                                                        port : nodePort,
                                                                        nodeType : rg['CacheNodeType'],
                                                                        cacheClusterId : nodeItem.CacheClusterId,
                                                                        cacheNodeId : nodeItem.CacheNodeId,
                                                                        networkRate : nodeCatalog[rg['CacheNodeType']]
                                                        });
                                                         
                                                     });
                                                    
                                        });
                                        
                                    }
                                    
                                    
                                    
                                    
                    }
                            
                    
            }
            catch (error) {
                console.log(error)
                
            }
            return nodeList;    
                
            
        }
        
        
        //------#################
        //------################# MEMORYDB
        //------#################
        
        //-- Get Cluster Object
        async getMemoryDBClusterObject(clusterId){
            
                    var parameter = {
                          ClusterName: clusterId,
                          ShowShardDetails: true
                    };
                    
                    var data = await memorydb.describeClusters(parameter).promise();
                    
                    return data;
            
        }
        
        
        
        //-- Get Cluster Status
        async getMemoryDBClusterStatus(clusterId) { 
            
          
                var result = { status : "pending", size : "-", totalShards : 0, totalNodes : 0 };
                
                try
                    {
                        
                        var parameter = {
                              ClusterName: clusterId,
                              ShowShardDetails: true
                        };
            
                        var clusterInfo = await memorydb.describeClusters(parameter).promise();
                        
                        if (clusterInfo.Clusters.length> 0) {
                            
                            var iNodes = 0;
                            clusterInfo.Clusters[0]["Shards"].forEach((shard) => {
                                        iNodes = iNodes + shard["NumberOfNodes"];
                            });
                        
                            result = { status : clusterInfo.Clusters[0]["Status"], size : clusterInfo.Clusters[0]["NodeType"], totalShards : clusterInfo.Clusters[0]["NumberOfShards"], totalNodes : iNodes };
                            
                        }
                       
                }
                catch(err){
                        console.log(err);
                }
                
                return result;
            
        }
        
        
        //-- Get Nodes
        async getMemoryDBNodes(clusterId){
            
            
                var nodeList = [];
                try {
                    
                        var parameter = {
                              ClusterName: clusterId,
                              ShowShardDetails: true
                        };
                        
                        var data = await memorydb.describeClusters(parameter).promise();
                        
                        if (data.Clusters.length> 0) {
                                        
                                        var rg = data.Clusters[0];
                                
                                        var nodePort = rg['ClusterEndpoint']['Port'];
                                        var nodeUid = 0;
                                        
                                        rg['Shards'].forEach(function(shard) {
                                            
                                                shard['Nodes'].forEach(function(node) {
                                                    try {
                                                            nodeList.push({
                                                                            
                                                                            clusterId: rg['Name'],
                                                                            nodeId : node['Name'],
                                                                            host : node['Endpoint']['Address'],
                                                                            port : nodePort,
                                                                            nodeType : rg['NodeType'],
                                                                            cacheClusterId : rg['Name'],
                                                                            cacheNodeId : node['Name'],
                                                                            networkRate : nodeCatalog[rg['NodeType']]
                                                            });
                                                            
                                                    }
                                                    catch(err){
                                                        console.log(err);
                                                    }
                                            
                                                });
                                                
                                            
                                        });
                                        
                        }
                                
                        
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return nodeList;
                

        }
        
        
        
        
        //------#################
        //------################# DOCUMENTDB
        //------#################
        
        //-- Get Cluster Object
        async getDocumentDBClusterObject(clusterId){
            
                    var parameterCluster = {
                        DBClusterIdentifier: clusterId,
                        MaxRecords: 100
                    };
        
                    var data = await documentDB.describeDBClusters(parameterCluster).promise();
                    return data;
            
        }
        
        
        
        //-- Get Cluster Status
        async getDocumentDBClusterStatus(clusterId) { 
            
          
                var result = { status : "pending", size : "-", totalNodes : 0 };
                
                try
                    {
                        
                        var parameterCluster = {
                            DBClusterIdentifier: clusterId,
                            MaxRecords: 100
                        };
            
                        var clusterData = await documentDB.describeDBClusters(parameterCluster).promise();
                        result = { status : clusterData['DBClusters'][0]['Status'], size : "", totalNodes : clusterData['DBClusters'][0]['DBClusterMembers'].length };
                        
                }
                catch(err){
                        console.log(err);
                }
                
                return result;
            
        }
        
        
        //-- Get Nodes
        async getDocumentDBNodes(clusterId){
            
            
                var nodeList = [];
                try {
                    
                    
                    
                    // Gather Roles
                    var parameterCluster = {
                        DBClusterIdentifier: clusterId,
                        MaxRecords: 100
                    };
        
                    var clusterData = await documentDB.describeDBClusters(parameterCluster).promise();
                    var roleType = [];
                    
                    clusterData['DBClusters'][0]['DBClusterMembers'].forEach(function(instance) {
                        roleType[instance['DBInstanceIdentifier']] =  ( String(instance['IsClusterWriter']) == "true" ? "P" : "R" );
                    });
            
            
                    // Gather Instances
                    var parameterInstances = {
                        MaxRecords: 100,
                        Filters: [
                                {
                                  Name: 'db-cluster-id',
                                  Values: [clusterId]
                                },
                        ],
                    };
        
                    
                    var Instancedata = await rds.describeDBInstances(parameterInstances).promise();
                    
                    
                    if (Instancedata.DBInstances.length > 0) {
                            
                            Instancedata.DBInstances.forEach(function(node) {
                                        nodeList.push({
                                                        clusterId: clusterId,
                                                        nodeId : node['DBInstanceIdentifier'],
                                                        host : node['Endpoint']['Address'],
                                                        port : node['Endpoint']['Port'],
                                                        nodeType : node['DBInstanceClass'],
                                                        instanceId : node['DBInstanceIdentifier'],
                                                        monitoring : ( String(node['MonitoringInterval']) == "0" ? "clw" : "em" ),
                                                        resourceId : node['DbiResourceId'],
                                                        networkRate : nodeCatalog[node['DBInstanceClass']],
                                                        role : roleType[node['DBInstanceIdentifier']],
                                                        size : node['DBInstanceClass'],
                                                        az : node['AvailabilityZone'],
                                                        status : node['DBInstanceStatus'],
                                        });
                            });
                              
                    }
                    
                    
                    
                                
                        
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return nodeList;
                

        }
        
        
        
        
        //------#################
        //------################# AURORA
        //------#################
        
        //-- Get Cluster Object
        async getAuroraClusterObject(clusterId){
            
                    var parameterCluster = {
                        DBClusterIdentifier: clusterId,
                        MaxRecords: 100
                    };
        
                    var data = await rds.describeDBClusters(parameterCluster).promise();
                    return data;
            
        }
        
        
        
        //-- Get Cluster Status
        async getAuroraClusterStatus(clusterId) { 
            
          
                var result = { status : "pending", size : "-", totalNodes : 0 };
                
                try
                    {
                        
                        var parameterCluster = {
                            DBClusterIdentifier: clusterId,
                            MaxRecords: 100
                        };
            
                        var clusterData = await rds.describeDBClusters(parameterCluster).promise();
                        result = { status : clusterData['DBClusters'][0]['Status'], size : "", totalNodes : clusterData['DBClusters'][0]['DBClusterMembers'].length };
                        
                    
                }
                catch(err){
                        console.log(err);
                }
                
                return result;
            
        }
        
        
        //-- Get Nodes
        async getAuroraNodes(clusterId){
            
            
                var nodeList = [];
                try {
                    
                    // Gather Roles
                    var parameterCluster = {
                        DBClusterIdentifier: clusterId,
                        MaxRecords: 100
                    };
        
                    var clusterData = await rds.describeDBClusters(parameterCluster).promise();
                    var roleType = [];
                    
                    clusterData['DBClusters'][0]['DBClusterMembers'].forEach(function(instance) {
                        roleType[instance['DBInstanceIdentifier']] =  ( String(instance['IsClusterWriter']) == "true" ? "P" : "R" );
                    });
            
            
                    // Gather Instances
                    var parameterInstances = {
                        MaxRecords: 100,
                        Filters: [
                                {
                                  Name: 'db-cluster-id',
                                  Values: [clusterId]
                                },
                        ],
                    };
        
                    
                    var Instancedata = await rds.describeDBInstances(parameterInstances).promise();
                    
                    if (Instancedata.DBInstances.length > 0) {
                            
                            Instancedata.DBInstances.forEach(function(node) {
                                        nodeList.push({
                                                        clusterId: clusterId,
                                                        nodeId : node['DBInstanceIdentifier'],
                                                        host : node['Endpoint']['Address'],
                                                        port : node['Endpoint']['Port'],
                                                        nodeType : node['DBInstanceClass'],
                                                        instanceId : node['DBInstanceIdentifier'],
                                                        monitoring : ( String(node['MonitoringInterval']) == "0" ? "clw" : "em" ),
                                                        resourceId : node['DbiResourceId'],
                                                        networkRate : nodeCatalog[node['DBInstanceClass']],
                                                        role : roleType[node['DBInstanceIdentifier']],
                                                        size : node['DBInstanceClass'],
                                                        az : node['AvailabilityZone'],
                                                        status : node['DBInstanceStatus'],
                                        });
                            });
                              
                    }
                    
                               
                        
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return nodeList;
                

        }
        
        
        //-- Get Nodes
        async getAuroraNodesStatus(clusterId){
            
            
                var nodeList = [];
                try {
                    
                       
                    // Gather Instances
                    var parameterInstances = {
                        MaxRecords: 100,
                        Filters: [
                                {
                                  Name: 'db-cluster-id',
                                  Values: [clusterId]
                                },
                        ],
                    };
        
                    
                    var Instancedata = await rds.describeDBInstances(parameterInstances).promise();
                    
                    if (Instancedata.DBInstances.length > 0) {
                            
                            Instancedata.DBInstances.forEach(function(node) {
                                        nodeList[node['DBInstanceIdentifier']] = {
                                                        clusterId: clusterId,
                                                        nodeId : node['DBInstanceIdentifier'],
                                                        instanceId : node['DBInstanceIdentifier'],
                                                        monitoring : ( String(node['MonitoringInterval']) == "0" ? "clw" : "em" ),
                                                        size : node['DBInstanceClass'],
                                                        status : node['DBInstanceStatus'],
                                        };
                            });
                              
                    }
                    
                               
                        
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return nodeList;
                

        }
        
        
        //-- Get Nodes
        async getRdsInstanceStatus(instanceId){
            
            
                
                var instanceInfo = { status : "-", az : "-", size : "-" };
                try {
                    
                       
                    // Gather Instances
                    var parameterInstances = {
                        DBInstanceIdentifier : instanceId
                    };
                    
                    var instanceData = await rds.describeDBInstances(parameterInstances).promise();
                    
                    
                    if (instanceData.DBInstances.length > 0) {
                            instanceInfo.status = instanceData.DBInstances[0]['DBInstanceStatus'];
                            instanceInfo.size = instanceData.DBInstances[0]['DBInstanceClass'];
                            instanceInfo.az = instanceData.DBInstances[0]['AvailabilityZone'];
                    }
                    
                               
                        
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return instanceInfo;
                

        }
        
        //------#################
        //------################# OS
        //------#################
        
        //-- getOSMetrics
        async getOSMetrics(object){
    
            
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
                    if ( object.monitoring == "em") {
                        
                            var params_logs = {
                                logStreamName: object.resourceId,
                                limit: '1',
                                logGroupName: 'RDSOSMetrics',
                                startFromHead: false
                            };
                        
                            var data = await cloudwatchlogs.getLogEvents(params_logs).promise();
                            
                            var message=JSON.parse(data.events[0].message);
                            
                            nodeMetrics.cpu = parseFloat(message.cpuUtilization.total);
                            nodeMetrics.cpuTimestamp = message.timestamp;
                            nodeMetrics.memory = parseFloat(message.memory.free) ;
                            nodeMetrics.memoryTimestamp = message.timestamp;
                            nodeMetrics.ioreads = parseFloat(message.diskIO[0].readIOsPS) + parseFloat(message.diskIO[1].readIOsPS);
                            nodeMetrics.ioreadsTimestamp = message.timestamp;
                            nodeMetrics.iowrites = parseFloat(message.diskIO[0].writeIOsPS) + parseFloat(message.diskIO[1].writeIOsPS);
                            nodeMetrics.iowritesTimestamp = message.timestamp;
                            nodeMetrics.netin = parseFloat(message.network[0].rx);
                            nodeMetrics.netinTimestamp = message.timestamp;
                            nodeMetrics.netout = parseFloat(message.network[0].tx);
                            nodeMetrics.netoutTimestamp = message.timestamp;
                            nodeMetrics.timestamp = message.timestamp;  
                            
                            
                            //-- Failover or reboot bug -- 3689348869717491900
                            if (nodeMetrics.ioreads > 10000000)
                                nodeMetrics.ioreads = 0;
                                
                            if (nodeMetrics.iowrites > 10000000)
                                nodeMetrics.iowrites = 0;
                            
                            //-- Aurora Serverless
                            if (nodeMetrics.memory < 0 )
                                nodeMetrics.memory = 0;
                            
                                
                    }
                    else {
                        
                            //-- Gather Metrics from CloudWatch
                        
                            
                            var dataQueries = [];
                            var queryId = 0;
                            object.metrics.forEach(function(item) {
                                
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
                    
                    return nodeMetrics;
            }
            catch(err){
                
                console.log(err);
                return { 
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
                
            }
            
            
        }
        
        
        
        //-- getOSMetricsDetail
        async getOSMetricsDetails(object){
    
                
                var nodeMetrics = { 
                                    cpuUsage : 0,
                                    cpuTotal : 0,
                                    cpuUser : 0,
                                    cpuSys : 0,
                                    cpuWait : 0,
                                    cpuIrq : 0,
                                    cpuGuest : 0,
                                    cpuSteal : 0,
                                    cpuNice : 0,
                                    vCpus : 0,
                                    memoryUsage : 0,
                                    memoryTotal : 0,
                                    memoryActive : 0,
                                    memoryInactive : 0,
                                    memoryFree : 0,
                                    ioreadsRsdev : 0,
                                    ioreadsFilesystem : 0,
                                    ioreads : 0,
                                    iowritesRsdev : 0,
                                    iowritesFilesystem : 0,
                                    iowrites: 0,
                                    iops : 0,
                                    tps : 0,
                                    ioqueue : 0,
                                    networkTx : 0,
                                    networkRx : 0,
                                    network : 0, 
                };
                
                var nodeProcessList = [];
                var timestamp = 0;
            
            try {
                        
                            var params_logs = {
                                logStreamName: object.resourceId,
                                limit: '1',
                                logGroupName: 'RDSOSMetrics',
                                startFromHead: false
                            };
                        
                            var data = await cloudwatchlogs.getLogEvents(params_logs).promise();
                            var message = JSON.parse(data.events[0].message);
                            
                            switch (object.engineType){
                                
                                    case "sqlserver":
                                        nodeMetrics.cpuUser = parseFloat(message.cpuUtilization.user);
                                        nodeMetrics.cpuSys = parseFloat(message.cpuUtilization.kern);
                                        nodeMetrics.cpuUsage = nodeMetrics.cpuUser + nodeMetrics.cpuSys;
                                        nodeMetrics.cpuWait = 0;
                                        nodeMetrics.cpuIrq = 0;
                                        nodeMetrics.cpuGuest = 0;
                                        nodeMetrics.cpuSteal = 0;
                                        nodeMetrics.cpuNice = 0;
                                        nodeMetrics.vCpus = parseFloat(message.numVCPUs);
                                        nodeMetrics.memoryUsage = Math.trunc(( (message.memory.physTotKb-message.memory.physAvailKb) / message.memory.physTotKb) * 100);
                                        nodeMetrics.memoryTotal = parseFloat(message.memory.physTotKb)*1024;
                                        nodeMetrics.memorySqlserver = parseFloat(message.memory.sqlServerTotKb) * 1024;
                                        nodeMetrics.memoryCommit = parseFloat(message.memory.commitTotKb);
                                        nodeMetrics.memoryFree = parseFloat(message.memory.physAvailKb)*1024;
                                        nodeMetrics.ioreadsRsdev = 0;
                                        nodeMetrics.ioreadsFilesystem = 0;
                                        nodeMetrics.ioreads = parseFloat(message.disks[0].rdCountPS);
                                        nodeMetrics.iowritesRsdev = 0;
                                        nodeMetrics.iowritesFilesystem = 0;
                                        nodeMetrics.iowrites = parseFloat(message.disks[0].wrCountPS);
                                        nodeMetrics.iops = nodeMetrics.iowrites + nodeMetrics.ioreads;
                                        nodeMetrics.networkTx = parseFloat(message.network[0].wrBytesPS);
                                        nodeMetrics.networkRx = parseFloat(message.network[0].rdBytesPS);
                                        nodeMetrics.network = nodeMetrics.networkTx + nodeMetrics.networkRx;
                                        break;
                                    
                                    default:
                                        nodeMetrics.cpuUsage = parseFloat(message.cpuUtilization.total);
                                        nodeMetrics.cpuUser = parseFloat(message.cpuUtilization.user);
                                        nodeMetrics.cpuSys = parseFloat(message.cpuUtilization.system);
                                        nodeMetrics.cpuWait = parseFloat(message.cpuUtilization.wait);
                                        nodeMetrics.cpuIrq = parseFloat(message.cpuUtilization.irq);
                                        nodeMetrics.cpuGuest = parseFloat(message.cpuUtilization.guest);
                                        nodeMetrics.cpuSteal = parseFloat(message.cpuUtilization.steal);
                                        nodeMetrics.cpuNice = parseFloat(message.cpuUtilization.nice);
                                        nodeMetrics.vCpus = parseFloat(message.numVCPUs);
                                        nodeMetrics.memoryUsage = Math.trunc(( (message.memory.total-message.memory.free) / message.memory.total) * 100);
                                        nodeMetrics.memoryTotal = parseFloat(message.memory.total)*1024;
                                        nodeMetrics.memoryActive = parseFloat(message.memory.active)*1024;
                                        nodeMetrics.memoryInactive = parseFloat(message.memory.inactive)*1024;
                                        nodeMetrics.memoryFree = parseFloat(message.memory.free)*1024;
                                        nodeMetrics.ioreadsRsdev = parseFloat(message.diskIO[0].readIOsPS);
                                        nodeMetrics.ioreadsFilesystem = parseFloat(message.diskIO[1].readIOsPS);
                                        nodeMetrics.ioreads = nodeMetrics.ioreadsRsdev + nodeMetrics.ioreadsFilesystem;
                                        nodeMetrics.iowritesRsdev = parseFloat(message.diskIO[0].writeIOsPS);
                                        nodeMetrics.iowritesFilesystem = parseFloat(message.diskIO[1].writeIOsPS);
                                        nodeMetrics.iowrites = nodeMetrics.iowritesRsdev + nodeMetrics.iowritesFilesystem;
                                        nodeMetrics.iops = nodeMetrics.iowrites + nodeMetrics.ioreads;
                                        nodeMetrics.networkTx = parseFloat(message.network[0].tx);
                                        nodeMetrics.networkRx = parseFloat(message.network[0].rx);
                                        nodeMetrics.network = nodeMetrics.networkTx + nodeMetrics.networkRx;
                                        break;
                                        
                                    
                                
                            }
                            
                            //nodeMetrics.tps = parseFloat(message.diskIO[0].tps) + parseFloat(message.diskIO[1].tps);
                            //nodeMetrics.ioqueue = parseFloat(message.diskIO[0].avgQueueLen) + parseFloat(message.diskIO[1].avgQueueLen);
                            nodeProcessList = message.processList;
                            timestamp = message.timestamp;
                            
                            //-- Failover or reboot bug -- 3689348869717491900
                            if (nodeMetrics.ioreads > 10000000)
                                nodeMetrics.ioreads = 0;
                                
                            if (nodeMetrics.iowrites > 10000000)
                                nodeMetrics.iowrites = 0;
                            
                            //-- Aurora Serverless
                            if (nodeMetrics.memory < 0 )
                                nodeMetrics.memory = 0;
                    
            }
            catch(err){
                console.log(err);
                
            }
            
            
            return { metrics : nodeMetrics, processes : nodeProcessList, timestamp : timestamp };
            
            
            
                
        }
        
        

        
}

module.exports = {classAWS};



                