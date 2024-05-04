import { useState,useEffect } from 'react'
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu } from './Configs';

import { gatherLocalVersion } from '../components/Functions';
import { createLabelFunction } from '../components/Functions';

import SideNavigation from '@cloudscape-design/components/side-navigation';
import AppLayout from '@cloudscape-design/components/app-layout';

import Container from "@cloudscape-design/components/container";
import Spinner from "@cloudscape-design/components/spinner";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import CustomHeader from "../components/HeaderApp";
import CustomTable02 from "../components/Table02";

import Header from "@cloudscape-design/components/header";
import '@aws-amplify/ui-react/styles.css';


function Application() {
  
    //-- Application Version
    
    const [engineConenctions, setEngineConnections] = useState([]);
    const [selectedItems,setSelectedItems] = useState({ engineId : "", type : "" });
    
  
    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
    
    
    //-- Table Messages
    const columnsTable =  [
                  {id: 'connectionId', header: 'ConnectionId',cell: item => item['connectionId'],ariaLabel: createLabelFunction('connectionId'),sortingField: 'connectionId'},
                  {id: 'engineId', header: 'EngineId',cell: item => item['engineId'],ariaLabel: createLabelFunction('engineId'),sortingField: 'engineId'},
                  {id: 'type', header: 'Type',cell: item => item['type'],ariaLabel: createLabelFunction('type'),sortingField: 'type'},
                  {id: 'creationTime', header: 'CreationTime',cell: item => item['creationTime'],ariaLabel: createLabelFunction('creationTime'),sortingField: 'creationTime',}
    ];
    
    const visibleContent = ['connectionId','engineId','creationTime'];
    
   
   //-- Gather Connections
   async function gatherConnections (){
     
      try {
        
            var api_url = configuration["apps-settings"]["api_url"];
            var params = {};
            Axios.get(`${api_url}/api/aws/engines/connections/list`,{
                      params: params, 
                  }).then((data)=>{
                   console.log(data.data);
                   setEngineConnections(data.data.engineConnections);
                   
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aws/engines/connections/list' );
                  console.log(err);
              });
            
        }
        catch{
        
          console.log('Timeout API error : /api/aws/engines/connections/list');                  
          
        }
    
    }
    
    function onClickTerminate(){
      
        try {
            
            var api_url = configuration["apps-settings"]["api_url"];
            var params = { engineId : selectedItems['engineId'], type : selectedItems['type']  };
            Axios.get(`${api_url}/api/aws/engines/connections/terminate`,{
                      params: params, 
                  }).then((data)=>{
                        
                        gatherConnections();
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aws/engines/connections/terminate' );
                  console.log(err);
              });
            
        }
        catch{
        
          console.log('Timeout API error : /api/aws/engines/connections/terminate');                  
          
        }
            

    }
    
   
   
    useEffect(() => {
        gatherConnections();
        //const id = setInterval(gatherConnections, configuration["apps-settings"]["refresh-interval-update"]);
        //return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
  return (
    <div>
        <CustomHeader/>
        <AppLayout
            disableContentPaddings
            toolsHide
            navigation={<SideNavigation activeHref={"/connections/"} items={SideMainLayoutMenu} header={SideMainLayoutHeader} />}
            contentType="default"
            content={
                
                <div style={{"padding" : "2em"}}>
                    <Container>
                        <CustomTable02
                                columnsTable={columnsTable}
                                visibleContent={visibleContent}
                                dataset={engineConenctions}
                                title={"Engine Connections"}
                                description={""}
                                pageSize={20}
                                extendedTableProperties = {
                                    { variant : "borderless" }
                                    
                                }
                                tableActions = {
                                        <SpaceBetween
                                            direction="horizontal"
                                            size="xs"
                                          >
                                          <Button variant="primary" onClick={ onClickTerminate }>Terminate Connection</Button>
                                          <Button variant="primary" onClick={ gatherConnections }>Refresh</Button>
                                        </SpaceBetween>
                                }
                                onSelectionItem={( item ) => {
                                        setSelectedItems(item[0]);
                                    }
                                }
                        />
                    </Container>
                </div>
            }
            disableContentHeaderOverlap={true}
            headerSelector="#h" 
        />
                      
    </div>
  );
}

export default Application;

