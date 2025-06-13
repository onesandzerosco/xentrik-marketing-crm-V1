
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ContentGuideDownloaderProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const ContentGuideDownloader: React.FC<ContentGuideDownloaderProps> = ({ 
  className = "",
  variant = "outline",
  size = "sm"
}) => {
  const handleDownloadContentGuide = () => {
    // Create a simple content guide document
    const content = `
CONTENT CREATION GUIDE

This guide will help you create engaging content for your audience.

KEY PRINCIPLES:
1. Authenticity - Be yourself and genuine in your content
2. Consistency - Regular posting schedule builds audience trust
3. Quality - Focus on good lighting, clear audio, and engaging visuals
4. Engagement - Respond to comments and interact with your audience
5. Variety - Mix different types of content to keep things interesting

CONTENT IDEAS:
• Behind-the-scenes content
• Q&A sessions with your audience
• Tutorial or educational content
• Personal stories and experiences
• Collaborative content with other creators
• Live streaming sessions
• Seasonal or trending content

TECHNICAL TIPS:
• Use good lighting (natural light works great)
• Ensure clear audio quality
• Keep content organized with proper file naming
• Back up your content regularly
• Use appropriate tags and descriptions

SAFETY & PRIVACY:
• Always maintain your personal boundaries
• Never share personal information
• Use secure platforms for content sharing
• Keep backup copies of important content
• Report any inappropriate behavior

Remember: Your safety and well-being should always come first. Create content that you're comfortable with and that aligns with your personal values.

Generated on: ${new Date().toLocaleDateString()}
    `;

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Content_Creation_Guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button 
      onClick={handleDownloadContentGuide}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      Download Content Guide
    </Button>
  );
};

export default ContentGuideDownloader;
