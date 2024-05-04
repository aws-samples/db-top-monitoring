const exec = require('child_process').exec;

//--#############
//--############# CLASS : classApplicationUpdate
//--#############


class classApplicationUpdate {

        logging = [];
        status = "non-started"
        scriptCommand = "sudo -u ec2-user sh /aws/apps/conf/update.sh"
        constructor(object) { 
            
        }
        
        //-- StartUpdate
        startUpdate(module,type,message) { 
            
            this.status = "started";
            this.logging = [];
            const objectShell = exec(this.scriptCommand);
            objectShell.stdout.on('data', (data)=>{
                    if (data !== "") {
                        this.logging.unshift({ timestamp : new Date().toLocaleString(), message : data });
                        this.status = "in-progress";
                    }
            });
            
            objectShell.stderr.on('data', (data)=>{
                    if (data !== "") {
                        this.logging.unshift({ timestamp : new Date().toLocaleString(), message : data });
                        this.status = "in-progress";
                    }
            });
            
            objectShell.on('close', (code) => {
              this.status = "completed";
            });
            
        }
        
        
        //-- Get Update Status
        getUpdateLog(){
            
            return this.logging;
            
        }
        
        
}

module.exports = { classApplicationUpdate };