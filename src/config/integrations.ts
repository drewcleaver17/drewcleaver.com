// These identifiers are public, not secrets. Fill them only from Drew's Google
// properties. Blank values keep the integrations inactive until account setup.
export const integrations = {
  googleAnalyticsId: import.meta.env.PUBLIC_GA_MEASUREMENT_ID || 'G-N55MYYB3SG',
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '',
};

if (integrations.googleAnalyticsId && !/^G-[A-Z0-9]+$/.test(integrations.googleAnalyticsId)) {
  throw new Error('Use the GA4 web stream Measurement ID, beginning with G-.');
}
if (integrations.googleSiteVerification && !/^[A-Za-z0-9_-]+$/.test(integrations.googleSiteVerification)) {
  throw new Error('Use only the content value from the Google site verification tag.');
}

export const analyticsEnabled = Boolean(integrations.googleAnalyticsId);
export const publicPages = ['/', '/about/', '/services/', '/contact/', '/hello/', '/privacy/'];
