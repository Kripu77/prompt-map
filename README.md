<p><a target="_blank" href="https://app.eraser.io/workspace/VBerKlfIpGuU7BHlnU2q" id="edit-in-eraser-github-link"><img alt="Edit in Eraser" src="https://firebasestorage.googleapis.com/v0/b/second-petal-295822.appspot.com/o/images%2Fgithub%2FOpen%20in%20Eraser.svg?alt=media&amp;token=968381c8-a7e7-472a-8ed6-4a6626da5501"></a></p>

# PromptMap
A powerful AI-powered mind mapping tool that transforms text prompts into beautifully organized visual mind maps.

![PromptMap Demo](https://example.com/promptmap-demo.gif "")

## 🌟 Features for Your Demo Video
### Core Functionality
1. **AI-Powered Mind Map Generation**
    - Enter any topic or concept to instantly generate a comprehensive mind map
    - Follow-up prompts to expand specific branches
    - Smart topic detection that warns about topic shifts
2. **Interactive Mind Map Visualization**
    - Zoom in/out with intuitive controls
    - Drag to pan across the map
    - Auto-center to best fit content
    - Fullscreen mode for presentations
3. **User Authentication**
    - Secure sign-in with email or social providers
    - Personalized experience with saved mindmaps
    - Automatic sidebar opening upon login for improved UX
Core Idea of Atomic Habits
Stranger Things Netflix Series
How to get better at Data Structure and Algorithms
Must know Grammar rules
How to become a data scientist

### UI/UX Highlights
1. **Responsive Design**
    - Seamless experience across desktop and mobile devices
    - Custom mobile controls for touch interaction
    - Pinch-to-zoom and drag functionality on mobile
    - Automatic UI adjustments based on screen size
2. **Draggable Toolbar**
    - Customizable positioning for the mindmap toolbar
    - Comprehensive controls (zoom, export, fullscreen)
    - First-time user hints and tooltips
3. **Sidebar Management**
    - Custom sidebar toggle icon for elegant UI
    - List of saved mindmaps organized by date
    - Quick access to previously created content
### Data Management
1. **Save & Export Functionality**
    - Save mindmaps to your account
    - Export as PNG with one click
    - Automatic title extraction from content
    - Date-based organization of saved content
2. **Thread Management**
    - View all your mindmaps in the sidebar
    - Delete unwanted maps
    - Load saved maps with a single click
    - Chronological organization (Today, Yesterday, etc.)
### User Guidance
1. **Interactive Onboarding Guide**
    - Step-by-step walkthrough for new users
    - Tooltips that highlight key features
    - Mobile-optimized guidance
    - Progress tracking across sessions
2. **Theme Support**
    - Light and dark mode
    - Automatic system preference detection
    - Seamless theme switching
## 📹 Demo Video Scenarios
Here are specific scenarios to showcase in your product demo video:

### Scenario 1: First-time User Experience
1. Open PromptMap for the first time
2. Experience the onboarding guide tooltips
3. See the welcome hint on draggable toolbar
4. Enter your first prompt: "Artificial Intelligence"
5. Watch the mind map generate in real-time
### Scenario 2: Mind Map Interaction
1. Use toolbar to zoom in/out
2. Drag the map to explore different branches
3. Use fullscreen for presentation mode
4. Show mobile pinch and zoom functionality
5. Demonstrate dragging the toolbar to preferred position
### Scenario 3: User Authentication & Saving
1. Sign in to your account
2. Notice sidebar auto-opening with your content
3. Generate a new mind map
4. Save it with a custom title
5. Show how it appears in the sidebar organized by date
### Scenario 4: Advanced Features
1. Load a previously saved mind map
2. Export it as PNG
3. Toggle between light and dark modes
4. Send a follow-up prompt to expand a specific branch
5. Demonstrate mobile-responsive UI changes
### Scenario 5: Data Management
1. View all saved mindmaps in sidebar
2. Show date grouping functionality
3. Delete a mindmap
4. Generate and save a new one
5. Show the automatic sidebar updates
## 🚀 Technical Highlights
- **Next.js**: Server-side rendering for optimal performance
- **Markmap Library**: Powerful mind map visualization
- **Mobile Touch Gestures**: Hammer.js for touch interactions
- **Responsive UI**: Tailwind CSS for elegant responsive design
- **Authentication**: NextAuth.js for secure user management
- **Database**: PostgreSQL with Drizzle ORM for data storage
- **Animations**: Framer Motion for smooth transitions
- **Analytics**: Anonymous usage tracking for non-signed in users
## 🎯 Key Demo Points
- **Visual Appeal**: Highlight the elegant UI transitions and animations
- **Ease of Use**: Demonstrate how quickly users can generate useful content
- **Responsiveness**: Show the app working seamlessly on different devices
- **Personalization**: Emphasize saved content and theme preferences
- **Professional Output**: Showcase the high-quality exportable mind maps
## 🤝 Getting Started
```bash
# Clone the repository
git clone https://github.com/yourusername/prompt-map.git

# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials and API keys

# Apply database migrations (includes anonymous data collection table)
npx drizzle-kit push

# Start the development server
npm run dev
```
Visit `http://localhost:3000` to see PromptMap in action.

## 📊 Anonymous Data Collection
PromptMap includes an optional feature to collect anonymous data from non-signed-in users for analytics and reporting purposes:

- Data is stored in a separate `anonymous_mindmap`  table
- Collection includes:
    - Generated mindmap content
    - Original prompt used
    - Session ID (stored in localStorage)
    - Basic browser information
    - No personally identifiable information is collected
To apply the anonymous data collection migration:

```bash
# Apply the specific migration
psql -d your_database_name -f lib/db/migrations/anonymous_mindmaps.sql
```
## 📄 License
[﻿MIT](LICENSE) 


<!-- eraser-additional-content -->
## Diagrams
<!-- eraser-additional-files -->
<a href="/README-PromptMap Flow Chart-1.eraserdiagram" data-element-id="ZCAsPa33dg0JAv7qadzEy"><img src="/.eraser/VBerKlfIpGuU7BHlnU2q___0mOUOxvhUSWTRvbgkucXOGcymMO2___---diagram----e7d962ed200e20f501195b80a5c35648-PromptMap-Flow-Chart.png" alt="" data-element-id="ZCAsPa33dg0JAv7qadzEy" /></a>
<a href="/README-PromptMap Feature Mind Map-2.eraserdiagram" data-element-id="wZ2EMKRJPmlG4g-s9Zj9A"><img src="/.eraser/VBerKlfIpGuU7BHlnU2q___0mOUOxvhUSWTRvbgkucXOGcymMO2___---diagram----2a9e68c4062686d628ce820163f3359f-PromptMap-Feature-Mind-Map.png" alt="" data-element-id="wZ2EMKRJPmlG4g-s9Zj9A" /></a>
<!-- end-eraser-additional-files -->
<!-- end-eraser-additional-content -->
<!--- Eraser file: https://app.eraser.io/workspace/VBerKlfIpGuU7BHlnU2q --->