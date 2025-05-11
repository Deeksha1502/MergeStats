import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home';
import Stats from './components/Stats';
import Navbar from './components/Navbar';


function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App