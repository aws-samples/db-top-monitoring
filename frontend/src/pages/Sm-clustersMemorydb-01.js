import {useState,useEffect,useRef} from 'react'
import { createSearchParams } from "react-router-dom";
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';
import { applicationVersionUpdate, getMatchesCountText, createLabelFunction, paginationLabels, pageSizePreference, collectionPreferencesProps, EmptyState } from '../components/Functions';

import { useCollection } from '@cloudscape-design/collection-hooks';
import {CollectionPreferences,Pagination } from '@awsui/components-react';
import TextFilter from "@awsui/components-react/text-filter";

import CustomHeader from "../components/HeaderApp";
import AppLayout from "@awsui/components-react/app-layout";
import SideNavigation from '@awsui/components-react/side-navigation';

import Flashbar from "@awsui/components-react/flashbar";
import { StatusIndicator } from '@awsui/components-react';
import Modal from "@awsui/components-react/modal";
import SpaceBetween from "@awsui/components-react/space-between";
import Button from "@awsui/components-react/button";
import FormField from "@awsui/components-react/form-field";
import Input from "@awsui/components-react/input";
import Table from "@awsui/components-react/table";
import Header from "@awsui/components-react/header";
import Box from "@awsui/components-react/box";
import ColumnLayout from "@awsui/components-react/column-layout";
import Tabs from "@awsui/components-react/tabs";
import Container from "@awsui/components-react/container";

import '@aws-amplify/ui-react/styles.css';

import { SplitPanel } from '@awsui/components-react';

import { applyMode,  Mode } from '@cloudscape-design/global-styles';

// Apply a color mode
//applyMode(Mode.Dark);
applyMode(Mode.Light);


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
    
    
    //-- Variable for Active Tabs
    const [activeTabId, setActiveTabId] = useState("modeIam");
    const currentTabId = useRef("modeIam");
    
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    
    //-- Variables Table
    const columnsTable = [
                  {id: 'identifier',header: 'Cluster identifier',cell: item => item.identifier,ariaLabel: createLabelFunction('Cluster identifier'),sortingField: 'identifier',},
                  {id: 'status',header: 'Status',cell: item => ( <> <StatusIndicator type={item.status === 'available' ? 'success' : 'error'}> {item.status} </StatusIndicator> </> ),ariaLabel: createLabelFunction('Status'),sortingField: 'status',},
                  {id: 'size',header: 'Size',cell: item => item.size,ariaLabel: createLabelFunction('Size'),sortingField: 'size',},
                  {id: 'engine',header: 'Engine',cell: item => item.engine,ariaLabel: createLabelFunction('Engine'),sortingField: 'engine',},
                  {id: 'version',header: 'Engine Version',cell: item => item.version,ariaLabel: createLabelFunction('Engine Version"'),sortingField: 'version',},
                  {id: 'shards',header: 'Shards',cell: item => item.shards,ariaLabel: createLabelFunction('Shards'),sortingField: 'shards',},
                  {id: 'nodes',header: 'Nodes',cell: item => item.nodes,ariaLabel: createLabelFunction('Nodes'),sortingField: 'nodes',},
                  {id: 'tier',header: 'Tier',cell: item => item.tier,ariaLabel: createLabelFunction('Tier'),sortingField: 'tier',},
                  {id: 'ssl',header: 'SSL',cell: item => item.ssl,ariaLabel: createLabelFunction('SSL'),sortingField: 'ssl',},
                  {id: 'acl',header: 'ACL',cell: item => item.acl,ariaLabel: createLabelFunction('ACL'),sortingField: 'acl',}
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
    
   
    const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['identifier', 'status', 'size', 'engine', 'version', 'shards', 'nodes', 'tier', 'ssl', 'acl' ] });
    
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

            // Get Authentication 
            Axios.post(`${configuration["apps-settings"]["api_url"]}/api/redis/connection/auth/`,{
                params: { 
                          cluster : selectedItems[0]['identifier'],
                          host: selectedItems[0]['endpoint'], 
                          port: selectedItems[0]['port'], 
                          username: txtUser, 
                          password: txtPassword, 
                          engine: selectedItems[0]['engine'],
                          auth : currentTabId.current,
                          ssl : selectedItems[0]['ssl']
                  
                }
            }).then((data)=>{
                
                if (data.data.result === "auth1") {
                     sessionStorage.setItem(data.data.session_id, data.data.session_token );
                     var userId;
                     switch(currentTabId.current){
                        case "modeIam":
                                        userId = "IAM Integrated";
                                        break;
                                        
                        case "modeOpen":
                                        userId = "Open-Access";
                                        break;
                        case "modeAcl":
                                        userId = txtUser;
                                        break;
                          
                     }
                     var session_id = CryptoJS.AES.encrypt(JSON.stringify({
                                                                            session_id : data.data.session_id,
                                                                            rds_id : selectedItems[0]['identifier'],
                                                                            rds_user : userId, 
                                                                            rds_password : txtPassword, 
                                                                            rds_host : selectedItems[0]['endpoint'], 
                                                                            rds_port : selectedItems[0]['port'], 
                                                                            rds_engine : selectedItems[0]['engine'],
                                                                            rds_auth : currentTabId.current,
                                                                            rds_ssl : selectedItems[0]['ssl'],
                                                                            rds_size : selectedItems[0]['size'],
                                                                            rds_shards : selectedItems[0]['shards'],
                                                                            rds_nodes : selectedItems[0]['nodes'],
                                                                            rds_tier : selectedItems[0]['tier'],
                                                                            rds_status : selectedItems[0]['status'],
                                                                            rds_version : selectedItems[0]['version'],
                                                                            rds_acl : selectedItems[0]['authmode'],
                                                                            }), 
                                                            data.data.session_id
                                                            ).toString();
                                                            
                                                                            
                     var path_name = "";
                     switch (selectedItems[0]['engine']) {
                         
                          case "memorydb:redis":
                            path_name = "/sm-memorydb-01";
                            break;
                          
                          default:
                             break;
                            
                          
                    }
                    
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
                
                console.log('Timeout API Call : /api/redis/connection/auth/');
                console.log(err)
            });
            
            
    };
    
    
    //-- Call API to App Version
   async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbtop", moduleId: "memorydb"} );
        
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
   async function gatherClusters (){
       
        //--- GATHER INSTANCES
        var rdsItems=[];
        
        try{
                   
           
            const { data } = await Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/region/memorydb/cluster/nodes/`);
            sessionStorage.setItem("x-csrf-token", data.csrfToken );
            
            data.Clusters.forEach(function(item) {
                            
                            var nodes = 0;                
                            item['Shards'].forEach(function(shards) {
                                nodes = nodes + shards['NumberOfNodes'];
                            });
                           
                            try{
                                  rdsItems.push({
                                                identifier : item['Name'],
                                                status : item['Status'] ,
                                                size : item['NodeType'] ,
                                                engine : "memorydb:redis" ,
                                                shards : item['NumberOfShards'],
                                                nodes: nodes,
                                                version: item['EnginePatchVersion'],
                                                endpoint: item['ClusterEndpoint']['Address'],
                                                port : item['ClusterEndpoint']['Port'],
                                                tier : item['DataTiering'],
                                                ssl : ( String(item['TLSEnabled']) == "true" ? "required" : "-" ),
                                                acl : item['ACLName'],
                                                authmode : ( String(item['ACLName']) == "open-access" ? "modeOpen" : "modeAcl" ) 
                                  });
                                  
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/aws/region/elasticache/cluster/nodes/');                  
                            }
                            
                   
                          
            })
                                  
            
        }
        catch{
          console.log('Timeout API error : /api/aws/region/elasticache/cluster/nodes/');                  
        }

        setItemsTable(rdsItems);
        if (rdsItems.length > 0 ) {
          setSelectedItems([rdsItems[0]]);
          setActiveTabId(rdsItems[0]['authmode']);
          currentTabId.current = rdsItems[0]['authmode'];
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
        gatherClusters();
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
            breadCrumbs={breadCrumbs}
            navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/clusters/memorydb/"} />}
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
                                     {"Instance : " + selectedItems[0].identifier}
                                    </Header>
                            
                          } 
                          i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                          onSplitPanelToggle={({ detail }) => {
                                        }
                                      }
                      >
                          
                                                
                    
                            <ColumnLayout columns="3" variant="text-grid">
                              <div>
                                  <Box variant="awsui-key-label">Cluster Identifier</Box>
                                  {selectedItems[0]['identifier']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Engine</Box>
                                  {selectedItems[0]['engine']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">DataTiering</Box>
                                  {selectedItems[0]['tier']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Total Shards</Box>
                                  {selectedItems[0]['shards']}
                              </div>
                               <div>
                                  <Box variant="awsui-key-label">Total Nodes</Box>
                                  {selectedItems[0]['nodes']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">ACLName</Box>
                                  {selectedItems[0]['acl']}
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
                                  <Box variant="awsui-key-label">Size</Box>
                                  {selectedItems[0]['size']}
                              </div>
                            
                            </ColumnLayout>
                            
                            
                      </SplitPanel>
            }
            contentType="table"
            content={
                <>
                      <Flashbar items={versionMessage} />
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
                                                <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true);}}>Connect</Button>
                                                <Button variant="primary" onClick={() => {gatherClusters();}}>Refresh</Button>
                                              </SpaceBetween>
                                      }
                          >
                            MemoryDB Clusters
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
                            setActiveTabId(detail.selectedItems[0]['authmode']);
                            currentTabId.current=detail.selectedItems[0]['authmode'];
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
                            
                                { activeTabId === "modeAcl" &&
                                <Tabs
                                    onChange={({ detail }) => {
                                          setActiveTabId(detail.activeTabId);
                                          currentTabId.current=detail.activeTabId;
                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                                {
                                                  label: "ACL Mode - Password Auth",
                                                  id: "modeAcl",
                                                  content: 
                                                          <>
                                                                
                                                                <FormField label="Username">
                                                                  <Input value={txtUser} onChange={event =>settxtUser(event.detail.value)}
                                                                />
                                                                </FormField>
                                                                
                                                                <FormField label="Password">
                                                                  <Input value={txtPassword} onChange={event =>settxtPassword(event.detail.value)} onKeyDown={handleKeyDowntxtLogin}
                                                                         type="password"
                                                                  />
                                                                </FormField>
                                                                
                                                          </>
                                                }
                                      ]}
                                />
                                
                                }
                                
                                
                                { activeTabId === "modeOpen" &&
                                <Tabs
                                    onChange={({ detail }) => {
                                          setActiveTabId(detail.activeTabId);
                                          currentTabId.current=detail.activeTabId;
                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                                
                                                {
                                                      label: "Open Access Mode",
                                                      id: "modeOpen",
                                                      content: 
                                                              <>
                                                                    
                                                                    With Open-Access mode you can authenticate a connection to MemoryDB for Redis, 
                                                                    when your cluster is configured to use open access.
                                                              
                                                                    
                                                              </>
                                                },
                                                
                                      ]}
                                />
                                
                                }
                                
                                
                          </Modal>
                                                      
                  
                </>
                
            }
          />
        
    </div>
  );
}

export default Login;
