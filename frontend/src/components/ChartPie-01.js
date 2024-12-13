import {memo} from 'react';
import Chart from 'react-apexcharts';

const ChartComponent = memo(({ series, labels, title="", height="350px", width="100%" }) => {
      
          
            var options = {
              chart: {
                type: 'donut',
                foreColor: '#9e9b9a',
                zoom: {
                    enabled: true,
                },
              },
              labels: labels,
              stroke: {
                colors: ['#fff']
              },
              fill: {
                opacity: 0.8
              },
              theme: {
                monochrome: {
                  enabled: true
                }
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
              legend: {
                    show: true,
                    showForSingleSeries: true,
                    fontSize: '11px',
                    fontFamily: 'Lato',
                    position: 'bottom'
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }],
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
              },
              dataLabels: {
                formatter(val, opts) {
                  const name = opts.w.globals.labels[opts.seriesIndex]
                  return [name, val.toFixed(1) + '%']
                },
              },
            };
            
          
    return (
            <div>
                <Chart options={options} series={series} type="donut" height={height} width={width} />
            </div>
           );
});

export default ChartComponent;
