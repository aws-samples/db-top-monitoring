import { render } from "react-dom";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

//-- Libraries
import '@cloudscape-design/global-styles/index.css';
import { Amplify } from "aws-amplify";
import { AmplifyProvider, Authenticator } from "@aws-amplify/ui-react";
import { StrictMode } from "react";
import Axios from "axios";

//-- Pages
import Authentication from "./pages/Authentication";
import Home from "./pages/Home";
import SmRdsInstances from "./pages/Sm-rdsInstances-01";
import SmClustersElasticache from "./pages/Sm-clustersElasticache-01";
import SmClustersMemoryDB from "./pages/Sm-clustersMemorydb-01";
import SmClustersAurora from "./pages/Sm-clustersAurora-01";
import SmClustersDocumentDB from "./pages/Sm-clustersDocumentDB-01";
import Logout from "./pages/Logout";
import SmMysql01 from "./pages/Sm-mysql-01";
import SmPostgresql01 from "./pages/Sm-postgresql-01";
import SmMssql01 from "./pages/Sm-mssql-01";
import SmOracle01 from "./pages/Sm-oracle-01";
import SmElasticache01 from "./pages/Sm-elasticache-01";
import SmMemoryDB01 from "./pages/Sm-memorydb-01";
import SmAuroraMysql01 from "./pages/Sm-aurora-mysql-01";
import SmAuroraPostgresql01 from "./pages/Sm-aurora-postgresql-01";
import SmDocumentDB01 from "./pages/Sm-documentdb-01";



//-- Components
import ProtectedDb from "./components/ProtectedDb";
import ProtectedApp from "./components/ProtectedApp";

import { applyMode,  Mode } from '@cloudscape-design/global-styles';

if (localStorage.getItem("themeMode") === null ){
    localStorage.setItem("themeMode", "light");
}

if (localStorage.getItem("themeMode") == "dark")
    applyMode(Mode.Dark);
else
    applyMode(Mode.Light);
    

Axios.get(`/aws-exports.json`,).then((data)=>{

    var configData = data.data;
    Amplify.configure({
                    Auth: {
                      region: configData.aws_region,
                      userPoolId: configData.aws_cognito_user_pool_id,
                      userPoolWebClientId: configData.aws_cognito_user_pool_web_client_id,
                    },
    });
                  
    const rootElement = document.getElementById("root");
    render(
      <StrictMode>
        <AmplifyProvider>
          <Authenticator.Provider>
              <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ProtectedApp><Home /> </ProtectedApp>} />
                    <Route path="/authentication" element={<Authentication />} />
                    <Route path="/rds/instances" element={<ProtectedApp><SmRdsInstances /> </ProtectedApp>} />
                    <Route path="/clusters/elasticache" element={<ProtectedApp><SmClustersElasticache /> </ProtectedApp>} />
                    <Route path="/clusters/memorydb" element={<ProtectedApp><SmClustersMemoryDB /> </ProtectedApp>} />
                    <Route path="/clusters/aurora" element={<ProtectedApp><SmClustersAurora /> </ProtectedApp>} />
                    <Route path="/clusters/documentdb" element={<ProtectedApp><SmClustersDocumentDB /> </ProtectedApp>} />
                    <Route path="/logout" element={<ProtectedApp><Logout /> </ProtectedApp>} />
                    <Route path="/sm-mysql-01" element={<ProtectedApp><ProtectedDb> <SmMysql01 /> </ProtectedDb> </ProtectedApp>}  />
                    <Route path="/sm-postgresql-01" element={<ProtectedApp><ProtectedDb> <SmPostgresql01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-mssql-01" element={<ProtectedApp><ProtectedDb> <SmMssql01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-oracle-01" element={<ProtectedApp><ProtectedDb> <SmOracle01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-elasticache-01" element={<ProtectedApp><ProtectedDb> <SmElasticache01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-memorydb-01" element={<ProtectedApp><ProtectedDb> <SmMemoryDB01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-aurora-mysql-01" element={<ProtectedApp><ProtectedDb> <SmAuroraMysql01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-aurora-postgresql-01" element={<ProtectedApp><ProtectedDb> <SmAuroraPostgresql01 /></ProtectedDb> </ProtectedApp>} />
                    <Route path="/sm-documentdb-01" element={<ProtectedApp><ProtectedDb> <SmDocumentDB01 /></ProtectedDb> </ProtectedApp>} />
                </Routes>
              </BrowserRouter>
          </Authenticator.Provider>
        </AmplifyProvider>
      </StrictMode>,
      rootElement
    );

})
.catch((err) => {
    console.log('API Call error : ./aws-exports.json' );
    console.log(err)
});
              
              

