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
    
            // Crear el botón gris con el enlace
            const linkButton = document.createElement('a');
            linkButton.href = 'https://chatgpt.com/g/g-NVmCyJOow-resumen-de-noticias-en-espanol';
            linkButton.target = '_blank'; // Abrir en una nueva pestaña
            linkButton.classList.add('gray-button');
            linkButton.textContent = 'Resumen de Noticias en Español';
    
            // Añadir el botón al contenedor
            sitesContainer.appendChild(linkButton);
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
  
    function displayNews(newsList) {
        const container = document.querySelector('.news-container');
        container.innerHTML = '';  // Limpiar el contenido anterior
    
        newsList.forEach(async (news, index) => {
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
        
            // Asignar el índice como valor de --order para diferenciar el tiempo de animación
            newsItem.style.setProperty('--order', index);
        
            // Crear un spinner para mostrar mientras la imagen se carga
            const spinner = document.createElement('div');
            spinner.classList.add('spinner');
            newsItem.appendChild(spinner);
        
            // Crear un elemento de imagen
            const image = document.createElement('img');
            image.style.display = 'none'; // Ocultar la imagen mientras carga
        
            // Crear el cartel de "Link copiado"
            const copiedMessage = document.createElement('div');
            copiedMessage.classList.add('copied-message');
            copiedMessage.textContent = 'Link copiado';
            copiedMessage.style.display = 'none'; // Oculto por defecto
        
            // Añadir el cartel al contenedor de la imagen
            newsItem.appendChild(image);
            newsItem.appendChild(copiedMessage);
        
            // Mostrar imagen al cargar, ocultar el spinner
            image.onload = () => {
                spinner.style.display = 'none'; // Quitar el spinner
                image.style.display = 'block';  // Mostrar la imagen
            };
        
            // Evento para copiar el enlace al hacer clic en la imagen
            image.addEventListener('click', () => {
                navigator.clipboard.writeText(news.url)
                    .then(() => {
                        copiedMessage.style.display = 'block';
                        setTimeout(() => {
                            copiedMessage.style.display = 'none'; // Ocultar el mensaje después de 2 segundos
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Error al copiar el enlace:', err);
                    });
            });
        
            // Añadir el título de la noticia debajo de la imagen
            const titleLink = document.createElement('a');
            titleLink.href = news.url;
            titleLink.target = '_blank';
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
                }
            } catch (error) {
                console.error('Error fetching image:', error);
            }
        });
        
    }
    
     
  });
     
  