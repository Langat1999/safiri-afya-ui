import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AdSlotProps {
  type: 'banner' | 'card' | 'native' | 'sidebar';
  className?: string;
  closeable?: boolean;
}

export const AdSlot = ({ type, className = '', closeable = false }: AdSlotProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lazy load ad when it's near viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true);
          // Here you would load your actual ad script
          console.log(`Loading ad: ${type}`);
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [isLoaded, type]);

  if (!isVisible) return null;

  const getMinHeight = () => {
    switch (type) {
      case 'banner': return 'min-h-[50px] sm:min-h-[90px]';
      case 'card': return 'min-h-[100px]';
      case 'native': return 'min-h-[120px]';
      case 'sidebar': return 'min-h-[250px]';
      default: return 'min-h-[50px]';
    }
  };

  const getBorderStyle = () => {
    return type === 'native' ? 'border-dashed border-2 border-primary/20' : 'border border-border/50';
  };

  return (
    <div ref={adRef} className={className}>
      <Card className={`${getBorderStyle()} bg-muted/30 hover:bg-muted/40 transition-colors`}>
        <CardHeader className="pb-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              Sponsored
            </Badge>
            {closeable && (
              <button
                onClick={() => setIsVisible(false)}
                className="rounded-full p-1 hover:bg-background transition-colors"
                aria-label="Close advertisement"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div
            className={`${getMinHeight()} flex items-center justify-center bg-background/80 rounded-md border border-border/30`}
          >
            {isLoaded ? (
              <div id={`ad-slot-${type}-${Math.random()}`} className="w-full h-full flex items-center justify-center">
                {/* Ad content loads here - Replace with actual ad code */}
                <div className="text-center px-4 py-6">
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Advertisement Space
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {type === 'banner' && 'Banner Ad (320x50 / 728x90)'}
                    {type === 'card' && 'Card Ad (Flexible)'}
                    {type === 'native' && 'Native Ad'}
                    {type === 'sidebar' && 'Sidebar Ad (300x250)'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground animate-pulse">
                Loading...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
