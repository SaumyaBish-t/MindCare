import express from "express";
import { PrismaClient } from "@prisma/client";
import { getAuth } from '@clerk/express';


const router=express.Router();
const prisma=new PrismaClient();

const authenticateApi = (req, res, next) => {
    const { userId } = getAuth(req); // Retrieve auth object from request
    if (!userId) {
        // If no userId, the user is not authenticated. Return 401 Unauthorized.
        return res.status(401).json({ error: "Unauthorized", message: "Authentication required." });
    }
    // If authenticated, proceed to the next middleware/route handler
    next();
};

router.post("/save", authenticateApi, async (req,res)=>{
    try{

        const {inputText,result,description}=req.body;
        const {userId} = getAuth(req);
        

        const analysis=await prisma.sentimentAnalysis.create({
            data:{
                userId,
                inputText,
                result,
                description,
            }
            ,
        });
        res.status(201).json({success:true,analysis});
    }
    catch(error){
        console.error("Error saving sentiment analysis:",error);
        res.status(500).json({error:"Failed to save analysis"});
    }
});

router.get("/history", authenticateApi,async (req,res)=>{
    try{
        const userId = req.auth().userId;
        const analyses=await prisma.sentimentAnalysis.findMany({
            where:{userId},
            orderBy:{createdAt:'desc'},
            take:10,
        });
        res.status(200).json({analyses});
    }
    catch(error){
        console.error("Error fetching analysis history:",error);
        res.status(500).json({error:"failed to fetch history"});
    }
});

router.delete('/:id',authenticateApi, async (req, res) => {
  try {
    const {userId} = getAuth(req);
    const { id } = req.params;
    
    await prisma.sentimentAnalysis.delete({
      where: { 
        id: parseInt(id),
        userId:userId
       },
      
    });

    res.status(200).json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

export default router;