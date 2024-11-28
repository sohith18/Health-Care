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
import Doctors from './pages/Doctors';
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


axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

const router = createBrowserRouter([
    {   path: '/', element: <RootLayout />,
        children:[
            {path: '/', element: <Home />},
            {path: '/prescription-history', element: <PrescriptionHist />},
            {path: '/login', element: <Login />},
            {path: '/register', element: <Register />},
            {path: '/video-call', element: <JoinPage />},
            {path: '/video-call/meeting', element: <VideoCall />},
            {path: '/doctors', element: <Doctors />},
            {path: '/500', element: <ServerError />},
            {path: '*', element: <NotFound />},
            {path: '/profile-change', element: <ProfileChange />},
            {path: '/doctor-search', element: <DoctorSearch/>},
            {path: '/doctor/:id', element: <DoctorDetails/>},
            {path : '/doctor-home',element:<DoctorHome/>},
            {path: '/profile-change-doctor', element:<DoctorProfileChange/>},
            {path:'/appointments',element:<Appointments/>}
        ]
    },
])

function App() {
    // const navigate = useNavigate();
    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         fetch('http://localhost:3000/heartbeat', {
    //           method: 'GET',
    //           headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${localStorage.getItem('AuthToken')}`
    //           },
    //         })
    //           .then((response) => response.json())
    //           .then((data) => {
    //             console.log('Fetched data:', data);
                
    //             // Example: If `data.redirect` is true, notify the user
    //             if (data.redirect) {
    //               toast(
    //                 (t) => (
    //                   <div>
    //                     <p>You have a meeting request, do you want to be redirected?</p>
    //                     <button
    //                       onClick={() => {
    //                         toast.dismiss(t.id); // Dismiss the toast
    //                         navigate('/meeting', { state: { specialization: data.specialization, create: false } });
    //                       }}
    //                     >
    //                       Yes
    //                     </button>
    //                     <button onClick={() => toast.dismiss(t.id)}>No</button>
    //                   </div>
    //                 ),
    //                 { duration: 6000 } // Adjust duration as needed
    //               );
    //             }
    //           })
    //           .catch((error) => {
    //             console.error('Error fetching data:', error);
    //           });
    //       }, 5000); // Interval of 5 seconds
    //   }, []); // Empty dependency array ensures it runs once on mount
    
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