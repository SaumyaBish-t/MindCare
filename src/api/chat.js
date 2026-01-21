const API_BASE_URL=import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function sendChatMessage(message,history=[]){
    const res=await fetch(`${API_BASE_URL}/api/chat`,{
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body:JSON.stringify({message,history})
    });

    if(!res.ok){
        const text=await res.text();
        throw new Error(text || "Failed to reach server");
    }
    const data=await res.json();
    return data;
}