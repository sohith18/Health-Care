import React from "react";
import './Styles/App.css';
import { createBrowserRouter, RouterProvider, useNavigate} from 'react-router-dom';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import JoinPage from './pages/Join';
import VideoCall from "./pages/meeting"
import NotFound from './pages/ErrPage/NotFound';
import ServerError from './pages/ErrPage/ServerError';
import RootLayout from './RootLayout';
import ProfileChange from './components/ProfileChange';
import TranslationContextProvider from './store/TranslationContext';
import DoctorSearch from './components/DoctorSearch';
import DoctorDetails from './components/DoctorDetails';
import DoctorHome from './components/DoctorHome';
import DoctorProfileChange from './components/ProfileChangeDoctor';
import Appointments from './pages/Appointments';
import PrescriptionHist from './pages/PrescriptionHist';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './ProtectedRoute';
import Unauthorised from './pages/ErrPage/Unauthorised';


axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {   path: '/', 
                element: (
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <Home />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/prescription-history',
                element: (
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <PrescriptionHist />
                    </ProtectedRoute>
                ),
            },
            { path: '/login', element: <Login /> },
            { path: '/register', element: <Register /> },
            {
                path: "/video-call",
                element: (
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                    <JoinPage />
                    </ProtectedRoute>
                ),
            },
            {
                // old path kept for backward compatibility
                path: "/video-call/meeting",
                element: (
                    <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR"]}>
                    <VideoCall />
                    </ProtectedRoute>
                ),
            },
            {
                // new path with specialization + callId in URL
                path: "/video-call/meeting/:specialization/:callId",
                element: (
                    <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR"]}>
                    <VideoCall />
                    </ProtectedRoute>
                ),
            },

            { path: '/500', element: <ServerError /> },
            { path: '*', element: <NotFound /> },
            {
                path: '/profile-change',
                element: (
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <ProfileChange />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/doctor-search',
                element: (
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <DoctorSearch />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/doctor/:id',
                element: (
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <DoctorDetails />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/doctor-home',
                element: (
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                        <DoctorHome />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/profile-change-doctor',
                element: (
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                        <DoctorProfileChange />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/appointments',
                element: (
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                        <Appointments />
                    </ProtectedRoute>
                ),
            },
            {path:'/Unauthorised',element:<Unauthorised/>}
        ],
    },
]);

function App() {
    
    return (
        <TranslationContextProvider>
        <div className='App'>
            <ToastContainer/>
            <div className='Content'>
                <RouterProvider router={router}/>
            </div>
        </div>
        </TranslationContextProvider>
        
    );
}

export default App;