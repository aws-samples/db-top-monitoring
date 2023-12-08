import {memo} from 'react';

const Metric = memo(({ value, valueSufix, title, precision, format=1, height="10px", fontSizeTitle = "11px", fontSizeValue = "22px", fontSizeValueSufix = "12px", fontColorTitle = "#2ea597", fontColorValue = "orange", chartColor="#8ea9ff" }) => {

    var counterValue = 0;
    if (value > 100){
      chartColor = "red";
    }
      
    
    try {
            switch (format) {
              case 1:
                counterValue = CustomFormatNumberRaw(value,precision);
                break;
                
              case 2:
                counterValue = CustomFormatNumberData(value,precision);
                break;
              
              case 3:
                counterValue = CustomFormatNumberRawInteger(value,0);
                break;
              
            }

      }
      catch{
        console.log('error');
    }
      
       
    
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
                <span style={{"font-size": fontSizeValue, "font-weight": "900","font-family": "Lato" }}>
                    {counterValue}
                </span>
                <span style={{"font-size": fontSizeValueSufix, "font-weight": "900","font-family": "Lato",  "color": fontColorTitle }}>
                    &nbsp;{valueSufix}
                </span>
                <br/>
                <div style={{ "height": height, "background-color": "#f2f2f2",  "border-radius": "5px", }}>
                        <div style={{ "height": height,"border-radius": "5px","background-color": chartColor, "width": ( value >= 100 ? "100%" : (String( (Math.trunc( parseFloat(value) ) || 0 ) ) + "%" ) )  }}></div>
                </div>
                <span style={{"font-size": fontSizeTitle,"font-weight": "450","font-family": "Lato", "color": fontColorTitle }}>
                    {title}
                </span>
            </div>
           )
});

export default Metric

