import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if we can connect to the Mastra server directly
    const response = await fetch('http://localhost:4111/workflows', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Mastra server responded with status: ${response.status}`);
    }
    
    const workflows = await response.json();
    
    return NextResponse.json({
      success: true,
      connected: true,
      workflows: workflows,
      serverUrl: "http://localhost:4111"
    });

  } catch (error) {
    console.error('Mastra server connection failed:', error);
    
    return NextResponse.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      serverUrl: "http://localhost:4111",
      suggestion: "Please ensure the Mastra server is running on http://localhost:4111"
    }, { status: 503 });
  }
} 