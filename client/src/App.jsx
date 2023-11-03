import './App.css';
import {Routes, Route} from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';
import {Toaster } from 'react-hot-toast'
import Medicine from './pages/Medicines';
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoCall from './pages/VideoCall';
import Doctors from './pages/Doctors';
import ColdDoctors from './pages/ColdDoctors';
import DepressionDoctors from './pages/DepressionDoctors';
import AllergyDoctors from './pages/AllergyDoctors';
import SkinDoctors from './pages/SkinDoctors';

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
                <Route path="/cough-doctors" element={<ColdDoctors/>}/>
                <Route path="/mental-health-doctors" element={<DepressionDoctors/>}/>
                <Route path="/allergy-doctors" element={<AllergyDoctors/>}/>
                <Route path="/skin-doctors" element={<SkinDoctors/>}/>
                <Route path="/video-call/doctors" element={<Doctors/>}/>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
            </div>
        </div>
        
    );
}

export default App;