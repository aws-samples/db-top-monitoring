import {memo} from 'react';
import Chart from 'react-apexcharts';

const ChartLine = memo(({series, categories,history, height, width="100%", title, border=2, stacked=false }) => {
    
    var options = {
              chart: {
                height: height,
                type: 'area',
                foreColor: '#9e9b9a',                
                stacked : stacked,
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
                 },
                 dropShadow: {
                  enabled: false,
                  top: 2,
                  left: 2,
                  blur: 4,
                  opacity: 1,
                 }

              },
              markers: {
                  size: 5,
                  radius: 0,
                  strokeWidth: 2,
                  fillOpacity: 1,
                  shape: "circle",
              },
              dataLabels: {
                enabled: false
              },
              legend: {
                    show: true,
                    showForSingleSeries: true,
                    fontSize: '11px',
                    fontFamily: 'Lato',
              },
              theme: {
                palette : "palette2",
                monochrome: {
                  enabled: true
                }
              },
              stroke: {
                curve: 'straight',
                 width: border
              },
              title: {
                text : title,
                align: "center",
                show: false,
                style: {
                  fontSize:  '14px',
                  fontWeight:  'bold',
                  fontFamily: 'Lato',
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
              tooltip: {
                    theme: "dark",
                    x : { 
                            format: 'HH:mm',
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
                <Chart options={options} series={JSON.parse(series)} type="area" width={width} height={height} />
            </div>
           );
});

export default ChartLine;
