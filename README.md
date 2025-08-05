# PostGenius - LinkedIn Post Generator

A Next.js application that generates viral LinkedIn posts using AI-powered workflows with Mastra.

## Features

- 🤖 **AI-Powered Content Generation**: Uses Mastra workflows to generate engaging LinkedIn posts
- 📝 **Customizable Content**: Choose content type, tone, and topics
- 📋 **Copy & Paste Ready**: Generated content is formatted for direct use on LinkedIn
- 🏷️ **Smart Hashtags**: Automatically generates relevant hashtags for better reach
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Generation**: Fast content generation with loading states

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: Shadcn/ui with Tailwind CSS
- **AI Workflows**: Mastra client-js SDK
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts          # API route for content generation
│   │   ├── dashboard/
│   │   │   ├── create/
│   │   │   │   └── page.tsx          # Content creation page
│   │   │   └── page.tsx              # Dashboard with workflow test
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── content-generation-form.tsx  # Main content generation form
│   │   ├── workflow-test.tsx            # Workflow testing component
│   │   └── ui/                          # Shadcn/ui components
│   └── lib/
│       ├── mastra-client.ts             # Mastra client configuration
│       ├── services/
│       │   └── content-service.ts       # Content generation service
│       └── hooks/
│           └── use-content-generation.ts # React hook for content generation
└── references/
    └── workflows.md                     # Workflow configuration reference
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Mastra server running on `http://localhost:4111`
- Content generation workflow named `contentGenerationWorkflow`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Generating LinkedIn Posts

1. Navigate to the Dashboard
2. Click "Create New Post" or use the "Generate AI Post" button
3. Enter your topic in the text area
4. Select content type and tone (optional)
5. Click "Generate Post"
6. Copy the generated content and hashtags
7. Paste directly to LinkedIn

### Testing Workflow Integration

1. Go to the Dashboard
2. Find the "Workflow Test" card in the sidebar
3. Click "Test Workflow" to verify the Mastra integration
4. Check the results for successful execution

## API Endpoints

### POST /api/generate

Generates LinkedIn content using the Mastra workflow.

**Request Body:**
```json
{
  "topic": "string (required)",
  "contentType": "article | trend | news | tutorial (optional)",
  "tone": "professional | casual | inspiring | informative (optional)",
  "scheduledTime": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "linkedinPost": "string",
    "hashtags": ["string"],
    "topic": "string"
  },
  "runId": "string"
}
```

## Mastra Workflow Integration

The application integrates with Mastra workflows for content generation:

- **Workflow Name**: `contentGenerationWorkflow`
- **Input Schema**: Topic, content type, tone, and scheduling options
- **Output Schema**: LinkedIn post content, hashtags, and topic
- **Steps**: Research topic and generate content

### Workflow Configuration

The workflow is configured in the Mastra server with the following structure:

```json
{
  "contentGenerationWorkflow": {
    "name": "content-generation-workflow",
    "description": "Complete workflow for researching and creating viral LinkedIn content",
    "inputSchema": {
      "topic": "string (required)",
      "contentType": "string (optional)",
      "tone": "string (optional)",
      "scheduledTime": "string (optional)"
    },
    "outputSchema": {
      "linkedinPost": "string",
      "hashtags": ["string"],
      "topic": "string"
    }
  }
}
```

## Development

### Adding New Features

1. **New Content Types**: Update the `ContentGenerationInput` interface in `content-service.ts`
2. **UI Components**: Add new components in the `components/` directory
3. **API Routes**: Create new routes in `app/api/`
4. **Hooks**: Add custom hooks in `lib/hooks/`

### Code Organization

- **Services**: Business logic and API calls
- **Hooks**: React state management and side effects
- **Components**: Reusable UI components
- **Pages**: Next.js page components
- **API Routes**: Server-side API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
