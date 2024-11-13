import { memo } from 'react'
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import CompMetric01 from './Metric01';
import ChartLine02 from './ChartLine02';
import { configuration } from '../pages/Configs';


const ComponentObject = memo(({ node, onClickMetric = () => {} }) => {

    function onClickMetricLocal(item){
        onClickMetric(item);
    }

    return (
    
            <Container
                header={
                    <Header
                      variant="h2"                      
                    >
                      {node.codeType}-{node.subClusterId}-{node.subInstanceId}
                    </Header>
                  }
            >            

                <table style={{"width": "100%"}}>                  
                    <tr>
                        <td style={{"width": "25%", }}>    
                            
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'xactTotal', metricDescription : 'Transactions/sec', format : 3 })}>
                                <CompMetric01 
                                    value={node['metrics']?.['xactCommit'] || 0}
                                    title={"CommitThroughput"}
                                    precision={0}
                                    format={3}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"38px"}                            
                                />             
                            </a>                                                         
                        </td>
                        <td style={{"width": "75%", }}>                                                                                                
                            <ChartLine02 series={JSON.stringify([
                                    node['metrics']?.['history']?.['xactTotal']                            
                                ])} 
                                height="170px" 
                            />                                                               
                        </td>
                    </tr>
                </table>
                <table style={{"width": "100%"}}>
                    <tr>
                        <td style={{"width": "25%", }}>   
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'vcpu', metricDescription : 'vCPU', format : 3 })}>                                                                   
                                <CompMetric01 
                                    value={node['metrics']?.['vcpu'] || 0}
                                    title={"vCPU"}
                                    precision={0}
                                    format={3}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />   
                            </a>                                                                        
                        </td>
                        <td style={{"width": "25%", }}>                                                                      
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'totalIOPS', metricDescription : 'IOPS', format : 3 })}>
                                <CompMetric01 
                                    value={node['metrics']?.['totalIOPS'] || 0}
                                    title={"IOPS"}
                                    precision={3}
                                    format={3}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                /> 
                            </a>                                              
                        </td>
                        <td style={{"width": "25%", }}>                          
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'totalIOBytes', metricDescription : 'IOBytes/sec', format : 2 })}>                                            
                                <CompMetric01 
                                    value={node['metrics']?.['totalIOBytes'] || 0}
                                    title={"IOBytes/sec"}
                                    precision={0}
                                    format={2}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                /> 
                            </a>                                               
                        </td>
                        <td style={{"width": "25%", }}>                           
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'totalNetworkBytes', metricDescription : 'NetworkBytes/sec', format : 2 })}>                                           
                                <CompMetric01 
                                    value={node['metrics']?.['totalNetworkBytes'] || 0}
                                    title={"NetworkBytes/sec"}
                                    precision={0}
                                    format={2}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />   
                            </a>                                             
                        </td>                                              
                    </tr>                    
                    <tr>
                        <td style={{"width": "25%", }}>     
                            <br/>
                            <br/>
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'numbackends', metricDescription : 'Sessions', format : 3 })}>
                                <CompMetric01 
                                    value={node['metrics']?.['numbackends'] || 0}
                                    title={"Sessions"}
                                    precision={0}
                                    format={3}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                /> 
                            </a>                   
                        </td>
                        <td style={{"width": "25%", }}>                                                                      
                            <br/>
                            <br/>
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'tuples', metricDescription : 'Tuples/sec', format : 3 })}>
                                <CompMetric01 
                                    value={node['metrics']?.['tuples'] || 0}
                                    title={"TuplesTotal/sec"}
                                    precision={3}
                                    format={3}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />   
                            </a>                 
                        </td>                                    
                        <td style={{"width": "25%", }}>                                                                      
                            <br/>
                            <br/>
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'tuplesWritten', metricDescription : 'TuplesWritten/sec', format : 3 })}>
                                <CompMetric01 
                                    value={node['metrics']?.['tuplesWritten'] || 0}
                                    title={"TuplesWritten/sec"}
                                    precision={0}
                                    format={3}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />   
                            </a>                 
                        </td>
                        <td style={{"width": "25%", }}>                                                                      
                            <br/>
                            <br/>
                            <a href='#;' style={{ "text-decoration" : "none", "color": "inherit" }}  onClick={() => onClickMetricLocal({ nodeId : node.subClusterId, metricId : 'tuplesRead', metricDescription : 'TuplesRead/sec', format : 3 })}>
                                <CompMetric01 
                                    value={node['metrics']?.['tuplesRead'] || 0}
                                    title={"TuplesRead/sec"}
                                    precision={0}
                                    format={3}
                                    fontColorValue={configuration.colors.fonts.metric100}
                                    fontSizeValue={"18px"}
                                />     
                            </a>                                     
                        </td>                        
                    </tr>
                </table>
                </Container>            
    
    )
});

export default ComponentObject;
