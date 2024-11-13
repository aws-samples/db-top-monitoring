import { useState,useEffect,useRef } from 'react';
import Axios from 'axios';
import { configuration } from './Configs';
import { useSearchParams } from 'react-router-dom';
import CustomHeader from "../components/Header";
import AppLayout from "@cloudscape-design/components/app-layout";
import Box from "@cloudscape-design/components/box";
import Tabs from "@cloudscape-design/components/tabs";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import { SplitPanel } from '@cloudscape-design/components';

import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import Flashbar from "@cloudscape-design/components/flashbar";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Spinner from "@cloudscape-design/components/spinner";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import CompMetric01  from '../components/Metric01';
import ChartLine02  from '../components/ChartLine02';
import ChartColumn01 from '../components/ChartColumn01';
import Animation01 from '../components/Animation01';
import ChartLine04  from '../components/ChartLine04';
import AuroraLimitlessNode from '../components/CompAuroraLimitlessNode01';
import ChartBar01  from '../components/ChartBar01';
import ChartBar03  from '../components/ChartBar03';
import ChartPie01  from '../components/ChartPie-01';
import ChartRadialBar01  from '../components/ChartRadialBar01';


import { createLabelFunction, customFormatNumberLong, customFormatNumber, customFormatNumberShort } from '../components/Functions';
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
    
    //-- Connection Usage
    const [connectionMessage, setConnectionMessage] = useState([]);
    
    //-- Gather Parameters
    const [params]=useSearchParams();
    
    //--######## Global Settings
    
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
    const [splitPanelSize, setSplitPanelSize] = useState(400);
    var splitPanelIsShow = useRef(false);
    

    
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
                
    const metricCurrent = useRef({ nodeId : '', metricId : '', metricDescription : '', format : 3 } );
    const [clusterStatsDetails,setClusterStatsDetails] = useState({ value : 0, history : []});
    const [shardCloudwatchMetric,setShardCloudwatchMetric] = useState({ 
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
                                                                    });

    
    //--Cloudwatch Metrics
    const [selectedOptionInterval,setSelectedOptionInterval] = useState({label: "1 Hour",value: 1});
    const optionInterval = useRef(1);

    const [selectedOptionType,setSelectedOptionType] = useState({label: "All",value: "ALL"});
    const optionType = useRef("ALL");

    const cloudwatchMetrics = [
      {
        label: "DBShard Group Instance",
        options: [
                  { type : "1", label : "BufferCacheHitRatio", value : "BufferCacheHitRatio", descriptions : "The percentage of data and indexes served from an instance’s memory cache (as opposed to the storage volume).", unit : "Percentage" },
                  { type : "1", label : "CommitLatency", value : "CommitLatency", descriptions : "The average duration for the engine and storage to complete the commit operations for a particular node (router or shard).", unit : "ms" },
                  { type : "1", label : "CommitThroughput", value : "CommitThroughput", descriptions : "The average number of commit operations per second.", unit : "Count/sec" },
                  { type : "1", label : "MaximumUsedTransactionIDs", value : "MaximumUsedTransactionIDs", descriptions : "The age of the oldest unvacuumed transaction ID, in transactions. If this value reaches 2,146,483,648 (2^31 - 1,000,000), the database is forced into read-only mode, to avoid transaction ID wraparound.", unit : "Count" },
                  { type : "1", label : "NetworkReceiveThroughput", value : "NetworkReceiveThroughput", descriptions : "The amount of network throughput received from clients by each instance in the DB shard group. This throughput doesn't include network traffic between instances in the DB shard group and the cluster volume", unit : "Bytes/sec" },
                  { type : "1", label : "NetworkThroughput", value : "NetworkThroughput", descriptions : "The aggregated network throughput (both transmitted and received) between clients and routers, and routers and shards in the DB shard group. This throughput doesn't include network traffic between instances in the DB shard group and the cluster volume.", unit : "Bytes/sec" },
                  { type : "1", label : "NetworkTransmitThroughput", value : "NetworkTransmitThroughput", descriptions : "The amount of network throughput sent to clients by each instance in the DB shard group. This throughput doesn't include network traffic between instances in the DB shard group and the cluster volume.", unit : "COUNT" },
                  { type : "1", label : "ReadIOPS", value : "ReadIOPS", descriptions : " The average number of disk read input/output operations per second (IOPS).", unit : "Count/sec" },
                  { type : "1", label : "ReadLatency", value : "ReadLatency", descriptions : " The average amount time taken per disk read input/output (I/O) operation.", unit : "ms" },
                  { type : "1", label : "ReadThroughput", value : "ReadThroughput", descriptions : "The average number of bytes read from disk per second.", unit : "Bytes/sec" },
                  { type : "1", label : "StorageNetworkReceiveThroughput", value : "StorageNetworkReceiveThroughput", descriptions : "The amount of network throughput received from the Aurora storage subsystem by each instance in the DB shard group.", unit : "Bytes/sec" },
                  { type : "1", label : "StorageNetworkThroughput", value : "StorageNetworkThroughput", descriptions : "The aggregated network throughput both transmitted to and received from the Aurora storage subsystem by each instance in the DB shard group.", unit : "Bytes/sec" },
                  { type : "1", label : "StorageNetworkTransmitThroughput", value : "StorageNetworkTransmitThroughput", descriptions : "The amount of network throughput sent to the Aurora storage subsystem by each instance in the DB shard group.", unit : "Bytes/sec" },
                  { type : "1", label : "TempStorageIOPS", value : "TempStorageIOPS", descriptions : "The average number of I/O operations performed on local storage attached to the DB instance. It includes both read and write I/O operations.", unit : "Count/sec" },
                  { type : "1", label : "TempStorageThroughput", value : "TempStorageThroughput", descriptions : "The amount of data transferred to and from local storage associated with either a router or a shard.", unit : "Bytes/sec" },
                  { type : "1", label : "WriteIOPS", value : "WriteIOPS", descriptions : "The average number of disk write IOPS.", unit : "Count/sec" },
                  { type : "1", label : "WriteLatency", value : "WriteLatency", descriptions : " The average amount time taken per disk write I/O operation.", unit : "ms" },
                  { type : "1", label : "WriteThroughput", value : "WriteThroughput", descriptions : "The average number of bytes written to disk per second.", unit : "Bytes/sec" },                  
        ]
      },
      {
        label: "DBShard Group",
        options: [
                  { type : "2", label : "DBShardGroupACUUtilization", value : "DBShardGroupACUUtilization", descriptions : "Aurora capacity unit (ACU) usage as a percentage calculated from DBShardGroupCapacity divided by DBShardGroupMaxACU.", unit : "Percentage" },
                  { type : "2", label : "DBShardGroupCapacity", value : "DBShardGroupCapacity", descriptions : "Number of ACUs consumed by the DB shard group.The average duration for the engine and storage to complete the commit operations for a particular node (router or shard).", unit : "Count" },
                  { type : "2", label : "DBShardGroupMaxACU", value : "DBShardGroupMaxACU", descriptions : "Maximum number of ACUs configured for the DB shard group.", unit : "Count" },
                  { type : "2", label : "DBShardGroupMinACU", value : "DBShardGroupMinACU", descriptions : "Minimum number of ACUs required by the DB shard group.", unit : "Count" },
        ]
      }
    ];
  
    const [selectedCloudWatchMetric,setSelectedCloudWatchMetric] = useState({
                                                      label: "CommitThroughput",
                                                      value: "CommitThroughput"
    });
    const cloudwatchMetric = useRef({ type : "1", name : "CommitThroughput", descriptions : "The average number of commit operations per second.", unit : "Count/sec" });
    var metricName = useRef("");


    //-- Table Shard
    const columnsTable =  [
        {id: 'resource',header: 'Name',cell: item => item['resource'],ariaLabel: createLabelFunction('resource'),sortingField: 'resource',},
        {id: 'type',header: 'Type',cell: item => item['type'],ariaLabel: createLabelFunction('type'),sortingField: 'type',},
        {id: 'BufferCacheHitRatio',header: 'BufferCacheHitRatio',cell: item => item['BufferCacheHitRatio'],ariaLabel: createLabelFunction('BufferCacheHitRatio'),sortingField: 'BufferCacheHitRatio',},
        {id: 'CommitLatency',header: 'CommitLatency',cell: item => customFormatNumberShort(parseFloat(item['CommitLatency']),0),ariaLabel: createLabelFunction('CommitLatency'),sortingField: 'CommitLatency',},
        {id: 'CommitThroughput',header: 'CommitThroughput',cell: item => customFormatNumberShort(parseFloat(item['CommitThroughput']),0) ,ariaLabel: createLabelFunction('CommitThroughput'),sortingField: 'CommitThroughput',},
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

    const visibleContent = ['resource', 'type', 'CommitThroughput', 'ReadIOPS', 'WriteIOPS', 'NetworkThroughput', 'ReadThroughput', 'StorageNetworkThroughput', 'WriteThroughput'];
    const [shardMetrics,setShardMetrics] = useState({ 
                                                        tableMetrics : [] , 
                                                        tableSummary : {}, 
                                                        chartSummary : { categories : [], data : [] },
                                                        chartHistory : { CommitThroughput : [], DBShardGroupACUUtilization : [], DBShardGroupCapacity : []  }
                                                    });



    //-- Function Open connection
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
        
        if ( currentTabId.current == "tab01" || currentTabId.current == "tab02" || currentTabId.current == "tab03" ) {
        
        
                var api_url = configuration["apps-settings"]["api_url"];
                
                Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/gather/stats/`,{
                              params: { connectionId : cnf_connection_id, 
                                        clusterId : cnf_identifier,     
                                        engineType : cnf_engine                              
                              }
                          }).then((data)=>{
                           
                           var info = data.data.cluster;
                           setClusterStats({ cluster : {...info} });
                             
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/gather/stats/' );
                          console.log(err);
                          
                      });
              
        }
        
    }


    //-- Function Gather Metric Details
    async function gatherClusterStatsDetails() {
        
      if ( currentTabId.current == "tab01" && splitPanelIsShow.current === true ) {
      
              
              var api_url = configuration["apps-settings"]["api_url"];
              
              Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/gather/stats/details`,{
                            params: { connectionId : cnf_connection_id, 
                                      clusterId : cnf_identifier, 
                                      engineType : cnf_engine,                   
                                      metricId :  metricCurrent.current['metricId']
                            }
                        }).then((data)=>{                         
                        setClusterStatsDetails({ ...data.data });                        
                    })
                    .catch((err) => {
                        console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/gather/stats/details' );
                        console.log(err);
                        
                    });
            
        }
    }



    //-- Function Gather Cloudwatch Shard Metrics 
    async function gatherCloudwatchShardMetrics() {
 
      if ( currentTabId.current == "tab03" ) {
              var api_url = configuration["apps-settings"]["api_url"];
              
              Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics`,{
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
                        setShardCloudwatchMetric({... data.data });                                            
                    })
                    .catch((err) => {
                        console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics' );
                        console.log(err);                        
                    });     
      
      }      
        
    }


    //-- Function Gather Cloudwatch Metrics Table
    async function gatherCloudwatchMetricsTable() {
 
        if ( currentTabId.current == "tab02" ) {
                var api_url = configuration["apps-settings"]["api_url"];
                
                Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics/table`,{
                              params: { connectionId : cnf_connection_id, 
                                        clusterId : cnf_identifier, 
                                        engineType : cnf_engine,                                                           
                              }
                          }).then((data)=>{     
                            setShardMetrics({... data.data });                                              
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics/table' );
                          console.log(err);                        
                      });     
        
        }      
          
    }


    //-- Function Gather Cloudwatch Shard Metrics 
    async function gatherCloudwatchDashboardDetails() {
 
        if ( currentTabId.current == "tab02" && splitPanelIsShow.current === true ) {
                var api_url = configuration["apps-settings"]["api_url"];
                
                Axios.get(`${api_url}/api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics`,{
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
                          setShardCloudwatchMetric({... data.data });                                            
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/aurora/cluster/postgresql/limitless/shard/gather/cloudwatch/metrics' );
                          console.log(err);                        
                      });     
        
        }      
          
      }
  


    //-- Gather all stats
    function gatherGlobalStats(){
        gatherClusterStats();
        gatherClusterStatsDetails();
        gatherCloudwatchShardMetrics();
        gatherCloudwatchMetricsTable();
        gatherCloudwatchDashboardDetails();
    }


    function onClickMetric(object){

        metricName.current = object.metricName;
        splitPanelIsShow.current = true;
        setsplitPanelShow(true);
        gatherCloudwatchDashboardDetails();        

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
                  >
                        { splitPanelIsShow.current === true && currentTabId.current == "tab01" &&
                          
                          
                          <table style={{"width":"100%"}}>
                              <tr>
                                  <td valign="middle" style={{"width": "20%",  "padding-right": "2em" }}>                                                         
                                      <CompMetric01 
                                          value={clusterStatsDetails['value'] || 0}
                                          title={metricCurrent.current['metricDescription']}
                                          precision={0}
                                          format={metricCurrent.current['format']}
                                          fontColorValue={configuration.colors.fonts.metric100}
                                          fontSizeValue={"36px"}
                                      />                                                                            
                                  </td> 
                                  <td valign="middle" style={{"width": "80%",  "padding-right": "2em" }}>                                                         
                                        <ChartLine02 series={JSON.stringify(clusterStatsDetails['history'])} 
                                            title={metricCurrent.current['metricDescription']}
                                            height="230px" 
                                        />                                                                            
                                  </td> 
                              </tr>
                          </table>                    
                        }

                        { splitPanelIsShow.current === true && currentTabId.current == "tab02" &&

                            <div>                                                                                      
                                <table style={{"width":"100%"}}>  
                                    <tr>                                                            
                                        <td valign="top" style={{"width": "20%" }}>    
                                            <ChartPie01 
                                                        height="280px" 
                                                        width="100%" 
                                                        series = {shardCloudwatchMetric['values']}
                                                        labels = {shardCloudwatchMetric['labels']}
                                                        onClickEvent={() => {}}
                                            />
                                        </td>
                                        <td valign="top" style={{"width": "80%", "padding-right": "2em"}}>    
                                            <ChartLine04 series={JSON.stringify(shardCloudwatchMetric['charts'])}
                                                title={metricName.current} 
                                                height="280px" 
                                            />
                                        </td>
                                    </tr>
                                </table>
                                <br/>
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
                            </div>                                                      

                        }

                  </SplitPanel>
        }
        content={
            <>              
                            <Flashbar items={connectionMessage} />
                            <table style={{"width":"100%"}}>
                                <tr>  
                                    <td style={{"width":"40%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                                        <SpaceBetween direction="horizontal" size="xs">
                                            { clusterStats['cluster']['status'] != 'available' &&
                                                <Spinner size="big" />
                                            }
                                            <Box variant="h3" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
                                        </SpaceBetween>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <StatusIndicator type={clusterStats['cluster']['status'] === 'available' ? 'success' : 'pending'}> {clusterStats['cluster']['status']} </StatusIndicator>
                                        <Box variant="awsui-key-label">Status</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['shardId']}</div>
                                        <Box variant="awsui-key-label">ShardIdentifier</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']?.['metrics']?.['vcpu'] || 0}</div>
                                        <Box variant="awsui-key-label">vCPU</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['minACU']}</div>
                                        <Box variant="awsui-key-label">MinACU</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['maxACU']}</div>
                                        <Box variant="awsui-key-label">MaxACU</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['lastUpdate']}</div>
                                        <Box variant="awsui-key-label">LastUpdate</Box>
                                    </td>
                                    
                                </tr>
                            </table>
                            
                            <Tabs
                                    disableContentPaddings
                                    onChange={({ detail }) => {
                                          setActiveTabId(detail.activeTabId);
                                          currentTabId.current=detail.activeTabId;
                                          setsplitPanelShow(false);
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

                                                <Container
                                                  header={
                                                    <Header variant="h1">
                                                        Aurora Cluster
                                                    </Header>
                                                  }
                                                >                                        
                                                 
                                                  <table style={{"width":"100%", "padding": "0em"}}>
                                                        <tr>
                                                            <td valign="top" style={{"width": "30%",  "padding-right": "3em" }}>    
                                                              <Container> 
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>
                                                                        <td valign="middle" colspan="2" style={{"width": "100%",  "padding-right": "2em", "padding-left": "2em", "text-align" : "center" }}> 
                                                                            <ChartPie01 
                                                                                height="350px" 
                                                                                width="100%" 
                                                                                series = {clusterStats['cluster']?.['chartSummary']?.['data']}
                                                                                labels = {clusterStats['cluster']?.['chartSummary']?.['categories']}
                                                                                onClickEvent={() => {}}
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
                                                                                title="CommitThroughput"
                                                                                height="170px"                                                                                 
                                                                            />                                                                                                                                                                                                    
                                                                        </td> 
                                                                    </tr>                       
                                                                </table>                       
                                                            </Container> 
                                                            <br/>
                                                            <Container> 
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
                                                            <td valign="top" style={{"width": "70%",  }}>
                                                                <Container
                                                                    header={
                                                                      <Header
                                                                        variant="h1"                      
                                                                      >
                                                                        Limitless Database shard group
                                                                      </Header>
                                                                    }
                                                                >
                                                                      <div style={{"padding": "2em"}}>
                                                                      <Container
                                                                            header={
                                                                              <Header
                                                                                variant="h2"                      
                                                                              >
                                                                                Distributed transaction routers
                                                                              </Header>
                                                                            }
                                                                        >                   
                                                                                        <table style={{"width": "100%"}}>                                                                                     
                                                                                            <tr>
                                                                                                <td valign="top" style={{"width": "100%", "padding-left": "1em"   }}>
                                                                                                  <ColumnLayout columns={3}>
                                                                                                      {clusterStats['cluster']['routers'].map((item,key) => (                                                                                                  
                                                                                                        <AuroraLimitlessNode                                                                                           
                                                                                                            node = {item}                                                                                                            
                                                                                                            onClickMetric={(detail) => {                                                                                                               
                                                                                                                  metricCurrent.current = detail;
                                                                                                                  splitPanelIsShow.current = true;
                                                                                                                  setsplitPanelShow(true);                                                                                                                                                                                                                                    
                                                                                                                  gatherClusterStatsDetails();
                                                                                                              }
                                                                                                            }
                                                                                                        />
                                                                                                        ))}                                                                                               
                                                                                                  </ColumnLayout>
                                                                                                  <br/>
                                                                                                </td>                                                                                                
                                                                                            </tr>
                                                                                        </table>
                                                                            
                                                                    </Container>
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
                                                                        <div style={{"padding": "2em"}}>
                                                                            <Container
                                                                                header={
                                                                                  <Header
                                                                                    variant="h2"                      
                                                                                  >
                                                                                    Data access shards
                                                                                  </Header>
                                                                                }
                                                                            > 
                                                                                          <table style={{"width": "100%"}}>
                                                                                              <tr>
                                                                                                  <td colspan="2" style={{"width": "100%", "text-align": "center" }}>
                                                                                                  </td>
                                                                                              </tr>
                                                                                              
                                                                                              <tr>
                                                                                              <td valign="top" style={{"width": "100%",  }}>
                                                                                                    <ColumnLayout columns={3}>
                                                                                                        {clusterStats['cluster']['shards'].map((item,key) => (                                                                                                  
                                                                                                          <AuroraLimitlessNode                                                                                           
                                                                                                              node = {item}
                                                                                                              onClickMetric={(detail) => {                                                                                                               
                                                                                                                metricCurrent.current = detail;
                                                                                                                splitPanelIsShow.current = true;
                                                                                                                setsplitPanelShow(true);                                                                                                                                                                                                                                    
                                                                                                                gatherClusterStatsDetails();
                                                                                                                }
                                                                                                              }
                                                                                                          />
                                                                                                          ))}                                                                                               
                                                                                                    </ColumnLayout>
                                                                                                    <br/>
                                                                                                  </td>              
                                                                                                  
                                                                                              </tr>
                                                                                          </table>
                                                                        
                                                                        </Container>
                                                                
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
                                                        <Container>

                                                        <table style={{"width":"100%"}}>
                                                            <tr>
                                                                <td valign="top" style={{ "width":"15%", "padding": "1em", "text-align" : "center"}}>                                                                         
                                                                        <ChartRadialBar01                                                                  
                                                                                height="250px" 
                                                                                width="100%" 
                                                                                title="ACUUsage"
                                                                                series = {JSON.stringify( [ Math.trunc(shardMetrics['chartHistory']?.['DBShardGroupACUUtilization']?.[0]?.['data']?.[0]?.[1] || 0 ) ])}                                                                                
                                                                        />       
                                                                        
                                                                </td>
                                                                <td valign="middle" style={{ "width":"10%", "padding": "0em", "text-align" : "right"}}>                                                                 
                                                                        <CompMetric01 
                                                                                value={ shardMetrics['chartHistory']?.['DBShardGroupACUUtilization']?.[0]?.['data']?.[0]?.[1] || 0 }
                                                                                title={"DBShardGroupACUUtilization"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"38px"}
                                                                                fontSizeTitle={"12px"}
                                                                        />                                                                                                                                                             
                                                                </td>   
                                                                <td valign="middle" style={{ "width":"32%", "padding": "1em", "text-align" : "center"}}>                                                                 
                                                                                <ChartBar01 series={JSON.stringify(
                                                                                        shardMetrics['chartHistory']?.['DBShardGroupACUUtilization']
                                                                                        )} 
                                                                                        title="DBShardGroupACUUtilization"
                                                                                        height="220px"                                                                                 
                                                                                />                                                                                                                                                            
                                                                </td>   
                                                                <td valign="middle" style={{ "width":"10%", "padding": "0em", "text-align" : "right"}}>                                                                 
                                                                        <CompMetric01 
                                                                                value={ shardMetrics['chartHistory']?.['DBShardGroupCapacity']?.[0]?.['data']?.[0]?.[1] || 0 }
                                                                                title={"DBShardGroupCapacity"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"38px"}
                                                                                fontSizeTitle={"12px"}
                                                                        />                                                                                                                                                             
                                                                </td>   
                                                                <td valign="middle" style={{ "width":"32%", "padding": "1em", "text-align" : "center"}}>                                                                 
                                                                                <ChartBar01 series={JSON.stringify(
                                                                                        shardMetrics['chartHistory']?.['DBShardGroupCapacity']
                                                                                        )} 
                                                                                        title="DBShardGroupCapacity"
                                                                                        height="220px"                                                                                 
                                                                                />       
                                                                                                                                                    
                                                                </td>  
                                                                
                                                                                                                             
                                                            </tr>                                                            
                                                        </table>

                                                        <table style={{"width":"100%"}}>
                                                            <tr>                            
                                                                <td valign="middle" style={{ "width":"15%", "padding": "1em", "text-align" : "center"}}>      
                                                                    <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric({ metricName : "CommitThroughput" })}>
                                                                        <CompMetric01 
                                                                            value={ shardMetrics['tableSummary']?.['CommitThroughput'] || 0 }
                                                                            title={"CommitThroughput"}
                                                                            precision={0}
                                                                            format={3}
                                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                                            fontSizeValue={"38px"}
                                                                            fontSizeTitle={"12px"}
                                                                        />                                                                          
                                                                    </a>
                                                                </td>                                      
                                                                <td valign="middle" style={{ "width":"85%", "padding": "1em", "text-align" : "center"}}>                                                                 
                                                                    <ChartLine04 series={JSON.stringify(shardMetrics['chartHistory']?.['CommitThroughput'])}
                                                                        title={"CommitThroughput"} 
                                                                        height="250px" 
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
                                                                            title={"NetworkTransmitThroughput"}
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
                                                                            title={"NetworkReceiveThroughput"}
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
                                                                            title={"StorageTransmitThroughput"}
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
                                                                            title={"StorageReceiveThroughput"}
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
                                                        <Container>
                                                            <table style={{"width":"100%"}}>
                                                                <tr>                                                                      
                                                                    <td valign="top" style={{ "width":"100%", "padding": "1em"}}>   
                                                                        <CustomTable02
                                                                            columnsTable={columnsTable}
                                                                            visibleContent={visibleContent}
                                                                            dataset={shardMetrics['tableMetrics']}
                                                                            title={"Resources"}
                                                                            description={""}
                                                                            pageSize={10}
                                                                            extendedTableProperties = {
                                                                                { variant : "borderless" }
                                                                                
                                                                            }
                                                                        />             
                                                                                                                              
                                                                    </td>                                                                    
                                                                </tr>
                                                            </table>
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
                                                                                            cloudwatchMetric.current = { type : detail.selectedOption.type, name : detail.selectedOption.value, descriptions : detail.selectedOption.descriptions, unit : detail.selectedOption.unit };
                                                                                            setSelectedCloudWatchMetric(detail.selectedOption);
                                                                                            gatherCloudwatchShardMetrics();
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
                                                                                    gatherCloudwatchShardMetrics();
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
                                                                            
                                                                        <FormField
                                                                        description="Resource type for analysis."
                                                                        label="Type"
                                                                        >
                                                                            
                                                                            <Select
                                                                            selectedOption={selectedOptionType}
                                                                            onChange={({ detail }) => {
                                                                                    optionType.current = detail.selectedOption.value;
                                                                                    setSelectedOptionType(detail.selectedOption);
                                                                                    gatherCloudwatchShardMetrics();
                                                                            }}
                                                                            options={[
                                                                                { label: "Shards + Routers", value: "ALL" },
                                                                                { label: "Shards", value: "DAS" },
                                                                                { label: "Routers", value: "DTR" }                                                                                
                                                                            ]}
                                                                            />
                                                                        
                                                                        </FormField>
                                                                            
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
                                                            <td valign="top" style={{ "width":"25%","text-align": "center", "padding": "1em" }}>
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
                                                                    <CompMetric01 
                                                                        value={ shardCloudwatchMetric['currentState']?.['value'] || 0 }
                                                                        title={ cloudwatchMetric.current.name + " (" +  cloudwatchMetric.current.unit + ")"}
                                                                        precision={0}
                                                                        format={3}
                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                        fontSizeValue={"30px"}
                                                                        fontSizeTitle={"12px"}
                                                                    />  
                                                                    <br/>                                                                    
                                                                    <ChartColumn01 
                                                                        series = {{ 
                                                                                data : shardCloudwatchMetric['currentState']?.['chart']?.['data'], 
                                                                                categories : shardCloudwatchMetric['currentState']?.['chart']?.['categories']
                                                                            }}     
                                                                        height="435px"                                                               
                                                                    />  
                                                                    </div>                                                            
                                                                      
                                                                </Container>
                                                            </td>
                                                            <td valign="top" style={{ "width":"75%","text-align": "center", "padding": "1em" }}>
                                                                <Container
                                                                    header={
                                                                        <Header
                                                                        variant="h2"                      
                                                                        >
                                                                        Historical
                                                                        </Header>
                                                                    }
                                                                >
                                                                      
                                                                    <table style={{"width":"100%", "padding": "1em"}}>
                                                                        <tr>                                                      
                                                                            <td valign="top" style={{ "width":"20%","text-align": "center" }}>
                                                                                <CompMetric01 
                                                                                    value={ shardCloudwatchMetric['summary']?.['average'] || 0 }
                                                                                    title={"Average"}
                                                                                    precision={2}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"30px"}
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
                                                                                    fontSizeValue={"30px"}
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
                                                                                    fontSizeValue={"30px"}
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
                                                                                    fontSizeValue={"30px"}
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
                                                                                    fontSizeValue={"30px"}
                                                                                    fontSizeTitle={"12px"}
                                                                                />
                                                                            </td> 
                                                                        </tr>
                                                                    </table>
                                                                    <br/>
                                                                    <br/>
                                                                    <table style={{"width":"100%"}}>  
                                                                        <tr>                                                            
                                                                            <td valign="top" style={{"width": "20%" }}>    
                                                                                <ChartPie01 
                                                                                            height="450px" 
                                                                                            width="100%" 
                                                                                            series = {shardCloudwatchMetric['values']}
                                                                                            labels = {shardCloudwatchMetric['labels']}
                                                                                            onClickEvent={() => {}}
                                                                                />
                                                                            </td>
                                                                            <td valign="top" style={{"width": "80%", "padding-right": "2em"}}>    
                                                                                <ChartLine04 series={JSON.stringify(shardCloudwatchMetric['charts'])}
                                                                                    title={cloudwatchMetric.current.name} 
                                                                                    height="400px" 
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
                                      
                                      ]}
                        />
                        

        </>
        }
        
         />
         
    </div>
  );
}

export default App;
