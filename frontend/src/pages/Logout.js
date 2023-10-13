import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();
  
  const { signOut } = useAuthenticator((context) => [context.user]);
  signOut();
  navigate('/');  

  return (
    <div>
    </div>
  );
};

export default App;
