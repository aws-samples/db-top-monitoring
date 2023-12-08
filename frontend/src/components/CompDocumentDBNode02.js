import { useState, useRef, memo } from 'react'
import ChartLine02 from './ChartLine02';

import ChartProgressBar01 from './ChartProgressBar-01';
import Container from "@awsui/components-react/container";
import CompMetric01 from './Metric01';
import CompMetric04 from './Metric04';
import { configuration } from './../pages/Configs';
import Link from "@awsui/components-react/link";
import Header from "@awsui/components-react/header";

const ComponentObject = memo(({  nodeStats }) => {

    const [detailsVisible, setDetailsVisible] = useState(false);
    const detailsVisibleState = useRef(false);
 
    function onClickNode() {

        detailsVisibleState.current = (!(detailsVisibleState.current));
        setDetailsVisible(detailsVisibleState.current);
    }


    return (
        <>
            <tr>
                <td style={{"width":"10%", "text-align":"left", "border-top": "1pt solid " + configuration.colors.lines.separator100}} >  
                     N{nodeStats.nodeId+1} &nbsp;
                    - <Link  fontSize="body-s" onFollow={() => onClickNode()}>{nodeStats.shardId}</Link>
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                     <CompMetric04
                        value={ (nodeStats.OpsTotalCount ) || 0}
                        precision={0}
                        format={3}
                        height={"30px"}
                        width={"100px"}
                        history={20}
                        type={"line"}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                        chartColorLine={"#D69855"}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                     <CompMetric04
                        value={ (nodeStats.OpsInsertCount ) || 0}
                        precision={0}
                        format={3}
                        height={"30px"}
                        width={"100px"}
                        history={20}
                        type={"line"}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                        chartColorLine={"#D69855"}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                     <CompMetric04
                        value={ (nodeStats.OpsQueriesCount ) || 0}
                        precision={0}
                        format={3}
                        height={"30px"}
                        width={"100px"}
                        history={20}
                        type={"line"}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                        chartColorLine={"#D69855"}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                     <CompMetric04
                        value={ (nodeStats.OpsRemoveCount ) || 0}
                        precision={0}
                        format={3}
                        height={"30px"}
                        width={"100px"}
                        history={20}
                        type={"line"}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                        chartColorLine={"#D69855"}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                     <CompMetric04
                        value={ (nodeStats.OpsUpdateCount ) || 0}
                        precision={0}
                        format={3}
                        height={"30px"}
                        width={"100px"}
                        history={20}
                        type={"line"}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                        chartColorLine={"#D69855"}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                    <CompMetric01 
                        value={nodeStats.PrimaryInstanceCPUUtilization}
                        title={""}
                        precision={2}
                        format={1}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                    <CompMetric01 
                        value={nodeStats.ReplicaInstanceCPUUtilization}
                        title={""}
                        precision={2}
                        format={1}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                    <CompMetric01 
                        value={nodeStats.VolumeReadIOPs}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                    <CompMetric01 
                        value={nodeStats.VolumeWriteIOPs}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                    <CompMetric01 
                        value={ (nodeStats.ReadThroughput) }
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { nodeStats.role !== "-" &&
                    <CompMetric01 
                        value={ (nodeStats.WriteThroughput) }
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
            </tr>
            
            { (detailsVisible === true && nodeStats.role !== "-" )  &&
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
                                            value={ (nodeStats.OpsTotalCount ) || 0}
                                            title={"Operations/sec"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"24px"}
                                        />
                                </td>
                                <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={ (nodeStats.OpsInsertCount + nodeStats.OpsUpdateCount + nodeStats.OpsRemoveCount  ) || 0}
                                            title={"WriteOps/sec"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                        <br/>        
                                        <br/> 
                                        <CompMetric01 
                                            value={ ( nodeStats.OpsQueriesCount  ) || 0 }
                                            title={"ReadOps/sec"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                </td>
                                <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <ChartProgressBar01 
                                            value={ ( nodeStats.PrimaryInstanceCPUUtilization  ) || 0 }
                                            valueSufix={"%"}
                                            title={"CPU Primary"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                        <br />
                                        <br />
                                        <ChartProgressBar01 
                                            value={ ( nodeStats.ReplicaInstanceCPUUtilization  ) || 0 }
                                            valueSufix={"%"}
                                            title={"CPU Replica"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                     
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.PrimaryInstanceCPUUtilization,
                                                            nodeStats.history.ReplicaInstanceCPUUtilization
                                                        ])} 
                                                    title={"CPU Usage(%)"} height="200px" 
                                    />
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.VolumeReadIOPs,
                                                            nodeStats.history.VolumeWriteIOPs
                                                            
                                                        ])} 
                                                    title={"IOPS"} height="200px" 
                                    />
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.ReadThroughput,
                                                            nodeStats.history.WriteThroughput
                                                        ])} 
                                                    title={"I/O Throughput"} height="200px" 
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
                                        value={ nodeStats.OpsInsertCount  || 0}
                                        title={"opsInsert/sec"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsQueriesCount || 0}
                                        title={"opsSelect/sec"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsRemoveCount  || 0}
                                        title={"opsDelete/sec"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsUpdateCount || 0}
                                        title={"opsUpdate/sec"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsGetmoreCount || 0}
                                        title={"opsGetmore/sec"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsCommandsCount || 0}
                                        title={"opsCommand/sec"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.VolumeReadIOPs || 0}
                                        title={"VolumeReadIOPs"}
                                        precision={0}
                                        format={1}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.VolumeWriteIOPs || 0}
                                        title={"VolumeWriteIOPs"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                            </tr>
                        </table>
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                            <tr> 
                                <td style={{"width":"10%", "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsInsertLatency  || 0}
                                        title={"opsInsertLatency(us)"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsQueriesLatency || 0}
                                        title={"opsSelectLatency(us)"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsRemoveLatency  || 0}
                                        title={"opsDeleteLatency(us)"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsUpdateLatency || 0}
                                        title={"opsUpdateLatency(us)"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsGetmoreLatency || 0}
                                        title={"opsGetmoreLatency(us)"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.OpsCommandsLatency || 0}
                                        title={"opsCommandLatency(us)"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.WriteThroughput || 0}
                                        title={"WriteThroughput"}
                                        precision={0}
                                        format={2}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"10%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={nodeStats.ReadThroughput || 0}
                                        title={"ReadThroughput"}
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
                                <td style={{"width":"30%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.OpsTotalCount
                                                        ])} 
                                                    title={"Operations/sec"} height="200px" 
                                    />  
                                </td>
                                <td style={{"width":"35%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.OpsInsertCount,
                                                            nodeStats.history.OpsQueriesCount,
                                                            nodeStats.history.OpsRemoveCount,
                                                            nodeStats.history.OpsUpdateCount,
                                                            nodeStats.history.OpsGetmoreCount,
                                                            nodeStats.history.OpsCommandsCount
                                                        ])} 
                                                    title={"Operations/sec"} height="200px" 
                                    />  
                                </td>
                                <td style={{"width":"35%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.OpsInsertLatency,
                                                            nodeStats.history.OpsQueriesLatency,
                                                            nodeStats.history.OpsRemoveLatency,
                                                            nodeStats.history.OpsUpdateLatency,
                                                            nodeStats.history.OpsGetmoreLatency,
                                                            nodeStats.history.OpsCommandsLatency
                                                            
                                                        ])} 
                                                    title={"Latency(us)"} height="200px" 
                                    />
                                </td>
                              </tr>
                        </table>
                        </Container>
                        <br />
                        
                       

                </td>
            </tr>
            
            }
            
            </>
    )
});

export default ComponentObject;
