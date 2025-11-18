# Mobile-First Ad Placement Strategy for Safiri Afya

## 🎯 Philosophy: Non-Intrusive, User-First Advertising

### Core Principles
1. **Content First**: Ads should never block or interfere with health information
2. **Mobile Optimized**: Designed for thumb-friendly interactions on small screens
3. **Performance**: Lazy-loaded to maintain fast page speed
4. **Accessibility**: Proper spacing, clear close buttons, skip options
5. **Native Feel**: Ads should blend with the design system

---

## 📱 Proposed Ad Placements (Mobile-First)

### **1. Hero Section - Subtle Banner After CTA**
**Location**: Below the 3 trust indicators (24/7, 500+ Clinics, 10K+ Users)
**Type**: Horizontal banner (responsive)
**Size**:
- Mobile: 320x50px or 300x50px (standard mobile banner)
- Tablet: 728x90px (leaderboard)
- Desktop: 970x90px (large leaderboard)

**Implementation**:
```jsx
<section className="py-4 px-4 sm:px-6">
  <div className="max-w-4xl mx-auto">
    {/* Ad Container - Subtle, non-intrusive */}
    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Sponsored</span>
        <button className="text-xs text-muted-foreground hover:text-foreground">
          Learn why ads?
        </button>
      </div>
      <div className="min-h-[50px] flex items-center justify-center bg-background rounded">
        {/* Ad content here */}
        <div className="text-center text-sm text-muted-foreground">
          Advertisement
        </div>
      </div>
    </div>
  </div>
</section>
```

**Spacing**:
- 16px margin above (separating from hero)
- 24px margin below (separating from next section)
- Contained width with page content

---

### **2. Between Sections - Native Content Ads**
**Location**: Between major sections (e.g., after Symptom Checker, before Clinic Locator)
**Type**: Native card-style ads
**Size**: Matches the design system (card format)

**Implementation**:
```jsx
<div className="py-8 bg-background">
  <div className="container px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      {/* Native Ad Card */}
      <Card className="border-dashed border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">Sponsored</Badge>
            <button className="text-xs text-muted-foreground">×</button>
          </div>
        </CardHeader>
        <CardContent className="min-h-[100px] flex items-center justify-center">
          {/* Ad content - matches your card design */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Advertisement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

**Spacing**:
- Full section padding (py-8) for breathing room
- Dashed border to visually distinguish from content
- Easy-to-tap close button (48x48px touch target)

---

### **3. Health News Section - Inline Article Ads**
**Location**: Every 6 articles in the Health News grid
**Type**: Sponsored article card
**Size**: Same as article cards (responsive grid)

**Implementation**:
```jsx
{articles.map((article, index) => (
  <React.Fragment key={index}>
    {/* Regular article */}
    <ArticleCard article={article} />

    {/* Inject sponsored article every 6 articles */}
    {(index + 1) % 6 === 0 && (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <Badge variant="secondary" className="w-fit text-xs mb-2">
            Sponsored Content
          </Badge>
          <CardTitle className="text-lg">Ad Title Here</CardTitle>
          <CardDescription>Ad description...</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            Learn More
          </Button>
        </CardContent>
      </Card>
    )}
  </React.Fragment>
))}
```

**Spacing**:
- Same gap as article cards (gap-6)
- Clear "Sponsored" label
- Blends naturally with content grid

---

### **4. Sidebar Ads (Desktop Only)**
**Location**: Right sidebar on desktop (≥1024px)
**Type**: Sticky sidebar ad
**Size**: 300x250px (medium rectangle) or 300x600px (half-page)

**Implementation**:
```jsx
<div className="hidden lg:block">
  <aside className="sticky top-20 w-[300px]">
    <div className="space-y-6">
      {/* Sidebar Ad 1 */}
      <Card className="border-dashed border-2">
        <CardHeader className="pb-2">
          <span className="text-xs text-muted-foreground">Sponsored</span>
        </CardHeader>
        <CardContent className="min-h-[250px] flex items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            Advertisement
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Ad 2 - Lower on scroll */}
      <Card className="border-dashed border-2">
        <CardHeader className="pb-2">
          <span className="text-xs text-muted-foreground">Sponsored</span>
        </CardHeader>
        <CardContent className="min-h-[250px] flex items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            Advertisement
          </div>
        </CardContent>
      </Card>
    </div>
  </aside>
</div>
```

**Spacing**:
- Sticky positioning (stays visible while scrolling)
- **Hidden on mobile** to avoid cluttering
- 24px gap between ads
- Top offset to account for sticky navbar

---

### **5. Footer Ads - Anchor Banner (Optional)**
**Location**: Fixed bottom banner (mobile)
**Type**: Collapsible anchor ad
**Size**: 320x50px

**Implementation**:
```jsx
{/* Mobile Anchor Ad - Fixed Bottom */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg">
  <div className="relative">
    {/* Close Button */}
    <button
      onClick={() => setAnchorAdVisible(false)}
      className="absolute -top-8 right-2 bg-background border rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
    >
      ×
    </button>

    {/* Ad Content */}
    <div className="p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">Sponsored</span>
      </div>
      <div className="min-h-[50px] flex items-center justify-center bg-muted rounded">
        <p className="text-sm text-muted-foreground">Advertisement</p>
      </div>
    </div>
  </div>
</div>
```

**Spacing**:
- 8px padding around ad
- Close button accessible (above ad, easy to tap)
- **Only shows after user scrolls 50%** of page (not immediately)
- Respects user's close action (doesn't reappear)

---

## 🎨 Visual Design Guidelines

### Colors & Borders
```css
/* Ad Container Styles */
.ad-container {
  background: hsl(var(--muted) / 0.3);
  border: 1px dashed hsl(var(--border));
  border-radius: 0.5rem;
}

/* Sponsored Label */
.sponsored-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Spacing System
```css
/* Mobile-First Spacing */
--ad-spacing-mobile: 1rem;    /* 16px */
--ad-spacing-tablet: 1.5rem;  /* 24px */
--ad-spacing-desktop: 2rem;   /* 32px */

/* Vertical Rhythm */
.ad-section {
  margin-top: var(--ad-spacing-mobile);
  margin-bottom: var(--ad-spacing-mobile);
}

@media (min-width: 768px) {
  .ad-section {
    margin-top: var(--ad-spacing-tablet);
    margin-bottom: var(--ad-spacing-tablet);
  }
}
```

---

## ⚡ Performance Optimizations

### 1. Lazy Loading
```jsx
// Only load ads when in viewport
const AdContainer = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load 200px before visible
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={adRef}>
      {isVisible ? children : <div className="min-h-[50px]" />}
    </div>
  );
};
```

### 2. Ad Blocker Fallback
```jsx
const AdComponent = () => {
  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    // Check if ad failed to load
    const timer = setTimeout(() => {
      // If ad didn't load, show fallback
      setAdBlocked(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (adBlocked) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Support us by disabling your ad blocker
          </p>
        </CardContent>
      </Card>
    );
  }

  return <div>{/* Ad script */}</div>;
};
```

---

## 📏 Responsive Breakpoints

```jsx
const AdSlot = () => {
  return (
    <>
      {/* Mobile: 320x50 */}
      <div className="block sm:hidden min-h-[50px]">
        {/* Mobile ad */}
      </div>

      {/* Tablet: 728x90 */}
      <div className="hidden sm:block lg:hidden min-h-[90px]">
        {/* Tablet ad */}
      </div>

      {/* Desktop: 970x90 */}
      <div className="hidden lg:block min-h-[90px]">
        {/* Desktop ad */}
      </div>
    </>
  );
};
```

---

## 🚫 What to AVOID

❌ **Popup/Overlay Ads** - Intrusive, especially on mobile
❌ **Auto-play Video Ads** - Annoying, data-hungry
❌ **Ads in Critical Paths** - Never block symptom checker, clinic finder
❌ **Too Many Ads** - Max 1 ad per viewport on mobile
❌ **Ads Above Hero** - Let users see content first
❌ **Sticky Top Banners** - Reserve top for navigation only

---

## ✅ Recommended Ad Placements (Priority Order)

### Phase 1 (Launch)
1. ✅ **Hero Section Bottom Banner** - High visibility, non-intrusive
2. ✅ **Between Sections (1-2 max)** - Natural content breaks
3. ✅ **Health News Inline Ads** - Blends with content

### Phase 2 (Growth)
4. ✅ **Desktop Sidebar Ads** - Desktop-only, doesn't affect mobile UX
5. ✅ **Mobile Anchor Ad** - Opt-in, collapsible, shows after scroll

### Phase 3 (Optimization)
6. ✅ **Sponsored Health Tips** - Native, value-added content
7. ✅ **Clinic Listings Sponsorship** - Featured clinics (marked as sponsored)

---

## 📊 Success Metrics

### User Experience Metrics
- **Page Load Time**: <3 seconds (maintain with lazy loading)
- **Cumulative Layout Shift (CLS)**: <0.1 (reserve space for ads)
- **Bounce Rate**: <40% (ads shouldn't drive users away)

### Ad Performance Metrics
- **Viewability Rate**: >70% (ads actually seen)
- **Click-Through Rate (CTR)**: 1-3% (industry standard)
- **Revenue Per Thousand (RPM)**: Track per placement

---

## 🛠️ Implementation Component

```tsx
// src/components/AdSlot.tsx
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdSlotProps {
  type: 'banner' | 'card' | 'native' | 'sidebar';
  className?: string;
  closeable?: boolean;
}

export const AdSlot = ({ type, className, closeable = false }: AdSlotProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true);
          // Load ad script here
        }
      },
      { rootMargin: '200px' }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [isLoaded]);

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

  return (
    <div ref={adRef} className={className}>
      <Card className={`border-dashed border-2 border-primary/20 ${type === 'native' ? 'bg-muted/20' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">Sponsored</Badge>
            {closeable && (
              <button
                onClick={() => setIsVisible(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
                aria-label="Close ad"
              >
                ×
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`${getMinHeight()} flex items-center justify-center bg-muted/30 rounded`}>
            {isLoaded ? (
              <div id={`ad-slot-${type}`} className="w-full">
                {/* Ad content loads here */}
                <div className="text-center text-sm text-muted-foreground py-4">
                  Advertisement
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 📝 Proposed Usage in Your App

```tsx
// src/pages/Index.tsx
import { AdSlot } from '@/components/AdSlot';

<main>
  <Hero language={language} />

  {/* Ad 1: After Hero */}
  <div className="py-4 bg-muted/20">
    <div className="container px-4">
      <AdSlot type="banner" closeable />
    </div>
  </div>

  <SymptomChecker language={language} />

  {/* Ad 2: Between Sections */}
  <div className="py-8">
    <div className="container px-4">
      <AdSlot type="card" className="max-w-4xl mx-auto" />
    </div>
  </div>

  <HealthPrompt language={language} />
  <ClinicLocator language={language} />

  {/* Health News with Inline Ads handled in component */}
  <HealthNews language={language} />
</main>
```

---

## 🎯 Summary

This strategy ensures:
- ✅ **Mobile-first**: All ads are optimized for small screens
- ✅ **Non-intrusive**: Ads don't block content or interfere with UX
- ✅ **Performance**: Lazy-loaded, minimal impact on page speed
- ✅ **Revenue-optimized**: Strategic placements for maximum viewability
- ✅ **User-friendly**: Clear labels, easy close buttons, respectful timing

**Ready to implement?** Let me know if you approve this strategy, and I'll:
1. Create the AdSlot component
2. Integrate ads in the proposed locations
3. Implement lazy loading and performance optimizations
