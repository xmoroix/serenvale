// Serenvale Radiology Reporting System
// Built on LobeChat framework
//
// Branding Configuration:
// - Can be overridden via environment variables (see .env.example)
// - Logos/icons: Replace files in /public/icons/ directory
// - See BRANDING.md for complete rebranding guide

// Application Name (appears in titles, headers, metadata)
export const BRANDING_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Serenvale';

// Cloud Service Name (for cloud features)
export const LOBE_CHAT_CLOUD = process.env.NEXT_PUBLIC_CLOUD_NAME || 'Serenvale Cloud';

// Organization Name (for copyright, attribution)
export const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || 'Serenvale';

// Custom logo URL (if empty, uses default icons from /public/icons/)
export const BRANDING_LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || '';

// Legal/Help URLs
export const BRANDING_URL = {
  help: process.env.NEXT_PUBLIC_HELP_URL || undefined,
  privacy: process.env.NEXT_PUBLIC_PRIVACY_URL || undefined,
  terms: process.env.NEXT_PUBLIC_TERMS_URL || undefined,
};

// Social Media URLs (set to undefined to hide)
export const SOCIAL_URL = {
  discord: process.env.NEXT_PUBLIC_DISCORD_URL || undefined,
  github: process.env.NEXT_PUBLIC_GITHUB_URL || undefined,
  medium: process.env.NEXT_PUBLIC_MEDIUM_URL || undefined,
  x: process.env.NEXT_PUBLIC_X_URL || undefined,
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
};

// Contact Email Addresses
export const BRANDING_EMAIL = {
  business: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@serenvale.com',
  support: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@serenvale.com',
};
