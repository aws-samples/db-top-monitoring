import {useState,useEffect} from 'react'

import { SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';


//import ContentLayout from '@cloudscape-design/components/content-layout';

import CustomHeader from "../components/HeaderApp";
import AppLayout from "@awsui/components-react/app-layout";
import SideNavigation from '@awsui/components-react/side-navigation';
import ContentLayout from '@awsui/components-react/content-layout';
import { configuration } from './Configs';
import { applicationVersionUpdate } from '../components/Functions';

import Flashbar from "@awsui/components-react/flashbar";
import Button from "@awsui/components-react/button";
import Container from "@awsui/components-react/container";
import Header from "@awsui/components-react/header";
import Box from "@awsui/components-react/box";
import ColumnLayout from "@awsui/components-react/column-layout";
import Badge from "@awsui/components-react/badge";

import '@aws-amplify/ui-react/styles.css';

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


function Home() {
  
    //-- Application Version
    const [versionMessage, setVersionMessage] = useState([]);
    
    
    //-- Call API to App Version
    async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbtop", moduleId: "global"} );
        
        if (appVersionObject.release > configuration["apps-settings"]["release"] ){
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
   
   
    useEffect(() => {
        gatherVersion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
  return (
      
    <div style={{"background-color": "#f2f3f3"}}>
      <CustomHeader/>
      <AppLayout
          headerSelector="#h" 
          navigationOpen={true}
          breadCrumbs={breadCrumbs}
          navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/"} />}
          contentType="default"
          toolsHide={true}
          content={
              <>
              <Flashbar items={versionMessage} />
              
              <ContentLayout 
                    header = {
                            <Header variant="h2"
                                    description={
                                      <>
                                      <Header variant="h1">
                                              Welcome to {configuration["apps-settings"]["application-title"]} Solution
                                      </Header>
                                      <br/>
                                      <Box fontSize="heading-s">
                                          Gain Monitoring Insight and Take Action on AWS Database Resources.
                                      </Box>
                                      <br/>
                                      <Box fontSize="heading-s">
                                          View performance data for AWS Database instances and clusters, so you can quickly identify and act on any issues that might impact database resources.
                                      </Box>
                                      <br/>
                                      
                                       </>
                                      
                                    }
                              
                            >
                              
                            </Header>
                            
                          }
              >
            
              <div>
                    <ColumnLayout columns={2} >
                      
                      <div>
                          <Container
                                header = {
                                  <Header variant="h2">
                                    How it works?
                                  </Header>
                                  
                                }
                            >
                                  <div>
                                            <Badge>1</Badge> Connect to your AWS Database resorces.
                                            <br/>
                                            <br/>
                                            <Badge>2</Badge> Gather realtime performance database metrics from engine itself.
                                            <br/>
                                            <br/>
                                            <Badge>3</Badge> Extract performance from AWS Cloudwatch metrics and Enhanced Monitoring.
                                            <br/>
                                            <br/>
                                            <Badge>4</Badge> Consolidate all information into centralized dashboard.
                                  </div>
                        </Container>
                        
                    </div>
                    
                    <div>
                          <Container
                                header = {
                                  <Header variant="h2">
                                    Getting Started
                                  </Header>
                                  
                                }
                            >
                                  <div>
                                    <Box variant="p">
                                        Start connecting to your AWS RDS instances or Amazon Aurora, ElastiCache, MemoryDB, DocumentDB clusters.
                                    </Box>
                                    <br/>
                                    <Button variant="primary" href="/rds/instances/" >Get Started</Button>
                                    <br/>
                                    <br/>
                                  </div>
                        </Container>
                        
                    </div>
                    
                
                </ColumnLayout>
                <br/>
                <Container
                            header = {
                              <Header variant="h2">
                                Use cases
                              </Header>
                              
                            }
                        >
                               <ColumnLayout columns={1} variant="text-grid">
                                    <div>
                                      <Header variant="h3">
                                        Monitor instance performance
                                      </Header>
                                      <Box variant="p">
                                        Visualize performance data on realtime, and correlate data to understand and resolve the root cause of performance issues in your database resources.
                                      </Box>
                                    </div>
                                    <div>
                                      <Header variant="h3">
                                        Perform root cause analysis
                                      </Header>
                                      <Box variant="p">
                                        Analyze database and operating system metrics to speed up debugging and reduce overall mean time to resolution.
                                      </Box>
                                    </div>
                                    <div>
                                      <Header variant="h3">
                                        Optimize resources proactively
                                      </Header>
                                      <Box variant="p">
                                        Identify top consumer sessions, gather database statements and resource usages.
                                      </Box>
                                    </div>
                                    
                              </ColumnLayout>
      
                    </Container>
                    
                    
                </div>
                </ContentLayout>
                
                </>
              
          }
        />
        
    </div>
  );
}

export default Home;
