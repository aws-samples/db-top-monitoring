import { useState,useEffect,useRef } from 'react';
import Axios from 'axios'
import { useSearchParams } from 'react-router-dom';

import CustomHeader from "../components/Header";
import CustomTable from "../components/Table01";
import AppLayout from "@awsui/components-react/app-layout";
import { configuration } from './Configs';
import { classMetric, getMatchesCountText, createLabelFunction, paginationLabels, pageSizePreference, EmptyState } from '../components/Functions';

import { useCollection } from '@cloudscape-design/collection-hooks';
import {CollectionPreferences,Pagination } from '@awsui/components-react';
import TextFilter from "@awsui/components-react/text-filter";


import Container from "@awsui/components-react/container";
import Tabs from "@awsui/components-react/tabs";
import ColumnLayout from "@awsui/components-react/column-layout";
import Badge from "@awsui/components-react/badge";
import ProgressBar from "@awsui/components-react/progress-bar";

import CompMetric02  from '../components/Metric02';
import CompMetric03  from '../components/Metric03';
import ChartLine02  from '../components/ChartLine02';
import CLWChart  from '../components/ChartCLW01';

import Table from "@awsui/components-react/table";
import Header from "@awsui/components-react/header";
import Button from "@awsui/components-react/button";

import Box from "@awsui/components-react/box";
import SpaceBetween from "@awsui/components-react/space-between";
import Toggle from "@awsui/components-react/toggle";
import { SplitPanel } from '@awsui/components-react';

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
    const cnf_rds_engine=parameter_object_values["rds_engine"];
    const cnf_rds_resource_id=parameter_object_values["rds_resource_id"];
    
    //-- Add token header
    Axios.defaults.headers.common['x-token'] = sessionStorage.getItem(cnf_connection_id);
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    
    //-- Set Page Title
    document.title = configuration["apps-settings"]["application-title"] + ' - ' + cnf_rds_host;
   
   
    
    //--######## RealTime Metric Features
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    
    //-- Variable for Pause Collection
    const pauseCollection = useRef(true);
    const [collectionState, setcollectionState] = useState(true);
    
    //-- Performance Counters
    const initProcess = useRef(0);
    const metricObjectGlobal = useRef(new classMetric([
                                                        {name : "Com_select", history : 30 },
                                                        {name : "Com_update", history : 30 },
                                                        {name : "Com_delete", history : 30 },
                                                        {name : "Com_insert", history : 30 },
                                                        {name : "Sessions", history : 30 },
                                                        {name : "Queries", history : 30 },
                                                        {name : "Cpu_total", history : 50 },
                                                        {name : "Cpu_user", history : 50 },
                                                        {name : "Cpu_system", history : 50 },
                                                        {name : "Cpu_wait", history : 50 },
                                                        {name : "Cpu_irq", history : 50 },
                                                        {name : "Cpu_guest", history : 50 },
                                                        {name : "Cpu_steal", history : 50 },
                                                        {name : "Cpu_nice", history : 50 },
                                                        {name : "Memory_total", history : 50 },
                                                        {name : "Memory_active", history : 50 },
                                                        {name : "Memory_inactive", history : 50 },
                                                        {name : "Memory_free", history : 50 },
                                                        {name : "IO_reads_rsdev", history : 50 },
                                                        {name : "IO_reads_filesystem", history : 50 },
                                                        {name : "IO_writes_rsdev", history : 50 },
                                                        {name : "IO_writes_filesystem", history : 50 },
                                                        {name : "Network_tx", history : 50 },
                                                        {name : "Network_rx", history : 50 }
                                                        
       
    ]));
    
    
    //-- Metric Variables
    const [dataMetricRealTime,setDataMetricRealTime] = useState({
                                                                  Queries : [],
                                                                  Operations : [],
                                                                  dataSessions: [],
                                                                  dataCounters: [],
                                                                  timestamp : 0,
                                                                  refObject : new classMetric([
                                                                                                {name : "Com_select", history : 30 },
                                                                                                {name : "Com_update", history : 30 },
                                                                                                {name : "Com_delete", history : 30 },
                                                                                                {name : "Com_insert", history : 30 },
                                                                                                {name : "Queries", history : 30 }
                                                                                              ])
                                                                });
    
    const [dataMetricRealTimeSession,setDataMetricRealTimeSession] = useState({
                                                                  SessionsTotal : [],
                                                                  Sessions : [],
                                                                  timestamp : 0,
                                                                });
    
    
    const dataSessionQuery = "SELECT ID as 'ThreadID',USER as 'Username',HOST as 'Host',DB as 'Database',COMMAND as 'Command',SEC_TO_TIME(TIME) as 'Time',STATE as 'State',INFO as 'SQLText' FROM INFORMATION_SCHEMA.PROCESSLIST WHERE COMMAND <> 'Sleep' AND COMMAND <> 'Daemon' AND CONNECTION_ID()<> ID ORDER BY TIME DESC LIMIT 250";
    
    //-- Variables Table - Sessions
    const columnsTable = [
                  {id: 'ThreadID',header: 'ThreadID',cell: item => item['ThreadID'],ariaLabel: createLabelFunction('ThreadID'),sortingField: 'ThreadID',},
                  {id: 'State',header: 'State',cell: item => item['State'] || "-",ariaLabel: createLabelFunction('State'),sortingField: 'State',},
                  {id: 'Username',header: 'Username',cell: item => item['Username'],ariaLabel: createLabelFunction('Username'),sortingField: 'Username',},
                  {id: 'Host',header: 'Host',cell: item => item['Host'] || "-",ariaLabel: createLabelFunction('Host'),sortingField: 'Host',},
                  {id: 'Database',header: 'Database',cell: item => item['Database'],ariaLabel: createLabelFunction('Database'),sortingField: 'Database',},
                  {id: 'Command',header: 'Command',cell: item => item['Command'],ariaLabel: createLabelFunction('Command'),sortingField: 'Command',},
                  {id: 'ElapsedTime',header: 'ElapsedTime',cell: item => item['Time'],ariaLabel: createLabelFunction('ElapsedTime'),sortingField: 'ElapsedTime',},
                  {id: 'SQLText',header: 'SQLText',cell: item => item['SQLText'],ariaLabel: createLabelFunction('SQLText'),sortingField: 'SQLText',}
                  
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
    
   
    const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['ThreadID', 'State', 'Username', 'Host', 'Database', 'Command', 'ElapsedTime', 'SQLText' ] });
    
    const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
                dataMetricRealTimeSession['Sessions'],
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
    
    
    
    const [dataEnhancedMonitor,setdataEnhancedMonitor] = useState({
                                            counters : { 
                                                        cpu: [{name:'pct_usage',value:0},{name:'total_vcpu', value: 0}],
                                                        cpu_detail : [
                                                              {name:'user', value: 0},
                                                              {name:'system', value: 0},
                                                              {name:'wait', value: 0},
                                                              {name:'irq', value: 0},
                                                              {name:'guest', value: 0},
                                                              {name:'steal', value: 0},
                                                              {name:'nice', value: 0}
                                                          ],
                                                        memory : [{name:'pct_usage',value:0}, {name:'total',value:0}, {name:'free',value:0}, {name:'active',value:0}], 
                                                        memory_detail : [
                                                              {name:'total', value: 0},
                                                              {name:'active', value: 0},
                                                              {name:'inactive', value: 0},
                                                              {name:'free', value: 0}
                                                          ],
                                                        io_reads: [{name:'rdsdev',value:0}, {name:'filesystem',value:0}],
                                                        io_writes: [{name:'rdsdev',value:0}, {name:'filesystem',value:0}], 
                                                        tps: [{name:'total_tps',value:0}], 
                                                        io_queue: [{name:'avg_queue',value:0}], 
                                                        network: [{name:'tx',value:0}, {name:'rx',value:0}],
                                                        processlist : [],
                                                        timestamp : 0
                                              },
                                              charts : {
                                                        cpu : [],
                                                        memory : [],
                                                        reads : [],
                                                        writes : [],
                                                        network_tx : [],
                                                        network_rx : [],
                                                        timestamp : 0
                                              }
                                              
                                            });
        
    
    
    
    //--######## SQL Query Feature
    
    const [dataQuery,setdataQuery] = useState({columns: [], dataset: []});
    const txtSQLText = useRef('');

     
     
    //--######## Functions and Events

    //-- Function Gather Metrics
    const fetchMetrics = () => {
      
        fetchRealTimeMetricsCounters();
        fetchRealTimeMetricsSessions();
        fetchEnhancedMonitoring();
              
    }



    //-- Function Gather RealTime Metrics
    const fetchRealTimeMetricsCounters = () => {
      
        //--- API Call Performance Counters
        var api_params = {
                      connection: cnf_connection_id,
                      sql_statement: "SHOW GLOBAL STATUS"
                      };

        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/mysql/sql/`,{
              params: api_params
              }).then((data)=>{

                  var timeNow = new Date();
                  var currentCounters = convertArrayToObject(data.data,'Variable_name');
                  
                  if ( initProcess.current === 0 ){
                    //-- Initialize snapshot data
                    metricObjectGlobal.current.newSnapshot(currentCounters, timeNow.getTime());
                    initProcess.current = 1;
                  }
                  
                  //-- Update the snapshot data
                  metricObjectGlobal.current.newSnapshot(currentCounters, timeNow.getTime());
                  
                  //-- Add metrics
                  metricObjectGlobal.current.addPropertyValue('Com_select',metricObjectGlobal.current.getDelta('Com_select'));
                  metricObjectGlobal.current.addPropertyValue('Com_update',metricObjectGlobal.current.getDelta('Com_update'));
                  metricObjectGlobal.current.addPropertyValue('Com_delete',metricObjectGlobal.current.getDelta('Com_delete'));
                  metricObjectGlobal.current.addPropertyValue('Com_insert',metricObjectGlobal.current.getDelta('Com_update'));
                  metricObjectGlobal.current.addPropertyValue('Queries',metricObjectGlobal.current.getDelta('Queries'));
                  
                  if (currentTabId.current === "tab01"){
                    
                      setDataMetricRealTime({ 
                                            Queries:[metricObjectGlobal.current.getPropertyValues('Queries')],
                                            Operations : [
                                                          metricObjectGlobal.current.getPropertyValues('Com_select'),
                                                          metricObjectGlobal.current.getPropertyValues('Com_update'),
                                                          metricObjectGlobal.current.getPropertyValues('Com_delete'),
                                                          metricObjectGlobal.current.getPropertyValues('Com_insert')
                                                          ],
                                            refObject : metricObjectGlobal.current,
                                            timestamp : timeNow.getTime()
                      });
                  
                  }
                  
    
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/mysql/sql/' );
                  console.log(err)
                    
              });
              

    }
   
   
    //-- Function Gather RealTime Metrics
    const fetchRealTimeMetricsSessions = () => {
      
        if (pauseCollection.current==false)
          return;
      
        //--- API Call Gather Sessions
        var api_params = {
                      connection: cnf_connection_id,
                      sql_statement: dataSessionQuery
                      };
    
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/mysql/sql/`,{
              params: api_params
              }).then((data)=>{
                  
                  var timeNow = new Date();
                  metricObjectGlobal.current.addPropertyValue('Sessions',data.data.length);
                  if (currentTabId.current === "tab01"){
                    
                      setDataMetricRealTimeSession({ 
                                            Sessions : data.data,
                                            SessionsTotal : [metricObjectGlobal.current.getPropertyValues('Sessions')],
                                            timestamp : timeNow.getTime()
                                            
                      });
                      
                      
                  }
                  
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/mysql/sql/' );
                  console.log(err)
                  
              });
    
    }
   
   //-- Function Gather EnhancedMetrics Metrics
   const fetchEnhancedMonitoring = () => {
            
            
            // Enhanced monitoring
            Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/clw/region/logs/`,{
                params: { resource_id : cnf_rds_resource_id }
            }).then((data)=>{
              
                var time_now = new Date();
                var message=JSON.parse(data.data.events[0].message);
                                                        
                metricObjectGlobal.current.addPropertyValue('Cpu_total',message.cpuUtilization.total);
                metricObjectGlobal.current.addPropertyValue('Cpu_user',message.cpuUtilization.user);
                metricObjectGlobal.current.addPropertyValue('Cpu_system',message.cpuUtilization.system);
                metricObjectGlobal.current.addPropertyValue('Cpu_wait',message.cpuUtilization.wait);
                metricObjectGlobal.current.addPropertyValue('Cpu_irq',message.cpuUtilization.irq);
                metricObjectGlobal.current.addPropertyValue('Cpu_guest',message.cpuUtilization.guest);
                metricObjectGlobal.current.addPropertyValue('Cpu_steal',message.cpuUtilization.steal);
                metricObjectGlobal.current.addPropertyValue('Cpu_nice',message.cpuUtilization.nice);
                metricObjectGlobal.current.addPropertyValue('Memory_total',message.memory.total * 1024);
                metricObjectGlobal.current.addPropertyValue('Memory_active',message.memory.active * 1024);
                metricObjectGlobal.current.addPropertyValue('Memory_inactive',message.memory.inactive * 1024);
                metricObjectGlobal.current.addPropertyValue('Memory_free',message.memory.free * 1024);
                metricObjectGlobal.current.addPropertyValue('IO_reads_rsdev',message.diskIO[0].readIOsPS);
                metricObjectGlobal.current.addPropertyValue('IO_reads_filesystem',message.diskIO[1].readIOsPS);
                metricObjectGlobal.current.addPropertyValue('IO_writes_rsdev',message.diskIO[0].writeIOsPS);
                metricObjectGlobal.current.addPropertyValue('IO_writes_filesystem',message.diskIO[1].writeIOsPS);
                metricObjectGlobal.current.addPropertyValue('Network_tx',message.network[0].tx);
                metricObjectGlobal.current.addPropertyValue('Network_rx',message.network[0].rx);
                
                
                if (currentTabId.current === "tab01" || currentTabId.current === "tab03" ){
                  
                    setdataEnhancedMonitor({
                               counters :   {
                                  cpu : [{name:'pct_usage', value: Math.trunc(message.cpuUtilization.total)},{name:'total_vcpu', value: message.numVCPUs}],
                                  cpu_detail : [
                                                {name:'user', value: message.cpuUtilization.user},
                                                {name:'system', value: message.cpuUtilization.system},
                                                {name:'wait', value: message.cpuUtilization.wait},
                                                {name:'irq', value: message.cpuUtilization.irq},
                                                {name:'guest', value: message.cpuUtilization.guest},
                                                {name:'steal', value: message.cpuUtilization.steal},
                                                {name:'nice', value: message.cpuUtilization.nice}
                                  ],
                                  memory : [{name: 'pct_usage', value : Math.trunc(( (message.memory.total-message.memory.free) / message.memory.total) * 100) } , {name:'total', value: message.memory.total*1024 }, {name : 'free', value: message.memory.free }, {name: 'active', value: message.memory.active}],
                                  memory_detail : [
                                                {name:'total', value: message.memory.total},
                                                {name:'active', value: message.memory.active},
                                                {name:'inactive', value: message.memory.inactive},
                                                {name:'free', value: message.memory.free}
                                  ],
                                  io_reads : [{name:'rdsdev', value: message.diskIO[0].readIOsPS}, {name:'filesystem', value: message.diskIO[1].readIOsPS}],
                                  io_writes : [{name:'rdsdev', value: message.diskIO[0].writeIOsPS}, {name:'filesystem', value: message.diskIO[1].writeIOsPS}],
                                  network : [{name:'tx', value: message.network[0].tx}, {name:'rx', value: message.network[0].rx}],
                                  tps: [{name:'total_tps',value: message.diskIO[1].tps }], 
                                  io_queue: [{name:'avg_queue',value:  message.diskIO[1].avgQueueLen }], 
                                  processlist : message.processList,
                                  timestamp : message.timestamp
                                  
                                },
                                charts : {
                                              cpu : [
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_total'),
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_user'),
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_system'),
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_wait'),
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_irq'),
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_guest'),
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_steal'),
                                                      metricObjectGlobal.current.getPropertyValues('Cpu_nice')
                                                      ], 
                                              memory : [
                                                      metricObjectGlobal.current.getPropertyValues('Memory_total'),
                                                      metricObjectGlobal.current.getPropertyValues('Memory_active'),
                                                      metricObjectGlobal.current.getPropertyValues('Memory_inactive'),
                                                      metricObjectGlobal.current.getPropertyValues('Memory_free'),
                                                ],
                                              reads : [
                                                      metricObjectGlobal.current.getPropertyValues('IO_reads_rsdev'),
                                                      metricObjectGlobal.current.getPropertyValues('IO_reads_filesystem'),
                                                      ],
                                              writes : [
                                                      metricObjectGlobal.current.getPropertyValues('IO_writes_rsdev'),
                                                      metricObjectGlobal.current.getPropertyValues('IO_writes_filesystem'),
                                                      ],
                                              network_tx : [
                                                      metricObjectGlobal.current.getPropertyValues('Network_tx'),
                                                      ],
                                              network_rx : [
                                                      metricObjectGlobal.current.getPropertyValues('Network_rx'),
                                                      ],
                                                timestamp : time_now.getTime()
                                                
                                }
                      });
                }
                
                
            })
            .catch((err) => {
                console.log('Timeout API Call : /api/aws/clw/region/logs/');
                console.log(err)
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
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/security/rds/disconnect/`,{
                      params: { session_id: cnf_connection_id, engine: cnf_rds_engine}
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/security/mysql/disconnect/');
                      console.log(err)
                  });
                  
  
      
    }
       
    //-- Close TabWindow
    const closeTabWindow = () => {
              window.opener = null;
              window.open("", "_self");
              window.close();
      
    }
    
    //-- Function Run Query
    const handleClickRunQuery = () => {

        //--- API Call Run Query
        var api_params = {
                      connection: cnf_connection_id,
                      sql_statement:txtSQLText.current.value
          
        };
    
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/mysql/sql/`,{
              params: api_params
              }).then((data)=>{
                  
                  var colInfo=[];
                  try{
                    
                        if (Array.isArray(data.data)){
                            var columns = Object.keys(data.data[0]);
                            columns.forEach(function(colItem) {
                                colInfo.push({ id: colItem, header: colItem,cell: item => item[colItem] || "-",sortingField: colItem,isRowHeader: true });
                            })
                        }
                    
                  }
                  catch {
                    
                    colInfo = [];
                    
                  }
                  
                  setdataQuery({columns:colInfo, dataset: data.data, result_code:0, result_info: ""});
                
                
              })
              .catch((err) => {
                  console.log(err)
                  setdataQuery({columns:[], dataset: [], result_code:1, result_info: err.response.data.sqlMessage});
                  
              });
              
    };
    
    
   
    
    //-- Startup Function
    
    // eslint-disable-next-line
    useEffect(() => {
        fetchMetrics();
        const id = setInterval(fetchMetrics, configuration["apps-settings"]["refresh-interval"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    
    //-- Function Convert Array to Type Object
    const convertArrayToObject = (array, key) => 
      array.reduce((acc, curr) =>(acc[curr[key]] = curr, acc), {});
  


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
                  <SplitPanel  header={"Session Details (" + selectedItems[0].ThreadID + ")"} i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                    onSplitPanelToggle={({ detail }) => {
                                    
                                    }
                                  }
                  >
                      <table style={{"width":"100%"}}>
                            <tr>  
                                <td style={{"width":"100%","padding-left": "1em"}}>  
                                        <ColumnLayout columns="4" variant="text-grid">
                                             <div>
                                                  <Box variant="awsui-key-label">ThreadID</Box>
                                                  {selectedItems[0]['ThreadID']}
                                              </div>
                                              <div>
                                                  <Box variant="awsui-key-label">Username</Box>
                                                  {selectedItems[0]['Username']}
                                              </div>
                                              <div>
                                                  <Box variant="awsui-key-label">Host</Box>
                                                  {selectedItems[0]['Host']}
                                              </div>
                                              <div>
                                                  <Box variant="awsui-key-label">Database</Box>
                                                  {selectedItems[0]['Database']}
                                              </div>
                                            </ColumnLayout>
                                    
                                            <ColumnLayout columns="4" variant="text-grid">
                                             <div>
                                                  <Box variant="awsui-key-label">Time</Box>
                                                  {selectedItems[0]['Time']}
                                              </div>
                                              <div>
                                                  <Box variant="awsui-key-label">State</Box>
                                                  {selectedItems[0]['State']}
                                              </div>
                                              <div>
                                                  <Box variant="awsui-key-label">SQLText</Box>
                                                  {selectedItems[0]['SQLText']}
                                              </div>
                                            
                                            </ColumnLayout>
                                      </td>
                                </tr>
                          </table>
                                                          
                        
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
                                                      <td style={{"width":"12.5%","padding-left": "1em"}}>  
                                                          <CompMetric02
                                                            value={dataEnhancedMonitor['counters']['cpu'][0]['value'] || 0}
                                                            title={"CPU Usage (%)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                          />
                                                          <ProgressBar value={dataEnhancedMonitor['counters']['cpu'][0]['value'] || 0}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                          <CompMetric02
                                                            value={dataEnhancedMonitor['counters']['memory'][0]['value'] || 0}
                                                            title={"Memory Usage(%)"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                          />
                                                          <ProgressBar value={dataEnhancedMonitor['counters']['memory'][0]['value'] || 0}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                          <CompMetric02
                                                            value={dataEnhancedMonitor['counters']['tps'][0]['value'] || 0}
                                                            title={"I/O TPS"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                          <CompMetric02
                                                            value={dataEnhancedMonitor['counters']['io_queue'][0]['value'] || 0}
                                                            title={"DiskQueue"}
                                                            precision={2}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                          <CompMetric02
                                                            value={ (dataEnhancedMonitor['counters']['io_reads'][0]['value'] + dataEnhancedMonitor['counters']['io_reads'][1]['value']) || 0}
                                                            title={"Reads (IOPS)"}
                                                            precision={0}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                          <CompMetric02
                                                            value={ (dataEnhancedMonitor['counters']['io_writes'][0]['value'] + dataEnhancedMonitor['counters']['io_writes'][1]['value']) || 0}
                                                            title={"Write (IOPS)"}
                                                            precision={0}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                          <CompMetric02
                                                            value={dataEnhancedMonitor['counters']['network'][0]['value'] || 0}
                                                            title={"Network TX(Bytes/sec)"}
                                                            precision={0}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                          />
                                                      </td>
                                                      <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                          <CompMetric02
                                                            value={dataEnhancedMonitor['counters']['network'][1]['value'] || 0}
                                                            title={"Network RX(Bytes/sec)"}
                                                            precision={0}
                                                            format={2}
                                                            fontColorValue={configuration.colors.fonts.metric100}
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
                                                          value={dataMetricRealTime.refObject.getDelta('Queries') || 0}
                                                          title={"Queries/sec"}
                                                          precision={0}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
 
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                         <CompMetric02
                                                          value={dataMetricRealTime.refObject.getDelta('Com_select') || 0}
                                                          title={"Selects/sec"}
                                                          type={1}
                                                          precision={0}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                         <CompMetric02
                                                          value={dataMetricRealTime.refObject.getDelta('Com_insert') || 0}
                                                          title={"Insert/sec"}
                                                          type={1}
                                                          precision={0}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                         <CompMetric02
                                                          value={dataMetricRealTime.refObject.getDelta('Com_update') || 0}
                                                          title={"Update/sec"}
                                                          type={1}
                                                          precision={0}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                         <CompMetric02
                                                          value={dataMetricRealTime.refObject.getDelta('Com_delete') || 0}
                                                          title={"Delete/sec"}
                                                          type={1}
                                                          precision={0}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                        <CompMetric02
                                                          value={dataMetricRealTime.refObject.getValue('Threads_connected') || 0}
                                                          title={"Threads"}
                                                          type={2}
                                                          precision={0}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                         <CompMetric02
                                                          value={dataMetricRealTime.refObject.getDelta('Bytes_received') || 0}
                                                          title={"BytesReceived/sec"}
                                                          type={1}
                                                          precision={0}
                                                          format={2}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
                                                    </td>
                                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>
                                                        <CompMetric02
                                                          value={dataMetricRealTime.refObject.getDelta('Bytes_sent') || 0}
                                                          title={"BytesSent/sec"}
                                                          type={1}
                                                          precision={0}
                                                          format={2}
                                                          fontColorValue={configuration.colors.fonts.metric100}
                                                        />
                                                    </td>
                                                   
                                              </tr>  
                                              
                                              </table>  
                                               
                                              <br />
                                              <table style={{"width":"100%"}}>
                                                  <tr>  
                                                    <td style={{"width":"25%","padding-left": "1em"}}> 
                                                        <ChartLine02 series={JSON.stringify(dataMetricRealTimeSession['SessionsTotal'])} title={"Active Sessions"} height="200px" />
                                                    </td>
                                                    <td style={{"width":"25%","padding-left": "1em"}}> 
                                                        <ChartLine02 series={JSON.stringify(dataMetricRealTime['Queries'])} title={"Queries/sec"} height="200px" />
                                                    </td>
                                                    <td style={{"width":"25%","padding-left": "1em"}}> 
                                                        <ChartLine02 series={JSON.stringify(dataMetricRealTime['Operations'])} title={"Operations/sec"} height="200px" />
                                                    </td>
                                                  </tr>
                                              </table>

                                        </Container>
                                        <br/>
                                    </td>  
                                </tr>
                              
                                <tr>  
                                   <td>
                                            <Table
                                              {...collectionProps}
                                              selectionType="single"
                                              header={
                                                <Header
                                                  variant="h2"
                                                  counter= {"(" + dataMetricRealTimeSession['Sessions'].length + ")"} 
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
                        <table style={{"width":"100%", "padding": "1em"}}>
                                <tr>  
                                   <td> 
                                        <Container>
                                            
                                            <ColumnLayout columns={2} variant="text-grid" >
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="CPU" 
                                                                              subtitle="Usage(%)" 
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
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="FreeableMemory"
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
                                                                              subtitle="Bytes/Second" 
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
                                                                              subtitle="Bytes/Second" 
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
                                          <br/>
                                          <Container>
                                              <ColumnLayout columns={2} variant="text-grid">
                                                        <div style={{"text-align":"center"}}>
                                                            <CLWChart 
                                                                              title="StorageReceiveThroughput" 
                                                                              subtitle="Bytes/Second" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="StorageNetworkReceiveThroughput"
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
                                                                              title="StorageTransmitThroughput" 
                                                                              subtitle="Bytes/Second" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="StorageNetworkTransmitThroughput"
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
                                            
                                            <ColumnLayout columns={2} variant="text-grid" >
                                                           <div style={{"text-align":"center"}}>
                                                              <CLWChart 
                                                                            title="CommitThroughput" 
                                                                            subtitle="Count/sec" 
                                                                            height="180px"
                                                                            color="orange" 
                                                                            namespace="AWS/RDS" 
                                                                            dimension_name={"DBInstanceIdentifier"}
                                                                            dimension_value={cnf_rds_id}
                                                                            metric_name="CommitThroughput"
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
                                                                              title="CommitLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="CommitLatency"
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
                                                                              title="SelectThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="SelectThroughput"
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
                                                                              title="SelectLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="SelectLatency"
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
                                                                              title="UpdateThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="UpdateThroughput"
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
                                                                              title="UpdateLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="UpdateLatency"
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
                                                                              title="InsertThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="InsertThroughput"
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
                                                                              title="InsertLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="InsertLatency"
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
                                                                              title="DeleteThroughput" 
                                                                              subtitle="Count/sec" 
                                                                              height="180px"
                                                                              color="orange" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DeleteThroughput"
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
                                                                              title="DeleteLatency" 
                                                                              subtitle="ms" 
                                                                              height="180px"
                                                                              color="purple" 
                                                                              namespace="AWS/RDS" 
                                                                              dimension_name={"DBInstanceIdentifier"}
                                                                              dimension_value={cnf_rds_id}
                                                                              metric_name="DeleteLatency"
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
                        <>
                        
                        <table style={{"width":"100%", "padding": "1em"}}>
                            <tr>  
                               <td> 
                    
                                  <Container>
                                  <table style={{"width":"100%"}}>
                                      <tr>  
                                         <td style={{"width":"15%", "text-align":"center"}}>        
                                                <CompMetric02
                                                  value={dataEnhancedMonitor['counters']['cpu'][0]['value'] || 0}
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
                                                      value={dataEnhancedMonitor['counters']['cpu_detail'][0]['value'] || 0}
                                                      title={"User"}
                                                      precision={1}
                                                      format={1}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    
                                                    <CompMetric03
                                                      value={dataEnhancedMonitor['counters']['cpu_detail'][1]['value'] || 0}
                                                      title={"System"}
                                                      precision={1}
                                                      format={1}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    
                                                    <CompMetric03
                                                      value={dataEnhancedMonitor['counters']['cpu_detail'][2]['value'] || 0}
                                                      title={"Wait"}
                                                      precision={1}
                                                      format={1}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    
                                                    <CompMetric03
                                                      value={dataEnhancedMonitor['counters']['cpu_detail'][5]['value'] || 0}
                                                      title={"Steal"}
                                                      precision={1}
                                                      format={1}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    
                                                    <CompMetric03
                                                      value={dataEnhancedMonitor['counters']['cpu_detail'][6]['value'] || 0}
                                                      title={"Nice"}
                                                      precision={1}
                                                      format={1}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    
                                                    <CompMetric03
                                                      value={dataEnhancedMonitor['counters']['cpu_detail'][4]['value'] || 0}
                                                      title={"Guest"}
                                                      precision={1}
                                                      format={1}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                  
                                                </ColumnLayout>
                                                
                                          </td>
                                          
                                          <td style={{"width":"60%"}}>        
                                                <ChartLine02 
                                                    series={JSON.stringify(dataEnhancedMonitor['charts']['cpu'])} 
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
                                                  value={dataEnhancedMonitor['counters']['memory'][0]['value'] || 0}
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
                                                      value={ (dataEnhancedMonitor['counters']['memory_detail'][0]['value']*1024) || 0}
                                                      title={"Total"}
                                                      precision={0}
                                                      format={2}
                                                      fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                  
                                                    <CompMetric03
                                                        value={ (dataEnhancedMonitor['counters']['memory_detail'][1]['value']*1024) || 0}
                                                        title={"Active"}
                                                        precision={0}
                                                        format={2}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    
                                                    <CompMetric03
                                                        value={ (dataEnhancedMonitor['counters']['memory_detail'][2]['value']*1024) || 0}
                                                        title={"Inactive"}
                                                        precision={0}
                                                        format={2}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                    
                                                    <CompMetric03
                                                        value={ (dataEnhancedMonitor['counters']['memory_detail'][3]['value']*1024) || 0}
                                                        title={"Free"}
                                                        precision={0}
                                                        format={2}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                    />
                                                  
                                                </ColumnLayout>
                                                
                                          </td>
                                          <td style={{"width":"60%"}}>        
                                              <ChartLine02 
                                                    series={JSON.stringify(dataEnhancedMonitor['charts']['memory'])} 
                                                    title={"Memory Usage (GB)"} height="200px" 
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
                                                value={ (dataEnhancedMonitor['counters']['io_reads'][0]['value'] + dataEnhancedMonitor['counters']['io_reads'][1]['value']) || 0}
                                                title={"IOPS"}
                                                precision={0}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                              />
                                              <Box variant="h4">I/O Reads</Box>
                                          </td>
                                         
                                          <td style={{"width":"15%", "text-align":"center", "border-left": "2px solid red"}}>  
                                              <CompMetric02
                                                value={ (dataEnhancedMonitor['counters']['io_writes'][0]['value'] + dataEnhancedMonitor['counters']['io_writes'][1]['value']) || 0}
                                                title={"IOPS"}
                                                precision={0}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                              />
                                              <Box variant="h4">I/O Writes</Box>
                                          </td>
                          
                                          <td style={{"width":"35%"}}>    
                                              <ChartLine02 
                                                    series={JSON.stringify(dataEnhancedMonitor['charts']['reads'])} 
                                                    title={"I/O Reads"} height="200px" 
                                                />
                                          </td>
                                          
                                          <td style={{"width":"35%", "padding-left": "1em"}}>        
                                              <ChartLine02 
                                                    series={JSON.stringify(dataEnhancedMonitor['charts']['writes'])} 
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
                                                value={dataEnhancedMonitor['counters']['network'][0]['value'] || 0}
                                                title={"Bytes/sec"}
                                                precision={0}
                                                format={2}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                              />
                                              <Box variant="h4">Network(TX)</Box>
                                          </td>
                                         
                                          <td style={{"width":"15%", "text-align":"center", "border-left": "2px solid red"}}>  
                                              <CompMetric02
                                                value={ dataEnhancedMonitor['counters']['network'][1]['value']  || 0}
                                                title={"Bytes/sec"}
                                                precision={0}
                                                format={2}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                              />
                                              <Box variant="h4">Network(RX)</Box>
                                          </td>
                          
                                          <td style={{"width":"35%"}}>        
                                              <ChartLine02 
                                                    series={JSON.stringify(dataEnhancedMonitor['charts']['network_tx'])} 
                                                    title={"Network(TX)"} height="200px" 
                                                />
                                          </td>
                                          
                                          <td style={{"width":"35%", "padding-left": "1em"}}>        
                                              <ChartLine02 
                                                    series={JSON.stringify(dataEnhancedMonitor['charts']['network_rx'])} 
                                                    title={"Network(RX)"} height="200px" 
                                                />
                                          </td>
                                        
                                      </tr>
                                  </table>
                                  </Container>
                                  <br/>
                                  <table style={{"width":"100%"}}>
                                      <tr>  
                                          <td style={{"width":"100%"}}>
                                                
                                                <CustomTable
                                                  columnsTable={columnsTableEm}
                                                  visibleContent={visibleContentEm}
                                                  dataset={dataEnhancedMonitor['counters']['processlist']}
                                                  title={"Processes"}
                                              />
                                      
                                      
                                          </td>
                                      </tr>
                                  </table>
                                  
                                  </td>
                            </tr>
                        </table>  
                                    
                        </>
                          
                        ,
                      },
                      {
                        label: "Query Editor",
                        id: "tab04",
                        content: 
                        <>
                       
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
                                        <tr>  
                                           <td style={{"width":"100%", "text-align":"center"}}>     
                                               <br/>
                                              <Table
                                                    stickyHeader
                                                    columnDefinitions={dataQuery.columns}
                                                    items={dataQuery.dataset}
                                                    loadingText="Loading records"
                                                    sortingDisabled
                                                    variant="embedded"
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
                                          </td>
                                        </tr>
                                    </table> 
                                  </Container> 
                                  
                                </td>
                              </tr>
                        </table> 
                        
                        
                         </>
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
                                            <div><div>{dataEnhancedMonitor['counters']['cpu'][1]['value']}</div></div>
                                          </div>
                                          <div>
                                            <Box variant="awsui-key-label">Memory</Box>
                                            <div><div>{(dataEnhancedMonitor['counters']['memory'][1]['value']/1024/1024/1024).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} GB</div></div>
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
