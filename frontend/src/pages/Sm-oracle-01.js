//-- React Events
import { useState,useEffect,useRef } from 'react';
import Axios from 'axios'
import { useSearchParams } from 'react-router-dom';

//-- AWS UI Objects
import AppLayout from "@cloudscape-design/components/app-layout";
import { useCollection } from '@cloudscape-design/collection-hooks';
import {CollectionPreferences,Pagination } from '@cloudscape-design/components';
import TextFilter from "@cloudscape-design/components/text-filter";
import Spinner from "@cloudscape-design/components/spinner";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Flashbar from "@cloudscape-design/components/flashbar";
import Container from "@cloudscape-design/components/container";
import Tabs from "@cloudscape-design/components/tabs";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Badge from "@cloudscape-design/components/badge";
import ProgressBar from "@cloudscape-design/components/progress-bar";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Toggle from "@cloudscape-design/components/toggle";
import { SplitPanel } from '@cloudscape-design/components';

//-- Custom Objects
import CustomHeader from "../components/Header";
import CustomTable from "../components/Table01";
import CompMetric02  from '../components/Metric02';
import CompMetric03  from '../components/Metric03';
import ChartLine02  from '../components/ChartLine02';
import CLWChart  from '../components/ChartCLW01';

//-- Custom Libraries
import { configuration } from './Configs';
import { getMatchesCountText, createLabelFunction, paginationLabels, pageSizePreference, EmptyState } from '../components/Functions';



//-- Variables
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

export default function App() {
    

    //--######## Global Settings
    
    //-- Connection Usage
    const [connectionMessage, setConnectionMessage] = useState([]);
    
    
    //-- Variable for Active Tabs
    const [activeTabId, setActiveTabId] = useState("tab01");
    const currentTabId = useRef("tab01");
    
    //-- Gather Parameters
    const [params]=useSearchParams();
    
    const parameter_code_id=params.get("code_id");  
    const parameter_id=params.get("session_id");  
    var parameter_object_bytes = CryptoJS.AES.decrypt(parameter_id, parameter_code_id);
    var parameter_object_values = JSON.parse(parameter_object_bytes.toString(CryptoJS.enc.Utf8));
    
    //-- Configuration variables
    const cnf_connection_id=parameter_object_values["session_id"];  
    const cnf_rds_id=parameter_object_values["rds_id"];  
    const cnf_rds_host=parameter_object_values["rds_host"];  

    //-- Add token header
    Axios.defaults.headers.common['x-token'] = sessionStorage.getItem(cnf_connection_id);
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    
    //-- Set Page Title
    document.title = configuration["apps-settings"]["application-title"] + ' - ' + cnf_rds_host;
   
   
    //--######## RealTime Metric
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    
    //-- Variable for Pause Collection
    const pauseCollection = useRef(true);
    const [collectionState, setcollectionState] = useState(true);
    
    //-- Performance Counters
    const [instanceStats,setInstanceStats] = useState({ 
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
                                                  userCalls : 0,
                                                  userCommits : 0,
                                                  dbIOWrites : 0,
                                                  dbIOReads : 0,
                                                  redoWrites : 0,
                                                  logons : 0,
                                                  dbBlockChanges : 0,
                                                  dbBlockGets : 0,
                                                  status : "-",
                                                  lastUpdate : "-",
                                                  az : "-",
                                                  hostname : "-",
                                                  uptime : "-",
                                                  history : {
                                                            cpuUsage : [],
                                                            cpuTotal : [],
                                                            cpuUser : [],
                                                            cpuSys : [],
                                                            cpuWait : [],
                                                            cpuIrq : [],
                                                            cpuGuest : [],
                                                            cpuSteal : [],
                                                            cpuNice : [],
                                                            vCpus : [],
                                                            memoryUsage : [],
                                                            memoryTotal : [],
                                                            memoryActive : [],
                                                            memoryInactive : [],
                                                            memoryFree : [],
                                                            ioreadsRsdev : [],
                                                            ioreadsFilesystem : [],
                                                            ioreads : [],
                                                            iowritesRsdev : [],
                                                            iowritesFilesystem : [],
                                                            iowrites: [],
                                                            iops : [],
                                                            tps : [],
                                                            ioqueue : [],
                                                            networkTx : [],
                                                            networkRx : [],
                                                            network : [],
                                                            userCalls : [],
                                                            userCommits : [],
                                                            dbIOWrites : [],
                                                            dbIOReads : [],
                                                            redoWrites : [],
                                                            logons : [],
                                                            dbBlockChanges : [],
                                                            dbBlockGets : [],
                                                  },
                                                  sessions : [],
                                                  processes : []
      });     
    
    
    //--######## Variables for Table - Sessions
    const columnsTable = [
                  {id: 'SID',header: 'SID',cell: item => item[0],ariaLabel: createLabelFunction('SID'),sortingField: 'SID',},
                  {id: 'State',header: 'State',cell: item => item[1],ariaLabel: createLabelFunction('State'),sortingField: 'State',},
                  {id: 'Username',header: 'Username',cell: item => item[2],ariaLabel: createLabelFunction('Username'),sortingField: 'Username',},
                  {id: 'Host',header: 'Host',cell: item => item[3],ariaLabel: createLabelFunction('Host'),sortingField: 'Host',},
                  {id: 'Program',header: 'Program',cell: item => item[4],ariaLabel: createLabelFunction('Program'),sortingField: 'Program',},
                  {id: 'Event',header: 'Event',cell: item => item[5],ariaLabel: createLabelFunction('Event'),sortingField: 'Event',},
                  {id: 'ElapsedTime',header: 'ElapsedTime',cell: item => item[6],ariaLabel: createLabelFunction('ElapsedTime'),sortingField: 'ElapsedTime',},
                  {id: 'SQLID',header: 'SQLID',cell: item => item[7],ariaLabel: createLabelFunction('SQLID'),sortingField: 'SQLID',},
                  {id: 'SQLText',header: 'SQLText',cell: item => item[8],ariaLabel: createLabelFunction('SQLText'),sortingField: 'SQLText',}
                  
    ];


    const visibleContentPreference = {
              title: 'Select visible content',
              options: [
                {
                  label: 'Main properties',
                  options: columnsTable.map(({ id, header }) => ({ id, label: header, editable: id !== 'id' })),
                },
              ],
    };
  
  
   const collectionPreferencesProps = {
            pageSizePreference,
            visibleContentPreference,
            cancelLabel: 'Cancel',
            confirmLabel: 'Confirm',
            title: 'Preferences',
    };
    
   
    const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['SID', 'State', 'Username', 'Host', 'Program', 'Event', 'ElapsedTime', 'SQLID', 'SQLText' ] });
    
    const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
                instanceStats['sessions'],
                {
                  filtering: {
                    empty: <EmptyState title="No Records" />,
                    noMatch: (
                      <EmptyState
                        title="No matches"
                        action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
                      />
                    ),
                  },
                  pagination: { pageSize: preferences.pageSize },
                  sorting: {},
                  selection: {},
                }
    );
  
    
    
    
    //--######## Enhanced Monitoring Feature
    
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
    
    
    //--######## SQL Query Feature
    
    const [dataQuery,setdataQuery] = useState({columns: [], dataset: []});
    const txtSQLText = useRef('');

    
    //--######## Function Validate Connection
    async function validateConnection() {
        
        console.log(parameter_object_values);
        
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        if (parameter_object_values["newObject"]==false) {
            setConnectionMessage([
                          {
                            type: "info",
                            content: "Instance connection already created at [" + parameter_object_values["creationTime"] + "] with identifier [" +  parameter_object_values["connectionId"]  + "], this connection will be re-used to gather metrics.",
                            dismissible: true,
                            dismissLabel: "Dismiss message",
                            onDismiss: () => setConnectionMessage([]),
                            id: "message_1"
                          }
            ]);
        }
              
    }
    

    //--######## Function Instance Gather Stats
    async function gatherInstanceStats() {
        
        if (currentTabId.current == "tab01" || currentTabId.current == "tab03") {
        
            var api_url = configuration["apps-settings"]["api_url"];
            
            Axios.get(`${api_url}/api/rds/instance/oracle/gather/stats/`,{
                          params: { 
                                    connectionId : parameter_object_values["connectionId"], 
                                    instanceId : parameter_object_values["instanceId"], 
                                    engineType : parameter_object_values["engineType"],
                                    includeProcesses : ( currentTabId.current == "tab03" ? 1 : 0)
                          }
                      }).then((data)=>{
                       
                       setInstanceStats(data.data.instance);
                         
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/rds/instance/oracle/gather/stats/' );
                      console.log(err);
                      
                  });
        
        }      
        
        
    }


     //--######## Function Close Database Connection
    const closeDatabaseConnection = () => {
       
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/rds/instance/oracle/close/connection/`,{
                      params: {     connectionId : parameter_object_values["connectionId"], 
                                    instanceId : parameter_object_values["instanceId"], 
                                    engineType : parameter_object_values["engineType"],
                      }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/rds/instance/oracle/close/connection/');
                      console.log(err)
                  });
      
    }


    
   //--######## Function Handle Logout
   const handleClickMenu = ({detail}) => {
          
            switch (detail.id) {
              case 'signout':
                  closeDatabaseConnection();
                break;
                
              case 'other':
                break;
                
              
            }

    };
   
   
   
    
   //--######## Function Handle Logout
   const handleClickDisconnect = () => {
          closeDatabaseConnection();
    };
    
    
   
   
       
    //--######## Function Close TabWindow
    const closeTabWindow = () => {
              window.opener = null;
              window.open("", "_self");
              window.close();
      
    }
    
    
    
    //--######## Function Run Query
    const handleClickRunQuery = () => {

        //--- API Call Run Query
        var api_params = {
                      connectionId : parameter_object_values["connectionId"], 
                      instanceId : parameter_object_values["instanceId"], 
                      engineType : parameter_object_values["engineType"],
                      query : txtSQLText.current.value
          
        };
    
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/rds/instance/oracle/execute/query/`,{
              params: api_params
              }).then((data)=>{
                  
                 var colInfo=[];
                  var rowsInfo=[];
                  try{
                    
                        if (Array.isArray(data.data.metaData)){
                            
                            data.data.metaData.forEach(function(colItem) {
                                colInfo.push({ id: colItem['name'], header: colItem['name'], cell: item => item[colItem['name']],sortingField: colItem['name'],isRowHeader: true });
                            })
                        }
                        if (Array.isArray(data.data.rows)){
                            
                            data.data.rows.forEach(function(rowItem) {
                                var iCol=0;
                                var row=[];
                                data.data.metaData.forEach(colName => {
                                    row[colName['name']] = String(rowItem[iCol]);
                                    iCol++;
                                });
                                rowsInfo.push(row);
                                
                            })
                            
                        }
                        
                    
                  }
                  catch(err) {
                    console.log(err);
                    colInfo = [];
                    rowsInfo = [];
                    
                  }
                  
                  setdataQuery({columns:colInfo, dataset: rowsInfo, result_code:0, result_info: ""});
                  
                  
              })
              .catch((err) => {
                  console.log(err)
                  setdataQuery({columns:[], dataset: [], result_code:1, result_info: err.response.data.sqlMessage});
                  
              });
              
    };
    
    
    //--######## Startup Events
    useEffect(() => {
        validateConnection();
    }, []);
    
    
    useEffect(() => {
        const id = setInterval(gatherInstanceStats, configuration["apps-settings"]["refresh-interval-rds"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
    
  
  return (
    <>
      
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
        splitPanelSize={250}
        splitPanel={
                  <SplitPanel  header={"Session Details (" + selectedItems[0][0] + ")"} i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                    onSplitPanelToggle={({ detail }) => {
                                    
                                    }
                                  }
                  >
                      <table style={{"width":"100%"}}>
                          <tr>  
                              <td style={{"width":"100%","padding-left": "1em"}}>  
                                    <ColumnLayout columns="4" variant="text-grid">
                                         <div>
                                              <Box variant="awsui-key-label">SID</Box>
                                              {selectedItems[0][0]}
                                          </div>
                                          <div>
                                              <Box variant="awsui-key-label">Username</Box>
                                              {selectedItems[0][2]}
                                          </div>
                                          <div>
                                              <Box variant="awsui-key-label">Host</Box>
                                              {selectedItems[0][3]}
                                          </div>
                                          <div>
                                              <Box variant="awsui-key-label">Program</Box>
                                              {selectedItems[0][4]}
                                          </div>
                                        </ColumnLayout>
                                
                                        <ColumnLayout columns="4" variant="text-grid">
                                         <div>
                                              <Box variant="awsui-key-label">ElapsedTime</Box>
                                              {selectedItems[0][6]}
                                          </div>
                                          <div>
                                              <Box variant="awsui-key-label">State</Box>
                                              {selectedItems[0][1]}
                                          </div>
                                          <div>
                                              <Box variant="awsui-key-label">SQLText</Box>
                                              {selectedItems[0][8]}
                                          </div>
                                        
                                        </ColumnLayout>
                                    </td>
                                </tr>
                            </table>    
                        
                  </SplitPanel>
        }
        content={
            <>
                  <Flashbar items={connectionMessage} />
                  <table style={{"width":"100%"}}>
                      <tr>  
                          <td style={{"width":"50%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                              <SpaceBetween direction="horizontal" size="xs">
                                  { instanceStats['status'] != 'available' &&
                                    <Spinner size="big" />
                                  }
                                  <Box variant="h3" color="text-status-inactive" >{parameter_object_values['rds_host']}</Box>
                              </SpaceBetween>
                          </td>
                          <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                              <StatusIndicator type={instanceStats['status'] === 'available' ? 'success' : 'pending'}> {instanceStats['status']} </StatusIndicator>
                              <Box variant="awsui-key-label">Status</Box>
                          </td>
                          <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                              <div>{instanceStats['az']}</div>
                              <Box variant="awsui-key-label">AZ</Box>
                          </td>
                          <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                              <div>{instanceStats['hostname']}</div>
                              <Box variant="awsui-key-label">Hostname</Box>
                          </td>
                          <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                              <div>{instanceStats['uptime']}</div>
                              <Box variant="awsui-key-label">Uptime</Box>
                          </td>
                          <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                              <div>{instanceStats['lastUpdate']}</div>
                              <Box variant="awsui-key-label">LastUpdate</Box>
                          </td>
                      </tr>
                  </table>
                            
                  <Tabs
                    disableContentPaddings
                    onChange={({ detail }) => {
                          setActiveTabId(detail.activeTabId);
                          currentTabId.current=detail.activeTabId;
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
                                                          <td style={{"width":"12.5%","padding-left": "1em"}}>  
                                                              <CompMetric02
                                                                value={instanceStats['cpuUsage'] || 0}
                                                                title={"CPU Usage (%)"}
                                                                precision={0}
                                                                format={3}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"18px"}
                                                              />
                                                              <ProgressBar value={instanceStats['cpuUsage'] || 0}
                                                              />
                                                          </td>
                                                          <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                              <CompMetric02
                                                                value={instanceStats['memoryUsage'] || 0}
                                                                title={"Memory Usage(%)"}
                                                                precision={0}
                                                                format={3}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"18px"}
                                                              />
                                                              <ProgressBar value={instanceStats['memoryUsage'] || 0}
                                                              />
                                                          </td>
                                                          <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                              <CompMetric02
                                                                value={instanceStats['iops'] || 0}
                                                                title={"IOPS"}
                                                                precision={0}
                                                                format={3}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"18px"}
                                                              />
                                                          </td>
                                                          <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                              <CompMetric02
                                                                value={instanceStats['ioreads'] || 0}
                                                                title={"Reads (IOPS)"}
                                                                precision={0}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"18px"}
                                                              />
                                                          </td>
                                                          <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                              <CompMetric02
                                                                value={instanceStats['iowrites'] || 0}
                                                                title={"Write (IOPS)"}
                                                                precision={0}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"18px"}
                                                              />
                                                          </td>
                                                          <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                              <CompMetric02
                                                                value={instanceStats['network'] || 0}
                                                                title={"Network"}
                                                                precision={0}
                                                                format={2}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"18px"}
                                                              />
                                                          </td>
                                                          <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                              <CompMetric02
                                                                value={instanceStats['networkTx'] || 0}
                                                                title={"Network TX(Bytes/sec)"}
                                                                precision={0}
                                                                format={2}
                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                fontSizeValue={"18px"}
                                                              />
                                                          </td>
                                                          <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                              <CompMetric02
                                                                value={instanceStats['networkRx'] || 0}
                                                                title={"Network RX(Bytes/sec)"}
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
                                                  <table style={{"width":"100%"}}>
                                                      <tr>  
                                                        <td style={{"width":"12.5%","padding-left": "1em"}}> 
                                                            <CompMetric02
                                                              value={instanceStats['userCalls'] || 0}
                                                              title={"User Calls/sec"}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
     
                                                        </td>
                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                             <CompMetric02
                                                              value={instanceStats['userCommits'] || 0}
                                                              title={"User commits/sec"}
                                                              type={1}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
                                                        </td>
                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                             <CompMetric02
                                                              value={instanceStats['dbIOWrites'] || 0}
                                                              title={"DB IO Writes/sec"}
                                                              type={1}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
                                                        </td>
                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                             <CompMetric02
                                                              value={instanceStats['dbIOReads'] || 0}
                                                              title={"DB IO Reads/sec"}
                                                              type={1}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
                                                        </td>
                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                             <CompMetric02
                                                              value={instanceStats['redoWrites'] || 0}
                                                              title={"Redo Writes/sec"}
                                                              format={1}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
                                                        </td>
                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                            <CompMetric02
                                                              value={instanceStats['logons'] || 0}
                                                              title={"Logons Current"}
                                                              format={2}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
                                                        </td>
                                                        <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                             <CompMetric02
                                                              value={instanceStats['dbBlocksChanges'] || 0}
                                                              title={"DB Block Changes/sec"}
                                                              type={1}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
                                                        </td><td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                             <CompMetric02
                                                              value={instanceStats['dbBlocksGet'] || 0}
                                                              title={"DB Block Gets/sec"}
                                                              type={1}
                                                              precision={0}
                                                              fontColorValue={configuration.colors.fonts.metric100}
                                                              fontSizeValue={"18px"}
                                                            />
                                                        </td>
                                                    </tr>  
                                                  </table>  
                                                   
                                                  <br />
                                                  <table style={{"width":"100%"}}>
                                                      <tr>  
                                                        
                                                        <td style={{"width":"25%","padding-left": "1em"}}> 
                                                            <ChartLine02 series={JSON.stringify( [
                                                                                                    instanceStats['history']['userCalls']
                                                                                                  ] )} title={"User Calls/sec"} height="200px" />
                                                        </td>
                                                        <td style={{"width":"25%","padding-left": "1em"}}> 
                                                            <ChartLine02 series={JSON.stringify( [instanceStats['history']['userCommits']] )}  title={"User Commits/sec"} height="200px" />
                                                        </td>
                                                        <td style={{"width":"25%","padding-left": "1em"}}> 
                                                            <ChartLine02 series={JSON.stringify( [
                                                                                                    instanceStats['history']['dbIOWrites'],
                                                                                                    instanceStats['history']['dbIOReads']
                                                                                                  ] )} title={"IOPS"} height="200px" />
                                                        </td>
                                                      </tr>
                                                  </table>
                                            </Container>
                                        </td>  
                                    </tr>
                                </table> 
                                
                                <div style={{"padding" : "1em"}}>
                                      <Table
                                        {...collectionProps}
                                        selectionType="single"
                                        header={
                                          <Header
                                            variant="h3"
                                            counter= {"(" + instanceStats['sessions'].length + ")"} 
                                            actions={
                                                      <Toggle
                                                          onChange={({ detail }) =>{
                                                              setcollectionState(detail.checked);
                                                              pauseCollection.current=detail.checked;
                                                            }
                                                          }
                                                          checked={collectionState}
                                                        >
                                                          Auto-Refresh
                                                        </Toggle>
                                                                  
                                                    }
                                          >
                                            Active Sessions
                                          </Header>
                                        }
                                        columnDefinitions={columnsTable}
                                        visibleColumns={preferences.visibleContent}
                                        items={items}
                                        pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
                                        filter={
                                          <TextFilter
                                            {...filterProps}
                                            countText={getMatchesCountText(filteredItemsCount)}
                                            filteringAriaLabel="Filter instances"
                                          />
                                        }
                                        preferences={
                                          <CollectionPreferences
                                            {...collectionPreferencesProps}
                                            preferences={preferences}
                                            onConfirm={({ detail }) => setPreferences(detail)}
                                          />
                                        }
                                        onSelectionChange={({ detail }) => {
                                            setSelectedItems(detail.selectedItems);
                                            setsplitPanelShow(true);
                                            }
                                          }
                                        selectedItems={selectedItems}
                                        resizableColumns
                                        stickyHeader
                                        loadingText="Loading records"
                                      />
                              </div>  
                          
                          </div>
                          
                          
                        
                        
                      },
                      {
                        label: "CloudWatch Metrics",
                        id: "tab02",
                        content: 
                        <>
                        
                        <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                   <td> 
                                        <Container>
                                            
                                            <ColumnLayout columns={2} variant="text-grid" >
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="CPU" 
                                                                              subtitle="Usage %" 
                                                                              height="180px" 
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="CPUUtilization"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={3}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                            />
                                                          
                                                        </div>
                                                        <div style={{"text-align":"center" }}>
                                                              <CLWChart
                                                                              title="FreeableMemory" 
                                                                              subtitle="Total" 
                                                                              height="180px" 
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}metric_name="FreeableMemory"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                            />
                                                                            
                                                        
                                                        </div>
                                                        
                                              </ColumnLayout>
                                          </Container>
                                          
                                          <br/>
                                          
                                          <Container>
                                            
                                            <ColumnLayout columns={2} variant="text-grid" >
                                                           <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                            title="Reads" 
                                                                            subtitle="IOPS" 
                                                                            height="180px" 
                                                                            color="orange" 
                                                                            namespace="AWS/RDS" 
                                                                            dimension_name={"DBInstanceIdentifier"}
                                                                            dimension_value={cnf_rds_id}
                                                                            metric_name="ReadIOPS"
                                                                            stat_type="Average"
                                                                            period={60} 
                                                                            interval={(60*1) * 60000}
                                                                            metric_per_second={0}
                                                                            metric_precision={0}
                                                                            format={1}
                                                                            font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="Writes" 
                                                                              subtitle="IOPS" 
                                                                              height="180px" 
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="WriteIOPS"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={1}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                       
                                              </ColumnLayout>
                                          </Container>
                                          
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="ReadLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px" 
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="ReadLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={3}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="WriteLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px" 
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="WriteLatency"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={3}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                       
                                              </ColumnLayout>
                                          </Container>
                                          
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="ReadThroughput" 
                                                                              subtitle="Bytes/s" 
                                                                              height="180px" 
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="ReadThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="WriteThroughput" 
                                                                              subtitle="Bytes/s" 
                                                                              height="180px" 
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="WriteThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                          
                                                        </div>
                                                      
                                              </ColumnLayout>
                                          </Container>
                                          <br/>
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="NetworkReceive" 
                                                                              subtitle="Bytes/s" 
                                                                              height="180px" 
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="NetworkReceiveThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                             
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="NetworkTransmit" 
                                                                              subtitle="Bytes/s" 
                                                                              height="180px" 
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="NetworkTransmitThroughput"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={0}
                                                                              format={2}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                                            
                                                        
                                                        </div>
                                                        
                                              </ColumnLayout>
                                           </Container>
                                          <br />
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="DBLoadNonCPU" 
                                                                              subtitle="Total" 
                                                                              height="180px" 
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DBLoadNonCPU"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={1}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                          
                                                        </div>
                                                        <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                              title="DBLoad" 
                                                                              subtitle="Total" 
                                                                              height="180px" 
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DBLoad"
                                                                              stat_type="Average"
                                                                              period={60} 
                                                                              interval={(60*1) * 60000}
                                                                              metric_per_second={0}
                                                                              metric_precision={2}
                                                                              format={1}
                                                                              font_color_value={configuration.colors.fonts.metric100}
                                                                          />
                                                          
                                                        </div>
                                                           
                                                       
                                              </ColumnLayout>
                                          </Container>
                                    </td>  
                                </tr>
                          </table>

                          </>
                          
                        
                                                        
                        
                        
                      },
                      {
                        label: "Enhanced Monitoring",
                        id: "tab03",
                        content: 
                        <div>
                            <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                   <td> 
                        
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                             <td style={{"width":"15%", "text-align":"center"}}>        
                                                    <CompMetric02
                                                      value={ instanceStats['cpuUsage'] || 0 }
                                                      title={"Usage %"}
                                                      precision={0}
                                                      format={3}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    <Box variant="h4">CPU</Box>
                                              </td>
                                              <td style={{"width":"25%", "text-align":"center", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                                    
                                                    <ColumnLayout columns={4} variant="text-grid">
                                                        <CompMetric03
                                                          value={ instanceStats['cpuUser'] || 0 }
                                                          title={"User"}
                                                          precision={1}
                                                          format={1}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                          fontSizeValue={"16px"}
                                                        />
                                                        
                                                        <CompMetric03
                                                          value={ instanceStats['cpuSys'] || 0 }
                                                          title={"System"}
                                                          precision={1}
                                                          format={1}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                          fontSizeValue={"16px"}
                                                        />
                                                        
                                                        <CompMetric03
                                                          value={ instanceStats['cpuWait'] || 0 }
                                                          title={"Wait"}
                                                          precision={1}
                                                          format={1}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                          fontSizeValue={"16px"}
                                                        />
                                                        
                                                        <CompMetric03
                                                          value={ instanceStats['cpuSteal'] || 0 }
                                                          title={"Steal"}
                                                          precision={1}
                                                          format={1}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                          fontSizeValue={"16px"}
                                                        />
                                                        
                                                        <CompMetric03
                                                          value={ instanceStats['cpuNice'] || 0 }
                                                          title={"Nice"}
                                                          precision={1}
                                                          format={1}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                          fontSizeValue={"16px"}
                                                        />
                                                        
                                                        <CompMetric03
                                                          value={ instanceStats['cpuGuest'] || 0 }
                                                          title={"Guest"}
                                                          precision={1}
                                                          format={1}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                          fontSizeValue={"16px"}
                                                        />
                                                      
                                                    </ColumnLayout>
                                                    
                                              </td>
                                              
                                              <td style={{"width":"60%"}}>        
                                                    <ChartLine02 
                                                        series={JSON.stringify([ 
                                                                                  instanceStats['history']['cpuUsage'],
                                                                                  instanceStats['history']['cpuUser'],
                                                                                  instanceStats['history']['cpuSys'],
                                                                                  instanceStats['history']['cpuWait'],
                                                                                  instanceStats['history']['cpuGuest'],
                                                                                  instanceStats['history']['cpuSteal'],
                                                                                  instanceStats['history']['cpuNice'],
                                                                                  instanceStats['history']['cpuIrq']
                                                                                  
                                                                              ])} 
                                                        title={"CPU Usage (%)"} height="200px" 
                                                    />
                                              </td>
                                          </tr>
                                      </table>
                                      </Container>
                                      <br/>
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                             <td style={{"width":"15%", "text-align":"center"}}>        
                                                     <CompMetric02
                                                      value={ instanceStats['memoryUsage'] || 0 }
                                                      title={"Usage %"}
                                                      precision={0}
                                                      format={3}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    <Box variant="h4">Memory</Box>
                                              </td>
                                              <td style={{"width":"25%", "text-align":"center", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                                    
                                                    <ColumnLayout columns={4} variant="text-grid">
                                                        <CompMetric03
                                                          value={ instanceStats['memoryTotal'] || 0 }
                                                          title={"Total"}
                                                          precision={0}
                                                          format={2}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                          fontSizeValue={"16px"}
                                                        />
                                                      
                                                        <CompMetric03
                                                            value={ instanceStats['memoryActive'] || 0 }
                                                            title={"Active"}
                                                            precision={0}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                        
                                                        <CompMetric03
                                                            value={ instanceStats['memoryInactive'] || 0 }
                                                            title={"Inactive"}
                                                            precision={0}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                        
                                                        <CompMetric03
                                                            value={ instanceStats['memoryFree'] || 0 }
                                                            title={"Free"}
                                                            precision={0}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                      
                                                    </ColumnLayout>
                                                    
                                              </td>
                                              <td style={{"width":"60%"}}>        
                                                  <ChartLine02 
                                                        series={JSON.stringify([instanceStats['history']['memoryUsage']])} 
                                                        title={"Memory Usage (%)"} height="200px" 
                                                    />
                                              </td>
                                          </tr>
                                      </table>
                                      </Container>
                                      <br/>
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                          
                                              <td style={{"width":"15%", "text-align":"center"}}>      
                                                  <CompMetric02
                                                    value={ instanceStats['ioreads'] || 0 }
                                                    title={"IOPS"}
                                                    precision={0}
                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                  />
                                                  <Box variant="h4">I/O Reads</Box>
                                              </td>
                                             
                                              <td style={{"width":"15%", "text-align":"center", "border-left": "2px solid red"}}>  
                                                  <CompMetric02
                                                    value={ instanceStats['iowrites'] || 0 }
                                                    title={"IOPS"}
                                                    precision={0}
                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                  />
                                                  <Box variant="h4">I/O Writes</Box>
                                              </td>
                              
                                              <td style={{"width":"35%"}}>    
                                                  <ChartLine02 
                                                        series={JSON.stringify([ instanceStats['history']['ioreads'] ])} 
                                                        title={"I/O Reads"} height="200px" 
                                                    />
                                              </td>
                                              
                                              <td style={{"width":"35%", "padding-left": "1em"}}>        
                                                  <ChartLine02 
                                                        series={JSON.stringify([ instanceStats['history']['iowrites'] ])} 
                                                        title={"I/O Writes"} height="200px" 
                                                    />
                                              </td>
                                            
                                          </tr>
                                      </table>
                                      </Container>
                                      <br/>
                                      <Container>
                                      <table style={{"width":"100%"}}>
                                          <tr>  
                                          
                                              <td style={{"width":"15%", "text-align":"center"}}>        
                                                  <CompMetric02
                                                    value={ instanceStats['networkTx'] || 0 }
                                                    title={"Bytes/sec"}
                                                    precision={0}
                                                    format={2}
                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                  />
                                                  <Box variant="h4">Network(TX)</Box>
                                              </td>
                                             
                                              <td style={{"width":"15%", "text-align":"center", "border-left": "2px solid red"}}>  
                                                  <CompMetric02
                                                    value={ instanceStats['networkRx'] || 0 }
                                                    title={"Bytes/sec"}
                                                    precision={0}
                                                    format={2}
                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                  />
                                                  <Box variant="h4">Network(RX)</Box>
                                              </td>
                              
                                              <td style={{"width":"35%"}}>        
                                                  <ChartLine02 
                                                        series={JSON.stringify([ instanceStats['history']['networkTx'] ])} 
                                                        title={"Network(TX)"} height="200px" 
                                                    />
                                              </td>
                                              
                                              <td style={{"width":"35%", "padding-left": "1em"}}>        
                                                  <ChartLine02 
                                                        series={JSON.stringify([ instanceStats['history']['networkRx'] ])} 
                                                        title={"Network(RX)"} height="200px" 
                                                    />
                                              </td>
                                            
                                          </tr>
                                      </table>
                                      </Container>
                                      </td>
                                </tr>
                            </table>  
                            <div style={{"padding":"1em"}}>
                                        <CustomTable
                                            columnsTable={columnsTableEm}
                                            visibleContent={visibleContentEm}
                                            dataset={instanceStats['processes']}
                                            title={"Processes"}
                                        />
                            </div>
                                    
                        </div>
                          
                        ,
                      },
                      {
                        label: "Query Editor",
                        id: "tab04",
                        content: 
                        <div>
                            <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                   <td> 
                        
                                      <Container>
                                        <table style={{"width":"100%"}}>
                                            <tr>  
                                               <td style={{"width":"100%", "text-align":"left"}}>     
                                                    <Header variant="h3">
                                                            SQL Query {(dataQuery.result_code=="0") && <Badge color="green">Execution successful</Badge> }
                                                          {(dataQuery.result_code=="1") && <Badge color="red">Execution failed</Badge>}
                                                    </Header>
                                                      <textarea ref={txtSQLText} rows="10" style={{width:"100%"}} />
                                                      <br/>
                                                      <br/>
                                                      <SpaceBetween direction="horizontal" size="xs">
                                                          <Button variant="primary" onClick={handleClickRunQuery}>Run Query</Button>
                                                          <Button onClick={() => {txtSQLText.current.value="";}}>Clear</Button>
                                                      </SpaceBetween>
                                                  
                                               </td>
                                            </tr>
                                        </table> 
                                      </Container> 
                                    </td>
                                  </tr>
                            </table> 
                            <div style={{"padding":"1em"}}>     
                                <Table
                                      stickyHeader
                                      columnDefinitions={dataQuery.columns}
                                      items={dataQuery.dataset}
                                      loadingText="Loading records"
                                      sortingDisabled
                                      selectionType="single"
                                      onSelectionChange={({ detail }) => {
                                        setSelectedItems(detail.selectedItems);
                                        }
                                      }
                                      selectedItems={selectedItems}
                                      empty={
                                        <Box textAlign="center" color="inherit">
                                          <b>No records</b>
                                          <Box
                                            padding={{ bottom: "s" }}
                                            variant="p"
                                            color="inherit"
                                          >
                                            No records to display.
                                          </Box>
                                         
                                        </Box>
                                      }
                                      filter={
                                       <Header variant="h3" counter={"(" + dataQuery.dataset.length + ")"}
                                        >
                                          Result Items
                                      </Header>
                                      }
                                      
                                     
                                    resizableColumns
                                    />
                            </div>
                        </div>
                        ,
                        
                      },
                      {
                        label: "Instance Information",
                        id: "tab05",
                        content: 
                        <>
                          
                          <table style={{"width":"100%", "padding": "1em"}}>
                            <tr>  
                                <td> 
                    
                                      <Container header={<Header variant="h2">Configuration</Header>}>
                                        <ColumnLayout columns={4} variant="text-grid">
                                          <div>
                                            <Box variant="awsui-key-label">Instance name</Box>
                                            <div>{parameter_object_values['rds_id']}</div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">DB instance class</Box>
                                            <div><div>{parameter_object_values['rds_class']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Availability Zone</Box>
                                            <div><div>{parameter_object_values['rds_az']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Engine Type</Box>
                                            <div><div>{parameter_object_values['rds_engine']}</div></div>
                                          </div>
                                        </ColumnLayout>
                                        <br/>
                                        <br/>
                                        <ColumnLayout columns={4} variant="text-grid">
                                          <div>
                                            <Box variant="awsui-key-label">Endpoint</Box>
                                            <div>{parameter_object_values['rds_host']}</div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Resource ID</Box>
                                            <div><div>{parameter_object_values['rds_resource_id']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Session ID</Box>
                                            <div><div>{parameter_object_values['session_id']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Engine version</Box>
                                            <div><div>{parameter_object_values['rds_version']}</div></div>
                                          </div>
                                          
                                        </ColumnLayout>
                                        <br/>
                                        <br/>
                                        <ColumnLayout columns={4} variant="text-grid">
                                         
                                          <div>
                                            <Box variant="awsui-key-label">vCPUs</Box>
                                            <div><div>{instanceStats['vCpus']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Memory</Box>
                                            <div><div>{(instanceStats['memoryTotal']/1024/1024/1024).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} GB</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Storage Type</Box>
                                            <div>{parameter_object_values['rds_storage']}</div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Storage Size(GB)</Box>
                                            <div>{parameter_object_values['rds_storage_size']}</div>
                                          </div>
                                          
                                        </ColumnLayout>
                                        <br/>
                                        <br/>
                                      </Container>
                                </td>
                            </tr>
                          </table>
                                
                                
                        
                        </>
                        ,
                        }
                    ]}
                  />
                  
     
            </>
            
        }
      />
      
    </>
    
  );
}
