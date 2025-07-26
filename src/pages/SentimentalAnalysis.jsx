import React from 'react'
import { useState,useEffect,useCallback } from 'react'
import { analyzeSentiment } from '../api/sentiment'
import { useAuth } from '@clerk/clerk-react';

const SentimentalAnalysis = () => {
  const [inputText,setInputText] = useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [showDetails,setShowDetails]=useState(false);
  const [history,setHistory]=useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const {getToken} = useAuth();

  const toggleHistoryItem=(id)=>{
    setExpandedItems(prev=>({
      ...prev,
      [id]:!prev[id]
    }))
  }

  
  const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


  const fetchHistory=useCallback(async ()=>{
    try{
      const token = await getToken();
      const response=await fetch('http://localhost:3001/api/sentiment/history', {
        headers:{
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if(response.ok){
        const data=await response.json();
        setHistory(data.analyses || []);
      }
      else{
        console.error("Failed to fetch history");
      }
    }
    catch(error){
      console.error("Error fetching history:",error);
    }
  },[getToken]);

    useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveAnalysis=async (inputText,result,description)=>{
    try{
      const token = await getToken();
      const response = await fetch('http://localhost:3001/api/sentiment/save', {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          inputText:inputText,
          result: result,
          description: description,
        }),
      });
      if(response.ok){
        const data = await response.json();
        console.log("Analysis saved successfully:", data);
        fetchHistory();
      }
      else{
        const errorData = await response.json();
        console.error('Failed to save analysis:', errorData.error);
        setError('Failed to save analysis');
      }
    }
    catch(error){
      console.error('Error saving analysis:', error);
      setError('Error saving analysis');
    }
    
  };
  



  const handleAnalyze=async ()=>{
    if(!inputText.trim()){
      setError('Please enter some text');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setShowDetails(false);

    try{
      const response=await analyzeSentiment(inputText);
      if(response.success){
        setResult(response.data);

        if (response.data?.[0]?.emotionalState?.description) {
          const description = response.data[0].emotionalState.description;
          await saveAnalysis(inputText, response.data, description);
        }
      }
      else{
        setError(response.error || "Analysis Failed");
      }
      

  
}
    catch(err){
      setError(err.message);
    }
    finally{
      setLoading(false);
    }
  };
 const description = result && result.length > 0 && result[0]?.emotionalState 
    ? result[0].emotionalState.description 
    : "Unable to determine";

const deleteAnalysis = async (id) => {
     try{
      const token = await getToken();
      const response= await fetch(`http://localhost:3001/api/sentiment/${id}`, {
        method:'DELETE',
        headers:{
          'Authorization': `Bearer ${token}`,
        },
      });
      if(response.ok){
        console.log("Analysis deleted successfully");
        fetchHistory();

      }
      else{
        const error= await response.json();
        console.error("Failed to delete analysis:", error.error);

      }

     }
     catch(error){
      console.error("Error deleting analysis:", error);
     }
  }

  

  
  return (
    <div className='bg-amber-100'>
      <h1 className='text-4xl justify-center text-green-300 text-center pt-10'>Mood Tracker</h1>      
      <p className='pt-6 text-center pb-6'>Analyze your by just telling us how you are feeing today</p>

      <div className='justify-center text-center'>
        <textarea 
        className='justify-center border-2'
        value={inputText} 
        onChange={(e)=>{setInputText(e.target.value)}}
        placeholder='Enter text to analyze'
        rows="4"
        cols="50"
        disabled={loading}
        />
        
      </div>
      <div className='text-center justify-center'> 
        <button className="bg-blue-300 text-center justify-center rounded-xl h" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red' }}>
          Error: {typeof error === 'string' ? error : 'An error occurred'}
        </div>
      )}
      
     {result && (
        <div>
          <h3>Analysis Result:</h3>
          <h4>Your mood is {description}</h4>
          <button className='bg-blue-400 rounded-xl text-center' onClick={()=>{
            setShowDetails(!showDetails);
          }}>
            {showDetails ? 'Hide Details' : 'More Details'}
          </button>

         {showDetails && (
              <div className='bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto'>
                <h4 className='font-semibold text-gray-800 mb-3'>Detailed Analysis:</h4>
                <pre className='text-xs text-gray-600 whitespace-pre-wrap'>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
        </div>
      )}
      <div className='mt-8 mx-4 pb-8'>
        <h2 className='text-3xl font-bold text-center mb-6 text-green-600'>Analysis History</h2>
        
        {history.length === 0 ? (
          <div className='text-center bg-white rounded-lg shadow-md p-8 mx-auto max-w-md'>
            <div className='text-gray-500 text-6xl mb-4'>📊</div>
            <p className='text-gray-600 text-lg'>No previous analyses found.</p>
            <p className='text-gray-400 text-sm mt-2'>Your analysis history will appear here after you run your first sentiment analysis.</p>
          </div>
        ) : (
          <div className='max-w-4xl mx-auto space-y-4'>
            {history.map((analysis) => (
              <div 
                key={analysis.id}
                className='bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    {/* Header with result and date */}
                    <div className='flex items-center gap-3 mb-3'>
                      <span className='px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full font-bold text-sm'>
                        
            
            
                      </span>
                      <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                        {formatDate(analysis.createdAt)}
                      </span>
                    </div>
                    
                    {/* Input text */}
                    <div className='mb-3'>
                      <p className='text-gray-800 font-medium mb-1'>Input Text:</p>
                      <p className='text-gray-700 bg-gray-50 p-3 rounded-lg italic'>
                        "{analysis.inputText.length > 150 
                          ? analysis.inputText.substring(0, 150) + "..." 
                          : analysis.inputText}"
                      </p>
                    </div>

                    {/* Description if available */}
                    {analysis.description && (
                      <div className='mb-3'>
                        <p className='text-gray-800 font-medium mb-1'>Analysis Description:</p>
                        <p className='text-sm text-gray-600 bg-blue-50 p-3 rounded-lg'>
                          {analysis.description}
                        </p>
                      </div>
                    )}
                    
                  </div>
                  {/* Toggle button */}
                  <button
                    className='text-blue-600 hover:underline mb-2'
                    onClick={() => toggleHistoryItem(analysis.id)}
                  >
                   {expandedItems[analysis.id] ? 'Hide Details' : 'More Details'}
               </button>
                  {expandedItems[analysis.id] && (
                    <div className='bg-gray-50 rounded p-4 overflow-auto max-h-64'>
                      <pre className='text-xs text-gray-800 whitespace-pre-wrap'>
                        {JSON.stringify(analysis.result, null, 2)}
                      </pre>
                    </div>
                  )}
                  {/* Delete button */}
                  <button
                    onClick={() => deleteAnalysis(analysis.id)}
                    className='ml-4 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium shadow-sm'
                    title="Delete this analysis"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Total count */}
        {history.length > 0 && (
          <div className='text-center mt-6'>
            <p className='text-gray-600 bg-white rounded-full px-4 py-2 inline-block shadow-sm'>
              Total Analyses: <span className='font-bold text-green-600'>{history.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SentimentalAnalysis
