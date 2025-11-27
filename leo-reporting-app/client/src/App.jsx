import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectForm from './components/ProjectForm';
import FinancialForm from './components/FinancialForm';
import './index.css';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/project/new"
          element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/project/:id"
          element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial/new"
          element={
            <PrivateRoute>
              <FinancialForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial/:id"
          element={
            <PrivateRoute>
              <FinancialForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
