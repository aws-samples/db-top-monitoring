import {memo} from 'react';
import Chart from 'react-apexcharts';

const ChartBar = memo(({ series, categories, height, width="100%", title }) => {

    console.log(series,categories);
    var options = {
              chart: {
                type: 'bar',
                height: height,
                foreColor: '#9e9b9a',
                zoom: {
                  enabled: false
                },
                animations: {
                    enabled: false,
                },
                labels: JSON.parse(categories),
                dynamicAnimation :
                {
                    enabled: true,
                },
                toolbar: {
                    show: false,
                 }
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  horizontal: true,
                }
              },
              xaxis: {
                categories: JSON.parse(categories),
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
                            },
                        }
              },
              tooltip: {
                    theme: "dark",
              },
              dataLabels: {
                enabled: true,
                style: {
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'Lato',
                },
                formatter: function(val, index) {
                                        
                                        if(val === 0) return '0';
                                        if(val < 1000) return parseFloat(val).toFixed(0);
                                        
                                        var k = 1000,
                                        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
                                        i = Math.floor(Math.log(val) / Math.log(k));
                                        return parseFloat((val / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        
                },
              },
            
    };
    
    
    return (
            <div>
                <Chart options={options} series={JSON.parse(series)} type="bar" width={width} height={height} />
            </div>
           );
});

export default ChartBar;
