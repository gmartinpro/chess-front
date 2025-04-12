import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ChessGame from './components/ChessGame';
import { Login } from './components/Login';
import { KeycloakProvider } from './contexts/KeycloakContext';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <KeycloakProvider>
      <BrowserRouter>
        <div className='min-h-screen bg-gray-100'>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route
              path='/'
              element={
                <PrivateRoute>
                  <ChessGame />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </KeycloakProvider>
  );
}

export default App;