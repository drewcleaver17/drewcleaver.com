export interface SavedVideo {
  id: string;
  title: string;
  channel: string;
  topics: string[];
  addedOn: string; // YYYY-MM-DD; date added to this library, not the upload date.
  durationSeconds?: number;
  embed: 'allowed' | 'unknown' | 'unavailable';
  summary?: {
    text: string;
    takeaways?: string[];
    basis: 'Watched video' | 'Transcript' | 'Drew’s notes' | 'Creator description' | 'Description & chapters' | 'Video listing';
    sourceUrl: string;
  };
  pendingSearch?: string; // Keep an unmatched screenshot selection without substituting a different upload.
  playbackNote?: string;
  context?: string; // Drew's supplied or approved reason for saving this video.
}

// Only include videos Drew has selected for this public collection.
// September 19, 2026: 48 selections transcribed from Drew’s seven screenshots.
// Verified uploads use their YouTube IDs; one unmatched selection has an explicit search fallback.
export const videos: SavedVideo[] = [
  {
    "id": "N3Wac20zrQA",
    "title": "Did Extraterrestrials Bring These Creatures to Earth? | Ancient Aliens Special Presentation (S1, E2)",
    "channel": "HISTORY",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 5059,
    "embed": "allowed",
    "summary": {
      "text": "Ancient Aliens explores the idea that unusual animals, ancient animal-like deities, and reports of strange creatures point to extraterrestrial influence. A speculative tour of that theory, including octopuses, insects, and Bigfoot.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=N3Wac20zrQA"
    }
  },
  {
    "id": "MGxcosNuC8k",
    "title": "Andrew Huberman: The Real Reason You Can't Get Deep Sleep & Wake Up Exhausted",
    "channel": "The Diary Of A CEO",
    "topics": [
      "Health & habits"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 8208,
    "embed": "allowed",
    "summary": {
      "text": "Andrew Huberman discusses daily routines for sleep, focus, stress, movement, and nutrition. The conversation also covers peptides, supplements, psychedelics, and religion; the episode description includes a separate research and fact-check document.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=MGxcosNuC8k"
    }
  },
  {
    "id": "davYNYeRy_s",
    "title": "Why We May Never Reach the Nearest Star Has a Deeply Unsettling Answer",
    "channel": "Milky Stellar",
    "topics": [
      "Science & space"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 2169,
    "embed": "allowed",
    "summary": {
      "text": "An exploration of Alpha Centauri and the enormous difficulty of reaching another star. The documentary considers the scale of the journey, the limits of spacecraft, and what a destination beyond our solar system might offer.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=davYNYeRy_s"
    }
  },
  {
    "id": "RvjR9GM2kX8",
    "title": "The Behaviour Expert: Instantly Read Any Room & How To Hack Your Discipline! Chase Hughes",
    "channel": "The Diary Of A CEO",
    "topics": [
      "Leadership & communication"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 7517,
    "embed": "allowed",
    "summary": {
      "text": "Chase Hughes discusses confidence, authority, listening, persuasion, and discipline. The conversation moves from reading social situations and understanding motivations to the habits that shape how people communicate and act.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=RvjR9GM2kX8"
    }
  },
  {
    "id": "UnURElCzGc0",
    "title": "Cosmos - Carl Sagan - 4th Dimension",
    "channel": "carlsagandotcom",
    "topics": [
      "Science & space"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 444,
    "embed": "allowed",
    "summary": {
      "text": "A short excerpt from Carl Sagan’s Cosmos introducing the fourth dimension.",
      "basis": "Video listing",
      "sourceUrl": "https://www.youtube.com/watch?v=UnURElCzGc0"
    }
  },
  {
    "id": "3917GUlD1l0",
    "title": "Roy Wood Jr.: Imperfect Messenger - Full Special",
    "channel": "Comedy Central Stand-Up",
    "topics": [
      "Comedy"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 3893,
    "embed": "allowed",
    "summary": {
      "text": "Roy Wood Jr.’s stand-up special moves between overlooked figures in civil-rights history, the Fast & Furious films, and a consequential encounter with a police officer.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=3917GUlD1l0"
    }
  },
  {
    "id": "rCtvAvZtJyE",
    "title": "No.1  Neuroscientist: you can change who you are in 30 days",
    "channel": "The Diary Of A CEO",
    "topics": [
      "Mind & consciousness",
      "Health & habits"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 7591,
    "embed": "allowed",
    "summary": {
      "text": "Lisa Feldman Barrett discusses the brain as a prediction system and how experience, language, and action can change its expectations. The interview also explores emotion, identity, stress, depression, and her concept of a body budget.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=rCtvAvZtJyE"
    }
  },
  {
    "id": "uuLQ_r8REvU",
    "title": "Man asks Mantid to see the true nature of Earth",
    "channel": "Mantis Encounters",
    "topics": [
      "UFOs & unexplained",
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 175,
    "embed": "allowed",
    "summary": {
      "text": "A short account of an alleged encounter with a mantid-like being. The uploader links to the source story and collects similar personal reports; this entry presents the account as an experience someone describes.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=uuLQ_r8REvU"
    }
  },
  {
    "id": "75NPYdFXhH0",
    "title": "The Secret Company that’s hiding UFOs from the World – The Maynard Consortium Exposed",
    "channel": "Jason Samosa",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 6581,
    "embed": "allowed",
    "summary": {
      "text": "Jason Samosa argues that the World Commerce Corporation and a hidden network connect intelligence history with UFO secrecy. His investigation also interprets Tom DeLonge’s Sekret Machines fiction as containing clues to that alleged network.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=75NPYdFXhH0"
    }
  },
  {
    "id": "XdfBAp2cQiU",
    "title": "The Alien Plan is in FULL Motion - David Icke | DEBRIEFED ep. 81",
    "channel": "Area52",
    "topics": [
      "UFOs & unexplained",
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 9248,
    "embed": "allowed",
    "summary": {
      "text": "David Icke outlines his worldview of simulated reality, nonphysical entities, and hidden control. The interview connects those claims with consciousness, spiritual traditions, and fears about AI; it is a presentation of Icke’s theories.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=XdfBAp2cQiU"
    }
  },
  {
    "id": "kcoklnfurwI",
    "title": "Are the Gods Really Returning? *Marathon* | Ancient Aliens",
    "channel": "HISTORY",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 10585,
    "embed": "allowed",
    "summary": {
      "text": "An Ancient Aliens marathon connecting stories of ancient gods and catastrophes with theories about extraterrestrial visitors returning to Earth. The episodes explore the series’ speculative interpretation of humanity’s past and future.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=kcoklnfurwI"
    }
  },
  {
    "id": "Rka1Zxrk2MU",
    "title": "(2004) the Dan Burisch interview with Bill Hamilton",
    "channel": "The Burisch Archive",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 6088,
    "embed": "allowed",
    "summary": {
      "text": "In this 2004 interview with Bill Hamilton, Dan Burisch describes alleged work involving nonhuman intelligence, Site 4, and Project Looking Glass. The archive presents his claims about secret programs and time manipulation.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=Rka1Zxrk2MU"
    }
  },
  {
    "id": "pending-karlous-miller",
    "title": "Karlous Miller | That's Funny | LOL StandUp!",
    "channel": "LOL Network Stand-Up!",
    "topics": [
      "Comedy"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 1879,
    "embed": "unavailable",
    "pendingSearch": "Karlous Miller That's Funny LOL StandUp 31:19"
  },
  {
    "id": "NqK1gyTYt8M",
    "title": "Brian Simpson | Live From The Mothership (Full Comedy Special)",
    "channel": "800 Pound Gorilla Media and BS with Brian Simpson",
    "topics": [
      "Comedy"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 4112,
    "embed": "allowed",
    "summary": {
      "text": "Brian Simpson’s stand-up special takes on masculinity, resentment, and the rules people impose on one another. An unfiltered performance recorded at the Comedy Mothership.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=NqK1gyTYt8M"
    }
  },
  {
    "id": "s9A51jN19zw",
    "title": "Tiananmen Massacre - Tank Man: The 1989 Chinese Student Democracy Movement",
    "channel": "Sarastarlight",
    "topics": [
      "History & civilizations"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 4721,
    "embed": "unavailable",
    "summary": {
      "text": "Rhawn Joseph’s film examines the 1989 Chinese student democracy movement, the Tiananmen crackdown, and the image of Tank Man. This is the long-form documentary uploaded by Sarastarlight.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=s9A51jN19zw"
    },
    "playbackNote": "YouTube sign-in may be required."
  },
  {
    "id": "S62hPhMT4zc",
    "title": "Patrice O’Neal: Killin’ is Easy - Full Documentary",
    "channel": "Comedy Central Stand-Up",
    "topics": [
      "Comedy"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 4957,
    "embed": "allowed",
    "summary": {
      "text": "Family, friends, and fellow comedians look back at Patrice O’Neal’s life and career. Bill Burr, Colin Quinn, Kevin Hart, and others discuss a gifted comic whose path could also be difficult and contentious.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=S62hPhMT4zc"
    }
  },
  {
    "id": "lmyZMtPVodo",
    "title": "Why good leaders make you feel safe | Simon Sinek | TED",
    "channel": "TED",
    "topics": [
      "Leadership & communication"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 720,
    "embed": "allowed",
    "summary": {
      "text": "Simon Sinek argues that trust grows when leaders make people feel protected and valued. Teams can then spend their energy on shared challenges instead of self-protection. Leadership, in his framing, is the choice to care for others, regardless of rank.",
      "basis": "Transcript",
      "sourceUrl": "https://www.ted.com/talks/simon_sinek_why_good_leaders_make_you_feel_safe/transcript?language=en",
      "takeaways": [
        "Trust and cooperation grow from the conditions a leader creates; they cannot simply be ordered.",
        "Protecting people from internal fear frees them to work on shared challenges.",
        "Sinek uses shared sacrifice during a downturn to illustrate leadership that puts people first."
      ]
    }
  },
  {
    "id": "qp0HIF3SfI4",
    "title": "How Great Leaders Inspire Action | Simon Sinek | TED",
    "channel": "TED",
    "topics": [
      "Leadership & communication"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 1115,
    "embed": "allowed",
    "summary": {
      "text": "Sinek’s central idea: start by explaining your purpose, then show how your actions and products express it. He argues that shared beliefs inspire loyalty and participation more effectively than a list of features, using Apple, the Wright brothers, and Martin Luther King Jr. as examples.",
      "basis": "Transcript",
      "sourceUrl": "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action/transcript?language=en",
      "takeaways": [
        "Clarify the belief or purpose behind the work before describing its features.",
        "Make actions consistent with that purpose so others have something concrete to trust.",
        "Sinek frames early adoption as finding people who identify with the underlying belief."
      ]
    }
  },
  {
    "id": "RyTQ5-SQYTo",
    "title": "Most Leaders Don't Even Know the Game They're In | Simon Sinek",
    "channel": "Simon Sinek",
    "topics": [
      "Leadership & communication"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 2109,
    "embed": "allowed",
    "summary": {
      "text": "In his 2016 Live2Lead keynote, Simon Sinek focuses on empathy and perspective as foundations for leadership. The talk asks what conditions help people trust one another and cooperate inside an organization.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=RyTQ5-SQYTo"
    }
  },
  {
    "id": "MucaZDoMzqg",
    "title": "The Ancient Origins of the Chinese People | Story of China w/ Michael Wood | Full Episode 1 | PBS",
    "channel": "PBS",
    "topics": [
      "History & civilizations"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 3312,
    "embed": "allowed",
    "summary": {
      "text": "Michael Wood traces the origins of the Chinese state through family rituals, ancient stories, archaeology, and early writing. The episode connects those beginnings to the First Emperor and traditions that continue in contemporary China.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=MucaZDoMzqg"
    }
  },
  {
    "id": "yyEI8TrCmxM",
    "title": "Patrice O'Neal: When Honesty Meets Comedy",
    "channel": "The Comedy Historian",
    "topics": [
      "Comedy"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 3913,
    "embed": "allowed",
    "summary": {
      "text": "A career retrospective on Patrice O’Neal’s distinctive comic voice. It follows his early work, television and film appearances, radio shows, stand-up specials, and the influence he had on other comedians.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=yyEI8TrCmxM"
    }
  },
  {
    "id": "GfH4QL4VqJ0",
    "title": "The Story of Python and how it took over the world | Python: The Documentary",
    "channel": "CultRepo",
    "topics": [
      "Technology & AI"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 5045,
    "embed": "allowed",
    "summary": {
      "text": "Python’s creators and contributors tell how a small programming project became a global language. The documentary follows its open-source community, scientific uses, difficult transitions, and debates over governance as its reach expanded into AI.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=GfH4QL4VqJ0"
    }
  },
  {
    "id": "1knIpTuzUW8",
    "title": "How Native Americans Read the Stars (And Built a Civilization) | Full Episode | Native America",
    "channel": "PBS Documentaries and PBS",
    "topics": [
      "History & civilizations"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 3236,
    "embed": "allowed",
    "summary": {
      "text": "The opening episode of Native America brings archaeology and Indigenous knowledge together to explore the earliest peoples of the Americas. It follows evidence of interconnected cultures, shared scientific knowledge, and spiritual traditions across two continents.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=1knIpTuzUW8"
    }
  },
  {
    "id": "2XS7s9S6q8Q",
    "title": "The Real History of Africa They Never Taught You | Full Documentary | Africa's Great Civilizations",
    "channel": "PBS Documentaries",
    "topics": [
      "History & civilizations"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 3191,
    "embed": "allowed",
    "summary": {
      "text": "Henry Louis Gates Jr. travels through Africa to explore human origins and the emergence of early societies. This first episode emphasizes the continent’s foundational cultural and scientific achievements.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=2XS7s9S6q8Q"
    }
  },
  {
    "id": "KMbeK_6ATxQ",
    "title": "Itzhak Bentov ~ From Atom To Cosmos",
    "channel": "nndmtube",
    "topics": [
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 6477,
    "embed": "allowed",
    "summary": {
      "text": "An archival presentation of Itzhak Bentov’s ideas about consciousness and the cosmos, introduced by his wife Mirtala. The uploader describes it as his final television appearance in 1978 and highlights his proposed holographic model of reality.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=KMbeK_6ATxQ"
    }
  },
  {
    "id": "loujaeBy8p0",
    "title": "5 Hacks To Use ChatGPT So Well It’s Almost Unfair",
    "channel": "Sandeep Swadia",
    "topics": [
      "Technology & AI"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 983,
    "embed": "allowed",
    "summary": {
      "text": "Sandeep Swadia presents five ways to make ChatGPT part of a thinking workflow: persistent personal context, coordinated research tools, a devil’s advocate, a learning partner, and an executive coach. His closing emphasis is on human judgment and empathy.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=loujaeBy8p0"
    }
  },
  {
    "id": "IJ-PacdW5Zk",
    "title": "Are Humans Evolving into Telepathic Beings? | Ancient Aliens (S14, E16)",
    "channel": "HISTORY",
    "topics": [
      "Mind & consciousness",
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 2522,
    "embed": "allowed",
    "summary": {
      "text": "The Ancient Aliens episode “The Alien Brain” explores claims about telepathy, precognition, and psychokinesis. It speculates that extraordinary human abilities might have an extraterrestrial origin.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=IJ-PacdW5Zk"
    }
  },
  {
    "id": "U5EDORs8Jkk",
    "title": "Gateway to Sedona DEBUNK",
    "channel": "Captain Disillusion",
    "topics": [
      "Media & critical thinking"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 846,
    "embed": "allowed",
    "summary": {
      "text": "Captain Disillusion analyzes a supposed portal video and how paranormal stories can be assembled from separate pieces of media. A skeptical examination of visual claims and their presentation.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=U5EDORs8Jkk"
    }
  },
  {
    "id": "zCEm636-0bI",
    "title": "UFO Footage I-10 N. Florida Very Strange 11 26 2011 \"Original Footage\" As seen on \"Fact Or Faked\"",
    "channel": "JoinOurBandOfBelief",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 164,
    "embed": "allowed",
    "summary": {
      "text": "A brief recording of unusual lights that the uploader says were seen while driving on I-10 in northern Florida on November 26, 2011. The listing identifies it as the original footage later featured on Fact or Faked.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=zCEm636-0bI"
    }
  },
  {
    "id": "Em7P9g9zCYc",
    "title": "Chris Bledsoe - The Episode We Never Censored | SRS #165",
    "channel": "Shawn Ryan Show",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 9832,
    "embed": "allowed",
    "summary": {
      "text": "Chris Bledsoe recounts a reported 2007 encounter and the experiences he says followed it. His conversation with Shawn Ryan covers orbs, spiritual meaning, family and community reactions, and his claims of government and religious interest.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=Em7P9g9zCYc"
    }
  },
  {
    "id": "HOFq3ruef7I",
    "title": "CIA full report on Brain Synchronization, Energy, Manifestation and the Holographic Universe",
    "channel": "Video Advice",
    "topics": [
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 3498,
    "embed": "allowed",
    "summary": {
      "text": "A narrated exploration of the Gateway Process document, covering Hemi-Sync, resonance, consciousness, and remote-viewing proposals. The description links to the archived report; the video presents the document’s ideas and the uploader’s interpretation of them.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=HOFq3ruef7I"
    }
  },
  {
    "id": "7Ats0lIy3Lo",
    "title": "Deep Underground Military Bases (D.U.M.Bs.) - UFO Legacy Programs",
    "channel": "UAP Gerb",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 5918,
    "embed": "allowed",
    "summary": {
      "text": "UAP Gerb examines underground military facilities and claims linking them to UFO programs. The investigation combines discussion of acknowledged sites with testimony, technical documents, and allegations about hidden bases and tunnel networks.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=7Ats0lIy3Lo"
    }
  },
  {
    "id": "m91N9WrtyMM",
    "title": "David Grusch: The Man They Desperately Tried to Silence",
    "channel": "Lately",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 2033,
    "embed": "allowed",
    "summary": {
      "text": "A profile of David Grusch focused on the UFO-program allegations he brought to public attention and Congress. The creator assembles his public claims into one narrative.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=m91N9WrtyMM"
    }
  },
  {
    "id": "USSInYQYdJg",
    "title": "Cybertruck Bomber Matthew Livelsberger's manifesto, classified by The Pentagon - Psicoactivo #685",
    "channel": "Psicoactivo Podcast",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 705,
    "embed": "allowed",
    "summary": {
      "text": "Psicoactivo examines reporting about Matthew Livelsberger’s writings after the Las Vegas Cybertruck explosion. The episode focuses on claims about drones and the alleged classification of material, with links to the reporting it discusses.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=USSInYQYdJg"
    }
  },
  {
    "id": "B7y3qcgSRY8",
    "title": "Joe Rogan Experience #2372 - Garry Nolan",
    "channel": "PowerfulJRE",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 9469,
    "embed": "allowed",
    "summary": {
      "text": "A long-form Joe Rogan interview with Garry Nolan. The episode introduces Nolan as a Stanford immunologist and a leader at the Sol Foundation, which focuses on UAP research and advocacy.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=B7y3qcgSRY8"
    }
  },
  {
    "id": "y9CbLV3t-qo",
    "title": "Learn Remote Viewing Fundamentals: A Step by Step Guide",
    "channel": "Technical Intuition",
    "topics": [
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 5555,
    "embed": "allowed",
    "summary": {
      "text": "A recorded webinar introducing Technical Intuition’s approach to perception and intuition. It includes a guided remote-viewing exercise and the presenter’s model of different forms of intuitive experience.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=y9CbLV3t-qo"
    }
  },
  {
    "id": "1WwGGuQljl4",
    "title": "UFOS: Investigating the Unknown MEGA EPISODE | Secret Programs and Close Encounters | Nat Geo",
    "channel": "National Geographic",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 12610,
    "embed": "allowed",
    "summary": {
      "text": "Five episodes trace U.S. UFO investigations, from Project Blue Book to a Pentagon program and Navy encounters. The series also examines reports around nuclear facilities and the role of civilian investigators and aviation witnesses.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=1WwGGuQljl4"
    }
  },
  {
    "id": "DHN95mmf6ho",
    "title": "Moment of Contact",
    "channel": "YouTube Movies & TV",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 6445,
    "embed": "allowed",
    "summary": {
      "text": "James Fox investigates accounts from Varginha, Brazil, where residents reported strange creatures and a UFO crash in 1996. The documentary centers on those witnesses and their descriptions of the events.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=DHN95mmf6ho"
    }
  },
  {
    "id": "qSNfwLJiANQ",
    "title": "The Phenomenon",
    "channel": "YouTube Movies & TV",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 6011,
    "embed": "allowed",
    "summary": {
      "text": "James Fox’s documentary presents a case for taking UAP reports seriously, framed around secrecy and the question of what remains unexplained. This link points to the YouTube Movies edition saved in the collection.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=qSNfwLJiANQ"
    }
  },
  {
    "id": "U8fEAflytI8",
    "title": "The Program",
    "channel": "YouTube Movies & TV",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 6141,
    "embed": "unavailable",
    "summary": {
      "text": "A documentary about congressional UFO hearings and insider assertions that evidence of nonhuman intelligence is being withheld. It follows the effort to understand what alleged secret programs might contain.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=U8fEAflytI8"
    },
    "playbackNote": "YouTube sign-in may be required."
  },
  {
    "id": "sZaE5rIavVA",
    "title": "Bob Lazar: Area 51 & Flying Saucers",
    "channel": "YouTube Movies & TV",
    "topics": [
      "UFOs & unexplained"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 5797,
    "embed": "unavailable",
    "summary": {
      "text": "A documentary revisiting Bob Lazar’s account of work on alleged alien spacecraft near Area 51. It returns to the claims he made public in 1989 and his later reflections on that story.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=sZaE5rIavVA"
    },
    "playbackNote": "YouTube sign-in may be required."
  },
  {
    "id": "o3I9mtum9hk",
    "title": "The Matrix: a portal to inner transformation",
    "channel": "Modern Intuitionist",
    "topics": [
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 1143,
    "embed": "unavailable",
    "summary": {
      "text": "An interpretation of The Matrix through Gnosticism and Carl Jung’s ideas. The essay treats Neo’s awakening as a story about illusion, self-knowledge, and inner change, drawing parallels between the films and older philosophical traditions.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=o3I9mtum9hk"
    },
    "playbackNote": "This video does not allow embedded playback."
  },
  {
    "id": "8mZEtiMvqIU",
    "title": "The 6 Levels of DMT | Psychedelics Described",
    "channel": "Josie Kins",
    "topics": [
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 2335,
    "embed": "allowed",
    "summary": {
      "text": "Josie Kins presents a six-level framework for describing the reported intensity of DMT experiences, using visual art and terminology from the Subjective Effect Index. The video also discusses physical effects, after-effects, research, and personal interpretation.",
      "basis": "Description & chapters",
      "sourceUrl": "https://www.youtube.com/watch?v=8mZEtiMvqIU"
    }
  },
  {
    "id": "fcdItgUjZnY",
    "title": "What Is Happening in the Brain During a DMT Trip?",
    "channel": "PowerfulJRE",
    "topics": [
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 838,
    "embed": "allowed",
    "summary": {
      "text": "A discussion with DMT researcher Rick Strassman, excerpted from Joe Rogan Experience #1854. The clip centers on questions about the brain during a DMT experience.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=fcdItgUjZnY"
    }
  },
  {
    "id": "fwZqVqbkyLM",
    "title": "DMT: The Spirit Molecule (2010) [multi subs]",
    "channel": "Ginkgo Biloba",
    "topics": [
      "Mind & consciousness"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 4428,
    "embed": "allowed",
    "summary": {
      "text": "A documentary focused on dimethyltryptamine, or DMT, and the questions surrounding its powerful psychedelic effects. This is the subtitled 2010 film upload from Ginkgo Biloba.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=fwZqVqbkyLM"
    }
  },
  {
    "id": "6Ud-fPKnj3Q",
    "title": "Tony Seba #CleanDisruption @ Robin Hood Investors Conference 2019 #RHIC2019",
    "channel": "Tony Seba",
    "topics": [
      "Technology & AI"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 1878,
    "embed": "allowed",
    "summary": {
      "text": "Tony Seba’s 2019 presentation argues that batteries, electric and autonomous vehicles, and new transport business models could transform energy and mobility. It lays out his forecast and its implications for companies, cities, and infrastructure.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=6Ud-fPKnj3Q"
    }
  },
  {
    "id": "5joEoIjN4MI",
    "title": "F-16 Start Up Sequence",
    "channel": "flightlevel69",
    "topics": [
      "Motorsport & aviation"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 293,
    "embed": "allowed",
    "summary": {
      "text": "A cockpit view of an F-16C starting up, from the engine coming alive to navigation and display systems initializing. The uploader’s description explains what the pilot is checking throughout the sequence.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=5joEoIjN4MI"
    }
  },
  {
    "id": "nE4AlzySmL4",
    "title": "Drew Cleaver 24 Hours of Lemons MSR Houston Fast Lap",
    "channel": "RacingGeeks",
    "topics": [
      "Motorsport & aviation"
    ],
    "addedOn": "2026-09-19",
    "durationSeconds": 127,
    "embed": "allowed",
    "summary": {
      "text": "Drew Cleaver laps MSR Houston during the October 2011 24 Hours of Lemons race in a 1986 BMW 325e. RacingGeeks identifies the lap as a 1:55.656, the car’s fastest there at the time.",
      "basis": "Creator description",
      "sourceUrl": "https://www.youtube.com/watch?v=nE4AlzySmL4"
    }
  }
];

export function validateVideos(entries: SavedVideo[]) {
  const seen = new Set<string>();
  for (const video of entries) {
    const validId = video.pendingSearch ? /^pending-[a-z0-9-]+$/.test(video.id) : /^[A-Za-z0-9_-]{11}$/.test(video.id);
    if (!validId || seen.has(video.id)) throw new Error('Invalid or duplicate video ID: ' + video.id);
    if (video.pendingSearch && (!video.pendingSearch.trim() || video.embed !== 'unavailable' || video.summary)) throw new Error('Pending selection must use a search fallback: ' + video.id);
    seen.add(video.id);
    if (!video.title.trim() || !video.channel.trim() || !video.topics.length || video.topics.some(topic => !topic.trim())) throw new Error('Missing video metadata: ' + video.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(video.addedOn) || !Number.isFinite(Date.parse(video.addedOn)) || new Date(video.addedOn).toISOString().slice(0, 10) !== video.addedOn) throw new Error('Invalid date: ' + video.id);
    if (video.durationSeconds !== undefined && (!Number.isInteger(video.durationSeconds) || video.durationSeconds <= 0)) throw new Error('Invalid duration: ' + video.id);
    if (!['allowed', 'unknown', 'unavailable'].includes(video.embed)) throw new Error('Invalid embed status: ' + video.id);
    if (video.summary) {
      if (!video.summary.text.trim() || !['Watched video', 'Transcript', 'Drew’s notes', 'Creator description', 'Description & chapters', 'Video listing'].includes(video.summary.basis)) throw new Error('Missing summary basis: ' + video.id);
      const source = new URL(video.summary.sourceUrl);
      if (source.protocol !== 'https:' || source.username || source.password) throw new Error('Invalid summary source: ' + video.id);
    }
  }
  return entries;
}

validateVideos(videos);

export function durationLabel(seconds?: number) {
  if (seconds === undefined) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}
