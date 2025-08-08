/* Frontend-only mock data and localStorage utilities for Psychology Study Hub */

export const BRANCHES = [
  {
    slug: "cognitive",
    name: "Cognitive Psychology",
    level: "Beginner",
    heroImage:
      "https://images.unsplash.com/photo-1617791160536-598cf32026fb?q=85&w=1600",
    summary:
      "Studies mental processes like attention, memory, language, problem-solving, and decision-making.",
    keyIdeas: [
      "Information processing models",
      "Working memory (Baddeley & Hitch)",
      "Schemas and cognitive biases",
      "Dual-process theory (System 1 & 2)"
    ],
    psychologists: [
      "Ulric Neisser",
      "Daniel Kahneman",
      "Amos Tversky",
      "Elizabeth Loftus"
    ],
    mnemonics: [
      {
        title: "Memory Stages",
        hint: "AESR → Attention, Encoding, Storage, Retrieval"
      },
      {
        title: "Working Memory",
        hint: "Phonological loop = sound, Visuospatial sketchpad = sight, Episodic buffer = integrates"
      }
    ],
    resources: [
      { title: "Verywell Mind: Cognitive Psychology", url: "https://www.verywellmind.com/what-is-cognitive-psychology-2794982" },
      { title: "Khan Academy: Cognition", url: "https://www.khanacademy.org/test-prep/mcat/processing-the-environment" }
    ],
    activities: [
      "Keep a decision diary for one week; tag fast vs slow decisions",
      "Test your memory with 7 ± 2 digit spans and chunking"
    ],
    quiz: [
      {
        q: "Which component of working memory is responsible for holding and manipulating visual information?",
        options: ["Central executive", "Visuospatial sketchpad", "Phonological loop", "Episodic buffer"],
        answer: 1,
        explain: "The visuospatial sketchpad holds and manipulates visual and spatial info."
      },
      {
        q: "System 1 thinking is best described as:",
        options: ["Slow and analytical", "Effortful and deliberate", "Fast and intuitive", "Statistical and logical"],
        answer: 2,
        explain: "System 1 is rapid, automatic, and heuristic-driven."
      }
    ],
    schedule: [
      { text: "Read overview of cognitive models", done: false },
      { text: "Practice memory techniques (chunking, elaborative rehearsal)", done: false },
      { text: "Summarize 2 biases with real examples", done: false }
    ]
  },
  {
    slug: "developmental",
    name: "Developmental Psychology",
    level: "Beginner",
    heroImage:
      "https://images.unsplash.com/photo-1598963374368-f47f4603b7d4?q=85&w=1600",
    summary:
      "Explores human growth and change across the lifespan in cognition, emotion, and social behavior.",
    keyIdeas: [
      "Piaget's stages",
      "Vygotsky's sociocultural theory",
      "Attachment styles (Ainsworth/Bowlby)",
      "Erikson's psychosocial stages"
    ],
    psychologists: ["Jean Piaget", "Lev Vygotsky", "Mary Ainsworth", "Erik Erikson"],
    mnemonics: [
      { title: "Piaget Stages", hint: "Some People Can Fly → Sensorimotor, Preoperational, Concrete, Formal" },
      { title: "Erikson Order", hint: "TA III GII → Trust, Autonomy, Initiative, Industry, Identity, Intimacy, Generativity, Integrity" }
    ],
    resources: [
      { title: "SimplyPsychology: Piaget", url: "https://www.simplypsychology.org/piaget.html" },
      { title: "CrashCourse: Development", url: "https://www.youtube.com/watch?v=d6I6UpuJQbI" }
    ],
    activities: [
      "Map your own development milestones",
      "Observe a child-parent interaction and note attachment cues"
    ],
    quiz: [
      {
        q: "Which concept describes the range of tasks a child can perform with guidance but not alone?",
        options: ["Assimilation", "Scaffolding", "Zone of Proximal Development", "Accommodation"],
        answer: 2,
        explain: "Vygotsky's ZPD defines this range; scaffolding supports progress within it."
      }
    ],
    schedule: [
      { text: "Review Piaget stages with examples", done: false },
      { text: "Watch video on attachment styles", done: false }
    ]
  },
  {
    slug: "social",
    name: "Social Psychology",
    level: "Intermediate",
    heroImage:
      "https://images.unsplash.com/photo-1560452192-ce93f2f642e2?q=85&w=1600",
    summary:
      "Examines how individuals think, feel, and behave in social contexts (groups, norms, persuasion).",
    keyIdeas: [
      "Attribution theory",
      "Conformity (Asch)",
      "Obedience (Milgram)",
      "Bystander effect"
    ],
    psychologists: ["Solomon Asch", "Stanley Milgram", "Philip Zimbardo", "Henri Tajfel"],
    mnemonics: [
      { title: "Attribution Types", hint: "DI → Dispositional vs. Situational" },
      { title: "Conformity Cues", hint: "USAMI → Unanimity, Size, Ambiguity, Minority, Information" }
    ],
    resources: [
      { title: "APA: Social Psychology", url: "https://www.apa.org/action/science/social" },
      { title: "SimplyPsychology: Milgram", url: "https://www.simplypsychology.org/milgram.html" }
    ],
    activities: [
      "Run a small conformity survey",
      "Analyze a public campaign for persuasion techniques"
    ],
    quiz: [
      {
        q: "The bystander effect predicts:",
        options: [
          "Help increases as group size increases",
          "Help decreases as group size increases",
          "Help unaffected by group size",
          "Help only when trained"
        ],
        answer: 1,
        explain: "Diffusion of responsibility reduces helping in larger groups."
      }
    ],
    schedule: [
      { text: "Summarize 3 classic social experiments", done: false },
      { text: "Observe group behavior in a meeting/class", done: false }
    ]
  },
  {
    slug: "clinical",
    name: "Clinical Psychology",
    level: "Intermediate",
    heroImage:
      "https://images.unsplash.com/photo-1562313081-0e82b5729071?q=85&w=1600",
    summary:
      "Assessment, diagnosis, and treatment of mental disorders; therapeutic approaches and ethics.",
    keyIdeas: [
      "CBT cognitive model",
      "Biopsychosocial formulation",
      "DSM-5-TR categories",
      "Therapeutic alliance"
    ],
    psychologists: ["Aaron Beck", "Albert Ellis", "Carl Rogers", "Irvin Yalom"],
    mnemonics: [
      { title: "CBT Steps", hint: "ATE → Automatic thoughts → Test → Evaluate" },
      { title: "Risk Assessment", hint: "SAD PERSONS for suicide risk cues (use as study prompt only)" }
    ],
    resources: [
      { title: "NICE Guidelines", url: "https://www.nice.org.uk/guidance/conditions-and-diseases/mental-health-and-behavioural-conditions" },
      { title: "PsychDB", url: "https://www.psychdb.com/" }
    ],
    activities: [
      "Build a simple CBT thought record",
      "Practice reflective listening with a peer"
    ],
    quiz: [
      {
        q: "Which therapy emphasizes unconditional positive regard?",
        options: ["CBT", "Person-centered therapy", "REBT", "Behavioral activation"],
        answer: 1,
        explain: "Rogers' person-centered therapy emphasizes empathy and unconditional positive regard."
      }
    ],
    schedule: [
      { text: "Read CBT basics and do one thought record", done: false },
      { text: "Review DSM-5-TR anxiety disorders overview", done: false }
    ]
  },
  {
    slug: "biological",
    name: "Biological Psychology",
    level: "Intermediate",
    heroImage:
      "https://images.pexels.com/photos/8378740/pexels-photo-8378740.jpeg",
    summary:
      "Links brain, neurotransmitters, hormones, and genetics with behavior and mental processes.",
    keyIdeas: [
      "Neurotransmission",
      "Brain imaging (fMRI, EEG)",
      "Neuroplasticity",
      "Endocrine influences"
    ],
    psychologists: ["Donald Hebb", "Roger Sperry", "Eric Kandel", "Brenda Milner"],
    mnemonics: [
      { title: "Neurotransmitters", hint: "SAND → Serotonin, Acetylcholine, Norepinephrine, Dopamine" },
      { title: "Lobes", hint: "F POT → Frontal, Parietal, Occipital, Temporal" }
    ],
    resources: [
      { title: "Neuroscience News", url: "https://neurosciencenews.com/" },
      { title: "Khan Academy: Neuro", url: "https://www.khanacademy.org/test-prep/mcat/processing-the-environment/neural" }
    ],
    activities: [
      "Label a brain diagram and quiz yourself",
      "Summarize a recent neuro study in 5 lines"
    ],
    quiz: [
      {
        q: "The primary excitatory neurotransmitter in the CNS is:",
        options: ["GABA", "Serotonin", "Glutamate", "Dopamine"],
        answer: 2,
        explain: "Glutamate is the main excitatory neurotransmitter in the CNS."
      }
    ],
    schedule: [
      { text: "Review neuron anatomy and synapse steps", done: false },
      { text: "Compare fMRI vs EEG use-cases", done: false }
    ]
  },
  {
    slug: "methods",
    name: "Research Methods",
    level: "Beginner",
    heroImage:
      "https://images.pexels.com/photos/4046718/pexels-photo-4046718.jpeg",
    summary:
      "Designing studies, variables, reliability/validity, statistics, ethics, and replication.",
    keyIdeas: [
      "Operationalization",
      "Experimental vs correlational",
      "Reliability & validity",
      "p-values and confidence intervals"
    ],
    psychologists: ["Karl Popper", "Paul Meehl", "Jacob Cohen", "Ronald Fisher"],
    mnemonics: [
      { title: "Validity Types", hint: "CICE → Construct, Internal, Criterion, External" },
      { title: "Biases", hint: "SSPR → Sampling, Selection, Publication, Researcher" }
    ],
    resources: [
      { title: "Coursera: Methods", url: "https://www.coursera.org/learn/research-methods" },
      { title: "Laerd Statistics", url: "https://statistics.laerd.com/" }
    ],
    activities: [
      "Turn a vague idea into operational variables",
      "Critique a methods section of a paper"
    ],
    quiz: [
      {
        q: "Which best increases internal validity?",
        options: ["Random sampling", "Random assignment", "Larger sample size", "Double-blind peer review"],
        answer: 1,
        explain: "Random assignment balances confounds across experimental groups."
      }
    ],
    schedule: [
      { text: "Define IV/DV for 3 research questions", done: false },
      { text: "Revise reliability vs validity with examples", done: false }
    ]
  }
];

const STORAGE_KEY = "psych_hub_state_v1";

export function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : { bookmarks: {}, tasks: {}, quiz: {} };
  } catch (e) {
    return { bookmarks: {}, tasks: {}, quiz: {} };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleBookmark(slug) {
  const s = loadState();
  s.bookmarks[slug] = !s.bookmarks[slug];
  saveState(s);
  return s.bookmarks[slug];
}

export function isBookmarked(slug) {
  const s = loadState();
  return !!s.bookmarks[slug];
}

export function getTasks(slug) {
  const s = loadState();
  if (!s.tasks[slug]) {
    const branch = BRANCHES.find((b) => b.slug === slug);
    s.tasks[slug] = branch ? branch.schedule : [];
    saveState(s);
  }
  return s.tasks[slug];
}

export function updateTasks(slug, tasks) {
  const s = loadState();
  s.tasks[slug] = tasks;
  saveState(s);
}

export function getQuizProgress(slug) {
  const s = loadState();
  return s.quiz[slug] || { best: 0 };
}

export function setQuizProgress(slug, progress) {
  const s = loadState();
  s.quiz[slug] = { ...(s.quiz[slug] || {}), ...progress };
  saveState(s);
}