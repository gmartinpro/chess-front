import { Navigate } from 'react-router-dom';
import useKeycloak from '../hooks/useKeycloak';

export const Login = () => {
  const { keycloak, authenticated, initialized } = useKeycloak();

  if (initialized && authenticated) {
    return <Navigate to='/' replace />;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-96'>
        <h2 className='text-2xl font-bold mb-6'>Chess Game Login</h2>
        <button onClick={() => keycloak?.login()} className='w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'>
          Login with Keycloak
        </button>
      </div>
    </div>
  );
};
