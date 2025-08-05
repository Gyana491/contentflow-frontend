"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ApiService } from '@/services/api';

interface ServerStatus {
  server: 'online' | 'offline' | 'checking';
  mastra: 'online' | 'offline' | 'checking';
  error?: string;
}

export function ServerStatusCheck() {
  const [status, setStatus] = useState<ServerStatus>({
    server: 'checking',
    mastra: 'checking'
  });

  const checkServerStatus = async () => {
    setStatus({
      server: 'checking',
      mastra: 'checking'
    });

          try {
        // Check main server
        const serverResponse = await fetch('http://localhost:8080/api/status');
        const serverOnline = serverResponse.ok;
        
        // Check Mastra server
        let mastraOnline = false;
        try {
          const mastraResponse = await fetch('http://localhost:4111/health');
          mastraOnline = mastraResponse.ok;
        } catch (error) {
          console.log('Mastra server not available');
        }

      setStatus({
        server: serverOnline ? 'online' : 'offline',
        mastra: mastraOnline ? 'online' : 'offline'
      });
    } catch (error) {
      setStatus({
        server: 'offline',
        mastra: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const getStatusIcon = (status: 'online' | 'offline' | 'checking') => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: 'online' | 'offline' | 'checking') => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Server Status
        </CardTitle>
        <CardDescription>
          Check if all required services are running
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.server)}
            <span className="font-medium">Main Server</span>
          </div>
          {getStatusBadge(status.server)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.mastra)}
            <span className="font-medium">Mastra Server</span>
          </div>
          {getStatusBadge(status.mastra)}
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{status.error}</p>
          </div>
        )}

        <Button 
          onClick={checkServerStatus} 
          variant="outline" 
          className="w-full"
          disabled={status.server === 'checking' || status.mastra === 'checking'}
        >
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
} 