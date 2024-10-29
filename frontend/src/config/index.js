// frontend/src/config/index.js
const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5300',
    WS_URL: process.env.REACT_APP_WS_URL || 'ws://http://localhost:3001',
    ENV: process.env.REACT_APP_ENV || 'development',
    
    // Add other configuration variables
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 10,
      MAX_PAGE_SIZE: 50
    },
    
    FILE_UPLOAD: {
      MAX_SIZE: 5 * 1024 * 1024, // 5MB
      ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
    },
    
    DATE_FORMAT: {
      DISPLAY: 'MMM DD, YYYY',
      API: 'YYYY-MM-DD'
    }
  };
  
  export default config;