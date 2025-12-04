import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const execAsync = promisify(exec);

// Check if MongoDB is installed
async function checkMongoInstalled() {
  console.log('🔍 Checking if MongoDB is installed...');
  
  try {
    // Check for mongod command
    const { stdout } = await execAsync('mongod --version');
    console.log('✅ MongoDB is installed');
    console.log(`   ${stdout.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.log('❌ MongoDB command not found');
    console.log('   This might mean:');
    console.log('   1. MongoDB is not installed');
    console.log('   2. MongoDB is not in your PATH');
    console.log('   3. You might be using MongoDB Atlas (cloud)');
    return false;
  }
}

// Check if MongoDB service is running (Windows)
async function checkMongoServiceWindows() {
  console.log('🔍 Checking if MongoDB service is running (Windows)...');
  
  try {
    const { stdout } = await execAsync('sc query MongoDB');
    if (stdout.includes('RUNNING')) {
      console.log('✅ MongoDB service is running');
      return true;
    } else {
      console.log('❌ MongoDB service is not running');
      console.log('   Try: net start MongoDB');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Could not check MongoDB service status');
    return null;
  }
}

// Check if MongoDB service is running (Linux/Mac)
async function checkMongoServiceUnix() {
  console.log('🔍 Checking if MongoDB service is running (Unix)...');
  
  try {
    const { stdout } = await execAsync('pgrep mongod || pgrep mongodb');
    console.log('✅ MongoDB process is running (PID: ' + stdout.trim() + ')');
    return true;
  } catch (error) {
    console.log('❌ MongoDB process is not running');
    console.log('   Try: sudo systemctl start mongod');
    console.log('   Or: brew services start mongodb-community');
    return false;
  }
}

// Test MongoDB connection
async function testMongoConnection() {
  console.log('\n🔍 Testing MongoDB connection...');
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://voicenote:Test%401234@cluster0.q6ykbcn.mongodb.net/voicenote?appName=Cluster0';
  
  // Mask password in URI for logging
  const maskedUri = mongoUri.includes('@') 
    ? mongoUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
    : mongoUri;
  
  console.log(`   URI: ${maskedUri}`);
  
  try {
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    console.log('   Attempting connection...');
    await mongoose.connect(mongoUri, connectionOptions);
    
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Successfully connected to MongoDB!');
      console.log(`   Database: ${mongoose.connection.name}`);
      console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      console.log(`   Ready State: ${mongoose.connection.readyState} (1 = connected)`);
      
      // Test a simple operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`   Collections: ${collections.length} found`);
      
      await mongoose.connection.close();
      console.log('✅ Connection test completed successfully');
      return true;
    } else {
      console.log(`❌ Connection failed - Ready State: ${mongoose.connection.readyState}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to connect to MongoDB');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection Refused - Possible solutions:');
      console.log('   1. Make sure MongoDB is running');
      console.log('   2. Check if MongoDB is on the correct port (default: 27017)');
      console.log('   3. For MongoDB Atlas: Verify your connection string');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication Failed - Check:');
      console.log('   1. Username and password in MONGODB_URI');
      console.log('   2. Database user permissions');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Connection Timeout - Check:');
      console.log('   1. Network connectivity');
      console.log('   2. Firewall settings');
      console.log('   3. MongoDB server is accessible');
    }
    
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 MongoDB Connection Test Script\n');
  console.log('=' .repeat(50));
  
  // Check OS
  const isWindows = process.platform === 'win32';
  console.log(`\n📋 Platform: ${process.platform}`);
  
  // Check if MongoDB is installed
  const isInstalled = await checkMongoInstalled();
  
  // Check if service is running
  let isRunning = null;
  if (isWindows) {
    isRunning = await checkMongoServiceWindows();
  } else {
    isRunning = await checkMongoServiceUnix();
  }
  
  // Test connection
  console.log('\n' + '='.repeat(50));
  const connectionSuccess = await testMongoConnection();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   MongoDB Installed: ${isInstalled ? '✅ Yes' : '❌ No'}`);
  if (isRunning !== null) {
    console.log(`   MongoDB Running: ${isRunning ? '✅ Yes' : '❌ No'}`);
  }
  console.log(`   Connection Test: ${connectionSuccess ? '✅ Success' : '❌ Failed'}`);
  
  if (!connectionSuccess) {
    console.log('\n💡 Next Steps:');
    if (!isInstalled && !process.env.MONGODB_URI) {
      console.log('   1. Install MongoDB locally, OR');
      console.log('   2. Use MongoDB Atlas (cloud) and set MONGODB_URI in .env');
    } else if (isRunning === false) {
      console.log('   1. Start MongoDB service');
    } else {
      console.log('   1. Check your MONGODB_URI in .env file');
      console.log('   2. Verify MongoDB server is accessible');
    }
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed! MongoDB is ready to use.');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Script error:', error);
  process.exit(1);
});

