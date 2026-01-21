const API_BASE_URL="http://localhost:3001/api"

export const habitAPI={
    //Get all habits for the authenticated user
    async getHabits(){
        try{
            const response = await fetch(`${API_BASE_URL}/habits`,{
                method: 'GET',
                headers:{
                    "Content-Type":"application/json",
                },
                credentials: 'include',
            });
            if(!response.ok){
                throw new Error(`HTTP error! status:${response.status}`);
            }
            const data=await response.json();
            return data;
        }
        catch(error){
            console.error("Error fetching habits:",error);
            throw error;
        }
    },
    async createHabit(habitData){
        try{
            const response=await fetch(`${API_BASE_URL}/habits`,{
                method: 'POST',
                headers:{
                    "Content-Type":"application/json",
                },
                credentials:"include",
                body:JSON.stringify(habitData),
            });

            if(!response.ok){
                throw new Error(`HTTP error! status:${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch(error){
            console.error("Error creating habit:",error);
            throw error;
        }
    },
    async completeHabit(habitId){
        try{
            const response=await fetch(`${API_BASE_URL}/habits/${habitId}/complete`,{
                method: 'POST',
                headers:{
                    "Content-Type":"application/json",
                },
                credentials:"include",
            });
            if(!response.ok){
                throw new Error(`HTTP error! status:${response.status}`);
            }
            const data=await response.json();
            return data;
        }
        catch(error){
            console.error("Error completing habit:",error);
            throw error;
        }
    },
    async getHabitStreak(habitId){
        try{
            const response=await fetch(`${API_BASE_URL}/habits/${habitId}/streak`,{
                method: 'GET',
                headers:{
                    "Content-Type":"application/json",
                },
                credentials:"include",
            });

            if(!response.ok){
                throw new Error(`HTTP error! status:${response.status}`);
            }
            const data=await response.json();
            return data;
        }
        catch(error){
            console.error("Error getting habit streak:",error);
            throw error;
        }
    },
    async deleteHabit(habitId) {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },
};