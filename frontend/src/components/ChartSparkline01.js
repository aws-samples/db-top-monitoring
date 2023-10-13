import {useState,useEffect,useRef} from 'react';
import Chart from 'react-apexcharts';

function ChartLine({ series, height, width, title, decimal = 2, fontSizeTitle = "11px", fontSizeValue = "22px", fontColorTitle = "#C6C2C1", fontColorValue = "orange" }) {
  
  
    
    var options = {
          chart: {
          type: 'radialBar',
          width: 50,
          height: 50,
          sparkline: {
            enabled: true
          },
          animations: {
                    enabled: false,
          },
        },
        dataLabels: {
          enabled: false
        },
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '50%'
            },
            track: {
              margin: 0
            },
            dataLabels: {
              show: false
            }
          }
        }
        };

    return (
            <div>
                <div style={{height:height, width:width}}>
                    <Chart options={options} series={series} type={"radialBar"} width={width} height={height} />
                </div>
                <div style={{"font-size": fontSizeValue, "font-weight": "500","font-family": "Orbitron", "color": fontColorValue}}>
                    { parseFloat(series[0] || 0).toLocaleString('en-US', {minimumFractionDigits: decimal, maximumFractionDigits: decimal}) }
                </div>
                <div style={{"font-size": fontSizeTitle, "color": fontColorTitle, "font-weight": "450","font-family": "Verdana" }}>
                    {title}
                </div>
            </div>
          
           );
}

export default ChartLine;
