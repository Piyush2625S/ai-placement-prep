import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Session   from './pages/Session'
import Resume    from './pages/Resume'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  const location = useLocation()

  return (
    <Routes>
      <Route path="/"          element={<Navigate to="/login" />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/signup"    element={<Signup />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard key={location.key} />
        </PrivateRoute>
      } />
      <Route path="/session"   element={<PrivateRoute><Session /></PrivateRoute>} />
      <Route path="/resume"    element={<PrivateRoute><Resume /></PrivateRoute>} />
    </Routes>
  )
}

export default App