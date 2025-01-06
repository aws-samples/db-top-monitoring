import {memo} from 'react';

const Metric = memo(({ value, title, precision, format=1, fontSizeTitle = "11px", fontSizeValue = "22px", fontColorTitle = "#2ea597", fontColorValue = "orange", postFix="" }) => {

    var counterValue = 0;
    
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
              
              case 4:
                counterValue = CustomFormatNumber(value,precision);
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
    
    
    function CustomFormatNumber(value,decimalLength) {
        if(value == 0) return '0';
        if(value < 1000) return parseFloat(value).toFixed(decimalLength);
        
        var k = 1000,
        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        i = Math.floor(Math.log(value) / Math.log(k));
        return parseFloat((value / Math.pow(k, i)).toFixed(decimalLength)) + ' ' + sizes[i];
    }
    
    return (
            <div>
                <span style={{"font-size": fontSizeValue, "font-weight": "900","font-family": "Lato" }}>
                    {counterValue}{postFix}
                </span>
                <br/>
                <span style={{"font-size": fontSizeTitle,"font-weight": "450","font-family": "Lato", "color": fontColorTitle }}>
                    {title}
                </span>
          
            </div>
           )
});

export default Metric

