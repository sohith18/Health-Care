import './App.css';
import {Routes, Route} from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VideoCall from './pages/VideoCall';
import axios from 'axios';
import {Toaster } from 'react-hot-toast'

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App () {
    return (
        <>
        <Navbar />
        <Toaster position='bottom-right' toastOptions={{duration:2000}}/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path= "/video-call" element ={<VideoCall />} />
        </Routes>
        </>
    );
}

export default App;