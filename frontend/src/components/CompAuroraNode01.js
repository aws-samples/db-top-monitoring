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
    
    const visibleContent = ['ThreadID', 'State', 'Username', 'Host', 'Database', 'Command', 'ElapsedTime', 'SQLText' ];
    
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
                                                SELECT ID as 'ThreadID',USER as 'Username',HOST as 'Host',DB as 'Database',COMMAND as 'Command',SEC_TO_TIME(TIME) as 'Time',STATE as 'State',INFO as 'SQLText' FROM INFORMATION_SCHEMA.PROCESSLIST WHERE COMMAND <> 'Sleep' AND COMMAND <> 'Daemon' AND CONNECTION_ID()<> ID ORDER BY TIME DESC LIMIT 250
                                             `
                              };
                
                      Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aurora/mysql/cluster/sql/`,{
                      params: api_params
                      }).then((data)=>{
                        
                          activeSessions.current = data.data;
                          
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/aurora/mysql/cluster/sql/' );
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
                        value={nodeStats.questions || 0}
                        precision={0
                            
                        }
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
                        value={nodeStats.threads || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={nodeStats.threadsRunning || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={nodeStats.cpu || 0}
                        title={""}
                        precision={2}
                        format={1}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={nodeStats.memory || 0}
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={ (nodeStats.ioreads + nodeStats.iowrites) || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    <CompMetric01 
                        value={ (nodeStats.netin + nodeStats.netout) || 0}
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
                                            value={nodeStats.questions || 0}
                                            title={"Questions/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"24px"}
                                        />
                                </td>
                                 <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={(nodeStats.comInsert + nodeStats.comUpdate + nodeStats.comDelete)   || 0}
                                            title={"WriteOps/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                        <br/>        
                                        <br/> 
                                        <CompMetric01 
                                            value={nodeStats.comSelect || 0}
                                            title={"ReadOps/sec"}
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
                        <br />
                        <table style={{"width":"100%"}}>
                                <tr> 
                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={ (nodeStats.comCommit + nodeStats.comRollback ) || 0}
                                            title={"Transactions/sec"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "padding-left": "1em", "border-left": "2px solid " + configuration.colors.lines.separator100 }}>  
                                        <CompMetric01 
                                            value={nodeStats.threadsRunning || 0}
                                            title={"ThreadsRunning"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.comSelect  || 0}
                                            title={"ComSelect/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.comInsert || 0}
                                            title={"ComInsert/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.comUpdate || 0}
                                            title={"ComUpdate/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.comDelete || 0}
                                            title={"ComDelete/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.ioreads || 0}
                                            title={"IO Reads/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.iowrites || 0}
                                            title={"IO Writes/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.netin || 0}
                                            title={"Network-In"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.netout || 0}
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
                        <br />
                        <br />
                        <table style={{"width":"100%"}}>
                              <tr>  
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.threadsRunning,
                                                            nodeStats.history.threads
                                                        ])} 
                                                        title={"Threads"} height="180px" 
                                    />  
                                </td>
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.questions
                                                        ])} 
                                                        title={"Questions/sec"} height="180px" 
                                    />  
                                </td>
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.comSelect,
                                                            nodeStats.history.comDelete,
                                                            nodeStats.history.comInsert,
                                                            nodeStats.history.comUpdate,
                                                            
                                                        ])} 
                                                        title={"Operations/sec"} height="180px" 
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
