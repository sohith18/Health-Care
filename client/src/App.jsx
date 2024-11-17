import './Styles/App.css';
import { createBrowserRouter, RouterProvider} from 'react-router-dom';
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
import NotFound from './pages/ErrPage/NotFound';
import ServerError from './pages/ErrPage/ServerError';
import Chatbot from './pages/Chatbot';
import RootLayout from './RootLayout';
import ProfileChange from './components/ProfileChange';
import TranslationContextProvider from './store/TranslationContext';
import DoctorSearch from './components/DoctorSearch';
import DoctorDetails from './components/DoctorDetails';
import DoctorHome from './components/DoctorHome';

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
            {path: '/500', element: <ServerError />},
            {path: '*', element: <NotFound />},
            {path: '/chatbot', element: <Chatbot />},
            {path: '/profile-change', element: <ProfileChange />},
            {path: '/doctor-search', element: <DoctorSearch/>},
            {path: '/doctor/:id', element: <DoctorDetails/>},
            {path : '/doctor-home',element:<DoctorHome/>},
        ]
    },
])

function App () {
    return (
        <TranslationContextProvider>
        <div className='App'>
            <Toaster position='bottom-right' toastOptions={{duration:2000}}/>
            <div className='Content'>
            <RouterProvider router={router}/>
            </div>
        </div>
        </TranslationContextProvider>
        
    );
}

export default App;