import {memo} from 'react';
import Chart from 'react-apexcharts';


const ChartBar = memo(({series,history, height, width="100%", title, colors=[], border=2, timestamp, maximum=100 }) => {

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
                 max : maximum,
                 labels : {
                            formatter: function(val, index) {
                                        
                                        if(val === 0) return '0';
                                        if(val < 1000) return parseFloat(val).toFixed(0);
                                        
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
                 
              },
              annotations: {
                yaxis: [
                    {
                      y: maximum,
                      strokeDashArray: 10,
                      borderColor: 'gray'
                    },                    
                ],
              },
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
