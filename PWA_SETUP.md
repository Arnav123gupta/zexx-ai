# NETWORK GPT - PWA (Progressive Web App) Setup Guide

## Overview

NETWORK GPT is fully configured as a Progressive Web App with complete offline support, installable interface, and dark hacker theme (#000000 background with #00ff00 neon green accents).

## Installation

### Chrome/Edge Desktop
1. Visit the deployed application
2. Click the **Install** button in the address bar (or three-dot menu → "Install app")
3. App installs as a native desktop application
4. Opens in standalone window without browser UI

### Android
1. Visit the deployed application in Chrome
2. Tap the three-dot menu → **"Install app"** or **"Add to Home screen"**
3. App appears on home screen as a native app
4. Opens in full-screen standalone mode

### iOS/iPadOS
1. Open Safari browser
2. Visit the deployed application
3. Tap Share button → **"Add to Home Screen"**
4. App icon appears on home screen
5. Opens in full-screen standalone mode

## Features

### Offline Support
- **Service Worker**: Caches all critical assets on first load
- **Network-First Strategy**: API calls use cached responses when offline
- **Cache-First Strategy**: Static assets, images, and styles load instantly from cache
- **Persistent Cache**: Maintains 50MB+ cache for extended offline sessions

### App Icons
- **192x192px**: Mobile app icons, splash screens
- **512x512px**: Large display tiles, store listings
- **180x180px**: iOS home screen (Apple icon)
- Dark hacker theme with neon green accent (#00ff00)

### Manifest Configuration
- **Display Mode**: Standalone (full-screen app experience)
- **Theme Color**: #000000 (black background)
- **Background Color**: #000000 (black splash screen)
- **Orientation**: Portrait-primary (mobile-first)
- **App Shortcuts**: New Chat, Bug Bounty Guide quick actions
- **Share Target**: Accept shared content directly from other apps

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Cache-Control: Proper caching for all asset types

## File Structure

\`\`\`
project/
├── public/
│   ├── manifest.json          # PWA manifest with icons and configuration
│   ├── sw.js                  # Service worker (offline support)
│   ├── icon-192x192.png       # Mobile app icon
│   ├── icon-512x512.png       # Large display icon
│   ├── apple-icon.png         # iOS home screen icon
│   └── [other assets]
├── app/
│   ├── layout.tsx             # PWA meta tags and SW registration
│   ├── page.tsx               # Main app
│   └── [routes]
├── next.config.mjs            # PWA optimizations and caching headers
└── [configuration files]
\`\`\`

## Development

### Local Testing

1. **Build the project**:
   \`\`\`bash
   npm run build
   npm run start
   \`\`\`

2. **Test service worker** (Chrome DevTools):
   - Open DevTools (F12)
   - Go to Application → Service Workers
   - Verify "sw.js" is active
   - Toggle "Offline" to test offline mode

3. **Test installation**:
   - Check Address bar for install prompt
   - DevTools → Application → Manifest to verify manifest.json
   - Check icons are properly referenced

4. **Test offline functionality**:
   - Enable offline mode in DevTools
   - Verify cached pages load
   - Verify static assets load from cache
   - Test API fallback behavior

### Production Deployment (Vercel)

1. **Build and deploy**:
   \`\`\`bash
   git push origin main
   \`\`\`

2. **Verify PWA on Vercel**:
   - Visit deployed URL
   - Check install prompt appears
   - Install as app and verify functionality
   - Test offline mode with DevTools
   - Check manifest.json loads correctly

3. **Monitor Service Worker**:
   - Check DevTools Application tab
   - Verify cache storage size
   - Monitor network requests to cached endpoints

## Testing Checklist

- [ ] Service worker registers successfully
- [ ] Offline page loads without network
- [ ] API calls return cached responses when offline
- [ ] Install button appears in browser
- [ ] App installs successfully on desktop
- [ ] App installs successfully on Android
- [ ] App installs successfully on iOS (via Share)
- [ ] App launches in full-screen standalone mode
- [ ] Theme colors match design (#000000, #00ff00)
- [ ] Icons display correctly on home screen
- [ ] Cache storage uses expected size
- [ ] Uninstall removes app and cache cleanly
- [ ] App shortcuts work (New Chat, Bug Bounty)

## Performance Metrics

### Lighthouse PWA Score
- **Target**: 90+ on Lighthouse PWA audit
- **Install Prompt**: Appears after 2-3 visits
- **Cache Size**: ~5-10MB cached assets
- **Load Time**: <2s with offline cache

### Network Requirements
- **Initial Load**: ~1-2MB
- **Subsequent Loads**: <100KB (mostly HTML from service worker)
- **Cache Storage**: 50MB available (browser-dependent)

## Troubleshooting

### Install Button Not Appearing
1. Check manifest.json loads without errors
2. Verify service worker is active
3. Ensure app isn't already installed
4. Check HTTPS is enabled (required for PWA)

### Service Worker Not Updating
1. Clear browser cache (DevTools → Network → Disable cache)
2. Unregister old service worker (DevTools → Application → Service Workers → Unregister)
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Deploy new version with updated sw.js

### Offline Mode Not Working
1. Verify service worker is active in DevTools
2. Check cache storage size in Application tab
3. Verify routes are in cache-first strategy
4. Test with specific routes in offline mode

### Icons Not Displaying
1. Verify icon files exist in `/public/`
2. Check manifest.json icon paths
3. Clear browser cache and reinstall app
4. Verify icon dimensions (192x192, 512x512)

## Security Considerations

- **HTTPS Required**: Service workers only work over HTTPS (or localhost)
- **Scope Limitation**: Service worker only handles requests within `/` scope
- **Cache Isolation**: Each domain has separate cache storage
- **Headers Applied**: Security headers prevent XSS, clickjacking, MIME-type sniffing
- **Content Policy**: CSP headers can be added for additional security

## Browser Support

| Browser | Desktop | Mobile | Support |
|---------|---------|--------|---------|
| Chrome  | ✅      | ✅     | Full PWA support |
| Edge    | ✅      | ✅     | Full PWA support |
| Firefox | ✅      | ✅     | Full PWA support |
| Safari  | ✅      | ✅     | Partial (iOS via Share) |
| Samsung | N/A     | ✅     | Full PWA support |

## Future Enhancements

- [ ] Add background sync for pending requests
- [ ] Implement push notifications
- [ ] Add media (audio/video) caching
- [ ] Dynamic cache versioning
- [ ] Periodic background updates
- [ ] Geolocation caching
- [ ] Camera/microphone permission handling
