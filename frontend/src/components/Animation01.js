import {memo} from 'react';
import "../styles/css/animation.css";

const ChartAnimation = memo(({ speed="2s", rotate="0deg", width = "30px", height = "60px" }) => {
      
    const style = {
      "rotate": rotate,
      "width": width, 
      "height": height, 
      "border-radius": "5px",
      "display": "inline-block",
      "background": "linear-gradient(#fff 20%, #8ea9ff 60%, #fff 20%)",
      "background2": "linear-gradient(#f2f2f2 40%, #8ea9ff 30%, #f2f2f2 60%)",
      "background1": "linear-gradient(#8ea9ff 40%, #f2f2f2 30%, #f2f8ea9ff2f2 60%)",
      "background-size":"100% 200%",
      "background-repeat": "no-repeat",
      "animation": "placeholderAnimation " + speed +  " infinite linear",
    }; 
          
    return (
            <div>
                <div style={style}>
                </div>
            </div>
           );
});

export default ChartAnimation;
