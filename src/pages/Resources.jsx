import React,{useState,useEffect} from 'react'
import { searchYoutubeVideos } from '../api/youtubeSearch';
const Resources = () => {

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredVideos,setFeaturedVideos]=useState([]);
  const [categoryVideos,setCategoryVideos]=useState({});
  const [searchResults,setSearchResults]=useState([]);
  const [searchTerm,setSearchTerm]=useState("");
  const [loading,setLoading]=useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);


  const defResourcesCategories=[
    {
      id:"stress-anxiety",
      title:"Stress and Anxiety Relief",
      description:"Calming techniques and anxiety management",
      icon:"😰",
      searchQueries:[
        "stress relief meditation",
        "anxiety breathing exercises",
        "calming music for stress"
      ],
      color:"from-blue-100 to-blue-300",
    },
    {
      id:"mindfulness",
      title:"Mindfull & Meditation",
      description:"Present moment awareness and meditation practices",
      icon:"🧘‍♂️",
      searchQueries:[
        "mindfulness meditation",
        "guided meditation for stress",
        "mindfulness exercises",
        "daily mindfulness tips"
      ],
      color:"from-green-100 to-green-300",
    },
    {
      id:"self-care",
      title:"Self-Care & Wellness",
      description:"Daily practices for mental wellness",
      icon:"💆‍♀️",
      searchQueries:[
        "self-care routines",
        "self-care tips for anxiety",
        "mental health tips",
        "wellness practices",
      ],
      color:"from-pink-100 to-pink-300",
    },
    {
      id:"mood-boost",
      title:"Mood Enhancement",
      description:"Activities to boost your mood",
      icon:"😊",
      searchQueries:[
        "uplifting music",
        "mood boosting activities",
        "positive affirmations",
        "motivational videos"
      ],
      color:"from-yellow-100 to-yellow-300",
    },
    {
      id:"sleep-relaxation",
      title:"Sleep & Relaxation",
      description:"Techniques for better sleep and relaxation",
      icon:"😴",
      searchQueries:[
        "sleep meditation",
        "bedtime relaxation",
        "calming sleep music",
        "guided sleep meditation"
      ],
      color:"from-purple-100 to-purple-300",
    },
    {
      id:"crisis-support",
      title:"Crisis Support",
      description:"Resources for immediate help in crisis",
      icon:"🚨",
      searchQueries:[
        "crisis support techniques",
        "mental health emergency help",
        "grounding exercises for crisis",
        "crisis management tips"
      ],
      color:"from-red-100 to-red-300",
    }
  ];

  useEffect(()=>{
    loadFeaturedContent();
  },[]);

  const loadFeaturedContent=async ()=>{
    setLoading(true);
    try{
      const featuredQueries=[
        'mental health wellness tips',
        'meditation for beginners',
        'positive mental health',
        'wellness motivation'
      ];

      const randomQuery=featuredQueries[Math.floor(Math.random()*featuredQueries.length)];
      const result=await searchYoutubeVideos(randomQuery,6);
      if(result.success){
        setFeaturedVideos(result.videos);
      }
    }
    catch(error){
      console.error("Error loading featured content:", error);
    }
    finally{
      setLoading(false);
    }
  };

  const loadCategoryVideos=async (category) =>{
    setLoading(true);
    try{
      const categoryData=defResourcesCategories.find(cat=>cat.id===category);
      if(categoryData){
        const randomQuery=categoryData.searchQueries[Math.floor(Math.random()*categoryData.searchQueries.length)];
        const result=await searchYoutubeVideos(randomQuery,6);
        if(result.success){
          setCategoryVideos(prev=>({
            ...prev,
            [category]: result.videos
          }));
        }
      }
    }
    catch(error){
      console.error("Error loading category videos:",error);
    }
    finally{
      setLoading(false);
    }
  };

  const handleSearch=async (query)=>{
    if(!query.trim()) return;
    setLoading(true);
    setSearchTerm(query);
    try{
      const result=await searchYoutubeVideos(query,12);
      if(result.success){
        setSearchResults(result.videos);
        setSelectedCategory('search');
      }
    }
    catch(error){
      console.error("Search error:",error);
    }
    finally{
      setLoading(false);
    }
  };
  
  const handleCategoryClick=(categoryId)=>{
    setSelectedCategory(categoryId);
    if(categoryId!=="all" && categoryId!=="search" && !categoryVideos[categoryId]){
      loadCategoryVideos(categoryId);
    }
  };

  return (
    <>
    <div className='flex justify-center'>
      <img className="w-full" src="Screenshot 2025-07-27 153851.png" alt="" />
    </div>
    <div className='wellness-resources bg-amber-50 min-h-screen'>
      <div className='hero-section bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg mb-8 mx-4 mt-4'>
        <h1 className='text-4xl font-bold text-center mb-4 text-green-600'>
          Wellness Resources
        </h1>
        <p className='text-center text-gray-600 mb-6 text-lg'>
          Discover mental health resources, meditation guides, and wellness content to support your journey
        </p>
        {/* Search Bar */}
        <div className='max-w-2xl mx-auto mb-6'>
          <div className='flex gap-2'>
            <input 
            type="text"
            placeholder='Search for wellness content...'
            className='flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' 
            value={searchTerm}
            onChange={(e)=> setSearchTerm(e.target.value)}
            onKeyDown={(e)=>e.key==="Enter" && handleSearch(searchTerm)}
            />
            <button
            onClick={()=>handleSearch(searchTerm)}
            className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            disabled={loading}
            >
              {loading?"Searching...":"Search"}
            </button>
          </div>
          {/*Popular Searches */}
          <div className='mt-3'>
            <p className='text-sm text-gray-600 mb-2'>
              Popular Searches:
            </p>
            <div className='flex flex-wrap gap-2 justify-center'>
              {["meditation for beginners","anxiety relief","sleep music","motivational videos","breathing exercises"].map(search=>(
                <button
                key={search}
                onClick={()=>handleSearch(search)}
                className='px-3 py-1 bg-white text-gray-700 rounded-full text-sm hover:bg-gray-100 shadow-sm transition-colors'
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/*CTA for mood analysis */}
        <div className='text-center'>
        <a href="/sentimentalanalysis" className='bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 mr-4 inline-block transition-colors'>
        Get Personalized recommendations
        </a>
        <span className='text-gray-500'>or browse categories below</span>
        
        </div>
      </div>
      <CrisisResources />

      {/* Categories Section */}
      <div className='categories-section mb-12 mx-4'>
        <h2 className='text-2xl font-bold text-center mb-6 text-gray-800'>
          Explore Categories
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {defResourcesCategories.map(category=>(
            <CategoryCard 
             key={category.id}
             category={category}
             isSelected={selectedCategory===category.id}
             onClick={()=>handleCategoryClick(category.id)}
             />
          ))}
        </div>
      </div>
      {/*Content display */}
      {selectedCategory==="all" &&(
        <FeaturedContent
        videos={featuredVideos}
        playingVideo={playingVideo}
        setPlayingVideo={setPlayingVideo}
        loading={loading} 
        />
      )}

      {selectedCategory==="search" && (
        <SearchResults
        videos={searchResults}
        searchTerm={searchTerm}
        playingVideo={playingVideo}
        setPlayingVideo={setPlayingVideo}
        loading={loading} />
      )}
      {selectedCategory!=="all" && selectedCategory!=="search" && (
        <CategoryContent
        category={defResourcesCategories.find(cat=>cat.id===selectedCategory)}
        videos={categoryVideos[selectedCategory] || []}
        playingVideo={playingVideo}
        setPlayingVideo={setPlayingVideo}
        loading={loading} 
        />
      )}
    </div>
    </>
    
  );
};

// Crisis Resources Component
const CrisisResources=()=>(
  <div className='crisis-resources bg-red-50 border-2 border-red-200 p-6 rounded-lg mb-8 mx-4'>
    <h3 className='text-red-800 font-bold text-xl mb-4 text-center'>
      🆘 Need Immediate Help?
    </h3>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='text-center bg-white p-4 rounded-lg shadow-sm'>
        <div className='font-bold text-red-700 mb-1'>
          Crisis Hotline
        </div>
        <div className='text-3xl font-bold text-red-600'>
          988
        </div>
        <div className='text-sm text-gray-600'>
          24/7 Support Available
        </div>

      </div>
      <div className='text-center bg-white p-4 rounded-lg shadow-sm'>
        <div className='font-bold text-red-600'>
          Emergency Helpline Services
        </div>
        <div className='text-3xl font-bold text-red-600'>
          911
        </div>
        <div className='text-sm text-gray-600'>
          Life threatening emergencies
        </div>

      </div>

    </div>

  </div>
);

const CategoryCard=({category,isSelected,onClick})=>(
  <div className={`category-card bg-gradient-to-br ${category.color} p-4 rounded-lg cursor-pointer transition-transform transform hover:scale-105 ${isSelected ? 'ring-4 ring-blue-300' : ''}`}
  onClick={onClick}
  >
    <div className='text-5xl mb-3 text-center text-gray-800'>
      {category.icon}
    </div>
    <h3 className='font-bold text-lg text-gray-800 mb-2 text-center'>
      {category.title}
    </h3>
    <p className='text-gray-600 text-sm text-center'>
      {category.description}
    </p>

  </div>
);
const FeaturedContent=({videos,playingVideo,setPlayingVideo,loading})=>(
  <div className='featured-content mb-12 mx-4'>
    <h2 className='text-2xl font-bold text-center mb-6 text-gray-800'>
      ✨ Featured Wellness Content
    </h2>
    {loading ? (
      <LoadingSpinner />
    ):(<VideoGrid
    videos={videos}
    playingVideo={playingVideo}
    setPlayingVideo={setPlayingVideo}
     />
    )}
  </div>
)

const SearchResults=({videos,searchTerm,playingVideo,setPlayingVideo,loading})=>(
  <div className='search-results mb-12 mx-4'>
    <h2 className='text-center font-semibold text-2xl mb-2 text-gray-800'>
      Search Results
    </h2>
    <p className='text-center text-gray-600 mb-6'>
      Showing results for:<em>"{searchTerm}"</em>
    </p>
    {loading ? (
      <LoadingSpinner/>
    ):(
      <VideoGrid
      videos={videos}
      playingVideo={playingVideo}
      setPlayingVideo={setPlayingVideo}
     />
    )}
    
  </div>
  
)
const CategoryContent = ({ category, videos, playingVideo, setPlayingVideo, loading }) => (
  <div className="category-content mb-12 mx-4">
    <div className="text-center mb-6">
      <div className="text-6xl mb-2">{category?.icon}</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-800">{category?.title}</h2>
      <p className="text-gray-600">{category?.description}</p>
    </div>
    {loading ? (
      <LoadingSpinner />
    ) : (
      <VideoGrid 
        videos={videos}
        playingVideo={playingVideo}
        setPlayingVideo={setPlayingVideo}
      />
    )}
  </div>
)


const VideoGrid=({videos,playingVideo,setPlayingVideo})=>(
  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
    {videos.map((video)=>(
      <div key={video.id} className='video-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow'>
        {playingVideo===video.id ? (
          <div className='aspect-w-16 aspect-h-9'>
            <iframe 
            className='w-full h-48 border-none'
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen>
            </iframe>
          </div>
        ):(
          <div 
          className='relative cursor-pointer group'
          onClick={()=> setPlayingVideo(video.id)}
          >
            <img 
            src={video.thumbnail} 
            alt={video.title}
            className='w-full h-48 object-cover group-hover:opacity-90 transition-opacity' 
            />
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all'>
              <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg'>
                <span className='text-white text-2xl ml-1'>
                  ▶
                </span>

              </div>

            </div>

          </div>
        )}
        <div className='p-4'>
          <h4 className='font-semibold text-sm mb-2 line-clamp-2 text-gray-800'>
            {video.title}
          </h4>
          <p className='text-xs text-gray-600 mb-1'>
            {video.channelTitle}
          </p>
          <p className='text-xs text-gray-500 line-clamp-2'>
            {video.description}
          </p>

        </div>

      </div>
    ))}

  </div>
  
);
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <span className="ml-4 text-gray-600">Loading wellness content...</span>
  </div>
);

export default Resources
