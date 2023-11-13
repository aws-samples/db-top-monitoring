//--############# CLASS : classLogging                                                                                               
class classLogging {

        properties;
        constructor(object) { 
            this.properties = {...object};
        }
          
          
        //-- Open Connection
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
}


module.exports = {classLogging};