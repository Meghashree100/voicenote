import mongoose from 'mongoose';

// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    required: true,
  },
  dueDate: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Transform _id to id for API compatibility
taskSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Task = mongoose.model('Task', taskSchema);

// Set up MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
  console.log(`   Database: ${mongoose.connection.name}`);
  console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message || err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export async function initDatabase() {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('📊 MongoDB already connected');
    return;
  }

  // If already connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection in progress, waiting...');
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
  }

  try {
    // MongoDB Atlas connection string (password @ is URL encoded as %40)
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://voicenote:Test%401234@cluster0.q6ykbcn.mongodb.net/voicenote?appName=Cluster0';
    
    // Mask password in URI for logging (if present)
    const maskedUri = mongoUri.includes('@') 
      ? mongoUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
      : mongoUri;
    
    console.log('🔄 Connecting to MongoDB...');
    console.log(`   URI: ${maskedUri}`);
    
    // Connection options with timeouts
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };
    
    await mongoose.connect(mongoUri, connectionOptions);
    
    // Verify connection is established
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB connection established');
    } else {
      throw new Error('Connection established but readyState is not 1');
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB');
    console.error(`   Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   💡 Make sure MongoDB is running on your system');
      console.error('   💡 For local MongoDB: Start the MongoDB service');
      console.error('   💡 For MongoDB Atlas: Check your connection string');
    }
    throw error;
  }
}

export function getDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return mongoose.connection;
}
