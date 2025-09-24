// Utility functions to initialize chain prompting for different pages

export const initializeAboutPageChain = () => {
  return {
    page: "AboutPage",
    steps: [
      {
        id: "content_analysis",
        task: "Analyze existing about page content",
        prompt: "Analyze the current about page content and identify areas for improvement in terms of storytelling, value proposition clarity, and emotional connection with visitors. Focus on token efficiency."
      },
      {
        id: "value_proposition",
        task: "Enhance value proposition",
        prompt: "Based on the content analysis, rewrite the value proposition to be more compelling and concise. Keep it under 100 words."
      },
      {
        id: "story_structure",
        task: "Create improved story structure",
        prompt: "Develop a narrative structure that follows a hero's journey pattern: challenge -> solution -> transformation. Make it relatable to adventure travelers."
      }
    ]
  };
};

export const initializeContactPageChain = () => {
  return {
    page: "ContactPage",
    steps: [
      {
        id: "pain_points",
        task: "Identify customer pain points",
        prompt: "Analyze common customer inquiries and identify the top 5 pain points. Categorize them by frequency and impact."
      },
      {
        id: "faq_content",
        task: "Generate FAQ content",
        prompt: "Create concise, helpful FAQ entries for the identified pain points. Each answer should be under 50 words."
      },
      {
        id: "contact_form",
        task: "Optimize contact form fields",
        prompt: "Suggest optimal contact form fields that balance information gathering with user convenience. Prioritize essential fields only."
      }
    ]
  };
};

export const initializeBlogPageChain = () => {
  return {
    page: "BlogPage",
    steps: [
      {
        id: "topic_analysis",
        task: "Analyze popular travel topics",
        prompt: "Based on travel trends and Adventure Buddha's offerings, identify the top 10 blog topics that would engage readers and support SEO."
      },
      {
        id: "content_outline",
        task: "Create content outline",
        prompt: "For the topic 'Adventure Travel on a Budget', create a detailed content outline with headers, subheaders, and key points to cover."
      },
      {
        id: "seo_optimization",
        task: "Optimize for SEO",
        prompt: "Suggest 5 SEO-friendly titles and meta descriptions for a blog post about budget adventure travel. Include relevant keywords."
      }
    ]
  };
};

export const initializeTripDetailsPageChain = () => {
  return {
    page: "TripDetailsPage",
    steps: [
      {
        id: "itinerary_analysis",
        task: "Analyze trip itinerary",
        prompt: "Review the trip itinerary and identify opportunities to enhance the description with more sensory details and emotional appeal."
      },
      {
        id: "activity_highlight",
        task: "Highlight key activities",
        prompt: "For each day's activities, create compelling 25-word descriptions that emphasize the unique experience and adventure aspect."
      },
      {
        id: "safety_info",
        task: "Enhance safety information",
        prompt: "Rewrite safety information to be reassuring rather than alarming, focusing on Adventure Buddha's expertise and preparation measures."
      }
    ]
  };
};

export const initializeProfilePageChain = () => {
  return {
    page: "ProfilePage",
    steps: [
      {
        id: "user_journey",
        task: "Analyze user journey",
        prompt: "Map out the typical user journey on the profile page and identify friction points that could be improved for better engagement."
      },
      {
        id: "personalization",
        task: "Enhance personalization elements",
        prompt: "Suggest ways to make the profile page more personalized and engaging based on user travel history and preferences."
      },
      {
        id: "feature_promotion",
        task: "Promote relevant features",
        prompt: "Identify which Adventure Buddha features or upcoming trips should be highlighted to this specific user based on their profile."
      }
    ]
  };
};