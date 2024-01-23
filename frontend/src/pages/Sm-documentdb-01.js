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
import CustomTable from "../components/Table01";
import CustomTable02 from "../components/Table02";

import Textarea from "@cloudscape-design/components/textarea";
import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import Flashbar from "@cloudscape-design/components/flashbar";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Spinner from "@cloudscape-design/components/spinner";
import Badge from "@cloudscape-design/components/badge";
import Button from "@cloudscape-design/components/button";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Pagination from "@cloudscape-design/components/pagination";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import CompMetric01  from '../components/Metric01';
import ChartLine02  from '../components/ChartLine02';
import CLWChart  from '../components/ChartCLW03';
import ChartRadialBar01 from '../components/ChartRadialBar01';
import ChartColumn01 from '../components/ChartColumn01';

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
    const cnf_az=parameter_object_values["rds_az"];
    const cnf_version=parameter_object_values["rds_version"];
    const cnf_nodes=parameter_object_values["rds_nodes"];
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
    
    //-- Variable for Cluster Stats
    const nodeList = useRef("");
    const [clusterStats,setClusterStats] = useState({ 
                                cluster : {
                                            status : "pending",
                                            size : "-",
                                            totalNodes : 0,
                                            cpu: 0,
                                            memory: 0,
                                            ioreads: 0,
                                            iowrites: 0,
                                            netin: 0,
                                            netout: 0,
                                            network: 0,
                                            iops : 0,
                                            connectionsCurrent : 0,
                                            connectionsAvailable : 0,
                                            connectionsCreated : 0,
                                            opsInsert : 0,
                                            opsQuery : 0,
                                            opsUpdate : 0,
                                            opsDelete : 0,
                                            opsGetmore : 0,
                                            opsCommand : 0,
                                            operations : 0,
                                            docsDeleted : 0,
                                            docsInserted : 0,
                                            docsReturned : 0,
                                            docsUpdated : 0,
                                            docops : 0,
                                            transactionsActive : 0,
                                            transactionsCommited : 0,
                                            transactionsAborted : 0,
                                            transactionsStarted : 0,
                                            lastUpdate : "-",
                                            connectionId : "-",
                                            history : {
                                                        cpu: [],
                                                        memory: [],
                                                        ioreads: [],
                                                        iowrites: [],
                                                        netin: [],
                                                        netout: [],
                                                        network: [],
                                                        iops: [],
                                                        connectionsCurrent : [],
                                                        connectionsAvailable : [],
                                                        connectionsCreated : [],
                                                        opsInsert : [],
                                                        opsQuery : [],
                                                        opsUpdate : [],
                                                        opsDelete : [],
                                                        opsGetmore : [],
                                                        opsCommand : [],
                                                        operations : [],
                                                        docsDeleted : [],
                                                        docsInserted : [],
                                                        docsReturned : [],
                                                        docsUpdated : [],
                                                        docops : [],
                                                        transactionsActive : [],
                                                        transactionsCommited : [],
                                                        transactionsAborted : [],
                                                        transactionsStarted : []
                                            },
                                            nodes : [],
                                            sessions : [],
                                },
                                
                });
                
    
    //-- Active Sessions
    
    const columnsTable = [
                  {id: 'instanceId',header: 'InstanceId',cell: item => item['instanceId'],ariaLabel: createLabelFunction('instanceId'),sortingField: 'instanceId',},
                  {id: 'opid',header: 'PID',cell: item => item['opid'],ariaLabel: createLabelFunction('opid'),sortingField: 'opid',},
                  {id: 'threadId',header: 'ThreadId',cell: item => item['threadId'],ariaLabel: createLabelFunction('threadId'),sortingField: 'threadId',},
                  {id: 'db',header: 'Database',cell: item => item['$db'] || "-",ariaLabel: createLabelFunction('db'),sortingField: 'db',},
                  {id: 'client',header: 'Host',cell: item => item['client'],ariaLabel: createLabelFunction('client'),sortingField: 'client',},
                  {id: 'active',header: 'IsActive',cell: item => String(item['active']),ariaLabel: createLabelFunction('active'),sortingField: 'active',},
                  {id: 'WaitState',header: 'WaitType',cell: item => item['WaitState'] || "-",ariaLabel: createLabelFunction('WaitState'),sortingField: 'WaitState',},
                  {id: 'secs_running',header: 'ElapsedTime(sec)',cell: item => item['secs_running'],ariaLabel: createLabelFunction('secs_running'),sortingField: 'secs_running',},
                  {id: 'ns',header: 'Namespace',cell: item => item['ns'],ariaLabel: createLabelFunction('ns'),sortingField: 'ns',},
                  {id: 'op',header: 'Operation',cell: item => item['op'],ariaLabel: createLabelFunction('op'),sortingField: 'op',},
                  {id: 'command',header: 'Command',cell: item =>  String(JSON.stringify(item['command'])),ariaLabel: createLabelFunction('command'),sortingField: 'command',}
                  
    ];
    
    const visibleContent = ['instanceId', 'opid', 'threadId', 'db', 'client', 'WaitState', 'secs_running', 'ns', 'command'];
    const sessionDetails = useRef({});
    const [queryDetails,setQueryDetails] = useState({});
    
    
    
    //-- Instances
    const instanceIdActive = useRef(0);
    const columnsTableInstances = [
                  {id: 'name',header: 'InstanceId',cell: item => (
                                                                <>
                                                                    { item.role === "P" &&
                                                                        <Badge color="blue"> P </Badge>
                                                                    }{ item.role === "R" &&
                                                                        <Badge color="red"> R </Badge>
                                                                    }{ item.role === "-" &&
                                                                        <Badge> - </Badge>
                                                                    }
                                                                    &nbsp;{item.name} 
                                                                </>
                                                                )
                  ,ariaLabel: createLabelFunction('name'),sortingField: 'name',},
                  {id: 'status',header: 'Status',cell: item => ( <> <StatusIndicator type={item.status === 'available' ? 'success' : 'pending'}> {item.status} </StatusIndicator> </> ),ariaLabel: createLabelFunction('status'),sortingField: 'status',},
                  {id: 'size',header: 'Size',cell: item => item['size'] || "-",ariaLabel: createLabelFunction('size'),sortingField: 'size',},
                  {id: 'az',header: 'AZ',cell: item => item['az'],ariaLabel: createLabelFunction('az'),sortingField: 'az',},
                  {id: 'operations',header: 'Operations/sec',cell: item => customFormatNumberLong(item['operations'],0),ariaLabel: createLabelFunction('operations'),sortingField: 'operations',},
                  {id: 'docops',header: 'Documents/sec',cell: item => customFormatNumberLong(item['docops'],0),ariaLabel: createLabelFunction('docsops'),sortingField: 'docops',},
                  {id: 'connectionsCurrent',header: 'Connections',cell: item => customFormatNumberLong(item['connectionsCurrent'],0),ariaLabel: createLabelFunction('connectionsCurrent'),sortingField: 'connectionsCurrent',},
                  {id: 'connectionsCreated',header: 'Connections/sec',cell: item => customFormatNumberLong(item['connectionsCreated'],0),ariaLabel: createLabelFunction('connectionsCreated'),sortingField: 'connectionsCreated',},
                  {id: 'cpu',header: 'CPU',cell: item => customFormatNumberLong(item['cpu'],0),ariaLabel: createLabelFunction('cpu'),sortingField: 'cpu',},
                  {id: 'memory',header: 'MemoryFree',cell: item => customFormatNumber(item['memory'],0),ariaLabel: createLabelFunction('memory'),sortingField: 'memory',},
                  {id: 'iops',header: 'IOPS',cell: item => customFormatNumberLong(item['iops'],0),ariaLabel: createLabelFunction('iops'),sortingField: 'iops',},
                  {id: 'network',header: 'Network',cell: item => customFormatNumber(item['network'],0),ariaLabel: createLabelFunction('network'),sortingField: 'network',},
                  {id: 'connectionsAvailable',header: 'Connections Available',cell: item => customFormatNumberLong(item['connectionsAvailable'],0),ariaLabel: createLabelFunction('connectionsAvailable'),sortingField: 'connectionsAvailable',},
                  {id: 'opsInsert',header: 'OpsInsert',cell: item => customFormatNumberLong(item['opsInsert'],0),ariaLabel: createLabelFunction('opsInsert'),sortingField: 'opsInsert',},
                  {id: 'opsQuery',header: 'opsQuery',cell: item => customFormatNumberLong(item['opsQuery'],0),ariaLabel: createLabelFunction('opsQuery'),sortingField: 'opsQuery',},
                  {id: 'opsUpdate',header: 'opsUpdate',cell: item => customFormatNumberLong(item['opsUpdate'],0),ariaLabel: createLabelFunction('opsUpdate'),sortingField: 'opsUpdate',},
                  {id: 'opsDelete',header: 'opsDelete',cell: item => customFormatNumberLong(item['opsDelete'],0),ariaLabel: createLabelFunction('opsDelete'),sortingField: 'opsDelete',},
                  {id: 'opsGetmore',header: 'opsGetmore',cell: item => customFormatNumberLong(item['opsGetmore'],0),ariaLabel: createLabelFunction('opsGetmore'),sortingField: 'opsGetmore',},
                  {id: 'opsCommand',header: 'opsCommand',cell: item => customFormatNumberLong(item['opsCommand'],0),ariaLabel: createLabelFunction('opsCommand'),sortingField: 'opsCommand',},
                  {id: 'docsDeleted',header: 'Documents(Deleted)',cell: item => customFormatNumberLong(item['docsDeleted'],0),ariaLabel: createLabelFunction('docsDeleted'),sortingField: 'docsDeleted',},
                  {id: 'docsInserted',header: 'Documents(Inserted)',cell: item => customFormatNumberLong(item['docsInserted'],0),ariaLabel: createLabelFunction('docsInserted'),sortingField: 'docsInserted',},
                  {id: 'docsReturned',header: 'Documents(Returned)',cell: item => customFormatNumberLong(item['docsReturned'],0),ariaLabel: createLabelFunction('docsReturned'),sortingField: 'docsReturned',},
                  {id: 'docsUpdated',header: 'Documents(Updated)',cell: item => customFormatNumberLong(item['docsUpdated'],0),ariaLabel: createLabelFunction('docsUpdated'),sortingField: 'docsUpdated',},
                  {id: 'transactionsActive',header: 'Transactions(Active)',cell: item => customFormatNumberLong(item['transactionsActive'],0),ariaLabel: createLabelFunction('transactionsActive'),sortingField: 'transactionsActive',},
                  {id: 'transactionsCommited',header: 'Transactions(Commited)',cell: item => customFormatNumberLong(item['transactionsCommited'],0),ariaLabel: createLabelFunction('transactionsCommited'),sortingField: 'transactionsCommited',},
                  {id: 'transactionsAborted',header: 'Transactions(Aborted)',cell: item => customFormatNumberLong(item['transactionsAborted'],0),ariaLabel: createLabelFunction('transactionsAborted'),sortingField: 'transactionsAborted',},
                  {id: 'transactionsStarted',header: 'Transactions(Started)',cell: item => customFormatNumberLong(item['transactionsStarted'],0),ariaLabel: createLabelFunction('transactionsStarted'),sortingField: 'transactionsStarted',},
                  
    ];
    const visibleContentInstances = ['name', 'status', 'size', 'az', 'operations', 'docops', 'connectionsCurrent', 'connectionsCreated', 'cpu', 'memory', 'iops', 'network' ];
                                            
    //-- Node Sessions
    
    const columnsTableNodeSessions = [
                  {id: 'opid',header: 'PID',cell: item => item['opid'],ariaLabel: createLabelFunction('opid'),sortingField: 'opid',},
                  {id: 'db',header: 'Database',cell: item => item['$db'] || "-",ariaLabel: createLabelFunction('db'),sortingField: 'db',},
                  {id: 'client',header: 'Host',cell: item => item['client'],ariaLabel: createLabelFunction('client'),sortingField: 'client',},
                  {id: 'WaitState',header: 'WaitType',cell: item => item['WaitState'] || "-",ariaLabel: createLabelFunction('WaitState'),sortingField: 'WaitState',},
                  {id: 'secs_running',header: 'ElapsedTime(sec)',cell: item => item['secs_running'],ariaLabel: createLabelFunction('secs_running'),sortingField: 'secs_running',},
                  {id: 'ns',header: 'Namespace',cell: item => item['ns'],ariaLabel: createLabelFunction('ns'),sortingField: 'ns',},
                  {id: 'op',header: 'Operation',cell: item => item['op'],ariaLabel: createLabelFunction('op'),sortingField: 'op',},
                  {id: 'command',header: 'Command',cell: item =>  String(JSON.stringify(item['command'])),ariaLabel: createLabelFunction('command'),sortingField: 'command',}
                  
    ];
    
    const visibleContentNodeSessions = ['opid', 'db', 'client', 'WaitState', 'secs_running', 'ns', 'op', 'command'];
    
    
    
    //-- Analytics Insight
    
    const [selectedMetricAnalytics,setSelectedMetricAnalytics] = useState({label: "CPU Usage",value: "cpu"});
    const analyticsMetricName = useRef({ name : "cpu", descriptions : "CPU Usage", unit : "Percentage" });
                                            
    const analyticsMetrics = [
                                {
                                  label: "Host metrics",
                                  options: [
                                            { label : "CPU Usage", value : "cpu", factor : 60, descriptions : "CPU Usage", unit : "Percentage" },
                                            { label : "Memory Free", value : "memory", factor : 60, descriptions : "Memory Free", unit : "Bytes" },
                                            { label : "IOPS", value : "iops", factor : 60, descriptions : "IOPS", unit : "Count/sec" },
                                            { label : "I/O Reads", value : "ioreads", factor : 60, descriptions : "I/O Reads", unit : "Count/sec" },
                                            { label : "I/O Writes", value : "iowrites", factor : 60, descriptions : "IO Writes", unit : "Count/sec" },
                                            { label : "Network-Total", value : "network", factor : 60, descriptions : "Network Usage", unit : "Bytes/sec" },
                                            { label : "Network-In", value : "netin", factor : 60, descriptions : "Network-In", unit : "Bytes/sec" },
                                            { label : "Network-Out", value : "netout", factor : 60, descriptions : "Network-Out", unit : "Bytes/sec" },
                                  ]
                                },
                                {
                                  label: "Engine metrics",
                                  options: [
                                            { label : "Connections(Current)", value : "connectionsCurrent", descriptions : "Connections(Current)", unit : "Count" },
                                            { label : "Connections(Available)", value : "connectionsAvailable", descriptions : "Connections(Available)", unit : "Count" },
                                            { label : "Connections(Created)", value : "connectionsCreated", descriptions : "Connections(Created)", unit : "Count/sec" },
                                            { label : "Operations", value : "operations", descriptions : "Total operations", unit : "Count/sec" },
                                            { label : "opsInsert", value : "opsInsert", descriptions : "Insert operations", unit : "Count/sec" },
                                            { label : "opsQuery", value : "opsQuery", descriptions : "Query Operations", unit : "Count/sec" },
                                            { label : "opsUpdate", value : "opsUpdate", descriptions : "Update Operations", unit : "Count/sec" },
                                            { label : "opsDelete", value : "opsDelete", descriptions : "Delete Operations", unit : "Count/sec" },
                                            { label : "opsGetmore", value : "opsGetmore", descriptions : "Getmore Operations", unit : "Count/sec" },
                                            { label : "opsCommand", value : "opsCommand", descriptions : "Command Operations", unit : "Count/sec" },
                                            { label : "docOperations", value : "docops", descriptions : "Total document Operations", unit : "Count/sec" },
                                            { label : "docsDeleted", value : "docsDeleted", descriptions : "Documents deleted", unit : "Count/sec" },
                                            { label : "docsInserted", value : "docsInserted", descriptions : "Documents inserted", unit : "Count/sec" },
                                            { label : "docsUpdated", value : "docsUpdated", descriptions : "Documents updated", unit : "Count/sec" },
                                            { label : "docsReturned", value : "docsReturned", descriptions : "Documents returned", unit : "Count/sec" },
                                            { label : "Transactions(Active)", value : "transactionsActive", descriptions : "Active trasactions", unit : "Count" },
                                            { label : "Transactions(Commited)", value : "transactionsCommited", descriptions : "Commited transactions", unit : "Count/sec" },
                                            { label : "Transactions(Aborted)", value : "transactionsAborted", descriptions : "Aborted transactions", unit : "Count/sec" },
                                            { label : "Transactions(Started)", value : "transactionsStarted", descriptions : "Started transactions", unit : "Count/sec" },
                                            ]
                                },
                            ];
    
    
    

    //-- Function Gather Metrics
    async function openClusterConnection() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        await Axios.post(`${api_url}/api/documentdb/cluster/open/connection/`,{
                      params: { 
                                connectionId : cnf_connection_id,
                                clusterId : cnf_identifier,
                                username : cnf_username,
                                password : cnf_password,
                                engineType : "documentdb"
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
                  console.log('Timeout API Call : /api/documentdb/cluster/open/connection/' );
                  console.log(err);
                  
              });
              
    }
    

    //-- Function Cluster Gather Stats
    async function gatherClusterStats() {
        
        if (currentTabId.current == "tab01" || currentTabId.current == "tab02") {
        
            var api_url = configuration["apps-settings"]["api_url"];
            
            Axios.get(`${api_url}/api/documentdb/cluster/gather/stats/`,{
                          params: { 
                                    connectionId : cnf_connection_id, 
                                    clusterId : cnf_identifier, 
                                    beginItem : ( (pageId.current-1) * itemsPerPage), 
                                    endItem : (( (pageId.current-1) * itemsPerPage) + itemsPerPage),
                                    engineType : "documentdb",
                                    includeSessions : ( currentTabId.current == "tab02" ? 1 : 0)
                          }
                      }).then((data)=>{
                       
                       var info = data.data.cluster;
                       setClusterStats({ cluster : {...info} });
                         
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/documentdb/cluster/gather/stats/' );
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
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/documentdb/cluster/close/connection/`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier, engineType : "documentdb" }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/documentdb/connection/close/');
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
                                header={ ( currentTabId.current == "tab01" ?
                                                ( comparativeMode.current == "single" ?
                                                        (clusterStats['cluster']['nodes'].length > 0 ? "Instance Mode : " + clusterStats['cluster']['nodes'][instanceIdActive.current].instanceId : "Instance Mode : " ) :
                                                        "Comparative Mode : " + analyticsMetricName.current.descriptions + " ( " + analyticsMetricName.current.unit + " )" 
                                                )
                                                :
                                                ("Session (PID) : " + queryDetails['opid'])
                                        )
                      
                                } 
                                i18nStrings={splitPanelI18nStrings} 
                                closeBehavior="hide"
                                onSplitPanelToggle={({ detail }) => {
                                    
                                    }
                                  }
                  >
                    
                    { splitPanelShow === true && comparativeMode.current == "single" && currentTabId.current == "tab01" &&
                        
                        <div>
                            <table style={{"width":"100%"}}>
                                <tr>  
                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={ (clusterStats['cluster']['nodes'][instanceIdActive.current]['opsInsert'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['opsQuery'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['opsUpdate'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['opsDelete'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['opsCommand'] ) || 0}
                                                title={"Operations/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"24px"}
                                            />
                                    </td>
                                     <td style={{"width":"10%", "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={ (clusterStats['cluster']['nodes'][instanceIdActive.current]['opsInsert'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['opsUpdate'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['opsDelete']  ) || 0}
                                                title={"WriteOps/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                            <br/>        
                                            <br/> 
                                            <CompMetric01 
                                                value={ ( clusterStats['cluster']['nodes'][instanceIdActive.current]['opsQuery']  ) || 0 }
                                                title={"ReadOps/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                    </td>
                                    <td style={{"width":"14%", "padding-left": "1em"}}>  
                                            <ChartRadialBar01 series={JSON.stringify([Math.round(clusterStats['cluster']['nodes'][instanceIdActive.current]['cpu'] || 0)])} 
                                                     height="180px" 
                                                     title={"CPU (%)"}
                                            />
                                         
                                    </td>
                                    <td style={{"width":"22%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['cpu']
                                                                
                                                            ])} 
                                                            title={"CPU Usage (%)"} height="180px" 
                                        />
                                    </td>
                                    <td style={{"width":"22%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['ioreads'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['iowrites']
                                                                
                                                            ])} 
                                                            title={"IOPS"} height="180px" 
                                        />
                                    </td>
                                    <td style={{"width":"22%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['netin'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['netout']
                                                            ])} 
                                                            title={"NetworkTraffic"} height="180px" 
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
                                                value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['opsInsert']  || 0}
                                                title={"opsInsert/sec"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['opsQuery'] || 0}
                                                title={"opsSelect/sec"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['opsDelete']  || 0}
                                                title={"opsDelete/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['opsUpdate'] || 0}
                                                title={"opsUpdate/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['opsGetmore'] || 0}
                                                title={"opsGetmore/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['opsCommand'] || 0}
                                                title={"opsCommand/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['docsInserted'] || 0}
                                                title={"docsInserted/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['docsDeleted'] || 0}
                                                title={"docsDeleted/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['docsUpdated'] || 0}
                                                title={"docsUpdated/sec"}
                                                precision={0}
                                                format={2}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['docsReturned'] || 0}
                                                title={"docsReturned/sec"}
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
                            <table style={{"width":"100%"}}>
                                    <tr> 
                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={ clusterStats['cluster']['nodes'][instanceIdActive.current]['connectionsCurrent']  || 0}
                                                title={"Connections"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['connectionsAvailable'] || 0}
                                                title={"ConnectionsAvailable"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['connectionsCreated']  || 0}
                                                title={"Connections/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['transactionsActive'] || 0}
                                                title={"transActive"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['transactionsCommited'] || 0}
                                                title={"transCommited/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['transactionsAborted'] || 0}
                                                title={"transAborted/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['ioreads'] || 0}
                                                title={"IO Reads/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['iowrites'] || 0}
                                                title={"IO Writes/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['netin'] || 0}
                                                title={"Network-In"}
                                                precision={0}
                                                format={2}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['netout'] || 0}
                                                title={"Network-Out"}
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
                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['connectionsCurrent']
                                                            ])} 
                                                            title={"Connections"} height="180px" 
                                        />  
                                    </td>
                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['opsInsert'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['opsQuery'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['opsUpdate'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['opsDelete'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['opsGetmore'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['opsCommand']
                                                                
                                                            ])} 
                                                            title={"Operations/sec"} height="180px" 
                                        />  
                                    </td>
                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['docsDeleted'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['docsInserted'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['docsReturned'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['docsUpdated'],
                                                                
                                                            ])} 
                                                            title={"DocumentOps/sec"} height="180px" 
                                        />
                                    </td>
                                    
                                  </tr>
                            </table>
                            
                            <br/>
                            <br/>
                            
                            <div style={{"height": "450px"}}>  
                                <CustomTable02
                                        columnsTable={columnsTableNodeSessions}
                                        visibleContent={visibleContentNodeSessions}
                                        dataset={clusterStats['cluster']['nodes'][instanceIdActive.current]['sessions']}
                                        title={"Active Sessions"}
                                        description={""}
                                        pageSize={10}
                                        extendedTableProperties = {
                                            { variant : "borderless" }
                                            
                                        }
                                />
                            </div> 
                        </div>
                    } 
                    
                    { splitPanelShow === true && comparativeMode.current == "multi" && currentTabId.current == "tab01" &&
                    <>  
                        <table style={{"width":"100%", "padding": "1em"}}>
                            <tr>  
                                <td valign="top" style={{ "width":"30%", "padding": "1em"}}>
                                    <FormField
                                          description="Select a metric to compare instance performance."
                                          label="Performance Metric"
                                        >
                                        
                                            <Select
                                                  selectedOption={selectedMetricAnalytics}
                                                  onChange={({ detail }) => {
                                                         analyticsMetricName.current = { name : detail.selectedOption.value, descriptions : detail.selectedOption.descriptions, unit : detail.selectedOption.unit };
                                                         setSelectedMetricAnalytics(detail.selectedOption);
                                                         gatherClusterStats();
                                                  }
                                                  }
                                                  options={analyticsMetrics}
                                                  filteringType="auto"
                                            />
                                    </FormField>
                                    <ChartColumn01 
                                        series={metricDetailsToColumnsBar(clusterStats['cluster']['nodes'],analyticsMetricName.current.name)} 
                                        height="200px" 
                                    />
                                </td>
                                <td style={{"width":"70%", "padding-left": "1em"}}>  
                                    <ChartLine02 
                                        series={JSON.stringify(metricDetailsToColumnsLine(clusterStats['cluster']['nodes'],analyticsMetricName.current.name))} 
                                        height="250px" 
                                      />
                                </td>
                            </tr>
                        </table>
                    </>  
                    }
                    
                    { splitPanelShow === true &&  currentTabId.current == "tab02" &&
                    <div>
                         
                         
                        <table style={{"width":"100%"}}>
                            <tr>
                                
                                <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                    <div>{queryDetails['opid']}</div>
                                    <Box variant="awsui-key-label">PID</Box>
                                </td>
                                <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                    <div>{queryDetails['instanceId']}</div>
                                    <Box variant="awsui-key-label">InstanceId</Box>
                                </td>
                                <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                    <div>{queryDetails['$db']}</div>
                                    <Box variant="awsui-key-label">Database</Box>
                                </td>
                                <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                    <div>{queryDetails['client']}</div>
                                    <Box variant="awsui-key-label">Host</Box>
                                </td>
                                <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                    <div>{queryDetails['WaitState']}</div>
                                    <Box variant="awsui-key-label">WaitType</Box>
                                </td>
                                <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                    <div>{queryDetails['ns']}</div>
                                    <Box variant="awsui-key-label">Namespace</Box>
                                </td>
                                <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                    <div>{queryDetails['op']}</div>
                                    <Box variant="awsui-key-label">Operation</Box>
                                </td>
                            </tr>
                        </table>
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                            <tr>
                                <td style={{"width":"50%"}}>  
                                        <Box variant="awsui-key-label">Command</Box>
                                        <Textarea
                                          rows = {20}
                                          value={JSON.stringify(queryDetails['command'],undefined,4)}
                                        />
                                </td>
                                <td style={{"width":"50%", "padding-left": "1em",}}>  
                                        <Box variant="awsui-key-label">Originating Command</Box>
                                        <Textarea
                                          rows = {20}
                                          value={JSON.stringify(queryDetails['originatingCommand'],undefined,4)}
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
                                    <td style={{"width":"55%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                                        <SpaceBetween direction="horizontal" size="xs">
                                            { clusterStats['cluster']['status'] != 'available' &&
                                                <Spinner size="big" />
                                            }
                                            <Box variant="h3" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
                                        </SpaceBetween>
                                    </td>
                                    <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <StatusIndicator type={clusterStats['cluster']['status'] === 'available' ? 'success' : 'pending'}> {clusterStats['cluster']['status']} </StatusIndicator>
                                        <Box variant="awsui-key-label">Status</Box>
                                    </td>
                                    <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{clusterStats['cluster']['totalNodes']}</div>
                                        <Box variant="awsui-key-label">Nodes</Box>
                                    </td>
                                    <td style={{"width":"15%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
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
                                          
                                          <div>
                                            <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                <tr>  
                                                   <td> 
            
                                                        <Container>
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>  
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={ (clusterStats.cluster.opsInsert + clusterStats.cluster.opsQuery + clusterStats.cluster.opsUpdate + clusterStats.cluster.opsDelete + clusterStats.cluster.opsCommand ) || 0}
                                                                                    title={"Operations/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                        </td>
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={ (clusterStats.cluster.opsInsert + clusterStats.cluster.opsUpdate + clusterStats.cluster.opsDelete  ) || 0}
                                                                                    title={"WriteOps/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                                <br/>        
                                                                                <br/> 
                                                                                <CompMetric01 
                                                                                    value={ ( clusterStats.cluster.opsQuery  ) || 0 }
                                                                                    title={"ReadOps/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                        </td>
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                                <ChartRadialBar01 series={JSON.stringify([Math.round(clusterStats.cluster.cpu || 0)])} 
                                                                                         height="180px" 
                                                                                         title={"CPU (%)"}
                                                                                />
                                                                             
                                                                        </td>
                                                                        <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.cpu
                                                                                                ])} 
                                                                                            title={"CPU Usage(%)"} height="180px" 
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.ioreads,
                                                                                                    clusterStats.cluster.history.iowrites
                                                                                                    
                                                                                                ])} 
                                                                                            title={"IOPS"} height="180px" 
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.netin,
                                                                                                    clusterStats.cluster.history.netout
                                                                                                ])} 
                                                                                            title={"NetworkTraffic"} height="180px" 
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
                                                                                value={ clusterStats.cluster.opsInsert  || 0}
                                                                                title={"opsInsert/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.opsQuery || 0}
                                                                                title={"opsSelect/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.opsDelete  || 0}
                                                                                title={"opsDelete/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.opsUpdate || 0}
                                                                                title={"opsUpdate/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.opsGetmore || 0}
                                                                                title={"opsGetmore/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.opsCommand || 0}
                                                                                title={"opsCommand/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.docsInserted || 0}
                                                                                title={"docsInserted/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.docsDeleted || 0}
                                                                                title={"docsDeleted/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.docsUpdated || 0}
                                                                                title={"docsUpdated/sec"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.docsReturned || 0}
                                                                                title={"docsReturned/sec"}
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
                                                            <table style={{"width":"100%"}}>
                                                                    <tr> 
                                                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={ clusterStats.cluster.connectionsCurrent  || 0}
                                                                                title={"Connections"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.connectionsAvailable || 0}
                                                                                title={"ConnectionsAvailable"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.connectionsCreated  || 0}
                                                                                title={"Connections/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.transactionsActive || 0}
                                                                                title={"transActive"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.transactionsCommited || 0}
                                                                                title={"transCommited/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.transactionsAborted || 0}
                                                                                title={"transAborted/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.ioreads || 0}
                                                                                title={"IO Reads/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.iowrites || 0}
                                                                                title={"IO Writes/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.netin || 0}
                                                                                title={"Network-In"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.netout || 0}
                                                                                title={"Network-Out"}
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
                                                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.connectionsCurrent
                                                                                            ])} 
                                                                                        title={"Sessions"} height="180px" 
                                                                        />  
                                                                    </td>
                                                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.opsInsert,
                                                                                                clusterStats.cluster.history.opsQuery,
                                                                                                clusterStats.cluster.history.opsUpdate,
                                                                                                clusterStats.cluster.history.opsDelete,
                                                                                                clusterStats.cluster.history.opsGetmore,
                                                                                                clusterStats.cluster.history.opsCommand
                                                                                            ])} 
                                                                                        title={"Operations/sec"} height="180px" 
                                                                        />  
                                                                    </td>
                                                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.docsDeleted,
                                                                                                clusterStats.cluster.history.docsInserted,
                                                                                                clusterStats.cluster.history.docsReturned,
                                                                                                clusterStats.cluster.history.docsUpdated,
                                                                                                
                                                                                            ])} 
                                                                                        title={"DocumentOps/sec"} height="180px" 
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
                                                        columnsTable={columnsTableInstances}
                                                        visibleContent={visibleContentInstances}
                                                        dataset={clusterStats.cluster.nodes}
                                                        title={"Instances"}
                                                        description={""}
                                                        pageSize={20}
                                                        onSelectionItem={( item ) => {
                                                            var iPosition = 0;
                                                            for (let iNode = 0 ; iNode < clusterStats.cluster.nodes.length; iNode ++){
                                                                if(clusterStats.cluster.nodes[iNode].instanceId == item[0].instanceId)
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
                                           
                                          </div>
                                          
                                      },
                                      {
                                        label: "Active Sessions",
                                        id: "tab02",
                                        content: 
                                            <div style={{"padding": "1em"}}>
                                                <CustomTable02
                                                        columnsTable={columnsTable}
                                                        visibleContent={visibleContent}
                                                        dataset={clusterStats['cluster']['sessions']}
                                                        title={"Active Sessions"}
                                                        description={"Top 10 database active sessions"}
                                                        pageSize={20}
                                                        onSelectionItem={( item ) => {
                                                            setQueryDetails(item[0]);
                                                            setsplitPanelShow(true);
                                                          }
                                                        }
                                                        extendedTableProperties = {
                                                            { onSortingChange1 : "borderless" }
                                                            
                                                        }
                                                />
                                            </div> 
                                          
                                      },
                                      {
                                        label: "CloudWatch Metrics",
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
                                                                      description={"AWS CloudWatch metrics from last 30 minutes."}
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
                                                                  title="CPU Utilization % " 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="CPUUtilization"
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
                                                                  title="FreeableMemory" 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="FreeableMemory"
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
                                                                  title="NetworkReceive" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="NetworkReceiveThroughput"
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
                                                                  title="NetworkTransmit" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="NetworkTransmitThroughput"
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
                                                                  title="ReadIOPS" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="ReadIOPS"
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
                                                                  title="WriteIOPS" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="WriteIOPS"
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
                                                                  subtitle="Total" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DatabaseConnections"
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
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
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
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
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
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
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
                                                                  namespace="AWS/DocDB"
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
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
                                                           
                                                        </Container>
                                                
                                                    </td>
                                                </tr>
                                            </table> 
                                            
                                          </>
                                          
                                      },
                                      {
                                        label: "Cluster Information",
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
                                                                            <Box variant="awsui-key-label">Version</Box>
                                                                            <div>{cnf_version}</div>
                                                                        </div>
                                                                        <div>
                                                                            <Box variant="awsui-key-label">Availability Zone</Box>
                                                                            <div>{cnf_az}</div>
                                                                        </div>
                                                                        <div>
                                                                            <Box variant="awsui-key-label">Nodes</Box>
                                                                            <div>{cnf_nodes}</div>
                                                                        </div>
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
