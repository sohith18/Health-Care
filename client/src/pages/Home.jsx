import React from 'react'
import Slider from '../components/Slider'
import 'bootstrap/dist/css/bootstrap.min.css';
import slides from '../assets/images.json'
import Box from '../components/Cards'
import photo1 from '../assets/cough.png'
import photo2 from '../assets/depression.png'
import photo3 from '../assets/eye.png'
import photo4 from '../assets/pigment.png'
import { Link } from 'react-router-dom';
import ColdDoctors from './Specialized_doctors/ColdDoctors';

export default function Home() {
  return (
    <>
      <div className='slider'><Slider slides={slides}/></div>
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
            <div className='inside-reason'>Specialities</div>
          </div>
        </div>
      </div>
      <div className  = 'chat-box'>
        <button> Chat with us </button>
      </div>
      <div className='Boxes'>
        <Box cardImage={photo1} cardDestination="/cough-doctors" cardTitle="Cough,Cold or Fever"/>
        <Box cardImage={photo2} cardDestination="/mental-health-doctors" cardTitle="Depression or Anxiety" />
        <Box cardImage={photo3} cardDestination="/allergy-doctors" cardTitle="Eye Allegy Issues"/>
        <Box cardImage={photo4} cardDestination="/skin-doctors" cardTitle="Skin Issues"/>
      </div>
    </>
  
  )
  
}
