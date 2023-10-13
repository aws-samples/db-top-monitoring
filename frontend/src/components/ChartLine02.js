import {memo} from 'react';
import Chart from 'react-apexcharts';

const ChartLine = memo(({series,history, height, width="100%", title, border=2 }) => {

    var options = {
              chart: {
                height: height,
                type: 'line',
                foreColor: '#9e9b9a',
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
                  size: 4,
                  radius: 0,
                  strokeWidth: 0.1,
                  fillOpacity: 1,
                  shape: "circle",
              },
              dataLabels: {
                enabled: false
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
                  fontSize:  '13px',
                  fontWeight:  'bold',
                  fontFamily:  undefined,
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
                                  fontSize: '11px',
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                             },
                 },
                 
              }
    };
    
    
    return (
            <div>
                <Chart options={options} series={JSON.parse(series)} type="line" width={width} height={height} />
            </div>
           );
});

export default ChartLine;
