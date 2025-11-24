import React from "react"
import { useState, useEffect, useContext } from 'react';
import styles from '../Styles/Reviews.module.css';
import reviews from '../assets/reviewsData.json';
import Review1 from '../assets/Review1.jpg';
import Review2 from '../assets/Review2.jpg';
import Review3 from '../assets/Review3.jpg';
import { TranslationContext } from "../store/TranslationContext"; // Import context

const images = {
  Review1: Review1,
  Review2: Review2,
  Review3: Review3,
};

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { translatedTexts } = useContext(TranslationContext); // Use context for translations

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 7000); 

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div>
      <h2 className={styles.heading}>
        {translatedTexts['Hear What Our Users Have to Say'] || 'Hear What Our Users Have to Say'}
      </h2>
      <div className={styles.carouselBox}>
        <div className={styles.leftPart}>
          <img
            src={images[reviews[currentIndex].image]}
            alt={`Review ${currentIndex}`}
            className={styles.image}
          />
        </div>
        <div className={styles.rightPart}>
          <p className={styles.review}>
            {translatedTexts[reviews[currentIndex].review] || reviews[currentIndex].review}
          </p>
          <p className={styles.name}>
            - {translatedTexts[reviews[currentIndex].name] || reviews[currentIndex].name}
          </p>
        </div>
        <div className={styles.dotsContainer}>
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
