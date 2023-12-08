import {useState,useEffect,useRef,memo} from 'react'
import Axios from 'axios'
import { configuration } from '../pages/Configs';
import Chart from 'react-apexcharts';
import Box from "@cloudscape-design/components/box";

const ChartCLW = memo(({title,subtitle,height,color,namespace,dimension_name,dimension_value,metric_name,stat_type,period,interval,metric_per_second,metric_precision,format, font_color_value="#4595dd", font_color_title = "#2ea597"}) => {
    
    const [chartData, setChartData] = useState({
                                                dataset : [],
                                                metric : 0,
                                                stats : {avg:"0",max:"0", min:"0" }
                                                });
    
    const timestampMetric = useRef("");
    
    var options = {
              chart: {
                height: height,
                type: 'line',
                foreColor: '#2ea597',
                zoom: {
                  enabled: false
                },
                animations: {
                    enabled: true,
                },
                dynamicAnimation :
                {
                    enabled: true,
                },
                 toolbar: {
                    show: false,
                 }

              },
              markers: {
                  size: 4,
                  strokeColors: '#29313e',
                  radius: 1,
                  strokeWidth: 0.2,
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'straight',
                width: 1,
              },
              grid: {
                show: false,
                yaxis: {
                    lines: {
                        show: false
                    }
                },   
              },
              tooltip: {
                    theme: "dark",
              },
              xaxis: {
                labels: {
                          show: false,
                 }
              },
              yaxis: {
                 tickAmount: 5,
                 axisTicks: {
                      show: true,
                 },
                 axisBorder: {
                      show: true,
                      color: '#78909C',
                      offsetX: 0,
                      offsetY: 0
                 },
                 min : 0,
                 labels : {
                            formatter: function(val, index) {
                                        
                                        if(val === 0) return '0';
                                        if(val < 1000) return parseFloat(val).toFixed(1);
                                        
                                        var k = 1000,
                                        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
                                        i = Math.floor(Math.log(val) / Math.log(k));
                                        return parseFloat((val / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        
                                        },    
                            style: {
                                  colors: ['#C6C2C1'],
                                  fontSize: '12px',
                                  fontFamily: 'Lato',
                             },
                 },
                 
              }
    };
    
    
    
    function fetchMetrics(){
        
            var d_end_time = new Date();
            var d_start_time = new Date(d_end_time - interval );
            var queryclw = {
                MetricDataQueries: [
                    {
                        Id: "m01",
                        MetricStat: {
                            Metric: {
                                Namespace: namespace,
                                MetricName: metric_name,
                                Dimensions: [{ Name: dimension_name,Value: dimension_value}]
                            },
                            Period: period,
                            Stat: stat_type
                        },
                        Label: title
                    }
                ],
                "StartTime": d_start_time,
                "EndTime": d_end_time
            };
              
            return Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/clw/region/query/`,{
             params: queryclw
            }).then((data)=>{
            
                    var currentData = [];
                    var average = 0;
                    var max = 0;
                    var min = 0;
                    var stats = {};
                    var metric = "";
              
                    if ( timestampMetric.current != data.data.MetricDataResults[0].Timestamps[0]) {
                            
                            data.data.MetricDataResults.forEach(function(item) {
                                   
                                    currentData.push({name : item.Label, data : item.Values.reverse()});
                                    average = item.Values.reduce((a, b) => ( a || 0 ) + ( b || 0 ) , 0) / item.Values.length;
                                    max = Math.max(...item.Values);
                                    min = Math.min(...item.Values);
                                    switch (format) {
                                                  case 1:
                                                        metric = (CustomFormatNumberRaw(item.Values[item.Values.length-1],metric_precision));
                                                        stats = ({
                                                                    avg : CustomFormatNumberRaw(average,metric_precision),
                                                                    max : CustomFormatNumberRaw(max,metric_precision),
                                                                    min : CustomFormatNumberRaw(min,metric_precision)
                                                                 });
                                                        break;
                                                    
                                                  case 2:
                                                        metric = (CustomFormatNumberData(item.Values[item.Values.length-1],metric_precision));
                                                        stats =  ({
                                                                    avg : CustomFormatNumberData(average,metric_precision),
                                                                    max : CustomFormatNumberData(max,metric_precision),
                                                                    min : CustomFormatNumberData(min,metric_precision)
                                                                  });
                                                    break;
                                                  
                                                  case 3:
                                                        metric = (CustomFormatNumberRawInteger(item.Values[item.Values.length-1],0));
                                                        stats =  ({
                                                                    avg : CustomFormatNumberRawInteger(average,0),
                                                                    max : CustomFormatNumberRawInteger(max,0),
                                                                    min : CustomFormatNumberRawInteger(min,0)
                                                                  });
                                                    break;
                                          
                                        }
                                        
                            
                            })
                    
                        timestampMetric.current = data.data.MetricDataResults[0].Timestamps[0];          
                        setChartData({
                                        dataset : currentData,
                                        metric : metric,
                                        stats : stats 
                        });
                        
                    }
                  
                
                    
                
                  
      });


    }
  

    function CustomFormatNumberData(value,decimalLength) {
        value = parseFloat(value);
        if(value == 0) return '0';
        if(value < 1024) return parseFloat(value).toFixed(decimalLength);
        
        var k = 1024,
        sizes = ['', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(value) / Math.log(k));
        return parseFloat((value / Math.pow(k, i)).toFixed(decimalLength)) + ' ' + sizes[i];
    }
    

    function CustomFormatNumberRaw(value,decimalLength) {
        value = parseFloat(value);
        if (value < 100 && decimalLength == 0 )
          decimalLength=2;
       
        if (value==0)
          decimalLength=0;
          
        return value.toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 

    }
    
    function CustomFormatNumberRawInteger(value,decimalLength) {
        value = parseFloat(value);
        return parseFloat(value).toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 
    }
    
    
    // eslint-disable-next-line
    useEffect(() => {
        fetchMetrics();
        const id = setInterval(fetchMetrics, configuration["apps-settings"]["refresh-interval-clw"]);
        return () => clearInterval(id);
    }, []);
    
    
    return (
                <div>
                    <table style={{"width":"100%"}}>
                        <tr>  
                           <td style={{"width":"30%", "text-align":"center"}}>  
                            <span style={{"font-size": "22px", "font-weight": "500","font-family": "Lato", "color": font_color_value }}>{chartData.metric}</span>
                            <br/>  
                            <span style={{"font-size": "10px", "font-weight": "500", "color" : font_color_title }}>{subtitle}</span>
                            <br/>  
                            <span style={{"font-size": "14px", "font-weight": "700", "color" : font_color_title}}>{title}</span>
                            <br/>
                            <br/>
                            <table style={{"width":"100%"}}>
                                <tr>
                                    <td>
                                        <span style={{"font-size": "14px", "font-weight": "500","font-family": "Lato","color": font_color_value }}>{chartData.stats.min}</span>
                                        <br/>
                                        <span style={{"font-size": "10px", "font-weight": "500", "color" : font_color_title }}>Min</span>
                                    </td>
                                    <td>
                                        <span style={{"font-size": "14px", "font-weight": "500","font-family": "Lato","color": font_color_value }}>{chartData.stats.max}</span>
                                        <br/>
                                        <span style={{"font-size": "10px", "font-weight": "500", "color" : font_color_title }}>Max</span>
                                    </td>
                                    <td>
                                        <span style={{"font-size": "14px", "font-weight": "500","font-family": "Lato","color": font_color_value }}>{chartData.stats.avg}</span>
                                        <br/>    
                                        <span style={{"font-size": "10px", "font-weight": "500", "color" : font_color_title }}>Avg</span>
                                    </td>
                                </tr>
                            </table>
                            
                           </td>
                           <td style={{"width":"70%", "text-align":"center", "padding-left": "2em"}}>    
                                    <div class="col-xl-9" style={{height:height}}>
                                        <Chart options={options} series={chartData.dataset} type="line" width={"100%"} height={height} />
                                    </div>
                           </td>
                        </tr>
                    </table>
                    <br/>
                    <br/>  
                    <br/>
                    <br/>  
                </div>
    )
});
export default ChartCLW;
