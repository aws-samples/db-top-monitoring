import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate,useLocation } from "react-router-dom";

export default function Protected({ children }) {
  const { user } = useAuthenticator();
  const location = useLocation();
  
  if (!(user)) {
    return <Navigate to="/authentication" state={{ from: location }} replace />;
  }
  
  sessionStorage.setItem("x-token-cognito",user.signInUserSession.accessToken.jwtToken);
  
  return children;
}
