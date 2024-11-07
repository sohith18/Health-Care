import  { createContext, useState} from 'react';
import { translation } from '../Controllers/Translation';

export const TranslationContext = createContext({
    language: '',
    translatedTexts: [],
    handleLanguageChange: () => {}

});

export default function TranslationContextProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });
    const [translatedTexts, setTranslatedTexts] = useState(() => {
        const storedTexts = localStorage.getItem('translatedTexts');
        return storedTexts ? JSON.parse(storedTexts) : {};
    }); 
    
    const handleLanguageChange = async (newLanguage, sentences) => {
        setLanguage(newLanguage);

        const translations = await translation(sentences, language, newLanguage)

        localStorage.setItem('language', newLanguage);
        

        const newTranslatedTexts = sentences.reduce((acc, sentence, index) => {
            acc[sentence] = translations[index];
            return acc;
        }, {});

        

        console.log(newTranslatedTexts);

        setTranslatedTexts(newTranslatedTexts);

        localStorage.setItem('translatedTexts', JSON.stringify(newTranslatedTexts));
    };
    

    return( <TranslationContext.Provider value={{ language, translatedTexts, handleLanguageChange }}>
        {children}
    </TranslationContext.Provider>)
}