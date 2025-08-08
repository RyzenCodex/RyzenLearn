from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ------------------------
# MODELS
# ------------------------
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class Resource(BaseModel):
    title: str
    url: str

class Mnemonic(BaseModel):
    title: str
    hint: str

class QuizQ(BaseModel):
    q: str
    options: List[str]
    answer: int
    explain: str

class TaskItem(BaseModel):
    text: str
    done: bool = False

class Branch(BaseModel):
    slug: str
    name: str
    level: str
    heroImage: str
    summary: str
    keyIdeas: List[str]
    psychologists: List[str]
    mnemonics: List[Mnemonic]
    resources: List[Resource]
    activities: List[str]
    quiz: List[QuizQ] = []
    schedule: List[TaskItem] = []

class ClientState(BaseModel):
    client_id: str
    bookmarks: Dict[str, bool] = {}
    tasks: Dict[str, List[TaskItem]] = {}
    quiz: Dict[str, Dict[str, int]] = {}
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ------------------------
# SEED DATA (idempotent)
# ------------------------
BRANCHES_DATA: List[Dict[str, Any]] = [
  {
    "slug": "cognitive",
    "name": "Cognitive Psychology",
    "level": "Beginner",
    "heroImage": "https://images.unsplash.com/photo-1617791160536-598cf32026fb?q=85&w=1600",
    "summary": "Studies mental processes like attention, memory, language, problem-solving, and decision-making.",
    "keyIdeas": [
      "Information processing models",
      "Working memory (Baddeley & Hitch)",
      "Schemas and cognitive biases",
      "Dual-process theory (System 1 & 2)"
    ],
    "psychologists": ["Ulric Neisser", "Daniel Kahneman", "Amos Tversky", "Elizabeth Loftus"],
    "mnemonics": [
      {"title": "Memory Stages", "hint": "AESR → Attention, Encoding, Storage, Retrieval"},
      {"title": "Working Memory", "hint": "Phonological loop = sound, Visuospatial sketchpad = sight, Episodic buffer = integrates"}
    ],
    "resources": [
      {"title": "Verywell Mind: Cognitive Psychology", "url": "https://www.verywellmind.com/what-is-cognitive-psychology-2794982"},
      {"title": "Khan Academy: Cognition", "url": "https://www.khanacademy.org/test-prep/mcat/processing-the-environment"}
    ],
    "activities": [
      "Keep a decision diary for one week; tag fast vs slow decisions",
      "Test your memory with 7 ± 2 digit spans and chunking"
    ],
    "quiz": [
      {"q": "Which component of working memory is responsible for holding and manipulating visual information?",
       "options": ["Central executive", "Visuospatial sketchpad", "Phonological loop", "Episodic buffer"],
       "answer": 1,
       "explain": "The visuospatial sketchpad holds and manipulates visual and spatial info."},
      {"q": "System 1 thinking is best described as:",
       "options": ["Slow and analytical", "Effortful and deliberate", "Fast and intuitive", "Statistical and logical"],
       "answer": 2,
       "explain": "System 1 is rapid, automatic, and heuristic-driven."}
    ],
    "schedule": [
      {"text": "Read overview of cognitive models", "done": False},
      {"text": "Practice memory techniques (chunking, elaborative rehearsal)",       "done": False},
      {"text": "Summarize 2 biases with real examples", "done": False}
    ]
  },
  {
    "slug": "developmental",
    "name": "Developmental Psychology",
    "level": "Beginner",
    "heroImage": "https://images.unsplash.com/photo-1598963374368-f47f4603b7d4?q=85&w=1600",
    "summary": "Explores human growth and change across the lifespan in cognition, emotion, and social behavior.",
    "keyIdeas": [
      "Piaget's stages",
      "Vygotsky's sociocultural theory",
      "Attachment styles (Ainsworth/Bowlby)",
      "Erikson's psychosocial stages"
    ],
    "psychologists": ["Jean Piaget", "Lev Vygotsky", "Mary Ainsworth", "Erik Erikson"],
    "mnemonics": [
      {"title": "Piaget Stages", "hint": "Some People Can Fly → Sensorimotor, Preoperational, Concrete, Formal"},
      {"title": "Erikson Order", "hint": "TA III GII → Trust, Autonomy, Initiative, Industry, Identity, Intimacy, Generativity, Integrity"}
    ],
    "resources": [
      {"title": "SimplyPsychology: Piaget", "url": "https://www.simplypsychology.org/piaget.html"},
      {"title": "CrashCourse: Development", "url": "https://www.youtube.com/watch?v=d6I6UpuJQbI"}
    ],
    "activities": ["Map your own development milestones", "Observe a child-parent interaction and note attachment cues"],
    "quiz": [
      {"q": "Which concept describes the range of tasks a child can perform with guidance but not alone?",
       "options": ["Assimilation", "Scaffolding", "Zone of Proximal Development", "Accommodation"],
       "answer": 2,
       "explain": "Vygotsky's ZPD defines this range; scaffolding supports progress within it."}
    ],
    "schedule": [
      {"text": "Review Piaget stages with examples", "done": False},
      {"text": "Watch video on attachment styles", "done": False}
    ]
  },
  {
    "slug": "social",
    "name": "Social Psychology",
    "level": "Intermediate",
    "heroImage": "https://images.unsplash.com/photo-1560452192-ce93f2f642e2?q=85&w=1600",
    "summary": "Examines how individuals think, feel, and behave in social contexts (groups, norms, persuasion).",
    "keyIdeas": ["Attribution theory", "Conformity (Asch)", "Obedience (Milgram)", "Bystander effect"],
    "psychologists": ["Solomon Asch", "Stanley Milgram", "Philip Zimbardo", "Henri Tajfel"],
    "mnemonics": [
      {"title": "Attribution Types", "hint": "DI → Dispositional vs. Situational"},
      {"title": "Conformity Cues", "hint": "USAMI → Unanimity, Size, Ambiguity, Minority, Information"}
    ],
    "resources": [
      {"title": "APA: Social Psychology", "url": "https://www.apa.org/action/science/social"},
      {"title": "SimplyPsychology: Milgram", "url": "https://www.simplypsychology.org/milgram.html"}
    ],
    "activities": ["Run a small conformity survey", "Analyze a public campaign for persuasion techniques"],
    "quiz": [
      {"q": "The bystander effect predicts:",
       "options": ["Help increases as group size increases", "Help decreases as group size increases", "Help unaffected by group size", "Help only when trained"],
       "answer": 1,
       "explain": "Diffusion of responsibility reduces helping in larger groups."}
    ],
    "schedule": [
      {"text": "Summarize 3 classic social experiments", "done": False},
      {"text": "Observe group behavior in a meeting/class", "done": False}
    ]
  },
  {
    "slug": "clinical",
    "name": "Clinical Psychology",
    "level": "Intermediate",
    "heroImage": "https://images.unsplash.com/photo-1562313081-0e82b5729071?q=85&w=1600",
    "summary": "Assessment, diagnosis, and treatment of mental disorders; therapeutic approaches and ethics.",
    "keyIdeas": ["CBT cognitive model", "Biopsychosocial formulation", "DSM-5-TR categories", "Therapeutic alliance"],
    "psychologists": ["Aaron Beck", "Albert Ellis", "Carl Rogers", "Irvin Yalom"],
    "mnemonics": [
      {"title": "CBT Steps", "hint": "ATE → Automatic thoughts → Test → Evaluate"},
      {"title": "Risk Assessment", "hint": "SAD PERSONS for suicide risk cues (use as study prompt only)"}
    ],
    "resources": [
      {"title": "NICE Guidelines", "url": "https://www.nice.org.uk/guidance/conditions-and-diseases/mental-health-and-behavioural-conditions"},
      {"title": "PsychDB", "url": "https://www.psychdb.com/"}
    ],
    "activities": ["Build a simple CBT thought record", "Practice reflective listening with a peer"],
    "quiz": [
      {"q": "Which therapy emphasizes unconditional positive regard?",
       "options": ["CBT", "Person-centered therapy", "REBT", "Behavioral activation"],
       "answer": 1,
       "explain": "Rogers' person-centered therapy emphasizes empathy and unconditional positive regard."}
    ],
    "schedule": [
      {"text": "Read CBT basics and do one thought record", "done": False},
      {"text": "Review DSM-5-TR anxiety disorders overview", "done": False}
    ]
  },
  {
    "slug": "biological",
    "name": "Biological Psychology",
    "level": "Intermediate",
    "heroImage": "https://images.pexels.com/photos/8378740/pexels-photo-8378740.jpeg",
    "summary": "Links brain, neurotransmitters, hormones, and genetics with behavior and mental processes.",
    "keyIdeas": ["Neurotransmission", "Brain imaging (fMRI, EEG)", "Neuroplasticity", "Endocrine influences"],
    "psychologists": ["Donald Hebb", "Roger Sperry", "Eric Kandel", "Brenda Milner"],
    "mnemonics": [
      {"title": "Neurotransmitters", "hint": "SAND → Serotonin, Acetylcholine, Norepinephrine, Dopamine"},
      {"title": "Lobes", "hint": "F POT → Frontal, Parietal, Occipital, Temporal"}
    ],
    "resources": [
      {"title": "Neuroscience News", "url": "https://neurosciencenews.com/"},
      {"title": "Khan Academy: Neuro", "url": "https://www.khanacademy.org/test-prep/mcat/processing-the-environment/neural"}
    ],
    "activities": ["Label a brain diagram and quiz yourself", "Summarize a recent neuro study in 5 lines"],
    "quiz": [
      {"q": "The primary excitatory neurotransmitter in the CNS is:",
       "options": ["GABA", "Serotonin", "Glutamate", "Dopamine"],
       "answer": 2,
       "explain": "Glutamate is the main excitatory neurotransmitter in the CNS."}
    ],
    "schedule": [
      {"text": "Review neuron anatomy and synapse steps", "done": False},
      {"text": "Compare fMRI vs EEG use-cases", "done": False}
    ]
  },
  {
    "slug": "methods",
    "name": "Research Methods",
    "level": "Beginner",
    "heroImage": "https://images.pexels.com/photos/4046718/pexels-photo-4046718.jpeg",
    "summary": "Designing studies, variables, reliability/validity, statistics, ethics, and replication.",
    "keyIdeas": ["Operationalization", "Experimental vs correlational", "Reliability & validity", "p-values and confidence intervals"],
    "psychologists": ["Karl Popper", "Paul Meehl", "Jacob Cohen", "Ronald Fisher"],
    "mnemonics": [
      {"title": "Validity Types", "hint": "CICE → Construct, Internal, Criterion, External"},
      {"title": "Biases", "hint": "SSPR → Sampling, Selection, Publication, Researcher"}
    ],
    "resources": [
      {"title": "Coursera: Methods", "url": "https://www.coursera.org/learn/research-methods"},
      {"title": "Laerd Statistics", "url": "https://statistics.laerd.com/"}
    ],
    "activities": ["Turn a vague idea into operational variables", "Critique a methods section of a paper"],
    "quiz": [
      {"q": "Which best increases internal validity?",
       "options": ["Random sampling", "Random assignment", "Larger sample size", "Double-blind peer review"],
       "answer": 1,
       "explain": "Random assignment balances confounds across experimental groups."}
    ],
    "schedule": [
      {"text": "Define IV/DV for 3 research questions", "done": False},
      {"text": "Revise reliability vs validity with examples", "done": False}
    ]
  }
]

async def seed_branches():
    existing = await db.branches.count_documents({})
    if existing == 0:
        await db.branches.insert_many(BRANCHES_DATA)
        logging.info("Seeded branches collection with default data")

async def ensure_client_state(client_id: str) -> ClientState:
    doc = await db.client_states.find_one({"client_id": client_id})
    if not doc:
        state = ClientState(client_id=client_id)
        await db.client_states.insert_one(state.model_dump())
        return state
    # Convert nested tasks to TaskItem list
    # Pydantic will coerce on model creation
    return ClientState(**doc)

# ------------------------
# ROUTES
# ------------------------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    _ = await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Branches
@api_router.get("/branches", response_model=List[Branch])
async def list_branches():
    items = await db.branches.find({}, {"_id": 0}).to_list(1000)
    return [Branch(**it) for it in items]

@api_router.get("/branches/{slug}", response_model=Branch)
async def get_branch(slug: str):
    doc = await db.branches.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Branch not found")
    return Branch(**doc)

# Client state
@api_router.get("/state/{client_id}", response_model=ClientState)
async def get_state(client_id: str):
    state = await ensure_client_state(client_id)
    return state

class SetBookmark(BaseModel):
    bookmarked: bool

@api_router.put("/state/{client_id}/bookmarks/{slug}")
async def set_bookmark(client_id: str, slug: str, payload: SetBookmark):
    # validate branch
    if not await db.branches.find_one({"slug": slug}):
        raise HTTPException(status_code=404, detail="Unknown branch slug")
    await ensure_client_state(client_id)
    update = {
        "$set": {f"bookmarks.{slug}": payload.bookmarked, "updated_at": datetime.utcnow()},
    }
    await db.client_states.update_one({"client_id": client_id}, update, upsert=True)
    return {"slug": slug, "bookmarked": payload.bookmarked}

class TasksPayload(BaseModel):
    tasks: List[TaskItem]

@api_router.get("/state/{client_id}/tasks/{slug}", response_model=List[TaskItem])
async def get_tasks(client_id: str, slug: str):
    await ensure_client_state(client_id)
    st = await db.client_states.find_one({"client_id": client_id}, {"_id": 0, f"tasks.{slug}": 1})
    tasks = (st or {}).get("tasks", {}).get(slug)
    if tasks is None:
        # default to branch schedule
        br = await db.branches.find_one({"slug": slug}, {"_id": 0, "schedule": 1})
        if not br:
            raise HTTPException(status_code=404, detail="Unknown branch slug")
        return [TaskItem(**t) for t in br.get("schedule", [])]
    return [TaskItem(**t) for t in tasks]

@api_router.put("/state/{client_id}/tasks/{slug}")
async def put_tasks(client_id: str, slug: str, body: TasksPayload):
    if not await db.branches.find_one({"slug": slug}):
        raise HTTPException(status_code=404, detail="Unknown branch slug")
    await ensure_client_state(client_id)
    update = {
        "$set": {f"tasks.{slug}": [t.model_dump() for t in body.tasks], "updated_at": datetime.utcnow()}
    }
    await db.client_states.update_one({"client_id": client_id}, update, upsert=True)
    return {"ok": True}

class QuizBestPayload(BaseModel):
    best: int

@api_router.get("/state/{client_id}/quiz")
async def get_quiz_progress(client_id: str):
    await ensure_client_state(client_id)
    st = await db.client_states.find_one({"client_id": client_id}, {"_id": 0, "quiz": 1})
    return (st or {}).get("quiz", {})

@api_router.put("/state/{client_id}/quiz/{slug}")
async def set_quiz_best(client_id: str, slug: str, body: QuizBestPayload):
    if not await db.branches.find_one({"slug": slug}):
        raise HTTPException(status_code=404, detail="Unknown branch slug")
    await ensure_client_state(client_id)
    update = {
        "$set": {f"quiz.{slug}.best": int(body.best), "updated_at": datetime.utcnow()},
    }
    await db.client_states.update_one({"client_id": client_id}, update, upsert=True)
    return {"slug": slug, "best": int(body.best)}

class NotesPayload(BaseModel):
    notes: str

@api_router.get("/state/{client_id}/notes")
async def get_notes(client_id: str):
    await ensure_client_state(client_id)
    st = await db.client_states.find_one({"client_id": client_id}, {"_id": 0, "notes": 1})
    return {"notes": (st or {}).get("notes", "")}

@api_router.put("/state/{client_id}/notes")
async def set_notes(client_id: str, body: NotesPayload):
    await ensure_client_state(client_id)
    await db.client_states.update_one({"client_id": client_id}, {"$set": {"notes": body.notes, "updated_at": datetime.utcnow()}}, upsert=True)
    return {"ok": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def on_startup():
    await seed_branches()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()