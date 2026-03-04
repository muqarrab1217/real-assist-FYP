import os
import streamlit as st
from groq import Groq # Groq's official Python SDK
from dotenv import load_dotenv

# --- 1. CONFIGURATION AND STYLING ---

st.set_page_config(
    page_title="ABS Lead Classifier (Powered by Groq)",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# Load environment variables
load_dotenv()

# --- API KEY & MODEL SETUP ---
# Securely load the API key from .env file
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = "llama-3.1-8b-instant" 

if not GROQ_API_KEY:
    st.error("⚠️ GROQ_API_KEY is missing. Please set it in your .env file.")
    st.stop()

# Initialize the Groq client
try:
    groq_client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    st.error(f"Failed to initialize Groq client: {e}")
    st.stop()


# --- STYLING (The same improved styling as before) ---

st.markdown(
    """
    <style>
        .stApp {
            background: #f0f2f6; /* Light gray background */
            color: #1a1a1a;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .card {
            background: #ffffff;
            border: 1px solid #dcdcdc;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            padding: 25px;
            margin-bottom: 20px;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        div[data-baseweb="textarea"] textarea {
            min-height: 250px;
            border-radius: 8px;
            border: 1px solid #bdc3c7;
            padding: 15px;
            font-size: 16px !important;
            color: #1a1a1a !important; 
            background-color: #f9f9f9;
            transition: border-color 0.3s;
        }
        .stButton > button {
            background: #2980b9; 
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-weight: 700;
            letter-spacing: 0.5px;
            width: 100%;
            transition: background 0.3s;
        }
        .stButton > button:hover {
            background: #3498db;
        }
        .pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 20px;
            border-radius: 50px;
            font-weight: 800;
            font-size: 1.2em;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .pill-hot {
            background: #e74c3c; 
            color: white;
        }
        .pill-cold {
            background: #f1c40f; 
            color: #333;
        }
        .pill-dead {
            background: #34495e; 
            color: white;
        }
    </style>
    """,
    unsafe_allow_html=True,
)


# --- 2. CLASSIFICATION PROMPT (System Instruction) ---

SYSTEM_PROMPT = """
You are an expert lead-classification system for ABS Developers, Pakistan's first Shariah-compliant real estate developer specializing in premium residential and commercial properties in Bahria Town, Lahore.

## YOUR TASK
Analyze the complete customer-agent conversation and classify it into EXACTLY ONE category. Output ONLY the category name as a single word with no punctuation, explanation, or additional text.

## CLASSIFICATION CATEGORIES (Hot, Cold, Dead definitions are the same)

### Hot
A lead demonstrating HIGH PURCHASE INTENT with immediate action potential. Indicators include:
✓ Asks about SPECIFIC projects, units, size/floor/facing preferences
✓ Discusses PAYMENT DETAILS (down payment, installments, booking fee)
✓ Shows BUDGET CLARITY, requests CONCRETE NEXT STEPS (site visit, booking)
✓ Mentions bringing CNIC or other commitment documents
✓ Discusses TIMELINE urgently ("Can I visit tomorrow?", "How soon can I book?")
✓ Uses COMMITMENT LANGUAGE ("I'll take it", "Reserve a unit", "Let's proceed")

Decision Rule: If 4+ hot indicators present AND customer shows readiness for next steps → Hot

---

### Cold
A lead showing MILD INTEREST but NOT ready to commit. Indicators include:
⚠ VAGUE INQUIRIES ("What do you have?", "Just looking around")
⚠ PRICE SENSITIVITY (complains cost is high, asks for discounts)
⚠ NO BUDGET CLARITY or DELAY TACTICS ("I'll think about it", "Maybe next month", "Call me later")
⚠ NON-COMMITTAL RESPONSES ("Just send me details", "I'll review the brochure")

Decision Rule: If person shows interest BUT lacks commitment indicators OR expresses uncertainty → Cold

---

### Dead
A lead with ZERO PROPERTY PURCHASE INTENT or completely OFF-TOPIC. Indicators include:
✗ JOB INQUIRIES or SUPPLIER/VENDOR QUERIES
✗ WRONG EXPECTATIONS (looking for rent when ABS only sells)
✗ IMMEDIATE DISQUALIFICATION ("I have no money", refuses all options)
✗ SPAM/RANDOM or CLEARLY NOT A BUYER (competitor, journalist)

Decision Rule: If person shows ZERO buying intent OR topic is completely unrelated → Dead

---

## CRITICAL RULES
1. Output format: Single word only (Hot, Cold, or Dead) - no punctuation, no explanation, no extra characters
2. Consider the OVERALL conversation arc, not just individual messages
3. Final customer sentiment weighs more than initial questions
4. Action-oriented language (visit, book, pay, reserve) = strong Hot signal
5. Hesitation language (think, maybe, later, expensive) = Cold signal unless overcome
6. Irrelevant topics or job inquiries = instant Dead classification
7. Output ONLY one word: Hot, Cold, or Dead
"""


# --- 3. CLASSIFICATION FUNCTION (Updated for Groq) ---

def classify_lead_groq(conversation: str) -> str:
    """Send conversation to Groq and normalize the single-word label."""
    
    # Groq uses the Chat Completions endpoint, which takes a list of messages.
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": 
            "Conversation transcript:\n\n" + conversation.strip() + 
            "\n\nReturn only one word: Hot or Cold or Dead."
        },
    ]

    try:
        # Use groq_client to create the chat completion
        chat_completion = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.2,
            max_tokens=5, # Limit output for single-word response
        )
        
        # Groq response is structured differently: we access choices[0].message.content
        text = chat_completion.choices[0].message.content.strip()
        normalized = text.lower()
        
        # Check for the expected output
        if "hot" in normalized:
            return "Hot"
        if "cold" in normalized:
            return "Cold"
        if "dead" in normalized:
            return "Dead"
        
        # Fallback error for unexpected output
        raise ValueError(f"Model returned text, but it was not Hot, Cold, or Dead. Response: '{text}'")

    except Exception as e:
        # Catch and re-raise any Groq API or network errors
        raise Exception(f"Groq API Call Failed: {e}")


# --- 4. STREAMLIT APP LAYOUT & EXECUTION ---

st.title("Lead Classification")

conversation = st.text_area(
    "Conversation Transcript",
    placeholder="Paste the entire conversation transcript here (Agent and Customer messages)...",
    height=260,
    label_visibility="collapsed"
)

classify_button = st.button("Classify Lead", use_container_width=True)
st.markdown("</div>", unsafe_allow_html=True)

result_placeholder = st.empty()

if classify_button:
    if not conversation.strip():
        st.warning("Please paste a conversation first to begin classification.")
    else:
        with st.spinner("Analyzing conversation with model trained on ABS data..."):
            try:
                label = classify_lead_groq(conversation)
                
                class_name = label.lower()
                
                result_placeholder.markdown(
                    f"""
                    <div class='card' style='margin-top:25px; text-align:center;'>
                        <p style='font-size: 1.2em; font-weight: 600; color: #333;'>CLASSIFICATION RESULT:</p>
                        <div class='pill pill-{class_name}'>{label}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                
            except Exception as e:
                # Catch errors from the classification function
                result_placeholder.error(f"Classification failed: {e}")