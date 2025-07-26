const API_URL='http://localhost:3001/api';


export const analyzeSentiment=async (text)=>{
    try{
        const response=await fetch(`${API_URL}/sentiment/analyze`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({text})
        });

        const data=await response.json();

        if(!response.ok){
            throw new Error(data.error || 'Failed to analyze sentiment');
        }
        return data;
    }
    catch(error){
        throw new Error(error.message || 'Network error');
    }
};