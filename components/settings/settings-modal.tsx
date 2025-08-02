"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, Settings, Eye, Target, Layers } from 'lucide-react';
import { useUserSettings } from '@/hooks/use-user-settings';
import { MindmapMode } from '@/lib/types/settings';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, loading, updateSettings, reload } = useUserSettings();
  const [updating, setUpdating] = useState(false);

  // Only reload settings when modal opens - avoid infinite loops
  useEffect(() => {
    if (open && !loading && !settings) {
      reload();
    }
  }, [open]); // Only depend on open to prevent infinite loops

  const handleReasoningToggle = async (checked: boolean) => {
    if (!settings) return;
    
    try {
      setUpdating(true);
      await updateSettings({ showReasoning: checked });
      toast.success(checked ? '🧠 Reasoning panel enabled' : '👁️ Reasoning panel hidden');
    } catch (error) {
      toast.error('Failed to update reasoning setting');
    } finally {
      setUpdating(false);
    }
  };

  const handleModeChange = async (mode: MindmapMode) => {
    if (!settings || settings.mindmapMode === mode) return;
    
    try {
      setUpdating(true);
      await updateSettings({ mindmapMode: mode });
      toast.success(`✨ Switched to ${mode} mode`);
    } catch (error) {
      toast.error('Failed to update mindmap mode');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !settings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[420px]">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground">Loading settings...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Customize your mindmap experience</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* AI Reasoning Panel Section */}
          <Card className="border-0 bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Reasoning Panel</CardTitle>
                  <CardDescription className="text-sm">
                    Show or hide the AI thinking process. The AI continues reasoning behind the scenes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Label htmlFor="reasoning-toggle" className="text-sm font-medium">
                  Show reasoning panel
                </Label>
                <Switch
                  id="reasoning-toggle"
                  checked={settings.showReasoning}
                  onCheckedChange={handleReasoningToggle}
                  disabled={updating}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Mindmap Mode Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Mindmap Mode</h3>
                <p className="text-sm text-muted-foreground">Choose how detailed your mindmaps should be</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Lite Mode */}
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  settings.mindmapMode === 'lite'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleModeChange('lite')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Lite Mode</h4>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Fast
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Quick, focused mindmaps</p>
                      </div>
                    </div>
                    {settings.mindmapMode === 'lite' && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comprehensive Mode */}
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  settings.mindmapMode === 'comprehensive'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleModeChange('comprehensive')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Comprehensive Mode</h4>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Detailed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">In-depth analysis & examples</p>
                      </div>
                    </div>
                    {settings.mindmapMode === 'comprehensive' && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)} className="px-8">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}