import {useState,useEffect} from 'react'
import { createSearchParams } from "react-router-dom";
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';
import { applicationVersionUpdate, getMatchesCountText, createLabelFunction, paginationLabels, pageSizePreference, collectionPreferencesProps, EmptyState } from '../components/Functions';

import { useCollection } from '@cloudscape-design/collection-hooks';
import {CollectionPreferences,Pagination } from '@cloudscape-design/components';
import TextFilter from "@cloudscape-design/components/text-filter";


import CustomHeader from "../components/HeaderApp";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from '@cloudscape-design/components/side-navigation';

import Flashbar from "@cloudscape-design/components/flashbar";
import { StatusIndicator } from '@cloudscape-design/components';
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";

import '@aws-amplify/ui-react/styles.css';

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
    

    //-- Variables Table
    const columnsTable = [
                  {id: 'identifier',header: 'Cluster identifier',cell: item => item.identifier,ariaLabel: createLabelFunction('Cluster identifier'),sortingField: 'identifier',},
                  {id: 'role',header: 'Role',cell: item => item.role,ariaLabel: createLabelFunction('Role'),sortingField: 'role',},
                  {id: 'status',header: 'Status',cell: item => ( <> <StatusIndicator type={item.status === 'available' || item.status === 'ACTIVE' ? 'success' : 'pending'}> {item.status} </StatusIndicator> </> ),ariaLabel: createLabelFunction('Status'),sortingField: 'status',},
                  {id: 'nodes',header: 'Nodes',cell: item => item.nodes,ariaLabel: createLabelFunction('Nodes'),sortingField: 'nodes',},
                  {id: 'engine',header: 'Engine',cell: item => item.engine,ariaLabel: createLabelFunction('Engine'),sortingField: 'engine',},
                  {id: 'version',header: 'Engine Version',cell: item => item.version,ariaLabel: createLabelFunction('Engine Version"'),sortingField: 'version',},
                  {id: 'az',header: 'Region & AZ',cell: item => item.az,ariaLabel: createLabelFunction('Region & AZ'),sortingField: 'az',},
                  {id: 'multiaz',header: 'MultiAZ',cell: item => item.multiaz,ariaLabel: createLabelFunction('MultiAZ'),sortingField: 'multiaz',},
                  {id: 'storageMode',header: 'StorageEncrypted',cell: item => item.storageMode,ariaLabel: createLabelFunction('StorageEncrypted'),sortingField: 'storageMode',},
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
    
   
    const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['identifier', 'role', 'status', 'nodes', 'engine', 'version', 'az', 'multiaz', 'storageMode'] });
    
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
  
    //-- Variable for textbox components
    const [txtUser, settxtUser] = useState('');
    const [txtPassword, settxtPassword] = useState('');
  
    const [modalConnectVisible, setModalConnectVisible] = useState(false);

    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
    
    //-- Handle Click Events
    const handleClickLogin = () => {
            
            // Add CSRF Token
            Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");

            var apiUrl;
            if (selectedItems[0]['engine']=="docdb")
                apiUrl = "/api/documentdb/cluster/authentication/";
            else
                apiUrl = "/api/documentdb/elastic/cluster/authentication/";
                
            // Get Authentication
            Axios.post(`${configuration["apps-settings"]["api_url"]}${apiUrl}`,{
                params: { 
                          clusterId : selectedItems[0]['identifier'],
                          host: selectedItems[0]['endpoint'], 
                          port: selectedItems[0]['port'], 
                          username: txtUser, 
                          password: txtPassword, 
                          engine: selectedItems[0]['engine'],
                          instance : selectedItems[0]['instance'],
                          mode : "cluster",
                          engineType : "documentdb"
                  
                }
            }).then((data)=>{
                console.log(data.data);
                if (data.data.result === "auth1") {
                     sessionStorage.setItem(data.data.session_id, data.data.session_token );
                     var session_id = CryptoJS.AES.encrypt(JSON.stringify({
                                                                            session_id : data.data.session_id,
                                                                            rds_id : selectedItems[0]['identifier'],
                                                                            rds_user : txtUser, 
                                                                            rds_password : txtPassword, 
                                                                            rds_host : selectedItems[0]['endpoint'],
                                                                            rds_port : selectedItems[0]['port'],
                                                                            rds_engine : selectedItems[0]['engine'], 
                                                                            rds_class : selectedItems[0]['storageMode'], 
                                                                            rds_az : selectedItems[0]['az'], 
                                                                            rds_version : selectedItems[0]['version'],
                                                                            rds_resource_id : selectedItems[0]['resourceId'],
                                                                            rds_nodes : selectedItems[0]['nodes']
                                                                            }), 
                                                            data.data.session_id
                                                            ).toString();
                    var path_name;                           
                    if (selectedItems[0]['engine'] == "docdb")       
                        path_name = "/sm-documentdb-01";
                    else
                        path_name = "/sm-documentdb-02";
                     
                    console.log(path_name);
                    
                    setModalConnectVisible(false);
                    settxtUser('');
                    settxtPassword('');
                    window.open(path_name + '?' + createSearchParams({
                                session_id: session_id,
                                code_id: data.data.session_id
                                }).toString() ,'_blank');
                    
    
                }
                else {
                 

                }
                  

            })
            .catch((err) => {
                
                console.log('Timeout API Call : /api/documentdb/cluster/authentication/');
                console.log(err)
            });
            
            
    };
    
    
  //-- Call API to App Version
   async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbtop", moduleId: "documentdb"} );
        
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
   async function gatherInstances (){
  
        
        //--- GATHER INSTANCES
        var rdsItems=[];
        
        try{
        
            const { data } = await Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/docdb/cluster/region/list/`);
            sessionStorage.setItem("x-csrf-token", data.csrfToken );
            data.standard.DBClusters.forEach(function(item) {
                          if ( item['Engine']==='docdb' ){
                           
                            try{
                                  var nodes = [];
                                  item['DBClusterMembers'].forEach(function(node) {
                                      nodes.push(node['DBInstanceIdentifier']);
                                  });
                                  rdsItems.push({
                                                identifier: item['DBClusterIdentifier'],
                                                role: "Regional Cluster",
                                                engine: item['Engine'] ,
                                                version: item['EngineVersion'] ,
                                                az: String(item['AvailabilityZones']),
                                                nodes: item['DBClusterMembers'].length,
                                                nodeList : String(nodes),
                                                status: item['Status'],
                                                multiaz: String(item['MultiAZ']),
                                                storageMode: String(item['StorageEncrypted']),
                                                resourceId: item['DbClusterResourceId'],
                                                username: item['MasterUsername'], 
                                                endpoint: item['Endpoint'],
                                                endpointReader: item['ReaderEndpoint'], 
                                                port: item['Port']
                                  });
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/aws/docdb/cluster/region/list/');                  
                            }
                            
                          }
                          
            });
            
            
            data.elastic.clusters.forEach(function(item) {
                           
                            try{
                                  rdsItems.push({
                                                identifier: item['clusterName'],
                                                role: "Elastic Cluster",
                                                engine: "docdb-elastic",
                                                version: "-",
                                                az: "-",
                                                nodes: "-",
                                                nodeList : "-",
                                                status: item['status'],
                                                multiaz: "-",
                                                storageMode: "-",
                                                resourceId: item['clusterArn'],
                                                username: "-",
                                                endpoint: item['clusterName'] + "-" + data.elastic.endPoint,
                                                endpointReader: "-",
                                                port: "27017",
                                  });
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/aws/docdb/cluster/region/list/');                  
                            }
            });
                                  
            
        }
        catch{
          console.log('Timeout API error : /api/aws/aurora/cluster/region/list/');                  
        }
        
        setItemsTable(rdsItems);
        if (rdsItems.length > 0 ) {
          setSelectedItems([rdsItems[0]]);
          setsplitPanelShow(true);
        }

    }
    
    
    //-- Handle Object Events KeyDown
    const handleKeyDowntxtLogin= (event) => {
      if (event.detail.key === 'Enter') {
        handleClickLogin();
      }
    }
    
    
    
    
    
    //-- Init Function
      
    // eslint-disable-next-line
    useEffect(() => {
        gatherInstances();
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
            navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/clusters/documentdb/"} />}
            splitPanelOpen={splitPanelShow}
            onSplitPanelToggle={() => setsplitPanelShow(false)}
            splitPanelSize={350}
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
                                                <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true);}}>Connect</Button>
                                              </SpaceBetween>
                                      }
                                      
                                    >
                                     {"Cluster : " + selectedItems[0].identifier}
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
                                  <Box variant="awsui-key-label">Cluster Identifier</Box>
                                  {selectedItems[0]['identifier']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Engine</Box>
                                  {selectedItems[0]['engine']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Version</Box>
                                  {selectedItems[0]['version']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Region & AZ</Box>
                                  {selectedItems[0]['az']}
                              </div>
                            </ColumnLayout>
                            <br /> 
                            <br />
                            <ColumnLayout columns="4" variant="text-grid">
                              <div>
                                  <Box variant="awsui-key-label">Master User</Box>
                                  {selectedItems[0]['username']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Endpoint</Box>
                                  {selectedItems[0]['endpoint']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Port</Box>
                                  {selectedItems[0]['port']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Nodes</Box>
                                  {selectedItems[0]['nodes']}
                              </div>
                            
                            </ColumnLayout>
                            <br /> 
                            <br />
                            <ColumnLayout columns="4" variant="text-grid">
                              <div>
                                  <Box variant="awsui-key-label">ResourceID</Box>
                                  {selectedItems[0]['resourceId']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">StorageEncrypted</Box>
                                  {selectedItems[0]['storageMode']}
                              </div>
                              
                            </ColumnLayout>
                            
                            
                      </SplitPanel>
            }
            contentType="table"
            content={
                <>
                      <table style={{"width":"100%","padding" : "1em"}}>
                          <tr>  
                              <td style={{"width":"100%"}}>  
                                  <Flashbar items={versionMessage} />
                                  <Table
                                    {...collectionProps}
                                    selectionType="single"
                                    variant="borderless"
                                    header={
                                      <Header
                                        variant="h2"
                                        counter= {"(" + itemsTable.length + ")"} 
                                        actions={
                                                          <SpaceBetween
                                                            direction="horizontal"
                                                            size="xs"
                                                          >
                                                            <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true);}}>Connect</Button>
                                                            <Button variant="primary" onClick={() => {gatherInstances();}}>Refresh</Button>
                                                          </SpaceBetween>
                                                  }
                                      >
                                        DocumentDB Clusters
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
                                  
                                    <Modal
                                        onDismiss={() => setModalConnectVisible(false)}
                                        visible={modalConnectVisible}
                                        closeAriaLabel="Close modal"
                                        footer={
                                          <Box float="right">
                                            <SpaceBetween direction="horizontal" size="xs">
                                              <Button variant="primary" onClick={() => setModalConnectVisible(false)}>Cancel</Button>
                                              <Button variant="primary" onClick={handleClickLogin}>Connect</Button>
                                            </SpaceBetween>
                                          </Box>
                                        }
                                        header={
                                              <Header
                                                  variant="h3"
                                              >  
                                                     {"Instance : " + selectedItems[0].identifier }
                                              </Header> 
                                          
                                        }
                                      >
                                            <FormField
                                              label="Username"
                                            >
                                              <Input value={txtUser} onChange={event =>settxtUser(event.detail.value)}
                                              
                                              />
                                            </FormField>
                                            
                                            <FormField
                                              label="Password"
                                            >
                                              <Input value={txtPassword} onChange={event =>settxtPassword(event.detail.value)} onKeyDown={handleKeyDowntxtLogin}
                                                     type="password"
                                              />
                                            </FormField>
                                            
                                            
                                      </Modal>
                                  </td>
                              </tr>
                          </table>
                  
                </>
                
            }
          />
        
    </div>
  );
}

export default Login;
