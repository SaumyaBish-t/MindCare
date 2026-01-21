import express from "express";
import habitService from "../services/habitService.js";
import { getAuth } from '@clerk/express';


const router = express.Router();

const authenticateApi = (req, res, next) => {
    const { userId } = getAuth(req); // Retrieve auth object from request
    if (!userId) {
        // If no userId, the user is not authenticated. Return 401 Unauthorized.
        return res.status(401).json({ error: "Unauthorized", message: "Authentication required." });
    }
    // If authenticated, proceed to the next middleware/route handler
    next();
};

// Get all habits for authenticated user
router.get("/habits",authenticateApi, async (req,res) =>{
    try{
        const userId = req.auth().userId;
        const habits = await habitService.getUserHabits(userId);
        res.json({success:true,habits});
    }
    catch(error){
        res.status(500).json({success:false,message:error.message});
    }
});

// Add a new habit for authenticated user
router.post("/habits",authenticateApi,async (req,res)=>{
    try{
        const userId=req.auth().userId;
        const habit= await habitService.createHabit(userId,req.body);
        res.status(201).json({success:true,habit});
    }
    catch(error){
        console.error("Create habit error:",error);
        res.status(500).json({success:false,error:error.message});
    }
});

//Get habit streak
router.get("/habits/:id/streak",authenticateApi,async (req,res)=>{
    try{
        const userId=req.auth().userId;
        const habitId=parseInt(req.params.id);
        console.log('Getting streak for:', { habitId, userId });
        const streak=await habitService.getHabitStreak(habitId,userId);
        res.json({success:true,streak});
    }
    catch(error){
        console.error("get streak error:",error);
        res.status(500).json({success:false,error:error.message});
    }
});
//Mark habit as completed

router.post("/habits/:id/complete",authenticateApi,async (req,res)=>{
    try{
        const userId=req.auth().userId;
        const habitId=parseInt(req.params.id);
        const completion=await habitService.completeHabit(habitId,userId);
        res.json({success:true,completion});
    }
    catch(error){
        res.status(500).json({success:false,error:error.message});       
    }
});



//Delete habit
router.delete("/habits/:id",authenticateApi,async (req,res)=>{
    try{
        const userId=req.auth().userId;
        const habitId=parseInt(req.params.id);
        console.log('Deleting habit:', { habitId, userId }); // Debug log
        const habit=await habitService.deleteHabit(habitId,userId);
        if (habit) {
      res.json({ 
        success: true, 
        message: 'Habit deleted successfully',
        habit 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Habit not found or already deleted' 
      });
    }
    }
    catch(error){
        res.status(500).json({success:false,error:error.message});
    }
});

export default router;
