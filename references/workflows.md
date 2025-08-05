bun .\mastra-client.ts
{
  "contentGenerationWorkflow": {
    "name": "content-generation-workflow",
    "description": "Complete workflow for researching and creating viral LinkedIn content",
    "steps": {
      "research-topic": "[Object ...]",
      "generate-content": "[Object ...]"
    },
    "allSteps": {
      "research-topic": "[Object ...]", 
      "generate-content": "[Object ...]"
    },
    "stepGraph": [
      "[Object ...]",
      "[Object ...]"
    ],
    "inputSchema": {
      "json": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "Topic to research and create content about"
          },
          "contentType": {
            "type": "string",
            "enum": ["article", "trend", "news", "tutorial"],
            "default": "article"
          },
          "tone": {
            "type": "string", 
            "enum": ["professional", "casual", "inspiring", "informative"],
            "default": "professional"
          },
          "scheduledTime": {
            "type": "string",
            "description": "ISO string for scheduled posting"
          }
        },
        "required": ["topic"],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    "outputSchema": {
      "json": {
        "type": "object",
        "properties": {
          "linkedinPost": {
            "type": "string"
          },
          "hashtags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "topic": {
            "type": "string"
          }
        },
        "required": ["linkedinPost", "hashtags", "topic"],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    }
  }
}