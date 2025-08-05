# Troubleshooting Guide

## "Failed to generate LinkedIn post" Error

If you're seeing this error, it's likely due to one of the following issues:

### 1. Mastra Server Not Running

**Problem**: The Mastra server is not running on `http://localhost:4111`

**Solution**:
1. Start your Mastra server:
   ```bash
   # Navigate to your Mastra project directory
   cd /path/to/your/mastra/project
   
   # Start the development server
   mastra dev
   # or
   npm run dev
   # or
   bun dev
   ```

2. Verify the server is running by visiting `http://localhost:4111` in your browser

### 2. Workflow Not Registered

**Problem**: The `contentGenerationWorkflow` is not registered in your Mastra server

**Solution**:
1. Check your Mastra project's workflow files
2. Ensure you have a workflow named `contentGenerationWorkflow`
3. The workflow should be exported like this:

```typescript
// src/mastra/workflows/content-generation-workflow.ts
import { createWorkflow } from '@mastra/core';

export const contentGenerationWorkflow = createWorkflow({
  id: 'content-generation-workflow',
  // ... workflow configuration
});
```

### 3. Workflow Name Mismatch

**Problem**: The workflow name in the code doesn't match the actual workflow name

**Solution**:
1. Check the available workflows by visiting the dashboard
2. Look for the "Mastra Server Status" card
3. Verify the exact workflow name from the server
4. Update the workflow name in `src/lib/services/content-service.ts` if needed

### 4. Network/Connection Issues

**Problem**: Cannot connect to the Mastra server

**Solution**:
1. Check if the server URL is correct in `src/lib/mastra-client.ts`
2. Ensure no firewall is blocking the connection
3. Try accessing `http://localhost:4111` directly in your browser

## Debugging Steps

### Step 1: Check Server Status
1. Go to the Dashboard
2. Look at the "Mastra Server Status" card
3. Click "Check Status" to verify connection

### Step 2: Check Available Workflows
1. If connected, check the list of available workflows
2. Note the exact workflow names

### Step 3: Test Workflow
1. Use the "Workflow Test" card to test the workflow execution
2. Check the browser console for detailed error messages

### Step 4: Check Browser Console
1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for error messages when generating content

## Common Error Messages

### "Mastra server is not available"
- **Cause**: Server not running or wrong URL
- **Fix**: Start the Mastra server on `http://localhost:4111`

### "Workflow not found"
- **Cause**: Workflow name doesn't match or workflow not registered
- **Fix**: Check workflow name and registration

### "Cannot connect to Mastra server"
- **Cause**: Network issues or server down
- **Fix**: Check server status and network connection

### "Workflow did not produce expected output"
- **Cause**: Workflow execution failed or output format incorrect
- **Fix**: Check workflow configuration and logs

## Configuration Files

### Mastra Client Configuration
File: `src/lib/mastra-client.ts`
```typescript
export const mastraClient = new MastraClient({
  baseUrl: "http://localhost:4111", // Verify this URL
  // ... other config
});
```

### Workflow Service Configuration
File: `src/lib/services/content-service.ts`
```typescript
this.workflow = mastraClient.getWorkflow("contentGenerationWorkflow"); // Verify this name
```

## Getting Help

If you're still having issues:

1. **Check the logs**: Look at both browser console and Mastra server logs
2. **Verify workflow**: Ensure the workflow is properly configured in your Mastra project
3. **Test connection**: Use the status check components to verify connectivity
4. **Check versions**: Ensure you're using compatible versions of Mastra and the client SDK

## Quick Fix Checklist

- [ ] Mastra server running on `http://localhost:4111`
- [ ] Workflow `contentGenerationWorkflow` registered
- [ ] Workflow name matches exactly
- [ ] No network/firewall issues
- [ ] Browser console shows no errors
- [ ] Status check shows "Connected" 