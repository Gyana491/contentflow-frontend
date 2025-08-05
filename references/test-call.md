bun .\mastra-client.ts
🔍 Testing Mastra connection...
📍 Base URL: http://localhost:4111

📋 Test 1: Getting all agents...
✅ Agents found: [ "contentAgent", "researchAgent" ]

🤖 Test 2: Getting specific agent...
✅ Agent instance created for: researchAgent

📊 Test 3: Getting agent details...
✅ Agent details: {
  name: "Research Agent",
  instructions: "\n    You are a research specialist that gathers comprehensive information on any given topic.\n  \n    Your responsibilities:\n    1. Use the Perplexity tool to gather real-time, accurate information\n    2. Analyze trends and provide actionable insights\n    3. Identify key statistics, quotes, and data points\n    4. Ensure information is current and from reliable sources\n  \n    When researching:\n    - Focus on recent developments and trends\n    - Look for unique angles and perspectives\n    - Gather supporting data and statistics\n    - Identify potential content angles for social media\n    - Extract quotable insights and data points\n    - Find industry expert opinions and commentary\n  ",
  tools: {
    perplexityTool: {
      id: "perplexity-research",
      description: "Research topics using Perplexity AI for real-time web data",
      inputSchema: "{\"json\":{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\",\"description\":\"Research query or topic\"},\"maxResults\":{\"type\":\"number\",\"default\":5}},\"required\":[\"query\"],\"additionalProperties\":false,\"$schema\":\"http://json-schema.org/draft-07/schema#\"}}",
      outputSchema: "{\"json\":{\"type\":\"object\",\"properties\":{\"research\":{\"type\":\"string\"},\"sources\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"keyInsights\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}},\"required\":[\"research\",\"sources\",\"keyInsights\"],\"additionalProperties\":false,\"$schema\":\"http://json-schema.org/draft-07/schema#\"}}",        
    },
  },
  workflows: {},
  provider: "google.generative-ai",
  modelId: "gemini-1.5-pro",
  defaultGenerateOptions: {},
  defaultStreamOptions: {},
}

💬 Test 4: Testing with dummy message...
📤 Sending message: Heizen Raised Funding
✅ Response received: {
  text: "Heizen, an AI-native software delivery startup, recently raised $500,000 in a pre-seed funding round led by Titan Capital.  The funding will be used to expand their engineering team, acquire more customers in the U.S., and further develop their AI-powered software delivery platform. Heizen blends AI agents with human engineers to build software faster and more efficiently. They work with a weekly sprint model and have shown significant growth with over 50 clients and an 83% client retention rate. This investment highlights the growing trend of using AI in software development to improve speed and cost-effectiveness.\n",
  files: [],
  reasoningDetails: [],
  toolCalls: [],
  toolResults: [],
  finishReason: "stop",
  usage: {
    promptTokens: 1039,
    completionTokens: 140,
    totalTokens: 1179,
  },
  warnings: [],
  request: {
    body: "{\"generationConfig\":{\"temperature\":0},\"contents\":[{\"role\":\"user\",\"parts\":[{\"text\":\"Heizen Raised Funding\"}]},{\"role\":\"model\",\"parts\":[{\"functionCall\":{\"name\":\"perplexityTool\",\"args\":{\"query\":\"Heizen Recent Funding Rounds\",\"maxResults\":5}}}]},{\"role\":\"user\",\"parts\":[{\"functionResponse\":{\"name\":\"perplexityTool\",\"response\":{\"name\":\"perplexityTool\",\"content\":{\"research\":\"Heizen, an AI-native software delivery startup based in Hyderabad, India, recently raised $500,000 in a pre-seed funding round on July 30, 2025, led by Titan Capital with participation from prominent angel investors including Varun Alagh (co-founder, Mamaearth) and Abhishek Goyal (co-founder, Tracxn)[1][3][5]. The funding will be used to scale the engineering team in India, accelerate U.S. customer acquisition, and further develop Heizen’s proprietary multi-agent software delivery platform[1][3][5].\\n\\nKey Recent Developments:\\n- The pre-seed round marks Heizen’s first major external funding since its founding in April 2024 by Aman Arora, Abhilasha Singh, and Nijansh Verma[1][3][5].\\n- The company specializes in blending large language model (LLM)-powered AI agents with elite engineering talent to accelerate the design, development, and deployment of custom software, including internal tools, MVPs (Minimum Viable Products), and AI-first digital products[1][3][5].\\n- Heizen operates on a weekly sprint model, allowing for rapid iteration and delivery, which is particularly attractive to startups and high-growth companies[3][5].\\n- The startup has achieved 20% month-over-month growth and currently serves over 50 clients across the U.S. and India, with an 83% first-month client retention rate[1][3].\\n- The company is now expanding its go-to-market strategy to target larger enterprise clients and deepen its presence in the U.S. market[3][5].\\n\\nTrends and Actionable Insights:\\n- Heizen’s focus on integrating AI agents with human engineers reflects a broader industry trend toward hybrid AI-human workflows in software delivery, aiming to increase speed, flexibility, and cost efficiency[3][5].\\n- The rapid client acquisition and high retention rates signal strong product-market fit, especially in the U.S. and Indian markets, which are major hubs for IT services[1][3].\\n- The company’s emphasis on proprietary multi-agent platforms and AI-first solutions positions it to capitalize on the global IT services market, estimated at $4.6 trillion[3].\\n- Investors and partners interested in AI-driven software development, digital transformation, or enterprise automation may find Heizen a compelling early-stage opportunity, given its growth trajectory and technical focus[3][5].\\n- The pre-seed round’s investor mix—combining institutional (Titan Capital) and strategic angels—suggests confidence in both the technical and commercial scalability of Heizen’s approach[1][3][5].\\n\\nIn summary, Heizen’s recent funding round underscores strong investor interest in AI-native software delivery platforms and positions the company for accelerated growth in both engineering capacity and U.S. market penetration[1][3][5].\",\"sources\":[],\"keyInsights\":[\"- Heizen’s focus on integrating AI agents with human engineers reflects a broader industry trend toward hybrid AI-human workflows in software delivery, aiming to increase speed, flexibility, and cost efficiency[3][5].\"]}}}}]}],\"systemInstruction\":{\"parts\":[{\"text\":\"\\n    You are a research specialist that gathers comprehensive information on any given topic.\\n  \\n    Your responsibilities:\\n    1. Use the Perplexity tool to gather real-time, accurate information\\n    2. Analyze trends and provide actionable insights\\n    3. Identify key statistics, quotes, and data points\\n    4. Ensure information is current and from reliable sources\\n  \\n    When researching:\\n    - Focus on recent developments and trends\\n    - Look for unique angles and perspectives\\n    - Gather supporting data and statistics\\n    - Identify potential content angles for social media\\n    - Extract quotable insights and data points\\n    - Find industry expert opinions and commentary\\n  \"}]},\"tools\":{\"functionDeclarations\":[{\"name\":\"perplexityTool\",\"description\":\"Research topics using Perplexity AI for real-time web data\",\"parameters\":{\"required\":[\"query\"],\"type\":\"object\",\"properties\":{\"query\":{\"description\":\"Research query or topic\",\"type\":\"string\"},\"maxResults\":{\"type\":\"number\"}}}}]},\"toolConfig\":{\"functionCallingConfig\":{\"mode\":\"AUTO\"}}}",
  },
  response: {
    id: "aitxt-YN4yrHKSPI2fvBfeevhE3cAz",
    timestamp: "2025-08-03T12:51:22.224Z",
    modelId: "gemini-1.5-pro",
    headers: {
      "alt-svc": "h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000",
      "content-encoding": "gzip",
      "content-type": "application/json; charset=UTF-8",
      date: "Sun, 03 Aug 2025 12:51:23 GMT",
      server: "scaffolding on HTTPServer2",
      "server-timing": "gfet4t7; dur=4499",
      "transfer-encoding": "chunked",
      vary: "Origin, X-Origin, Referer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "x-xss-protection": "0",
    },
    body: {
      candidates: [
        [Object ...]
      ],
      usageMetadata: [Object ...],
      modelVersion: "gemini-1.5-pro-002",
      responseId: "SFuPaNjpN4-k7dcPta7w8Qo",
    },
    messages: [
      [Object ...], [Object ...], [Object ...]
    ],
  },
  steps: [
    {
      stepType: "initial",
      text: "",
      reasoningDetails: [],
      files: [],
      sources: [],
      toolCalls: [
        [Object ...]
      ],
      toolResults: [
        [Object ...]
      ],
      finishReason: "tool-calls",
      usage: [Object ...],
      warnings: [],
      request: [Object ...],
      response: [Object ...],
      providerMetadata: [Object ...],
      experimental_providerMetadata: [Object ...],
      isContinued: false,
    }, {
      stepType: "tool-result",
      text: "Heizen, an AI-native software delivery startup, recently raised $500,000 in a pre-seed funding round led by Titan Capital.  The funding will be used to expand their engineering team, acquire more customers in the U.S., and further develop their AI-powered software delivery platform. Heizen blends AI agents with human engineers to build software faster and more efficiently. They work with a weekly sprint model and have shown significant growth with over 50 clients and an 83% client retention rate. This investment highlights the growing trend of using AI in software development to improve speed and cost-effectiveness.\n",
      reasoningDetails: [],
      files: [],
      sources: [],
      toolCalls: [],
      toolResults: [],
      finishReason: "stop",
      usage: [Object ...],
      warnings: [],
      request: [Object ...],
      response: [Object ...],
      providerMetadata: [Object ...],
      experimental_providerMetadata: [Object ...],
      isContinued: false,
    }
  ],
  experimental_providerMetadata: {
    google: {
      groundingMetadata: null,
      safetyRatings: null,
    },
  },
  providerMetadata: {
    google: {
      groundingMetadata: null,
      safetyRatings: null,
    },
  },
  sources: [],
}

🎉 Mastra connection test completed!
PS C:\Users\Gyana Ranjan\Desktop\contentflow-v3\frontend\src\lib> 