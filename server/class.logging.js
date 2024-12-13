const fs = require('fs');

//--############# CLASS : classLogging                                                                                               
class classLogging {

        properties;
        constructor(object) { 
            this.properties = {...object};
        }
          
          
        //-- Write log to screen
        write(module,type,message) { 
            var timestamp = new Date();
            console.log({ time : timestamp.toTimeString().split(' ')[0],
                           type : type,
                           object : this.properties.name,
                           instance : this.properties.instance,
                           module : module,
                           message : message
                        });
        }

        //-- Debug, write to file
        debug(module,type,message) { 
            
            var content = "\n" + JSON.stringify({ time : (new Date()).toTimeString(), module : module, type : type, message : message }); 
            fs.appendFile('debug.log', content, (err) => {
                if (err) {
                    console.error('Error appending to file:', err);
                    return;
                }
            });
            
        }  

}


module.exports = {classLogging};