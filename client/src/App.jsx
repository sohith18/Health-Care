import './App.css';
import {Routes, Route} from 'react-router-dom';
import { Component } from 'react';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Video from './pages/meeting';
import JoinRoom from "./pages/join";
import axios from 'axios';
import {Toaster } from 'react-hot-toast'

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

class App extends Component {
    render(){
    return (
        <>
        <Navbar />
        <Toaster position='bottom-right' toastOptions={{duration:2000}}/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path= "/video-call-room" component ={JoinRoom} />
            <Route path= "/video/:id" component={Video} />

        </Routes>
        </>
    );
    }
}

export default App;