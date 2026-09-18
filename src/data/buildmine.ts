// Shared by the intake and its downloadable brief. Keep these seven prompts
// stable enough to compare pilot submissions; never store answers in this repo.
export const buildmineQuestions = [
  {
    id: 'purpose',
    title: 'What would you like this website to make possible?',
    help: 'A new role, more clients, a home for your work, better introductions—or something else. What would make it worth having?',
    placeholder: 'I want a place where…',
  },
  {
    id: 'audience',
    title: 'Who is it for, and what should they do next?',
    help: 'Picture one person arriving. Where did they find you? What should they understand, and what is the most useful next step?',
    placeholder: 'The person I most want to reach is…',
  },
  {
    id: 'story',
    title: 'What should people know about you beyond your résumé?',
    help: 'Your story, interests, convictions, or the way you work. How do you sound when you’re being yourself? A few unpolished sentences are welcome.',
    placeholder: 'Something my résumé doesn’t capture is…',
  },
  {
    id: 'proof',
    title: 'What work or experience should speak for you?',
    help: 'Choose the projects, achievements, services, or ideas that matter most. Add links to work, a portfolio, or public profiles. Point out anything in your résumé that needs updating.',
    placeholder: 'I’d like to highlight…',
  },
  {
    id: 'aesthetic',
    title: 'What should your website look and feel like?',
    help: 'Describe the mood, colors, typography, imagery, or energy you want. Share sites or other visual references you love—and anything you want to avoid.',
    placeholder: 'For example: bold type, warm colors, a little playful. I like this site because…',
  },
  {
    id: 'connection',
    title: 'How should people connect with you?',
    help: 'Which email, social links, or other contact details would you like to make public? Add the actual contact email and scheduling link in the preview editor. Would you like a contact form, a QR-friendly /hello page, or a scheduling link? “Help me decide” is fine.',
    placeholder: 'The main way to reach me should be…',
  },
  {
    id: 'boundaries',
    title: 'What should we plan around before building?',
    help: 'Do you own a domain or have a name in mind? Any timing or budget preferences? What should stay private, be left out, or wait until later? These planning notes stay in your brief; they are not automatically interpreted. Review the public text before sharing your preview.',
    placeholder: 'My domain is… / I need help choosing one. Please keep… private.',
  },
] as const;
