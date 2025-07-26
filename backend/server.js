import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {Client} from '@gradio/client';
import { clerkMiddleware } from '@clerk/express';
import sentimentRoutes from "./routes/sentiment.js"
dotenv.config();




// Protected route
const app = express();
const PORT =  3001;

app.use(clerkMiddleware());

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/sentiment', sentimentRoutes);

let client=null;

const getClient=async ()=>{
  if(!client){
    client=await Client.connect("SamOp224/mental-health-sentiment");
  }
  return client;
};

app.post('/api/sentiment/analyze',async (req,res)=>{
  try{
    const {text}=req.body;
    if(!text){
      return res.status(400).json({error:"Text is required"});
    }
  
  const gradioClient=await getClient();
  const result=await gradioClient.predict("/predict",{text});
  
  res.json({
    success:true,
    data:result.data
  });
}
catch(error){
  res.status(500).json({
  success:false,
  error:error.message
  });
}
})
// Example route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Add your API endpoints here

app.listen(3001, () => console.log('Backend running on port 3001'));