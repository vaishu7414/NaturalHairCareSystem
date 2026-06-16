# Hair Care Store - Frontend

A modern React + Vite frontend application for a hair care e-commerce platform with Bootstrap styling and responsive design.

## Features

- ⚡ **Vite** - Lightning-fast build tool and dev server
- ⚛️ **React 19** - Modern UI library with hooks
- 🎨 **Bootstrap 5** - Responsive CSS framework
- 🚀 **React Router** - Client-side routing
- 🔌 **Axios** - HTTP client with interceptors
- 📱 **Responsive Design** - Mobile-first approach
- 🌗 **Environment Configuration** - Easy setup with .env files

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Navbar.css
│   ├── Footer.jsx
│   └── Footer.css
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Login.jsx
│   └── Pages.css
├── services/           # API and utility services
│   └── api.js
├── App.jsx             # Main app component
├── App.css
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```
VITE_API_URL=http://localhost:8000
```

## Pages

- **Home** (`/`) - Landing page with features and call-to-action
- **Products** (`/products`) - Product listing and search
- **Cart** (`/cart`) - Shopping cart management
- **Checkout** (`/checkout`) - Order processing
- **Login** (`/login`) - User authentication

## API Integration

The application uses Axios for API requests. The API client is configured in `src/services/api.js` with:

- **Base URL**: Configured from `VITE_API_URL` environment variable
- **Request Interceptor**: Automatically adds authentication token to requests
- **Response Interceptor**: Handles 401 errors and redirects to login

### Example API Usage

```javascript
import apiClient from '../services/api'

// GET request
const response = await apiClient.get('/api/products')

// POST request
const response = await apiClient.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password'
})
```

## Styling

The project uses Bootstrap 5 for styling combined with custom CSS modules:

- **Bootstrap Components**: Navbar, Cards, Forms, Grid system
- **Custom Styles**: Components and pages have their own CSS files
- **Color Scheme**: Purple gradient theme with responsive design

## Components

### Navbar
Main navigation component with links to all pages and mobile toggle.

### Footer
Footer component with company info, links, and contact information.

### Pages
- **Home**: Hero section with features and newsletter signup
- **Products**: Displays products from API with add to cart functionality
- **Cart**: Shopping cart management with order summary
- **Checkout**: Complete checkout form with shipping and payment
- **Login**: User authentication form

## Dependencies

### Production
- `react@^19.2.5` - UI library
- `react-dom@^19.2.5` - React DOM library
- `react-router-dom@latest` - Routing
- `bootstrap@latest` - CSS framework
- `axios@latest` - HTTP client

### Development
- `@vitejs/plugin-react` - Vite React plugin
- `eslint` - Code linter
- `vite` - Build tool

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Netlify, Vercel, or similar

1. Build the project
2. Deploy the `dist/` folder to your hosting service
3. Configure environment variables in your hosting dashboard

## Troubleshooting

### Port already in use
Change the port in `package.json`:
```bash
npm run dev -- --port 3000
```

### API connection issues
- Check that your backend server is running
- Verify the `VITE_API_URL` in `.env.local`
- Check CORS settings on your backend

### Build errors
Clear cache and reinstall:
```bash
npm run build
rm -rf node_modules
npm install
```

## Contributing

When contributing to this project:

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check code quality
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please contact: info@haircare.com
