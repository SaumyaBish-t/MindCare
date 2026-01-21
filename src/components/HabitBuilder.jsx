
import React,{useState,useEffect,useCallback} from "react";
import {useAuth, useUser} from "@clerk/clerk-react" // Fixed import
import { habitAPI } from "../api/habitAPI";

const HabitBuilder=()=>{
    const {isSignedIn, isLoaded}=useAuth(); // Fixed hook usage
    const {user} = useUser(); // Added useUser hook
    const [habits,setHabits]=useState([]);
    const [loading,setLoading]=useState(true);
    const [showCreateForm,setShowCreateForm]=useState(false);
    const [streaks,setStreaks]=useState({});

    //Pre-Defined Habit List
    const habitTemplates=[
    {
        title:"Morning Meditation",
        description:"5 minutes of mindful meditation",
        category:"mindfulness", // Fixed spelling
        icon:"🧘‍♂️"
    },
    {
        title:"Drink 8 glasses of water",
        description:"Stay hydrated throughout the day", // Fixed description
        category:"health",
        icon:"💧"
    },
    {
        title:"Gratitude Journal",
        description:"Write 3 things you're grateful for",
        category:"reflection",
        icon:"📝"
    },
    {
        title:"10-minute Walk",
        description: "Take a peaceful walk outside",
        category: "movement",
        icon: "🚶‍♂️"
    },
    {
        title:"Read for 20 Minutes",
        description:"Expand your mind with reading",
        category:"learning",
        icon:"📖"
    },
    {
      title: "Deep Breathing Exercise",
      description: "Practice 4-7-8 breathing technique",
      category: "wellness",
      icon: "🌬️"
    }
    ];

    const categoryColors = {
        mindfulness: "from-purple-100 to-purple-200 border-purple-300",
        health: "from-green-100 to-green-200 border-green-300",
        reflection: "from-blue-100 to-blue-200 border-blue-300",
        movement: "from-orange-100 to-orange-200 border-orange-300",
        learning: "from-indigo-100 to-indigo-200 border-indigo-300",
        wellness: "from-pink-100 to-pink-200 border-pink-300",
        general: "from-gray-100 to-gray-200 border-gray-300"
    };

    const loadStreaks=useCallback(async (habitsList)=>{
        const streakPromises=habitsList.map(async (habit) =>{
            try{
                const response=await habitAPI.getHabitStreak(habit.id);
                return {[habit.id]:response.streak || 0};
            }
            catch (error) {
            console.error(`Error loading streak for habit ${habit.id}:`, error);
            return { [habit.id]: 0 };
        }
    });
        const streakResults=await Promise.all(streakPromises);
        const streakMap=streakResults.reduce((acc,curr)=>({...acc,...curr}),{});
        setStreaks(streakMap);
    },[]);

    const loadHabits = useCallback(async () =>{
        try{
            setLoading(true);
            const response=await habitAPI.getHabits();
            if(response.success){
                setHabits(response.habits);
                loadStreaks(response.habits);
            }
        }
        catch(error){
            console.error("Error loading habits",error);
        }
        finally{
            setLoading(false);
        }
    },[loadStreaks]);

    useEffect(()=>{
        if(isLoaded && isSignedIn && user){ // Fixed condition
            loadHabits();
        }
    },[isLoaded,isSignedIn,user,loadHabits]); // Fixed dependencies

    const handleCompleteHabit=async (habitId)=>{
        try{
            await habitAPI.completeHabit(habitId);
            loadHabits();
        }
        catch(error){
            console.error("Error completing habit:",error);
        }
    };

    const handleDeleteHabit=async (habitId)=>{
        if(window.confirm("Are you sure you want to delete this habit?")){
            try{
                await habitAPI.deleteHabit(habitId);
                loadHabits();
            }
            catch(error){
                console.error("Error deleting habit:",error);
            }
        }
    };

    if(!isLoaded){
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if(!isSignedIn){ // Fixed condition
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Please sign in to access your habits.</p>
            </div>
        );
    }

    return (
        <div className="habit-builder bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">🎯 Habit Builder</h1> {/* Fixed CSS class */}
                    <p className="text-lg text-gray-600 mb-6">
                        Build positive habits, one day at a time. Small consistent actions create lasting change.
                    </p>
                </div>

                {/* Stats Overview */}
                <HabitStats habits={habits} streaks={streaks}/>

                {/* Create Habit Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Your Habits</h2>
                        <button 
                        onClick={()=> setShowCreateForm(!showCreateForm)}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                            {showCreateForm?'Cancel':'+ Add New Habit'}
                        </button>
                    </div>

                    {showCreateForm && (
                        <CreateHabitForm
                        templates={habitTemplates}
                        onHabitCreated={()=>{
                            setShowCreateForm(false);
                            loadHabits();
                        }}
                        onCancel={()=>setShowCreateForm(false)}
                        />
                    )}
                </div>

                {/* Habits Grid */}
                {loading ?(
                    <LoadingSpinner/>
                ):habits.length===0?( // Fixed comparison operator
                    <EmptyState onCreateHabit={()=> setShowCreateForm(true)}/>
                ):(
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {habits.map((habit)=>(
                            <HabitCard
                            key={habit.id}
                            habit={habit}
                            streak={streaks[habit.id] || 0}
                            categoryColors={categoryColors}
                            onComplete={()=>handleCompleteHabit(habit.id)}
                            onDelete={()=>handleDeleteHabit(habit.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

//Habit Stats Component
const HabitStats=({habits,streaks})=>{
    const totalHabits=habits.length;
    const completedToday=habits.filter(habit=>{
        const today=new Date().toDateString();
        return habit.last_completed && new Date(habit.last_completed).toDateString()===today; // Fixed missing ()
    }).length;
    const averageStreak=Object.values(streaks).length>0 ? Math.round(Object.values(streaks).reduce((a,b)=> a+b,0)/Object.values(streaks).length):0;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalHabits}</div>
                <div className="text-gray-600">Active Habits</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="text-3xl font-bold text-green-600 mb-2">{completedToday}</div>
                <div className="text-gray-600">Completed Today</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">{averageStreak}</div>
                <div className="text-gray-600">Average Streak</div>
            </div>
        </div>
    );
};

// Create Habit Form Component
const CreateHabitForm = ({ templates, onHabitCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    targetFrequency: 'daily'
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);


  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      category: template.category,
      targetFrequency: 'daily'
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await habitAPI.createHabit(formData);
      if (response.success) {
        onHabitCreated();
        setFormData({ title: '', description: '', category: 'general', targetFrequency: 'daily' });
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };


  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
      <h3 className="text-xl font-bold mb-4">Create New Habit</h3>
      
      {/* Habit Templates */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Choose a template or create custom:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateSelect(template)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedTemplate === template
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{template.icon}</div>
              <div className="font-medium text-sm">{template.title}</div>
            </button>
          ))}
        </div>
      </div>


      {/* Custom Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Habit Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Morning Meditation"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mindfulness">Mindfulness</option>
              <option value="health">Health</option>
              <option value="reflection">Reflection</option>
              <option value="movement">Movement</option>
              <option value="learning">Learning</option>
              <option value="wellness">Wellness</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your habit..."
            rows="3"
          />
        </div>


        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Create Habit
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Habit Card Component
const HabitCard = ({ habit, streak, categoryColors, onComplete, onDelete }) => {
  const today = new Date().toDateString();
  const isCompletedToday = habit.last_completed && 
    new Date(habit.last_completed).toDateString() === today;

  const getCategoryIcon = (category) => {
    const icons = {
      mindfulness: "🧘‍♂️",
      health: "💧",
      reflection: "📝",
      movement: "🚶‍♂️",
      learning: "📚",
      wellness: "🌬️",
      general: "⭐"
    };
    return icons[category] || "⭐";
  };

  return (
    <div className={`bg-gradient-to-br ${categoryColors[habit.category] || categoryColors.general} rounded-xl p-6 shadow-md border-2 transition-all hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div className="text-3xl">{getCategoryIcon(habit.category)}</div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          ❌
        </button>
      </div>
      
      <h3 className="font-bold text-lg mb-2 text-gray-800">{habit.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{habit.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{streak}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{habit.total_completions || 0}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>

      <button
        onClick={onComplete}
        disabled={isCompletedToday}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          isCompletedToday
            ? 'bg-green-500 text-white cursor-not-allowed'
            : 'bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-300'
        }`}
      >
        {isCompletedToday ? '✅ Completed Today!' : 'Mark Complete'}
      </button>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onCreateHabit }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">🎯</div>
    <h3 className="text-xl font-bold mb-2">No habits yet!</h3>
    <p className="text-gray-600 mb-6">Start building positive habits to improve your mental wellness.</p>
    <button
      onClick={onCreateHabit}
      className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
    >
      Create Your First Habit
    </button>
  </div>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <span className="ml-4 text-gray-600">Loading your habits...</span>
  </div>
);

export default HabitBuilder;
