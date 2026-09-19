export interface PortfolioProject {
  slug: string;
  number: string;
  name: string;
  category: string;
  title: string;
  summary: string;
  role: string;
  status: string;
  period: string;
  tags: string[];
  image?: { src: string; alt: string; width: number; height: number; caption: string };
  question: string;
  context: string;
  contribution: string;
  work: { title: string; text: string }[];
  record: string;
  evidence: { title: string; href: string; note: string }[];
  reviewNote?: string;
  takeaway: string;
}

const archive = '/archives/';
export const portfolio: PortfolioProject[] = [
  {
    slug: 'higher-hangers', number: '01', name: 'Higher Hangers',
    category: 'Consumer product · Commerce',
    title: 'A small everyday problem. A business built around it.',
    summary: 'A patented dorm-room idea developed into a consumer-products brand, with responsibility extending from the product to the business behind it.',
    role: 'Co-founder, inventor & operator',
    status: 'Commercial work', period: 'March 2015 – June 2026',
    tags: ['Product development', 'E-commerce', 'Business operations'],
    question: 'What if a familiar household product could make better use of limited closet space?',
    context: 'Higher Hangers began with a dorm-room idea and became a premium housewares brand. The work connected a physical product with the channels, systems and people needed to sell and support it.',
    contribution: 'I co-founded the business and owned its P&L and go-to-market strategy. My work spanned e-commerce, wholesale, the network of fractional specialists, and the software supporting sales and customer experience.',
    work: [
      { title: 'Product into a business', text: 'Developed the business around a patented product idea and funded the initial launch through Kickstarter.' },
      { title: 'Multiple routes to customers', text: 'Built the commercial operation across Shopify, Amazon, Walmart.com and wholesale retail, including The Container Store and Bed Bath & Beyond.' },
      { title: 'The operating system', text: 'Managed fractional specialists and SaaS tools supporting sales operations and customer experience.' },
    ],
    record: 'My published résumé records 30,000+ customers across 40+ countries. Those are career figures from my own record; the website archive will provide a separate view of the product presentation and storefront.',
    evidence: [
      { title: 'Published career history', href: '/about/', note: 'Role, dates, scope and reported business results.' },
      { title: 'Résumé · PDF', href: '/Drew-Cleaver-Resume.pdf', note: 'The current public record supporting this case study.' },
    ],
    reviewNote: 'A preserved Higher Hangers storefront is not included in this preview yet. An original export or recoverable historical capture can be added here without recreating the past from memory.',
    takeaway: 'A product portfolio is stronger when it shows the business behind the object: distribution, customer experience and operating responsibility.',
  },
  {
    slug: 'tesloco', number: '02', name: 'TESLOCO',
    category: 'Service concept · Brand & website',
    title: 'Making Tesla ownership feel more personal.',
    summary: 'A concierge service concept connecting road and track preparation with a more attentive ownership experience.',
    role: 'Founder / concept owner',
    status: 'Historical concept & website', period: 'Website recovered September 19, 2026',
    tags: ['Service design', 'Positioning', 'Customer journey'],
    image: {
      src: '/archives/assets/d840c11fed3097017818.png',
      alt: 'A blue Tesla on a racetrack, photographed from the front.',
      width: 1023, height: 682,
      caption: 'Original imagery from the preserved TESLOCO homepage.',
    },
    question: 'Could specialist vehicle services feel like one coherent ownership experience?',
    context: 'The original site brought together Tesla road and track services, consultation and hospitality. Its service menu covered protection, appearance and performance rather than presenting a single isolated upgrade.',
    contribution: 'TESLOCO is one of my business concepts. This case study presents the positioning, service structure and website that survive in the archive; it does not attribute every design or technical component to me individually.',
    work: [
      { title: 'A clear service proposition', text: 'Positioned concierge attention around Tesla ownership, with road and track needs under one brand.' },
      { title: 'A navigable service menu', text: 'Grouped offerings such as protective films, window tint, wheels and tires, suspension, brakes and lighting into a customer-facing service page.' },
      { title: 'An inquiry path', text: 'Connected the service story to a quote page. That historical form is preserved as an inactive artifact.' },
    ],
    record: 'The preserved homepage, services, About and quote pages document the concept. Some copy remained unfinished, including the About page. The archive is not evidence that every proposed service or expansion plan became an operating program.',
    evidence: [
      { title: 'Explore the website archive', href: '/tesloco/', note: 'Browse the recovered pages in their original visual context.' },
      { title: 'Original services page', href: archive + 'tesloco/2026-09-19/our-services/index.html', note: 'Preserved service categories and offering structure.' },
      { title: 'Original homepage', href: archive + 'tesloco/2026-09-19/index.html', note: 'Recovered from the surviving WordPress site on September 19, 2026. Recovery date is not the launch date.' },
    ],
    takeaway: 'The useful artifact is the relationship between a customer problem, a service menu and a next step someone can understand.',
  },
  {
    slug: 'spec-tesla-cup', number: '03', name: 'Spec Tesla Cup',
    category: 'Motorsport · Development project',
    title: 'Exploring what electric motorsport could become.',
    summary: 'Tesla track development, published testing notes and a proposed arrive-and-drive racing experience, preserved alongside the original website.',
    role: 'Founder & racing driver',
    status: 'Development work & proposed racing series', period: 'Archive captures: 2022–2026',
    tags: ['Motorsport', 'Testing', 'Experience design'],
    image: {
      src: '/archives/assets/8a0dcef0d26370a00d6f.jpg',
      alt: 'Two Tesla Model 3 cars in front of the Hallett circuit podium.',
      width: 1080, height: 810,
      caption: 'Original Hallett photograph from the Spec Tesla Cup website.',
    },
    question: 'What would it take to make a Tesla track experience repeatable and accessible to more drivers?',
    context: 'Spec Tesla combined vehicle development with a larger service idea: preparation, driving and hospitality in one experience. The site preserved both tangible track work and ambitious plans for a racing series.',
    contribution: 'I founded the project and participated as a racing driver. The archive connects the vehicle work and published test reports with the commercial concept. Component brands and other contributors retain their own work and credit.',
    work: [
      { title: 'A documented vehicle direction', text: 'Published a modification list spanning suspension, braking, safety equipment and cooling, making the project more inspectable than a concept alone.' },
      { title: 'Testing in context', text: 'Published track reports, including a February 2023 COTA test. The original reports remain available with their dates and wording.' },
      { title: 'The participant experience', text: 'Presented a proposed arrive-and-drive series with vehicle preparation and hospitality. Those plans are identified as proposals, not completed events.' },
    ],
    record: 'A project report dated February 6, 2023 describes a 24-minute COTA test. This is a contemporaneous project account, not independently audited telemetry. A homepage captured in February 2026 still contains 2023–2024 plans; its capture date does not establish that those plans happened.',
    evidence: [
      { title: 'Explore the website archive', href: '/specteslacup/', note: 'Earlier and later homepages, development notes and supporting pages.' },
      { title: 'COTA test report · February 2023', href: archive + 'specteslacup/2024-09-14/blogs/news/2-6-23-spec-tesla-torture-test-achieves-24-minutes-cota/index.html', note: 'Article dated February 6, 2023; Wayback capture September 14, 2024.' },
      { title: 'Vehicle modification list', href: archive + 'specteslacup/2023-03-08/pages/about-us/index.html', note: 'Historical build details captured March 8, 2023.' },
    ],
    takeaway: 'A development story becomes useful when readers can inspect the setup, the test report and the boundary between what was tested and what was proposed.',
  },
  {
    slug: 'buildmine', number: '04', name: 'Buildmine',
    category: 'Live software · Open-source starter',
    title: 'A personal website you can take with you.',
    summary: 'A working builder that turns a personal introduction into a preview and a portable website kit, with source and deployment guidance included.',
    role: 'Product direction · AI-assisted development',
    status: 'Live v1 · Source available', period: '2026',
    tags: ['Product design', 'Portable software', 'Public utility'],
    question: 'How much of the work of making a first personal website can be done before someone has to learn hosting?',
    context: 'Buildmine grew from making this personal website reusable. The goal is to let someone begin with their own story, review the result, then keep a copy they can understand and deploy.',
    contribution: 'I directed the product and used AI-assisted development to implement it. The public builder and starter source expose the resulting behavior for people to try, inspect and adapt.',
    work: [
      { title: 'Start with the person', text: 'Create a starter from a short introduction, with optional prompts and résumé import. Review and edit the public copy before exporting.' },
      { title: 'Keep the useful parts', text: 'Choose among three visual directions, save a project locally, and download a website kit with editable content and a dependency-free generator.' },
      { title: 'Leave with a way forward', text: 'Use the publishing guide, inspect the source, or host the generated static site elsewhere. Visible Buildmine credit is optional.' },
    ],
    record: 'The builder, fictional example and downloadable starter are live. The starter includes renderer tests, contribution guidance and an MIT license scoped to the starter. This first release does not claim an established user base or offer automatic managed hosting for every preview.',
    evidence: [
      { title: 'Try Buildmine', href: '/buildmine/', note: 'The working builder on this site.' },
      { title: 'View a fictional example', href: '/p/alex.rivera.example/', note: 'An explicitly fictional generated site, not a client testimonial.' },
      { title: 'Read the starter source', href: 'https://github.com/drewcleaver17/drewcleaver.com/tree/main/starter', note: 'Renderer, tests, license and contribution instructions.' },
      { title: 'Download the starter kit', href: '/buildmine/starter.zip', note: 'Portable code and a sample site. No account needed.' },
      { title: 'Deployment guide', href: '/buildmine/publish/', note: 'Steps for taking a reviewed kit to a host you control.' },
    ],
    takeaway: 'The public contribution is usable software with an exit path: take the files, understand the structure and make something of your own.',
  },
];
