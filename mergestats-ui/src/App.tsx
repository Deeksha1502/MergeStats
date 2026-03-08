import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home';
import Stats from './components/Stats';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/stats" element={<Stats />} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
