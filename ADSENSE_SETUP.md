# Google AdSense Integration Guide

## Overview
This project includes Google AdSense integration with responsive ad banners that blend seamlessly with the hacker theme while maintaining production-ready performance.

## Setup Instructions

### 1. Get Your Google AdSense Client ID

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in with your Google account
3. Complete the setup and verification process
4. Navigate to **Settings > Account** to find your **Client ID** (format: `ca-pub-xxxxxxxxxxxxxxxxxx`)

### 2. Configure Environment Variables

Add the following to your `.env.local` file (or Vercel environment variables):

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxxxx
```

**Important:** The `NEXT_PUBLIC_` prefix is required so the AdSense script can access this value in the browser.

### 3. Create AdSense Ad Units

In your Google AdSense dashboard, create ad units and note their slot IDs:

- **Header Ad Slot**: Used below the main header
- **Chat Ad Slot**: Used below the chat window
- **Sidebar Ad Slot** (optional): Used in the desktop sidebar

For each ad unit, you'll get a slot ID (numeric value).

### 4. Update Ad Slots in Code

Update the AdBanner component props in `/app/page.tsx`:

```tsx
// Header ad
<AdBanner slot="YOUR_HEADER_SLOT_ID" format="auto" />

// Chat window ad
<AdBanner slot="YOUR_CHAT_SLOT_ID" format="auto" />

// Sidebar ad (optional)
<AdBanner slot="YOUR_SIDEBAR_SLOT_ID" format="vertical" />
```

## AdBanner Component API

```tsx
<AdBanner
  slot="1234567890"              // Required: Your AdSense slot ID
  format="auto"                   // Optional: 'auto', 'horizontal', 'vertical', 'rectangle'
  responsive={true}              // Optional: Enable responsive ads
  className="custom-classes"      // Optional: Additional Tailwind classes
/>
```

### Supported Formats

- **auto**: Automatically adjust size based on container
- **horizontal**: 728x90, 970x90
- **vertical**: 120x600, 160x600, 300x600
- **rectangle**: 300x250, 336x280

## Features

✅ **Production Ready**
- Uses `next/script` with `afterInteractive` strategy for optimal performance
- Conditional loading only when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is configured
- Error handling with console warnings for debugging

✅ **Fully Responsive**
- Mobile-friendly ad sizing
- Automatic format detection
- Container-aware scaling

✅ **Hydration Safe**
- Client-side only rendering
- No SSR conflicts
- Safe `adsbygoogle` push in useEffect

✅ **Theme Compatible**
- Blends with dark hacker aesthetic
- Subtle borders and backgrounds
- Maintains visual hierarchy

## Verification

To verify AdSense is working:

1. Visit your live website
2. Open DevTools (F12)
3. Check the Console for AdSense messages
4. Ads should load within 30 seconds
5. Monitor in Google AdSense dashboard under **Ads.txt** and **Payments** tabs

## Troubleshooting

### Ads Not Showing

**Problem**: No ads appear on the page
- Verify `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set correctly
- Check that slot IDs match your AdSense account
- Ensure ads have time to load (min 30 seconds)
- Check browser console for errors

**Problem**: "Invalid slot ID" error
- Verify slot ID format (should be numeric)
- Ensure ad unit exists in AdSense dashboard
- Check that ad unit is approved and active

**Problem**: Ads not loading on localhost
- AdSense requires a public domain
- Deploy to Vercel or use ngrok for testing
- Use AdSense sandboxing for local development

### Performance Issues

- Ad script uses `afterInteractive` strategy to load after page is interactive
- Ads load asynchronously and don't block page rendering
- Implement lazy loading if needed for multiple ads

## Best Practices

1. **Ad Placement**: Place ads where users naturally look
2. **Native Content**: Ads should blend with your content
3. **Mobile Priority**: Ensure ads work well on mobile
4. **No Click Stimulation**: Don't encourage artificial clicks
5. **Monitor Performance**: Check earnings and CTR regularly

## Testing with AdSense Sandbox

For development/testing without real ads:

```bash
# Use test slot ID for development
<AdBanner slot="test" format="auto" />
```

Then enable "Test mode" in AdSense settings.

## Deployment

### Vercel

1. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` in Vercel project settings
2. Redeploy to apply environment variables
3. Verify ads load on production domain

### Self-Hosted

1. Add environment variables to your deployment
2. Ensure domain is registered with AdSense
3. Update ads.txt if required by AdSense

## Support

For AdSense support: [Google AdSense Help Center](https://support.google.com/adsense)
For implementation issues: Check browser console and AdSense dashboard
