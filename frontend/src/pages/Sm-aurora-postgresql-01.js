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

import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Select from "@cloudscape-design/components/select";
import Badge from "@cloudscape-design/components/badge";
import Flashbar from "@cloudscape-design/components/flashbar";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Spinner from "@cloudscape-design/components/spinner";

import { createLabelFunction, customFormatNumberLong, customFormatNumber, customFormatNumberShort } from '../components/Functions';
import CustomTable from "../components/Table01";
import CustomTable02 from "../components/Table02";

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
    const cnf_resource_id=parameter_object_values["rds_resource_id"];
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
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [splitPanelSize, setSplitPanelSize] = useState(400);
    var comparativeMode = useRef("single");
    

    //-- Variable for Paging
    const [currentPageIndex,setCurrentPageIndex] = useState(1);
    var pageId = useRef(1);
    var itemsPerPage = configuration["apps-settings"]["items-per-page-aurora"];
    var totalPages = Math.trunc( parameter_object_values['rds_nodes'] / itemsPerPage) + (  parameter_object_values['rds_nodes'] % itemsPerPage != 0 ? 1 : 0 ) 
    
    //-- Variable for Cluster Stats
    const nodeList = useRef("");
    const [clusterStats,setClusterStats] = useState({ 
                                cluster : {
                                            cpu: 0,
                                            memory: 0,
                                            ioreads: 0,
                                            iowrites: 0,
                                            iops : 0,
                                            netin: 0,
                                            netout: 0,
                                            network : 0,
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
                                            lastUpdate : "-",
                                            connectionId : "-",
                                            totalNodes : 0,
                                            history : {
                                                        cpu: [],
                                                        memory: [],
                                                        ioreads: [],
                                                        iowrites: [],
                                                        iops : [],
                                                        netin: [],
                                                        netout: [],
                                                        network : [],
                                                        xactTotal: [],
                                                        xactCommit: [],
                                                        xactRollback: [],
                                                        tupReturned: [],
                                                        tupFetched: [],
                                                        tupDeleted: [],
                                                        tupInserted: [],
                                                        tupUpdated: [],
                                                        numbackends: [],
                                                        numbackendsActive: [],
                                            },
                                            nodes : [],
                                            sessions : []
                                },
                });
                

    //-- Active Sessions
    
    const columnsTable =  [
                  {id: 'instanceId',header: 'InstanceId',cell: item => item['instanceId'],ariaLabel: createLabelFunction('instanceId'),sortingField: 'instanceId',},
                  {id: 'PID',header: 'PID',cell: item => item['PID'],ariaLabel: createLabelFunction('PID'),sortingField: 'ThreadID',},
                  {id: 'Username',header: 'Username',cell: item => item['Username'],ariaLabel: createLabelFunction('Username'),sortingField: 'Username',},
                  {id: 'State',header: 'State',cell: item => item['State'] ,ariaLabel: createLabelFunction('State'),sortingField: 'State',},
                  {id: 'Host',header: 'Host',cell: item => item['Host'],ariaLabel: createLabelFunction('Host'),sortingField: 'Host',},
                  {id: 'WaitEvent',header: 'WaitEvent',cell: item => item['WaitEvent'] ,ariaLabel: createLabelFunction('WaitEvent'),sortingField: 'WaitEvent',},
                  {id: 'Database',header: 'Database',cell: item => item['Database'],ariaLabel: createLabelFunction('Database'),sortingField: 'Database',},
                  {id: 'ElapsedTime',header: 'ElapsedTime',cell: item => item['ElapsedTime'],ariaLabel: createLabelFunction('ElapsedTime'),sortingField: 'ElapsedTime',},
                  {id: 'AppName',header: 'AppName',cell: item => item['AppName'],ariaLabel: createLabelFunction('AppName'),sortingField: 'AppName',},
                  {id: 'SQLText',header: 'SQLText',cell: item => item['SQLText'],ariaLabel: createLabelFunction('SQLText'),sortingField: 'SQLText',}
    ];
    
    const visibleContent = ['instanceId', 'PID', 'Username', 'State', 'Host', 'WaitEvent', 'Database', 'ElapsedTime', 'AppName', 'SQLText' ];
    
    
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
                  {id: 'monitoring',header: 'Monitoring',cell: item => <Badge color="red">{item.monitoring}</Badge>,ariaLabel: createLabelFunction('monitoring'),sortingField: 'monitoring',},
                  {id: 'xactTotal',header: 'Transactions/sec',cell: item => customFormatNumberShort(item['xactTotal'],0),ariaLabel: createLabelFunction('xactTotal'),sortingField: 'xactTotal',},
                  {id: 'tuples',header: 'Tuples/sec',cell: item => customFormatNumberLong(item['tupFetched'] + item['tupDeleted'] + item['tupInserted'] + item['tupUpdated'] ,0),ariaLabel: createLabelFunction('tuples'),sortingField: 'tuples',},
                  {id: 'numbackends',header: 'Threads',cell: item => item['numbackends'],ariaLabel: createLabelFunction('numbackends'),sortingField: 'numbackends',},
                  {id: 'numbackendsActive',header: 'ThreadsRunning',cell: item => item['numbackendsActive'],ariaLabel: createLabelFunction('numbackendsActive'),sortingField: 'numbackendsActive',},
                  {id: 'cpu',header: 'CPU',cell: item => customFormatNumberLong(item['cpu'],0),ariaLabel: createLabelFunction('cpu'),sortingField: 'cpu',},
                  {id: 'memory',header: 'MemoryFree',cell: item => customFormatNumber(item['memory'],0),ariaLabel: createLabelFunction('memory'),sortingField: 'memory',},
                  {id: 'iops',header: 'IOPS',cell: item => customFormatNumberLong(item['iops'],0),ariaLabel: createLabelFunction('iops'),sortingField: 'iops',},
                  {id: 'network',header: 'Network',cell: item => customFormatNumber(item['network'],0),ariaLabel: createLabelFunction('network'),sortingField: 'network',},
                  
    ];
    const visibleContentInstances = ['name', 'status', 'size', 'az', 'monitoring', 'xactTotal', 'tuples', 'numbackends', 'numbackendsActive', 'cpu', 'memory', 'iops', 'network' ];
    
    
                                                        
    //-- Node Sessions
    
    const columnsTableNodeSessions =  [
                  {id: 'PID',header: 'PID',cell: item => item['PID'],ariaLabel: createLabelFunction('PID'),sortingField: 'ThreadID',},
                  {id: 'Username',header: 'Username',cell: item => item['Username'],ariaLabel: createLabelFunction('Username'),sortingField: 'Username',},
                  {id: 'State',header: 'State',cell: item => item['State'] ,ariaLabel: createLabelFunction('State'),sortingField: 'State',},
                  {id: 'Host',header: 'Host',cell: item => item['Host'],ariaLabel: createLabelFunction('Host'),sortingField: 'Host',},
                  {id: 'WaitEvent',header: 'WaitEvent',cell: item => item['WaitEvent'] ,ariaLabel: createLabelFunction('WaitEvent'),sortingField: 'WaitEvent',},
                  {id: 'Database',header: 'Database',cell: item => item['Database'],ariaLabel: createLabelFunction('Database'),sortingField: 'Database',},
                  {id: 'ElapsedTime',header: 'ElapsedTime',cell: item => item['ElapsedTime'],ariaLabel: createLabelFunction('ElapsedTime'),sortingField: 'ElapsedTime',},
                  {id: 'AppName',header: 'AppName',cell: item => item['AppName'],ariaLabel: createLabelFunction('AppName'),sortingField: 'AppName',},
                  {id: 'SQLText',header: 'SQLText',cell: item => item['SQLText'],ariaLabel: createLabelFunction('SQLText'),sortingField: 'SQLText',}
    ];
    
    const visibleContentNodeSessions = ['PID', 'Username', 'State', 'Host', 'WaitEvent', 'Database', 'ElapsedTime', 'AppName', 'SQLText' ];
    
    
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
                                            { label : "Transactions", value : "xactTotal", descriptions : "Transactions", unit : "Count/sec" },
                                            { label : "Commits", value : "xactCommit", descriptions : "Commits", unit : "Count/sec" },
                                            { label : "Rollbacks", value : "xactRollback", descriptions : "Rollbacks", unit : "Count/sec" },
                                            { label : "Tuples Returned", value : "tupReturned", descriptions : "Tuples Returned", unit : "Count/sec" },
                                            { label : "Tuples Fetched", value : "tupFetched", descriptions : "Tuples Fetched", unit : "Count/sec" },
                                            { label : "Tuples Deleted", value : "tupDeleted", descriptions : "Tuples Deleted", unit : "Count/sec" },
                                            { label : "Tuples Inserted", value : "tupInserted", descriptions : "Tuples Inserted", unit : "Count/sec" },
                                            { label : "Tuples Updated", value : "tupUpdated", descriptions : "Tuples Updated", unit : "Count/sec" },
                                            { label : "Backends", value : "numbackends", descriptions : "Backends", unit : "Count" },
                                            { label : "Backends Runnning", value : "numbackendsActive", descriptions : "Backends Runnning", unit : "Count" },
                                            ]
                                },
                            ];
    
    
    //-- Function Gather Metrics
    async function openClusterConnection() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        await Axios.post(`${api_url}/api/aurora/cluster/postgresql/open/connection/`,{
                      params: { 
                                connectionId : cnf_connection_id,
                                clusterId : cnf_identifier,
                                username : cnf_username,
                                password : cnf_password,
                                engineType : "aurora-postgresql"
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
                  console.log('Timeout API Call : /api/aurora/cluster/postgresql/open/connection/' );
                  console.log(err);
                  
              });
              
    }
    
   
    //-- Function Cluster Gather Stats
    async function gatherClusterStats() {
        
        if (currentTabId.current == "tab01" || currentTabId.current == "tab02") {
        
        
                var api_url = configuration["apps-settings"]["api_url"];
                
                Axios.get(`${api_url}/api/aurora/cluster/postgresql/gather/stats/`,{
                              params: { connectionId : cnf_connection_id, 
                                        clusterId : cnf_identifier, 
                                        beginItem : ( (pageId.current-1) * itemsPerPage), 
                                        endItem : (( (pageId.current-1) * itemsPerPage) + itemsPerPage),
                                        engineType : "aurora-postgresql",
                                        includeSessions : ( currentTabId.current == "tab02" ? 1 : 0)
                              }
                          }).then((data)=>{
                           
                           var info = data.data.cluster;
                           setClusterStats({ cluster : {...info} });
                             
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/aurora/postgresql/cluster/stats/gather' );
                          console.log(err);
                          
                      });
              
        }
        
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
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aurora/cluster/postgresql/close/connection/`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier, engineType : "aurora-postgresql" }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/aurora/cluster/postgresql/close/connection/');
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
 

    useEffect(() => {
        openClusterConnection();
    }, []);
    
   
    
    useEffect(() => {
        const id = setInterval(gatherClusterStats, configuration["apps-settings"]["refresh-interval-documentdb-metrics"]);
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
                                                (clusterStats['cluster']['nodes'].length > 0 ? "Instance Mode : " + clusterStats['cluster']['nodes'][instanceIdActive.current].instanceId : "Instance Mode : " ) :
                                                "Comparative Mode : " + analyticsMetricName.current.descriptions + " ( " + analyticsMetricName.current.unit + " )" 
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
                            <table style={{"width":"100%"}}>
                                <tr>  
                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['xactTotal']  || 0 }
                                                title={"Transactions/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"24px"}
                                            />
                                    </td>
                                     <td style={{"width":"10%", "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={(clusterStats['cluster']['nodes'][instanceIdActive.current]['tupInserted'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['tupDeleted'] + clusterStats['cluster']['nodes'][instanceIdActive.current]['tupUpdated'])   || 0}
                                                title={"WriteTuples/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                            <br/>        
                                            <br/> 
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['tupFetched'] || 0}
                                                title={"ReadTuples/sec"}
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
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['netout'],
                                                            ])} 
                                                            title={"NetworkTraffic"} height="180px" 
                                        />  
                                    </td>
                                </tr>
                            </table> 
                            <br />
                            <br />
                            <br/>
                            <br/>
                            <table style={{"width":"100%"}}>
                                    <tr> 
                                        <td style={{"width":"10%", "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['numbackends']  || 0 }
                                                title={"Sessions"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['tupFetched'] || 0}
                                                title={"tupFetched/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['tupInserted'] || 0}
                                                title={"tupInserted/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['tupDeleted'] || 0}
                                                title={"tupDeleted/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['tupUpdated'] || 0}
                                                title={"tupUpdated/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['tupReturned']  || 0}
                                                title={"tupReturned/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['ioreads']  || 0}
                                                title={"IO Reads/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['iowrites']  || 0}
                                                title={"IO Writes/sec"}
                                                precision={0}
                                                format={1}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['netin']  || 0}
                                                title={"Network-In"}
                                                precision={0}
                                                format={2}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"16px"}
                                            />
                                        </td>
                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                                value={clusterStats['cluster']['nodes'][instanceIdActive.current]['netout']  || 0}
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
                            <br/>
                            <br/>
                            <br/>
                            <table style={{"width":"100%"}}>
                                  <tr>  
                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['numbackends'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['numbackendsActive']
                                                            ])} 
                                                            title={"Sessions"} height="180px" 
                                        />  
                                    </td>
                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['xactCommit'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['xactRollback'],
                                                                
                                                            ])} 
                                                            title={"Transactions/sec"} height="180px" 
                                        />  
                                    </td>
                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                         <ChartLine02 series={JSON.stringify([
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['tupFetched'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['tupInserted'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['tupDeleted'],
                                                                clusterStats['cluster']['nodes'][instanceIdActive.current]['history']['tupUpdated'],
                                                                
                                                            ])} 
                                                            title={"Tuples/sec"} height="180px" 
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
                    
                    { splitPanelShow === true && comparativeMode.current == "multi" &&
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
                                                <div style={{"padding": "1em"}}>
                                                    
                                                            <Container>
                                    
                                                                    <table style={{"width":"100%"}}>
                                                                        <tr>  
                                                                            <td style={{"width":"12%", "padding-left": "1em"}}>  
                                                                                    <CompMetric01 
                                                                                        value={clusterStats.cluster.xactTotal || 0}
                                                                                        title={"Transactions/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"30px"}
                                                                                    />
                                                                            </td>
                                                                             <td style={{"width":"8%", "padding-left": "1em"}}>  
                                                                                    <CompMetric01 
                                                                                        value={(clusterStats.cluster.tupInserted + clusterStats.cluster.tupDeleted + clusterStats.cluster.tupUpdated)   || 0}
                                                                                        title={"WriteTuples/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"18px"}
                                                                                    />
                                                                                    <br/>        
                                                                                    <br/> 
                                                                                    <CompMetric01 
                                                                                        value={clusterStats.cluster.tupFetched || 0}
                                                                                        title={"ReadTuples/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"18px"}
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
                                                                                                        clusterStats.cluster.history.iowrites,
                                                                                                        
                                                                                                    ])} 
                                                                                                    title={"IOPS"} height="180px" 
                                                                                />
                                                                            </td>
                                                                            <td style={{"width":"22%", "padding-left": "1em"}}>  
                                                                                 <ChartLine02 series={JSON.stringify([
                                                                                                        clusterStats.cluster.history.netin,
                                                                                                        clusterStats.cluster.history.netout,
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
                                                                                    value={clusterStats.cluster.numbackends || 0}
                                                                                    title={"Sessions"}
                                                                                    precision={0}
                                                                                    format={3}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                    <CompMetric01 
                                                                                        value={clusterStats.cluster.tupFetched || 0}
                                                                                        title={"tupFetched/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"18px"}
                                                                                    />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                    <CompMetric01 
                                                                                        value={clusterStats.cluster.tupInserted || 0}
                                                                                        title={"tupInserted/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"18px"}
                                                                                    />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                    <CompMetric01 
                                                                                        value={clusterStats.cluster.tupDeleted || 0}
                                                                                        title={"tupDeleted/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"18px"}
                                                                                    />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                    <CompMetric01 
                                                                                        value={clusterStats.cluster.tupUpdated || 0}
                                                                                        title={"tupUpdated/sec"}
                                                                                        precision={0}
                                                                                        format={1}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"18px"}
                                                                                    />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.tupReturned  || 0}
                                                                                    title={"tupReturned/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.ioreads || 0}
                                                                                    title={"IO Reads/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.iowrites || 0}
                                                                                    title={"IO Writes/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.netin || 0}
                                                                                    title={"Network-In"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                />
                                                                            </td>
                                                                            <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.netout || 0}
                                                                                    title={"Network-Out"}
                                                                                    precision={0}
                                                                                    format={2}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"18px"}
                                                                                />
                                                                            </td>
                                                                            
                                                                        </tr>
                                                                        
                                                                </table>  
                                                                
                                                                <br />
                                                                <br />
                                                                <br />
                                                                <table style={{"width":"100%"}}>
                                                                      <tr>  
                                                                        <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.numbackends,
                                                                                                    clusterStats.cluster.history.numbackendsActive
                                                                                                ])} 
                                                                                                title={"Sessions"} height="180px" 
                                                                            />  
                                                                        </td>
                                                                        <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.xactCommit,
                                                                                                    clusterStats.cluster.history.xactRollback
                                                                                                ])} 
                                                                                                title={"Transactions/sec"} height="180px" 
                                                                            />  
                                                                        </td>
                                                                        <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                             <ChartLine02 series={JSON.stringify([
                                                                                                    clusterStats.cluster.history.tupFetched,
                                                                                                    clusterStats.cluster.history.tupInserted,
                                                                                                    clusterStats.cluster.history.tupDeleted,
                                                                                                    clusterStats.cluster.history.tupUpdated,
                                                                                                ])} 
                                                                                                title={"Tuples/sec"} height="180px" 
                                                                            />
                                                                        </td>
                                                                        
                                                                      </tr>
                                                                </table>
                                                                  
                                                                
                                                            </Container>
                                                            <br/>
                                                            <br/>
                                                            <CustomTable02
                                                                    columnsTable={columnsTableInstances}
                                                                    visibleContent={visibleContentInstances}
                                                                    dataset={clusterStats.cluster.nodes}
                                                                    title={"Instances"}
                                                                    description={""}
                                                                    pageSize={20}
                                                                    onSelectionItem={( item ) => {
                                                                        console.log(item);
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
                                                        
                                          
                                      },
                                      {
                                        label: "Active Sessions",
                                        id: "tab02",
                                        content: 
                                         
                                              <div style={{"padding": "1em"}}>
                                                    <CustomTable
                                                      columnsTable={columnsTable}
                                                      visibleContent={visibleContent}
                                                      dataset={clusterStats['cluster']['sessions']}
                                                      title={"Active Sessions"}
                                                      description={"Top 10 database active sessions"}
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
                                                                  title="CPU Utilization % " 
                                                                  subtitle="Average" 
                                                                  height="180px" 
                                                                  color="purple" 
                                                                  namespace="AWS/RDS"
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
                                                                  namespace="AWS/RDS" 
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
                                                                  namespace="AWS/RDS" 
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
                                                                  namespace="AWS/RDS" 
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
                                                                  title="StorageReceiveThroughput" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="StorageNetworkReceiveThroughput"
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
                                                                  title="StorageTransmitThroughput" 
                                                                  subtitle="Total Bytes/Second" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="StorageNetworkTransmitThroughput"
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
                                                                  namespace="AWS/RDS" 
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
                                                                  title="CommitLatency" 
                                                                  subtitle="Average(ms)" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="CommitLatency"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
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
                                                                  title="CommitThroughput" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="CommitThroughput"
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
                                                                  title="ReadIOPS" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
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
                                                                  title="ReadThroughput" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
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
                                                                  title="WriteIOPS" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
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
                                                                  title="WriteThroughput" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
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
                                                                  title="DBLoadNonCPU" 
                                                                  subtitle="Average" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DBLoadNonCPU"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={2}
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
                                                                  title="DBLoad" 
                                                                  subtitle="Average" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DBLoad"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={2}
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
                                                                <Container header={<Header variant="h2">Configuration</Header>}>
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
