import React, { useContext, useState } from 'react';
import classes from '../Styles/LanguageDropDown.module.css'; // Adjust path as necessary
import { TranslationContext } from '../store/TranslationContext'; // Adjust path as necessary

const LanguageDropdown = ({ onLanguageChange }) => {
    const {language} = useContext(TranslationContext);
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        // Add more languages as needed
    ];

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleLanguageChange = (lang) => {
        onLanguageChange(lang.code); // Call the provided function to change language
        setIsOpen(false); // Close dropdown after selection
    };

    return (
        <div className={classes.dropdown}>
            <button onClick={toggleDropdown} className={`${classes.languageButton} ${isOpen ? classes.active : ''}`}>
                {languages.map(lang => lang.code === language ? lang.name : '')}
                <span className={`${classes.arrow} ${isOpen ? classes.active : ''}`}></span>
            </button>
            {isOpen && (
                <ul className={`${classes.dropbox} ${isOpen ? classes.show : ''}`}>
                    {languages.map(lang => (
                        <li key={lang.code} className={classes.dropitem} onClick={() => handleLanguageChange(lang)}>
                            {lang.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LanguageDropdown;
