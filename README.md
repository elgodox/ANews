# News Search Platform - ANews

This project is a real-time news search and display platform with a modern, minimalist design. Users can input a list of news links and receive a visual summary with stylized cards that include an image, the title, and the link to the news.

## Features

- **News Scraping**: Users can input multiple news URLs, and the system returns a summarized and visually appealing layout.
- **Responsive Design**: The application makes full use of the screen, displaying news as cards with small images above the title.
- **Content Optimization**: Only articles with more than 50 characters are displayed, ensuring relevant content for users.

## Technologies Used

- **Frontend**: 
  - HTML5, CSS3, JavaScript
  - Bootstrap for responsive design
  - `app.js` for client-side interactions

- **Backend**: 
  - Node.js
  - `server.js` for server-side requests
  - Free OpenAI API for generating news summaries
  
- **Local Storage**: User data is not stored on the server. Instead, the application processes input and directly displays results in the browser.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/username/repository.git
   cd repository
