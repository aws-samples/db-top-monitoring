import { Navigate,useLocation } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';


const Protected = ({ children }) => {
    
    //-- Gather Parameters
    const [params]=useSearchParams();
    const parameter_code_id=params.get("code_id");  
    
    //-- Gather URL location 
    const location = useLocation();

    if (sessionStorage.getItem(parameter_code_id) === null ) {
        return <Navigate to={"/rds/instances/"} state={{ from: location }} replace />;
    }

    return children;
    
};

export default Protected;