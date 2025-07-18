# 🍽️ RecipeGenius - Smart Recipe Generator & Grocery Planner

A comprehensive MERN stack application that revolutionizes meal planning and grocery shopping with AI-powered recipe suggestions, smart pantry management, and seamless grocery list generation.

## � Features

### 🔍 Recipe Discovery & Management
- **AI-Powered Recipe Suggestions**: Get personalized recipe recommendations based on your ingredients
- **Advanced Search**: Filter recipes by cuisine, dietary restrictions, prep time, and more
- **Voice Input**: Dictate your ingredients using voice recognition
- **OCR Integration**: Scan recipes from images using Tesseract.js
- **Recipe Collections**: Save, organize, and categorize your favorite recipes

### 🛒 Smart Grocery Planning
- **Automated Grocery Lists**: Generate shopping lists directly from recipes
- **Smart Categorization**: Automatically organize items by store sections
- **Price Tracking**: Monitor grocery expenses and budget
- **Sharing**: Share lists with family members or roommates
- **PDF Export**: Export lists for offline shopping

### 🏠 Pantry Management
- **Inventory Tracking**: Keep track of what you have in your pantry
- **Expiration Alerts**: Get notified when items are about to expire
- **OCR Scanning**: Scan product labels to quickly add items
- **Smart Suggestions**: Get recipe suggestions based on expiring items
- **Waste Reduction**: Minimize food waste with intelligent planning

### 📱 Progressive Web App (PWA)
- **Offline Functionality**: Access your recipes and lists without internet
- **Install on Device**: Add to home screen for native app experience
- **Push Notifications**: Get alerts for expiring items and new recipes
- **Background Sync**: Sync data when connection is restored

### 🎨 User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Intuitive UI**: Clean, modern interface with smooth animations
- **Accessibility**: Screen reader friendly and keyboard navigable

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **Clerk** - Authentication and user management
- **Tesseract.js** - OCR text recognition
- **jsPDF** - PDF generation
- **React Speech Kit** - Voice recognition

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Clerk** - Authentication middleware
- **Spoonacular API** - Recipe data and nutrition info
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers

### APIs & Services
- **Spoonacular API** - Recipe search and nutrition data
- **Clerk Authentication** - User management and security
- **Web Speech API** - Voice recognition
- **Camera API** - Image capture for OCR
- **Geolocation API** - Location-based features

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Clone the Repository
```bash
git clone https://github.com/recipegenius/recipegenius.git
cd recipegenius
```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipegenius
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
SPOONACULAR_API_KEY=your_spoonacular_api_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key
```

Start the frontend development server:
```bash
npm start
```

## 🔧 Configuration

### API Keys Setup

1. **Clerk Authentication**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the publishable and secret keys

2. **Spoonacular API**
   - Sign up at [spoonacular.com](https://spoonacular.com/food-api)
   - Get your API key from the dashboard
   - Note: Free tier has request limits

## 🎯 Usage

### Getting Started
1. **Sign Up**: Create an account using Clerk authentication
2. **Add Ingredients**: Use voice, typing, or OCR to add ingredients
3. **Get Recipes**: Receive AI-powered recipe suggestions
4. **Save Favorites**: Build your personal recipe collection
5. **Generate Lists**: Create grocery lists from recipes
6. **Manage Pantry**: Track inventory and expiration dates

### Voice Commands
- "Add tomatoes to ingredients"
- "Search for pasta recipes"
- "Add milk to grocery list"
- "Show me quick dinner ideas"

### OCR Features
- Scan recipe books or printed recipes
- Scan grocery receipts to add items
- Scan product labels for pantry items
- Extract ingredient lists from images

## 📱 Mobile Features

### PWA Installation
1. Open the app in your mobile browser
2. Tap "Add to Home Screen" when prompted
3. Use as a native app with offline capabilities

### Offline Functionality
- Browse saved recipes
- View grocery lists
- Access pantry inventory
- Create new lists (syncs when online)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spoonacular API** for recipe data
- **Clerk** for authentication services
- **Tesseract.js** for OCR capabilities
- **React Community** for amazing libraries

---

**Made with ❤️ by the RecipeGenius Team**
```

3. Set up environment variables
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
SPOONACULAR_API_KEY=your_spoonacular_api_key
PORT=5000

# Frontend (.env.local)
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key
```

4. Start the application
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start
```

## 📱 Usage

1. **Sign In/Sign Up** - Use Clerk authentication
2. **Add Ingredients** - Type, voice input, or upload pantry image
3. **Get Recipes** - AI-powered suggestions with filters
4. **Save Favorites** - Build your personal cookbook
5. **Generate Grocery List** - Smart shopping lists with PDF export
6. **Manage Pantry** - Keep track of your ingredients

## 🛠️ API Endpoints

### Recipe Routes
- `POST /api/recipes/search` - Search recipes by ingredients
- `GET /api/recipes/:id` - Get recipe details
- `POST /api/recipes/save` - Save recipe to user's cookbook
- `GET /api/recipes/saved` - Get user's saved recipes

### Grocery List Routes
- `POST /api/grocery-list/generate` - Generate grocery list from recipes
- `GET /api/grocery-list` - Get user's grocery lists
- `PUT /api/grocery-list/:id` - Update grocery list

### Pantry Routes
- `GET /api/pantry` - Get user's pantry items
- `POST /api/pantry/add` - Add pantry item
- `DELETE /api/pantry/:id` - Remove pantry item

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spoonacular API for recipe data
- Clerk for authentication
- Tesseract.js for OCR capabilities
- All the amazing open-source libraries used in this project
