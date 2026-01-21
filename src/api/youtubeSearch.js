const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const url = "https://www.googleapis.com/youtube/v3/search";

export const searchYoutubeVideos = async (searchQuery, maxResults = 6) => {
    try {
        if (!YOUTUBE_API_KEY) {
            throw new Error("YouTube API key is not configured");
        }

        console.log('Making API call with key:', YOUTUBE_API_KEY ? 'Key exists' : 'No key');
        
        const response = await fetch(
            `${url}?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&order=relevance&safeSearch=strict`
        );
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error Response:', errorData);
            throw new Error(`YouTube API error: ${response.status} - ${errorData}`);
        }
        
        const data = await response.json();
        console.log('YouTube API Response:', data); // Debug log
        
        // Check if data.items exists and is an array
        if (!data.items || !Array.isArray(data.items)) {
            console.error('Invalid API response structure:', data);
            throw new Error('Invalid response from YouTube API');
        }

        return {
            success: true,
            videos: data.items.map(item => {
                // Add safety checks for each property
                if (!item.id || !item.id.videoId || !item.snippet) {
                    console.warn('Invalid item structure:', item);
                    return null;
                }
                
                return {
                    id: item.id.videoId,
                    title: item.snippet.title || 'No title',
                    description: item.snippet.description || 'No description',
                    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
                    channelTitle: item.snippet.channelTitle || 'Unknown channel',
                    publishedAt: item.snippet.publishedAt || new Date().toISOString()
                };
            }).filter(item => item !== null) // Remove null items
        };
    }
    catch (error) {
        console.error("YouTube API error:", error);
        return {
            success: false,
            error: error.message,
            videos: []
        }
    }
}
