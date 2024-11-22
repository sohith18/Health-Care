import styles from '../Styles/Footer.module.css';
import { useContext } from 'react';
import { TranslationContext } from "../store/TranslationContext"; // Assuming TranslationContext is implemented

const Footer = () => {
  const { translatedTexts } = useContext(TranslationContext); // Fetch translated texts from context

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.text}>
          &copy; {new Date().getFullYear()} Healio. {translatedTexts['All rights reserved.']}
        </p>
        <ul className={styles.links}>
          <li>
            <a href="https://github.com/sohith18/Health-Care" target="_blank"
              rel="noopener noreferrer" className={styles.link}>
              {translatedTexts['About Us']}
            </a>
          </li>
          <li>
            <a href="https://www.iiitb.ac.in/" target="_blank"
              rel="noopener noreferrer" className={styles.link}>
              {translatedTexts['Contact']}
            </a>
          </li>
          <li>
            <a href="https://www.freeprivacypolicy.com/live/f9c55ea6-d488-40ac-ba74-a4adfb3690f8" target="_blank"
              rel="noopener noreferrer" className={styles.link}>
              {translatedTexts['Privacy Policy']}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
