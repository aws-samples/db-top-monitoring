import {memo} from 'react';
import Chart from 'react-apexcharts';


const ChartBar = memo(({series,history, height, width="100%", title, colors=[], border=2, timestamp, stacked=false }) => {

    var options = {
              chart: {
                height: height,
                type: 'bar',
                stacked : stacked,
                foreColor: '#2ea597',
                zoom: {
                  enabled: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                },
                dynamicAnimation :
                {
                    enabled: true,
                },
                 toolbar: {
                    show: false,
                 }

              },
              dataLabels: {
                enabled: false
              },
              colors : colors,
              stroke: {
                curve: 'smooth',
                width: 1
              },
              theme: {
                palette : "palette2"
              },
              markers: {
                size: 3,
                strokeWidth: 0,
                hover: {
                  size: 9
                }
              },
              plotOptions: {
                bar: {
                  borderRadius: 2,
                  
                }
              },
              tooltip: {
                    theme: "dark",
                    x : { 
                            format: 'HH:mm',
                    }
              },
              title: {
                text : title,
                align: "center",
                show: false,
                style: {
                  fontSize:  '14px',
                  fontWeight:  'bold',
                  fontFamily:  "Lato",
                  color : "#2ea597"
                }
                
              },
              grid: {
                show: false,
                yaxis: {
                    lines: {
                        show: false
                    }
                },
                xaxis: {
                            lines: {
                                show: false
                            }
                        }
              },
              xaxis: {
                type: 'datetime',
                labels: {
                    format: 'HH:mm',
                    style: {
                            fontSize: '11px',
                            fontFamily: 'Lato',
                    },
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
                                  fontSize: '11px',
                                  fontFamily: 'Lato',
                             },
                 },
                 
              }
    };
    
    
    return (
            <div>
                <Chart options={options} series={JSON.parse(series)} type="bar" width={width} height={height} />
            </div>
           );
});

export default ChartBar;
