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

import Alert from "@cloudscape-design/components/alert";
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
  
    //-- Auth Message
    const [messageVisible, setMessageVisible] = useState(false);
  
  
    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    
    //-- Variables Table
    const columnsTable = [
                  {id: 'identifier',header: 'DB identifier',cell: item => item.identifier,ariaLabel: createLabelFunction('DB identifier'),sortingField: 'identifier',},
                  {id: 'status',header: 'Status',cell: item => ( <> <StatusIndicator type={item.status === 'available' ? 'success' : 'pending'}> {item.status} </StatusIndicator> </> ),ariaLabel: createLabelFunction('Status'),sortingField: 'status',},
                  {id: 'size',header: 'Size',cell: item => item.size,ariaLabel: createLabelFunction('Size'),sortingField: 'size',},
                  {id: 'engine',header: 'Engine',cell: item => item.engine,ariaLabel: createLabelFunction('Engine'),sortingField: 'engine',},
                  {id: 'version',header: 'Engine Version',cell: item => item.version,ariaLabel: createLabelFunction('Engine Version"'),sortingField: 'version',},
                  {id: 'az',header: 'Region & AZ',cell: item => item.az,ariaLabel: createLabelFunction('Region & AZ'),sortingField: 'az',},
                  {id: 'multiaz',header: 'MultiAZ',cell: item => item.multiaz,ariaLabel: createLabelFunction('MultiAZ'),sortingField: 'multiaz',},
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
    
   
    const [preferences, setPreferences] = useState({ pageSize: 10, visibleContent: ['identifier', 'status', 'size', 'engine', 'version', 'az', 'multiaz' ] });
    
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
            
            // Select engine type
            var pathName = "";
            var engineType = ""
             switch (selectedItems[0]['engine']) {
                  case "mysql":
                  case "mariadb":
                  case "aurora-mysql":
                    pathName = "/sm-mysql-01";
                    engineType = "mysql";
                    break;
                    
                  case "postgres":
                    case "aurora-postgresql":
                    pathName = "/sm-postgresql-01";
                    engineType = "postgresql";
                    break;
                    
                  
                  case 'sqlserver-se':
                  case 'sqlserver-ee':
                  case 'sqlserver-ex':
                  case 'sqlserver-web':
                    pathName = "/sm-mssql-01";
                    engineType = "sqlserver";
                    break;
                  
                  case "oracle-ee":
                  case "oracle-ee-cdb":
                  case "oracle-se2":
                  case "oracle-se2-cdb":
                    pathName = "/sm-oracle-01";
                    engineType = "oracle";
                    break;
                  
                  
                  default:
                     break;
                    
                  
            }
               
            
            
            // Get Authentication
            Axios.post(`${configuration["apps-settings"]["api_url"]}/api/rds/instance/${engineType}/authentication/`,{
                params: { 
                          host: selectedItems[0]['endpoint'], 
                          port: selectedItems[0]['port'], 
                          username: txtUser, 
                          password: txtPassword, 
                          engineType: selectedItems[0]['engine'],
                          instanceId : selectedItems[0]['identifier'],
                          instance : selectedItems[0]['instance'],
                          resourceId : selectedItems[0]['resourceId'],
                  
                }
            }).then((data)=>{
                
                if (data.data.result === "auth1") {
                     sessionStorage.setItem(data.data.session_id, data.data.session_token );
                     var session_id = CryptoJS.AES.encrypt(JSON.stringify({
                                                                            session_id : data.data.session_id,
                                                                            rds_id : selectedItems[0]['identifier'],
                                                                            rds_user : txtUser, 
                                                                            rds_host : selectedItems[0]['endpoint'], 
                                                                            rds_engine : selectedItems[0]['engine'], 
                                                                            rds_class : selectedItems[0]['size'], 
                                                                            rds_az : selectedItems[0]['az'], 
                                                                            rds_version : selectedItems[0]['version'],
                                                                            rds_resource_id : selectedItems[0]['resourceId'],
                                                                            rds_storage : selectedItems[0]['storage'],
                                                                            rds_storage_size : selectedItems[0]['storageSize'],
                                                                            newObject : data.data.newObject,
                                                                            connectionId : data.data.connectionId,
                                                                            creationTime : data.data.creationTime,
                                                                            instanceId : selectedItems[0]['identifier'],
                                                                            instance : selectedItems[0]['intance'], 
                                                                            engineType : selectedItems[0]['engine'],
                                                                            }), 
                                                            data.data.session_id
                                                            ).toString();
                     
                     
                    setModalConnectVisible(false);
                    settxtUser('');
                    settxtPassword('');
                    window.open( pathName + '?' + createSearchParams({
                                session_id: session_id,
                                code_id: data.data.session_id
                                }).toString() ,'_blank');
                    
    
                }
                else {
                 
                    setMessageVisible(true);
                }
                  

            })
            .catch((err) => {
                
                console.log('Timeout API Call : /api/rds/instance/mysql/authentication/');
                console.log(err)
            });
            
            
    };
    
  
  //-- Call API to App Version
   async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbtop", moduleId: "rds"} );
        
        
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
        
            const { data } = await Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/rds/instance/region/list/`);
            sessionStorage.setItem("x-csrf-token", data.csrfToken );
            data.data.DBInstances.forEach(function(item) {
                          if (item['Engine']==='mysql' || item['Engine']==='postgres' || item['Engine']==='mariadb' || item['Engine']==='aurora-mysql' || item['Engine']==='aurora-postgresql' || item['Engine']==='sqlserver-se' || item['Engine']==='sqlserver-ee' || item['Engine']==='sqlserver-web' || item['Engine']==='sqlserver-ex' || item['Engine']==='oracle-ee'  || item['Engine']==='oracle-ee-cdb'  || item['Engine']==='oracle-se2'  || item['Engine']==='oracle-se2-cdb'){
                            
                            try{
                                  rdsItems.push({
                                                identifier: item['DBInstanceIdentifier'],
                                                engine: item['Engine'] ,
                                                version: item['EngineVersion'] ,
                                                az: item['AvailabilityZone'],
                                                size: item['DBInstanceClass'],
                                                status: item['DBInstanceStatus'],
                                                multiaz: String(item['MultiAZ']),
                                                pi: item['PerformanceInsightsEnabled'],
                                                resourceId: item['DbiResourceId'],
                                                storage: item['StorageType'],
                                                storageSize:  item['AllocatedStorage'],
                                                username: item['MasterUsername'], 
                                                endpoint: item['Endpoint']['Address'], 
                                                port: item['Endpoint']['Port'],
                                                instance : item['DBName']
                                                
                                  });
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/aws/rds/instance/region/list/');                  
                            }
                            
                          }
                          
            })
                                  
            
        }
        catch{
          console.log('Timeout API error : /api/aws/rds/instance/region/list/');                  
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
            navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/rds/instances/"} />}
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
                                                  <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} 
                                                  onClick={() => { 
                                                      setModalConnectVisible(true);
                                                      setMessageVisible(false);
                                                  }}
                                                  >
                                                    Connect
                                                  </Button>
                                              </SpaceBetween>
                                                
                                      }
                                      
                                    >
                                     {"Instance : " + selectedItems[0].identifier}
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
                                  <Box variant="awsui-key-label">DB Identifier</Box>
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
                                  <Box variant="awsui-key-label">Size</Box>
                                  {selectedItems[0]['size']}
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
                                  <Box variant="awsui-key-label">Storage Type</Box>
                                  {selectedItems[0]['storage']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Storage Size(GB)</Box>
                                  {selectedItems[0]['storageSize']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">MultiAZ</Box>
                                  {selectedItems[0]['multiaz']}
                              </div>
                              
                            </ColumnLayout>
                            
                            
                      </SplitPanel>
            }
            contentType="table"
            content={
                      <div style={{"padding" : "1em"}}>
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
                                                    <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true); setMessageVisible(false); }}>Connect</Button>
                                                    <Button variant="primary" onClick={() => {gatherInstances();}}>Refresh</Button>
                                                  </SpaceBetween>
                                          }
                              >
                                RDS Instances
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
                                onDismiss={() => { 
                                    setModalConnectVisible(false);
                                    setMessageVisible(false);     

                                }}
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
                                    <br/>
                                    <Alert
                                        statusIconAriaLabel="Error"
                                        type="error"
                                        visible={messageVisible}
                                      >
                                        Authentication process failed, review access credentials.
                                      </Alert>
                                    
                              </Modal>
                      </div>  
                
            }
          />
        
    </div>
  );
}

export default Login;

