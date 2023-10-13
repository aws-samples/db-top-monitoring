import Chart from 'react-apexcharts';

function ChartBar({series,height, width="100%", title }) {

    var   data = [{
              data: series.data
            }];

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
                categories: series.categories,
                labels : {
                            formatter: function(val, index) {
                                        
                                        if(val === 0) return '0';
                                        if(val < 1000) return parseFloat(val).toFixed(0);
                                        
                                        var k = 1000,
                                        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
                                        i = Math.floor(Math.log(val) / Math.log(k));
                                        return parseFloat((val / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        
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
                <Chart options={options} series={data} type="bar" width={width} height={height} />
            </div>
           );
}

export default ChartBar;
