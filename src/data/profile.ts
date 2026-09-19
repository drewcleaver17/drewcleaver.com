// Public identity only. Keep credentials and private notes out of this file.
const address = { city: 'Austin', region: 'Texas', country: 'USA' } as const;
export const profile = {
  name: 'Drew Cleaver',
  givenName: 'Drew',
  familyName: 'Cleaver',
  initials: 'DC',
  location: `${address.city}, ${address.region}`,
  contactLocation: `${address.city}, ${address.region}, ${address.country}`,
  address,
  birthdayMonthDay: '--0717', // vCard 4.0 month/day only; no birth year.
  roles: 'Founder · Inventor · Racing driver',
  website: 'https://drewcleaver.com',
  email: 'drew@drewcleaver.com',
  bookingUrl: 'https://calendly.com/drewcleaver',
  linkedinUrl: 'https://www.linkedin.com/in/drewcleaver',
  instagramUrl: 'https://www.instagram.com/drew.cleaver/',
  githubUrl: 'https://github.com/drewcleaver17',
  inquiryEndpoint: 'https://formspree.io/f/xqabokqn',
  contactFile: '/drew-cleaver.vcf',
  resumeFile: '/Drew-Cleaver-Resume.pdf',
  description: 'Drew Cleaver is a founder, inventor, and racing driver. Explore his background, ask about founder advisory, send an inquiry, or schedule a conversation.',
} as const;

// Saved contact links. The résumé remains on the website, outside this card.
export const contactLinks = [
  { label: 'Website', url: profile.website },
  { label: 'LinkedIn', url: profile.linkedinUrl },
  { label: 'Instagram', url: profile.instagramUrl },
  { label: 'Schedule a conversation', url: profile.bookingUrl },
  { label: 'Send an inquiry', url: new URL('/contact/', profile.website).href },
  { label: 'About Drew', url: new URL('/about/', profile.website).href },
  { label: 'GitHub', url: profile.githubUrl },
] as const;
