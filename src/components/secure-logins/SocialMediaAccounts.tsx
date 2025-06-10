
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface SocialMediaAccountsProps {
  socialMediaHandles?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    onlyfans?: string;
    snapchat?: string;
    other?: Array<{
      platform: string;
      handle: string;
    }>;
  };
}

const SocialMediaAccounts: React.FC<SocialMediaAccountsProps> = ({ socialMediaHandles }) => {
  if (!socialMediaHandles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No social media accounts found in profile data.</p>
        </CardContent>
      </Card>
    );
  }

  const formatHandle = (handle: string) => {
    if (!handle) return null;
    // Remove @ symbol if it exists at the beginning
    return handle.startsWith('@') ? handle.slice(1) : handle;
  };

  const getProfileUrl = (platform: string, handle: string) => {
    const formattedHandle = formatHandle(handle);
    if (!formattedHandle) return null;

    const urls = {
      instagram: `https://instagram.com/${formattedHandle}`,
      twitter: `https://twitter.com/${formattedHandle}`,
      tiktok: `https://tiktok.com/@${formattedHandle}`,
      onlyfans: `https://onlyfans.com/${formattedHandle}`,
      snapchat: `https://snapchat.com/add/${formattedHandle}`
    };

    return urls[platform as keyof typeof urls] || null;
  };

  const mainPlatforms = [
    { key: 'instagram', label: 'Instagram', value: socialMediaHandles.instagram },
    { key: 'twitter', label: 'Twitter', value: socialMediaHandles.twitter },
    { key: 'tiktok', label: 'TikTok', value: socialMediaHandles.tiktok },
    { key: 'onlyfans', label: 'OnlyFans', value: socialMediaHandles.onlyfans },
    { key: 'snapchat', label: 'Snapchat', value: socialMediaHandles.snapchat }
  ];

  const hasAnyAccounts = mainPlatforms.some(platform => platform.value) || 
                        (socialMediaHandles.other && socialMediaHandles.other.length > 0);

  if (!hasAnyAccounts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No social media accounts provided.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mainPlatforms.map(platform => {
          if (!platform.value) return null;
          
          const profileUrl = getProfileUrl(platform.key, platform.value);
          const formattedHandle = formatHandle(platform.value);
          
          return (
            <div key={platform.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Badge variant="secondary" className="mb-1">
                  {platform.label}
                </Badge>
                <p className="text-sm font-medium">@{formattedHandle}</p>
              </div>
              {profileUrl && (
                <a 
                  href={profileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          );
        })}

        {socialMediaHandles.other && socialMediaHandles.other.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Other Platforms</h4>
            {socialMediaHandles.other.map((account, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Badge variant="outline" className="mb-1">
                    {account.platform}
                  </Badge>
                  <p className="text-sm font-medium">{account.handle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialMediaAccounts;
