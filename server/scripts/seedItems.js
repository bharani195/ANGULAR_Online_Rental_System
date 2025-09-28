import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../models/Item.js';

dotenv.config();

const items = [
  {
    name: 'Mountain Bike',
    category: 'bike',
    description: 'High-performance mountain bike, perfect for trails',
    pricePerDay: 25,
    available: true
  },
  {
    name: 'City Bike',
    category: 'bike',
    description: 'Comfortable city bike for urban commuting',
    pricePerDay: 15,
    available: true
  },
  {
    name: 'Toyota Camry',
    category: 'car',
    description: '2024 Toyota Camry - Automatic, Fuel Efficient',
    pricePerDay: 75,
    available: true
  },
  {
    name: 'Tesla Model 3',
    category: 'car',
    description: 'Electric vehicle with autopilot features',
    pricePerDay: 120,
    available: true
  },
  {
    name: 'Harry Potter Collection',
    category: 'book',
    description: 'Complete set of Harry Potter books',
    image: 'https://upload.wikimedia.org/wikipedia/en/d/d7/Harry_Potter_character_poster.jpg',
    pricePerDay: 5,
    available: true
  },
  {
    name: 'Programming Guide Collection',
    category: 'book',
    description: 'Collection of popular programming books',
    pricePerDay: 8,
    available: true
  },
  {
    name: 'Luxury Studio Apartment',
    category: 'room',
    description: 'Modern studio with full amenities in city center',
    pricePerDay: 150,
    available: true
  },
  {
    name: 'Cozy Single Room',
    category: 'room',
    description: 'Furnished single room with shared facilities',
    pricePerDay: 45,
    available: true
  }
];

async function seedItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing items
    await Item.deleteMany({});
    console.log('Cleared existing items');

    // Insert new items
    await Item.insertMany(items);
    console.log('Added sample items successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding items:', error);
    process.exit(1);
  }
}

seedItems();