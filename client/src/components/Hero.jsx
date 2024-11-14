import { useContext } from 'react';
import photo1 from '../assets/Hero1.jpg';
import { Take_to_Chat } from '../Controllers/HomeController';
import classes from '../Styles/Hero.module.css'; // Import the CSS module
import { TranslationContext } from '../store/TranslationContext'; // Adjust path as necessary

export default function Hero() {
  const { translatedTexts } = useContext(TranslationContext);

  return (
    <div>
      <img src={photo1} alt="Hero" className={classes.img} />
      <div className={classes.text}>
        <h1>{translatedTexts['Feeling Unwell?'] || 'Feeling Unwell?'}</h1>
        <p>{translatedTexts['Click below to connect with our expert team today!'] || 'Click below to connect with our expert team today!'}</p>
        <button className={classes.button} type='submit' onClick={Take_to_Chat}>
          {translatedTexts['Get Help Now'] || 'Get Help Now'}
        </button>
      </div>
    </div>
  );
}


