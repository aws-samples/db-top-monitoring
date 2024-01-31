// AWS Config Variables
const fs = require('fs');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));

//-- AWS Catalog Resources
var nodeCatalog = JSON.parse(fs.readFileSync('./aws-node-types.json'));

//--## AWS Libraries
const { ElastiCacheClient, DescribeServerlessCachesCommand, DescribeReplicationGroupsCommand } = require("@aws-sdk/client-elasticache");
const { MemoryDBClient, DescribeClustersCommand } = require("@aws-sdk/client-memorydb");
const { RDSClient, DescribeDBClustersCommand, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");
const { DocDBClient, /*DescribeDBClustersCommand*/ } = require("@aws-sdk/client-docdb"); 
const { CloudWatchClient, GetMetricDataCommand } = require("@aws-sdk/client-cloudwatch");
const { CloudWatchLogsClient, GetLogEventsCommand } = require("@aws-sdk/client-cloudwatch-logs");
const { DocDBElasticClient, GetClusterCommand, ListClustersCommand  } = require("@aws-sdk/client-docdb-elastic");
const { DynamoDBClient, DescribeTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts"); 


//--## AWS Variables
const awsConfig = {region: configData.aws_region}
const elasticache = new ElastiCacheClient(awsConfig);
const memorydb = new MemoryDBClient(awsConfig);
const rds = new RDSClient(awsConfig);
const documentDB = new DocDBClient(awsConfig);
const cloudwatch = new CloudWatchClient(awsConfig);
const cloudwatchlogs = new CloudWatchLogsClient(awsConfig);
const docdbelastic = new DocDBElasticClient(awsConfig);
const dynamodb = new DynamoDBClient(awsConfig);
const sts = new STSClient(awsConfig);


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
                          ReplicationGroupId: clusterId
                        };
                        
                const command = new DescribeReplicationGroupsCommand(parameter);
                var data = await elasticache.send(command);
                        
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
                        
                        const command = new DescribeReplicationGroupsCommand(parameter);
                        var clusterInfo = await elasticache.send(command);
                        
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
                            
                    const command = new DescribeReplicationGroupsCommand(parameter);
                    var data= await elasticache.send(command);
                        
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
        
        
        
        //-- Get Elastic Cluster Serverless Info
        async getElasticacheServerlessClusterStatus(clusterId){
                
                var clusterInfo = { status : "-", ecpu : "-", storage : "-" };
                try {
                    
                    var params = {
                      ServerlessCacheName : clusterId
                    };
                    
                    const command = new DescribeServerlessCachesCommand(params);
                    var clusterData = await elasticache.send(command);
                        
                    clusterInfo.status = clusterData.ServerlessCaches[0]['Status'];
                    clusterInfo.ecpu = clusterData.ServerlessCaches[0]['CacheUsageLimits']['ECPUPerSecond']['Maximum'];
                    clusterInfo.storage = clusterData.ServerlessCaches[0]['CacheUsageLimits']['DataStorage']['Maximum'];
                    
                }
                catch (error) {
                    console.log(error)
                }
                
                return clusterInfo;
                
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
                    
                    const command = new DescribeClustersCommand(parameter);
                    const data = await memorydb.send(command);

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
            
                        const command = new DescribeClustersCommand(parameter);
                        const clusterInfo = await memorydb.send(command);
                        
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
                        
                        const command = new DescribeClustersCommand(parameter);
                        const data = await memorydb.send(command);
                        
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
        
                    const command = new DescribeDBClustersCommand(parameterCluster);
                    const data = await documentDB.send(command);
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
            
                        const command = new DescribeDBClustersCommand(parameterCluster);
                        const clusterData = await documentDB.send(command);
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
        
                    var command = new DescribeDBClustersCommand(parameterCluster);
                    const clusterData = await documentDB.send(command);
                    
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
        
                    
                    command = new DescribeDBInstancesCommand(parameterInstances);
                    const Instancedata = await rds.send(command);

                    
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
        
                    var command = new DescribeDBClustersCommand(parameterCluster);
                    const data = await rds.send(command);
                    
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
            
                        var command = new DescribeDBClustersCommand(parameterCluster);
                        const clusterData = await rds.send(command);
                    
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
        
                    var command = new DescribeDBClustersCommand(parameterCluster);
                    const clusterData = await rds.send(command);
                        
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
        
                    
                    command = new DescribeDBInstancesCommand(parameterInstances);
                    const Instancedata = await rds.send(command);
                    
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
        
                    
                    var command = new DescribeDBInstancesCommand(parameterInstances);
                    const Instancedata = await rds.send(command);
                    
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
                    
                    var command = new DescribeDBInstancesCommand(parameterInstances);
                    const instanceData = await rds.send(command);
                    
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
        
        
        
        //-- Get DocumentDB Elastic Cluster Info
        async getDocumentDBElasticStatus(clusterId){
            
            
                
                var clusterInfo = { status : "-", shardCapacity : "-", shardCount : "-" };
                try {
                    
                    var params = {
                      clusterArn: clusterId
                    };
        
                    const command = new GetClusterCommand(params);
                    const clusterData = await docdbelastic.send(command);

                    clusterInfo.status = clusterData.cluster.status;
                    clusterInfo.shardCapacity = clusterData.cluster.shardCapacity;
                    clusterInfo.shardCount = clusterData.cluster.shardCount;
                    
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return clusterInfo;
                

        }
        
        
        //-- Get DynamoDB Table Info
        async getDynamoDBTableInfo(tableName){
                
                var tableInfo = { tableName : tableName , status : "-", size : 0 , items : 0, "class" : "-", tableId : "-", rcu : 0, wcu : 0, indexes : 0, indexList : [], pkey : "", metadata : "" };
                try {
                    
                    var params = {
                      TableName: tableName
                    };
        
                    const command = new DescribeTableCommand(params);
                    const tableData = await dynamodb.send(command);

                    tableInfo.status = String(tableData.Table.TableStatus).toLowerCase();
                    tableInfo.size = tableData.Table.TableSizeBytes;
                    tableInfo.items = tableData.Table.ItemCount;
                    tableInfo.tableId = tableData.Table.TableId;
                    tableInfo.metadata = tableData.Table;
                    tableInfo.pkey = tableData.Table.KeySchema[0].AttributeName;
                    tableInfo.indexes  = (tableData.Table.hasOwnProperty("GlobalSecondaryIndexes") == true ? tableData.Table.GlobalSecondaryIndexes.length : 0);
                    tableInfo.class = (tableData.Table.hasOwnProperty("TableClassSummary") == true ?  String(tableData.Table.TableClassSummary.TableClass).toLowerCase() : "standart");
                    
                    if (tableData.Table.hasOwnProperty("BillingModeSummary")) {
                        if (tableData.Table.BillingModeSummary.BillingMode == "PAY_PER_REQUEST") {
                            tableInfo.rcu = -1;
                            tableInfo.wcu = -1;
                        }
                    }
                    else {
                        tableInfo.rcu = tableData.Table.ProvisionedThroughput.ReadCapacityUnits;
                        tableInfo.wcu = tableData.Table.ProvisionedThroughput.WriteCapacityUnits;
                    }
                    
                   if (Array.isArray(tableData?.Table?.GlobalSecondaryIndexes)){
                        tableData.Table.GlobalSecondaryIndexes.forEach(function(index) {
                                        
                            tableInfo.indexList.push(index['IndexName']);
                                            
                        });
                   }
                    
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return tableInfo;

        }
        
        
        async getDynamoDBIndexInfo(tableName, indexName){
                
                var indexInfo = { tableName : tableName , indexName : indexName, status : "-", size : 0 , items : 0,  rcu : 0, wcu : 0 };
                try {
                    
                    var params = {
                      TableName: tableName
                    };
        
                    const command = new DescribeTableCommand(params);
                    const tableData = await dynamodb.send(command);

                    if (tableData.Table.hasOwnProperty("GlobalSecondaryIndexes")) {
                    
                            tableData.Table.GlobalSecondaryIndexes.forEach(function(index) {
                                    
                                    if (index['IndexName'] == indexName){
                                 
                                        indexInfo.status = String(index.IndexStatus).toLowerCase();
                                        indexInfo.size = index.IndexSizeBytes;
                                        indexInfo.items = index.ItemCount;
                                        
                                        if (tableData.Table.hasOwnProperty("BillingModeSummary")) {
                                            if (tableData.Table.BillingModeSummary.BillingMode == "PAY_PER_REQUEST") {
                                                indexInfo.rcu = -1;
                                                indexInfo.wcu = -1;
                                            }
                                        }
                                        else {
                                            indexInfo.rcu = index.ProvisionedThroughput.ReadCapacityUnits;
                                            indexInfo.wcu = index.ProvisionedThroughput.WriteCapacityUnits;
                                        }
                            
                                    }                                
                            });
                            
                    }
                    
                }
                catch (error) {
                    console.log(error)
                }
                
                
                return indexInfo;

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
                                limit: 1,
                                logGroupName: 'RDSOSMetrics',
                                startFromHead: false
                            };
                        
                            const command = new GetLogEventsCommand(params_logs);
                            const data = await cloudwatchlogs.send(command);

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
                            var d_start_time = new Date(d_end_time - ((5*1) * 60000) );
                            var queryClw = {
                                MetricDataQueries: dataQueries,
                                "StartTime": d_start_time,
                                "EndTime": d_end_time
                            };
                           
                            const command = new GetMetricDataCommand(queryClw);
                            const data = await cloudwatch.send(command);
                            
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
                                limit: 1,
                                logGroupName: 'RDSOSMetrics',
                                startFromHead: false
                            };
                        
                            const command = new GetLogEventsCommand(params_logs);
                            const data = await cloudwatchlogs.send(command);
                            
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
        
        
        
        
        
        //------#################
        //------################# Generic Metrics
        //------#################
        
        //-- getGenericMetrics
        async getGenericMetrics(object){
            
            var result = {};
            try {
                    
                        
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
                        result[item.metric] = { value : 0, timestamp : "" };
                        queryId++;
                        
                    });
                    
                    var d_end_time = new Date();
                    var d_start_time = new Date(d_end_time - ((5*1) * 60000) );
                    var queryClw = {
                        MetricDataQueries: dataQueries,
                        "StartTime": d_start_time,
                        "EndTime": d_end_time
                    };
                   
                    const command = new GetMetricDataCommand(queryClw);
                    const data = await cloudwatch.send(command);
                            
                    data.MetricDataResults.forEach(function(item) {
                        if (item.Values.length > 0 ) {
                            result[item.Label].value = item.Values[0];
                            result[item.Label].timestamp = String(item.Timestamps[0]);
                        }
                    });
                     

                    return result;
            }
            catch(err){
                
                console.log(err);
                return result;
                
            }
            
            
        }
        
        
        
        //------#################
        //------################# Generic Metrics Full Dataset
        //------#################
        
        //-- getGenericMetricsDataset
        async getGenericMetricsDataset(object){
            
            try {
                    
                        
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
                                    Period: object.period * 60,
                                    Stat: item.stat
                                },
                                Label: item.label
                        });
                        queryId++;
                        
                    });
                    
                    var d_end_time = new Date();
                    var d_start_time = new Date(d_end_time - (( object.interval  ) * 60000) );
                    var queryClw = {
                        MetricDataQueries: dataQueries,
                        "StartTime": d_start_time,
                        "EndTime": d_end_time
                    };
                   
                    const command = new GetMetricDataCommand(queryClw);
                    const data = await cloudwatch.send(command);
                            
                    return data.MetricDataResults;
                    
            }
            catch(err){
                
                console.log(err);
                return [];
                
            }
            
            
        }
        
        
        //------#################
        //------################# CloudWatch Metrics Insight
        //------#################
        
        //-- getGenericMetricsInsight
        async getGenericMetricsInsight(object){
            
            try {
         
                var dataQueries = [
                        {
                            "Expression": object.sqlQuery,
                            "Id": "q1",
                            "Period": object.period
                        }    
                ];
                
                var d_end_time = new Date();
                var d_start_time = new Date(d_end_time - (( object.interval ) * 60000) );
                var queryClw = {
                    MetricDataQueries: dataQueries,
                    "StartTime": d_start_time,
                    "EndTime": d_end_time
                };
                
                const command = new GetMetricDataCommand(queryClw);
                const data = await cloudwatch.send(command);
                            
                return data.MetricDataResults;
            }
            catch(err){
                console.log(err);
                return [];
            }
            
        }
        
        
        //------#################
        //------################# API CORE
        //------#################
        
        
        
        //------################# CloudWatch
        
        async getCloudwatchMetricDataAPI(parameter){
             
            try {
            
                const command = new GetMetricDataCommand(parameter);
                const data = await cloudwatch.send(command);
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        async getCloudwatchLogsAPI(parameter){
             
            try {
            
                const command = new GetLogEventsCommand(parameter);
                const data = await cloudwatchlogs.send(command);
                
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }


        //------################# RDS
        
        async getRDSClustersAPI(parameter){
             
            try {
            
                const command = new DescribeDBClustersCommand(parameter);
                const data = await rds.send(command);
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
        async getRDSInstancesAPI(parameter){
             
            try {
            
                const command = new DescribeDBInstancesCommand(parameter);
                const data = await rds.send(command);
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
        //------################# ELASTICACACHE
        
        
        async getElasticacheClustersAPI(parameter){

            try {
                
                const command = new DescribeReplicationGroupsCommand(parameter);
                var data = await elasticache.send(command);
                        
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
                
        async getElasticacheServelesssAPI(parameter){

            try {
                
                const command = new DescribeServerlessCachesCommand(parameter);
                var data = await elasticache.send(command);
                        
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
        //------################# DOCUMENTDB
        
        async getDocumentDBClustersAPI(parameter){

            try {
                
                const command = new DescribeDBClustersCommand(parameter);
                const data = await documentDB.send(command);
                        
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
        async getDocumentDBClustersElasticAPI(parameter){

            try {
                
                const command = new ListClustersCommand(parameter);
                const data = await docdbelastic.send(command);
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
        //------################# STS
        
        async getSTSCallerIdentityAPI(parameter){

            try {
                
                const command = new GetCallerIdentityCommand(parameter);
                const data = await sts.send(command);

                return data;
                
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
        //------################# MEMORYDB
        
        async getMemoryDBClustersAPI(parameter){

            try {
                
                const command = new DescribeClustersCommand(parameter);
                const data = await memorydb.send(command);
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        //------################# DYNAMODB
        
        async getDynamoDBTablesAPI(parameter){

            try {
                
                const command = new ListTablesCommand(parameter);
                const data = await dynamodb.send(command);
                return data;
                
            }
            catch(err){
                console.log(err);
                return [];
            }

        }
        
        
}


module.exports = { classAWS };



                