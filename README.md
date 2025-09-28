# ANGULAR Online Rental System

A MEAN stack (MongoDB, Express.js, Angular, Node.js) online rental system that allows users to rent and lease various items including bikes, cars, books, and rooms with comprehensive booking management.

## Features

### 🚲 Multi-Category Rentals
- **Bikes**: Mountain bikes, city bikes, electric bikes
- **Cars**: Economy, luxury, electric vehicles
- **Books**: Academic, fiction, technical books
- **Rooms**: Studios, apartments, vacation rentals

### 🔐 User Management
- User registration and authentication
- Role-based access control (User/Admin)
- Profile management
- Secure JWT-based authentication

### 📅 Booking Management
- Create and manage rental bookings
- Real-time availability checking
- Booking status tracking (pending, confirmed, active, completed, cancelled)
- Rating and review system

### 🔍 Advanced Search & Filtering
- Search by category, location, price range
- Filter by availability, ratings
- Sort by price, popularity, newest

### 💼 Owner Dashboard
- List your items for rent
- Manage booking requests
- Track earnings and bookings
- Item management (add, edit, delete)

### 👤 Admin Features
- User management
- Item moderation
- Booking oversight
- System analytics

## Tech Stack

### Frontend
- **Angular 20+** - Modern web framework
- **TypeScript** - Type-safe development
- **Angular Material** - UI components
- **RxJS** - Reactive programming

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Angular CLI

### 1. Clone the repository
```bash
git clone https://github.com/bharani195/ANGULAR_Online_Rental_System.git
cd ANGULAR_Online_Rental_System
```

### 2. Install dependencies
```bash
npm install
# This will install both server and client dependencies
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rental-system
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running on your system or update the `MONGODB_URI` to point to your MongoDB instance.

### 5. Seed the database (optional)
```bash
npm run seed
```
This creates sample users and items. Login credentials:
- Admin: `admin@renteasy.com` / `password123`
- User 1: `john@example.com` / `password123`
- User 2: `jane@example.com` / `password123`

### 6. Start the application

#### Development mode (both frontend and backend)
```bash
npm run dev
```

#### Production mode
```bash
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:4200 (development) or http://localhost:3000 (production)
- Backend API: http://localhost:3000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items with filtering
- `GET /api/items/:id` - Get item by ID
- `GET /api/items/category/:category` - Get items by category
- `POST /api/items` - Create new item (authenticated)
- `PUT /api/items/:id` - Update item (owner/admin only)
- `DELETE /api/items/:id` - Delete item (owner/admin only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status (owner/admin)
- `PUT /api/bookings/:id/cancel` - Cancel booking (renter)
- `PUT /api/bookings/:id/review` - Add rating/review
- `GET /api/bookings/owner/items` - Get bookings for owner's items

## Project Structure

```
ANGULAR_Online_Rental_System/
├── client/                     # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Angular components
│   │   │   ├── services/       # API services
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── guards/         # Route guards
│   │   ├── assets/             # Static assets
│   │   └── styles.css          # Global styles
│   ├── package.json
│   └── angular.json
├── server/                     # Node.js backend
│   ├── models/                 # Mongoose models
│   ├── routes/                 # Express routes
│   ├── middleware/             # Custom middleware
│   ├── config/                 # Configuration files
│   └── server.js               # Main server file
├── package.json                # Root package.json
├── .env                        # Environment variables
└── README.md
```

## Development Guidelines

### Adding New Features
1. Create appropriate models in `server/models/`
2. Add API routes in `server/routes/`
3. Create Angular services in `client/src/app/services/`
4. Build components in `client/src/app/components/`
5. Update routing in `client/src/app/app.routes.ts`

### Code Style
- Use TypeScript for type safety
- Follow Angular style guide
- Use meaningful variable and function names
- Add error handling for all API calls
- Write responsive CSS

## Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect MongoDB Atlas
4. Deploy using Git

### Docker Deployment
1. Create Dockerfile for the application
2. Use docker-compose for multi-container setup
3. Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@renteasy.com

## Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Real-time notifications
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with mapping services
- [ ] Automated testing suite
