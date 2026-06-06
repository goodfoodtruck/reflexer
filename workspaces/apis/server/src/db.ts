import mongoose from "mongoose"

export const connectDatabase = async (uri: string) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  await mongoose.connect(uri, {
    family: 4
  })

  console.log("MongoDB connected")
  return mongoose.connection
}
