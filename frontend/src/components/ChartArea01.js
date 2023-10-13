import {useState,useEffect} from 'react';
import Chart from 'react-apexcharts';

function ChartArea({series,serie,history, height, width="100%", title, colors=[]}) {

    const [chartData, setChartData] = useState(series);
    
    var options = {
              chart: {
                height: height,
                type: 'area',
                stacked: true,
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
              colors: colors,
              markers: {
                  size: 0,
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'straight',
                 width: 1,
              },
              fill: {
                type: 'gradient',
                gradient: {
                  opacityFrom: 0.6,
                  opacityTo: 0.8,
                }
              },
              title: {
                text : title,
                align: "center",
                show: false
              },
              grid: {
                show: false,
                yaxis: {
                    lines: {
                        show: false
                    }
                },   
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
                                  fontFamily: 'Helvetica, Arial, sans-serif',
                             },
                 },
                 
              }
    };
    
    // eslint-disable-next-line
    useEffect(() => {
      updateMetrics();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serie]);
    
    
    function updateMetrics(){
      
      var currentData = [];
      var iCursor=0;
      chartData.forEach(function(item) {
                item.data.push(serie[iCursor] || null);
                if (item.data.length > history ){
                    item.data = item.data.slice(item.data.length-history)
                }
                currentData.push({name : item.name, data : item.data});
                iCursor++;
      })
      setChartData(currentData);
  
    }
    

    return (
            <div>
                  <Chart options={options} series={chartData} type="area" width={width} height={height} />
            </div>
           );
}

export default ChartArea;
