import json
from pathlib import Path
from video_analysis_service import load_video_csv, save_video_analysis
import random

"""
Generate COMPLETE demo analysis data matching the HTML reference exactly
This creates realistic sample data for all 22 videos with EVERY field populated
"""

def generate_demo_analysis(video_idx, store_name):
    """Generate complete realistic demo analysis data matching HTML structure exactly"""
    
    # Scores for RELAX and SoftSkills
    relax_scores = [random.randint(2, 5) for _ in range(5)]
    soft_skills_scores = [random.randint(3, 5) for _ in range(6)]
    
    # Customer and Agent names
    customer_names = ["Mrs. Sharma", "Mr. Patel", "Ms. Reddy", "Mr. Kumar", "Mrs. Singh", "Mr. Desai", "Ms. Iyer", "Mr. Mehta"]
    agent_names = ["Arjun", "Priya", "Rahul", "Anjali", "Vikram", "Sneha", "Rohit", "Kavya"]
    products = ["Back Magic Mattress", "Energise Memory Foam", "Neuma Pocket Spring", "Balance Ortho", "LiveIn Sofa", "Duro Bed Frame"]
    locations = ["Whitefield, Bangalore", "Andheri, Mumbai", "Vasant Vihar, Delhi", "T.Nagar, Chennai", "Koregaon Park, Pune", "Banjara Hills, Hyderabad", "Salt Lake, Kolkata"]
    
    customer_name = customer_names[video_idx % len(customer_names)]
    agent_name = agent_names[video_idx % len(agent_names)]
    product = products[video_idx % len(products)]
    customer_location = locations[video_idx % len(locations)]
    
    # Demo quality scores
    demo_quality = random.randint(3, 5)
    demo_relevance = random.randint(3, 5)
    demo_video_audio = random.randint(3, 5)
    demo_effectiveness = random.randint(3, 5)
    demo_engagement = random.randint(2, 5)
    
    return {
        "Functional": {
            "Call_ID": f"DFX-VID-2025-{video_idx + 1:03d}",
            "Call_Time": f"{random.randint(10, 31)} Oct 2025, {10 + (video_idx % 8):02d}:{(video_idx * 13) % 60:02d} IST",
            "Customer_Name": customer_name,
            "Customer_Location": customer_location,
            "Agent_Name": agent_name,
            "Store_Location": store_name,
            "Agent_Presentability": {
                "Score": random.randint(4, 5),
                "Reason_for_Score": random.choice([
                    "Agent is wearing the branded Duroflex polo shirt, appears well-groomed, and the background is a neat, well-lit store display.",
                    "Professional appearance with branded uniform. Clean background showing product displays.",
                    "Well-groomed with Duroflex branded attire. Background is organized and professional."
                ]),
                "Checklist": random.choice([
                    ["Branded Uniform", "Well-Groomed", "Clean Background"],
                    ["Branded Uniform", "Professional Setup"],
                    ["Well-Groomed", "Clean Background", "Good Lighting"]
                ])
            },
            "Agent_Video_Quality_Rating": random.randint(4, 5),
            "Agent_Audio_Quality_Rating": random.randint(4, 5),
            "Customer_Audio_Quality_Rating": random.randint(3, 5),
            "Call_Objective_Theme": f"Product Inquiry ({product})",
            "Product_of_Interest": product,
            "Customer_Language": random.choice(["English", "Hindi", "Tamil", "Kannada"])
        },
        "Customer_Information": {
            "Type_of_Call": random.choice(["Sales Call (Pre-purchase)", "Service Call (Post-purchase)"]),
            "Interest_Category": random.choice(["Mattress", "Sofa", "Bed", "Accessories"]),
            "Specific_Product_Inquiry": product,
            "Primary_Questions_Asked": random.choice([
                ["Is this firm enough for back pain?", "What is the warranty period?", "King Size available for delivery?"],
                ["Do you have EMI options?", "Can I visit the store today?", "What's the current discount?"],
                ["Is this suitable for side sleepers?", "What's the return policy?", "Free home delivery?"],
                ["Does it come with a protector?", "Trial period available?", "Exchange old mattress?"]
            ]),
            "Timeline_to_Purchase": random.choice(["High (This Week)", "Medium (2-4 Weeks)", "Low (Research Phase)"]),
            "Customer_Stage_AIDA": random.choice(["Awareness", "Interest", "Desire", "Action"]),
            "Intent_to_Visit_Rating": random.choice(["HIGH", "MED", "LOW"]),
            "Intent_to_Visit_Rating_Reasons": [
                random.choice([
                    "Customer explicitly asked for store location",
                    "Mentioned wanting to physically try the mattress",
                    "Tentative interest expressed"
                ])
            ],
            "Intent_to_Purchase_Rating": random.choice(["HIGH", "MED", "LOW"]),
            "Intent_to_Purchase_Rating_Reasons": [
                random.choice([
                    "Asked about immediate availability and delivery",
                    "Focused on comparing features and validation",
                    "General exploratory questions only"
                ])
            ],
            "Barriers_to_Conversion": random.choice([
                "Spouse Approval / Trial Required",
                "Price Sensitivity",
                "Stock Unavailable",
                "Location too far",
                "Just Researching",
                "None - Ready to Purchase"
            ]),
            "Customer_Satisfaction_Score": random.randint(3, 5),
            "Customer_Satisfaction_Score_Reasons": [
                random.choice([
                    "Customer received clear answers to all questions",
                    "Agent was professional and helpful",
                    "Demo was informative and relevant"
                ])
            ],
            "Business_Satisfaction_Score": random.randint(3, 5),
            "Business_Satisfaction_Reasons": [
                random.choice([
                    "Store visit secured with confirmed time",
                    "Customer journey progressed positively",
                    "Next steps clearly defined"
                ])
            ]
        },
        "Agent_Areas": {
            "Product_Demonstration": {
                "Done": random.choice([True, True, False]),  # More likely to be true
                "Quality_Rating": random.randint(3, 5),
                "Quality_Reasons": [
                    random.choice([
                        "Clearly showed the product label and key features",
                        "Pressed mattress to demonstrate density",
                        "Camera angle was steady and focused"
                    ]),
                    random.choice([
                        "Good lighting and audio quality",
                        "Demonstrated relevant features for customer needs",
                        "Could have improved engagement by asking feedback"
                    ])
                ],
                "Relevance_Rating": random.randint(3, 5),
                "Relevance_Rating_Reason": random.choice([
                    "Perfectly aligned demo with customer's stated needs",
                    "Good relevance, highlighted key features",
                    "Adequate relevance but could be more targeted"
                ]),
                "Video_Audio_Quality_Rating": random.randint(3, 5),
                "Video_Audio_Quality_Reason": random.choice([
                    "Clear visuals and audio throughout demo",
                    "Good quality with minor lighting issues",
                    "Acceptable quality, camera angle could improve"
                ]),
                "Effectiveness_Rating": random.randint(3, 5),
                "Effectiveness_Rating_Reason": random.choice([
                    "Customer clearly understood product benefits",
                    "Effective explanation of features",
                    "Could have translated features into benefits better"
                ]),
                "Customer_Engagement_Rating": random.randint(2, 5),
                "Customer_Engagement_Reason": random.choice([
                    "Agent asked for feedback during demo",
                    "Paused to solicit customer reactions",
                    "Lectured without pausing for customer input"
                ]),
                "Demo_Observations": [
                    random.choice([
                        "Clearly showed the FPS (Five Zone Orthopedic Support) label",
                        "Demonstrated mattress firmness by pressing",
                        "Showed multiple angles of the product"
                    ]),
                    random.choice([
                        "Camera angle was steady and focused on product details",
                        "Good lighting highlighted product features",
                        "Could have shown closer details"
                    ]),
                    random.choice([
                        "Could have asked 'Does this look firm enough?'",
                        "Effective demonstration kept customer engaged",
                        "Should have solicited more feedback"
                    ])
                ]
            },
            "The_Invitation_to_Visit": {
                "Attempted": random.choice([True, True, False]),  # More likely true
                "Quality_Rating": random.randint(2, 5),
                "Reasons": [
                    random.choice([
                        "Clear invitation with specific call to action",
                        "Mentioned store location and hours",
                        "Offered to send location via WhatsApp"
                    ]),
                    random.choice([
                        "Strong close on store visit commitment",
                        "Could have been more specific about timing",
                        "Invitation was weak or missed opportunity"
                    ])
                ]
            },
            "Agent_Language_Fluency": {
                "Score": random.randint(4, 5),
                "Comment": random.choice([
                    "Excellent command of the language; clear and articulate.",
                    "Fluent with professional vocabulary and clear pronunciation.",
                    "Native-level fluency with appropriate terminology."
                ])
            },
            "RELAX_Framework": {
                "R_Reach_Out": {
                    "Rating": relax_scores[0],
                    "Reasons": random.choice([
                        ["Warm greeting with smile", "Confirmed audio/video clarity before starting"],
                        ["Friendly opening", "Built rapport quickly with customer"],
                        ["Professional greeting", "Established comfortable environment"]
                    ])
                },
                "E_Explore_Needs": {
                    "Rating": relax_scores[1],
                    "Reasons": random.choice([
                        ["Identified customer pain point effectively", "Failed to ask about weight or sleeping position"],
                        ["Good discovery questions", "Uncovered key requirements"],
                        ["Asked clarifying questions", "Could have gone deeper on needs"]
                    ])
                },
                "L_Link_Demo": {
                    "Rating": relax_scores[2],
                    "Reasons": random.choice([
                        ["Perfectly linked product features to customer needs", "Highlighted relevant technical specifications"],
                        ["Strong connection between demo and requirements", "Clear benefit articulation"],
                        ["Connected features to benefits", "Relevant product demonstration"]
                    ])
                },
                "A_Add_Value": {
                    "Rating": relax_scores[3],
                    "Reasons": random.choice([
                        ["Did not mention protectors or accessories", "Missed cross-sell opportunity"],
                        ["Suggested complementary products effectively", "Added value beyond core product"],
                        ["Mentioned warranty and care tips", "Could have cross-sold more"]
                    ])
                },
                "X_Express_Offers": {
                    "Rating": relax_scores[4],
                    "Reasons": random.choice([
                        ["Strong close on store visit", "Mentioned offers but lacked specifics"],
                        ["Clear next steps defined", "Specific urgency created with timeline"],
                        ["Closing handled professionally", "Could have created more urgency"]
                    ])
                }
            },
            "SoftSkills": {
                "Active_Listening_Rating": soft_skills_scores[0],
                "Active_Listening_Reasons": random.choice([
                    ["Did not interrupt customer", "Repeated key concerns back"],
                    ["Excellent listening", "Paused before responding"],
                    ["Good focus on customer", "Acknowledged all points"]
                ]),
                "Empathy_Rapport_Rating": soft_skills_scores[1],
                "Empathy_Rapport_Reasons": random.choice([
                    ["Validated customer concerns", "Built emotional connection"],
                    ["Showed understanding of pain points", "Used empathetic language"],
                    ["Professional rapport building", "Connected well with customer"]
                ]),
                "Clarity_Confidence_Rating": soft_skills_scores[2],
                "Clarity_Confidence_Reasons": random.choice([
                    ["Crystal clear explanations", "Confident and positive tone"],
                    ["Easy to understand", "Professional delivery"],
                    ["Clear communication", "Strong product knowledge"]
                ]),
                "Objection_Handling_Rating": soft_skills_scores[3],
                "Objection_Handling_Reasons": random.choice([
                    ["Acknowledged concerns before responding", "Reframed as benefits"],
                    ["Addressed objections professionally", "Provided solutions"],
                    ["Good handling of pushback", "Turned concerns into opportunities"]
                ]),
                "Hold_and_Dead_Air_Management_Rating": soft_skills_scores[4],
                "Hold_and_Dead_Air_Management_Reasons": random.choice([
                    ["Managed time effectively", "Kept customer engaged during transitions"],
                    ["No awkward silences", "Smooth flow throughout"],
                    ["Could have managed pauses better", "Some dead air during product retrieval"]
                ]),
                "Agent_Language_Fluency_Score": soft_skills_scores[5],
                "Top_3_Improvement_Areas": [
                    {
                        "number": 1,
                        "title": random.choice(["Needs Discovery", "Product Knowledge", "Active Listening"]),
                        "description": random.choice([
                            "Ask about sleeper weight and position to ensure medically sound recommendations.",
                            "Deepen product knowledge to answer technical questions with more confidence.",
                            "Improve active listening by pausing more before responding to customer."
                        ])
                    },
                    {
                        "number": 2,
                        "title": random.choice(["Cross-Selling", "Value Addition", "Upselling"]),
                        "description": random.choice([
                            "Always introduce mattress protector or cervical pillow when back pain is mentioned.",
                            "Suggest complementary accessories to increase average order value.",
                            "Bundle products with current offers to create more value."
                        ])
                    },
                    {
                        "number": 3,
                        "title": random.choice(["Urgency Creation", "Closing Technique", "Offer Communication"]),
                        "description": random.choice([
                            "Be more specific about current offers to drive faster decision (e.g., 'This offer ends Sunday').",
                            "Create urgency by mentioning limited stock or time-bound discounts.",
                            "Improve closing by asking for commitment rather than leaving it open-ended."
                        ])
                    }
                ]
            },
            "Overall_Summary": {
                "Chronological_Call_Summary": f"Greetings exchanged. Customer inquired about {product}. Agent showed product and explained features. Customer asked about warranty and pricing. Agent invited customer for store visit and offered to send location details via WhatsApp.",
                "Agent_Handling_Summary": f"{agent_name} demonstrated {'strong' if relax_scores[0] >= 4 else 'moderate'} product knowledge and {'excellent' if relax_scores[2] >= 4 else 'adequate'} communication skills. {'Excelled at building rapport and closing.' if relax_scores[4] >= 4 else 'Could improve on creating urgency and cross-selling.'} Overall professional handling with room for growth in {'needs discovery' if relax_scores[1] < 4 else 'value addition'}.",
                "Customer_Satisfaction_Summary": f"Customer had a {'smooth and informative' if random.random() > 0.3 else 'satisfactory'} experience. Questions were {'thoroughly' if random.random() > 0.4 else 'adequately'} answered. Customer felt comfortable enough to {'commit to a store visit' if random.random() > 0.5 else 'consider visiting the store'}.",
                "Next_Action": random.choice([
                    "WhatsApp Location Sent",
                    "Customer visiting store at 5PM today",
                    "Agent will follow up with pricing details",
                    "Customer will call back after discussing with family",
                    "Store visit scheduled for weekend"
                ])
            },
            "Transcript": {
                "messages": [
                    {
                        "time": "00:02",
                        "speaker": "agent",
                        "speaker_name": agent_name,
                        "text": f"Good morning, welcome to Duroflex {store_name}. Am I audible?"
                    },
                    {
                        "time": "00:08",
                        "speaker": "customer",
                        "speaker_name": customer_name,
                        "text": f"Yes, I can hear you. I'm looking for {product}. {random.choice(['I have back issues.', 'Can you show me this?', 'Is this available?'])}"
                    },
                    {
                        "time": "00:15",
                        "speaker": "agent",
                        "speaker_name": agent_name,
                        "text": f"Understood. The {product} is {random.choice(['our best-seller', 'perfect for your needs', 'a great choice'])}. Let me show you why."
                    },
                    {
                        "time": "00:25",
                        "speaker": "agent",
                        "speaker_name": agent_name,
                        "text": random.choice([
                            "[Pressing Mattress] You see this resistance? This is the high-density layer.",
                            "[Showing Product] Notice the quality of materials used here.",
                            "[Demonstrating Feature] This is what makes it special for your needs."
                        ])
                    },
                    {
                        "time": "00:35",
                        "speaker": "customer",
                        "speaker_name": customer_name,
                        "text": random.choice([
                            "That looks good. What is the warranty?",
                            "Interesting. What's the price range?",
                            "I see. Is this available for immediate delivery?"
                        ])
                    },
                    {
                        "time": "00:38",
                        "speaker": "agent",
                        "speaker_name": agent_name,
                        "text": random.choice([
                            "It comes with a 7-year warranty against sagging.",
                            "The price starts from ₹25,000 with current festive offers.",
                            "Yes, we have it in stock for immediate delivery."
                        ])
                    },
                    {
                        "time": "00:45",
                        "speaker": "customer",
                        "speaker_name": customer_name,
                        "text": random.choice([
                            "Okay, I need to check with my spouse. We might come down.",
                            "Let me think about it. Can I visit the store?",
                            "Sounds good. What are the store timings?"
                        ])
                    },
                    {
                        "time": "00:52",
                        "speaker": "agent",
                        "speaker_name": agent_name,
                        "text": random.choice([
                            "Please do come. You should try it to really feel the support. I'll WhatsApp you the location?",
                            "Absolutely! We're open 10 AM to 8 PM. Shall I send you the location?",
                            "Great! Let me share the store details with you via WhatsApp right now."
                        ])
                    }
                ]
            }
        }
    }


def generate_all_demo_data():
    """Generate demo data for all videos"""
    print("\n" + "=" * 80)
    print("🎬 GENERATING DEMO ANALYSIS DATA")
    print("=" * 80)
    
    # Load CSV to get store names
    df = load_video_csv()
    
    generated = 0
    errors = 0
    
    for idx, row in df.iterrows():
        report_id = f"video_{idx}"
        store_name = row.get('Store Name', f'Store {idx}')
        
        try:
            # Generate demo data
            analysis = generate_demo_analysis(idx, store_name)
            
            # Save
            save_video_analysis(report_id, analysis)
            
            print(f"✅ [{idx + 1:02d}/22] Generated {store_name}")
            generated += 1
            
        except Exception as e:
            print(f"❌ [{idx + 1:02d}/22] Error: {str(e)[:40]}")
            errors += 1
    
    print("\n" + "=" * 80)
    print("✅ DEMO DATA GENERATION COMPLETE")
    print("=" * 80)
    print(f"📊 Generated: {generated} videos")
    print(f"❌ Errors: {errors}")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    generate_all_demo_data()
