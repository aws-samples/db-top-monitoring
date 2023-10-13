import {useState,useEffect,useRef} from 'react';
import Chart from 'react-apexcharts';

function ChartLine({series,history, height, width="100%", title, colors=[], border=2, timestamp}) {

    var options = {
              chart: {
                height: height,
                type: 'bar',
                foreColor: '#C6C2C1',
                zoom: {
                  enabled: false
                },
                animations: {
                    enabled: false,
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
              markers: {
                size: 3,
                strokeWidth: 0,
                hover: {
                  size: 9
                }
              },
              plotOptions: {
                bar: {
                  borderRadius: 10,
                  
                }
              },
              title: {
                text : title,
                align: "center",
                show: false,
                style: {
                  fontSize:  '13px',
                  fontWeight:  'bold',
                  fontFamily:  undefined,
                  color : "#C6C2C1"
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
              },
              xaxis: {
                labels: {
                          show: false,
                 },
                 axisBorder: {
                    show: false
                 },
                 axisTicks: {
                      show: true,
                      borderType: 'solid',
                      color: '#78909C',
                      height: 4,
                      offsetX: 0,
                      offsetY: 0
                 },
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
                                  fontSize: '11px',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                             },
                 },
                 
              }
    };
    
    
    return (
            <div>
                <Chart options={options} series={series} type="bar" width={width} height={height} />
            </div>
           );
}

export default ChartLine;
