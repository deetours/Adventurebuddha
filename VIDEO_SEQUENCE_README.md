# Video Sequence Feature for About Page Hero Section

## Overview
The About page hero section now supports multiple videos that play in sequence automatically, creating a dynamic and engaging background experience.

## How It Works
- **4 videos** play one after another in a continuous loop
- **Automatic transitions** when each video ends
- **Manual controls** allow users to switch between videos
- **Visual indicators** show which video is currently playing

## Video Sources
The component now uses external video URLs from Pixabay:

```
https://cdn.pixabay.com/video/2023/02/25/152203-802335648_large.mp4
https://cdn.pixabay.com/video/2024/05/31/214618_large.mp4
https://cdn.pixabay.com/video/2023/08/06/174860-852215326_large.mp4
https://cdn.pixabay.com/video/2023/04/10/158229-816359520_large.mp4
```

## Features
- ✅ **Auto-play sequence**: Videos transition automatically
- ✅ **Manual navigation**: Click video indicators to jump to specific videos
- ✅ **Play/pause controls**: Standard video controls available on hover
- ✅ **Mute/unmute**: Audio controls for user preference
- ✅ **Responsive design**: Works on all screen sizes
- ✅ **Performance optimized**: Videos load efficiently

## Usage in Code
The VideoBackground component automatically handles the sequence:

```tsx
<VideoBackground
  videoSrcs={[
    "https://cdn.pixabay.com/video/2023/02/25/152203-802335648_large.mp4",
    "https://cdn.pixabay.com/video/2024/05/31/214618_large.mp4",
    "https://cdn.pixabay.com/video/2023/08/06/174860-852215326_large.mp4",
    "https://cdn.pixabay.com/video/2023/04/10/158229-816359520_large.mp4"
  ]}
  posterSrc="/images/about-hero-poster.jpg"
  title="About Adventure Buddha"
  subtitle="Crafting unforgettable journeys since 2009"
  ctaText="Explore Our Story"
  onCtaClick={() => scrollToStory()}
/>
```

## Adding More Videos
To add more videos to the sequence:
1. Add the video URL to the `videoSrcs` array in `AboutPage.tsx`
2. The component will automatically handle the additional videos

## Fallback
If videos fail to load, the component falls back to the poster image specified in `posterSrc`.