# Serenvale Rebranding Guide

This guide explains how to rebrand Serenvale for your own organization. The system supports both **environment variable configuration** and **manual file replacement**.

---

## Quick Start: Environment Variables

The easiest way to rebrand is using environment variables. Create a `.env.local` file:

```bash
# Application Branding
NEXT_PUBLIC_APP_NAME=Your Clinic Name
NEXT_PUBLIC_CLOUD_NAME=Your Clinic Cloud
NEXT_PUBLIC_ORG_NAME=Your Organization

# Contact Information
NEXT_PUBLIC_BUSINESS_EMAIL=info@yourclinic.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourclinic.com

# Legal Pages (optional)
NEXT_PUBLIC_HELP_URL=https://yourclinic.com/help
NEXT_PUBLIC_PRIVACY_URL=https://yourclinic.com/privacy
NEXT_PUBLIC_TERMS_URL=https://yourclinic.com/terms

# Social Media (optional)
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourorg
NEXT_PUBLIC_X_URL=https://x.com/yourorg
```

**That's it!** Restart your dev server and the new branding will appear.

---

## Complete Rebranding Checklist

### ✅ 1. Application Name & Metadata

**Environment Variables:**
- `NEXT_PUBLIC_APP_NAME` - Main application name
- `NEXT_PUBLIC_CLOUD_NAME` - Cloud service name
- `NEXT_PUBLIC_ORG_NAME` - Organization name

**Files to Check:**
- `package.json` - Update `name`, `description`, `author`, `homepage`, `repository`
- `src/app/manifest.ts` - Update PWA manifest description

**Where it appears:**
- Browser tab titles
- Page headers
- Meta tags for SEO
- PWA manifest
- About page

---

### ✅ 2. Logos & Icons

**Important:** Logos cannot be changed via environment variables. You must replace files.

#### Required Icon Files

Replace these files in `/public/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16x16, 32x32 | Browser tab icon (production) |
| `favicon-dev.ico` | 16x16, 32x32 | Browser tab icon (development) |
| `favicon-32x32.ico` | 32x32 | Alternative favicon |
| `favicon-32x32-dev.ico` | 32x32 | Alternative favicon (dev) |
| `apple-touch-icon.png` | 180x180 | iOS home screen icon |
| `icons/icon-192x192.png` | 192x192 | PWA icon (small) |
| `icons/icon-192x192.maskable.png` | 192x192 | PWA icon (small, maskable) |
| `icons/icon-512x512.png` | 512x512 | PWA icon (large) |
| `icons/icon-512x512.maskable.png` | 512x512 | PWA icon (large, maskable) |
| `og/cover.png` | 1200x630 | Social media preview image |

#### Optional Screenshot Files

Replace these in `/public/screenshots/` for app store listings:

- `shot-1.mobile.png` through `shot-5.mobile.png` (mobile screenshots)
- `shot-1.desktop.png` through `shot-5.desktop.png` (desktop screenshots)

**Icon Design Guidelines:**
- Use simple, recognizable designs
- Ensure readability at small sizes (16x16)
- Use consistent color scheme
- Maskable icons: Keep important content in the "safe zone" (80% of canvas)
- Recommended: Use a logo generator tool or hire a designer

**Quick Tip:** Tools like [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/) can generate all icon sizes from a single image.

---

### ✅ 3. Contact Information

**Environment Variables:**
- `NEXT_PUBLIC_BUSINESS_EMAIL` - General business inquiries
- `NEXT_PUBLIC_SUPPORT_EMAIL` - Technical support

**Where it appears:**
- Contact forms
- Help menus
- Footer
- Error pages

---

### ✅ 4. Legal & Help Links

**Environment Variables:**
- `NEXT_PUBLIC_HELP_URL` - Help documentation URL
- `NEXT_PUBLIC_PRIVACY_URL` - Privacy policy URL
- `NEXT_PUBLIC_TERMS_URL` - Terms of service URL

Leave empty to hide these links.

**Where it appears:**
- Footer
- Settings page
- Profile menu

---

### ✅ 5. Social Media Links

**Environment Variables:**
- `NEXT_PUBLIC_DISCORD_URL`
- `NEXT_PUBLIC_GITHUB_URL`
- `NEXT_PUBLIC_MEDIUM_URL`
- `NEXT_PUBLIC_X_URL`
- `NEXT_PUBLIC_YOUTUBE_URL`

Leave empty to hide these links.

**Where it appears:**
- Footer
- About page
- Social sharing

---

### ✅ 6. Documentation & Rules

**Files to update:**
- `.cursor/rules/project-introduce.mdc` - Project description for AI assistants
- `.cursor/rules/project-structure.mdc` - Project structure documentation
- `README.md` - Main project readme (if you have one)
- `CLAUDE.md` - Development guidelines

---

### ✅ 7. Default Language

**File:** `src/const/locale.ts`

Change `DEFAULT_LANG` to your preferred language:

```typescript
export const DEFAULT_LANG = 'fr-FR'; // French
// Options: 'en-US', 'fr-FR', 'es-ES', 'de-DE', 'zh-CN', etc.
```

Supported languages: English, French, Spanish, German, Chinese, Japanese, Korean, Arabic, Portuguese, Russian, Turkish, Polish, Dutch, Italian, Vietnamese, Bulgarian, Persian

---

## Advanced: Code-Level Branding

If you need to customize beyond environment variables, edit:

**Core Branding File:**
- `packages/const/src/branding.ts` - All branding constants with env fallbacks

**Manifest & Metadata:**
- `src/app/manifest.ts` - PWA manifest configuration
- `src/app/[variants]/metadata.ts` - SEO metadata

**Localization:**
- `src/locales/default/` - All UI text strings (English)
- `locales/fr-FR/` - French translations
- `locales/*/` - Other language translations

---

## Logo Upload Feature (Future)

Currently, logos must be replaced manually as files. A future enhancement could add:

1. **Settings Page** - Upload logos directly in the UI
2. **Database Storage** - Store custom logos per clinic/organization
3. **Dynamic Favicon** - Generate favicons from uploaded logos

**Want this feature?** Open an issue or submit a PR!

---

## Testing Your Rebrand

After making changes:

1. **Restart dev server:** `bun run dev`
2. **Check these pages:**
   - Home page - Application name in header
   - Browser tab - New favicon and title
   - Settings page - Contact emails
   - About page - Organization name
   - PWA manifest - `http://localhost:3010/manifest.json`
3. **Clear browser cache** if changes don't appear
4. **Hard refresh:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

---

## Example: Complete Rebrand

**Scenario:** Rebranding to "MediScan Radiology"

**1. Create `.env.local`:**

```bash
# Application Branding
NEXT_PUBLIC_APP_NAME=MediScan
NEXT_PUBLIC_CLOUD_NAME=MediScan Cloud
NEXT_PUBLIC_ORG_NAME=MediScan Radiology Inc.

# Contact
NEXT_PUBLIC_BUSINESS_EMAIL=contact@mediscan-radiology.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@mediscan-radiology.com

# Legal
NEXT_PUBLIC_HELP_URL=https://mediscan-radiology.com/help
NEXT_PUBLIC_PRIVACY_URL=https://mediscan-radiology.com/privacy
NEXT_PUBLIC_TERMS_URL=https://mediscan-radiology.com/terms
```

**2. Replace logos in `/public/`:**
- Use your MediScan logo to generate all icon sizes
- Replace all files listed in the "Required Icon Files" table above

**3. Update `package.json`:**

```json
{
  "name": "@mediscan/radiology",
  "description": "MediScan - AI-powered radiology reporting system",
  "author": "MediScan Radiology Inc. <contact@mediscan-radiology.com>",
  "homepage": "https://mediscan-radiology.com",
  "repository": {
    "type": "git",
    "url": "https://github.com/mediscan/radiology.git"
  }
}
```

**4. Restart and test:**

```bash
bun run dev
# Visit http://localhost:3010
```

---

## Troubleshooting

**Changes not appearing?**
1. Check that environment variables start with `NEXT_PUBLIC_`
2. Restart your development server after changing `.env.local`
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check browser console for errors

**Icons not updating?**
1. Ensure filenames match exactly (case-sensitive)
2. Clear browser cache completely
3. Check file sizes are correct (e.g., 192x192 pixels)
4. Ensure files are PNG or ICO format (not JPEG)

**Want to reset to defaults?**
1. Delete `.env.local`
2. Restart dev server
3. Fallback values from `packages/const/src/branding.ts` will be used

---

## Need Help?

- **Issues:** https://github.com/xmoroix/Serenvale/issues
- **Discussions:** https://github.com/xmoroix/Serenvale/discussions
- **Email:** support@serenvale.com

---

**Built with ❤️ on the LobeChat framework**
