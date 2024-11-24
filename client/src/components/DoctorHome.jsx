import { useContext } from 'react';
import photo1 from '../assets/Hero1.jpg';
import classes from '../Styles/Hero.module.css'; // Import the CSS module
import { TranslationContext } from '../store/TranslationContext'; // Adjust path as necessary
import { useNavigate } from 'react-router-dom';

export default function DoctorHome() {
  const { translatedTexts } = useContext(TranslationContext);
  const navigate = useNavigate()

  return (
    <div>
      <img src={photo1} alt="Hero" className={classes.img} />
      <div className={classes.text}>
        {/* <h1>{translatedTexts['Feeling well?'] || 'Feeling well?'}</h1> */}
        {/* <p>{translatedTexts['Click below to connect with our expert team today!'] || 'Click below to connect with our expert team today!'}</p> */}
        <button className={classes.button} type='submit' onClick={()=>{navigate('/appointments')}}>
          {translatedTexts['Help Now'] || 'Help Now'}
        </button>
      </div>
    </div>
  );
}


