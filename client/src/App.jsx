import './Styles/App.css';
import {Routes, Route, createBrowserRouter, RouterProvider} from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';
import {Toaster } from 'react-hot-toast'
import Medicine from './pages/Medicines';
import 'bootstrap/dist/css/bootstrap.min.css';
import JoinRoom from './pages/join';
import VideoCall from "./pages/meeting"
import Doctors from './pages/Doctors';
import ColdDoctors from './pages/Specialized_doctors/ColdDoctors';
import DepressionDoctors from './pages/Specialized_doctors/DepressionDoctors';
import AllergyDoctors from './pages/Specialized_doctors/AllergyDoctors';
import SkinDoctors from './pages/Specialized_doctors/SkinDoctors';
import NotFound from './pages/ErrPage/NotFound';
import ServerError from './pages/ErrPage/ServerError';
import Chatbot from './pages/Chatbot';
import RootLayout from './RootLayout';
import { Children } from 'react';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

const router = createBrowserRouter([
    {   path: '/', element: <RootLayout />,
        children:[
            {path: '/', element: <Home />},
            {path: '/medicines', element: <Medicine />},
            {path: '/login', element: <Login />},
            {path: '/register', element: <Register />},
            {path: '/video-call', element: <JoinRoom />},
            {path: '/video-call/meeting/:id', element: <VideoCall />},
            {path: '/doctors', element: <Doctors />},
            {path: '/cough-doctors', element: <ColdDoctors />},
            {path: '/mental-health-doctors', element: <DepressionDoctors />},
            {path: '/allergy-doctors', element: <AllergyDoctors />},
            {path: '/skin-doctors', element: <SkinDoctors />},
            {path: '/500', element: <ServerError />},
            {path: '*', element: <NotFound />},
            {path: '/chatbot', element: <Chatbot />}
            
        ]
    },
])

function App () {
    return (
        <div className='App'>
            <Toaster position='bottom-right' toastOptions={{duration:2000}}/>
            <div className='Content'>
            {/* <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/medicines" element={<Medicine/>}/>
                <Route path="/login" element={<Login />} />
                <Route exact path="/video-call" element={<JoinRoom />} />
                <Route exact path="/video-call/meeting/:id" element={<VideoCall/>} />
                <Route path="/register" element={<Register />} />
                <Route path="/doctors" element={<Doctors/>}/>
                <Route path="/cough-doctors" element={<ColdDoctors/>}/>
                <Route path="/mental-health-doctors" element={<DepressionDoctors/>}/>
                <Route path="/allergy-doctors" element={<AllergyDoctors/>}/>
                <Route path="/skin-doctors" element={<SkinDoctors/>}/>
                <Route path="/500" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
                
            </Routes> */}
            <RouterProvider router={router}/>
            </div>
        </div>
        
    );
}

export default App;