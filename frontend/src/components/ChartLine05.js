import {memo} from 'react';
import Chart from 'react-apexcharts';

const ChartLine = memo(({ series, p50, p90, p95, avg, max, height, width="100%", title, border=2 }) => {


    var options = {
              chart: {
                height: height,
                type: 'line',
                foreColor: '#9e9b9a',
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
              annotations: {
                yaxis: [
                    {
                      y: p90,
                      strokeDashArray: 20,
                      borderColor: 'red',
                      label: {
                        text: 'p90 : ' + CustomFormatNumberData(p90,2),
                        offsetX : 900,
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
                        offsetX : 600,
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
              markers: {
                  size: 4,
                  radius: 0,
                  strokeWidth: 0.1,
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
                <Chart options={options} series={JSON.parse(series)} type="line" width={width} height={height} />
            </div>
           );
});

export default ChartLine;



/*

annotations: {
                yaxis: [{
                  y: 8200,
                  borderColor: '#00E396',
                  label: {
                    borderColor: '#00E396',
                    style: {
                      color: '#fff',
                      background: '#00E396',
                    },
                    text: 'Support',
                  }
                }, {
                  y: 8600,
                  y2: 9000,
                  borderColor: '#000',
                  fillColor: '#FEB019',
                  opacity: 0.2,
                  label: {
                    borderColor: '#333',
                    style: {
                      fontSize: '10px',
                      color: '#333',
                      background: '#FEB019',
                    },
                    text: 'Y-axis range',
                  }
                }],
                xaxis: [{
                  x: new Date('23 Nov 2017').getTime(),
                  strokeDashArray: 0,
                  borderColor: '#775DD0',
                  label: {
                    borderColor: '#775DD0',
                    style: {
                      color: '#fff',
                      background: '#775DD0',
                    },
                    text: 'Anno Test',
                  }
                }, {
                  x: new Date('26 Nov 2017').getTime(),
                  x2: new Date('28 Nov 2017').getTime(),
                  fillColor: '#B3F7CA',
                  opacity: 0.4,
                  label: {
                    borderColor: '#B3F7CA',
                    style: {
                      fontSize: '10px',
                      color: '#fff',
                      background: '#00E396',
                    },
                    offsetY: -10,
                    text: 'X-axis range',
                  }
                }],
                points: [{
                  x: new Date('01 Dec 2017').getTime(),
                  y: 8607.55,
                  marker: {
                    size: 8,
                    fillColor: '#fff',
                    strokeColor: 'red',
                    radius: 2,
                    cssClass: 'apexcharts-custom-class'
                  },
                  label: {
                    borderColor: '#FF4560',
                    offsetY: 0,
                    style: {
                      color: '#fff',
                      background: '#FF4560',
                    },
              
                    text: 'Point Annotation',
                  }
                }, {
                  x: new Date('08 Dec 2017').getTime(),
                  y: 9340.85,
                  marker: {
                    size: 0
                  },
                  image: {
                    path: '../../assets/images/ico-instagram.png'
                  }
                }]
              },
              
              
*/
