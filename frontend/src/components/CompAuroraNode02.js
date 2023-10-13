import { useState, useEffect, useRef, memo } from 'react'
import Axios from 'axios';
import ChartLine02 from './ChartLine02';
import ChartRadialBar01 from './ChartRadialBar01';

import { createLabelFunction } from '../components/Functions';
import CustomTable from "./Table01";

import Container from "@awsui/components-react/container";
import CompMetric01 from './Metric01';
import CompMetric04 from './Metric04';
import { configuration } from './../pages/Configs';
import Badge from "@awsui/components-react/badge";
import Link from "@awsui/components-react/link";
import Box from "@awsui/components-react/box";
import Table from "@awsui/components-react/table";
import Header from "@awsui/components-react/header";

const ComponentObject = memo(({  sessionId, clusterId, nodeStats }) => {

    const [detailsVisible, setDetailsVisible] = useState(false);
    const detailsVisibleState = useRef(false);
    const activeSessions = useRef([]);
    

    const columnsTable =  [
                  {id: 'PID',header: 'PID',cell: item => item['PID'],ariaLabel: createLabelFunction('PID'),sortingField: 'ThreadID',},
                  {id: 'Username',header: 'Username',cell: item => item['Username'],ariaLabel: createLabelFunction('Username'),sortingField: 'Username',},
                  {id: 'State',header: 'State',cell: item => item['State'] ,ariaLabel: createLabelFunction('State'),sortingField: 'State',},
                  {id: 'Host',header: 'Host',cell: item => item['Host'],ariaLabel: createLabelFunction('Host'),sortingField: 'Host',},
                  {id: 'WaitEvent',header: 'WaitEvent',cell: item => item['WaitEvent'] ,ariaLabel: createLabelFunction('WaitEvent'),sortingField: 'WaitEvent',},
                  {id: 'Database',header: 'Database',cell: item => item['Database'],ariaLabel: createLabelFunction('Database'),sortingField: 'Database',},
                  {id: 'ElapsedTime',header: 'ElapsedTime',cell: item => item['ElapsedTime'],ariaLabel: createLabelFunction('ElapsedTime'),sortingField: 'ElapsedTime',},
                  {id: 'AppName',header: 'AppName',cell: item => item['AppName'],ariaLabel: createLabelFunction('AppName'),sortingField: 'AppName',},
                  {id: 'SQLText',header: 'SQLText',cell: item => item['SQLText'],ariaLabel: createLabelFunction('SQLText'),sortingField: 'SQLText',}
    ];
    
    const visibleContent = ['PID', 'Username', 'State', 'Host', 'WaitEvent', 'Database', 'ElapsedTime', 'AppName', 'SQLText' ];
    
    //-- Function Gather Active Sessions
    async function fetchSessions() {
        //--- API Call Gather Sessions
        if (detailsVisibleState.current == true) {
            
            
            
                //--- API Call Gather Sessions
                var api_params = {
                              connectionId: sessionId,
                              clusterId : clusterId,
                              instanceId : nodeStats.name,
                              sql_statement: `
                                                select pid as "PID",usename as "Username",state as "State",wait_event as "WaitEvent",datname as "Database",CAST(CURRENT_TIMESTAMP-query_start AS VARCHAR)  as "ElapsedTime",application_name as "AppName",client_addr as "Host",query as "SQLText" from pg_stat_activity where pid <> pg_backend_pid() and state = \'active\' order by query_start asc limit 250;
                                             `
                              };
                
                      Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aurora/postgresql/cluster/sql/`,{
                      params: api_params
                      }).then((data)=>{
                        
                          activeSessions.current = data.data.rows;
                          
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/aurora/postgresql/cluster/sql/' );
                          console.log(err)
                      });
              
                
            
        }
        else {
                activeSessions.current = [];
        }
    
    }
    
   
    function onClickNode() {

        detailsVisibleState.current = (!(detailsVisibleState.current));
        setDetailsVisible(detailsVisibleState.current);

    }


    useEffect(() => {
        const id = setInterval(fetchSessions, configuration["apps-settings"]["refresh-interval-aurora-pgs-sessions"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

    return (
        <>
            <tr>
                <td style={{"width":"9%", "text-align":"left", "border-top": "1pt solid " + configuration.colors.lines.separator100}} >  
                    { nodeStats.role === "P" &&
                        <Badge color="blue"> P </Badge>
                    }
                    { nodeStats.role === "R" &&
                        <Badge color="red"> R </Badge>
                    }
                    &nbsp;
                    <Link  fontSize="body-s" onFollow={() => onClickNode()}>{nodeStats.name}</Link>
                </td>
                <td style={{"width":"6%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                   {nodeStats.status}
                </td>
                <td style={{"width":"6%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                   {nodeStats.size}
                </td>
                <td style={{"width":"6%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                   {nodeStats.az}
                </td>
                <td style={{"width":"6%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                   <Badge color="red">{nodeStats.monitoring}</Badge>
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                     <CompMetric04
                        value={nodeStats.xactTotal || 0}
                        precision={0}
                        format={1}
                        height={"30px"}
                        width={"100px"}
                        history={20}
                        type={"line"}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                        chartColorLine={"#D69855"}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={nodeStats.numbackends  || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={(nodeStats.tupInserted + nodeStats.tupDeleted + nodeStats.tupUpdated  + nodeStats.tupFetched )   || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={nodeStats.cpu  || 0}
                        title={""}
                        precision={2}
                        format={1}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={nodeStats.memory  || 0}
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={(nodeStats.ioreads + nodeStats.iowrites)  || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={ (nodeStats.netin + nodeStats.netout)  || 0 }
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
            </tr>
            
            { detailsVisible === true &&
            <tr>
                <td></td>
                <td colspan="11" style={{"width":"10%", "padding-left": "1em"}}>
                        <Container
                                      header={
                                              <Header
                                                variant="h2"
                                              >
                                              </Header>
                                          }
                        >
                        <table style={{"width":"100%"}}>
                            <tr>  
                                <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.xactTotal  || 0 }
                                            title={"Transactions/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"24px"}
                                        />
                                </td>
                                 <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={(nodeStats.tupInserted + nodeStats.tupDeleted + nodeStats.tupUpdated)   || 0}
                                            title={"WriteTuples/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                        <br/>        
                                        <br/> 
                                        <CompMetric01 
                                            value={nodeStats.tupFetched || 0}
                                            title={"ReadTuples/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                </td>
                                <td style={{"width":"14%", "padding-left": "1em"}}>  
                                        <ChartRadialBar01 series={JSON.stringify([Math.round(nodeStats.cpu || 0)])} 
                                                 height="180px" 
                                                 title={"CPU (%)"}
                                        />
                                     
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.cpu
                                                            
                                                        ])} 
                                                        title={"CPU Usage (%)"} height="180px" 
                                    />
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.ioreads,
                                                            nodeStats.history.iowrites
                                                            
                                                        ])} 
                                                        title={"IOPS"} height="180px" 
                                    />
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.netin,
                                                            nodeStats.history.netout,
                                                        ])} 
                                                        title={"NetworkTraffic"} height="180px" 
                                    />  
                                </td>
                            </tr>
                        </table> 
                        <br />
                        <br />
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                                <tr> 
                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.numbackends  || 0 }
                                            title={"Sessions"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.tupReturned  || 0}
                                            title={"tupReturned/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.tupFetched || 0}
                                            title={"tupFetched/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.tupInserted || 0}
                                            title={"tupInserted/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.tupDeleted || 0}
                                            title={"tupDeleted/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.tupUpdated || 0}
                                            title={"tupUpdated/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.ioreads  || 0}
                                            title={"IO Reads/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.iowrites  || 0}
                                            title={"IO Writes/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.netin  || 0}
                                            title={"Network-In"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.netout  || 0}
                                            title={"Network-Out"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                </tr>
                        </table>  
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                              <tr>  
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.numbackends,
                                                            nodeStats.history.numbackendsActive
                                                        ])} 
                                                        title={"Sessions"} height="180px" 
                                    />  
                                </td>
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.xactCommit,
                                                            nodeStats.history.xactRollback,
                                                            
                                                        ])} 
                                                        title={"Transactions/sec"} height="180px" 
                                    />  
                                </td>
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.tupReturned,
                                                            nodeStats.history.tupFetched,
                                                            nodeStats.history.tupInserted,
                                                            nodeStats.history.tupDeleted,
                                                            nodeStats.history.tupUpdated,
                                                            
                                                        ])} 
                                                        title={"Tuples/sec"} height="180px" 
                                    />
                                </td>
                                
                              </tr>
                        </table>
                        </Container>
                        <br />
                        <Container
                            disableContentPaddings={true}
                        >
                        <table style={{"width":"100%"}}>
                            <tr>  
                                <td style={{"padding-left": "0em"}}>  

                                    <div style={{"overflow-y":"scroll", "overflow-y":"auto", "height": "450px"}}>  
                                        <CustomTable
                                                  columnsTable={columnsTable}
                                                  visibleContent={visibleContent}
                                                  dataset={activeSessions.current}
                                                  title={"Active Sessions"}
                                        />
                                     </div> 
                                </td>  
                            </tr>  
                        </table>  
                        </Container>
                          
                </td>
            </tr>
            
            }
            
            
            
            </>
    )
});

export default ComponentObject;
