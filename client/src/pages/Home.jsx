import React from 'react';
import Hero from '../components/Hero';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import slides from '../assets/images.json';
import Box from '../components/Cards';
import photo1 from '../assets/cough.png';
import photo2 from '../assets/depression.png';
import photo3 from '../assets/eye.png';
import photo4 from '../assets/pigment.png';
import { Link } from 'react-router-dom';
import ColdDoctors from './Specialized_doctors/ColdDoctors';


export default function Home() {
  return (
    <>
      <div><Hero/></div>
      <div className='why'>
        <label className='label-css-home'>Why Connect</label>
        <div className='reasons'>
          <div className='reason'>
            100+
            <div className='inside-reason'>Top Doctors</div>
          </div>
          <div className='reason'>
            4.7
            <div className='inside-reason'>Google Rating</div>
          </div>
          <div className='reason'>
            25+
            <div className='inside-reason'>Specialties</div>
          </div>
        </div>
      </div>
      <div className='Boxes'>
        <Box cardImage={photo1} cardDestination="/cough-doctors" cardTitle="Cough, Cold or Fever" />
        <Box cardImage={photo2} cardDestination="/mental-health-doctors" cardTitle="Depression or Anxiety" />
        <Box cardImage={photo3} cardDestination="/allergy-doctors" cardTitle="Eye Allergy Issues" />
        <Box cardImage={photo4} cardDestination="/skin-doctors" cardTitle="Skin Issues" />
      </div>
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
