// Guest Participation Agreement, exactly as supplied by the team (October 2026).
// Change AGREEMENT_VERSION whenever the wording changes, so each signature records which text was signed.
export const AGREEMENT_VERSION = "2026-10-21";
export const AGREEMENT_TITLE = "Guest Participation Agreement";

type Block = { kind: "p"; text: string } | { kind: "list"; items: string[] };
export type AgreementSection = { heading?: string; blocks: Block[] };

const p = (text: string): Block => ({ kind: "p", text });
const list = (...items: string[]): Block => ({ kind: "list", items });

export const agreementSections: AgreementSection[] = [
  {
    blocks: [
      p(
        "The conversations that take place in The Unscripted Room are meant to be real, thoughtful, and unfiltered. Each conversation is an opportunity to explore ideas, perspectives, and lived experiences with curiosity and openness.",
      ),
      p(
        "By participating, you are helping create a space where honest conversation can unfold and where others listening may discover perspectives they might not otherwise encounter.",
      ),
      p(
        "Because this is a podcast, the conversation will be recorded and later shared publicly as part of the show and related content. Before we begin, we want to make sure everyone participating understands how the recording may be used and feels comfortable moving forward.",
      ),
      p(
        "The intention of The Unscripted Room is to create space for thoughtful conversation, curiosity, and shared perspective. This agreement simply helps ensure those conversations can be shared responsibly while respecting the people who take part in them.",
      ),
    ],
  },
  {
    heading: "What Participation Involves",
    blocks: [
      p(
        "This conversation will be recorded in audio and/or video format. The recording may include your voice, image, likeness, name, and statements made during the discussion.",
      ),
      p("Content from the recording may appear in places such as:"),
      list(
        "The Unscripted Room Podcast episode",
        "Video recordings of the conversation",
        "Short clips or excerpts from the discussion",
        "The Unscripted Room website",
        "Social media platforms",
        "Promotional or marketing materials connected to the podcast",
        "Educational or editorial content related to the show",
        "Podcast platforms such as Apple Podcasts, Spotify, YouTube, and similar services",
      ),
      p(
        "The goal of sharing these recordings is to extend the conversation beyond the room so others can listen, reflect, and engage with the ideas explored during the discussion.",
      ),
    ],
  },
  {
    heading: "Editing and Production",
    blocks: [
      p("The Unscripted Room is designed to capture conversation as it happens."),
      p(
        "Our goal is to share conversations in a way that reflects how they actually unfolded in the room. We do not edit conversations to reshape, reinterpret, or change the meaning of what was shared.",
      ),
      p(
        "Our role is to create the environment for the conversation and record it with care. In post-production, we may align audio for clarity, address technical issues, and integrate the opening sequence, while keeping the conversation itself intact.",
      ),
      p("This approach is intentional."),
      p(
        "We believe that trust with our audience, and with the people who choose to participate, comes from sharing conversations as they naturally unfold.",
      ),
      p(
        "Authenticity in conversation matters more to us than producing something polished or performative. That includes moments of clarity, uncertainty, reflection, and even discomfort.",
      ),
      p(
        "At times, something said in the moment may feel different when reflected on later. We recognize that as part of the nature of real conversation and personal growth, not something that should automatically be edited away.",
      ),
      p(
        "Because of this, we provide a reflection window after the recording so participants have time to consider their experience before anything is shared publicly.",
      ),
    ],
  },
  {
    heading: "48-Hour Reflection Window",
    blocks: [
      p(
        "After the conversation is recorded, we provide a 48-hour reflection window before anything is publicly shared. This time is intended to give participants space to reflect on the experience and feel confident about what was shared during the conversation.",
      ),
      p(
        "If within that window you decide that you would prefer not to have your participation included in publicly shared content, you can simply let us know and we will honor that request.",
      ),
      p(
        "Because each conversation is recorded together as one shared experience, we are not able to remove one person's portion and publish the rest. If any participant chooses not to have the conversation shared, the conversation will not be published. You are never obligated to approve publication, and this window exists so that every participant can feel confident and comfortable with what is shared.",
      ),
      p(
        "We offer this reflection period because conversations in The Unscripted Room are designed to be open, thoughtful, and sometimes deeply personal. Providing this space allows participants to revisit the experience with clarity and comfort before the conversation is shared with a wider audience.",
      ),
      p(
        "After the 48-hour reflection window has passed, the recording may be released and distributed as part of the podcast and related materials.",
      ),
    ],
  },
  {
    heading: "Sharing the Conversation",
    blocks: [
      p(
        "By participating, you grant The Unscripted Room Podcast permission to record and share your voice, image, likeness, name, and statements captured during the conversation.",
      ),
      p(
        "This allows the conversation to be published as part of podcast episodes, video recordings, short clips, and related materials across podcast platforms, websites, social media, and other spaces where the show is shared.",
      ),
      p(
        "All recordings, transcripts, and related materials created from the conversation become part of The Unscripted Room Podcast archive and may be used to support the podcast and its mission of sharing thoughtful conversations with a wider audience.",
      ),
    ],
  },
  {
    heading: "Voluntary Participation",
    blocks: [
      p("Participation in The Unscripted Room Podcast is entirely voluntary."),
      p(
        "Guests do not receive financial compensation, royalties, or other payment for participating or for the use of recorded content. Most participants choose to take part because they value the opportunity to share ideas, perspectives, and experiences with a broader audience.",
      ),
    ],
  },
  {
    heading: "Responsibility for Statements",
    blocks: [
      p(
        "While we take care to present conversations honestly and respectfully, each participant remains responsible for the statements and perspectives they choose to share during the discussion.",
      ),
      p(
        "By participating in this agreement, you acknowledge that The Unscripted Room Podcast and its owners, employees, partners, and collaborators are not responsible for claims that may arise from statements made during the recording or from the publication of the conversation as described in this document.",
      ),
    ],
  },
  {
    heading: "Additional Acknowledgements",
    blocks: [
      p(
        "By participating, you confirm that you have read and understand the terms described in this agreement and feel comfortable participating in the conversation under those conditions.",
      ),
      p("To ensure clarity for everyone involved, we also ask guests to confirm the following:"),
      list(
        "You are at least eighteen (18) years of age",
        "You have the authority to participate in this recording and grant the permissions described above",
        "Your participation in this conversation does not violate any agreements or obligations you may have with another individual, employer, or organization",
      ),
      p(
        "Because The Unscripted Room is built around real conversation and honest perspective, participants remain responsible for the views and statements they choose to share.",
      ),
      p(
        "Participation in the podcast is voluntary, and guests are always welcome to ask questions about this agreement before participating.",
      ),
      p(
        "Thank you for being willing to take part in this conversation. The Unscripted Room exists because people are open to sharing their perspectives, listening to others, and exploring ideas with curiosity and respect. We're grateful for your willingness to be part of that experience.",
      ),
    ],
  },
];

// The confirmations a guest ticks when signing (taken from "Additional Acknowledgements").
export const agreementConfirmations = [
  { id: "adult", label: "I am at least eighteen (18) years of age." },
  {
    id: "authority",
    label:
      "I have the authority to participate in this recording and grant the permissions described above.",
  },
  {
    id: "noConflict",
    label:
      "My participation does not violate any agreements or obligations I may have with another individual, employer, or organization.",
  },
  {
    id: "agree",
    label:
      "I have read and understand this Guest Participation Agreement, and I agree to its terms.",
  },
] as const;
