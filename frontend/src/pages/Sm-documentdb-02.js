import { useState,useEffect,useRef } from 'react';
import Axios from 'axios';
import { configuration } from './Configs';
import { useSearchParams } from 'react-router-dom';
import CustomHeader from "../components/Header";
import Box from "@cloudscape-design/components/box";
import Tabs from "@cloudscape-design/components/tabs";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import { SplitPanel } from '@cloudscape-design/components';
import AppLayout from "@cloudscape-design/components/app-layout";

import { createLabelFunction, customFormatNumberLong, customFormatNumber } from '../components/Functions';
import CustomTable02 from "../components/Table02";

import Flashbar from "@cloudscape-design/components/flashbar";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Spinner from "@cloudscape-design/components/spinner";
import Button from "@cloudscape-design/components/button";

import FormField from "@cloudscape-design/components/form-field";
import TokenGroup from "@cloudscape-design/components/token-group";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Pagination from "@cloudscape-design/components/pagination";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import CompMetric01  from '../components/Metric01';
import ChartLine02  from '../components/ChartLine02';
import ChartLine03  from '../components/ChartLine03';
import CLWChart  from '../components/ChartCLW03';
import ChartColumn01 from '../components/ChartColumn01';
import ChartProgressBar01 from '../components/ChartProgressBar-01';
import ChartPolar01 from '../components/ChartPolar-01';

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
    
    
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [splitPanelSize, setSplitPanelSize] = useState(400);
    var comparativeMode = useRef("single");
    
    //-- Variable for Active Tabs
    const [activeTabId, setActiveTabId] = useState("tab01");
    const currentTabId = useRef("tab01");
    
    
    const parameter_code_id=params.get("code_id");  
    const parameter_id=params.get("session_id");  
    var parameter_object_bytes = CryptoJS.AES.decrypt(parameter_id, parameter_code_id);
    var parameter_object_values = JSON.parse(parameter_object_bytes.toString(CryptoJS.enc.Utf8));
    
    //-- Configuration variables
    const cnf_connection_id=parameter_object_values["session_id"];  
    const cnf_identifier=parameter_object_values["rds_id"];  
    const cnf_engine=parameter_object_values["rds_engine"];
    const cnf_resource_id=parameter_object_values["rds_resource_id"];
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
    
    
    //-- Variable for Paging
    const [currentPageIndex,setCurrentPageIndex] = useState(1);
    var pageId = useRef(1);
    var itemsPerPage = configuration["apps-settings"]["items-per-page-documentdb"];
    var totalPages = Math.trunc( parameter_object_values['rds_nodes'] / itemsPerPage) + (  parameter_object_values['rds_nodes'] % itemsPerPage != 0 ? 1 : 0 ) 
    
  
    //-- Variable for Shard Analytics
    const [shardAnalytics,setShardAnalytics] = useState({ series : [], labels : [], max :  0, min : 0, avg : 0, count : 0 });
    const [selectedMetricAnalytics,setSelectedMetricAnalytics] = useState({
                                                                            label: "PrimaryInstanceCPUUtilization",
                                                                            value: "PrimaryInstanceCPUUtilization"
    });
    const analyticsMetricName = useRef("PrimaryInstanceCPUUtilization");
    const analyticsMetrics = [
                                { label : 'BufferCacheHitRatio', value : 'BufferCacheHitRatio' },
                                { label : 'DBInstanceReplicaLag', value : 'DBInstanceReplicaLag' },
                                { label : 'DatabaseCursorsMax', value : 'DatabaseCursorsMax' },
                                { label : 'DatabaseCursorsTimedOut', value : 'DatabaseCursorsTimedOut' },
                                { label : 'DatabaseCursorsTimedOut', value : 'DatabaseCursorsTimedOut' },
                                { label : 'DocumentsDeleted', value : 'DocumentsDeleted' },
                                { label : 'DocumentsInserted', value : 'DocumentsInserted' },
                                { label : 'DocumentsReturned', value : 'DocumentsReturned' },
                                { label : 'DocumentsUpdated', value : 'DocumentsUpdated' },
                                { label : 'PrimaryInstanceCPUUtilization', value : 'PrimaryInstanceCPUUtilization' },
                                { label : 'PrimaryInstanceFreeableMemory', value : 'PrimaryInstanceFreeableMemory' },
                                { label : 'ReadThroughput', value : 'ReadThroughput' },
                                { label : 'ReplicaInstanceCPUUtilization', value : 'ReplicaInstanceCPUUtilization' },
                                { label : 'ReplicaInstanceFreeableMemory', value : 'ReplicaInstanceFreeableMemory' },
                                { label : 'TTLDeletedDocuments', value : 'TTLDeletedDocuments' },
                                { label : 'VolumeBytesUsed', value : 'VolumeBytesUsed' },
                                { label : 'VolumeReadIOPs', value : 'VolumeReadIOPs' },
                                { label : 'VolumeWriteIOPs', value : 'VolumeWriteIOPs' },
                                { label : 'WriteThroughput',  value : 'WriteThroughput' },
                            ];
    
    const [shardItemsSelected, setShardItemsSelected] = useState([]);
    const shardItemsSelectedList = useRef([]);
    const shardItemsSelectedData = useRef([]);
  
    //-- Variable for Comparative Mode
    const [selectedMetricComparation,setSelectedMetricComparation] = useState({label: "OpsTotalCount",value: "OpsTotalCount"});
    const metricNameComparation = useRef({ name : "OpsTotalCount", descriptions : "OpsTotalCount", unit : "Count/sec" });
    

    const metricsComparation = [
                                {
                                  label: "Shard metrics",
                                  options: [
                                            { label : "PrimaryInstanceCPUUtilization", value : "PrimaryInstanceCPUUtilization", factor : 60, descriptions : "PrimaryInstanceCPUUtilization", unit : "Percentage" },
                                            { label : "PrimaryInstanceFreeableMemory", value : "PrimaryInstanceFreeableMemory", factor : 60, descriptions : "PrimaryInstanceFreeableMemory", unit : "Bytes" },
                                            { label : "ReadThroughput", value : "ReadThroughput", factor : 60, descriptions : "ReadThroughput", unit : "Bytes" },
                                            { label : "ReplicaInstanceCPUUtilization", value : "ReplicaInstanceCPUUtilization", factor : 60, descriptions : "ReplicaInstanceCPUUtilization", unit : "Percentage" },
                                            { label : "ReplicaInstanceFreeableMemory", value : "ReplicaInstanceFreeableMemory", factor : 60, descriptions : "ReplicaInstanceFreeableMemory", unit : "Bytes" },
                                            { label : "VolumeBytesUsed", value : "VolumeBytesUsed", factor : 60, descriptions : "VolumeBytesUsed", unit : "Bytes" },
                                            { label : "VolumeReadIOPs", value : "VolumeReadIOPs", factor : 60, descriptions : "VolumeReadIOPs", unit : "Count" },
                                            { label : "VolumeWriteIOPs", value : "VolumeWriteIOPs", factor : 60, descriptions : "VolumeWriteIOPs", unit : "Count" },
                                            { label : "WriteThroughput", value : "WriteThroughput", factor : 60, descriptions : "WriteThroughput", unit : "Bytes" },
                                  ]
                                },
                                {
                                  label: "Engine metrics",
                                  options: [
                                            { label : "BufferCacheHitRatio", value : "BufferCacheHitRatio", descriptions : "BufferCacheHitRatio", unit : "Count" },
                                            { label : "DocumentsDeleted", value : "DocumentsDeleted", descriptions : "DocumentsDeleted", unit : "Count/min" },
                                            { label : "DocumentsInserted", value : "DocumentsInserted", descriptions : "DocumentsInserted", unit : "Count/min" },
                                            { label : "DocumentsReturned", value : "DocumentsReturned", descriptions : "DocumentsReturned", unit : "CoCount/minunt" },
                                            { label : "DocumentsUpdated", value : "DocumentsUpdated", descriptions : "DocumentsUpdated", unit : "Count/min" },
                                            { label : "OpsCommandsCount", value : "OpsCommandsCount", descriptions : "OpsCommandsCount", unit : "Count/sec" },
                                            { label : "OpsCommandsLatency", value : "OpsCommandsLatency", descriptions : "OpsCommandsLatency", unit : "ms" },
                                            { label : "OpsGetmoreCount", value : "OpsGetmoreCount", descriptions : "OpsGetmoreCount", unit : "Count/sec" },
                                            { label : "OpsGetmoreLatency", value : "OpsGetmoreLatency", descriptions : "OpsGetmoreLatency", unit : "ms" },
                                            { label : "OpsInsertCount", value : "OpsInsertCount", descriptions : "OpsInsertCount", unit : "Count/sec" },
                                            { label : "OpsInsertLatency", value : "OpsInsertLatency", descriptions : "OpsInsertLatency", unit : "ms" },
                                            { label : "OpsQueriesCount", value : "OpsQueriesCount", descriptions : "OpsQueriesCount", unit : "Count/sec" },
                                            { label : "OpsQueriesLatency", value : "OpsQueriesLatency", descriptions : "OpsQueriesLatency", unit : "ms" },
                                            { label : "OpsRemoveCount", value : "OpsRemoveCount", descriptions : "OpsRemoveCount", unit : "Count/sec" },
                                            { label : "OpsRemoveLatency", value : "OpsRemoveLatency", descriptions : "OpsRemoveLatency", unit : "ms" },
                                            { label : "OpsTotalCount", value : "OpsTotalCount", descriptions : "OpsTotalCount", unit : "Count/sec" },
                                            { label : "OpsTotalLatency", value : "OpsTotalLatency", descriptions : "OpsTotalLatency", unit : "ms" },
                                            { label : "OpsUpdateCount", value : "OpsUpdateCount", descriptions : "OpsUpdateCount", unit : "Count/sec" },
                                            { label : "OpsUpdateLatency", value : "OpsUpdateLatency", descriptions : "OpsUpdateLatency", unit : "ms" },
                                            ]
                                },
                            ];
  
    //-- Cluster Stats
    const nodeList = useRef("");
    const clusterList = useRef("");
    const [clusterStats,setClusterStats] = useState({ 
                                cluster : {
                                            DatabaseConnections: 0,
                                            OpsCommandsCount: 0,
                                            OpsCommandsLatency: 0,
                                            OpsGetmoreCount: 0,
                                            OpsGetmoreLatency: 0,
                                            OpsInsertCount: 0,
                                            OpsInsertLatency: 0,
                                            OpsQueriesCount: 0,
                                            OpsQueriesLatency: 0,
                                            OpsRemoveCount: 0,
                                            OpsRemoveLatency: 0,
                                            OpsTotalCount: 0,
                                            OpsTotalLatency: 0,
                                            OpsUpdateCount: 0,
                                            OpsUpdateLatency: 0,
                                            DocumentsDeleted: 0,
                                            DocumentsInserted: 0,
                                            DocumentsReturned: 0,
                                            DocumentsUpdated: 0,
                                            PrimaryInstanceCPUUtilization: 0,
                                            PrimaryInstanceFreeableMemory: 0,
                                            ReadThroughput: 0,
                                            ReplicaInstanceCPUUtilization: 0,
                                            ReplicaInstanceFreeableMemory: 0,
                                            VolumeReadIOPs: 0,
                                            VolumeWriteIOPs: 0,
                                            WriteThroughput: 0,
                                            lastUpdate: "-",
                                            shardCapacity: "-",
                                            shardCount: "-",
                                            status: "-",
                                            connectionId: "-",
                                            history : {
                                                        DatabaseConnections: [],
                                                        OpsCommandsCount:  [],
                                                        OpsCommandsLatency:  [],
                                                        OpsGetmoreCount:  [],
                                                        OpsGetmoreLatency:  [],
                                                        OpsInsertCount:  [],
                                                        OpsInsertLatency:  [],
                                                        OpsQueriesCount:  [],
                                                        OpsQueriesLatency:  [],
                                                        OpsRemoveCount:  [],
                                                        OpsRemoveLatency:  [],
                                                        OpsTotalCount:  [],
                                                        OpsTotalLatency:  [],
                                                        OpsUpdateCount:  [],
                                                        OpsUpdateLatency: [],
                                                        DocumentsDeleted: [],
                                                        DocumentsInserted: [],
                                                        DocumentsReturned: [],
                                                        DocumentsUpdated: [],
                                                        PrimaryInstanceCPUUtilization: [],
                                                        PrimaryInstanceFreeableMemory: [],
                                                        ReadThroughput: [],
                                                        ReplicaInstanceCPUUtilization: [],
                                                        ReplicaInstanceFreeableMemory: [],
                                                        VolumeReadIOPs: [],
                                                        VolumeWriteIOPs: [],
                                                        WriteThroughput: [],
                                            },
                                            nodes : []
                                },
                                
                });
                
                
    
    //-- Instances
    const instanceIdActive = useRef(0);
    const columnsTableShards = [
                  {id: 'shardId',header: 'ShardId',cell: item => ( <> <StatusIndicator type={'success'}> {item.shardId} </StatusIndicator> </> ),ariaLabel: createLabelFunction('shardId'),sortingField: 'shardId',},
                  {id: 'OpsTotalCount',header: 'OpsTotal',cell: item => customFormatNumberLong(item['OpsTotalCount'],0),ariaLabel: createLabelFunction('OpsTotalCount'),sortingField: 'OpsTotalCount',},
                  {id: 'OpsInsertCount',header: 'OpsInsert',cell: item => customFormatNumberLong(item['OpsInsertCount'],0),ariaLabel: createLabelFunction('OpsInsertCount'),sortingField: 'OpsInsertCount',},
                  {id: 'OpsQueriesCount',header: 'OpsQueries',cell: item => customFormatNumberLong(item['OpsQueriesCount'],0),ariaLabel: createLabelFunction('OpsQueriesCount'),sortingField: 'OpsQueriesCount',},
                  {id: 'OpsRemoveCount',header: 'OpsRemove',cell: item => customFormatNumberLong(item['OpsRemoveCount'],0),ariaLabel: createLabelFunction('OpsRemoveCount'),sortingField: 'OpsRemoveCount',},
                  {id: 'OpsUpdateCount',header: 'OpsUpdate',cell: item => customFormatNumberLong(item['OpsUpdateCount'],0),ariaLabel: createLabelFunction('OpsUpdateCount'),sortingField: 'OpsUpdateCount',},
                  {id: 'PrimaryInstanceCPUUtilization',header: 'CPU(Primary)',cell: item => customFormatNumberLong(item['PrimaryInstanceCPUUtilization'],0),ariaLabel: createLabelFunction('PrimaryInstanceCPUUtilization'),sortingField: 'PrimaryInstanceCPUUtilization',},
                  {id: 'ReplicaInstanceCPUUtilization',header: 'CPU(Replica)',cell: item => customFormatNumberLong(item['ReplicaInstanceCPUUtilization'],0),ariaLabel: createLabelFunction('ReplicaInstanceCPUUtilization'),sortingField: 'ReplicaInstanceCPUUtilization',},
                  {id: 'VolumeReadIOPs',header: 'ReadIOPs',cell: item => customFormatNumberLong(item['VolumeReadIOPs'],0),ariaLabel: createLabelFunction('VolumeReadIOPs'),sortingField: 'VolumeReadIOPs',},
                  {id: 'VolumeWriteIOPs',header: 'WriteIOPs',cell: item => customFormatNumber(item['VolumeWriteIOPs'],0),ariaLabel: createLabelFunction('VolumeWriteIOPs'),sortingField: 'VolumeWriteIOPs',},
                  {id: 'ReadThroughput',header: 'ReadThroughput',cell: item => customFormatNumber(item['ReadThroughput'],0),ariaLabel: createLabelFunction('ReadThroughput'),sortingField: 'ReadThroughput',},
                  {id: 'WriteThroughput',header: 'WriteThroughput',cell: item => customFormatNumber(item['WriteThroughput'],0),ariaLabel: createLabelFunction('WriteThroughput'),sortingField: 'WriteThroughput',},
                  
                  
    ];
    const visibleContentShards = ['shardId', 'OpsTotalCount', 'OpsInsertCount', 'OpsQueriesCount', 'OpsRemoveCount', 'OpsUpdateCount', 'PrimaryInstanceCPUUtilization', 'ReplicaInstanceCPUUtilization', 'VolumeReadIOPs', 'VolumeWriteIOPs', 'ReadThroughput', 'WriteThroughput' ];
                                            
    
    //-- Function Gather Metrics
    async function openClusterConnection() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        await Axios.post(`${api_url}/api/documentdb/elastic/cluster/open/connection/`,{
                      params: { 
                                connectionId : cnf_connection_id,
                                clusterId : cnf_identifier,
                                clusterArn : cnf_resource_id,
                                username : cnf_username,
                                password : cnf_password,
                                host : cnf_endpoint,
                                port : cnf_endpoint_port,
                                engineType : "documentdb-elastic"
                             }
              }).then((data)=>{
                
                nodeList.current = data.data.nodes;
                clusterList.current = (cnf_resource_id.split("/"))[1] + "|" + cnf_identifier;
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
                  console.log('Timeout API Call : /api/documentdb/elastic/cluster/open/connection/' );
                  console.log(err);
                  
              });
              
    }
    

    //-- Function Cluster Gather Stats
    async function gatherClusterStats() {
        
        if (currentTabId.current == "tab01") {
        
            var api_url = configuration["apps-settings"]["api_url"];
            
            Axios.get(`${api_url}/api/documentdb/elastic/cluster/gather/stats/`,{
                          params: { 
                                    connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    beginItem : ( (pageId.current-1) * itemsPerPage), 
                                    endItem : (( (pageId.current-1) * itemsPerPage) + itemsPerPage),
                                    engineType : "documentdb-elastic",
                                    includeSessions : ( currentTabId.current == "tab02" ? 1 : 0)
                          }
                      }).then((data)=>{
                       var info = data.data.cluster;
                       setClusterStats({ cluster : {...info} });
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/documentdb/elastic/cluster/gather/stats/' );
                      console.log(err);
                      
                  });
        
        }      
        
        
        if (currentTabId.current == "tab04") {
            
            
            var api_url = configuration["apps-settings"]["api_url"];
            
            Axios.get(`${api_url}/api/documentdb/elastic/shard/gather/analytics/`,{
                          params: { 
                                    connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    engineType : "documentdb-elastic",
                                    metricName : analyticsMetricName.current,
                          }
                      }).then((data)=>{
                        
                        
                        var dataPolar = { series : [], labels : [], avg : 0, max : -Infinity, min : Infinity, count : 0 } ;
                        data.data.shards.forEach(function(item) {
                            
                            dataPolar.labels.push(item.shardId);
                            dataPolar.series.push(item.value);
                            
                            if (item.value > dataPolar.max )
                                dataPolar.max = item.value;
                                
                            if ( item.value <  dataPolar.min )
                                dataPolar.min = item.value;
                                
                            dataPolar.avg = dataPolar.avg + item.value;
                            dataPolar.count = dataPolar.count + 1;
                            
                        });
                        
                        shardItemsSelectedData.current[0] = { name : "max", data : data.data.maxValues, type: "line" };
                        shardItemsSelectedData.current[1] = { name : "avg", data : data.data.avgValues, type: "line" };
                        shardItemsSelectedData.current[2] = { name : "min", data : data.data.minValues, type: "line" };
                        setShardAnalytics(dataPolar);
                         
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/documentdb/elastic/shard/gather/analytics/' );
                      console.log(err);
                  });
        
        } 
        
        
    }


    useEffect(() => {
        openClusterConnection();
    }, []);
    
    
    useEffect(() => {
        const id = setInterval(gatherClusterStats, configuration["apps-settings"]["refresh-interval-documentdb-metrics"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
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
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/documentdb/elastic/cluster/close/connection/`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier, engineType : "documentdb-elastic" }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/documentdb/elastic/cluster/close/connection/');
                      console.log(err)
                  });
                  
  
      
    }
       
    //-- Close TabWindow
    const closeTabWindow = () => {
              window.opener = null;
              window.open("", "_self");
              window.close();
      
    }
    

    function metricDetailsToColumnsBar(nodes,columnName){
        
        var seriesRaw = [];  
        var seriesData = { categories : [], data : [] };  
        try {  
                if (nodes.length > 0){
                    nodes.forEach(function(node) {
                        seriesRaw.push({ name : node.name, value :  node.history[columnName].data[node.history[columnName].data.length-1]  }  );
                    });
                
                    var itemLimit = 0;
                    var data = [];
                    var categories = [];
                    seriesRaw.sort((a, b) => b.value - a.value);
                    seriesRaw.forEach(function(item, index) {
                        if (itemLimit < 5) {
                            categories.push(item.name);
                            data.push(Math.trunc(item.value));
                        }
                        itemLimit++;
                    });
                    
                    seriesData = { categories : categories, data : data };  
                    
                
                }
        }
        catch{
            
        }
        
        return seriesData;
    }
    
    
    function metricDetailsToColumnsLine(nodes,columnName){
        
        var data = [];
        nodes.forEach(function(node) {
                
                data.push({ name : node.name, data : node.history[columnName].data });
        });
        
        return data;
        
        
    }
 
 
    function onClickPolarChart(object) {
            
            var shardId = shardAnalytics['labels'][object.selectedItem];
            const isObjectPresent = shardItemsSelectedData.current.find((o) => o.name === shardId);
            if (!isObjectPresent) {            
              
                    var api_url = configuration["apps-settings"]["api_url"];
                    
                    Axios.get(`${api_url}/api/documentdb/elastic/shard/gather/analytics/details`,{
                                  params: { 
                                            connectionId : cnf_connection_id, 
                                            clusterId : cnf_identifier, 
                                            shardId : shardAnalytics['labels'][object.selectedItem],
                                            engineType : "documentdb-elastic",
                                            metricName : analyticsMetricName.current,
                                  }
                              }).then((data)=>{
        
                                shardItemsSelectedData.current.push({ name : shardAnalytics['labels'][object.selectedItem], data : data.data, type : "line" });
                                shardItemsSelectedList.current.push({ label: shardAnalytics['labels'][object.selectedItem], dismissLabel: "Remove item 1" });
                                setShardItemsSelected(shardItemsSelectedList.current);
                                 
                          })
                          .catch((err) => {
                              console.log('Timeout API Call : /api/documentdb/elastic/shard/gather/analytics/details' );
                              console.log(err);
                          });
                          
            }

    }
 

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
        onSplitPanelToggle={() => setsplitPanelShow(false)}
        onSplitPanelResize={
                            ({ detail: { size } }) => {
                             setSplitPanelSize(size);
                        }
        }
        splitPanelSize={splitPanelSize}
        splitPanel={
                  <SplitPanel  
                                header={ 
                                        ( comparativeMode.current == "single" ?
                                                (clusterStats['cluster']['nodes'].length > 0 ? "Shard Mode : " + clusterStats['cluster']['nodes'][instanceIdActive.current].shardId : "Shard Mode : " ) :
                                                "Comparative Mode : " + metricNameComparation.current.descriptions + " ( " + metricNameComparation.current.unit + " )" 
                                        )
                      
                                } 
                                i18nStrings={splitPanelI18nStrings} 
                                closeBehavior="hide"
                                onSplitPanelToggle={({ detail }) => {
                                    
                                    }
                                  }
                  >
                    
                    { splitPanelShow === true && comparativeMode.current == "single" &&
                        
                        <div>  
                            <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                    <td valign="top" style={{ "width":"100%"}}>
                                            
                                            <table style={{"width":"100%"}}>
                                                <tr>  
                                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                            <CompMetric01 
                                                                value={ (clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsTotalCount'] ) || 0}
                                                                title={"Operations/sec"}
                                                                precision={0}
                                                                format={3}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"24px"}
                                                            />
                                                    </td>
                                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                            <CompMetric01 
                                                                value={ (clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsInsertCount'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsUpdateCount'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsRemoveCount']  ) || 0}
                                                                title={"WriteOps/sec"}
                                                                precision={0}
                                                                format={3}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"16px"}
                                                            />
                                                            <br/>        
                                                            <br/> 
                                                            <CompMetric01 
                                                                value={ ( clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsQueriesCount']  ) || 0 }
                                                                title={"ReadOps/sec"}
                                                                precision={0}
                                                                format={3}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"16px"}
                                                            />
                                                    </td>
                                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                            <ChartProgressBar01 
                                                                value={ ( clusterStats['cluster']['nodes'][instanceIdActive.current]['PrimaryInstanceCPUUtilization']  ) || 0 }
                                                                valueSufix={"%"}
                                                                title={"CPU Primary"}
                                                                precision={0}
                                                                format={1}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"16px"}
                                                            />
                                                            <br />
                                                            <br />
                                                            <ChartProgressBar01 
                                                                value={ ( clusterStats['cluster']['nodes'][instanceIdActive.current]['ReplicaInstanceCPUUtilization']  ) || 0 }
                                                                valueSufix={"%"}
                                                                title={"CPU Replica"}
                                                                precision={0}
                                                                format={1}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"16px"}
                                                            />
                                                         
                                                    </td>
                                                    <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                         <ChartLine02 series={JSON.stringify([
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['PrimaryInstanceCPUUtilization'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['ReplicaInstanceCPUUtilization']
                                                                            ])} 
                                                                        title={"CPU Usage(%)"} height="200px" 
                                                        />
                                                    </td>
                                                    <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                         <ChartLine02 series={JSON.stringify([
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['VolumeReadIOPs'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['VolumeWriteIOPs']
                                                                                
                                                                            ])} 
                                                                        title={"IOPS"} height="200px" 
                                                        />
                                                    </td>
                                                    <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                         <ChartLine02 series={JSON.stringify([
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['ReadThroughput'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['WriteThroughput']
                                                                            ])} 
                                                                        title={"I/O Throughput"} height="200px" 
                                                        />  
                                                    </td>
                                              
                                                </tr>
                                                
                                            </table>  
                                            <br />
                                            <br />
                                            <br />
                                            <table style={{"width":"100%"}}>
                                                <tr> 
                                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsInsertCount']  || 0}
                                                            title={"opsInsert/sec"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsQueriesCount'] || 0}
                                                            title={"opsSelect/sec"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsRemoveCount']  || 0}
                                                            title={"opsDelete/sec"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsUpdateCount'] || 0}
                                                            title={"opsUpdate/sec"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsGetmoreCount'] || 0}
                                                            title={"opsGetmore/sec"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsCommandsCount'] || 0}
                                                            title={"opsCommand/sec"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['VolumeReadIOPs'] || 0}
                                                            title={"VolumeReadIOPs"}
                                                            precision={0}
                                                            format={1}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['VolumeWriteIOPs'] || 0}
                                                            title={"VolumeWriteIOPs"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                </tr>
                                            </table>
                                            <br/>
                                            <br/>
                                            <table style={{"width":"100%"}}>
                                                <tr> 
                                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsInsertLatency']  || 0}
                                                            title={"opsInsertLatency(us)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsQueriesLatency'] || 0}
                                                            title={"opsSelectLatency(us)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsRemoveLatency']  || 0}
                                                            title={"opsDeleteLatency(us)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsUpdateLatency'] || 0}
                                                            title={"opsUpdateLatency(us)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsGetmoreLatency'] || 0}
                                                            title={"opsGetmoreLatency(us)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['OpsCommandsLatency'] || 0}
                                                            title={"opsCommandLatency(us)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['WriteThroughput'] || 0}
                                                            title={"WriteThroughput"}
                                                            precision={0}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                        <CompMetric01 
                                                            value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['ReadThroughput'] || 0}
                                                            title={"ReadThroughput"}
                                                            precision={0}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                </tr>
                                            </table> 
                                            <br/>
                                            <br/>
                                            <br />
                                            <br />
                                            
                                            <table style={{"width":"100%"}}>
                                                  <tr>  
                                                    <td style={{"width":"30%", "padding-left": "1em"}}>  
                                                         <ChartLine02 series={JSON.stringify([
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsTotalCount']
                                                                            ])} 
                                                                        title={"Operations/sec"} height="200px" 
                                                        />  
                                                    </td>
                                                    <td style={{"width":"35%", "padding-left": "1em"}}>  
                                                         <ChartLine02 series={JSON.stringify([
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsInsertCount'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsQueriesCount'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsRemoveCount'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsUpdateCount'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsGetmoreCount'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsCommandsCount']
                                                                            ])} 
                                                                        title={"Operations/sec"} height="200px" 
                                                        />  
                                                    </td>
                                                    <td style={{"width":"35%", "padding-left": "1em"}}>  
                                                         <ChartLine02 series={JSON.stringify([
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsInsertLatency'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsQueriesLatency'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsRemoveLatency'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsUpdateLatency'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsGetmoreLatency'],
                                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['OpsCommandsLatency']
                                                                                
                                                                            ])} 
                                                                        title={"Latency(us)"} height="200px" 
                                                        />
                                                    </td>
                                                  </tr>
                                            </table>
                                    </td>
                                </tr>
                            </table>
                        </div>  
                    } 
                    
                    { splitPanelShow === true && comparativeMode.current == "multi" &&
                    <div>  
                        <table style={{"width":"100%", "padding": "1em"}}>
                            <tr>  
                                <td valign="top" style={{ "width":"30%", "padding": "1em"}}>
                                    <FormField
                                          description="Select a metric to compare shard performance."
                                          label="Performance Metric"
                                        >
                                        
                                            
                                            <Select
                                                  selectedOption={selectedMetricComparation}
                                                  onChange={({ detail }) => {
                                                         metricNameComparation.current = { name : detail.selectedOption.value, descriptions : detail.selectedOption.descriptions, unit : detail.selectedOption.unit };
                                                         setSelectedMetricComparation(detail.selectedOption);
                                                         gatherClusterStats();
                                                  }
                                                  }
                                                  options={metricsComparation}
                                                  filteringType="auto"
                                            />
                                    </FormField>
                                    <ChartColumn01 
                                        series={metricDetailsToColumnsBar(clusterStats['cluster']['nodes'],metricNameComparation.current.name)} 
                                        height="200px" 
                                    />
                                </td>
                                <td style={{"width":"70%", "padding-left": "1em"}}>  
                                    <ChartLine02 
                                        series={JSON.stringify(metricDetailsToColumnsLine(clusterStats['cluster']['nodes'],metricNameComparation.current.name))} 
                                        height="250px" 
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
                                    <td style={{"width":"60%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                                        <SpaceBetween direction="horizontal" size="xs">
                                            { clusterStats['cluster']['status'] != 'ACTIVE' &&
                                                <Spinner size="big" />
                                            }
                                            <Box variant="h3" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
                                        </SpaceBetween>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <StatusIndicator type={clusterStats['cluster']['status'] === 'ACTIVE' ? 'success' : 'pending'}> {clusterStats['cluster']['status']} </StatusIndicator>
                                        <Box variant="awsui-key-label">Status</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['shardCount']}</div>
                                        <Box variant="awsui-key-label">ShardCount</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['shardCapacity']}</div>
                                        <Box variant="awsui-key-label">ShardCapacity</Box>
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
                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                      {
                                        label: "RealTime Metrics",
                                        id: "tab01",
                                        content: 
                                          
                                          <>
                                            <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                <tr>  
                                                   <td> 
            
                                                        <Container>
                                
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>  
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={ (clusterStats.cluster.OpsTotalCount ) || 0}
                                                                                    title={"Operations/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                        </td>
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={ (clusterStats.cluster.OpsInsertCount + clusterStats.cluster.OpsUpdateCount + clusterStats.cluster.OpsRemoveCount  ) || 0}
                                                                                    title={"WriteOps/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                                <br/>        
                                                                                <br/> 
                                                                                <CompMetric01 
                                                                                    value={ ( clusterStats.cluster.OpsQueriesCount  ) || 0 }
                                                                                    title={"ReadOps/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                        </td>
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                                <ChartProgressBar01 
                                                                                    value={ ( clusterStats.cluster.PrimaryInstanceCPUUtilization  ) || 0 }
                                                                                    valueSufix={"%"}
                                                                                    title={"CPU Primary"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                                <br />
                                                                                <br />
                                                                                <ChartProgressBar01 
                                                                                    value={ ( clusterStats.cluster.ReplicaInstanceCPUUtilization  ) || 0 }
                                                                                    valueSufix={"%"}
                                                                                    title={"CPU Replica"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                                
                                                                                
                                                                             
                                                                        </td>
                                                                        <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.PrimaryInstanceCPUUtilization,
                                                                                                    clusterStats.cluster.history.ReplicaInstanceCPUUtilization,
                                                                                                ])} 
                                                                                            title={"CPU Usage(%)"} height="200px" 
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.VolumeReadIOPs,
                                                                                                    clusterStats.cluster.history.VolumeWriteIOPs
                                                                                                    
                                                                                                ])} 
                                                                                            title={"IOPS"} height="200px" 
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.ReadThroughput,
                                                                                                    clusterStats.cluster.history.WriteThroughput
                                                                                                ])} 
                                                                                            title={"I/O Throughput"} height="200px" 
                                                                            />  
                                                                        </td>
                                                                  
                                                                    </tr>
                                                                    
                                                                </table>  
                                                                <br />
                                                                <br />
                                                                <table style={{"width":"100%"}}>
                                                                    <tr> 
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={ clusterStats.cluster.OpsInsertCount  || 0}
                                                                                title={"opsInsert/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsQueriesCount || 0}
                                                                                title={"opsSelect/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsRemoveCount  || 0}
                                                                                title={"opsDelete/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsUpdateCount || 0}
                                                                                title={"opsUpdate/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsGetmoreCount || 0}
                                                                                title={"opsGetmore/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsCommandsCount || 0}
                                                                                title={"opsCommand/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.VolumeReadIOPs || 0}
                                                                                title={"VolumeReadIOPs"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.VolumeWriteIOPs || 0}
                                                                                title={"VolumeWriteIOPs"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                            </table>
                                                            <br/>
                                                            <br/>
                                                            
                                                            <table style={{"width":"100%"}}>
                                                                    <tr> 
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={ clusterStats.cluster.OpsInsertLatency  || 0}
                                                                                title={"opsInsertLatency(us)"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsQueriesLatency || 0}
                                                                                title={"opsSelectLatency(us)"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsRemoveLatency  || 0}
                                                                                title={"opsDeleteLatency(us)"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsUpdateLatency || 0}
                                                                                title={"opsUpdateLatency(us)"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsGetmoreLatency || 0}
                                                                                title={"opsGetmoreLatency(us)"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.OpsCommandsLatency || 0}
                                                                                title={"opsCommandLatency(us)"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.WriteThroughput || 0}
                                                                                title={"WriteThroughput"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.ReadThroughput || 0}
                                                                                title={"ReadThroughput"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                            </table>  
                                                            
                                                            <br />
                                                            <br />
                                                            <table style={{"width":"100%"}}>
                                                                  <tr>  
                                                                    <td style={{"width":"30%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.OpsTotalCount
                                                                                            ])} 
                                                                                        title={"Operations/sec"} height="200px" 
                                                                        />  
                                                                    </td>
                                                                    <td style={{"width":"35%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.OpsInsertCount,
                                                                                                clusterStats.cluster.history.OpsQueriesCount,
                                                                                                clusterStats.cluster.history.OpsRemoveCount,
                                                                                                clusterStats.cluster.history.OpsUpdateCount,
                                                                                                clusterStats.cluster.history.OpsGetmoreCount,
                                                                                                clusterStats.cluster.history.OpsCommandsCount
                                                                                            ])} 
                                                                                        title={"Operations/sec"} height="200px" 
                                                                        />  
                                                                    </td>
                                                                    <td style={{"width":"35%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.OpsInsertLatency,
                                                                                                clusterStats.cluster.history.OpsQueriesLatency,
                                                                                                clusterStats.cluster.history.OpsRemoveLatency,
                                                                                                clusterStats.cluster.history.OpsUpdateLatency,
                                                                                                clusterStats.cluster.history.OpsGetmoreLatency,
                                                                                                clusterStats.cluster.history.OpsCommandsLatency
                                                                                                
                                                                                            ])} 
                                                                                        title={"Latency(us)"} height="200px" 
                                                                        />
                                                                    </td>
                                                                  </tr>
                                                            </table>
                                                            
                                                        </Container>
                                                    </td>
                                                </tr>
                                            </table>  
                                            
                                            <div style={{"padding":"1em"}}>
                                                <CustomTable02
                                                        columnsTable={columnsTableShards}
                                                        visibleContent={visibleContentShards}
                                                        dataset={clusterStats.cluster.nodes}
                                                        title={"Shards"}
                                                        description={""}
                                                        pageSize={20}
                                                        onSelectionItem={( item ) => {
                                                            console.log(item);
                                                            var iPosition = 0;
                                                            for (let iNode = 0 ; iNode < clusterStats.cluster.nodes.length; iNode ++){
                                                                if(clusterStats.cluster.nodes[iNode].shardId == item[0].shardId)
                                                                    iPosition = iNode;
                                                            }
                                                            instanceIdActive.current = iPosition;
                                                            comparativeMode.current = "single";
                                                            setsplitPanelShow(true);
                                                            gatherClusterStats();
                                                          }
                                                        }
                                                        extendedTableProperties = {
                                                            { onSortingChange1 : "borderless" }
                                                            
                                                        }
                                                        tableActions={
                                                                    <SpaceBetween
                                                                      direction="horizontal"
                                                                      size="xs"
                                                                    >
                                                                      <Button variant="primary" 
                                                                              onClick={() => {
                                                                                console.log("Comparative");
                                                                                comparativeMode.current = "multi";
                                                                                setsplitPanelShow(true);
                                                                                gatherClusterStats();
                                                                                }
                                                                              }
                                                                      >
                                                                        Compartive Mode
                                                                      </Button>
                                                                    </SpaceBetween>
                                                        }
                                                        
                                                        
                                                        
                                                />
                                            </div>
                                           
                                          </>
                                          
                                      },
                                      {
                                        label: "CloudWatch Metrics - Cluster",
                                        id: "tab02",
                                        content: 
                                          <>    
                                                <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                <tr>  
                                                   <td> 
                                                        <Container
                                                        
                                                        header={
                                                                    <Header
                                                                      variant="h2"
                                                                      description={"AWS CloudWatch metrics from last 60 minutes."}
                                                                    >
                                                                      Performance Metrics
                                                                    </Header>
                                                                }
                                                        >
                                                            <CLWChart
                                                                  title="PrimaryInstanceCPUUtilization" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="PrimaryInstanceCPUUtilization"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            
                                                            
                                                            <CLWChart 
                                                                  title="PrimaryInstanceFreeableMemory" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="PrimaryInstanceFreeableMemory"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart
                                                                  title="ReplicaInstanceCPUUtilization" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="ReplicaInstanceCPUUtilization"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="ReplicaInstanceFreeableMemory" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="ReplicaInstanceFreeableMemory"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="ReadThroughput" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="ReadThroughput"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="WriteThroughput" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="WriteThroughput"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="VolumeReadIOPs" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="VolumeReadIOPs"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="VolumeWriteIOPs" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="VolumeWriteIOPs"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DatabaseConnections" 
                                                                  subtitle="Total Count" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="DatabaseConnections"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsInserted" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="DocumentsInserted"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsUpdated" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="DocumentsUpdated"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsReturned" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="DocumentsReturned"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsDeleted" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="DocumentsDeleted"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="OpcountersInsert" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="OpcountersInsert"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="OpcountersUpdate" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="OpcountersUpdate"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="OpcountersQuery" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="OpcountersQuery"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="OpcountersDelete" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ClusterId|ClusterName"}
                                                                  dimension_value={clusterList.current}
                                                                  metric_name="OpcountersDelete"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                        </Container>
                                                        
                                                
                                                    </td>
                                                </tr>
                                            </table> 
                                            
                                          </>
                                          
                                      },
                                      {
                                        label: "CloudWatch Metrics - Shards",
                                        id: "tab03",
                                        content: 
                                          
                                          <>    
                                                
                                                <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                <tr>  
                                                   <td> 
                                                        <Container
                                                        
                                                        header={
                                                                    <Header
                                                                      variant="h2"
                                                                      description={"AWS CloudWatch metrics from last 60 minutes."}
                                                                      actions={
                                                                            <Pagination
                                                                                      currentPageIndex={currentPageIndex}
                                                                                      onChange={({ detail }) => {
                                                                                                setCurrentPageIndex(detail.currentPageIndex);
                                                                                                pageId.current = detail.currentPageIndex;
                                                                                        }
                                                                                      }
                                                                                      pagesCount={ totalPages } 
                                                                            />
                                                                      }
                                                                    >
                                                                      Performance Metrics
                                                                    </Header>
                                                                }
                                                        >
                                                            <CLWChart
                                                                  title="PrimaryInstanceCPUUtilization" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="PrimaryInstanceCPUUtilization"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            
                                                            
                                                            <CLWChart 
                                                                  title="PrimaryInstanceFreeableMemory" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="PrimaryInstanceFreeableMemory"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart
                                                                  title="ReplicaInstanceCPUUtilization" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="ReplicaInstanceCPUUtilization"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="ReplicaInstanceFreeableMemory" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="ReplicaInstanceFreeableMemory"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="ReadThroughput" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="ReadThroughput"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="WriteThroughput" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="WriteThroughput"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="VolumeReadIOPs" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="VolumeReadIOPs"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="VolumeWriteIOPs" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="VolumeWriteIOPs"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DBInstanceReplicaLag" 
                                                                  subtitle="Average/ms" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DBInstanceReplicaLag"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={2}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsInserted" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DocumentsInserted"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsUpdated" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DocumentsUpdated"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsReturned" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DocumentsReturned"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <br/>
                                                            <CLWChart 
                                                                  title="DocumentsDeleted" 
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB-Elastic"
                                                                  dimension_name={"ShardId|ClusterId|ClusterName"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DocumentsDeleted"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"total"}
                                                                  metric_per_second={0}
                                                                  metric_precision={0}
                                                                  format={1}
                                                                  font_color_value={configuration.colors.fonts.metric100}
                                                                  pageId={pageId.current}
                                                                  itemsPerPage={itemsPerPage}
                                                            />
                                                        </Container>
                                                
                                                    </td>
                                                </tr>
                                            </table> 
                                            
                                          </>
                                          
                                      },
                                      {
                                        label: "Shard Analytics",
                                        id: "tab04",
                                        content: 
                                         
                                          <>
                                                
                                                                        
                                              <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                    <tr>  
                                                        <td>
                                                        
                                                        
                                                            <Container 
                                                                    header={
                                                                                <Header
                                                                                  variant="h2"
                                                                                  description={"AWS CloudWatch metrics from last 3 hours."}
                                                                      
                                                                                >
                                                                                  Shard Analytics
                                                                                </Header>
                                                                            }
                                                                
                                                            >
                                                            
                                                            <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                                <tr>  
                                                                    <td valign="top" style={{ "width":"50%","padding-left": "1em"}}>
                                                                        <table style={{"width":"100%","background-color ": "black"}}>
                                                                            <tr>  
                                                                                <td valign="top" style={{ "width":"80%"}}>
                                                                                    <FormField
                                                                                          description="Select a metric to analyze performance across the cluster"
                                                                                          label="Performance Metric"
                                                                                        >
                                                                                        
                                                                                            <Select
                                                                                                  selectedOption={selectedMetricAnalytics}
                                                                                                  onChange={({ detail }) => {
                                                                                                         analyticsMetricName.current = detail.selectedOption.value;
                                                                                                         shardItemsSelectedList.current = [];
                                                                                                         shardItemsSelectedData.current = [];
                                                                                                         setSelectedMetricAnalytics(detail.selectedOption);
                                                                                                         gatherClusterStats();
                                                                                                  }
                                                                                                  }
                                                                                                  options={analyticsMetrics}
                                                                                                  filteringType="auto"
                                                                                            />
                                                                                          
                                                                                    </FormField>
                                                                                </td>
                                                                                <td valign="top" style={{ "width":"20%","padding-left": "1em"}}>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        <br/>
                                                                        <ColumnLayout columns={4} variant="text-grid">
                                                                                <CompMetric01 
                                                                                    value={shardAnalytics.count}
                                                                                    title={"Items"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"20px"}
                                                                                />
                                                                                <CompMetric01 
                                                                                    value={shardAnalytics.max}
                                                                                    title={"Maximum"}
                                                                                    precision={2}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"20px"}
                                                                                />
                                                                                 <CompMetric01 
                                                                                    value={ ( shardAnalytics.avg / shardAnalytics.count) || 0 }
                                                                                    title={"Average"}
                                                                                    precision={2}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"20px"}
                                                                                />
                                                                                 <CompMetric01 
                                                                                    value={shardAnalytics.min}
                                                                                    title={"Minimum"}
                                                                                    precision={2}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"20px"}
                                                                                />
                                                                        </ColumnLayout>
                                                                        <br/>
                                                                        <ChartPolar01 
                                                                                title={"Performance Analysis"} 
                                                                                height="550px" 
                                                                                width="100%" 
                                                                                series = {shardAnalytics.series}
                                                                                labels = {shardAnalytics.labels}
                                                                                onClickEvent={onClickPolarChart}
                                                                        />
                                                                    </td>
                                                                    <td valign="middle" style={{ "width":"50%","padding-left": "2em", "border-left": "1px solid " + configuration.colors.lines.separator100}}>
                                                                            
                                                                                <div>
                                                                                    <ChartLine03 
                                                                                                series={JSON.stringify(shardItemsSelectedData.current)} 
                                                                                                title={"Compartive Chart"} 
                                                                                                height="450px" 
                                                                                                border={2}
                                                                                    />
                                                                                    <br/>
                                                                                    <TokenGroup
                                                                                          onDismiss={({ detail: { itemIndex } }) => {
                                                                                            
                                                                                            shardItemsSelectedList.current = [
                                                                                              ...shardItemsSelectedList.current.slice(0, itemIndex),
                                                                                              ...shardItemsSelectedList.current.slice(itemIndex + 1)
                                                                                            ];
                                                                                            
                                                                                            shardItemsSelectedData.current = [
                                                                                              ...shardItemsSelectedData.current.slice(0, itemIndex + 3),
                                                                                              ...shardItemsSelectedData.current.slice(itemIndex + 1 + 3)
                                                                                            ];
                                                                                            
                                                                                            setShardItemsSelected([
                                                                                              ...shardItemsSelected.slice(0, itemIndex),
                                                                                              ...shardItemsSelected.slice(itemIndex + 1)
                                                                                            ]);
                                                                                            
                                                                                          }}
                                                                                          items={shardItemsSelectedList.current}
                                                                                          limit={10}
                                                                                    />
                                                                                    
                                                                                </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            
                                                            </Container>
                                                        
                                                        </td>
                                                    </tr>
                                                </table> 
                                                
                                                
                                                
                                          </>
                                          
                                      },
                                      {
                                        label: "Cluster Information",
                                        id: "tab05",
                                        content: 
                                         
                                          <>
                                              <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                    <tr>  
                                                        <td>
                                                                <Container 
                                                                    header={
                                                                                <Header
                                                                                  variant="h2"
                                                                                >
                                                                                  Configuration
                                                                                </Header>
                                                                            }
                                                                
                                                                >
                                                                    <ColumnLayout columns={4} variant="text-grid">
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Cluster name</Box>
                                                                            <div>{cnf_identifier}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Engine</Box>
                                                                            <div>{cnf_engine}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">ClusterEndpoint</Box>
                                                                            <div>{cnf_endpoint}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Port</Box>
                                                                            <div>{cnf_endpoint_port}</div>
                                                                      </div>
                                                                    </ColumnLayout>
                                                                    <br/>
                                                                    <br/>
                                                                    <ColumnLayout columns={4} variant="text-grid">
                                                                        <div>
                                                                            <Box variant="awsui-key-label">ConnectionId</Box>
                                                                            <div>{clusterStats['cluster']['connectionId']}</div>
                                                                        </div>
                                                                    </ColumnLayout>
                                                                    <br/>
                                                                    <br/>
                                                                  </Container>
                                                
                                                        </td>
                                                    </tr>
                                                </table> 
                                                
                                          </>
                                          
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
