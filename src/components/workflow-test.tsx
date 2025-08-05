"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function WorkflowTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
  } | null>(null);

  const testWorkflow = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'AI in healthcare',
          contentType: 'article',
          tone: 'professional',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Workflow executed successfully!',
          data: result,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Workflow test failed',
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Workflow Test
        </CardTitle>
        <CardDescription>
          Test the Mastra content generation workflow integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testWorkflow} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Workflow...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Test Workflow
            </>
          )}
        </Button>

        {testResult && (
          <div className={`p-3 rounded-md border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </span>
            </div>
            
            {testResult.success && testResult.data && (
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-600">Topic:</span>
                  <p className="text-sm">{testResult.data.topic}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-600">Post Preview:</span>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {testResult.data.linkedinPost}
                  </p>
                </div>
                {testResult.data.hashtags && (
                  <div>
                    <span className="text-xs font-medium text-gray-600">Hashtags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {testResult.data.hashtags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 