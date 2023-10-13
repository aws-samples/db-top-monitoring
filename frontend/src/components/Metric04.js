import {useState,useEffect,useRef} from 'react'
import Chart from 'react-apexcharts';

function Metric({ value, title, precision, format=1, history = 20, height, width = "100%",type = "bar", fontSizeTitle = "11px", fontSizeValue = "22px", fontColorTitle = "#C6C2C1", fontColorValue = "orange", chartColorLine = "#F6CE55" }) {

    const dataChart = useRef(Array(history).fill(null));
    const [dataset,setDataset] = useState({   
                                            value : 0, 
                                            chart : [{ data : Array(0).fill(null) }] 
    });
    
    var options = {
                    chart: {
                      type: 'bar',
                      sparkline: {
                        enabled: true
                      },
                      animations: {
                        enabled: false,
                      },
                    },
                    colors: [chartColorLine],
                    stroke: {
                        width: 2,
                    },
                    plotOptions: {
                      bar: {
                        columnWidth: '80%'
                      }
                    },
                    markers: {
                        size: 0,
                        strokeColors: '#29313e',
                    },
                    xaxis: {
                      crosshairs: {
                        width: 1
                      },
                    },
                    grid: {
                        padding: {
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0
                          }
                    },
                    tooltip: {
                      theme: "dark",
                      fixed: {
                        enabled: false
                      },
                      x: {
                        show: false
                      },
                      y: {
                        title: {
                          formatter: function (seriesName) {
                            return ''
                          }
                        }
                      },
                      marker: {
                        show: false
                      }
                    }
        };
        
    
    function updateMetrics(){
      try {
            
            dataChart.current.push(value);
            dataChart.current = dataChart.current.slice(dataChart.current.length-history);
            
            
            switch (format) {
              case 1:
                setDataset({ value : CustomFormatNumberRaw(value,precision), chart : [{ data : dataChart.current }] });
                break;
                
              case 2:
                setDataset({ value : CustomFormatNumberData(value,precision), chart : [{ data : dataChart.current }] });
                break;
              
              case 3:
                setDataset({ value : CustomFormatNumberRawInteger(value,0), chart : [{ data : dataChart.current }] });
                break;
              
            }

      }
      catch{
        console.log('error');
      }
      
       
    }
    
    // eslint-disable-next-line
    useEffect(() => {
      updateMetrics();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    
    
    
    function CustomFormatNumberData(value,decimalLength) {
        if(value == 0) return '0';
        if(value < 1024) return parseFloat(value).toFixed(decimalLength);
        
        var k = 1024,
        sizes = ['', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZT', 'YB'],
        i = Math.floor(Math.log(value) / Math.log(k));
        return parseFloat((value / Math.pow(k, i)).toFixed(decimalLength)) + ' ' + sizes[i];
    }
    
    
    function CustomFormatNumberRaw(value,decimalLength) {
        if (value < 100 && decimalLength == 0 )
          decimalLength=2;
       
        if (value==0)
          decimalLength=0;

        return value.toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 

    }
    
    function CustomFormatNumberRawInteger(value,decimalLength) {
        return value.toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 
    }
    
    return (
            <div>
     
                <table style={{"width":"100%"}}>
                    <tr>
                        <td style={{"text-align":"center", "padding-left": "1em"}}>
                              <div style={{"font-size": fontSizeValue, "font-weight": "500","font-family": "Orbitron",  }}>
                                  {dataset.value}
                              </div>
                              <div style={{"font-size": fontSizeTitle,"font-weight": "450","font-family": "Verdana",  }}>
                                  {title}
                              </div>      
                        </td>
                    </tr>
                </table>
                
                <table style={{"width":"100%"}}>
                    <tr>
                        <td style={{"justify-content": "center","display": "flex" }}>
                              <div style={{ "height":height, "width":width}}>
                                 <Chart options={options} series={dataset.chart} type={type} height={height} width={width} />
                              </div>  
                        </td>
                    </tr>
                </table>
                
                
                
                
          
            </div>
            
            
            
           )
}

export default Metric
