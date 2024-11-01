import Hero from '../components/Hero';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import Box from '../components/Cards';
import photo1 from '../assets/cough.png';
import photo2 from '../assets/depression.png';
import photo3 from '../assets/eye.png';
import photo4 from '../assets/pigment.png';
import DoctorBoxes from '../components/DoctorBoxes';


export default function Home() {
  return (
    <>
      <Hero/>
      <DoctorBoxes />
      
      <div className='follow-us'>
        <h2 className="text-center">Follow Us</h2>
        <div className='d-flex justify-content-center'>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark mx-2">
            <i className="fa fa-instagram"></i> Instagram
          </a>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark mx-2">
            <i className="fa fa-youtube"></i> YouTube
          </a>
          {/* Add more social media links/icons as needed */}
        </div>
      </div>
    </>
  )
}
