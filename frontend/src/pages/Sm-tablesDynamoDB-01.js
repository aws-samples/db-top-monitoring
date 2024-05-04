import {useState,useEffect} from 'react'
import { createSearchParams } from "react-router-dom";
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';
import { applicationVersionUpdate, getMatchesCountText, createLabelFunction, paginationLabels, pageSizePreference, collectionPreferencesProps, EmptyState, customFormatNumberShort, customFormatNumberLong, customFormatNumber } from '../components/Functions';

import { useCollection } from '@cloudscape-design/collection-hooks';
import {CollectionPreferences,Pagination } from '@cloudscape-design/components';
import TextFilter from "@cloudscape-design/components/text-filter";

import CustomHeader from "../components/HeaderApp";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from '@cloudscape-design/components/side-navigation';

import Flashbar from "@cloudscape-design/components/flashbar";
import { StatusIndicator } from '@cloudscape-design/components';
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import '@aws-amplify/ui-react/styles.css';

import ChartPie01 from '../components/ChartPie-01';
import CompMetric01  from '../components/Metric01';
import ChartLine04  from '../components/ChartLine04';

import { SplitPanel } from '@cloudscape-design/components';


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




//-- Encryption
var CryptoJS = require("crypto-js");

function Login() {
    
    //-- Application Version
    const [versionMessage, setVersionMessage] = useState([]);
  
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    const [recommendations,setRecommendations] = useState([]);
    
    // Metrics
    const [globalMetrics, setGlobalMetrics] = useState({ 
                                                          ConsumedWriteCapacityUnits : { value : 0, history : [] },
                                                          ConsumedReadCapacityUnits : { value : 0, history : [] },
                                                          ThrottledRequests : { value : 0, history : [] }
      
    });
    
    //-- Variables Table
    const columnsTable = [
                  {id: 'identifier',header: 'Table Name',cell: item => item.identifier,ariaLabel: createLabelFunction('Table Name'),sortingField: 'identifier',},
                  {id: 'status',header: 'Status',cell: item => ( <> <StatusIndicator type={item.status === 'active' ? 'success' : 'pending'}> {item.status} </StatusIndicator> </> ),ariaLabel: createLabelFunction('Status'),sortingField: 'status',},
                  {id: 'wcuConsumed',header: 'WCU/sec',cell: item => customFormatNumberShort(parseFloat(item.wcuConsumed) || 0,0),ariaLabel: createLabelFunction('wcuConsumed'),sortingField: 'wcuConsumed',},
                  {id: 'rcuConsumed',header: 'RCU/sec',cell: item => customFormatNumberShort(parseFloat(item.rcuConsumed) || 0,0),ariaLabel: createLabelFunction('rcuConsumed'),sortingField: 'rcuConsumed',},
                  {id: 'latencyMax',header: 'LatencyMax(ms)',cell: item => customFormatNumberShort(parseFloat(item.latencyMax) || 0,0),ariaLabel: createLabelFunction('latencyMax'),sortingField: 'latencyMax',},
                  {id: 'latencyAverage',header: 'LatencyAverage(ms)',cell: item => customFormatNumberShort(parseFloat(item.latencyAverage) || 0,0),ariaLabel: createLabelFunction('latencyAverage'),sortingField: 'latencyAverage',},
                  {id: 'writeThrottled',header: 'WriteThrottledRequests',cell: item => customFormatNumberShort(parseFloat(item.writeThrottled) || 0,0),ariaLabel: createLabelFunction('writeThrottled'),sortingField: 'writeThrottled',},
                  {id: 'readThrottled',header: 'ReadThrottledRequests',cell: item => customFormatNumberShort(parseFloat(item.readThrottled) || 0,0),ariaLabel: createLabelFunction('readThrottled'),sortingField: 'readThrottled',},
                  {id: 'pkey',header: 'Partition Key',cell: item => item.pkey,ariaLabel: createLabelFunction('Partition Key'),sortingField: 'pkey',},
                  {id: 'class',header: 'Table Class',cell: item => item.class,ariaLabel: createLabelFunction('Table Class'),sortingField: 'class',},
                  {id: 'indexes',header: 'Indexes',cell: item => item.indexes,ariaLabel: createLabelFunction('Indexes'),sortingField: 'indexes',},
                  {id: 'items',header: 'Items',cell: item => customFormatNumberLong(parseFloat(item.items) || 0,0),ariaLabel: createLabelFunction('Items'),sortingField: 'items',},
                  {id: 'size',header: 'Size',cell: item => customFormatNumber(parseFloat(item.size) || 0 , 0) ,ariaLabel: createLabelFunction('Size'),sortingField: 'size',},
                  {id: 'wcu',header: 'Write Capacity',cell: item => item.wcu,ariaLabel: createLabelFunction('Write Capacity'),sortingField: 'wcu',},
                  {id: 'rcu',header: 'Read Capacity',cell: item => item.rcu,ariaLabel: createLabelFunction('Read Capacity'),sortingField: 'rcu',},
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
    
   
    const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['identifier', 'status','wcuConsumed', 'rcuConsumed', 'writeThrottled', 'readThrottled', 'items', 'size', 'rcu', 'wcu' ] });
    
    const [itemsTable,setItemsTable] = useState([]);
    const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
                itemsTable,
                {
                  filtering: {
                    empty: <EmptyState title="No instances" action={<Button>Create instance</Button>} />,
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
  
    
    

    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
    
    //-- Handle Click Events
    const handleClickLogin = () => {
            
            
            // Add CSRF Token
            Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
            
            // Get Authentication
            Axios.post(`${configuration["apps-settings"]["api_url"]}/api/dynamodb/authentication/`,{
                params: { 
                          tableName: selectedItems[0]['identifier'], 
                          engineType : "dynamodb"
                }
            }).then((data)=>{
                if (data.data.result === "auth1") {
                     sessionStorage.setItem(data.data.session_id, data.data.session_token );
                     var session_id = CryptoJS.AES.encrypt(JSON.stringify({
                                                                            session_id : data.data.session_id,
                                                                            rds_id : selectedItems[0]['identifier'],
                                                                            rds_engine : "dynamodb",
                                                                            rds_user : "IAM Auth",
                                                                            engineType : "dynamodb",
                                                                            mode : (selectedItems[0]['wcu'] == "On-Demand" ? "on-demand" : "provisioned"),
                                                                            }), 
                                                            data.data.session_id
                                                            ).toString();
                                                            
                                                            
                     
                    
                    window.open( '/sm-dynamodb-01' + '?' + createSearchParams({
                                session_id: session_id,
                                code_id: data.data.session_id
                                }).toString() ,'_blank');
                    
    
                }
                else {
                 

                }
                  

            })
            .catch((err) => {
                
                console.log('Timeout API Call : /api/dynamodb/authentication/');
                console.log(err)
            });
            
            
    };
    
    
  //-- Call API to App Version
   async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbtop", moduleId: "aurora"} );
        
        if (appVersionObject.release > configuration["apps-settings"]["release"] && configuration["apps-settings"]["release-enforcement"] ){
          setVersionMessage([
                              {
                                type: "info",
                                content: "New Application version is available, new features and modules will improve monitoring capabilities and user experience.",
                                dismissible: true,
                                dismissLabel: "Dismiss message",
                                onDismiss: () => setVersionMessage([]),
                                id: "message_1"
                              }
          ]);
      
        }
        
   }
   
   
   
  
    
    //-- Call API to gather instances
   async function gatherTablesDetails (){
        
        //--- GATHER Tables
        var rdsItems=[];
        try{
        
            const { data } = await Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/region/dynamodb/tables/details/`);
            sessionStorage.setItem("x-csrf-token", data.csrfToken );
            setGlobalMetrics(data.metrics);
            data.tables.forEach(function(item) {
                           
                            try{
                                
                                  rdsItems.push({
                                                identifier: item.tableName,
                                                status : item.status,
                                                rcuConsumed : item.ConsumedReadCapacityUnits,
                                                wcuConsumed : item.ConsumedWriteCapacityUnits,
                                                readThrottled : item.ReadThrottledRequests,
                                                writeThrottled : item.WriteThrottledRequests,
                                                latencyMax : item.MaxSuccessfulRequestLatency,
                                                latencyAverage : item.AverageSuccessfulRequestLatency,
                                                pkey: item.pkey,
                                                class: item.class,
                                                indexes: item.indexes,
                                                items : item.items,
                                                size : item.size,
                                                rcu: (item.rcu == -1 ? "On-Demand" : item.rcu),
                                                wcu : (item.wcu == -1 ? "On-Demand" : item.wcu),
                                  });
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/aws/region/dynamodb/tables/details/');                  
                            }
            })
            
        }
        catch{
          console.log('Timeout API error : /api/aws/region/dynamodb/tables/');                  
        }
        setItemsTable(rdsItems);
        /*
        if (rdsItems.length > 0 ) {
          setSelectedItems([rdsItems[0]]);
          setsplitPanelShow(true);
        }
        */

    }
    
    
    //-- Call API to gather recommendations
   async function handleClickGetRecommendations (){
        
        //--- GATHER Recommendations
        var rdsItems=[];
        try{
        
            const { data } = await Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/application/recommendation/get/`);
            sessionStorage.setItem("x-csrf-token", data.csrfToken );
            var response = JSON.parse(data['response']?.['content']?.[0]?.['text']);
            console.log(response);
        }
        catch(err){
          console.log(err);
          console.log('Timeout API error : /api/aws/application/recommendation/get/');                  
        }

    }
        
    
    //-- Init Function
    // eslint-disable-next-line
    useEffect(() => {
        gatherTablesDetails();
        const id = setInterval(gatherTablesDetails, configuration["apps-settings"]["refresh-interval-dynamodb"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        gatherVersion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
  return (
    <div style={{"background-color": "#f2f3f3"}}>
        <CustomHeader/>
        <AppLayout
            headerSelector="#h"
            disableContentPaddings={true}
            breadCrumbs={breadCrumbs}
            navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/tables/dynamodb/"} />}
            splitPanelOpen={splitPanelShow}
            onSplitPanelToggle={() => setsplitPanelShow(false)}
            splitPanelSize={250}
            toolsHide={true}
            splitPanel={
                      <SplitPanel  
                          header={
                          
                              <Header
                                      variant="h3"
                                      actions={
                                              <SpaceBetween
                                                direction="horizontal"
                                                size="xs"
                                              >
                                                <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={handleClickLogin}>Connect</Button>
                                              </SpaceBetween>
                                      }
                                      
                                    >
                                     {"TableName : " + selectedItems[0].identifier}
                                    </Header>
                            
                          } 
                          i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                          onSplitPanelToggle={({ detail }) => {
                                         //console.log(detail);
                                        }
                                      }
                      >
                        
                        <ColumnLayout columns="4" variant="text-grid">
                             <div>
                                  <Box variant="awsui-key-label">Table Name</Box>
                                  {selectedItems[0]['identifier']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Status</Box>
                                  {selectedItems[0]['status']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Partition Key</Box>
                                  {selectedItems[0]['pkey']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Sort Key</Box>
                                  {selectedItems[0]['skey']}
                              </div>
                            </ColumnLayout>
                            <br /> 
                            <br />
                            <ColumnLayout columns="4" variant="text-grid">
                              <div>
                                  <Box variant="awsui-key-label">Indexes</Box>
                                  {selectedItems[0]['indexes']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Read Capacity</Box>
                                  {selectedItems[0]['rcu']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Write Capacity</Box>
                                  {selectedItems[0]['wcu']}
                              </div>
                            
                            </ColumnLayout>
                            
                      </SplitPanel>
            }
            contentType="table"
            content={
                      <div style={{"padding" : "1em"}}>
                          <Flashbar items={versionMessage} />
                          <Container
                            header={
                                      <Header
                                        variant="h2"
                                        description='Summary of performance metrics for all DynamoDB tables.'
                                      >
                                        DynamoDB peformance metrics
                                      </Header>
                                    }
                          >
                              <table style={{"width":"100%"}}>
                                  <tr>  
                                      <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}} rowspan="2">  
                                          <ChartPie01 
                                                  title={"Performance Analysis"} 
                                                  height="300px" 
                                                  width="100%" 
                                                  series = {[globalMetrics['ConsumedWriteCapacityUnits']?.['value'],globalMetrics['ConsumedReadCapacityUnits']?.['value']]}
                                                  labels = {["WriteCapacityUnits/sec","ReadCapacityUnits/sec"]}
                                                  onClickEvent={() => {}}
                                          />
                                          <br />
                                          <br />
                                          <CompMetric01 
                                                  value={ (globalMetrics['ConsumedWriteCapacityUnits']?.['value'] + globalMetrics['ConsumedReadCapacityUnits']?.['value'] ) || 0 }
                                                  title={"TotalCapacityUnits/sec"}
                                                  precision={2}
                                                  format={4}
                                                  fontColorValue={configuration.colors.fonts.metric100}
                                                  fontSizeValue={"24px"}
                                          />
                                      </td>    
                                      <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}}>  
                                          <ChartLine04 series={JSON.stringify([
                                                                    { name : "WriteCapacityUnits/sec", data : globalMetrics['ConsumedWriteCapacityUnits']?.['history'] },
                                                                    { name : "ReadCapacityUnits/sec", data : globalMetrics['ConsumedReadCapacityUnits']?.['history'] }
                                                                ])}
                                                            title={"ConsumedCapacityUnits/sec"} height="250px" 
                                            />
                                            <br />
                                            <br />
                                            <table style={{"width":"100%"}}>
                                                <tr>
                                                    <td valign="middle" style={{"width":"50%", "padding-left": "1em", "text-align": "center"}}>
                                                          <CompMetric01 
                                                                  value={ (globalMetrics['ConsumedWriteCapacityUnits']?.['value'] ) || 0 }
                                                                  title={"WriteCapacityUnits/sec"}
                                                                  precision={2}
                                                                  format={4}
                                                                  fontColorValue={configuration.colors.fonts.metric100}
                                                                  fontSizeValue={"24px"}
                                                          />
                                                    </td>
                                                    <td valign="middle" style={{"width":"50%", "padding-left": "1em", "text-align": "center"}}>  
                                                          <CompMetric01 
                                                                  value={ (globalMetrics['ConsumedReadCapacityUnits']?.['value'] ) || 0 }
                                                                  title={"ReadCapacityUnits/sec"}
                                                                  precision={2}
                                                                  format={4}
                                                                  fontColorValue={configuration.colors.fonts.metric100}
                                                                  fontSizeValue={"24px"}
                                                          />
                                                    </td>
                                                </tr>
                                            </table>
                                      </td>
                                      <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}}>  
                                          <ChartLine04 series={JSON.stringify([
                                                                    { name : "WriteThrottledRequests", data : globalMetrics['WriteThrottledRequests']?.['history'] },
                                                                    { name : "ReadThrottledRequests", data : globalMetrics['ReadThrottledRequests']?.['history'] },
                                                                ])}
                                                            title={"ThrottledRequests/sec"} height="250px" 
                                            />
                                            <br />
                                            <br />
                                            <table style={{"width":"100%"}}>
                                                <tr>
                                                    <td valign="middle" style={{"width":"50%", "padding-left": "1em", "text-align": "center"}}>
                                                          <CompMetric01 
                                                                  value={ (globalMetrics['WriteThrottledRequests']?.['value'] ) || 0 }
                                                                  title={"WriteThrottledRequests/sec"}
                                                                  precision={2}
                                                                  format={4}
                                                                  fontColorValue={configuration.colors.fonts.metric100}
                                                                  fontSizeValue={"24px"}
                                                          />
                                                    </td>
                                                    <td valign="middle" style={{"width":"50%", "padding-left": "1em", "text-align": "center"}}>
                                                          <CompMetric01 
                                                                  value={ (globalMetrics['ReadThrottledRequests']?.['value'] ) || 0 }
                                                                  title={"ReadThrottledRequests/sec"}
                                                                  precision={2}
                                                                  format={4}
                                                                  fontColorValue={configuration.colors.fonts.metric100}
                                                                  fontSizeValue={"24px"}
                                                          />
                                                    </td>
                                                </tr>
                                            </table>
                                      </td>
                                      <td valign="middle" style={{"width":"25%", "padding-left": "1em", "text-align": "center"}}>  
                                          <ChartLine04 series={JSON.stringify([
                                                                    { name : "Maximum", data : globalMetrics['MaxSuccessfulRequestLatency']?.['history'] },
                                                                    { name : "Average", data : globalMetrics['AverageSuccessfulRequestLatency']?.['history'] },
                                                                ])}
                                                            title={"Latency(ms)"} height="250px" 
                                            />
                                            <br />
                                            <br />
                                            <table style={{"width":"100%"}}>
                                                <tr>
                                                    <td valign="middle" style={{"width":"50%", "padding-left": "1em", "text-align": "center"}}>
                                                          <CompMetric01 
                                                                  value={ (globalMetrics['MaxSuccessfulRequestLatency']?.['value'] ) || 0 }
                                                                  title={"LatencyMax(ms)"}
                                                                  precision={2}
                                                                  format={4}
                                                                  fontColorValue={configuration.colors.fonts.metric100}
                                                                  fontSizeValue={"24px"}
                                                          />
                                                    </td>
                                                    <td valign="middle" style={{"width":"50%", "padding-left": "1em", "text-align": "center"}}>
                                                          <CompMetric01 
                                                                  value={ (globalMetrics['AverageSuccessfulRequestLatency']?.['value'] ) || 0 }
                                                                  title={"LatencyAverage(ms)"}
                                                                  precision={2}
                                                                  format={4}
                                                                  fontColorValue={configuration.colors.fonts.metric100}
                                                                  fontSizeValue={"24px"}
                                                          />
                                                    </td>
                                                </tr>
                                            </table>
                                      </td>
                                  </tr>
                              </table>
                          </Container>
                          <br/>
                          <Table
                            {...collectionProps}
                            selectionType="single"
                            header={
                              <Header
                                variant="h2"
                                counter= {"(" + itemsTable.length + ")"} 
                                actions={
                                                  <SpaceBetween
                                                    direction="horizontal"
                                                    size="xs"
                                                  >
                                                    <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={handleClickLogin}>Connect</Button>
                                                    <Button variant="primary" onClick={() => { gatherTablesDetails(); }}>Refresh</Button>
                                                  </SpaceBetween>
                                          }
                              >
                                DynamoDB Tables
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
                
            }
          />
        
    </div>
  );
}

export default Login;
