import env from 'dotenv'
import mongoose from 'mongoose'

env.config()

const DB = process.env.DB;

const connectDb = async () => {
    try {
      await mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`Connected to database.`)
    } catch (error) {
      console.error("Error connecting to the database:", error.message);
      process.exit(1);
    }
};

export default connectDb;