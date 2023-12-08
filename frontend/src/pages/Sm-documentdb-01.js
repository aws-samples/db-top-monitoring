import { useState,useEffect,useRef } from 'react';
import Axios from 'axios';
import { configuration } from './Configs';
import { useSearchParams } from 'react-router-dom';
import CustomHeader from "../components/Header";
import Box from "@awsui/components-react/box";
import Tabs from "@awsui/components-react/tabs";
import ColumnLayout from "@awsui/components-react/column-layout";
import { SplitPanel } from '@awsui/components-react';
import AppLayout from "@awsui/components-react/app-layout";

import { createLabelFunction } from '../components/Functions';
import CustomTable from "../components/Table01";

import Flashbar from "@awsui/components-react/flashbar";
import StatusIndicator from "@awsui/components-react/status-indicator";
import Spinner from "@awsui/components-react/spinner";

import SpaceBetween from "@awsui/components-react/space-between";
import Pagination from "@awsui/components-react/pagination";
import Link from "@awsui/components-react/link";
import Header from "@awsui/components-react/header";
import Container from "@awsui/components-react/container";
import DocumentDBNode  from '../components/CompDocumentDBNode01';
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
    const [metricDetailsIndex,setMetricDetailsIndex] = useState({index : 'cpu', title : 'CPU Usage(%)', timestamp : 0 });
    
    
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
                  {id: 'db',header: 'Database',cell: item => item['$db'] || "-",ariaLabel: createLabelFunction('db'),sortingField: 'db',},
                  {id: 'client',header: 'Host',cell: item => item['client'],ariaLabel: createLabelFunction('client'),sortingField: 'client',},
                  {id: 'WaitState',header: 'WaitType',cell: item => item['WaitState'] || "-",ariaLabel: createLabelFunction('WaitState'),sortingField: 'WaitState',},
                  {id: 'secs_running',header: 'ElapsedTime(sec)',cell: item => item['secs_running'],ariaLabel: createLabelFunction('secs_running'),sortingField: 'secs_running',},
                  {id: 'ns',header: 'Namespace',cell: item => item['ns'],ariaLabel: createLabelFunction('ns'),sortingField: 'ns',},
                  {id: 'op',header: 'Operation',cell: item => item['op'],ariaLabel: createLabelFunction('op'),sortingField: 'op',},
                  {id: 'command',header: 'Command',cell: item =>  String(JSON.stringify(item['command'])),ariaLabel: createLabelFunction('command'),sortingField: 'command',}
                  
    ];
    
    const visibleContent = ['instanceId', 'opid', 'db', 'client', 'WaitState', 'secs_running', 'ns', 'command'];

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
    

    function onClickMetric(metricId,metricTitle) {
        
        var timeNow = new Date();
        
        setMetricDetailsIndex ({ index : metricId, title : metricTitle, timestamp : timeNow.getTime() });
        setsplitPanelShow(true);
                                                      
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
        splitPanelSize={300}
        splitPanel={
                  <SplitPanel  header={metricDetailsIndex.title} i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                    onSplitPanelToggle={({ detail }) => {
                                    
                                    }
                                  }
                  >
                    
                    { splitPanelShow === true &&
                    
                    <table style={{"width":"100%", "padding": "1em"}}>
                        <tr>  
                            <td style={{"width":"30%", "padding-left": "1em"}}>  
                                
                                <ChartColumn01 
                                    series={metricDetailsToColumnsBar(clusterStats['cluster']['nodes'],metricDetailsIndex.index)} 
                                    height="200px" 
                                />
                                
                            </td>
                            <td style={{"width":"70%", "padding-left": "1em"}}>  
                                 <ChartLine02 
                                    series={JSON.stringify(metricDetailsToColumnsLine(clusterStats['cluster']['nodes'],metricDetailsIndex.index))} 
                                    height="200px" 
                                  />
                            </td>
                        </tr>
                    </table>
                     
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
                                            <Box variant="h2" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
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
                                          
                                          <>
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
                                                        <br/>
                                                        
                                                        <Container
                                                        
                                                                    header={
                                                                                <Header
                                                                                  variant="h2"
                                                                                  actions={
                                                                                        <Pagination
                                                                                              currentPageIndex={currentPageIndex}
                                                                                              onChange={({ detail }) => {
                                                                                                        setCurrentPageIndex(detail.currentPageIndex);
                                                                                                        pageId.current = detail.currentPageIndex;
                                                                                                        gatherClusterStats();
                                                                                                }
                                                                                              }
                                                                                              pagesCount={ totalPages } 
                                                                                        />
                                                                                      
                                                                                  }
                                                                                >
                                                                                  Instances
                                                                                </Header>
                                                                            }
                                                        
                                                        >
                                                            <table style={{"width":"100%" }}>
                                                                        <tr>
                                                                            <td style={{ "width":"9%", "text-align":"left","padding-left":"1em", "font-size": "12px", "font-weight": "600"}}>
                                                                                Instance
                                                                            </td>
                                                                            <td style={{ "width":"6%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                Status
                                                                            </td>
                                                                            <td style={{ "width":"6%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                InstanceType
                                                                            </td>
                                                                            <td style={{ "width":"6%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                AvailabilityZone
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() =>  onClickMetric('operations','Operations/sec')}>Operations/sec</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('docops','DocumentOps/sec')}>DocumentOps/sec</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('connectionsCurrent','Connections')}>Connections</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('connectionsCreated','Connections/sec')}>Connections/sec</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('cpu','CPU(%)')}>CPU(%)</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                    <Link fontSize="body-s" onFollow={() => onClickMetric('memory','MemoryFree')}>MemoryFree</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('iops','IOPS')}>IOPS</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('network','Network')}>Network</Link>
                                                                            </td>
                                                                        </tr>
                                                                                
                                                                        {clusterStats.cluster.nodes.map((item,key) => (
                                                                                           
                                                                                                 <DocumentDBNode
                                                                                                    sessionId = {cnf_connection_id}
                                                                                                    clusterId = {cnf_identifier}
                                                                                                    nodeStats={item}
                                                                                                />
                                                                                           
                                                                                            
                                                                           
                                                                            ))}
                                                            </table>
                                                
                                                        </Container>
                                                    </td>
                                                </tr>
                                            </table>  
                                                
                                           
                                          </>
                                          
                                      },
                                      {
                                        label: "Active Sessions",
                                        id: "tab02",
                                        content: 
                                         
                                          <>
                                              <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                    <tr>  
                                                        <td>
                                                            <CustomTable
                                                              columnsTable={columnsTable}
                                                              visibleContent={visibleContent}
                                                              dataset={clusterStats['cluster']['sessions']}
                                                              title={"Active Sessions"}
                                                              description={"Top 10 database active sessions"}
                                                            />
                                                        </td>
                                                    </tr>
                                                </table> 
                                                
                                          </>
                                          
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
