import {memo} from 'react';
import Chart from 'react-apexcharts';


const ChartBar = memo(({ series, p50, p90, p95, avg, max, height, width="100%", title, colors=[], border=2 }) => {

    var options = {
              chart: {
                height: height,
                type: 'bar',
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
              annotations: {
                yaxis: [
                    {
                      y: p90,
                      strokeDashArray: 20,
                      borderColor: 'red',
                      label: {
                        text: 'p90 : ' + CustomFormatNumberData(p90,2),
                        offsetX : 950,
                        offsetY : 9,
                        position : "left",
                        borderColor: 'red',
                        style: {
                          fontSize: '14px',
                          fontWeight:  'bold',
                          fontFamily: 'Lato',
                          color: 'white',
                          background: 'red',
                        },
                      }
                    },
                    {
                      y: p95,
                      strokeDashArray: 10,
                      borderColor: 'gray',
                      label: {
                        text: 'p95 : ' + CustomFormatNumberData(p95,2),
                        offsetX : 650,
                        offsetY : 9,
                        position : "left",
                        borderColor: 'gray',
                        style: {
                          fontSize: '14px',
                          fontWeight:  'bold',
                          fontFamily: 'Lato',
                          color: 'white',
                          background: 'gray',
                        },
                      }
                    },
                    {
                      y: avg,
                      strokeDashArray: 10,
                      borderColor: 'orange',
                      label: {
                        text: 'avg : ' + CustomFormatNumberData(avg,2),
                        offsetX : 300,
                        offsetY : 9,
                        position : "left",
                        borderColor: 'orange',
                        style: {
                          fontSize: '14px',
                          fontWeight:  'bold',
                          fontFamily: 'Lato',
                          color: 'white',
                          background: 'orange',
                        },
                      }
                    }
                ],
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
              tooltip: {
                    theme: "dark"
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
                labels: {
                          show: false,
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
                                  fontSize: '11px',
                                  fontFamily: 'Lato',
                             },
                 },
                 
              }
    };
    
    
    function CustomFormatNumberData(value,decimalLength) {
        if(value == 0) return '0';
        if(value < 1024) return parseFloat(value).toFixed(decimalLength);
        
        var k = 1024,
        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        i = Math.floor(Math.log(value) / Math.log(k));
        return parseFloat((value / Math.pow(k, i)).toFixed(decimalLength)) + ' ' + sizes[i];
    }
    
    return (
            <div>
                <Chart options={options} series={JSON.parse(series)} type="bar" width={width} height={height} />
            </div>
           );
});

export default ChartBar;
