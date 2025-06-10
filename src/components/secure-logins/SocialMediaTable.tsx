
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { SocialMediaLogin } from './types';

interface SocialMediaTableProps {
  socialMediaLogins: SocialMediaLogin[];
  isEditing: boolean;
  showPasswords: Record<string, boolean>;
  onUpdateLogin: (id: string, field: keyof SocialMediaLogin, value: string) => void;
  onTogglePasswordVisibility: (id: string) => void;
  onRemovePlatform: (id: string, platform: string) => void;
  getPlatformColor: (platform: string) => string;
}

const SocialMediaTable: React.FC<SocialMediaTableProps> = ({
  socialMediaLogins,
  isEditing,
  showPasswords,
  onUpdateLogin,
  onTogglePasswordVisibility,
  onRemovePlatform,
  getPlatformColor
}) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Platform</TableHead>
            <TableHead className="font-semibold text-foreground">Username/Handle</TableHead>
            <TableHead className="font-semibold text-foreground">Login Password</TableHead>
            <TableHead className="font-semibold text-foreground">Notes</TableHead>
            {isEditing && <TableHead className="font-semibold text-foreground w-20">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {socialMediaLogins.map((login) => (
            <TableRow key={login.id} className="hover:bg-muted/20">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlatformColor(login.platform)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {login.platform.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground">{login.platform}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {isEditing ? (
                  <Input
                    value={login.username}
                    onChange={(e) => onUpdateLogin(login.id, 'username', e.target.value)}
                    placeholder="username"
                    className="rounded-[15px] h-9 border-muted-foreground/20"
                  />
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                      {login.username || '-'}
                    </span>
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                {isEditing ? (
                  <div className="flex gap-1">
                    <Input
                      type={showPasswords[login.id] ? 'text' : 'password'}
                      value={login.password}
                      onChange={(e) => onUpdateLogin(login.id, 'password', e.target.value)}
                      placeholder="Enter password"
                      className="rounded-[15px] h-9 flex-1 border-muted-foreground/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onTogglePasswordVisibility(login.id)}
                      className="h-9 w-9 p-0"
                    >
                      {showPasswords[login.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {login.password ? (showPasswords[login.id] ? login.password : '••••••••') : '-'}
                    </span>
                    {login.password && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onTogglePasswordVisibility(login.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showPasswords[login.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                {isEditing ? (
                  <Input
                    value={login.notes}
                    onChange={(e) => onUpdateLogin(login.id, 'notes', e.target.value)}
                    placeholder="Additional notes"
                    className="rounded-[15px] h-9 border-muted-foreground/20"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">{login.notes || '-'}</span>
                )}
              </TableCell>
              
              {isEditing && (
                <TableCell>
                  {!login.is_predefined && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemovePlatform(login.id, login.platform)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SocialMediaTable;
