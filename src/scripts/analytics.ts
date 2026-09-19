import { publicPages } from '../config/integrations';

type Choice = 'granted' | 'denied';
type Gtag = (...args: unknown[]) => void;
const KEY = 'dc-analytics-choice-v1';
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
const banner = document.querySelector<HTMLElement>('#analytics-choice');
const measurementId = banner?.dataset.measurementId || '';
const path = window.location.pathname.replace(/\/$/, '') + '/';
const eligible = ['drewcleaver.com', 'www.drewcleaver.com'].includes(window.location.hostname)
  && publicPages.includes(path) && /^G-[A-Z0-9]+$/.test(measurementId);

if (banner && eligible) {
  const prefs = document.querySelector<HTMLButtonElement>('#analytics-settings');
  const analyticsWindow = window as typeof window & { dataLayer?: unknown[]; gtag?: Gtag; [key: string]: unknown };
  const privacySignal = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
    || navigator.doNotTrack === '1';
  let choice: Choice | null = null;
  let started = false;
  let pageSent = false;
  let returnFocus: HTMLElement | null = null;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && ['granted', 'denied'].includes(saved.choice)
      && typeof saved.at === 'number' && saved.at <= Date.now() && Date.now() - saved.at < MAX_AGE) choice = saved.choice;
  } catch { /* Storage can be unavailable; default to no collection. */ }
  if (privacySignal) choice = 'denied';

  // Never send arbitrary query strings, fragments, form values or link text.
  const location = new URL(path, window.location.origin);
  const query = new URLSearchParams(window.location.search);
  const campaignValues: Record<string, readonly string[]> = {
    utm_source: ['reddit', 'linkedin', 'instagram', 'github', 'business_card', 'email'],
    utm_medium: ['social', 'organic_social', 'qr', 'email', 'referral'],
    utm_campaign: ['profile', 'business_card', 'introduction'],
    utm_content: ['website', 'linkedin', 'instagram'],
  };
  for (const [key, allowed] of Object.entries(campaignValues)) {
    const value = query.get(key)?.toLowerCase();
    if (value && allowed.includes(value)) location.searchParams.set(key, value);
  }
  let referrer = '';
  try { const url = new URL(document.referrer); if (['http:', 'https:'].includes(url.protocol)) referrer = url.origin + '/'; } catch { /* Direct visit. */ }
  const page = { page_location: location.href, page_referrer: referrer, page_title: document.title };
  const consent = (value: Choice) => ({ analytics_storage: value, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  const gtag: Gtag = function () { analyticsWindow.dataLayer!.push(arguments); };
  const setDisabled = (disabled: boolean) => { analyticsWindow[`ga-disable-${measurementId}`] = disabled; };
  setDisabled(true);

  const start = () => {
    if (choice !== 'granted' || privacySignal) return;
    setDisabled(false);
    if (!started) {
      started = true;
      analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
      analyticsWindow.gtag = gtag;
      gtag('consent', 'default', consent('denied'));
      gtag('consent', 'update', consent('granted'));
      gtag('js', new Date());
      gtag('config', measurementId, {
        ...page, send_page_view: false, allow_google_signals: false,
        allow_ad_personalization_signals: false, cookie_domain: window.location.hostname,
        cookie_expires: MAX_AGE / 1000, cookie_update: false, cookie_flags: 'SameSite=Lax;Secure',
      });
      const script = document.createElement('script');
      script.async = true;
      script.referrerPolicy = 'origin';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.append(script);
    } else gtag('consent', 'update', consent('granted'));
    if (!pageSent) { pageSent = true; gtag('event', 'page_view', page); }
  };
  const stop = () => {
    setDisabled(true);
    if (started) gtag('consent', 'update', consent('denied'));
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', window.location.hostname, '.drewcleaver.com']) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain ? `; Domain=${domain}` : ''}`;
      }
    }
  };
  const close = () => { banner.hidden = true; returnFocus?.focus(); returnFocus = null; };
  const save = (value: Choice) => {
    choice = privacySignal ? 'denied' : value;
    try { localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() })); } catch { /* Session choice still applies. */ }
    if (choice === 'granted') start(); else stop();
    close();
  };
  banner.querySelectorAll<HTMLButtonElement>('[data-analytics-choice]').forEach(button => {
    button.addEventListener('click', () => save(button.dataset.analyticsChoice as Choice));
  });
  if (prefs) {
    prefs.hidden = false;
    prefs.addEventListener('click', () => {
      returnFocus = prefs; banner.hidden = false;
      banner.querySelector<HTMLButtonElement>('[data-analytics-choice="denied"]')?.focus();
    });
  }
  banner.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  if (privacySignal) {
    banner.querySelector('p')!.textContent = 'Your browser’s privacy preference is keeping analytics off. You can use the entire site without analytics.';
    banner.querySelector<HTMLButtonElement>('[data-analytics-choice="granted"]')!.hidden = true;
    banner.querySelector<HTMLButtonElement>('[data-analytics-choice="denied"]')!.textContent = 'Keep analytics off';
  }
  if (choice === 'granted') start();
  else if (choice === 'denied') stop();
  else banner.hidden = false;
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    // A choice changed in another tab. Stop here until this page is revisited.
    choice = 'denied'; stop(); close();
  });

  const track = (event: string, values: Record<string, string> = {}) => {
    if (choice === 'granted' && started && !privacySignal) gtag('event', event, { ...page, ...values });
  };
  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor || event.defaultPrevented) return;
    let url: URL; try { url = new URL(anchor.getAttribute('href')!, window.location.href); } catch { return; }
    if (url.protocol === 'mailto:') track('email_click');
    else if (url.hostname === 'calendly.com' && url.pathname.startsWith('/drewcleaver')) track('schedule_click');
    else if (url.origin === window.location.origin) {
      if (url.pathname === '/drew-cleaver.vcf') track('contact_card_download');
      else if (url.pathname === '/Drew-Cleaver-Resume.pdf') track('resume_download');
      else if (url.pathname.replace(/\/$/, '') === '/contact' && path !== '/contact/') track('inquiry_click');
    } else if (url.hostname === 'www.linkedin.com') track('social_click', { social_network: 'linkedin' });
    else if (url.hostname === 'www.instagram.com') track('social_click', { social_network: 'instagram' });
  });
  document.addEventListener('site:inquiry-accepted', () => track('generate_lead'));
}
