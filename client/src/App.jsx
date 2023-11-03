import './App.css';
import {Routes, Route} from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';
import {Toaster } from 'react-hot-toast'
import Medicine from './pages/Medicines';
import VideoCall from './pages/VideoCall';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App () {
    return (
        <div className='App'>
            <Navbar />
            <Toaster position='bottom-right' toastOptions={{duration:2000}}/>
            <div className='Content'>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/medicines" element={<Medicine/>}/>
                <Route path="/video-call" element={<VideoCall/>}/>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
            </div>
        </div>
        
    );
}

export default App;