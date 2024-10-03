const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const googleIt = require('google-it'); // Importamos google-it para Google Search
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Función para buscar una imagen en Google o alternativas
// Función para buscar una imagen en Google o Bing como alternativa
// Función para agregar un retraso (espera) entre solicitudes
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
 // Función para buscar una imagen en Google o Bing como alternativa
async function searchImageOnGoogleOrOthers(title) {
    try {
      // Intentar buscar con Google primero
      const googleResults = await googleIt({ query: `${title} image` });
      const googleImageResult = googleResults.find(result => result.link.includes('imgurl'));
  
      if (googleImageResult) {
        const googleImageUrl = new URL(googleImageResult.link).searchParams.get('imgurl');
        if (googleImageUrl) return googleImageUrl;
      }
  
      // Si Google falla (por ejemplo, con un error 429), intentar buscar con Bing
      const bingResults = await searchImageOnBing(title);
      if (bingResults) return bingResults;
  
      // Si Bing también falla, intentar con DuckDuckGo
      const duckDuckGoResults = await searchImageOnDuckDuckGo(title);
      if (duckDuckGoResults) return duckDuckGoResults;
  
      // Si todas las búsquedas fallan, usar una imagen genérica
      return 'https://via.placeholder.com/150';
    } catch (error) {
      console.error('Error buscando la imagen en Google, intentando con Bing:', error);
      const bingResults = await searchImageOnBing(title);
      if (bingResults) return bingResults;
  
      // Si Bing también falla, intentar DuckDuckGo
      const duckDuckGoResults = await searchImageOnDuckDuckGo(title);
      if (duckDuckGoResults) return duckDuckGoResults;
  
      return 'https://via.placeholder.com/150';  // Imagen genérica en caso de error
    }
  }
  
  
  // Función para buscar imágenes en Bing
  async function searchImageOnBing(title) {
    try {
      const response = await axios.get(`https://www.bing.com/images/search?q=${encodeURIComponent(title)}`);
      const $ = cheerio.load(response.data);
      const firstImage = $('img.mimg').first().attr('src');
  
      if (firstImage) {
        return firstImage.startsWith('http') ? firstImage : `https://www.bing.com${firstImage}`;  // Normalizar la URL
      }
    } catch (error) {
      console.error('Error buscando la imagen en Bing:', error);
    }
    return null;
  }
  
  // Función para buscar imágenes en DuckDuckGo
  async function searchImageOnDuckDuckGo(title) {
    try {
      const response = await axios.get(`https://duckduckgo.com/?q=${encodeURIComponent(title)}&iax=images&ia=images`);
      const $ = cheerio.load(response.data);
      const firstImage = $('img.tile--img__img').first().attr('src');
  
      if (firstImage) {
        return firstImage.startsWith('http') ? firstImage : `https://duckduckgo.com${firstImage}`;  // Normalizar URL
      }
    } catch (error) {
      console.error('Error buscando la imagen en DuckDuckGo:', error);
    }
    return null;
  }
  

// Función para hacer scraping de los títulos y enlaces de noticias de cualquier sitio
async function scrapeNews(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const news = [];
    const uniqueLinks = new Set();  // Para almacenar enlaces únicos

    // Intentar extraer los enlaces de los elementos comunes en los sitios de noticias
    $('article a, h1 a, h2 a, h3 a, a').each((index, element) => {
      let title = $(element).text().trim();
      let link = $(element).attr('href');

      // Verificar que 'href' esté definido
      if (!link) return;

      // Normaliza los enlaces relativos a absolutos
      const completeUrl = link.startsWith('http') ? link : `${url}${link}`;

      // Si el título tiene más de 50 caracteres y el enlace es único
      if (title.length > 50 && !uniqueLinks.has(completeUrl)) {
        uniqueLinks.add(completeUrl);
        news.push({ title, url: completeUrl });
      }
    });

    return news;
  } catch (error) {
    console.error('Error scraping the news:', error);
    return [];
  }
}

// Nueva ruta para buscar imágenes basadas en el título de la noticia
app.post('/search-image', async (req, res) => {
    const { title } = req.body;
    try {
      if (!title) {
        return res.status(400).json({ error: 'El título es requerido' });
      }
  
      // Buscar la imagen basada en el título
      const imageUrl = await searchImageOnGoogleOrOthers(title); // Buscar imagen en múltiples fuentes
      res.json({ imageUrl });  // Enviar la URL de la imagen de vuelta al cliente
    } catch (error) {
      console.error('Error buscando la imagen:', error);
      res.status(500).json({ error: 'Error buscando la imagen' });
    }
  });
  

// Ruta para extraer noticias y devolver los títulos y enlaces
app.post('/scrape-news', async (req, res) => {
  const { url } = req.body;
  try {
    if (!url) {
      return res.status(400).json({ error: 'URL es requerida' });
    }

    // Scraping adaptable
    const newsList = await scrapeNews(url);

    if (newsList.length === 0) {
      return res.status(404).json({ error: 'No se encontraron noticias en la URL proporcionada' });
    }

    // Devolver los títulos y enlaces como JSON
    res.json(newsList);
  } catch (error) {
    console.error('Error procesando las noticias:', error);
    res.status(500).json({ error: 'Error procesando las noticias' });
  }
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
