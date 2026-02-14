import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, Clock, Heart } from 'lucide-react';

interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAge: number;
  fromUserInterests: string[];
  timestamp: number;
  status: 'pending' | 'accepted' | 'cancelled';
}

interface RequestSidebarProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onCancel: (requestId: string, userId: string) => void;
}

export const RequestSidebar = ({ requests, onAccept, onCancel }: RequestSidebarProps) => {
  const [joiningRequest, setJoiningRequest] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (joiningRequest) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-accept after countdown
            const request = requests.find(r => r.id === joiningRequest);
            if (request) {
              onAccept(joiningRequest);
            }
            setJoiningRequest(null);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [joiningRequest, requests, onAccept]);

  const handleJoinClick = (requestId: string) => {
    setJoiningRequest(requestId);
    setCountdown(3);
  };

  const handleCancelJoin = (requestId: string, userId: string) => {
    setJoiningRequest(null);
    setCountdown(3);
    onCancel(requestId, userId);
  };

  // Show on medium screens and up (changed from xl to md)
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="hidden md:block w-80 flex-shrink-0"
    >
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 sticky top-28">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            You Matched With
          </h3>
          <Badge variant="secondary">{requests.length}</Badge>
        </div>

        {/* Debug info - remove in production */}
        <div className="mb-4 p-3 bg-secondary/50 rounded text-xs space-y-1">
          <div className="text-muted-foreground">Debug Info:</div>
          <div className="text-foreground">Matches: {requests.length}</div>
          <div className="text-muted-foreground text-[10px] max-h-20 overflow-auto">
            {JSON.stringify(requests, null, 2)}
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {requests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                No matches yet. Keep swiping!
              </motion.div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="relative"
                >
                  <Card className="p-4 bg-secondary/50 border-border/50 hover:border-primary/50 transition-all">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pink-deep flex items-center justify-center text-white font-bold flex-shrink-0">
                        {request.fromUserName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {request.fromUserName}, {request.fromUserAge}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.fromUserInterests.slice(0, 2).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {request.fromUserInterests.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{request.fromUserInterests.length - 2}
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        {joiningRequest === request.id ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 space-y-2"
                          >
                            <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                              <Clock className="w-5 h-5 text-primary animate-pulse" />
                              <span className="text-lg font-bold text-primary">
                                {countdown}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full"
                              onClick={() => handleCancelJoin(request.id, request.fromUserId)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="flex-1 bg-primary hover:bg-pink-deep"
                              onClick={() => handleJoinClick(request.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Join
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancelJoin(request.id, request.fromUserId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time ago */}
                    <div className="text-xs text-muted-foreground mt-2 text-right">
                      {getTimeAgo(request.timestamp)}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.aside>
  );
};

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
