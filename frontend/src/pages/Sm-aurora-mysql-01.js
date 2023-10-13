import { useState,useEffect,useRef } from 'react';
import Axios from 'axios';
import { configuration } from './Configs';
import {classMetric} from '../components/Functions';
import { useSearchParams } from 'react-router-dom';
import CustomHeader from "../components/Header";
import AppLayout from "@awsui/components-react/app-layout";
import Box from "@awsui/components-react/box";
import Tabs from "@awsui/components-react/tabs";
import ColumnLayout from "@awsui/components-react/column-layout";
import { SplitPanel } from '@awsui/components-react';

import Pagination from "@awsui/components-react/pagination";

import Link from "@awsui/components-react/link";
import Header from "@awsui/components-react/header";
import Container from "@awsui/components-react/container";
import AuroraNode  from '../components/CompAuroraNode01';
import CompSparkline01  from '../components/ChartSparkline01';
import CompMetric01  from '../components/Metric01';
import CompMetric04  from '../components/Metric04';
import ChartLine02  from '../components/ChartLine02';
import CLWChart  from '../components/ChartCLW03';
import ChartRadialBar01 from '../components/ChartRadialBar01';
import ChartBar01 from '../components/ChartBar01';
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
    const cnf_engine_class=parameter_object_values["rds_class"];
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
    const historyChartDetails = 20;
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    
      
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    const metricObjectGlobal = useRef(new classMetric([
                                                        {name : "cpu", history : historyChartDetails },
                                                        {name : "memory", history : historyChartDetails },
                                                        {name : "ioreads", history : historyChartDetails },
                                                        {name : "iowrites", history : historyChartDetails },
                                                        {name : "netin", history : historyChartDetails },
                                                        {name : "netout", history : historyChartDetails },
                                                        {name : "queries", history : historyChartDetails },
                                                        {name : "questions", history : historyChartDetails },
                                                        {name : "comSelect", history : historyChartDetails },
                                                        {name : "comInsert", history : historyChartDetails },
                                                        {name : "comDelete", history : historyChartDetails },
                                                        {name : "comUpdate", history : historyChartDetails },
                                                        {name : "comCommit", history : historyChartDetails },
                                                        {name : "comRollback", history : historyChartDetails },
                                                        {name : "threads", history : historyChartDetails },
                                                        {name : "threadsRunning", history : historyChartDetails },
                                                        
    ]));
    
   
    var nodeMetrics = useRef([]);
    var nodeMembers = useRef([]);
    const [metricDetailsIndex,setMetricDetailsIndex] = useState({index : 'cpu', title : 'CPU Usage(%)', timestamp : 0 });
    const [dataMetrics,setDataMetrics] = useState({ 
                                                cpu: 0,
                                                memory: 0,
                                                ioreads: 0,
                                                iowrites: 0,
                                                iops : 0,
                                                netin: 0,
                                                netout: 0,
                                                network : 0,
                                                queries: 0,
                                                questions: 0,
                                                comSelect: 0,
                                                comInsert: 0,
                                                comDelete: 0,
                                                comUpdate: 0,
                                                comCommit: 0,
                                                comRollback: 0,
                                                threads : 0,
                                                threadsRunning : 0,
                                                timestamp : 0,
                                                refObject : new classMetric([
                                                                                {name : "cpu", history : historyChartDetails },
                                                                                {name : "memory", history : historyChartDetails },
                                                                                {name : "ioreads", history : historyChartDetails },
                                                                                {name : "iowrites", history : historyChartDetails },
                                                                                {name : "netin", history : historyChartDetails },
                                                                                {name : "netout", history : historyChartDetails },
                                                                                {name : "queries", history : historyChartDetails },
                                                                                {name : "questions", history : historyChartDetails },
                                                                                {name : "comSelect", history : historyChartDetails },
                                                                                {name : "comInsert", history : historyChartDetails },
                                                                                {name : "comDelete", history : historyChartDetails },
                                                                                {name : "comUpdate", history : historyChartDetails },
                                                                                {name : "comCommit", history : historyChartDetails },
                                                                                {name : "comRollback", history : historyChartDetails },
                                                                                {name : "threads", history : historyChartDetails },
                                                                                {name : "threadsRunning", history : historyChartDetails },
                                                                                ]),
                                                metricDetails : []
                                                
    });
    const [dataNodes,setDataNodes] = useState({ 
                                                    MemberClusters : [],
                                                    ConfigurationEndpoint : "",
                                                    Port : "",
                                                    CacheNodeType : "",
                                                    ReplicationGroupId : "",
                                                    Status : "",
                                                    Version : "",
                                                    Shards : "",
                                                    ConfigurationUid : "",
                                                    ClusterEnabled : "",
                                                    MultiAZ : "",
                                                    DataTiering : "",
                                                    clwDimensions : "",
                                    });
                
    ////-----
    
    //-- Variable for Paging
    const [currentPageIndex,setCurrentPageIndex] = useState(1);
    var pageId = useRef(1);
    var itemsPerPage = configuration["apps-settings"]["items-per-page-aurora-pgs"];
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
                                            queries: 0,
                                            questions: 0,
                                            comSelect: 0,
                                            comInsert: 0,
                                            comDelete: 0,
                                            comUpdate: 0,
                                            comCommit: 0,
                                            comRollback : 0,
                                            threads : 0,
                                            threadsRunning : 0,
                                            history : {
                                                        cpu: [],
                                                        memory: [],
                                                        ioreads: [],
                                                        iowrites: [],
                                                        iops : [],
                                                        netin: [],
                                                        netout: [],
                                                        network : [],
                                                        queries: [],
                                                        questions: [],
                                                        comSelect: [],
                                                        comInsert: [],
                                                        comDelete: [],
                                                        comUpdate: [],
                                                        comCommit: [],
                                                        comRollback : [],
                                                        threads : [],
                                                        threadsRunning : [],
                                            }
                                },
                                nodes : [],
                });
                

    
    
    ////-----



    
    //-- Function Gather Metrics
    async function openClusterConnection() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        await Axios.post(`${api_url}/api/aurora/mysql/cluster/connection/open/`,{
                      params: { 
                                connectionId : cnf_connection_id,
                                clusterId : cnf_identifier,
                                username : cnf_username,
                                password : cnf_password
                             }
              }).then((data)=>{
                
                
                nodeList.current = data.data.nodes;
                  
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aurora/mysql/cluster/connection/open/' );
                  console.log(err);
                  
              });
              
    }
    
    //-- Function Cluster Update Stats
    async function updateClusterStats() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        
        Axios.get(`${api_url}/api/aurora/mysql/cluster/stats/update`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier }
                  }).then((data)=>{
                   
                   //console.log(data);         
                     
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aurora/mysql/cluster/stats/update');
                  console.log(err);
                  
              });
              
    }
    


    //-- Function Cluster Gather Stats
    async function gatherClusterStats() {
        
        if (currentTabId.current != "tab01") {
            return;
        }
        
        var api_url = configuration["apps-settings"]["api_url"];
        
        Axios.get(`${api_url}/api/aurora/mysql/cluster/stats/gather`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier, beginItem : ( (pageId.current-1) * itemsPerPage), endItem : (( (pageId.current-1) * itemsPerPage) + itemsPerPage) }
                  }).then((data)=>{
                   
                   
                   setClusterStats({
                         cluster : data.data.cluster,
                         nodes : data.data.nodes,
                    });
                    
                     
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aurora/mysql/cluster/stats/gather' );
                  console.log(err);
                  
              });
              
        
        
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
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aurora/mysql/cluster/connection/close/`,{
                      params: { connectionId : cnf_connection_id, clusterId : cnf_identifier }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/aurora/mysql/cluster/connection/close/');
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
 

    useEffect(() => {
        openClusterConnection();
    }, []);
    
    useEffect(() => {
        const id = setInterval(updateClusterStats, configuration["apps-settings"]["refresh-interval-documentdb-metrics"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                        series={metricDetailsToColumnsBar(clusterStats['nodes'],metricDetailsIndex.index)} 
                                        height="200px" 
                                    />
                                    
                                </td>
                                <td style={{"width":"70%", "padding-left": "1em"}}>  
                                     <ChartLine02 
                                        series={JSON.stringify(metricDetailsToColumnsLine(clusterStats['nodes'],metricDetailsIndex.index))} 
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
                            <table style={{"width":"100%"}}>
                                <tr>  
                                    <td style={{"width":"50%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                                        <Box variant="h2" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
                                    </td>
                                </tr>
                            </table>
                            
                            <Tabs
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
                                                         
                                                        <Container
                                                          header={
                                                              <Header
                                                                variant="h2"
                                                              >
                                                                Performance Metrics
                                                              </Header>
                                                          }
                                                          
                                                        >
                                
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>  
                                                                        <td style={{"width":"12%", "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.questions || 0}
                                                                                    title={"Questions/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"30px"}
                                                                                />
                                                                        </td>
                                                                         <td style={{"width":"8%", "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={(clusterStats.cluster.comInsert + clusterStats.cluster.comUpdate + clusterStats.cluster.comDelete)   || 0}
                                                                                    title={"WriteOps/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                />
                                                                                <br/>        
                                                                                <br/> 
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.comSelect || 0}
                                                                                    title={"ReadOps/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
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
                                                                                                    clusterStats.cluster.history.netout,
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
                                                                                value={ ( clusterStats.cluster.comCommit + clusterStats.cluster.comRollback) || 0 }
                                                                                title={"Transactions/sec"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.threadsRunning || 0}
                                                                                title={"ThreadsRunning"}
                                                                                precision={0}
                                                                                format={3}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.comSelect  || 0}
                                                                                title={"ComSelect/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.comInsert || 0}
                                                                                    title={"ComInsert/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.comUpdate || 0}
                                                                                    title={"ComUpdate/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                                <CompMetric01 
                                                                                    value={clusterStats.cluster.comDelete || 0}
                                                                                    title={"ComDelete/sec"}
                                                                                    precision={0}
                                                                                    format={1}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.ioreads || 0}
                                                                                title={"IO Reads/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.iowrites || 0}
                                                                                title={"IO Writes/sec"}
                                                                                precision={0}
                                                                                format={1}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.netin || 0}
                                                                                title={"Network-In"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                            />
                                                                        </td>
                                                                        <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <CompMetric01 
                                                                                value={clusterStats.cluster.netout || 0}
                                                                                title={"Network-Out"}
                                                                                precision={0}
                                                                                format={2}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
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
                                                                                                clusterStats.cluster.history.threads,
                                                                                                clusterStats.cluster.history.threadsRunning
                                                                                            ])} 
                                                                                            title={"Threads"} height="180px" 
                                                                        />  
                                                                    </td>
                                                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.questions
                                                                                            ])} 
                                                                                            title={"Questions/sec"} height="180px" 
                                                                        />  
                                                                    </td>
                                                                    <td style={{"width":"33%", "padding-left": "1em"}}>  
                                                                         <ChartLine02 series={JSON.stringify([
                                                                                                clusterStats.cluster.history.comSelect,
                                                                                                clusterStats.cluster.history.comDelete,
                                                                                                clusterStats.cluster.history.comInsert,
                                                                                                clusterStats.cluster.history.comUpdate
                                                                                                
                                                                                            ])} 
                                                                                            title={"Operations/sec"} height="180px" 
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
                                                                            <td style={{ "width":"6%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                Monitoring
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() =>  onClickMetric('questions','Questions/sec')}>Questions/sec</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('threads','Threads')}>Threads</Link>
                                                                            </td>
                                                                            <td style={{ "width":"9%", "text-align":"center","font-size": "12px", "font-weight": "600", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                                                <Link fontSize="body-s" onFollow={() => onClickMetric('threadsRunning','ThreadsRunning')}>ThreadsRunning</Link>
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
                                                                            
                                                                            {clusterStats.nodes.map((item,key) => (
                                                                                           
                                                                                                 <AuroraNode
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
                                        label: "CloudWatch Metrics",
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
                                                                  title="SelectThroughput" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="SelectThroughput"
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
                                                                  title="SelectLatency" 
                                                                  subtitle="Average(ms)" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="SelectLatency"
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
                                                                  title="UpdateThroughput" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="UpdateThroughput"
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
                                                                  title="UpdateLatency" 
                                                                  subtitle="Average(ms)" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="UpdateLatency"
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
                                                                  title="InsertThroughput" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="InsertThroughput"
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
                                                                  title="InsertLatency" 
                                                                  subtitle="Average(ms)" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="InsertLatency"
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
                                                                  title="DeleteThroughput" 
                                                                  subtitle="Total Count/sec" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DeleteThroughput"
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
                                                                  title="DeleteLatency" 
                                                                  subtitle="Average(ms)" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="DeleteLatency"
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
                                                                  title="ReadLatency" 
                                                                  subtitle="Average(ms)" 
                                                                  height="180px"
                                                                  color="orange" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="ReadLatency"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_per_second={0}
                                                                  metric_precision={2}
                                                                  format={3}
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
                                                                  title="WriteLatency" 
                                                                  subtitle="Average(ms)" 
                                                                  height="180px"
                                                                  color="purple" 
                                                                  namespace="AWS/RDS" 
                                                                  dimension_name={"DBInstanceIdentifier"}
                                                                  dimension_value={nodeList.current}
                                                                  metric_name="WriteLatency"
                                                                  stat_type="Average"
                                                                  period={60} 
                                                                  interval={(60*1) * 60000}
                                                                  current_metric_mode={"average"}
                                                                  metric_precision={2}
                                                                  format={3}
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
                                        id: "tab03",
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
                                                                            <Box variant="awsui-key-label">ResourceId</Box>
                                                                            <div>{cnf_resource_id}</div>
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
