"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sparkles, Loader2, Copy, Check, RefreshCw, ThumbsUp, MessageCircle, Repeat, Send, Link, Calendar as CalendarIcon, Clock, Image as ImageIcon, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useContentGeneration, ContentGenerationInput } from '@/hooks/use-content-generation';
import { LinkedInPreview } from '@/components/linkedin-preview';
import { useLinkedInOAuth } from '@/hooks/use-linkedin-oauth';
import { useAuthStore } from '@/lib/auth-store';

export function ContentGenerationForm() {
  const [formData, setFormData] = useState<ContentGenerationInput>({
    topic: '',
    contentType: 'article',
    tone: 'professional',
  });
  const [linkInput, setLinkInput] = useState('');

  const [copied, setCopied] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [activeTab, setActiveTab] = useState('topic');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageFile, setImageFile] = useState<File>();
  const [isEditing, setIsEditing] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  const { generateContent, content, isLoading, error, reset } = useContentGeneration();
  const { oauthData } = useLinkedInOAuth();
  const { user, token } = useAuthStore();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'link' && !linkInput.trim()) {
      return;
    }
    
    if (activeTab === 'topic' && !formData.topic.trim()) {
      return;
    }
    
    let finalTopic = formData.topic;
    
    // If using link, pass the URL directly as the topic
    if (activeTab === 'link' && linkInput.trim()) {
      finalTopic = `Extract Full Content: ${linkInput.trim()}`;
    }
    
    try {
      console.log('Submitting content generation with topic:', finalTopic);
      await generateContent({
        ...formData,
        topic: finalTopic,
      });
      console.log('Content generation completed successfully');
      
      // After successful generation, replace the topic with the generated content
      // This will be handled by the useEffect above
    } catch (error) {
      console.error('Content generation failed:', error);
      // Error is already handled by the hook, but we can add additional logging here
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleReset = () => {
    reset();
    setEditedContent('');
    setLinkInput('');
    setActiveTab('topic');
    setScheduledDate(undefined);
    setScheduledTime('');
    setIsEditing(false);
    setEditingDraftId(null);
    
    // Clean up image URL to prevent memory leaks
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(undefined);
    setImageFile(undefined);
    
    setFormData({
      topic: '',
      contentType: 'article',
      tone: 'professional',
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Clean up previous preview URL to prevent memory leaks
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
      
      // Create a preview URL for the uploaded file
      const previewUrl = URL.createObjectURL(file)
      setImageFile(file)
      setImageUrl(previewUrl)
    }
    
    // Reset the input value to allow selecting the same file again
    event.target.value = ''
  }

  const handleRemoveImage = () => {
    // Clean up the preview URL to prevent memory leaks
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setImageUrl(undefined)
    setImageFile(undefined)
  }

  // Effect to handle content generation and update form
  useEffect(() => {
    if (content?.linkedinPost && !isEditing) {
      setFormData(prev => ({ ...prev, topic: content.linkedinPost }));
      setEditedContent(content.linkedinPost);
      setIsEditing(true);
      // Switch to topic tab to show the generated content in the editor
      setActiveTab('topic');
    }
  }, [content, isEditing]);

  // Effect to handle loading draft data from localStorage
  useEffect(() => {
    const draftData = localStorage.getItem('continueEditingDraft');
    if (draftData) {
      try {
        const parsedDraft = JSON.parse(draftData);
        if (parsedDraft.isDraft) {
          setFormData({
            topic: parsedDraft.title || '',
            contentType: parsedDraft.contentType.toLowerCase(),
            tone: parsedDraft.tone.toLowerCase(),
          });
          setEditedContent(parsedDraft.content);
          setIsEditing(true);
          setActiveTab('topic');
          setEditingDraftId(parsedDraft.id);
          
          // If publishOnLoad is true, show a message to the user
          if (parsedDraft.publishOnLoad) {
            alert('Draft loaded! Review your content and click "Publish" when ready.');
          }
          
          // Clear the localStorage data
          localStorage.removeItem('continueEditingDraft');
        }
      } catch (error) {
        console.error('Error parsing draft data:', error);
        localStorage.removeItem('continueEditingDraft');
      }
    }
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Helper function to check if there's content to publish/schedule
  const hasContentToPublish = () => {
    const postContent = editedContent || content?.linkedinPost || formData.topic;
    return postContent && postContent.trim().length > 0;
  };

  const isScheduledTimeValid = () => {
    if (!scheduledDate || !scheduledTime) return false;
    
    const now = new Date();
    const scheduledDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    return scheduledDateTime > now;
  };

  const getScheduleValidationMessage = () => {
    if (!scheduledDate || !scheduledTime) return null;
    
    if (!isScheduledTimeValid()) {
      return "Please select a future time for today's schedule";
    }
    
    return null;
  };

  const handlePublishNow = async () => {
    if (!oauthData?.linkedInAuthId) {
      alert('Please connect your LinkedIn account first');
      return;
    }

    if (!user?.id) {
      alert('User authentication required');
      return;
    }

    const postContent = editedContent || content?.linkedinPost || formData.topic;
    if (!postContent || !postContent.trim()) {
      alert('No content to publish');
      return;
    }

    console.log('Publishing with user ID:', user.id);
    console.log('LinkedIn Auth ID:', oauthData.linkedInAuthId);

    try {
      // Create the post using our backend API route (supports both text and image)
      const formDataToSend = new FormData();
      formDataToSend.append('linkedInAuthId', oauthData.linkedInAuthId);
      formDataToSend.append('userId', user.id); // Add current user ID
      formDataToSend.append('content', postContent);
      formDataToSend.append('contentType', formData.contentType || 'article');
      formDataToSend.append('tone', formData.tone || 'professional');
      formDataToSend.append('hashtags', JSON.stringify(content?.hashtags || []));
      
      if (imageFile) {
        formDataToSend.append('imageFile', imageFile);
      }

      const publishResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/linkedin/publish-with-image`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error || 'Failed to publish post');
      }

      const result = await publishResponse.json();
      console.log('Post published successfully:', result);
      
      // Show success message
      const message = result.hasImage 
        ? 'Post with image published successfully to LinkedIn and saved to database!' 
        : 'Post published successfully to LinkedIn and saved to database!';
      alert(message);
      
      // Reset form after successful publish
      handleReset();
      
    } catch (error) {
      console.error('Publishing error:', error);
      alert(`Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user?.id) {
      alert('User authentication required');
      return;
    }

    const postContent = editedContent || content?.linkedinPost || formData.topic;
    if (!postContent || !postContent.trim()) {
      alert('No content to save');
      return;
    }

    console.log('Saving draft with user ID:', user.id);

    try {
      const draftData = {
        content: postContent,
        title: formData.topic || null,
        contentType: formData.contentType || 'article',
        tone: formData.tone || 'professional',
        hashtags: content?.hashtags || [],
        status: 'DRAFT'
      };

      let response;
      
      if (editingDraftId) {
        // Update existing draft
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${editingDraftId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftData),
        });
      } else {
        // Create new draft
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingDraftId ? 'update' : 'save'} draft`);
      }

      const result = await response.json();
      console.log('Draft saved successfully:', result);
      
      // Show success message
      const message = editingDraftId 
        ? 'Draft updated successfully!' 
        : 'Draft saved successfully! You can find it in your posts list.';
      alert(message);
      
      // Reset form after successful save
      handleReset();
      
    } catch (error) {
      console.error('Save draft error:', error);
      alert(`Failed to save draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      alert('Please select both date and time for scheduling');
      return;
    }

    if (!oauthData?.linkedInAuthId) {
      alert('Please connect your LinkedIn account first');
      return;
    }

    if (!user?.id) {
      alert('User authentication required');
      return;
    }

    const postContent = editedContent || content?.linkedinPost || formData.topic;
    if (!postContent || !postContent.trim()) {
      alert('No content to schedule');
      return;
    }

    console.log('Scheduling with user ID:', user.id);
    console.log('LinkedIn Auth ID:', oauthData.linkedInAuthId);

    try {
      const scheduledDateTime = new Date(scheduledDate);
      const [hours, minutes] = scheduledTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      let scheduleResponse;

      // If there's an image, use the schedule-with-image endpoint
      if (imageFile) {
        console.log('Scheduling post with image...');
        
        // Use FormData to handle image upload like the publish functionality
        const formDataToSend = new FormData();
        formDataToSend.append('linkedInAuthId', oauthData.linkedInAuthId);
        formDataToSend.append('userId', user.id);
        formDataToSend.append('content', postContent);
        formDataToSend.append('contentType', formData.contentType || 'article');
        formDataToSend.append('tone', formData.tone || 'professional');
        formDataToSend.append('hashtags', JSON.stringify(content?.hashtags || []));
        formDataToSend.append('scheduledAt', scheduledDateTime.toISOString());
        formDataToSend.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
        formDataToSend.append('imageFile', imageFile);

        // Schedule the post using our backend API route with image upload
        scheduleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/linkedin/schedule-with-image`, {
          method: 'POST',
          body: formDataToSend,
        });
      } else {
        console.log('Scheduling text-only post...');
        
        // Schedule the post using our backend API route (text only)
        scheduleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/linkedin/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            linkedInAuthId: oauthData.linkedInAuthId,
            userId: user.id, // Add current user ID
            content: postContent,
            contentType: formData.contentType || 'article',
            tone: formData.tone || 'professional',
            hashtags: JSON.stringify(content?.hashtags || []),
            scheduledAt: scheduledDateTime.toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
      }

      if (!scheduleResponse.ok) {
        const errorData = await scheduleResponse.json();
        throw new Error(errorData.error || 'Failed to schedule post');
      }

      const result = await scheduleResponse.json();
      console.log('Post scheduled successfully:', result);
      
      // Show success message
      const message = result.hasImage 
        ? `Post with image scheduled successfully for ${scheduledDateTime.toLocaleString()} and saved to database!`
        : `Post scheduled successfully for ${scheduledDateTime.toLocaleString()} and saved to database!`;
      alert(message);
      
      // Reset form after successful scheduling
      handleReset();
      setIsScheduleOpen(false);
      
    } catch (error) {
      console.error('Scheduling error:', error);
      alert(`Failed to schedule post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Side - Simple Generation Form */}
        <div className="flex flex-col">
          <Card>
            <CardContent className="flex flex-col p-6">
              {/* Top Action Buttons */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {content && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleReset}
                      className="px-4 py-2 rounded-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  )}
                  {editingDraftId && (
                    <Badge variant="secondary" className="text-xs">
                      Editing Draft
                    </Badge>
                  )}
                </div>

                {/* Save Draft and Publish Buttons - Top Right */}
                <div className="flex items-center gap-2">
                  {/* Save as Draft Button */}
                  <Button 
                    onClick={handleSaveAsDraft}
                    disabled={!hasContentToPublish() || isLoading}
                    variant="outline"
                    className={`px-4 py-2 rounded-full ${
                      hasContentToPublish()
                        ? 'border-gray-300 hover:bg-gray-50' 
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingDraftId ? 'Update Draft' : 'Save Draft'}
                  </Button>

                  {/* Publish Button */}
                  <Button 
                    onClick={handlePublishNow}
                    disabled={!hasContentToPublish() && !imageUrl || isLoading}
                    className={`px-4 py-2 rounded-full ${
                      hasContentToPublish() || imageUrl
                        ? 'bg-[#0A66C2] hover:bg-[#004182] text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>

              {/* Topic Input */}
              <div className="flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="topic" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {isEditing ? 'Editor' : 'Topic'}
                    </TabsTrigger>
                    <TabsTrigger value="link" className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Link
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {activeTab === 'topic' ? (
                  <Textarea
                    placeholder={isEditing ? "Edit your LinkedIn post content here..." : "What topic would you like to create a LinkedIn post about?"}
                    value={isEditing ? editedContent : formData.topic}
                    onChange={(e) => {
                      if (isEditing) {
                        setEditedContent(e.target.value);
                      } else {
                        setFormData(prev => ({ ...prev, topic: e.target.value }));
                      }
                    }}
                    className="flex-1 resize-none border-none outline-none text-lg leading-relaxed p-0 overflow-y-auto"
                    style={{
                      minHeight: '200px',
                      maxHeight: '400px',
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }}
                  />
                                ) : (
                  <div className="space-y-3">
                    <Input
                      type="url"
                      placeholder="https://example.com/article"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      className="w-full"
                    />
                    {isEditing && (
                      <Textarea
                        placeholder="Edit your LinkedIn post content here..."
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="flex-1 resize-none border-none outline-none text-lg leading-relaxed p-0 overflow-y-auto mt-3"
                        style={{
                          minHeight: '200px',
                          maxHeight: '400px',
                          fontSize: '16px',
                          lineHeight: '1.6'
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Quick Options */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Type:</span>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value as 'article' | 'trend' | 'news' | 'tutorial' }))}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="trend">Trend</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tone:</span>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value as 'professional' | 'casual' | 'inspiring' | 'informative' }))}
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="inspiring">Inspiring</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                            {/* Action Icons Row */}
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="flex items-center gap-4">
                  <label className={`p-2 rounded-full transition-colors cursor-pointer ${
                    imageUrl 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}>
                    <ImageIcon className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  <Sheet open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                    <SheetTrigger asChild>
                      <button 
                        className={`p-2 rounded-full transition-colors ${
                          hasContentToPublish() || imageUrl
                            ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!hasContentToPublish() && !imageUrl}
                        title={hasContentToPublish() || imageUrl ? "Schedule post" : "Add content or image first"}
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Schedule Post</SheetTitle>
                      </SheetHeader>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                        <p className="text-sm text-blue-700">
                          💡 You can schedule posts for today or any future date. Make sure to select a future time when scheduling for today.
                        </p>
                      </div>
                      <div className="space-y-4 py-4 px-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const selectedDate = new Date(date);
                                  selectedDate.setHours(0, 0, 0, 0);
                                  return selectedDate < today;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule-time">Time</Label>
                          <Input
                            id="schedule-time"
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                          />
                          {scheduledDate && scheduledTime && (
                            <p className="text-xs text-gray-500">
                              {isScheduledTimeValid() 
                                ? "✅ Valid schedule time" 
                                : "⚠️ Please select a future time"
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      <SheetFooter>
                        <Button 
                          onClick={handleSchedule}
                          disabled={!scheduledDate || !scheduledTime || (!hasContentToPublish() && !imageUrl) || !isScheduledTimeValid()}
                          className="w-full"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule Post
                        </Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Generate Button - Bottom Right */}
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading || (activeTab === 'topic' && !formData.topic.trim()) || (activeTab === 'link' && !linkInput.trim())}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Error and Loading States */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {isLoading && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <p className="text-blue-700 text-sm">Generating your LinkedIn post...</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side - LinkedIn Preview */}
        <div className="flex flex-col">
        {isLoading ? (
          <LinkedInPreview 
            content="Generating your LinkedIn post...\n\nPlease wait while AI crafts the perfect content for your topic."
            profile={oauthData?.profile}
            onCopy={handleCopy} 
            copied={copied}
            isLoading={true}
          />
        ) : content || isEditing ? (
          (() => {
            const currentContent = isEditing ? editedContent : (content?.linkedinPost || '');
            console.log('Rendering LinkedIn preview with content:', {
              editedContent,
              contentLinkedInPost: content?.linkedinPost,
              currentContent,
              isEditing
            });
              return (
          <LinkedInPreview 
            content={currentContent}
                  imageUrl={imageUrl}
                  imageFile={imageFile}
            profile={oauthData?.profile}
            onCopy={handleCopy} 
            copied={copied}
                  onImageRemove={handleRemoveImage}
          />
              );
            })()
        ) : (
          <LinkedInPreview 
            content={formData.topic || "Your LinkedIn post will appear here once you Write or generate content.\n\nFill out the form on the left and click 'Generate Post' to get started!"}
              imageUrl={imageUrl}
              imageFile={imageFile}
            profile={oauthData?.profile}
            onCopy={handleCopy} 
            copied={copied}
              onImageRemove={handleRemoveImage}
            isPlaceholder={!formData.topic}
          />
        )}
      </div>
    </div>

      
    </div>
  );
}

 