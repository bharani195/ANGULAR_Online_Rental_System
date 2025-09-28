const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@renteasy.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1234567890',
        address: {
          street: '123 Admin St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        }
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1234567891',
        address: {
          street: '456 User Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'USA'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1234567892',
        address: {
          street: '789 Demo Rd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }
      }
    ]);

    console.log('Created sample users');

    // Create sample items
    const items = await Item.create([
      // Bikes
      {
        title: 'Mountain Bike - Trek X1',
        description: 'High-quality mountain bike perfect for trails and city riding. Features 21-speed gear system and front suspension.',
        category: 'bike',
        pricePerDay: 25,
        location: 'San Francisco, CA',
        images: ['/assets/bike1.jpg'],
        features: ['21-speed gear system', 'Front suspension', 'Disc brakes', 'LED lights'],
        owner: users[1]._id,
        specifications: {
          make: 'Trek',
          model: 'X1',
          year: 2023,
          color: 'Blue'
        },
        rating: {
          average: 4.5,
          count: 12
        }
      },
      {
        title: 'City Bike - Comfort Cruiser',
        description: 'Comfortable city bike ideal for casual rides and commuting. Features upright seating position.',
        category: 'bike',
        pricePerDay: 15,
        location: 'San Francisco, CA',
        images: ['/assets/bike2.jpg'],
        features: ['Comfort seat', 'Upright position', 'Basket included', 'Bell'],
        owner: users[2]._id,
        specifications: {
          make: 'Schwinn',
          model: 'Cruiser',
          year: 2022,
          color: 'Red'
        },
        rating: {
          average: 4.2,
          count: 8
        }
      },
      
      // Cars
      {
        title: 'Honda Civic 2023',
        description: 'Reliable and fuel-efficient sedan perfect for city driving and longer trips. Clean interior and well-maintained.',
        category: 'car',
        pricePerDay: 45,
        location: 'Los Angeles, CA',
        images: ['/assets/car1.jpg'],
        features: ['Air conditioning', 'Bluetooth', 'Backup camera', 'Fuel efficient'],
        owner: users[1]._id,
        specifications: {
          make: 'Honda',
          model: 'Civic',
          year: 2023,
          color: 'Silver',
          fuelType: 'Gasoline',
          transmission: 'Automatic'
        },
        rating: {
          average: 4.7,
          count: 15
        }
      },
      {
        title: 'Tesla Model 3',
        description: 'Electric luxury sedan with autopilot features. Perfect for eco-friendly transportation with premium comfort.',
        category: 'car',
        pricePerDay: 85,
        location: 'San Francisco, CA',
        images: ['/assets/car2.jpg'],
        features: ['Electric', 'Autopilot', 'Premium interior', 'Supercharger access'],
        owner: users[2]._id,
        specifications: {
          make: 'Tesla',
          model: 'Model 3',
          year: 2023,
          color: 'White',
          fuelType: 'Electric',
          transmission: 'Automatic'
        },
        rating: {
          average: 4.9,
          count: 23
        }
      },
      
      // Books
      {
        title: 'The Great Gatsby - Classic Literature',
        description: 'F. Scott Fitzgerald\'s masterpiece. A classic American novel in excellent condition.',
        category: 'book',
        pricePerDay: 3,
        location: 'San Francisco, CA',
        images: ['/assets/book1.jpg'],
        features: ['Hardcover', 'Excellent condition', 'Classic literature', 'First edition'],
        owner: users[1]._id,
        specifications: {
          author: 'F. Scott Fitzgerald',
          isbn: '978-0-7432-7356-5',
          publisher: 'Scribner',
          publicationYear: 1925
        },
        rating: {
          average: 4.6,
          count: 7
        }
      },
      {
        title: 'JavaScript: The Good Parts',
        description: 'Essential guide to JavaScript programming. Perfect for developers looking to master JavaScript.',
        category: 'book',
        pricePerDay: 5,
        location: 'Los Angeles, CA',
        images: ['/assets/book2.jpg'],
        features: ['Technical book', 'Programming guide', 'Good condition', 'Highlighted sections'],
        owner: users[2]._id,
        specifications: {
          author: 'Douglas Crockford',
          isbn: '978-0-596-51774-8',
          publisher: 'O\'Reilly Media',
          publicationYear: 2008
        },
        rating: {
          average: 4.4,
          count: 11
        }
      },
      
      // Rooms
      {
        title: 'Cozy Downtown Studio',
        description: 'Modern studio apartment in the heart of downtown. Perfect for short stays with all amenities included.',
        category: 'room',
        pricePerDay: 120,
        location: 'San Francisco, CA',
        images: ['/assets/room1.jpg'],
        features: ['WiFi', 'Kitchen', 'Air conditioning', 'Near public transport'],
        owner: users[1]._id,
        specifications: {
          bedrooms: 1,
          bathrooms: 1,
          area: 500,
          furnishing: 'Fully furnished',
          amenities: ['WiFi', 'Kitchen', 'AC', 'TV', 'Washing machine']
        },
        rating: {
          average: 4.3,
          count: 19
        }
      },
      {
        title: 'Spacious 2BR Apartment',
        description: 'Beautiful 2-bedroom apartment with city views. Ideal for families or groups visiting the area.',
        category: 'room',
        pricePerDay: 180,
        location: 'Los Angeles, CA',
        images: ['/assets/room2.jpg'],
        features: ['City view', 'Balcony', 'Parking included', 'Pet friendly'],
        owner: users[2]._id,
        specifications: {
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          furnishing: 'Fully furnished',
          amenities: ['WiFi', 'Kitchen', 'AC', 'TV', 'Parking', 'Balcony']
        },
        rating: {
          average: 4.8,
          count: 14
        }
      }
    ]);

    console.log('Created sample items');
    console.log('Seed data created successfully!');
    
    // Display login info
    console.log('\n=== Sample Login Credentials ===');
    console.log('Admin: admin@renteasy.com / password123');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();