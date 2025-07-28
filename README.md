# PromptMap

An AI-powered mind mapping tool that transforms text prompts into organized visual mind maps.

## Features

### Core Functionality
- **AI-Powered Mind Map Generation**: Generate comprehensive mind maps from any topic or concept
- **Interactive Visualization**: Zoom, pan, auto-center, and fullscreen mode
- **User Authentication**: Secure sign-in with personalized experience
- **Save & Export**: Save mindmaps to your account and export as PNG
- **Thread Management**: Organize and access saved mindmaps chronologically

### User Experience
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Draggable Toolbar**: Customizable positioning with comprehensive controls
- **Interactive Onboarding**: Step-by-step walkthrough for new users
- **Theme Support**: Light and dark mode with automatic system detection

## Technical Stack
- **Next.js**: Server-side rendering for optimal performance
- **Markmap Library**: Mind map visualization
- **Hammer.js**: Mobile touch gestures
- **Tailwind CSS**: Responsive design
- **NextAuth.js**: User authentication
- **PostgreSQL**: Database with Drizzle ORM
- **Framer Motion**: Smooth animations
## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/prompt-map.git

# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials and API keys

# Apply database migrations
npx drizzle-kit push

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see PromptMap in action.

### Web Search Configuration (Optional)

PromptMap includes a web search feature for current information on topics like weather and current events.

To enable web search:
1. Sign up for an [Exa API key](https://exa.ai/)
2. Add your API key to `.env.local`:
   ```
   EXA_API_KEY=your_exa_api_key_here
   ```

**Note**: Without the EXA_API_KEY, the AI will still generate mindmaps but won't fetch current information.

## Anonymous Data Collection

PromptMap includes optional anonymous data collection from non-signed-in users:

- Data is stored in a separate `anonymous_mindmap` table
- Includes generated mindmap content, original prompt, session ID, and basic browser information
- No personally identifiable information is collected

To apply the anonymous data collection migration:

```bash
psql -d your_database_name -f lib/db/migrations/anonymous_mindmaps.sql
```

## License

[MIT](LICENSE)