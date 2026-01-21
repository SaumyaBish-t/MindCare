export const getMoodSearchQueries = (primaryEmotion) => {
    const searchQueries={
        sad:[
            "uplifting music",
            "motivational videos for difficult times",
            "meditation for sadness",
            "self-care tips for sadness"
        ],

        anxious:[
            "anxiety relief techniques",
            "calming music for anxiety",
            "breathing exercises for anxiety",
            "stress management tips"
        ],

        anger:[
            "anger management techniques",
            "calming meditation",
            "peaceful music for calming anger",
            "conflict resolution strategies"
        ],

        happy:[
            "possitive affirmations",
            "gratitude exercises",
            "joyful music",
            "maintain positive mood"
        ],

        neutral:[
            "mindfulness exercises",
            "mental health awareness",
            "general wellness tips",
            "daily motivation"
        ]
    };
    return searchQueries[primaryEmotion?.toLowerCase()] || searchQueries.neutral;
};