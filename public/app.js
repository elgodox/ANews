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
     
            // Crear un spinner para mostrar mientras la imagen se carga
            const spinner = document.createElement('div');
            spinner.classList.add('spinner');
            newsItem.appendChild(spinner);
     
            // Crear un elemento de imagen
            const image = document.createElement('img');
            image.style.display = 'none'; // Ocultar la imagen mientras carga
     
            // Mostrar imagen al cargar, ocultar el spinner
            image.onload = () => {
                spinner.style.display = 'none'; // Quitar el spinner
                image.style.display = 'block';  // Mostrar la imagen
            };
     
            // Si hay un error al cargar la imagen, usar una imagen predeterminada
            image.onerror = () => {
                spinner.style.display = 'none';  // Quitar el spinner
                image.src = 'https://via.placeholder.com/300x200';  // Imagen de error bonita
                image.style.display = 'block';
            };
     
            newsItem.appendChild(image);
     
            // Añadir el título de la noticia debajo de la imagen
            const titleLink = document.createElement('a');
            titleLink.href = news.url;
            titleLink.target = '_blank'; // Abrir en una nueva pestaña
            titleLink.classList.add('news-title');
            titleLink.textContent = news.title;
            newsItem.appendChild(titleLink);
     
            container.appendChild(newsItem);
     
            // Buscar la imagen basada en el título de la noticia
            try {
                const imageResponse = await fetch('/search-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title: news.title }),
                });
     
                const imageData = await imageResponse.json();
                if (imageData.imageUrl) {
                    image.src = imageData.imageUrl; // Actualizar la imagen si se encuentra
                } else {
                    image.src = 'https://via.placeholder.com/300x200'; // Imagen predeterminada si no hay resultado
                }
            } catch (error) {
                console.error('Error fetching image:', error);
                image.src = 'https://via.placeholder.com/300x200'; // Imagen predeterminada en caso de error
            }
        });
     }
  });
     
  