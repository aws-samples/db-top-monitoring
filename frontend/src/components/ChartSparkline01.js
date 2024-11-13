import {memo} from 'react';
import Chart from 'react-apexcharts';

const ChartLine = memo(({series,history, height="60px", width="100%", title, border=2, type="line" }) => {

    var options = {
      chart: {
        type: type,        
        sparkline: {
          enabled: true
        },
      },
      stroke: {
        curve: 'straight'
      },
      fill: {
        opacity: 0.3,
      },
      yaxis: {
        min: 0
      },      
    };
    
    
    return (
            <div>
                <Chart options={options} series={JSON.parse(series)} type={type} width={width} height={height} />
            </div>
           );
});

export default ChartLine;
