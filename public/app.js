document.addEventListener('DOMContentLoaded', () => {
    const sitesContainer = document.querySelector('.sites-container');
  
    // Cargar sitios desde un JSON
    async function loadSites() {
      try {
        const response = await fetch('/sites.json');
        const sites = await response.json();
  
        sites.forEach(site => {
          const button = document.createElement('button');
          button.textContent = site.name;
          button.addEventListener('click', () => fetchNews(site.url));
          sitesContainer.appendChild(button);
        });
      } catch (error) {
        console.error('Error loading sites:', error);
      }
    }
  
    loadSites();
  
    // Función para obtener noticias de un sitio
    async function fetchNews(url) {
      try {
        const response = await fetch('/scrape-news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
  
        const data = await response.json();
        displayNews(data); // Mostrar las noticias
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    }
  
    // Función para mostrar las noticias
    function displayNews(newsList) {
      const container = document.querySelector('.news-container');
      container.innerHTML = '';  // Limpiar el contenido anterior
  
      newsList.forEach(async (news) => {
        const newsItem = document.createElement('div');
        newsItem.classList.add('news-item');
  
        // Crear un elemento de imagen con un placeholder por defecto
        const image = document.createElement('img');
        image.src = 'https://via.placeholder.com/300x200'; // Imagen predeterminada
        newsItem.appendChild(image);
  
        // Crear un cartel de "Link copiado"
        const copiedMessage = document.createElement('div');
        copiedMessage.classList.add('copied-message');
        copiedMessage.textContent = 'Link copiado';
        copiedMessage.style.display = 'none'; // Oculto por defecto
        newsItem.appendChild(copiedMessage);
  
        // Añadir el título de la noticia
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        
        const title = document.createElement('div');
        title.classList.add('news-title');
        title.textContent = news.title;
  
        // Hacer que el título sea un enlace
        const titleLink = document.createElement('a');
        titleLink.href = news.url;
        titleLink.target = '_blank'; // Abrir en una nueva pestaña
        titleLink.appendChild(title);
        overlay.appendChild(titleLink);
  
        newsItem.appendChild(overlay);
  
        container.appendChild(newsItem);
  
        // Evento para copiar el enlace al hacer clic en la imagen
        image.addEventListener('click', () => {
          navigator.clipboard.writeText(news.url)
            .then(() => {
              // Mostrar el mensaje de "Link copiado"
              copiedMessage.style.display = 'block';
              setTimeout(() => {
                copiedMessage.style.display = 'none'; // Ocultar el mensaje después de 2 segundos
              }, 2000);
            })
            .catch(err => {
              console.error('Error al copiar el enlace:', err);
            });
        });
  
        // Buscar la imagen basada en el título de la noticia
        try {
          const imageResponse = await fetch('/search-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: news.title }), // Enviar el título para buscar la imagen
          });
  
          const imageData = await imageResponse.json();
          if (imageData.imageUrl) {
            image.src = imageData.imageUrl; // Actualizar la imagen si se encuentra
          }
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      });
    }
  });
  