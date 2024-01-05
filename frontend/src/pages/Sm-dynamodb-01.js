import { useState,useEffect,useRef } from 'react';
import Axios from 'axios';
import { configuration } from './Configs';
import { customFormatNumber } from '../components/Functions';
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
import Container from "@cloudscape-design/components/container";
import CompMetric01  from '../components/Metric01';
import ChartLine04  from '../components/ChartLine04';
import ChartLine05  from '../components/ChartLine05';
import ChartRadialBar01 from '../components/ChartRadialBar01';
import ChartBar04 from '../components/ChartBar04';
import ChartPie01 from '../components/ChartPie-01';

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
const percentile = require("percentile");

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
    
    //-- Add token header
    Axios.defaults.headers.common['x-token'] = sessionStorage.getItem(cnf_connection_id);
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    
    //-- Set Page Title
    document.title = configuration["apps-settings"]["application-title"] + ' - ' + cnf_identifier;
   

    //--######## RealTime Metric Features
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [metricDetailsIndex,setMetricDetailsIndex] = useState({index : '', title : '' });
    

    //-- Variable for Table  Stats
    const [tableStats,setTableStats] = useState({ 
                                table : {
                                            name : "",
                                            status : "pending",
                                            size : 0 , 
                                            items : 0, 
                                            "class" : "-", 
                                            tableId : "-", 
                                            rcu : 0, 
                                            wcu : 0, 
                                            metadata : {},
                                            indexList : [],
                                            ConsumedReadCapacityUnits : 0,
                                            ConsumedWriteCapacityUnits : 0,
                                            ReadThrottleEvents : 0,
                                            WriteThrottleEvents : 0,
                                            ProvisionedWriteCapacityUnits : 0,
                                            ProvisionedReadCapacityUnits : 0,
                                            SuccessfulRequestLatencyGetItem : 0,
                                            SuccessfulRequestLatencyBatchGetItem : 0,
                                            SuccessfulRequestLatencyPutItem : 0,
                                            SuccessfulRequestLatencyBatchWriteItem : 0,
                                            SuccessfulRequestLatencyScan : 0,
                                            SuccessfulRequestLatencyQuery : 0,
                                            ThrottledRequestsGetItem : 0,
                                            ThrottledRequestsScan : 0,
                                            ThrottledRequestsQuery : 0,
                                            ThrottledRequestsBatchGetItem : 0,
                                            ThrottledRequestsPutItem : 0,
                                            ThrottledRequestsUpdateItem : 0,
                                            ThrottledRequestsDeleteItem : 0,
                                            ThrottledRequestsBatchWriteItem : 0,
                                            lastUpdate : "-",
                                            connectionId : "-",
                                            history : {
                                                    ConsumedReadCapacityUnits : [],
                                                    ConsumedWriteCapacityUnits : [],
                                                    ReadThrottleEvents : [],
                                                    WriteThrottleEvents : [],
                                                    ProvisionedWriteCapacityUnits : [],
                                                    ProvisionedReadCapacityUnits : [],
                                                    SuccessfulRequestLatencyGetItem : [],
                                                    SuccessfulRequestLatencyBatchGetItem : [],
                                                    SuccessfulRequestLatencyPutItem : [],
                                                    SuccessfulRequestLatencyBatchWriteItem : [],
                                                    SuccessfulRequestLatencyScan : [],
                                                    SuccessfulRequestLatencyQuery : [],
                                                    ThrottledRequestsGetItem : [],
                                                    ThrottledRequestsScan : [],
                                                    ThrottledRequestsQuery : [],
                                                    ThrottledRequestsBatchGetItem : [],
                                                    ThrottledRequestsPutItem : [],
                                                    ThrottledRequestsUpdateItem : [],
                                                    ThrottledRequestsDeleteItem : [],
                                                    ThrottledRequestsBatchWriteItem : [],
                                            },
                                            
                                },
                });
    
    
    //-- Variable for Index  Stats
    const [indexStats,setIndexStats] = useState({ 
                                index : {
                                            name : "",
                                            rcu : 0, 
                                            wcu : 0, 
                                            metadata : {},
                                            ConsumedReadCapacityUnits : 0,
                                            ConsumedWriteCapacityUnits : 0,
                                            ReadThrottleEvents : 0,
                                            WriteThrottleEvents : 0,
                                            ProvisionedWriteCapacityUnits : 0,
                                            ProvisionedReadCapacityUnits : 0,
                                            lastUpdate : "-",
                                            history : {
                                                    ConsumedReadCapacityUnits : [],
                                                    ConsumedWriteCapacityUnits : [],
                                                    ReadThrottleEvents : [],
                                                    WriteThrottleEvents : [],
                                                    ProvisionedWriteCapacityUnits : [],
                                                    ProvisionedReadCapacityUnits : [],
                                            },
                                            
                                },
                });
    
    const [selectedIndex,setSelectedIndex] = useState({});
    const indexName = useRef("code-index");
    const [indexList,setIndexList] = useState([]);
    
    //-- Function Open Connection
    async function openTableConnection() {
        
        var api_url = configuration["apps-settings"]["api_url"];
        Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
        await Axios.post(`${api_url}/api/dynamodb/open/connection/`,{
                      params: { 
                                connectionId : cnf_connection_id,
                                tableName : cnf_identifier,
                                engineType : "dynamodb"
                             }
              }).then((data)=>{
                
                
                if (data.data.newObject==false) {
                    setConnectionMessage([
                                  {
                                    type: "info",
                                    content: "Table connection already created at [" + data.data.creationTime + "] with identifier [" +  data.data.connectionId  + "], this connection will be re-used to gather metrics.",
                                    dismissible: true,
                                    dismissLabel: "Dismiss message",
                                    onDismiss: () => setConnectionMessage([]),
                                    id: "message_1"
                                  }
                    ]);
                }
                
                //-- Call First Refresh
                gatherTableStats();
                  
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/dynamodb/open/connection/ ' );
                  console.log(err);
                  
              });
              
    }
   

    //-- Function Gather Stats
    async function gatherTableStats() {
        var api_url = configuration["apps-settings"]["api_url"];
        
        if ( currentTabId.current == "tab01") {
            
            Axios.get(`${api_url}/api/dynamodb/gather/stats/`,{
                          params: { 
                                    connectionId : cnf_connection_id, 
                                    tableName : cnf_identifier, 
                                    engineType : "dynamodb"
                              
                          }
                      }).then((data)=>{
                       
                        if ( data.data.table.indexList.length > 0){
                            
                            var indexes = [];
                            data.data.table.indexList.forEach(function(index) {
                                indexes.push({ label : index, value : index });
                            });
                            indexName.current = data.data.table.indexList[0];
                            setIndexList(indexes);
                            setSelectedIndex({ label : data.data.table.indexList[0], value : data.data.table.indexList[0] });
                        }
    
                       setTableStats({ table : {...data.data.table } });
                       
    
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/dynamodb/gather/stats/' );
                      console.log(err);
                      
                  });
        }
        
         if ( currentTabId.current == "tab02") {
            
            Axios.get(`${api_url}/api/dynamodb/gather/index/stats/`,{
                          params: { 
                                    connectionId : cnf_connection_id, 
                                    tableName : cnf_identifier, 
                                    indexName : indexName.current, 
                                    engineType : "dynamodb"
                              
                          }
                      }).then((data)=>{
           
                       setIndexStats({ index : {...data.data.index } });
           
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/dynamodb/gather/stats/' );
                      console.log(err);
                      
                  });
        }
        
    }


    useEffect(() => {
        openTableConnection();
    }, []);
    
    
    useEffect(() => {
        const id = setInterval(gatherTableStats, configuration["apps-settings"]["refresh-interval-dynamodb"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
    
    //-- Function Handle Logout
   const handleClickMenu = ({detail}) => {
          
            switch (detail.id) {
              case 'signout':
                  closeConnection();
                break;
                
              case 'other':
                break;
              
            }
    };
    
    //-- Function Handle Logout
   const handleClickDisconnect = () => {
          closeConnection();
    };
    
    
    //-- Close Table Connection
    const closeConnection = () => {
        
        Axios.get(`${configuration["apps-settings"]["api_url"]}/api/dynamodb/close/connection/`,{
                      params: {     connectionId : cnf_connection_id, 
                                    tableName : cnf_identifier, 
                                    engineType : "dynamodb"
                            }
                  }).then((data)=>{
                      closeTabWindow();
                      sessionStorage.removeItem(parameter_code_id);
                  })
                  .catch((err) => {
                      console.log('Timeout API Call : /api/dynamodb/close/connection/');
                      console.log(err)
                  });
    }
       
    //-- Close TabWindow
    const closeTabWindow = () => {
              window.opener = null;
              window.open("", "_self");
              window.close();
      
    }



    function onClickMetric(metricId,metricTitle,data) {

        var dataset = data['history'][metricId].map((value, index) => {
            return data['history'][metricId][index][1];
        });
        
        dataset = dataset.filter(elements => {
            return elements !== null;
        })

        var max = Math.max(...dataset);
        var min = Math.min(...dataset);
        var avg = dataset.reduce((a,b) => a + b, 0) / dataset.length;
        var stats = percentile([50,90,95], dataset);
        
        setMetricDetailsIndex ({ index : metricId, title : metricTitle, p50 : stats[0], p90 : stats[1], p95 : stats[2], max : max, min : min, avg : avg, data : data });
        setsplitPanelShow(true);
                   
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
        splitPanelSize={350}
        splitPanel={
                  <SplitPanel  header={metricDetailsIndex.title} i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                    onSplitPanelToggle={({ detail }) => {
                                    
                                    }
                                  }
                  >
                     
                    { splitPanelShow === true &&
                    
                    <table style={{"width":"100%", "padding": "1em"}}>
                        <tr>
                            <td valign="top" style={{"width":"80%", "padding-left": "1em"}}>  
                                <ChartLine05 series={JSON.stringify([
                                                        { name : metricDetailsIndex.index, data : metricDetailsIndex['data']['history'][metricDetailsIndex.index] }
                                                    ])}
                                                    p50={metricDetailsIndex.p50}
                                                    p90={metricDetailsIndex.p90}
                                                    p95={metricDetailsIndex.p95}
                                                    avg={metricDetailsIndex.avg}
                                                    max={metricDetailsIndex.max}
                                                title={""} height="300px" 
                                />
                            </td>
                            <td valign="top" style={{"width":"10%", "padding-left": "1em"}}>  
                                <CompMetric01 
                                    value={metricDetailsIndex.p95 || 0}
                                    title={"p95"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.p90 || 0}
                                    title={"p90"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.p50 || 0}
                                    title={"p50"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                            </td>
                            <td valign="top" style={{"width":"10%", "padding-left": "1em"}}>  
                                <CompMetric01 
                                    value={metricDetailsIndex.max || 0}
                                    title={"Max"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.avg || 0}
                                    title={"Avg"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />
                                <br/>
                                <CompMetric01 
                                    value={metricDetailsIndex.min || 0}
                                    title={"Min"}
                                    precision={2}
                                    format={1}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
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
                                    <td style={{"width":"40%","padding-left": "1em", "border-left": "10px solid " + configuration.colors.lines.separator100,}}>  
                                        <SpaceBetween direction="horizontal" size="xs">
                                            { tableStats['table']['status'] != 'active' &&
                                                <Spinner size="big" />
                                            }
                                            <Box variant="h3" color="text-status-inactive" >{parameter_object_values['rds_id']} ({tableStats['table']['tableId']})</Box>
                                        </SpaceBetween>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <StatusIndicator type={tableStats['table']['status'] === 'active' ? 'success' : 'pending'}> {tableStats['table']['status']} </StatusIndicator>
                                        <Box variant="awsui-key-label">Status</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        { ( parseFloat(tableStats['table']['wcu']) != -1  ) &&
                                            <div>{ (parseFloat(tableStats['table']['wcu']).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}) ) || 0 }</div>
                                        }
                                        { ( parseFloat(tableStats['table']['wcu']) == -1  ) &&
                                            <div>On-Demand</div>
                                        }
                                        <Box variant="awsui-key-label">WCU</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        { ( parseFloat(tableStats['table']['rcu']) != -1  ) &&
                                            <div>{ (parseFloat(tableStats['table']['rcu']).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}) ) || 0 }</div>
                                        }
                                        { ( parseFloat(tableStats['table']['rcu']) == -1  ) &&
                                            <div>On-Demand</div>
                                        }
                                        <Box variant="awsui-key-label">RCU</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{ (parseFloat(tableStats['table']['items']).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}) ) || 0 }</div>
                                        <Box variant="awsui-key-label">Items</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{ customFormatNumber(parseFloat(tableStats['table']['size']) || 0, 0 ) }</div>
                                        <Box variant="awsui-key-label">Size</Box>
                                    </td>
                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                        <div>{tableStats['table']['lastUpdate']}</div>
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
                                        label: "Performance Metrics",
                                        id: "tab01",
                                        content: 
                                          
                                          <>
                                            <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                <tr>  
                                                   <td> 
                                                        <Container>
                                                                
                                                                <Box variant="h2" color="text-status-inactive" >Capacity Usage</Box>
                                                                
                                                                {/*##################|- PROVISONED MODE  -|#################*/}
                                                                
                                                                { ( parameter_object_values["mode"] == "provisioned"  ) &&
                                                                <div>
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>  
                                                                        <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}} rowspan="2">  
                                                                                <ChartPie01 
                                                                                        title={"Performance Analysis"} 
                                                                                        height="350px" 
                                                                                        width="100%" 
                                                                                        series = {[tableStats['table']['ConsumedWriteCapacityUnits'],tableStats['table']['ConsumedReadCapacityUnits']]}
                                                                                        labels = {["WriteCapacityUnits/sec","ReadCapacityUnits/sec"]}
                                                                                        onClickEvent={() => {}}
                                                                                />
                                                                                <br />
                                                                                <br />
                                                                                <CompMetric01 
                                                                                        value={ (tableStats['table']['ConsumedWriteCapacityUnits'] + tableStats['table']['ConsumedReadCapacityUnits'] ) || 0 }
                                                                                        title={"TotalCapacityUnitsConsumed/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                />
                                                                        </td>    
                                                                        <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                
                                                                                <ChartRadialBar01 
                                                                                        series={JSON.stringify([Math.round( ( ( tableStats['table']['ConsumedWriteCapacityUnits'] / tableStats['table']['wcu'] ) * 100 ) ) || 0 ])} 
                                                                                        height="180px" 
                                                                                        title={"WCU"}
                                                                                />
                                                                            
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedWriteCapacityUnits','WriteCapacityUnitsConsumed/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['ConsumedWriteCapacityUnits'] || 0}
                                                                                        title={"WriteCapacityUnitsConsumed/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                
                                                                        </td>
                                                                        <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('WriteThrottleEvents','WriteThrottleEvents/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['WriteThrottleEvents'] || 0}
                                                                                        title={"WriteThrottleEvents/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                        </td>
                                                                        <td valign="top"  style={{"width":"61%"}}>  
                                                                            <ChartBar04 series={JSON.stringify([
                                                                                                    { name : "WriteCapacityUnitsConsumed", data : tableStats['table']['history']['ConsumedWriteCapacityUnits'], type: "bar"},
                                                                                                    { name : "WriteCapacityUnitsProvisioned", data : tableStats['table']['history']['ProvisionedWriteCapacityUnits'], type: "line" }
                                                                                                ])}
                                                                                            title={"WriteCapacityUnits/sec"} height="220px" 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr>  
                                                                        <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                <ChartRadialBar01 
                                                                                        series={JSON.stringify([Math.round( ( ( tableStats['table']['ConsumedReadCapacityUnits'] / tableStats['table']['rcu'] ) * 100 ) ) || 0 ])} 
                                                                                        height="180px" 
                                                                                        title={"RCU"}
                                                                                />  
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedReadCapacityUnits','CapacityUnitsConsumed/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['ConsumedReadCapacityUnits'] || 0}
                                                                                        title={"ReadCapacityUnitsConsumed/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                
                                                                        </td>
                                                                        <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ReadThrottleEvents','ReadThrottleEvents/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['ReadThrottleEvents'] || 0}
                                                                                        title={"ReadThrottleEvents/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                        </td>
                                                                        <td valign="top"  style={{"width":"61%"}}>  
                                                                            <br/>
                                                                            <br/>
                                                                            <ChartBar04 series={JSON.stringify([
                                                                                                    { name : "ReadCapacityUnitsConsumed", data : tableStats['table']['history']['ConsumedReadCapacityUnits'], type: "bar" },
                                                                                                    { name : "ReadCapacityUnitsProvisioned", data : tableStats['table']['history']['ProvisionedReadCapacityUnits'], type: "line" }
                                                                                                ])}
                                                                                            title={"ReadCapacityUnits/sec"} height="220px" 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </table> 
                                                                </div>
                                                                }
                                                                
                                                                
                                                                {/*##################|- ON DEMAND MODE  -|#################*/}
                                                                
                                                                { ( parameter_object_values["mode"] == "on-demand"  ) &&
                                                                <div>
                                                                <table style={{"width":"100%"}}>
                                                                    <tr>  
                                                                        <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}} rowspan="2">  
                                                                                <ChartPie01 
                                                                                        title={"Performance Analysis"} 
                                                                                        height="350px" 
                                                                                        width="100%" 
                                                                                        series = {[tableStats['table']['ConsumedWriteCapacityUnits'],tableStats['table']['ConsumedReadCapacityUnits']]}
                                                                                        labels = {["WriteCapacityUnits/sec","ReadCapacityUnits/sec"]}
                                                                                        onClickEvent={() => {}}
                                                                                />
                                                                                <br />
                                                                                <br />
                                                                                <CompMetric01 
                                                                                        value={ (tableStats['table']['ConsumedWriteCapacityUnits'] + tableStats['table']['ConsumedReadCapacityUnits'] ) || 0 }
                                                                                        title={"TotalCapacityUnitsConsumed/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                />
                                                                        </td>            
                                                                        <td valign="middle" style={{"width":"15%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedWriteCapacityUnits','ConsumedWriteCapacityUnits/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['ConsumedWriteCapacityUnits'] || 0}
                                                                                        title={"WriteCapacityUnitsConsumed/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                <br />
                                                                                <br />
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('WriteThrottleEvents','WriteThrottleEvents/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['WriteThrottleEvents'] || 0}
                                                                                        title={"WriteThrottleEvents/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                
                                                                        </td>
                                                                        <td valign="top"  style={{"width":"60%"}}>  
                                                                            <ChartBar04 series={JSON.stringify([
                                                                                                    { name : "ConsumedWriteCapacityUnits", data : tableStats['table']['history']['ConsumedWriteCapacityUnits'], type: "bar" },
                                                                                                ])}
                                                                                            title={"WriteCapacityUnits/sec"} height="220px" 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr>  
                                                                        <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedReadCapacityUnits','ConsumedReadCapacityUnits/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['ConsumedReadCapacityUnits'] || 0}
                                                                                        title={"ReadCapacityUnitsConsumed/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                <br />
                                                                                <br />
                                                                                <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ReadThrottleEvents','ReadThrottleEvents/sec',tableStats['table'])}>
                                                                                    <CompMetric01 
                                                                                        value={tableStats['table']['ReadThrottleEvents'] || 0}
                                                                                        title={"ReadThrottleEvents/sec"}
                                                                                        precision={2}
                                                                                        format={4}
                                                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                                                        fontSizeValue={"24px"}
                                                                                    />
                                                                                </a>
                                                                                
                                                                        </td>
                                                                        <td valign="top"  style={{"width":"61%"}}>  
                                                                            <ChartBar04 series={JSON.stringify([
                                                                                                    { name : "ConsumedReadCapacityUnits", data : tableStats['table']['history']['ConsumedReadCapacityUnits'], type: "bar" },
                                                                                                ])}
                                                                                            title={"ReadCapacityUnits/sec"} height="220px" 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </table> 
                                                                </div>
                                                                }
                                                                
                                                                
                                                                
                                                                <br />
                                                                <br />
                                                                <Box variant="h2" color="text-status-inactive" >Operations Latency</Box>
                                                                <br />
                                                                <table style={{"width":"100%"}}>
                                                                  <tr>  
                                                                    <td style={{"width":"100%","padding-left": "1em"}}> 
                                                                            <ChartLine04 series={JSON.stringify([
                                                                                                    { name : "GetItem", data : tableStats['table']['history']['SuccessfulRequestLatencyGetItem'] },
                                                                                                    { name : "PutItem", data : tableStats['table']['history']['SuccessfulRequestLatencyPutItem'] },
                                                                                                    { name : "Query", data : tableStats['table']['history']['SuccessfulRequestLatencyQuery'] },
                                                                                                    { name : "Scan", data : tableStats['table']['history']['SuccessfulRequestLatencyScan'] } ,
                                                                                                    { name : "BatchGetItem", data : tableStats['table']['history']['SuccessfulRequestLatencyBatchGetItem'] } ,
                                                                                                    { name : "BatchWriteItem", data : tableStats['table']['history']['SuccessfulRequestLatencyBatchWriteItem'] }
                                                                                                ])}
                                                                                            title={"Latency(ms)"} height="300px" 
                                                                            />
                                                                            
                                                                    </td>
                                                                  </tr>
                                                                </table>
                                                                <table style={{"width":"100%"}}>
                                                                    <tr> 
                                                                        <td style={{"width":"3%",  "padding-left": "1em"}}>  
                                                                        </td>
                                                                        <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulRequestLatencyGetItem','GetItemLatency(us)',tableStats['table'])}>
                                                                                <CompMetric01 
                                                                                    value={tableStats['table']['SuccessfulRequestLatencyGetItem'] || 0}
                                                                                    title={"GetItemLatency(ms)"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulRequestLatencyPutItem','PutItemLatency(us)',tableStats['table'])}>
                                                                                <CompMetric01 
                                                                                    value={tableStats['table']['SuccessfulRequestLatencyPutItem'] || 0}
                                                                                    title={"PutItemLatency(ms)"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulRequestLatencyScan','ScanLatency(us)',tableStats['table'])}>
                                                                                <CompMetric01 
                                                                                    value={tableStats['table']['SuccessfulRequestLatencyScan'] || 0}
                                                                                    title={"ScanLatency(ms)"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulRequestLatencyQuery','QueryLatency(us)',tableStats['table'])}>
                                                                                <CompMetric01 
                                                                                    value={tableStats['table']['SuccessfulRequestLatencyQuery'] || 0}
                                                                                    title={"QueryLatency(ms)"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulRequestLatencyBatchGetItem','BatchGetItemLatency(us)',tableStats['table'])}>
                                                                                <CompMetric01 
                                                                                    value={tableStats['table']['SuccessfulRequestLatencyBatchGetItem'] || 0}
                                                                                    title={"BatchGetItemLatency(ms)"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                        <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('SuccessfulRequestLatencyBatchWriteItem','BatchWriteItemLatency(us)',tableStats['table'])}>
                                                                                <CompMetric01 
                                                                                    value={tableStats['table']['SuccessfulRequestLatencyBatchWriteItem'] || 0}
                                                                                    title={"BatchWriteItemLatency(ms)"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"16px"}
                                                                                />
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                            </table>  
                                                            
                                                            <br />
                                                            <br />
                                                            <br />
                                                            <Box variant="h2" color="text-status-inactive" >Throttled Requests</Box>
                                                            <br />
                                                            <table style={{"width":"100%"}}>
                                                              <tr>  
                                                                <td style={{"width":"100%","padding-left": "1em"}}> 
                                                                        <ChartLine04 series={JSON.stringify([
                                                                                                { name : "GetItem", data : tableStats['table']['history']['ThrottledRequestsGetItem'] },
                                                                                                { name : "PutItem", data : tableStats['table']['history']['ThrottledRequestsPutItem'] },
                                                                                                { name : "Scan", data : tableStats['table']['history']['ThrottledRequestsScan'] },
                                                                                                { name : "Query", data : tableStats['table']['history']['ThrottledRequestsQuery'] } ,
                                                                                                { name : "UpdateItem", data : tableStats['table']['history']['ThrottledRequestsUpdateItem'] } ,
                                                                                                { name : "DeleteItem", data : tableStats['table']['history']['ThrottledRequestsDeleteItem'] }
                                                                                            ])}
                                                                                        title={"Events/sec"} height="300px" 
                                                                        />
                                                                        
                                                                </td>
                                                              </tr>
                                                            </table>
                                                            <table style={{"width":"100%"}}>
                                                                <tr> 
                                                                    <td style={{"width":"3%",  "padding-left": "1em"}}>  
                                                                    </td>
                                                                    <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledRequestsGetItem','ThrottledRequestsGetItem/sec',tableStats['table'])}>
                                                                            <CompMetric01 
                                                                                value={tableStats['table']['ThrottledRequestsGetItem'] || 0}
                                                                                title={"ThrottledRequestsGetItem/sec"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledRequestsPutItem','ThrottledRequestsPutItem/sec',tableStats['table'])}>
                                                                            <CompMetric01 
                                                                                value={tableStats['table']['ThrottledRequestsPutItem'] || 0}
                                                                                title={"ThrottledRequestsPutItem/sec"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledRequestsScan','ThrottledRequestsScan/sec',tableStats['table'])}>
                                                                            <CompMetric01 
                                                                                value={tableStats['table']['ThrottledRequestsScan'] || 0}
                                                                                title={"ThrottledRequestsScan/sec"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledRequestsQuery','ThrottledRequestsQuery/sec',tableStats['table'])}>
                                                                            <CompMetric01 
                                                                                value={tableStats['table']['ThrottledRequestsQuery'] || 0}
                                                                                title={"ThrottledRequestsQuery/sec"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledRequestsUpdateItem','ThrottledRequestsUpdateItem/sec',tableStats['table'])}>
                                                                            <CompMetric01 
                                                                                value={tableStats['table']['ThrottledRequestsUpdateItem'] || 0}
                                                                                title={"ThrottledRequestsUpdateItem/sec"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                    <td style={{"width":"15%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                                                        <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ThrottledRequestsDeleteItem','ThrottledRequestsDeleteItem/sec',tableStats['table'])}>
                                                                            <CompMetric01 
                                                                                value={tableStats['table']['ThrottledRequestsDeleteItem'] || 0}
                                                                                title={"ThrottledRequestsDeleteItem/sec"}
                                                                                precision={2}
                                                                                format={4}
                                                                                fontColorValue={configuration.colors.fonts.metric100}
                                                                                fontSizeValue={"16px"}
                                                                            />
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                        </table> 
                                                            
                                                        </Container>
                                                        <br/>
                                                        
                                                    </td>
                                                </tr>
                                            </table>  
                                                
                                                
                                          </>
                                          
                                      },
                                      {
                                        label: "Global Secondary Indexes",
                                        id: "tab02",
                                        disabled : ( tableStats['table']['indexList'].length > 0 ? false : true ),
                                        content: 
                                         
                                          <>
                                          <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                <tr>  
                                                   <td>
                                                        <Container>
                                                        
                                                            <table style={{"width":"100%"}}>
                                                                <tr>  
                                                                    <td valign="top" style={{"width":"20%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                                                        <FormField label="Index name">
                                                                                    
                                                                                        <Select
                                                                                              selectedOption={selectedIndex}
                                                                                              onChange={({ detail }) => {
                                                                                                     indexName.current = detail.selectedOption.value;
                                                                                                     setSelectedIndex(detail.selectedOption);
                                                                                                     gatherTableStats();
                                                                                              }
                                                                                              }
                                                                                              options={indexList}
                                                                                              filteringType="auto"
                                                                                        />
                                                                        </FormField>
                                                                    </td>
                                                                    <td style={{"width":"20%","padding-left": "1em", }}>  
                                                                    </td>
                                                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                                                        <StatusIndicator type={indexStats['index']['status'] === 'active' ? 'success' : 'pending'}> {indexStats['index']['status']} </StatusIndicator>
                                                                        <Box variant="awsui-key-label">Status</Box>
                                                                    </td>
                                                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                                                        { ( parseFloat(indexStats['index']['wcu']) != -1  ) &&
                                                                            <div>{ (parseFloat(indexStats['index']['wcu']).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}) ) || 0 }</div>
                                                                        }
                                                                        { ( parseFloat(indexStats['index']['wcu']) == -1  ) &&
                                                                            <div>On-Demand</div>
                                                                        }
                                                                        <Box variant="awsui-key-label">WCU</Box>
                                                                    </td>
                                                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                                                        { ( parseFloat(indexStats['index']['rcu']) != -1  ) &&
                                                                            <div>{ (parseFloat(indexStats['index']['rcu']).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}) ) || 0 }</div>
                                                                        }
                                                                        { ( parseFloat(indexStats['index']['rcu']) == -1  ) &&
                                                                            <div>On-Demand</div>
                                                                        }
                                                                        <Box variant="awsui-key-label">RCU</Box>
                                                                    </td>
                                                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                                                        <div>{ (parseFloat(indexStats['index']['items']).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}) ) || 0 }</div>
                                                                        <Box variant="awsui-key-label">Items</Box>
                                                                    </td>
                                                                    <td style={{"width":"10%","padding-left": "1em", "border-left": "4px solid " + configuration.colors.lines.separator100,}}>  
                                                                        <div>{ customFormatNumber(parseFloat(indexStats['index']['size']) || 0, 0 ) }</div>
                                                                        <Box variant="awsui-key-label">Size</Box>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            
                                                            <br />
                                                            <Box variant="h2" color="text-status-inactive" >Capacity Usage</Box>
                                                            <br />
                                                            {/*##################|- PROVISONED MODE  -|#################*/}
                                                            
                                                            { ( parameter_object_values["mode"] == "provisioned"  ) &&
                                                            <div>
                                                            <table style={{"width":"100%"}}>
                                                                <tr>  
                                                                    <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}} rowspan="2">  
                                                                            <ChartPie01 
                                                                                    title={"Performance Analysis"} 
                                                                                    height="350px" 
                                                                                    width="100%" 
                                                                                    series = {[indexStats['index']['ConsumedWriteCapacityUnits'],indexStats['index']['ConsumedReadCapacityUnits']]}
                                                                                    labels = {["WriteCapacityUnits/sec","ReadCapacityUnits/sec"]}
                                                                                    onClickEvent={() => {}}
                                                                            />
                                                                            <br />
                                                                            <br />
                                                                            <CompMetric01 
                                                                                    value={ (indexStats['index']['ConsumedWriteCapacityUnits'] + indexStats['index']['ConsumedReadCapacityUnits'] ) || 0 }
                                                                                    title={"TotalCapacityUnitsConsumed/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                            />
                                                                    </td>    
                                                                    <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                            
                                                                            <ChartRadialBar01 
                                                                                    series={JSON.stringify([Math.round( ( ( indexStats['index']['ConsumedWriteCapacityUnits'] / indexStats['index']['wcu'] ) * 100 ) ) || 0 ])} 
                                                                                    height="180px" 
                                                                                    title={"WCU"}
                                                                            />
                                                                        
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedWriteCapacityUnits','WriteCapacityUnitsConsumed/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['ConsumedWriteCapacityUnits'] || 0}
                                                                                    title={"WriteCapacityUnitsConsumed/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                            
                                                                    </td>
                                                                    <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('WriteThrottleEvents','WriteThrottleEvents/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['WriteThrottleEvents'] || 0}
                                                                                    title={"WriteThrottleEvents/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                    </td>
                                                                    <td valign="top"  style={{"width":"61%"}}>  
                                                                        <ChartBar04 series={JSON.stringify([
                                                                                                { name : "WriteCapacityUnitsConsumed", data : indexStats['index']['history']['ConsumedWriteCapacityUnits'], type: "bar"},
                                                                                                { name : "WriteCapacityUnitsProvisioned", data : indexStats['index']['history']['ProvisionedWriteCapacityUnits'], type: "line" }
                                                                                            ])}
                                                                                        title={"WriteCapacityUnits/sec"} height="220px" 
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>  
                                                                    <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                            <ChartRadialBar01 
                                                                                    series={JSON.stringify([Math.round( ( ( indexStats['index']['ConsumedReadCapacityUnits'] / indexStats['index']['rcu'] ) * 100 ) ) || 0 ])} 
                                                                                    height="180px" 
                                                                                    title={"RCU"}
                                                                            />  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedReadCapacityUnits','CapacityUnitsConsumed/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['ConsumedReadCapacityUnits'] || 0}
                                                                                    title={"ReadCapacityUnitsConsumed/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                            
                                                                    </td>
                                                                    <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ReadThrottleEvents','ReadThrottleEvents/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['ReadThrottleEvents'] || 0}
                                                                                    title={"ReadThrottleEvents/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                    </td>
                                                                    <td valign="top"  style={{"width":"61%"}}>  
                                                                        <br/>
                                                                        <br/>
                                                                        <ChartBar04 series={JSON.stringify([
                                                                                                { name : "ReadCapacityUnitsConsumed", data : indexStats['index']['history']['ConsumedReadCapacityUnits'], type: "bar" },
                                                                                                { name : "ReadCapacityUnitsProvisioned", data : indexStats['index']['history']['ProvisionedReadCapacityUnits'], type: "line" }
                                                                                            ])}
                                                                                        title={"ReadCapacityUnits/sec"} height="220px" 
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </table> 
                                                            </div>
                                                            }
                                                            
                                                            
                                                            {/*##################|- ON DEMAND MODE  -|#################*/}
                                                            
                                                            { ( parameter_object_values["mode"] == "on-demand"  ) &&
                                                            <div>
                                                            <table style={{"width":"100%"}}>
                                                                <tr>  
                                                                    <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}} rowspan="2">  
                                                                            <ChartPie01 
                                                                                    title={"Performance Analysis"} 
                                                                                    height="350px" 
                                                                                    width="100%" 
                                                                                    series = {[indexStats['index']['ConsumedWriteCapacityUnits'],indexStats['index']['ConsumedReadCapacityUnits']]}
                                                                                    labels = {["WriteCapacityUnits/sec","ReadCapacityUnits/sec"]}
                                                                                    onClickEvent={() => {}}
                                                                            />
                                                                            <br />
                                                                            <br />
                                                                            <CompMetric01 
                                                                                    value={ (indexStats['index']['ConsumedWriteCapacityUnits'] + indexStats['index']['ConsumedReadCapacityUnits'] ) || 0 }
                                                                                    title={"TotalCapacityUnitsConsumed/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                            />
                                                                    </td>            
                                                                    <td valign="middle" style={{"width":"15%", "padding-left": "1em", "text-align": "center"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedWriteCapacityUnits','ConsumedWriteCapacityUnits/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['ConsumedWriteCapacityUnits'] || 0}
                                                                                    title={"WriteCapacityUnitsConsumed/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                            <br />
                                                                            <br />
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('WriteThrottleEvents','WriteThrottleEvents/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['WriteThrottleEvents'] || 0}
                                                                                    title={"WriteThrottleEvents/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                            
                                                                    </td>
                                                                    <td valign="top"  style={{"width":"60%"}}>  
                                                                        <ChartBar04 series={JSON.stringify([
                                                                                                { name : "ConsumedWriteCapacityUnits", data : indexStats['index']['history']['ConsumedWriteCapacityUnits'], type: "bar" },
                                                                                            ])}
                                                                                        title={"WriteCapacityUnits/sec"} height="220px" 
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>  
                                                                    <td valign="middle" style={{"width":"13%", "padding-left": "1em", "text-align": "center"}}>  
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ConsumedReadCapacityUnits','ConsumedReadCapacityUnits/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['ConsumedReadCapacityUnits'] || 0}
                                                                                    title={"ReadCapacityUnitsConsumed/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                            <br />
                                                                            <br />
                                                                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetric('ReadThrottleEvents','ReadThrottleEvents/sec',indexStats['index'])}>
                                                                                <CompMetric01 
                                                                                    value={indexStats['index']['ReadThrottleEvents'] || 0}
                                                                                    title={"ReadThrottleEvents/sec"}
                                                                                    precision={2}
                                                                                    format={4}
                                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                                    fontSizeValue={"24px"}
                                                                                />
                                                                            </a>
                                                                            
                                                                    </td>
                                                                    <td valign="top"  style={{"width":"61%"}}>  
                                                                        <ChartBar04 series={JSON.stringify([
                                                                                                { name : "ConsumedReadCapacityUnits", data : indexStats['index']['history']['ConsumedReadCapacityUnits'], type: "bar" },
                                                                                            ])}
                                                                                        title={"ReadCapacityUnits/sec"} height="220px" 
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </table> 
                                                            </div>
                                                            }
                                                            
                                                            <br />
                                                            <br />
                                                            <br />
                                                            <Box variant="h2" color="text-status-inactive" >Throttled Requests</Box>
                                                            <br />
                                                            <table style={{"width":"100%"}}>
                                                              <tr>  
                                                                <td style={{"width":"100%","padding-left": "1em"}}> 
                                                                        <ChartLine04 series={JSON.stringify([
                                                                                                { name : "ReadThrottleEvents", data : indexStats['index']['history']['ReadThrottleEvents'] },
                                                                                                { name : "WriteThrottleEvents", data : indexStats['index']['history']['WriteThrottleEvents'] },
                                                                                            ])}
                                                                                        title={"Events/sec"} height="300px" 
                                                                        />
                                                                        
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
                                        label: "Table Information",
                                        id: "tab05",
                                        content: 
                                         
                                          <>
                                                 
                                              <table style={{"width":"100%", "padding": "1em", "background-color ": "black"}}>
                                                    <tr>  
                                                        <td>
                                                                <Container>
                                                                    <ColumnLayout columns={4} variant="text-grid">
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Table name</Box>
                                                                            <div>{parameter_object_values['rds_id']}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">Size</Box>
                                                                            <div>{customFormatNumber(parseFloat(tableStats['table']['size']) || 0, 0 )}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">WCU</Box>
                                                                            <div>{tableStats['table']['wcu']}</div>
                                                                      </div>
                                                                      <div>
                                                                            <Box variant="awsui-key-label">RCU</Box>
                                                                            <div>{tableStats['table']['rcu']}</div>
                                                                      </div>
                                                                    </ColumnLayout>
                                                                    <br/>
                                                                    <br/>
                                                                    <ColumnLayout columns={4} variant="text-grid">
                                                                        <div>
                                                                            <Box variant="awsui-key-label">Status</Box>
                                                                            <div>{tableStats['table']['status']}</div>
                                                                        </div>
                                                                        <div>
                                                                            <Box variant="awsui-key-label">Table Id</Box>
                                                                            <div>{tableStats['table']['tableId']}</div>
                                                                        </div>
                                                                    </ColumnLayout>
                                                                    <br/>
                                                                    <br/>
                                                                    <ColumnLayout columns={1} variant="text-grid">
                                                                        <div>
                                                                            <Box variant="awsui-key-label">Metadata</Box>
                                                                            <Box variant="code">
                                                                                {JSON.stringify(tableStats['table']['metadata'])}
                                                                            </Box>
                                                                        </div>
                                                                    </ColumnLayout>
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

