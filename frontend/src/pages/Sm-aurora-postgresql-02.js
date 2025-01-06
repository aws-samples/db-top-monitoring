import { useState,useEffect,useRef } from 'react';
import Axios from 'axios';
import { configuration } from './Configs';
import { useSearchParams } from 'react-router-dom';
import CustomHeader from "../components/Header";
import AppLayout from "@cloudscape-design/components/app-layout";
import Box from "@cloudscape-design/components/box";
import Tabs from "@cloudscape-design/components/tabs";
import { SplitPanel } from '@cloudscape-design/components';
import ProgressBar from "@cloudscape-design/components/progress-bar";


import Icon from "@cloudscape-design/components/icon";
import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import Flashbar from "@cloudscape-design/components/flashbar";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Spinner from "@cloudscape-design/components/spinner";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import Toggle from "@cloudscape-design/components/toggle";
import CompMetric01  from '../components/Metric01';
import ChartLine02  from '../components/ChartLine02';
import ChartSparkline01 from '../components/ChartSparkline01';
import Animation01 from '../components/Animation01';
import ChartLine04  from '../components/ChartLine04';
import ChartBar01  from '../components/ChartBar01';
import ChartBar03  from '../components/ChartBar03';
import ChartBar05  from '../components/ChartBar05';
import ChartRadialBar01  from '../components/ChartRadialBar01';
import ChartPolar01  from '../components/ChartPolar-01';
import ChartPolar02  from '../components/ChartPolar-02';

import { createLabelFunction, customFormatNumberLong, customFormatNumber, customFormatNumberShort, customFormatNumberInteger } from '../components/Functions';
import CustomTable02 from "../components/Table02";

export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  preferencesTitle: 'Split panel preferences',
  preferencesPositionLabel: 'Split panel position',
  preferencesPositionDescription: 'Choose the default split panel position for the service.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  resizeHandleAriaLabel: 'Resize split panel',
};

var CryptoJS = require("crypto-js");

function App() {
    
    //--######## Global Settings
    
    //-- Connection Usage
    const [connectionMessage, setConnectionMessage] = useState([]);
    
    //-- Gather Parameters
    const [params]=useSearchParams();    
    
    //-- Variable for Active Tabs
    const [activeTabId, setActiveTabId] = useState("tab01");
    const currentTabId = useRef("tab01");
    

    //-- Variable for parameters
    const parameter_code_id=params.get("code_id");  
    const parameter_id=params.get("session_id");  
    var parameter_object_bytes = CryptoJS.AES.decrypt(parameter_id, parameter_code_id);
    var parameter_object_values = JSON.parse(parameter_object_bytes.toString(CryptoJS.enc.Utf8));
    
    //-- Configuration variables
    const cnf_connection_id=parameter_object_values["session_id"];  
    const cnf_identifier=parameter_object_values["rds_id"];  
    const cnf_engine=parameter_object_values["rds_engine"];
    const cnf_endpoint=parameter_object_values["rds_host"];
    const cnf_endpoint_port=parameter_object_values["rds_port"];
    const cnf_username=parameter_object_values["rds_user"];
    const cnf_password=parameter_object_values["rds_password"];
    
    
    //-- Add token header
    Axios.defaults.headers.common['x-token'] = sessionStorage.getItem(cnf_connection_id);
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    
    //-- Set Page Title
    document.title = configuration["apps-settings"]["application-title"] + ' - ' + cnf_identifier;
   

    //--######## RealTime Metric Features
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [splitPanelSize, setSplitPanelSize] = useState(500);
    var splitPanelIsShow = useRef(false);
    const [stackedChart, setStackedChart] = useState(true);

    

    
    //-- Variable for Cluster Stats
    const nodeList = useRef("");
    const [clusterStats,setClusterStats] = useState({ 
                                cluster : {
                                            status : "-",
                                            maxACU : "-",
                                            minACU : "-",
                                            shardId : "-",
                                            lastUpdate : "-",
                                            metrics : {
                                                        vcpu: 0,
                                                        readIOPS: 0,
                                                        writeIOPS: 0,
                                                        totalIOPS: 0,
                                                        readIOBytes: 0,
                                                        writeIOBytes: 0,
                                                        totalIOBytes: 0,
                                                        networkBytesIn: 0,
                                                        networkBytesOut: 0,
                                                        totalNetworkBytes: 0,
                                                        tuples : 0,
                                                        tuplesWritten : 0,
                                                        tuplesRead : 0,
                                                        xactTotal: 0,
                                                        xactCommit: 0,
                                                        xactRollback: 0,
                                                        tupReturned: 0,
                                                        tupFetched: 0,
                                                        tupInserted: 0,
                                                        tupDeleted: 0,
                                                        tupUpdated: 0,
                                                        numbackends : 0,
                                                        numbackendsActive : 0,
                                                        history : {
                                                          vcpu: [],
                                                          readIOPS: [],
                                                          writeIOPS: [],
                                                          totalIOPS: [],
                                                          readIOBytes: [],
                                                          writeIOBytes: [],
                                                          totalIOBytes: [],
                                                          networkBytesIn: [],
                                                          networkBytesOut: [],
                                                          totalNetworkBytes: [],
                                                          tuples : [],
                                                          tuplesWritten : [],
                                                          tuplesRead : [],
                                                          xactTotal: [],
                                                          xactCommit: [],
                                                          xactRollback: [],
                                                          tupReturned: [],
                                                          tupFetched: [],
                                                          tupInserted: [],
                                                          tupDeleted: [],
                                                          tupUpdated: [],
                                                          numbackends : [],
                                                          numbackendsActive : [],
                                                        }
                                            },                                            
                                            shards : [],
                                            routers : [],  
                                            chartSummary : { categories : [], data : [] },

                                            
                                },
                });
    
    const currentNode = useRef({ nodeId : 0, nodeType : 'routers' } );
    const metricCurrent = useRef({ nodeId : '', metricId : '', metricDescription : '', format : 3 } );
    const [clusterStatsDetails,setClusterStatsDetails] = useState({ value : 0, history : []});
    const [shardCloudwatchMetric,setShardCloudwatchMetric] = useState({ 
                                                                            labels : [], 
                                                                            values : [], 
                                                                            charts : [], 
                                                                            summary : { total : 0, average : 0, min : 0, max : 0, count : 0  }, 
                                                                            currentState : { 
                                                                                                chart : { 
                                                                                                            categories : new Array("-", "-"), 
                                                                                                            data : new Array(0 , 0) },                                                                                                         
                                                                                                            value : 0 
                                                                                                        } 
                                                                    });
    

    const [shardCloudwatchMetricAnalytics,setShardCloudwatchMetricAnalytics] = useState({ 
                                                                            labels : [], 
                                                                            values : [], 
                                                                            charts : [], 
                                                                            summary : { total : 0, average : 0, min : 0, max : 0, count : 0  }, 
                                                                            currentState : { 
                                                                                                chart : { 
                                                                                                            categories : new Array("-", "-"), 
                                                                                                            data : new Array(0 , 0) },                                                                                                         
                                                                                                            value : 0 
                                                                                                        } 
                                                                    });
    
    
    //-- Storage Usage
    const [storageUsage,setStorageUsage] = useState({ 
                                                        chart : { categories : [], series : []}  , 
                                                        table : [] 
                                                    });



    //-- Cloudwatch Metrics
    const [selectedOptionInterval,setSelectedOptionInterval] = useState({label: "1 Hour",value: 1});
    const optionInterval = useRef(1);

    const [selectedOptionType,setSelectedOptionType] = useState({label: "Shards + Routers",value: "ALL"});
    const optionType = useRef("ALL");


    const [selectedOptionTypeStorage,setSelectedOptionTypeStorage] = useState({label: "Shards + Routers",value: "ALL"});
    const optionTypeStorage = useRef("ALL");



    const cloudwatchMetrics = [
      {
            label: "Cluster",
            options: [
                      { type : "3", label : "VolumeReadIops", value : "VolumeReadIops", descriptions : "The number of billed read I/O operations from a cluster volume, reported at 5-minute intervals.", unit : "Count", format : 3 },
                      { type : "3", label : "VolumeWriteIops", value : "VolumeWriteIops", descriptions : "The number of write disk I/O operations to the cluster volume, reported at 5-minute intervals.", unit : "Count", format : 3 },
                      { type : "3", label : "VolumeBytesUsed", value : "VolumeBytesUsed", descriptions : "The amount of storage used by your Aurora PostgreSQL Limitless Database cluster, reported at 5-minute intervals.", unit : "Count", format : 2 },                  
            ]
      },
      {
        label: "DBShard Group Instance",
        options: [
                  { type : "1", label : "BufferCacheHitRatio", value : "BufferCacheHitRatio", descriptions : "The percentage of data and indexes served from an instance’s memory cache (as opposed to the storage volume).", unit : "Percentage", format : 3 },
                  { type : "1", label : "CommitLatency", value : "CommitLatency", descriptions : "The average duration for the engine and storage to complete the commit operations for a particular node (router or shard).", unit : "ms", format : 3 },
                  { type : "1", label : "CommitThroughput", value : "CommitThroughput", descriptions : "The average number of commit operations per second.", unit : "Count/sec", format : 3 },                  
                  { type : "1", label : "DBLoad", value : "DBLoad", descriptions : "The number of active sessions for the database.", unit : "Count", format : 3  },
                  { type : "1", label : "DBLoadCPU", value : "DBLoadCPU", descriptions : "The number of active sessions where the wait event type is CPU.", unit : "Count", format : 3 },
                  { type : "1", label : "DBLoadNonCPU", value : "DBLoadNonCPU", descriptions : "The number of active sessions where the wait event type is not CPU.", unit : "Count", format : 3 },
                  { type : "1", label : "DBLoadRelativeToNumVCPUs", value : "DBLoadRelativeToNumVCPUs", descriptions : "The ratio of the DB load to the number of virtual CPUs for the database.", unit : "Count", format : 3 },                  
                  { type : "1", label : "MaximumUsedTransactionIDs", value : "MaximumUsedTransactionIDs", descriptions : "The age of the oldest unvacuumed transaction ID, in transactions. If this value reaches 2,146,483,648 (2^31 - 1,000,000), the database is forced into read-only mode, to avoid transaction ID wraparound.", unit : "Count", format : 3 },
                  { type : "1", label : "NetworkReceiveThroughput", value : "NetworkReceiveThroughput", descriptions : "The amount of network throughput received from clients by each instance in the DB shard group. This throughput doesn't include network traffic between instances in the DB shard group and the cluster volume", unit : "Bytes/sec", format : 2 },
                  { type : "1", label : "NetworkThroughput", value : "NetworkThroughput", descriptions : "The aggregated network throughput (both transmitted and received) between clients and routers, and routers and shards in the DB shard group. This throughput doesn't include network traffic between instances in the DB shard group and the cluster volume.", unit : "Bytes/sec", format : 2 },
                  { type : "1", label : "NetworkTransmitThroughput", value : "NetworkTransmitThroughput", descriptions : "The amount of network throughput sent to clients by each instance in the DB shard group. This throughput doesn't include network traffic between instances in the DB shard group and the cluster volume.", unit : "Count", format : 2 },
                  { type : "1", label : "ReadIOPS", value : "ReadIOPS", descriptions : " The average number of disk read input/output operations per second (IOPS).", unit : "Count/sec", format : 3 },
                  { type : "1", label : "ReadLatency", value : "ReadLatency", descriptions : " The average amount time taken per disk read input/output (I/O) operation.", unit : "ms", format : 3 },
                  { type : "1", label : "ReadThroughput", value : "ReadThroughput", descriptions : "The average number of bytes read from disk per second.", unit : "Bytes/sec", format : 2 },
                  { type : "1", label : "StorageNetworkReceiveThroughput", value : "StorageNetworkReceiveThroughput", descriptions : "The amount of network throughput received from the Aurora storage subsystem by each instance in the DB shard group.", unit : "Bytes/sec", format : 2 },
                  { type : "1", label : "StorageNetworkThroughput", value : "StorageNetworkThroughput", descriptions : "The aggregated network throughput both transmitted to and received from the Aurora storage subsystem by each instance in the DB shard group.", unit : "Bytes/sec", format : 2 },
                  { type : "1", label : "StorageNetworkTransmitThroughput", value : "StorageNetworkTransmitThroughput", descriptions : "The amount of network throughput sent to the Aurora storage subsystem by each instance in the DB shard group.", unit : "Bytes/sec", format : 2 },
                  { type : "1", label : "TempStorageIOPS", value : "TempStorageIOPS", descriptions : "The average number of I/O operations performed on local storage attached to the DB instance. It includes both read and write I/O operations.", unit : "Count/sec", format : 3 },
                  { type : "1", label : "TempStorageThroughput", value : "TempStorageThroughput", descriptions : "The amount of data transferred to and from local storage associated with either a router or a shard.", unit : "Bytes/sec", format : 2 },
                  { type : "1", label : "WriteIOPS", value : "WriteIOPS", descriptions : "The average number of disk write IOPS.", unit : "Count/sec", format : 3 },
                  { type : "1", label : "WriteLatency", value : "WriteLatency", descriptions : " The average amount time taken per disk write I/O operation.", unit : "ms", format : 3 },
                  { type : "1", label : "WriteThroughput", value : "WriteThroughput", descriptions : "The average number of bytes written to disk per second.", unit : "Bytes/sec", format : 2 },                  
        ]
      },
      {
        label: "DBShard Group",
        options: [
                  { type : "2", label : "DBShardGroupACUUtilization", value : "DBShardGroupACUUtilization", descriptions : "Aurora capacity unit (ACU) usage as a percentage calculated from DBShardGroupCapacity divided by DBShardGroupMaxACU.", unit : "Percentage", format : 3 },
                  { type : "2", label : "DBShardGroupCapacity", value : "DBShardGroupCapacity", descriptions : "Number of ACUs consumed by the DB shard group.The average duration for the engine and storage to complete the commit operations for a particular node (router or shard).", unit : "Count", format : 3 },
                  { type : "2", label : "DBShardGroupMaxACU", value : "DBShardGroupMaxACU", descriptions : "Maximum number of ACUs configured for the DB shard group.", unit : "Count", format : 3 },
                  { type : "2", label : "DBShardGroupMinACU", value : "DBShardGroupMinACU", descriptions : "Minimum number of ACUs required by the DB shard group.", unit : "Count", format : 3 },
        ]
      },      
      {
        label: "DBShard Group Router",
        options: [
                  { type : "4", label : "CommitThroughput", value : "CommitThroughput", descriptions : "The average number of commit operations per second across all of the router nodes in the DB shard group.", unit : "Count", format : 3 },
                  { type : "4", label : "DatabaseConnections", value : "DatabaseConnections", descriptions : "The sum of all connections across all of the router nodes in the DB shard group.", unit : "Count", format : 3 },                  
        ]
      }
    ];
  
    const [selectedCloudWatchMetric,setSelectedCloudWatchMetric] = useState({
                                                      label: "CommitThroughput",
                                                      value: "CommitThroughput"
    });
    const cloudwatchMetric = useRef({ type : "1", name : "CommitThroughput", descriptions : "The average number of commit operations per second.", unit : "Count/sec", format : 2 });
    var metricName = useRef("");


    //-- Table Shard
    const columnsTable =  [
        {id: 'resource',header: 'Name',cell: item => item['resource'],ariaLabel: createLabelFunction('resource'),sortingField: 'resource',},
        {id: 'type',header: 'Type',cell: item => item['type'],ariaLabel: createLabelFunction('type'),sortingField: 'type',},
        {id: 'BufferCacheHitRatio',header: 'BufferCacheHitRatio',cell: item => item['BufferCacheHitRatio'],ariaLabel: createLabelFunction('BufferCacheHitRatio'),sortingField: 'BufferCacheHitRatio',},
        {id: 'CommitLatency',header: 'CommitLatency',cell: item => customFormatNumberShort(parseFloat(item['CommitLatency']),0),ariaLabel: createLabelFunction('CommitLatency'),sortingField: 'CommitLatency',},
        {id: 'CommitThroughput',header: 'CommitThroughput',cell: item => customFormatNumberShort(parseFloat(item['CommitThroughput']),0) ,ariaLabel: createLabelFunction('CommitThroughput'),sortingField: 'CommitThroughput',},
        {id: 'DBLoad',header: 'DBLoad',cell: item => customFormatNumberShort(parseFloat(item['DBLoad']),0) ,ariaLabel: createLabelFunction('DBLoad'),sortingField: 'DBLoad',},
        {id: 'DBLoadCPU',header: 'DBLoadCPU',cell: item => customFormatNumberShort(parseFloat(item['DBLoadCPU']),0) ,ariaLabel: createLabelFunction('DBLoadCPU'),sortingField: 'DBLoadCPU',},
        {id: 'DBLoadNonCPU',header: 'DBLoadNonCPU',cell: item => customFormatNumberShort(parseFloat(item['DBLoadNonCPU']),0) ,ariaLabel: createLabelFunction('DBLoadNonCPU'),sortingField: 'DBLoadNonCPU',},
        {id: 'DBLoadRelativeToNumVCPUs',header: 'DBLoadRelativeToNumVCPUs',cell: item => customFormatNumberShort(parseFloat(item['DBLoadRelativeToNumVCPUs']),0) ,ariaLabel: createLabelFunction('DBLoadRelativeToNumVCPUs'),sortingField: 'DBLoadRelativeToNumVCPUs',},
        {id: 'ReadIOPS',header: 'ReadIOPS',cell: item => customFormatNumberShort(parseFloat(item['ReadIOPS']) || 0 ,0),ariaLabel: createLabelFunction('ReadIOPS') || 0,sortingField: 'ReadIOPS',},
        {id: 'WriteIOPS',header: 'WriteIOPS',cell: item => customFormatNumberShort(parseFloat(item['WriteIOPS']) || 0,0),ariaLabel: createLabelFunction('WriteIOPS') || 0,sortingField: 'WriteIOPS',},
        {id: 'ReadLatency',header: 'ReadLatency',cell: item => customFormatNumberShort(parseFloat(item['ReadLatency']),0),ariaLabel: createLabelFunction('ReadLatency'),sortingField: 'ReadLatency',},
        {id: 'WriteLatency',header: 'WriteLatency',cell: item => customFormatNumberShort(parseFloat(item['WriteLatency']),0),ariaLabel: createLabelFunction('WriteLatency'),sortingField: 'WriteLatency',},
        {id: 'ReadThroughput',header: 'ReadThroughput',cell: item => customFormatNumber(parseFloat(item['ReadThroughput']) || 0,0),ariaLabel: createLabelFunction('ReadThroughput'),sortingField: 'ReadThroughput',},
        {id: 'WriteThroughput',header: 'WriteThroughput',cell: item => customFormatNumber(parseFloat(item['WriteThroughput']) || 0 ,0) ,ariaLabel: createLabelFunction('WriteThroughput'),sortingField: 'WriteThroughput',},
        {id: 'NetworkReceiveThroughput',header: 'NetworkReceiveThroughput',cell: item => customFormatNumber(parseFloat(item['NetworkReceiveThroughput']),0) || 0,ariaLabel: createLabelFunction('NetworkReceiveThroughput'),sortingField: 'NetworkReceiveThroughput',},
        {id: 'NetworkThroughput',header: 'NetworkThroughput',cell: item => customFormatNumber(parseFloat(item['NetworkThroughput']) || 0,0) ,ariaLabel: createLabelFunction('NetworkThroughput'),sortingField: 'NetworkThroughput',},
        {id: 'NetworkTransmitThroughput',header: 'NetworkTransmitThroughput',cell: item => customFormatNumber(parseFloat(item['NetworkTransmitThroughput']) || 0 ,0) ,ariaLabel: createLabelFunction('NetworkTransmitThroughput'),sortingField: 'NetworkTransmitThroughput',},
        {id: 'StorageNetworkReceiveThroughput',header: 'StorageNetworkReceiveThroughput',cell: item => customFormatNumber(parseFloat(item['StorageNetworkReceiveThroughput']) || 0 ,0) ,ariaLabel: createLabelFunction('StorageNetworkReceiveThroughput'),sortingField: 'StorageNetworkReceiveThroughput',},
        {id: 'StorageNetworkThroughput',header: 'StorageNetworkThroughput',cell: item => customFormatNumber(parseFloat(item['StorageNetworkThroughput']) || 0,0) ,ariaLabel: createLabelFunction('StorageNetworkThroughput'),sortingField: 'StorageNetworkThroughput',},
        {id: 'StorageNetworkTransmitThroughput',header: 'StorageNetworkTransmitThroughput',cell: item => customFormatNumber(parseFloat(item['StorageNetworkTransmitThroughput']) || 0,0) ,ariaLabel: createLabelFunction('StorageNetworkTransmitThroughput'),sortingField: 'ReadThStorageNetworkTransmitThroughputroughput',},
    ];

    const visibleContent = ['resource', 'type', 'DBLoad', 'CommitThroughput', 'ReadIOPS', 'WriteIOPS', 'NetworkThroughput', 'ReadThroughput', 'StorageNetworkThroughput', 'WriteThroughput'];
    const [shardMetrics,setShardMetrics] = useState({ 
                                                        tableMetrics : [] , 
                                                        tableSummary : {}, 
                                                        chartSummary : { 
                                                                            CommitThroughput : { categories : [], data : [] },
                                                                            DBLoad : { categories : [], data : [] },
                                                                            CommitLatency : { categories : [], data : [] },
                                                        },
                                                        chartHistory : { CommitThroughput : [], DBLoad : [], DBShardGroupACUUtilization : [], DBShardGroupCapacity : []  },
                                                        chartGlobal : { CommitThroughput : [] , DBLoad : [] },
                                                    });



    //-- Table Routers globally    
    const columnsTableRoutersGlobal =  [
        {id: 'name',header: 'Name',cell: item => item['name']  ,ariaLabel: createLabelFunction('name'),sortingField: 'name',},
        {id: 'numbackends',header: 'Users',cell: item => ( <div style={{"text-align" : "center"}}>                                                                                      
            <Box variant="h3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                </svg>
                &nbsp;
                {customFormatNumberInteger(parseFloat(item['numbackends']))}                 
            </Box>
            </div> )  ,ariaLabel: createLabelFunction('numbackends'),sortingField: 'numbackends',},
        {id: 'commitThroughput',header: 'CommitThroughput',cell: item => ( <div style={{"text-align" : "center"}}> 
                                                                                
            <Box variant="h2">{customFormatNumberInteger(parseFloat(item['xactCommit']))}</Box>
            <ChartSparkline01 series={JSON.stringify([item['history']['xactCommit']])} height="40px" type="bar" />                                                                                
            
        </div> )  ,ariaLabel: createLabelFunction('xactCommit'),sortingField: 'xactCommit',},

        {id: 'vcpu',header: 'vCPU',cell: item => ( <div style={{"text-align" : "center"}}>                                                                                      
                <Box variant="h3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cpu" viewBox="0 0 16 16">
                        <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0m-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
                    </svg>                  
                    &nbsp;
                    {customFormatNumberInteger(parseFloat(item['vcpu']))}                 
                </Box>
            </div> )  ,ariaLabel: createLabelFunction('vcpu'),sortingField: 'vcpu',},                
        {id: 'numbackendsActive',header: 'ActiveSessions',cell: item => customFormatNumberInteger(parseFloat(item['numbackendsActive'])) ,ariaLabel: createLabelFunction('numbackendsActive'),sortingField: 'numbackendsActive',},
        {id: 'totalIOPS',header: 'IOPS',cell: item => ( <div style={{"text-align" : "center"}}>                                                                                      
            <Box variant="h3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hdd-stack" viewBox="0 0 16 16">
                    <path d="M14 10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1zM2 9a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z"/>
                    <path d="M5 11.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M14 3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                    <path d="M5 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
                </svg>                  
                &nbsp;
                {customFormatNumberInteger(parseFloat(item['totalIOPS']))}                 
            </Box>
        </div> )  ,ariaLabel: createLabelFunction('totalIOPS'),sortingField: 'totalIOPS',},         
        {id: 'totalNetworkBytes',header: 'Network',cell: item => ( <div style={{"text-align" : "center"}}>                                                                                      
            <Box variant="h3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hdd-network" viewBox="0 0 16 16">
                    <path d="M4.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M3 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8.5v3a1.5 1.5 0 0 1 1.5 1.5h5.5a.5.5 0 0 1 0 1H10A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5H.5a.5.5 0 0 1 0-1H6A1.5 1.5 0 0 1 7.5 10V7H2a2 2 0 0 1-2-2zm1 0v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1m6 7.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5"/>
                </svg>
                &nbsp;
                {customFormatNumber(parseFloat(item['totalNetworkBytes']))}                 
            </Box>
        </div> )  ,ariaLabel: createLabelFunction('totalNetworkBytes'),sortingField: 'totalNetworkBytes',},         
        {id: 'totalIOBytes',header: 'IOBytes',cell: item => customFormatNumber(parseFloat(item['totalIOBytes']),0) ,ariaLabel: createLabelFunction('totalIOBytes'),sortingField: 'totalIOBytes',},                
        {id: 'tuples',header: 'Tuples',cell: item => customFormatNumberInteger(parseFloat(item['tuples'])) ,ariaLabel: createLabelFunction('tuples'),sortingField: 'tuples',},
        {id: 'tuplesRead',header: 'TuplesRead',cell: item => customFormatNumberInteger(parseFloat(item['tuplesRead'])) ,ariaLabel: createLabelFunction('tuplesRead'),sortingField: 'tuplesRead',},
        {id: 'tuplesWritten',header: 'TuplesWritten',cell: item => customFormatNumberInteger(parseFloat(item['tuplesWritten'])) ,ariaLabel: createLabelFunction('tuplesWritten'),sortingField: 'tuplesWritten',},
    ];

    const visibleContentRoutersGlobal = ['name', 'vcpu', 'commitThroughput', 'numbackends', 'totalIOPS', 'totalNetworkBytes'];
   

    //-- Table Storage Usage
    const columnsStorageTable =  [
        {id: 'name',header: 'Identifier',cell: item => item['name'],ariaLabel: createLabelFunction('name'),sortingField: 'name',},
        {id: 'type',header: 'Type',cell: item => item['type'],ariaLabel: createLabelFunction('type'),sortingField: 'type',},
        {id: 'size',header: 'Size',cell: item => customFormatNumber(parseFloat(item['size']) || 0 ,0) ,ariaLabel: createLabelFunction('size'),sortingField: 'size',},        
        {id: 'pct',header: '(%)',cell: item => ( <div style={{"text-align" : "center"}}>                                                                                      
            <ProgressBar
                value={item['pct']}                
            />
            </div> )  ,ariaLabel: createLabelFunction('pct'),sortingField: 'pct',},
    ];
    
    const visibleContentStorageTable = ['name', 'type', 'size', 'pct'];
   

    //-- Table Proccesses

    const columnsTableEm = [
        {id: 'id',header: 'PID',cell: item => item['id'],ariaLabel: createLabelFunction('id'),sortingField: 'id',},
        {id: 'parentID',header: 'ParentPID',cell: item => item['parentID'] || "-",ariaLabel: createLabelFunction('parentID'),sortingField: 'parentID',},
        {id: 'name',header: 'Name',cell: item => item['name'],ariaLabel: createLabelFunction('name'),sortingField: 'name',},
        {id: 'cpuUsedPc',header: 'CPU',cell: item => item['cpuUsedPc'] || "-",ariaLabel: createLabelFunction('cpuUsedPc'),sortingField: 'cpuUsedPc',},
        {id: 'memoryUsedPc',header: 'Memory',cell: item => item['memoryUsedPc'],ariaLabel: createLabelFunction('memoryUsedPc'),sortingField: 'memoryUsedPc',},
        {id: 'rss',header: 'RSS',cell: item => item['rss'],ariaLabel: createLabelFunction('rss'),sortingField: 'rss',},
        {id: 'vmlimit',header: 'VMLimit',cell: item => item['vmlimit'],ariaLabel: createLabelFunction('vmlimit'),sortingField: 'vmlimit',},
        {id: 'vss',header: 'VSS',cell: item => item['vss'],ariaLabel: createLabelFunction('vss'),sortingField: 'vss',},
        {id: 'tgid',header: 'TGID',cell: item => item['tgid'],ariaLabel: createLabelFunction('tgid'),sortingField: 'tgid',}
    ];

    const visibleContentEm = ['id', 'parentID', 'name', 'cpuUsedPc', 'memoryUsedPc', 'rss', 'vmlimit', 'vss', 'tgid' ];
    




    //-- Function open connection
    async function openClusterConnection() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        await Axios.post(`${api_url}/api/aurora/cluster/postgresql/limitless/open/connection/`,{
                      params: { 
                                connectionId : cnf_connection_id,
                                clusterId : cnf_identifier,
                                host : cnf_endpoint,
                                port : cnf_endpoint_port,
                                username : cnf_username,
                                password : cnf_password,
                                engineType : cnf_engine
                             }
              }).then((data)=>{
                
                nodeList.current = data.data.nodes;
                if (data.data.newObject==false) {
                    setConnectionMessage([
                                  {
                                    type: "info",
                                    content: "Cluster connection already created at [" + data.data.creationTime + "] with identifier [" +  data.data.connectionId  + "], this connection will be re-used to gather metrics.",
                                    dismissible: true,
                                    dismissLabel: "Dismiss message",
                                    onDismiss: () => setConnectionMessage([]),
                                    id: "message_1"
                                  }
                    ]);
                }
  
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/open/connection/' );
                  console.log(err);
                  
              });

              await gatherClusterStats();
              
    }
    
   
    //-- Function Cluster Gather Stats
    async function gatherClusterStats() {
        
        //-- API - 01 - Gather Stats
        var localClusterStats = {};
        if ( currentTabId.current == "tab01" || currentTabId.current == "tab02" || currentTabId.current == "tab03" || currentTabId.current == "tab04"  ) {
        
        
                var api_url = configuration["apps-settings"]["api_url"];                
                await Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/gather/stats/`,{
                              params: { connectionId : cnf_connection_id, 
                                        clusterId : cnf_identifier,     
                                        engineType : cnf_engine                              
                              }
                          }).then((data)=>{                           
                           var info = data.data.cluster;
                           localClusterStats = { cluster : {...info} };                                     
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/gather/stats/' );
                          console.log(err);
                          
                      });
              
        }

        //-- API - 02 - Gather stats details
        var localClusterStatsDetails = {};
        if ( currentTabId.current == "tab01" && splitPanelIsShow.current === true ) {
            
            /*              
            var api_url = configuration["apps-settings"]["api_url"];
            
            await Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/gather/stats/details`,{
                          params: { connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    engineType : cnf_engine,                   
                                    metricId :  metricCurrent.current['metricId']
                          }
                      }).then((data)=>{                                               
                      localClusterStatsDetails = { ...data.data };
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/gather/stats/details' );
                      console.log(err);
                      
                  });
            */
          
      }


      
        //-- API - 03 - Gather Cloudwatch
        var localShardCloudwatchMetricAnalytics = {};
        if ( currentTabId.current == "tab03" ) {
            
            var api_url = configuration["apps-settings"]["api_url"];            

            await Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics`,{
                        params: { connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    engineType : cnf_engine,                   
                                    type :  cloudwatchMetric.current.type,
                                    metric :  cloudwatchMetric.current.name,
                                    period : 1,
                                    interval : optionInterval.current * 60,
                                    stat : "Average",
                                    resourceType : optionType.current,
                        }
                    }).then((data)=>{                                           
                    
                    localShardCloudwatchMetricAnalytics = {... data.data };
                    
                })
                .catch((err) => {
                    console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics' );
                    console.log(err);                        
                });     

        }   

      
        //-- API - 04 - Gather Cloudwatch
        var localShardMetrics = {};
        if ( currentTabId.current == "tab02" ) {
            var api_url = configuration["apps-settings"]["api_url"];
            
            await Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics/table`,{
                          params: { connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    engineType : cnf_engine,                                                           
                          }
                      }).then((data)=>{                          
                        localShardMetrics = {... data.data };                        
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics/table' );
                      console.log(err);                        
                  });     
    
        }      

      
        //-- API - 05 - Gather Cloudwatch
        var localShardCloudwatchMetric = {};     
        if ( currentTabId.current == "tab02" && splitPanelIsShow.current === true ) {
            var api_url = configuration["apps-settings"]["api_url"];
            
            await Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics`,{
                          params: { connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    engineType : cnf_engine,                   
                                    type :  "1",
                                    metric :  metricName.current,
                                    period : 1,
                                    interval : 30,
                                    stat : "Average",
                                    resourceType : "ALL",
                          }
                      }).then((data)=>{                           
                      localShardCloudwatchMetric = {... data.data };                         
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics' );
                      console.log(err);                        
                  });     
    
        }


        if (Object.keys(localClusterStats).length > 0)
            setClusterStats(localClusterStats);

        if (Object.keys(localClusterStatsDetails).length > 0)
            setClusterStatsDetails(localClusterStatsDetails);
        
        if (Object.keys(localShardCloudwatchMetricAnalytics).length > 0)
            setShardCloudwatchMetricAnalytics(localShardCloudwatchMetricAnalytics);
        
        if (Object.keys(localShardMetrics).length > 0)
            setShardMetrics(localShardMetrics);
        
        if (Object.keys(localShardCloudwatchMetric).length > 0)
            setShardCloudwatchMetric(localShardCloudwatchMetric);
        
        
    }


    //-- Gather Storage Usage
    async function gatherStorageUsage(){

        if ( currentTabId.current == "tab04"  ) {
            var api_url = configuration["apps-settings"]["api_url"];
            
            await Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/gather/storage/info`,{
                          params: { connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    engineType : cnf_engine,                   
                                    type : optionTypeStorage.current,
                          }
                      }).then((data)=>{                           
                        console.log(data.data);                        
                        setStorageUsage({... data.data });        
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/gather/storage/info' );
                      console.log(err);                        
                  });     
    
        }

    }


    //-- Gather all stats
    function gatherGlobalStats(){
        gatherClusterStats();
    }


    function onClickMetric(object){

        metricName.current = object.metricName;
        splitPanelIsShow.current = true;
        setsplitPanelShow(true);
        gatherClusterStats();      

    }
    
    //-- Function Handle Logout
   const handleClickMenu = ({detail}) => {
          
            switch (detail.id) {
              case 'signout':
                  closeDatabaseConnection();
                break;
                
              case 'other':
                break;
              
            }

    };
    
    //-- Function Handle Logout
   const handleClickDisconnect = () => {
          closeDatabaseConnection();
    };
    
    
    //-- Close Database Connection    
    const closeDatabaseConnection = () => {
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aurora/cluster/postgresql/limitless/close/connection/`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier, engineType : "aurora-postgresql" }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/close/connection/');
                      console.log(err)
                  });
                  
  
      
    }
       
    //-- Close TabWindow
    const closeTabWindow = () => {
              window.opener = null;
              window.open("", "_self");
              window.close();
      
    }
    

    useEffect(() => {
        openClusterConnection();                     
    }, []);
    
    
    useEffect(() => {        
        const id = setInterval(gatherGlobalStats, configuration["apps-settings"]["refresh-interval-documentdb-metrics"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


  return (
    <div style={{"background-color": "#121b29"}}>
    
        <CustomHeader
            onClickMenu={handleClickMenu}
            onClickDisconnect={handleClickDisconnect}
            sessionInformation={parameter_object_values}
        />
        
        <AppLayout
        headerSelector="#h"
        contentType="table"
        disableContentPaddings={true}
        toolsHide={true}
        navigationHide={true}
        splitPanelOpen={splitPanelShow}
        onSplitPanelToggle={() => { 
            setsplitPanelShow(false); 
            splitPanelIsShow.current = false;
        }}
        onSplitPanelResize={
                            ({ detail: { size } }) => {
                             setSplitPanelSize(size);
                        }
        }
        splitPanelSize={splitPanelSize}
        splitPanel={
                  <SplitPanel                                  
                        i18nStrings={splitPanelI18nStrings} 
                        closeBehavior="hide"
                        onSplitPanelToggle={({ detail }) => {
                            
                            }
                        }
                        header={
                                <div>
                                    
                                    { splitPanelIsShow.current === true && currentTabId.current == "tab02" &&
                                        <Header variant="h3">
                                            {metricName.current}
                                        </Header>                                                                    
                                    }                                    
                                    { splitPanelIsShow.current === true && currentTabId.current == "tab01" &&
                                        <Header variant="h3">
                                            {(currentNode.current['type'] == "routers" ? "Router : " : "Shard : ") }                                            
                                            {clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['name']}
                                        </Header>                                                                    
                                    }     
                                </div>
                            
                        }
                  >
                        { splitPanelIsShow.current === true && currentTabId.current == "tab01" &&                         

                            <div>
                                    <Container
                                        header={
                                            <Header
                                            variant="h3"                      
                                            >
                                            Performance
                                            </Header>
                                        }
                                    >
                                        <table style={{"width":"100%"}}>                                                               
                                            <tr>                                                                    
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['vcpu'] || 0 }
                                                        title={"vCPUs"}
                                                        precision={2}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>    
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['xactCommit'] || 0 }
                                                        title={"CommitThroughput"}
                                                        precision={2}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>                                                
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['tuplesRead'] || 0 }
                                                        title={"TuplesRead"}
                                                        precision={2}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['tuplesWritten'] || 0 }
                                                        title={"TuplesWritten"}
                                                        precision={2}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['numbackends'] || 0 }
                                                        title={"TotalSessions"}
                                                        precision={2}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>                                               
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['numbackendsActive'] || 0 }
                                                        title={"ActiveSessions"}
                                                        precision={2}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['totalIOPS'] || 0 }
                                                        title={"IOPS"}
                                                        precision={2}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['totalNetworkBytes'] || 0 }
                                                        title={"NetworkThroughput"}
                                                        precision={2}
                                                        format={2}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>
                                                <td valign="middle" style={{ "width":"11%", "padding": "1em"}}>                                          
                                                    <CompMetric01 
                                                        value={ clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['totalIOBytes'] || 0 }
                                                        title={"I/O Throughput"}
                                                        precision={2}
                                                        format={2}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"18px"}
                                                        fontSizeTitle={"12px"}
                                                    />                                                                                                              
                                                </td>                                                
                                            </tr>
                                        </table>
                                    </Container>
                                    <br/>
                                    <CustomTable02                                            
                                        columnsTable={columnsTableEm}
                                        visibleContent={visibleContentEm}
                                        dataset={clusterStats['cluster'][currentNode.current['type']][currentNode.current['nodeId']]?.['processList']}
                                        title={"Processes"}                                                                                 
                                    />  
                                    <br/>
                            </div>                                  
                       
                        }

                        { splitPanelIsShow.current === true && currentTabId.current == "tab02" &&

                            <div>                   
                                <table style={{"width":"100%"}}>
                                    <tr>
                                        <td style={{"width": "100%",  "padding-right": "2em", "text-align" : "right" }}>                                                                                             
                                                <Toggle
                                                    onChange={({ detail }) =>
                                                        setStackedChart(detail.checked)
                                                    }
                                                    checked={stackedChart}
                                                >
                                                    Stacked
                                                </Toggle>                                                
                                            
                                        </td>
                                    </tr>
                                </table>                                                                   
                                <table style={{"width":"100%"}}>  
                                    <tr>                                                            
                                        <td valign="top" style={{"width": "100%", "padding-right": "2em"}}>                                                
                                            <table style={{"width":"100%", "padding": "1em"}}>
                                                <tr>                                                      
                                                    <td valign="top" style={{ "width":"20%","text-align": "center" }}>
                                                        <CompMetric01 
                                                            value={ shardCloudwatchMetric['summary']?.['average'] || 0 }
                                                            title={"Average"}
                                                            precision={2}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"24px"}
                                                            fontSizeTitle={"12px"}
                                                        />
                                                    </td>                                                            
                                                    <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                        <CompMetric01 
                                                            value={ shardCloudwatchMetric['summary']?.['max'] || 0 }
                                                            title={"Maximum"}
                                                            precision={2}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"24px"}
                                                            fontSizeTitle={"12px"}
                                                        />
                                                    </td>
                                                    
                                                    <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                        <CompMetric01 
                                                            value={ shardCloudwatchMetric['summary']?.['min']|| 0 }
                                                            title={"Minimum"}
                                                            precision={2}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"24px"}
                                                            fontSizeTitle={"12px"}
                                                        />
                                                    </td>         
                                                    <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                        <CompMetric01 
                                                            value={ shardCloudwatchMetric['summary']?.['count'] || 0 }
                                                            title={"DataPoints"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"24px"}
                                                            fontSizeTitle={"12px"}
                                                        />
                                                    </td>                                                                                                               
                                                    <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                        <CompMetric01 
                                                            value={ shardCloudwatchMetric['summary']?.['total'] || 0 }
                                                            title={"Total"}
                                                            precision={0}
                                                            format={4}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"24px"}
                                                            fontSizeTitle={"12px"}
                                                        />
                                                    </td> 
                                                </tr>
                                            </table>  
                                            <ChartLine04 series={JSON.stringify(shardCloudwatchMetric['charts'])}
                                                title=""
                                                height="280px" 
                                                stacked={stackedChart}
                                            />                                            
                                        </td>
                                    </tr>
                                </table>                                                                                           
                            </div>                                                      
                        }

                  </SplitPanel>
        }
        content={
            <>              
                            <Flashbar items={connectionMessage} />
                            <table style={{"width":"100%"}}>
                                <tr>  
                                    <td style={{"width":"44%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                                        <SpaceBetween direction="horizontal" size="xs">
                                            { clusterStats['cluster']['status'] != 'available' &&
                                                <Spinner size="big" />
                                            }
                                            <Box variant="h3" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
                                        </SpaceBetween>
                                    </td>
                                    <td style={{"width":"14%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['shardId']}</div>
                                        <Box variant="awsui-key-label">ShardIdentifier</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <StatusIndicator type={clusterStats['cluster']['status'] === 'available' ? 'success' : 'pending'}> {clusterStats['cluster']['status']} </StatusIndicator>
                                        <Box variant="awsui-key-label">Status</Box>
                                    </td>                                    
                                    <td style={{"width":"8%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']?.['metrics']?.['vcpu'] || 0}</div>
                                        <Box variant="awsui-key-label">vCPU</Box>
                                    </td>
                                    <td style={{"width":"8%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['minACU']}</div>
                                        <Box variant="awsui-key-label">MinACU</Box>
                                    </td>
                                    <td style={{"width":"8%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['maxACU']}</div>
                                        <Box variant="awsui-key-label">MaxACU</Box>
                                    </td>
                                    <td style={{"width":"8%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['lastUpdate']}</div>
                                        <Box variant="awsui-key-label">LastUpdate</Box>
                                    </td>
                                    
                                </tr>
                            </table>
                            
                            <Tabs
                                    disableContentPaddings
                                    onChange={({ detail }) => {
                                          
                                          currentTabId.current=detail.activeTabId;
                                          setActiveTabId(detail.activeTabId);                                          
                                          setsplitPanelShow(false);
                                          gatherStorageUsage();
                                          gatherGlobalStats();

                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                      {
                                        label: "RealTime Metrics",
                                        id: "tab01",
                                        content: 
                                                <div style={{"padding": "1em"}}>          

                                                <Container>                                        
                                                 
                                                  <table style={{"width":"100%", "padding": "0em"}}>
                                                        <tr>
                                                            <td valign="top" style={{"width": "40%",  "padding-right": "3em" }}>    
                                                              <Container
                                                                        header={
                                                                            <Header
                                                                            variant="h1"                      
                                                                            >
                                                                            Cluster
                                                                            </Header>
                                                                        }
                                                              > 
                                                                <Box variant="h3">Commit Throughput</Box>
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>
                                                                        <td valign="middle" colspan="2" style={{"width": "100%",  "padding-right": "2em", "padding-left": "2em", "text-align" : "center" }}> 
                                                                            <ChartPolar02 
                                                                                    title={""} 
                                                                                    height="550px" 
                                                                                    width="100%" 
                                                                                    series = {JSON.stringify(clusterStats['cluster']?.['chartSummary']?.['data'])}
                                                                                    labels = {JSON.stringify(clusterStats['cluster']?.['chartSummary']?.['categories'])}                                                                                    
                                                                            />                                                                            
                                                                            <br/>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']?.['metrics']?.['xactCommit'] || 0}
                                                                                title={""}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"28px"}
                                                                                fontSizeTitle={"12px"}
                                                                            /> 
                                                                        </td>
                                                                    </tr>
                                                                    <tr>                                                                      
                                                                        <td valign="middle" colspan="2" style={{"width": "100%",  "padding-right": "2em" }}>                                                                                                                                                         
                                                                            <ChartBar03 series={JSON.stringify([
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['xactCommit']
                                                                                ])} 
                                                                                title="CommitThroughput(Count/sec)"
                                                                                height="170px"                                                                                 
                                                                            />                                                                                                                                                                                                    
                                                                        </td> 
                                                                    </tr>                                                                                           
                                                                    <tr>                                                                      
                                                                        <td valign="middle" colspan="2" style={{"width": "100%",  "padding-right": "2em",  "text-align" : "center" }}>    
                                                                            <br/>
                                                                            <br/>
                                                                            <br/>
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']?.['metrics']?.['vcpu'] || 0}
                                                                                title={""}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"28px"}
                                                                                fontSizeTitle={"12px"}
                                                                            />                                                                                                                                                      
                                                                            <ChartBar03 series={JSON.stringify([
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['vcpu']
                                                                                ])} 
                                                                                title="vCPUs"
                                                                                height="170px"                                                                                 
                                                                            />                                                                                                                                                                                                    
                                                                        </td> 
                                                                    </tr>   
                                                                </table>                       
                                                                <br/>
                                                                <table style={{"width":"100%"}}>                                                                                                                                 
                                                                    <tr>
                                                                        <td valign="middle" style={{"width": "30%",  "padding-right": "2em", "padding-left": "2em" }}>    
                                                                            <br/>                                                     
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']?.['metrics']?.['tuples'] || 0}
                                                                                title={"Tuples/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"26px"}
                                                                            />                                                                            
                                                                        </td> 
                                                                        <td valign="middle" style={{"width": "70%",  "padding-right": "2em" }}> 
                                                                             <br/>                                                                                                                                
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['tuplesRead'],
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['tuplesWritten']
                                                                                ])} 
                                                                                title="Tuples/sec"
                                                                                height="170px" 
                                                                            />   
                                                                                                                                                                                                     
                                                                        </td> 
                                                                    </tr> 
                                                                    <tr>
                                                                        <td valign="middle" style={{"width": "30%",  "padding-right": "2em", "padding-left": "2em" }}>   
                                                                            <br/>                                                      
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']?.['metrics']?.['totalIOPS'] || 0}
                                                                                title={"IOPS"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"26px"}
                                                                            />                                                                            
                                                                        </td> 
                                                                        <td valign="middle" style={{"width": "70%",  "padding-right": "2em" }}>  
                                                                             <br/>                                                                                                                               
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['readIOPS'],
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['writeIOPS']
                                                                                ])} 
                                                                                title="IOPS"
                                                                                height="170px" 
                                                                            />   
                                                                                                                                                                                                     
                                                                        </td> 
                                                                    </tr> 
                                                                    <tr>
                                                                        <td valign="middle" style={{"width": "30%",  "padding-right": "2em", "padding-left": "2em" }}>
                                                                            <br/>                                                         
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']?.['metrics']?.['totalIOBytes'] || 0}
                                                                                title={"IOBytes/sec"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"26px"}
                                                                            />                                                                            
                                                                        </td> 
                                                                        <td valign="middle" style={{"width": "70%",  "padding-right": "2em" }}>  
                                                                            <br/>                                                                                                                               
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['readIOBytes'],
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['writeIOBytes']
                                                                                ])} 
                                                                                title="IOBytes/sec"
                                                                                height="170px" 
                                                                            />   
                                                                                                                                                                                                     
                                                                        </td> 
                                                                    </tr> 
                                                                    <tr>
                                                                        <td valign="middle" style={{"width": "30%",  "padding-right": "2em", "padding-left": "2em" }}>        
                                                                            <br/>                                                 
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']?.['metrics']?.['totalNetworkBytes'] || 0}
                                                                                title={"NetworkBytes/sec"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"26px"}
                                                                            />                                                                            
                                                                        </td> 
                                                                        <td valign="middle" style={{"width": "70%",  "padding-right": "2em" }}>     
                                                                            <br/>                                                                                                                            
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['networkBytesIn'],
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['networkBytesOut']
                                                                                ])} 
                                                                                title="NetworkBytes/sec"
                                                                                height="170px" 
                                                                            />   
                                                                                                                                                                                                     
                                                                        </td> 
                                                                    </tr>    
                                                                    <tr>
                                                                        <td valign="middle" style={{"width": "30%",  "padding-right": "2em", "padding-left": "2em" }}>        
                                                                            <br/>                                                 
                                                                            <CompMetric01 
                                                                                value={clusterStats['cluster']?.['metrics']?.['numbackendsActive'] || 0}
                                                                                title={"ActiveSessions"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"26px"}
                                                                            />                                                                            
                                                                        </td> 
                                                                        <td valign="middle" style={{"width": "70%",  "padding-right": "2em" }}>   
                                                                            <br/>                                                                                                                              
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['numbackendsActive'],
                                                                                    clusterStats['cluster']?.['metrics']?.['history']?.['numbackends']
                                                                                ])} 
                                                                                title="Sessions"
                                                                                height="170px" 
                                                                            />   
                                                                                                                                                                                                     
                                                                        </td> 
                                                                    </tr>                                                                  
                                                                </table> 

                                                              </Container>                                                                 

                                                            </td>  
                                                            <td valign="top" style={{"width": "60%",  }}>
                                                                <Container
                                                                    header={
                                                                      <Header
                                                                        variant="h1"                      
                                                                      >
                                                                        Limitless Database shard group
                                                                      </Header>
                                                                    }
                                                                >
                                                                        <div style={{"padding": "1em"}}>
                                                                                <CustomTable02
                                                                                        columnsTable={columnsTableRoutersGlobal}
                                                                                        visibleContent={visibleContentRoutersGlobal}
                                                                                        dataset={clusterStats['cluster']['routers']}
                                                                                        title={"Distributed transaction routers"}
                                                                                        description={""}
                                                                                        pageSize={5}       
                                                                                        onSelectionItem={( item ) => {                                                                                               
                                                                                            currentNode.current['nodeId'] =  item[0]['indexId'];
                                                                                            currentNode.current['type'] =  'routers';                                                                                          
                                                                                            splitPanelIsShow.current = true;                                       
                                                                                            setsplitPanelShow(true);
                                                                                            
                                                                                          }
                                                                                        }                                                                     
                                                                                />                                                                                          
                                                                        </div>                                                  
                                                                    
                                                                      {/*----ROUTING LAYER */}
                                                                      <table style={{"width": "100%", "padding" : "0em" }}>
                                                                            <tr>  
                                                                                <td style={{"width": "40%", "padding-left": "1em", "padding-right": "1em", "text-align": "right"}}>
                                                                                        <CompMetric01 
                                                                                            value={clusterStats['cluster']?.['global']?.['shards']?.['tuplesWritten'] || 0}
                                                                                            title={"TuplesWritten/sec"}
                                                                                            precision={0}
                                                                                            format={3}
                                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                                            fontSizeValue={"24px"}
                                                                                        />
                                                                                </td>
                                                                                <td style={{"width": "10%", "padding-left": "2px", "padding-right": "0em", "text-align": "left", }} >
                                                                                        <Animation01 width = "60px"/>
                                                                                </td>
                                                                                <td style={{"width": "10%", "padding-left": "0em", "padding-right": "2px", "text-align": "right",  }}>
                                                                                        <Animation01 width = "60px" rotate="180deg" />
                                                                                </td>
                                                                                <td style={{"width": "40%", "padding-left": "1em", "padding-right": "1em", "text-align": "left"}}>
                                                                                        <CompMetric01 
                                                                                            value={clusterStats['cluster']?.['global']?.['shards']?.['tuplesRead'] || 0}
                                                                                            title={"TuplesRead/sec"}
                                                                                            precision={0}
                                                                                            format={3}
                                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                                            fontSizeValue={"24px"}
                                                                                        />
                                                                                </td>
                                                                            </tr>
                                                                        </table>

                                                                        {/**----- DATA SHARD LAYER */}
                                                                        <div style={{"padding": "1em"}}>
                                                                            <CustomTable02
                                                                                columnsTable={columnsTableRoutersGlobal}
                                                                                visibleContent={visibleContentRoutersGlobal}
                                                                                dataset={clusterStats['cluster']['shards']}
                                                                                title={"Data access shards"}
                                                                                description={""}
                                                                                pageSize={5}            
                                                                                onSelectionItem={( item ) => {                                                                                       
                                                                                    currentNode.current['nodeId'] =  item[0]['indexId'];
                                                                                    currentNode.current['type'] =  'shards';                                                                                          
                                                                                    splitPanelIsShow.current = true;                                       
                                                                                    setsplitPanelShow(true);
                                                                                    
                                                                                  }
                                                                                }                                                                                                                                     
                                                                            />                                                                                                                                      
                                                                        </div>
                                                                        
                                                                </Container>
                                                                        
                                                    
                                                            </td>
                                                        </tr>
                                                    </table> 
                                                   
                                                  </Container>
                                                </div>
                                                        
                                          
                                      },
                                      {
                                        label: "Performance Dashboard",
                                        id: "tab02",
                                        content: 
                                         
                                              <div style={{"padding": "1em"}}>
                                                        <Container
                                                                header={
                                                                    <Header
                                                                    variant="h3"                      
                                                                    >
                                                                    Capacity 
                                                                    </Header>
                                                                }
                                                        >
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>
                                                                        <td valign="top" style={{ "width":"20%", "padding": "1em", "text-align" : "center"}}>                                                                         
                                                                            <ChartRadialBar01                                                                  
                                                                                    height="250px" 
                                                                                    width="100%" 
                                                                                    title="ACUUsage"
                                                                                    series = {JSON.stringify( [ Math.trunc(shardMetrics['chartHistory']?.['DBShardGroupACUUtilization']?.[0]?.['data']?.[0]?.[1] || 0 ) ])}                                                                                
                                                                            />                                                                                                                                              
                                                                        </td>                                                                  
                                                                        <td valign="middle" style={{ "width":"40%", "padding": "1em", "text-align" : "center"}}>                                                                 
                                                                                <CompMetric01 
                                                                                        value={ Math.trunc(shardMetrics['chartHistory']?.['DBShardGroupACUUtilization']?.[0]?.['data']?.[0]?.[1] || 0 ) }
                                                                                        title={"ACUUsage(%)"}
                                                                                        precision={0}
                                                                                        format={3}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"30px"}
                                                                                        fontSizeTitle={"12px"}
                                                                                        postFix={"%"}
                                                                                />
                                                                                <ChartBar05 series={JSON.stringify(
                                                                                        shardMetrics['chartHistory']?.['DBShardGroupACUUtilization']
                                                                                        )} 
                                                                                        title=""
                                                                                        height="220px"                                                                                 
                                                                                        maximum={100}
                                                                                />      
                                                                                                                                                            
                                                                        </td>  
                                                                        <td valign="middle" style={{ "width":"40%", "padding": "1em", "text-align" : "center"}}> 
                                                                            <CompMetric01 
                                                                                    value={ shardMetrics['chartHistory']?.['DBShardGroupCapacity']?.[0]?.['data']?.[0]?.[1] || 0 }
                                                                                    title={"ACUUsed(Units)"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"30px"}
                                                                                    fontSizeTitle={"12px"}
                                                                            />                                                                
                                                                            <ChartBar05 series={JSON.stringify(
                                                                                        shardMetrics['chartHistory']?.['DBShardGroupCapacity']
                                                                                        )} 
                                                                                        title=""
                                                                                        height="220px"      
                                                                                        maximum={clusterStats['cluster']['maxACU']}                                                                           
                                                                                />      
                                                                                                                                                            
                                                                        </td>
                                                                        
                                                                                                                                    
                                                                    </tr>                                                                                                                        
                                                                </table>
                                                        </Container>
                                                        <br/> 
                                                        <br/> 
                                                        <Container
                                                                header={
                                                                    <Header
                                                                    variant="h3"                      
                                                                    >
                                                                    DBLoad
                                                                    </Header>
                                                                }
                                                        >
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>
                                                                        <td valign="top" style={{ "width":"40%", "padding": "1em", "text-align" : "center"}}>                                                                         
                                                                            <ChartPolar02
                                                                                    title={""} 
                                                                                    height="300px" 
                                                                                    width="100%" 
                                                                                    series = {JSON.stringify(shardMetrics['chartSummary']?.['DBLoad']?.['data'])}
                                                                                    labels = {JSON.stringify(shardMetrics['chartSummary']?.['DBLoad']?.['categories'])}
                                                                            />                                                                 
                                                                                
                                                                        </td>                                                                  
                                                                        <td valign="middle" style={{ "width":"60%", "padding": "1em", "text-align" : "center"}}>                                                                 
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "DBLoad" })}>
                                                                                    <CompMetric01 
                                                                                            value={ shardMetrics['tableSummary']?.['DBLoad'] || 0 }
                                                                                            title={"DBLoad(AAS)"}
                                                                                            precision={2}
                                                                                            format={1}
                                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                                            fontSizeValue={"30px"}
                                                                                            fontSizeTitle={"12px"}
                                                                                    />
                                                                                </a>
                                                                                <ChartBar01 series={JSON.stringify([
                                                                                        { 
                                                                                        name : "DBLoadCPU", 
                                                                                        data : shardMetrics['chartGlobal']?.['DBLoadCPU']
                                                                                        },
                                                                                        { 
                                                                                            name : "DBLoadNonCPU", 
                                                                                            data : shardMetrics['chartGlobal']?.['DBLoadNonCPU']
                                                                                        }
                                                                                    ])} 
                                                                                        title=""
                                                                                        height="220px"           
                                                                                        stacked={true}                                                                      
                                                                                />       
                                                                                
                                                                                                                                                            
                                                                        </td>                                                                         
                                                                                                                                    
                                                                    </tr>                                                                                                                        
                                                                </table>



                                                                <table style={{"width":"100%"}}>                                                               
                                                                    <tr>                                                                    
                                                                        <td valign="middle" style={{ "width":"12%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "DBLoadCPU" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['DBLoadCPU'] || 0 }
                                                                                    title={"DBLoadCPU"}
                                                                                    precision={2}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>                                                                      
                                                                        <td valign="middle" style={{ "width":"12%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "DBLoadNonCPU" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['DBLoadNonCPU'] || 0 }
                                                                                    title={"DBLoadNonCPU"}
                                                                                    precision={2}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>                                                                 
                                                                        <td valign="middle" style={{ "width":"12%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "DBLoadRelativeToNumVCPUs" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['DBLoadRelativeToNumVCPUs'] || 0 }
                                                                                    title={"DBLoadRelativeToNumVCPUs"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td> 
                                                                        <td valign="middle" style={{ "width":"64%", "padding": "1em"}}>                                                                            
                                                                        </td>                                                                         
                                                                    </tr>                                                            
                                                                </table>
                                                        </Container>
                                                        <br/>
                                                        <Container
                                                                header={
                                                                    <Header
                                                                    variant="h3"                      
                                                                    >
                                                                    Throughput
                                                                    </Header>
                                                                }
                                                        >
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>
                                                                        <td valign="top" style={{ "width":"40%", "padding": "1em", "text-align" : "center"}}>                                                                         
                                                                            <ChartPolar02
                                                                                    title={""} 
                                                                                    height="300px" 
                                                                                    width="100%" 
                                                                                    series = {JSON.stringify(shardMetrics['chartSummary']?.['CommitThroughput']?.['data'])}
                                                                                    labels = {JSON.stringify(shardMetrics['chartSummary']?.['CommitThroughput']?.['categories'])}
                                                                            />                                                                 
                                                                            
                                                                            
                                                                                
                                                                        </td>                                                                  
                                                                        <td valign="middle" style={{ "width":"60%", "padding": "1em", "text-align" : "center"}}>  
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "CommitThroughput" })}>                                                               
                                                                                    <CompMetric01 
                                                                                            value={ shardMetrics['tableSummary']?.['CommitThroughput'] || 0 }
                                                                                            title={"CommitThroughput(Count/sec)"}
                                                                                            precision={0}
                                                                                            format={3}
                                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                                            fontSizeValue={"30px"}
                                                                                            fontSizeTitle={"12px"}
                                                                                    />
                                                                                </a>
                                                                                <ChartBar01 series={JSON.stringify([{ 
                                                                                        name : "CommitThroughput", 
                                                                                        data : shardMetrics['chartGlobal']?.['CommitThroughput']
                                                                                        }])} 
                                                                                        title=""
                                                                                        height="220px"                                                                                 
                                                                                />                                                                                     
                                                                                                                                                            
                                                                        </td>  
                                                                    </tr>                                                                                                                        
                                                                </table>

                                                                <table style={{"width":"100%"}}>                                                                                                                           
                                                                    <tr>             
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "ReadIOPS" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['ReadIOPS'] || 0 }
                                                                                    title={"ReadIOPS"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>        
                                                                        </td>  
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "WriteIOPS" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['WriteIOPS'] || 0 }
                                                                                    title={"WriteIOPS"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>                                                        
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "ReadThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['ReadThroughput'] || 0 }
                                                                                    title={"ReadThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>                                                                      
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "WriteThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['WriteThroughput'] || 0 }
                                                                                    title={"WriteThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>                                                                 
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "NetworkThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['NetworkThroughput'] || 0 }
                                                                                    title={"NetworkThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td> 
                                                                        
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "NetworkTransmitThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['NetworkTransmitThroughput'] || 0 }
                                                                                    title={"NetworkTXThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "NetworkReceiveThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['NetworkReceiveThroughput'] || 0 }
                                                                                    title={"NetworkRXThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                        
                                                                            </a>                                              
                                                                        </td>  
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "StorageNetworkThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['StorageNetworkThroughput'] || 0 }
                                                                                    title={"StorageThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />
                                                                            </a>                                                                      
                                                                        </td>  
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "StorageNetworkTransmitThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['StorageNetworkTransmitThroughput'] || 0 }
                                                                                    title={"StorageTXThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>  
                                                                        <td valign="middle" style={{ "width":"10%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "StorageNetworkReceiveThroughput" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['StorageNetworkReceiveThroughput'] || 0 }
                                                                                    title={"StorageRXThroughput"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>    
                                                                        
                                                                    </tr>
                                                                </table>
                                                                
                                                        </Container>                                                        

                                                        <br/> 
                                                        <Container
                                                                header={
                                                                    <Header
                                                                    variant="h3"                      
                                                                    >
                                                                    Latency
                                                                    </Header>
                                                                }
                                                        >
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>
                                                                        <td valign="top" style={{ "width":"40%", "padding": "1em", "text-align" : "center"}}>                                                                         
                                                                            <ChartPolar02
                                                                                    title={""} 
                                                                                    height="300px" 
                                                                                    width="100%" 
                                                                                    series = {JSON.stringify(shardMetrics['chartSummary']?.['CommitLatency']?.['data'])}
                                                                                    labels = {JSON.stringify(shardMetrics['chartSummary']?.['CommitLatency']?.['categories'])}
                                                                                    
                                                                            />                                                                 
                                                                                
                                                                        </td>                                                                  
                                                                        <td valign="middle" style={{ "width":"60%", "padding": "1em", "text-align" : "center"}}>                                                                 
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "CommitLatency" })}>
                                                                                    <CompMetric01 
                                                                                            value={ shardMetrics['tableSummary']?.['CommitLatency'] || 0 }
                                                                                            title={"CommitLatency(ms)"}
                                                                                            precision={1}
                                                                                            format={1}
                                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                                            fontSizeValue={"30px"}
                                                                                            fontSizeTitle={"12px"}
                                                                                    />
                                                                                </a>
                                                                                <ChartBar01 series={JSON.stringify([{ 
                                                                                        name : "CommitLatency", 
                                                                                        data : shardMetrics['chartGlobal']?.['CommitLatency']
                                                                                        }])} 
                                                                                        title=""
                                                                                        height="220px"                                                                                 
                                                                                />       
                                                                                                                                                            
                                                                        </td>                                                                         
                                                                                                                                    
                                                                    </tr>                                                                                                                        
                                                                </table>



                                                                <table style={{"width":"100%"}}>                                                               
                                                                    <tr>                                                                    
                                                                        <td valign="middle" style={{ "width":"12%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "DBLoadCPU" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['ReadLatency'] || 0 }
                                                                                    title={"ReadLatency(ms)"}
                                                                                    precision={1}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>                                                                      
                                                                        <td valign="middle" style={{ "width":"12%", "padding": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "DBLoadNonCPU" })}>
                                                                                <CompMetric01 
                                                                                    value={ shardMetrics['tableSummary']?.['WriteLatency'] || 0 }
                                                                                    title={"WriteLatency(ms)"}
                                                                                    precision={1}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />                                                                      
                                                                            </a>
                                                                        </td>                                                                                                                                         
                                                                        <td valign="middle" style={{ "width":"76%", "padding": "1em"}}>                                                                            
                                                                        </td>                                                                         
                                                                    </tr>                                                            
                                                                </table>
                                                        </Container>                                                       
                                                       
                                                        <br/>
                                                        <Container>
                                                            <CustomTable02
                                                                columnsTable={columnsTable}
                                                                visibleContent={visibleContent}
                                                                dataset={shardMetrics['tableMetrics']}
                                                                title={"Routers/Shards"}
                                                                description={""}
                                                                pageSize={10}
                                                                extendedTableProperties = {
                                                                    { variant : "borderless" }
                                                                    
                                                                }
                                                            />                                                                     
                                                        </Container>                                                 
                                                                                                     
                                              </div> 
                                          
                                      },                                       
                                      {
                                        label: "Analytics Insight",
                                        id: "tab03",
                                        content: 
                                         
                                              <div style={{"padding": "1em"}}>
                                                    <div style={{"padding": "1em"}}>
                                                        <Container>
                                                            <table style={{"width":"100%"}}>
                                                                <tr>                                                                      
                                                                    <td valign="top" style={{ "width":"20%", "padding": "1em"}}>
                                                                        <FormField
                                                                            description="Select a metric to analyze the performance."
                                                                            label="Performance Metric"
                                                                            >
                                                                            
                                                                                <Select
                                                                                    selectedOption={selectedCloudWatchMetric}
                                                                                    onChange={({ detail }) => {
                                                                                            cloudwatchMetric.current = { type : detail.selectedOption.type, name : detail.selectedOption.value, descriptions : detail.selectedOption.descriptions, unit : detail.selectedOption.unit, format : detail.selectedOption.format  };
                                                                                            setSelectedCloudWatchMetric(detail.selectedOption);                                                                                            
                                                                                            gatherGlobalStats();
                                                                                    }
                                                                                    }
                                                                                    options={cloudwatchMetrics}
                                                                                    filteringType="auto"
                                                                                />
                                                                        </FormField>
                                                                    </td>
                                                                    <td valign="middle" style={{ "width":"15%","padding-left": "1em" }}>
                                                                            
                                                                        <FormField
                                                                        description="Period of time for analysis."
                                                                        label="Period"
                                                                        >
                                                                            
                                                                            <Select
                                                                            selectedOption={selectedOptionInterval}
                                                                            onChange={({ detail }) => {
                                                                                    optionInterval.current = detail.selectedOption.value;
                                                                                    setSelectedOptionInterval(detail.selectedOption);                                                                                    
                                                                                    gatherGlobalStats();
                                                                            }}
                                                                            options={[
                                                                                { label: "Last hour", value: 1 },
                                                                                { label: "Last 3 hours", value: 3 },
                                                                                { label: "Last 6 hours", value: 6 },
                                                                                { label: "Last 12 hours", value: 12 },
                                                                                { label: "Last 24 hours", value: 24 }
                                                                            ]}
                                                                            />
                                                                        
                                                                        </FormField>
                                                                            
                                                                    </td>
                                                                    <td valign="middle" style={{ "width":"15%","padding-left": "1em", "padding-right": "4em"}}>
                                                                        { cloudwatchMetric.current.type == "1" &&
                                                                            <FormField
                                                                            description="Resource type for analysis."
                                                                            label="Type"
                                                                            >
                                                                                
                                                                                <Select
                                                                                selectedOption={selectedOptionType}
                                                                                onChange={({ detail }) => {
                                                                                        optionType.current = detail.selectedOption.value;
                                                                                        setSelectedOptionType(detail.selectedOption);
                                                                                        gatherGlobalStats();
                                                                                }}
                                                                                options={[
                                                                                    { label: "Shards + Routers", value: "ALL" },
                                                                                    { label: "Shards", value: "DAS" },
                                                                                    { label: "Routers", value: "DTR" }                                                                                
                                                                                ]}
                                                                                />
                                                                            
                                                                            </FormField>
                                                                        }
                                                                            
                                                                    </td>
                                                                    <td style={{ "width":"50%","padding-left": "2em", "border-left": "4px solid " + configuration.colors.lines.separator100 }}>
                                                                            <Box variant="h4">{cloudwatchMetric.current.name} ({cloudwatchMetric.current.unit})</Box>
                                                                            <Box fontSize="body-s" color="text-body-secondary">{cloudwatchMetric.current.descriptions}</Box>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </Container>
                                                    </div>                                                    
                                                    <table style={{"width":"100%", "padding": "0em"}}>
                                                        <tr>                                                      
                                                            <td valign="top" style={{ "width":"35%","text-align": "center", "padding": "1em" }}>
                                                                <Container
                                                                        header={
                                                                            <Header
                                                                              variant="h2"                      
                                                                            >
                                                                              Current
                                                                            </Header>
                                                                          }
                                                                >
                                                                    
                                                                    <br/>   
                                                                    <div style={{ "text-align": "center" }}>
                                                                    
                                                                    <ChartPolar02 
                                                                        title={""} 
                                                                        height="350px" 
                                                                        width="100%" 
                                                                        series = {JSON.stringify(shardCloudwatchMetricAnalytics['currentState']?.['chart']?.['data'])}
                                                                        labels = {JSON.stringify(shardCloudwatchMetricAnalytics['currentState']?.['chart']?.['categories'])}
                                                                    />
                                                                    
                                                                    <br/>     
                                                                    <br/>  
                                                                    <CompMetric01 
                                                                        value={ shardCloudwatchMetricAnalytics['currentState']?.['value'] || 0 }
                                                                        title={ cloudwatchMetric.current.name + " (" +  cloudwatchMetric.current.unit + ")"}
                                                                        precision={0}
                                                                        format={cloudwatchMetric.current.format}
                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                        fontSizeValue={"30px"}
                                                                        fontSizeTitle={"12px"}
                                                                    />      
                                                                    <br/>                                           
                                                                    </div>                                                            
                                                                      
                                                                </Container>
                                                            </td>
                                                            <td valign="top" style={{ "width":"65%","text-align": "center", "padding": "1em" }}>
                                                                <Container
                                                                    header={
                                                                        <Header
                                                                        variant="h2"     
                                                                        actions={
                                                                            <Toggle
                                                                                onChange={({ detail }) =>
                                                                                    setStackedChart(detail.checked)
                                                                                }
                                                                                checked={stackedChart}
                                                                            >
                                                                                Stacked
                                                                            </Toggle>  
                                                                        }                 
                                                                        >
                                                                        Historical
                                                                        </Header>
                                                                    }
                                                                >
                                                                      
                                                                    <table style={{"width":"100%", "padding": "1em"}}>
                                                                        <tr>                                                      
                                                                            <td valign="top" style={{ "width":"20%","text-align": "center" }}>
                                                                                <CompMetric01 
                                                                                    value={ shardCloudwatchMetricAnalytics['summary']?.['average'] || 0 }
                                                                                    title={"Average"}
                                                                                    precision={2}
                                                                                    format={cloudwatchMetric.current.format}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"26px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />
                                                                            </td>                                                            
                                                                            <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                                                <CompMetric01 
                                                                                    value={ shardCloudwatchMetricAnalytics['summary']?.['max'] || 0 }
                                                                                    title={"Maximum"}
                                                                                    precision={2}
                                                                                    format={cloudwatchMetric.current.format}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"26px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />
                                                                            </td>
                                                                            
                                                                            <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                                                <CompMetric01 
                                                                                    value={ shardCloudwatchMetricAnalytics['summary']?.['min']|| 0 }
                                                                                    title={"Minimum"}
                                                                                    precision={2}
                                                                                    format={cloudwatchMetric.current.format}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"26px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />
                                                                            </td>         
                                                                            <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                                                <CompMetric01 
                                                                                    value={ shardCloudwatchMetricAnalytics['summary']?.['count'] || 0 }
                                                                                    title={"DataPoints"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"26px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />
                                                                            </td>                                                                                                               
                                                                            <td valign="top" style={{ "width":"20%","text-align": "center"}}>
                                                                                <CompMetric01 
                                                                                    value={ shardCloudwatchMetricAnalytics['summary']?.['total'] || 0 }
                                                                                    title={"Total"}
                                                                                    precision={0}
                                                                                    format={cloudwatchMetric.current.format}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"26px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />
                                                                            </td> 
                                                                        </tr>
                                                                    </table>
                                                                    <br/>
                                                                    <br/>
                                                                    <table style={{"width":"100%"}}>  
                                                                        <tr>                                                            
                                                                            <td valign="top" style={{"width": "100%", "padding-right": "2em"}}>    
                                                                                <ChartLine04 series={JSON.stringify(shardCloudwatchMetricAnalytics['charts'])}
                                                                                    title={cloudwatchMetric.current.name} 
                                                                                    height="350px" 
                                                                                    stacked={stackedChart}
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </Container>
                                                            </td>
                                                        </tr>
                                                    </table>                                                                                                            
                                              </div> 
                                          
                                      },
                                      {
                                        label: "Storage Usage",
                                        id: "tab04",
                                        content:                                          
                                              <div style={{"padding": "1em"}}>
                                                    <div style={{"padding": "1em"}}>
                                                        <Container
                                                            header={
                                                                    <Header
                                                                    variant="h2"                      
                                                                    >
                                                                    Storage summary
                                                                    </Header>
                                                          }
                                                        >
                                                            <br/>
                                                            <table style={{"width":"100%"}}>
                                                                <tr>                                                                     
                                                                   <td style={{ "width":"15%","padding-left": "2em", "border-left": "4px solid " + configuration.colors.lines.separator100 }}>
                                                                        <CompMetric01 
                                                                            value={ storageUsage['summary']?.['totalStorage'] || 0 }
                                                                            title={"Total Storage"}
                                                                            precision={2}
                                                                            format={2}
                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                            fontSizeValue={"28px"}
                                                                            fontSizeTitle={"12px"}
                                                                        />
                                                                    </td>
                                                                    <td style={{ "width":"15%","padding-left": "2em", "border-left": "4px solid " + configuration.colors.lines.separator100 }}>
                                                                        <CompMetric01 
                                                                            value={ storageUsage['summary']?.['shardStorage'] || 0 }
                                                                            title={"Shard Storage"}
                                                                            precision={2}
                                                                            format={2}
                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                            fontSizeValue={"28px"}
                                                                            fontSizeTitle={"12px"}
                                                                        />
                                                                    </td>
                                                                    <td style={{ "width":"15%","padding-left": "2em", "border-left": "4px solid " + configuration.colors.lines.separator100 }}>
                                                                        <CompMetric01 
                                                                            value={ storageUsage['summary']?.['routerStorage'] || 0 }
                                                                            title={"Router Storage"}
                                                                            precision={2}
                                                                            format={2}
                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                            fontSizeValue={"28px"}
                                                                            fontSizeTitle={"12px"}
                                                                        />
                                                                    </td>
                                                                    <td valign="middle" style={{ "width":"15%","padding-left": "1em", "padding-right": "4em"}}>                                                                            
                                                                       
                                                                            
                                                                    </td>                                                                            
                                                                </tr>
                                                            </table>
                                                        </Container>

                                                        <br/>
                                                        <Container                                                        
                                                            header={
                                                                <Header
                                                                variant="h2"                      
                                                                >
                                                                Storage analysis ({selectedOptionTypeStorage['label'] })
                                                                </Header>
                                                            }

                                                        >

                                                            <table style={{"width":"100%", "padding": "0em"}}>
                                                                <tr>                                                      
                                                                    <td valign="top" style={{ "width":"50%","text-align": "left", "padding": "1em" }}>
                                                                            <FormField
                                                                            description="Resource type for storage analysis."
                                                                            label="Resource type"
                                                                            >
                                                                                
                                                                                <Select
                                                                                selectedOption={selectedOptionTypeStorage}
                                                                                onChange={({ detail }) => {
                                                                                        optionTypeStorage.current = detail.selectedOption.value;
                                                                                        setSelectedOptionTypeStorage(detail.selectedOption);
                                                                                        gatherStorageUsage();
                                                                                }}
                                                                                options={[
                                                                                    { label: "Shards + Routers", value: "ALL" },
                                                                                    { label: "Shards", value: "shard" },
                                                                                    { label: "Routers", value: "router" },
                                                                                    { label: "Databases", value: "database" }                                                                                
                                                                                ]}
                                                                                />
                                                                            
                                                                            </FormField>
                                                                            <br/>
                                                                            <br/>
                                                                            <CustomTable02
                                                                                columnsTable={columnsStorageTable}
                                                                                visibleContent={visibleContentStorageTable}
                                                                                dataset={storageUsage['table']}
                                                                                title={"Resources"}
                                                                                description={""}
                                                                                pageSize={10}
                                                                                extendedTableProperties = {
                                                                                    { variant : "borderless" }
                                                                                    
                                                                                }
                                                                            />                                                                            
                                                                        
                                                                    </td>
                                                                    <td valign="top" style={{ "width":"50%","text-align": "left", "padding-left": "5em" }}>                                                                                                                                                        
                                                                        <Box variant="h3">Storage distribution</Box>
                                                                        <br/> 
                                                                        <div style={{ "text-align": "center" }}>                                                                            
                                                                            <ChartPolar02                                                                                     
                                                                                height="400px" 
                                                                                width="100%" 
                                                                                series = {JSON.stringify(storageUsage['chart']?.['series'])}
                                                                                labels = {JSON.stringify(storageUsage['chart']?.['categories'])}
                                                                            />                                                                               
                                                                                                                
                                                                        </div>                                                                                                                                                                                                               
                                                                    </td>
                                                                </tr>
                                                            </table>                                                          

                                                    </Container>    
                                                    </div>                                                    
                                                                                                                                                                
                                              </div> 
                                          
                                      },
                                      
                                      ]}
                        />
                        

        </>
        }
        
         />
         
    </div>
  );
}

export default App;
