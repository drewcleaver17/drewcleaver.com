// These identifiers are public, not secrets. Fill them only from Drew's Google
// properties. Blank values keep the integrations inactive until account setup.
export const integrations = {
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
};

// Public search sitemap entries; unrelated to visitor tracking.
export const publicPages = ['/', '/about/', '/services/', '/contact/', '/hello/', '/privacy/'];

if (integrations.googleSiteVerification && !/^[A-Za-z0-9_-]+$/.test(integrations.googleSiteVerification)) {
  throw new Error('Use only the content value from the Google site verification tag.');
}
