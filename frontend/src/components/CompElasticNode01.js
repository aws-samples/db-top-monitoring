import { useState, memo } from 'react'
import ChartLine02 from './ChartLine02';
import ChartProgressBar01 from './ChartProgressBar-01';
import ChartBar03 from '../components/ChartBar03';

import Container from "@awsui/components-react/container";
import CompMetric01 from './Metric01';
import CompMetric04 from './Metric04';
import { configuration } from '../pages/Configs';
import Badge from "@awsui/components-react/badge";
import Link from "@awsui/components-react/link";
import Header from "@awsui/components-react/header";


const ComponentObject = memo(({ node }) => {

    const [detailsVisible, setDetailsVisible] = useState(false);
    
    function onClickNode() {
        setDetailsVisible(!(detailsVisible));
    }


    return (
        <>
            <tr>
                <td style={{"width":"9%", "text-align":"left", "border-top": "1pt solid " + configuration.colors.lines.separator100}} >  
                    N{node.nodeId} &nbsp;
                    { node.role === "master" &&
                        <Badge color="blue"> P </Badge>
                    }
                    { node.role === "slave" &&
                        <Badge color="red"> R </Badge>
                    }
                    { node.role === "-" &&
                        <Badge>-</Badge>
                    }
                    &nbsp;
                    <Link  fontSize="body-s" onFollow={() => onClickNode()}>{node.name}</Link>
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric04
                        value={node.operations || 0}
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
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric04
                        value={node.getCalls || 0}
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
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric04
                        value={node.setCalls || 0}
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
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric01 
                        value={node.cacheHitRate || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric01 
                        value={node.getLatency || 0}
                        title={""}
                        precision={0}
                        format={1}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric01 
                       value={node.setLatency || 0}
                        title={""}
                        precision={0}
                        format={1}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric01 
                        value={node.connectedClients || 0}
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                    
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                     { node.role !== "-" &&
                     <CompMetric01 
                        value={node.cpu || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric01 
                        value={node.memory || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid " + configuration.colors.lines.separator100}}>
                    { node.role !== "-" &&
                    <CompMetric01 
                        value={node.network || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                    }
                </td>
            </tr>
            
            { (detailsVisible === true && node.role !== "-" ) &&
            <tr>
                <td></td>
                <td colspan="10">
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
                                            value={node.operations || 0}
                                            title={"Operations/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"18px"}
                                        />
                                </td>
                                <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.globalLatency || 0}
                                            title={"globalLatency(us)"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"18px"}
                                        />
                                </td>
                                <td style={{"width":"11%","padding-left": "0em", "padding-right": "1em"}}> 
                                    <ChartProgressBar01 
                                        value={  Math.round(node.cpu) || 0 }
                                        valueSufix={"%"}
                                        title={"CPU"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                    <br />
                                    <br />
                                    <ChartProgressBar01 
                                        value={  Math.round(node.memory) || 0 }
                                        valueSufix={"%"}
                                        title={"Memory"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"11%","padding-left": "1em"}}> 
                                    <ChartProgressBar01 
                                        value={  Math.round(node.network) || 0 }
                                        valueSufix={"%"}
                                        title={"Network"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                    <br />
                                    <br />
                                    <ChartProgressBar01 
                                        value={  Math.round(node.cacheHitRate) || 0 }
                                        valueSufix={"%"}
                                        title={"CacheHitRatio"}
                                        precision={0}
                                        format={3}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"35%","padding-left": "1em"}}> 
                                        <ChartBar03 series={JSON.stringify([
                                                                node.history.operations
                                                            ])} 
                                                            title={"Operations/sec"} height="180px" 
                                         />
                                </td>
                            </tr>
                        </table>
                        <br/>
                        <table style={{"width":"100%"}}>
                                <tr> 
                                    <td style={{"width":"12.5%",  "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.getCalls || 0}
                                            title={"getCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.setCalls || 0}
                                            title={"setCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                            value={node.cmdExec || 0}
                                            title={"execCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.cmdAuth || 0}
                                            title={"authCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.cmdInfo || 0}
                                            title={"infoCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.cmdScan || 0}
                                            title={"scanCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                            <CompMetric01 
                                            value={node.cmdXadd || 0}
                                            title={"xaddCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.cmdZadd || 0}
                                            title={"zaddCalls/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    
                                </tr>
                                
                        </table>  
                        <br />
                        <br />
                        <table style={{"width":"100%"}}>
                            <tr> 
                                <td style={{"width":"12.5%",  "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={node.keyspaceHits || 0}
                                        title={"Cache Hits/sec"}
                                        precision={0}
                                        format={1}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={node.keyspaceMisses || 0}
                                        title={"Cache Misses/sec"}
                                        precision={0}
                                        format={1}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.memoryTotal || 0}
                                            title={"MemoryTotal"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                </td>
                                <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                            value={node.memoryUsed || 0}
                                            title={"MemoryUsed"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                </td>
                                <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={node.netIn || 0}
                                        title={"NetworkIn"}
                                        precision={0}
                                        format={2}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={node.netOut || 0}
                                        title={"NetworkOut"}
                                        precision={0}
                                        format={2}
                                        fontColorValue={configuration.colors.fonts.metric100}
                                        fontSizeValue={"16px"}
                                    />
                                </td>
                                <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={node.connectionsTotal || 0}
                                            title={"Connections/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                </td>
                                <td style={{"width":"12.5%", "border-left": "2px solid " + configuration.colors.lines.separator100, "padding-left": "1em"}}>  
                                    <CompMetric01 
                                        value={node.connectedClients || 0}
                                        title={"CurConnections"}
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
                                
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.cpu,
                                                            ])} 
                                                            title={"CPU Usage(%)"} height="200px" 
                                         />
                                </td>
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.memory,
                                                            ])} 
                                                            title={"Memory Usage(%)"} height="200px" 
                                         />
                                </td>
                            </tr>
                        </table>
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                            <tr>
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.network,
                                                            ])} 
                                                            title={"Network Baseline Usage (%)"} height="200px" 
                                         />
                                </td>
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.netIn,
                                                                node.history.netOut,
                                                            ])} 
                                                            title={"Network Traffic (Bytes/sec)"} height="200px" 
                                         />
                                </td>
                               
                            </tr>
                        </table>
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                            <tr>
                                
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.getCalls,
                                                                node.history.setCalls,
                                                            ])} 
                                                            title={"Calls/sec"} height="200px" 
                                         />
                                </td>
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.getLatency,
                                                                node.history.setLatency,
                                                                node.history.globalLatency,
                                                            ])} 
                                                            title={"LatencyCalls(us)"} height="200px"
                                         />
                                </td>
                            </tr>
                        </table>
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                            <tr>
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.keyspaceHits,
                                                                node.history.keyspaceMisses,
                                                            ])} 
                                                            title={"Cache Efficiency"} height="200px" 
                                         />
                                </td>
                                <td style={{"width":"50%","padding-left": "1em"}}> 
                                        <ChartLine02 series={JSON.stringify([
                                                                node.history.connectedClients,
                                                            ])} 
                                                            title={"Connections"} height="200px"
                                         />
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
