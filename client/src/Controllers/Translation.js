import axios from 'axios';

export async function translation(sentence, source='en', target) {
  const API_KEY = import.meta.env.VITE_API_KEY;
    const options = {
        method: 'POST',
        url: 'https://deep-translate1.p.rapidapi.com/language/translate/v2',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          q: sentence,
          source: source,
          target: target
        }
      };
      
      try {
        const response = await axios.request(options);
        console.log(response.data.data.translations.translatedText);
        return response.data.data.translations.translatedText;
      } catch (error) {
        console.error(error);
      }
}

