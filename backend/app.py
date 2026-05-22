import os
import jwt
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS for Next.js frontend running on port 3000
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

# Initialize Supabase
supabase_url = os.environ.get("SUPABASE_URL", "https://mock-project.supabase.co")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "mock-anon")
supabase_jwt_secret = os.environ.get("SUPABASE_JWT_SECRET", "mock-secret")

# Check if we are running in Mock mode
is_mock_mode = "mock-project" in supabase_url or supabase_key == "mock-anon"

supabase_client: Client = None
if not is_mock_mode:
    try:
        supabase_client = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"Error initializing Supabase client: {e}. Switching to Mock Mode.")
        is_mock_mode = True

# --- JWT Authentication Decorator ---
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization token"}), 401
        
        token = auth_header.split(" ")[1]
        
        # Graceful degradation for mock local testing
        if is_mock_mode or token == "mock-token":
            g.user_id = "mock-user-uuid"
            g.email = "alex@mindbloom.ai"
            return f(*args, **kwargs)
            
        try:
            # Decode and verify JWT using Supabase HS256 key secret
            decoded = jwt.decode(
                token, 
                supabase_jwt_secret, 
                algorithms=["HS256"], 
                audience="authenticated"
            )
            g.user_id = decoded["sub"]
            g.email = decoded.get("email")
        except jwt.ExpiredSignatureError as e:
            print(f"Auth Error (Expired): {e}")
            return jsonify({"error": "Session token has expired"}), 401
        except jwt.InvalidTokenError as e:
            print(f"Auth Error (InvalidToken): {e}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Invalid session token: {str(e)}"}), 401
            
        return f(*args, **kwargs)
    return decorated

# --- Local Mock Storage for fallback testing ---
mock_profile = {
    "name": "Alex Rivera",
    "email": "alex@mindbloom.ai",
    "role": "none",
    "gender": "",
    "smoking": "no",
    "alcohol": "never",
    "age": 24,
    "maritalStatus": "single",
    "intentions": [],
    "challenges": [],
    "xp": 120,
    "level": 1,
    "streak": 3,
    "notificationsEnabled": True
}
mock_checkins = []
mock_chat_messages = [
    { "id": "m_init", "role": "assistant", "content": "Hello! I'm your MindBloom wellness companion. How has your day been?", "timestamp": "2026-05-22T09:00:00Z" }
]
mock_posts = [
    {
        "id": "p1",
        "author": "Elena Vance",
        "role": "Student",
        "content": "Finals week is finally over! Sending calm vibes to anyone who is still testing. Remember to breathe and step away from the desk. You've got this!",
        "timestamp": "3 hours ago",
        "reactions": { "hugs": 12, "support": 8, "calm": 15 },
        "userReaction": None,
        "comments": [
            { "id": "c1_1", "author": "Markus D.", "content": "Thank you for this! Needed to hear it today.", "timestamp": "2 hours ago" }
        ]
    }
]

# --- Helper logic for stress score calculations ---
def calculate_stress(value, sleep_hours, focus_score):
    mood_factor = 10 - value
    sleep_factor = 0 if sleep_hours >= 8 else 10 if sleep_hours <= 4 else (8 - sleep_hours) * 2.5
    focus_factor = 10 - focus_score
    raw = (mood_factor * 0.4) + (sleep_factor * 0.35) + (focus_factor * 0.25)
    return max(1, min(10, round(raw)))

# --- Helper logic for AI classifier ---
def classify_sentiment(text):
    lower = text.lower()
    if any(w in lower for w in ['depressed', 'sad', 'hopeless', 'lonely', 'cry', 'miserable']):
        return 'Depression'
    if any(w in lower for w in ['anxious', 'worry', 'panicking', 'panic', 'scared', 'fear']):
        return 'Anxiety'
    if any(w in lower for w in ['stress', 'exhausted', 'burnout', 'tired', 'work', 'exam', 'deadline', 'pressure']):
        return 'Stress'
    return 'Normal'

# --- Helper logic for companion reply ---
def get_companion_reply(text, sentiment):
    if sentiment == 'Depression':
        return "I hear how heavy things feel right now. It takes a lot of strength to put these feelings into words. Please know that your feelings are valid, and you don't have to carry this alone. I'm here to listen."
    if sentiment == 'Anxiety':
        return "I sense that you're feeling anxious right now. Let's take a gentle pause together. Breathe in slowly... hold it... and let it go. You're safe here. Would you like to explore what's causing this tension?"
    if sentiment == 'Stress':
        return "It sounds like you have a lot on your plate and you're feeling the pressure. Remember to give yourself credit for how hard you're working. Shall we try a quick breathing session?"
    
    lower = text.lower()
    if 'hello' in lower or 'hi ' in lower or lower == 'hi':
        return "Hello! I'm your MindBloom companion. I'm here to support you, listen without judgment, or guide you through grounding activities. How are you feeling today?"
    if 'game' in lower or 'bubble' in lower or 'meditat' in lower:
        return "I'd love to help with that! We have several interactive games like Bubble Pop, Breathing guides, and peaceful soundscapes in the Relief tools tab."
    return "Thank you for sharing that. It's really helpful to get those thoughts out. What else is on your mind?"

# --- ROUTES ---

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "mock_mode": is_mock_mode})

# User Profile Endpoint
@app.route("/api/profile", methods=["GET", "POST", "PUT"])
@require_auth
def profile_route():
    global mock_profile
    if is_mock_mode:
        if request.method in ["POST", "PUT"]:
            data = request.json or {}
            for key, val in data.items():
                mock_profile[key] = val
            return jsonify(mock_profile)
        return jsonify(mock_profile)
    
    # Real Supabase DB Operations
    if request.method in ["POST", "PUT"]:
        data = request.json or {}
        # Parse fields from camelCase to snake_case for DB
        db_fields = {}
        if "name" in data: db_fields["name"] = data["name"]
        if "email" in data: db_fields["email"] = data["email"]
        if "role" in data: db_fields["role"] = data["role"]
        if "gender" in data: db_fields["gender"] = data["gender"]
        if "smoking" in data: db_fields["smoking"] = data["smoking"]
        if "alcohol" in data: db_fields["alcohol"] = data["alcohol"]
        if "age" in data: db_fields["age"] = int(data["age"])
        if "maritalStatus" in data: db_fields["marital_status"] = data["maritalStatus"]
        if "intentions" in data: db_fields["intentions"] = data["intentions"]
        if "challenges" in data: db_fields["challenges"] = data["challenges"]
        if "xp" in data: db_fields["xp"] = int(data["xp"])
        if "level" in data: db_fields["level"] = int(data["level"])
        if "streak" in data: db_fields["streak"] = int(data["streak"])
        if "notificationsEnabled" in data: db_fields["notifications_enabled"] = data["notificationsEnabled"]

        # Insert or update
        res = supabase_client.table("profiles").upsert({"id": g.user_id, **db_fields}).execute()
        return jsonify(res.data[0] if res.data else {})
    else:
        res = supabase_client.table("profiles").select("*").eq("id", g.user_id).execute()
        if res.data:
            # Map snake_case database schema back to camelCase frontend types
            db_prof = res.data[0]
            fe_prof = {
                "name": db_prof.get("name"),
                "email": db_prof.get("email"),
                "role": db_prof.get("role"),
                "gender": db_prof.get("gender"),
                "smoking": db_prof.get("smoking"),
                "alcohol": db_prof.get("alcohol"),
                "age": db_prof.get("age"),
                "maritalStatus": db_prof.get("marital_status"),
                "intentions": db_prof.get("intentions") or [],
                "challenges": db_prof.get("challenges") or [],
                "xp": db_prof.get("xp", 120),
                "level": db_prof.get("level", 1),
                "streak": db_prof.get("streak", 3),
                "notificationsEnabled": db_prof.get("notifications_enabled", True)
            }
            return jsonify(fe_prof)
        return jsonify({"error": "Profile not found"}), 404

# Mood Check-in Endpoints
@app.route("/api/mood", methods=["GET", "POST"])
@require_auth
def mood_route():
    global mock_checkins
    if is_mock_mode:
        if request.method == "POST":
            data = request.json or {}
            stress = calculate_stress(data.get("value", 7), data.get("sleepHours", 7.5), data.get("focusScore", 7))
            new_log = {
                "id": str(len(mock_checkins) + 1),
                "value": data.get("value", 7),
                "note": data.get("note", ""),
                "date": data.get("date", "2026-05-22"),
                "timestamp": "2026-05-22T14:50:00Z",
                "tags": data.get("tags", []),
                "sleepHours": data.get("sleepHours", 7.5),
                "focusScore": data.get("focusScore", 7),
                "stressLevel": stress
            }
            mock_checkins.insert(0, new_log)
            return jsonify(new_log)
        return jsonify(mock_checkins)
    
    if request.method == "POST":
        data = request.json or {}
        stress = calculate_stress(data.get("value", 7), data.get("sleepHours", 7.5), data.get("focusScore", 7))
        db_log = {
            "user_id": g.user_id,
            "value": int(data.get("value", 7)),
            "note": data.get("note", ""),
            "date": data.get("date"),
            "tags": data.get("tags", []),
            "sleep_hours": float(data.get("sleepHours", 7.5)),
            "focus_score": int(data.get("focusScore", 7)),
            "stress_level": stress
        }
        res = supabase_client.table("mood_checkins").insert(db_log).execute()
        return jsonify(res.data[0] if res.data else {})
    else:
        res = supabase_client.table("mood_checkins").select("*").eq("user_id", g.user_id).order("timestamp", desc=True).execute()
        fe_logs = []
        for log in res.data or []:
            fe_logs.append({
                "id": log.get("id"),
                "value": log.get("value"),
                "note": log.get("note"),
                "date": log.get("date"),
                "timestamp": log.get("timestamp"),
                "tags": log.get("tags") or [],
                "sleepHours": float(log.get("sleep_hours", 7.5)),
                "focusScore": log.get("focus_score"),
                "stressLevel": log.get("stress_level")
            })
        return jsonify(fe_logs)

# Chat messages API
@app.route("/api/chat", methods=["GET", "POST"])
@require_auth
def chat_route():
    global mock_chat_messages
    if is_mock_mode:
        if request.method == "POST":
            data = request.json or {}
            content = data.get("content", "")
            sentiment = classify_sentiment(content)
            
            user_msg = { "id": str(len(mock_chat_messages) + 1), "role": "user", "content": content, "timestamp": "2026-05-22T14:51:00Z" }
            mock_chat_messages.append(user_msg)
            
            reply_text = get_companion_reply(content, sentiment)
            ai_msg = { "id": str(len(mock_chat_messages) + 1), "role": "assistant", "content": reply_text, "sentiment": sentiment, "timestamp": "2026-05-22T14:51:01Z" }
            mock_chat_messages.append(ai_msg)
            
            return jsonify({ "user": user_msg, "assistant": ai_msg })
        return jsonify(mock_chat_messages)
    
    if request.method == "POST":
        data = request.json or {}
        content = data.get("content", "")
        sentiment = classify_sentiment(content)
        
        # Save user message
        res_user = supabase_client.table("chat_messages").insert({
            "user_id": g.user_id,
            "role": "user",
            "content": content
        }).execute()
        
        # Generate reply
        reply_text = get_companion_reply(content, sentiment)
        
        # Save AI reply
        res_ai = supabase_client.table("chat_messages").insert({
            "user_id": g.user_id,
            "role": "assistant",
            "content": reply_text,
            "sentiment": sentiment
        }).execute()
        
        user_msg = res_user.data[0] if res_user.data else {}
        ai_msg = res_ai.data[0] if res_ai.data else {}
        
        return jsonify({
            "user": {
                "id": user_msg.get("id"),
                "role": "user",
                "content": user_msg.get("content"),
                "timestamp": user_msg.get("timestamp")
            },
            "assistant": {
                "id": ai_msg.get("id"),
                "role": "assistant",
                "content": ai_msg.get("content"),
                "sentiment": ai_msg.get("sentiment"),
                "timestamp": ai_msg.get("timestamp")
            }
        })
    else:
        res = supabase_client.table("chat_messages").select("*").eq("user_id", g.user_id).order("timestamp", desc=False).execute()
        messages = []
        for msg in res.data or []:
            messages.append({
                "id": msg.get("id"),
                "role": msg.get("role"),
                "content": msg.get("content"),
                "sentiment": msg.get("sentiment"),
                "timestamp": msg.get("timestamp")
            })
        return jsonify(messages)

@app.route("/api/chat/clear", methods=["POST"])
@require_auth
def chat_clear_route():
    global mock_chat_messages
    if is_mock_mode:
        mock_chat_messages = [
            { "id": "m_init", "role": "assistant", "content": "Hello! I'm your MindBloom wellness companion. How has your day been?", "timestamp": "2026-05-22T09:00:00Z" }
        ]
        return jsonify({"success": True})
    
    supabase_client.table("chat_messages").delete().eq("user_id", g.user_id).execute()
    return jsonify({"success": True})

# Community Feed Endpoint
@app.route("/api/community", methods=["GET", "POST"])
@require_auth
def community_route():
    global mock_posts
    if is_mock_mode:
        if request.method == "POST":
            data = request.json or {}
            content = data.get("content", "")
            new_post = {
                "id": str(len(mock_posts) + 1),
                "author": mock_profile["name"],
                "role": "Student" if mock_profile["role"] == "student" else "Professional",
                "content": content,
                "timestamp": "Just now",
                "reactions": { "hugs": 0, "support": 0, "calm": 0 },
                "userReaction": None,
                "comments": []
            }
            mock_posts.insert(0, new_post)
            return jsonify(new_post)
        return jsonify(mock_posts)
    
    if request.method == "POST":
        data = request.json or {}
        content = data.get("content", "")
        
        # Get author details
        prof_res = supabase_client.table("profiles").select("name, role").eq("id", g.user_id).execute()
        prof = prof_res.data[0] if prof_res.data else {"name": "Anonymous User", "role": "none"}
        
        db_post = {
            "user_id": g.user_id,
            "author_name": prof.get("name"),
            "author_role": "Student" if prof.get("role") == "student" else "Professional" if prof.get("role") == "professional" else "Wellness Member",
            "content": content,
            "timestamp": "Just now"
        }
        
        res = supabase_client.table("posts").insert(db_post).execute()
        return jsonify(res.data[0] if res.data else {})
    else:
        # Get posts
        posts_res = supabase_client.table("posts").select("*").order("created_at", desc=True).execute()
        posts_list = posts_res.data or []
        
        # Get comments
        comments_res = supabase_client.table("comments").select("*").order("created_at", desc=False).execute()
        comments_list = comments_res.data or []
        
        # Get user reactions
        rx_res = supabase_client.table("post_reactions").select("*").eq("user_id", g.user_id).execute()
        user_rx_map = {rx["post_id"]: rx["reaction_type"] for rx in rx_res.data or []}
        
        # Construct response
        results = []
        for post in posts_list:
            post_id = post["id"]
            post_comments = []
            for comment in comments_list:
                if str(comment["post_id"]) == str(post_id):
                    post_comments.append({
                        "id": comment["id"],
                        "author": comment["author_name"],
                        "content": comment["content"],
                        "timestamp": comment["timestamp"]
                    })
                    
            results.append({
                "id": post_id,
                "author": post["author_name"],
                "role": post["author_role"],
                "content": post["content"],
                "timestamp": post["timestamp"],
                "reactions": {
                    "hugs": post.get("hugs_count", 0),
                    "support": post.get("support_count", 0),
                    "calm": post.get("calm_count", 0)
                },
                "userReaction": user_rx_map.get(post_id),
                "comments": post_comments
            })
            
        return jsonify(results)

# Community Feed Reactions
@app.route("/api/community/react", methods=["POST"])
@require_auth
def community_react_route():
    data = request.json or {}
    post_id = data.get("postId")
    reaction_type = data.get("reactionType") # 'hugs' | 'support' | 'calm'
    
    if is_mock_mode:
        global mock_posts
        for post in mock_posts:
            if post["id"] == post_id:
                curr_rx = post.get("userReaction")
                if curr_rx == reaction_type:
                    # Toggle off
                    post["reactions"][reaction_type] = max(0, post["reactions"][reaction_type] - 1)
                    post["userReaction"] = None
                else:
                    # Clear previous
                    if curr_rx:
                        post["reactions"][curr_rx] = max(0, post["reactions"][curr_rx] - 1)
                    # Add new
                    post["reactions"][reaction_type] += 1
                    post["userReaction"] = reaction_type
                return jsonify({"success": True})
        return jsonify({"error": "Post not found"}), 404

    # Real DB Reaction management
    # 1. Check existing reaction
    existing = supabase_client.table("post_reactions").select("*").eq("post_id", post_id).eq("user_id", g.user_id).execute()
    existing_data = existing.data or []
    
    post_res = supabase_client.table("posts").select("*").eq("id", post_id).execute()
    if not post_res.data:
        return jsonify({"error": "Post not found"}), 404
    post = post_res.data[0]
    
    hugs = post.get("hugs_count", 0)
    support = post.get("support_count", 0)
    calm = post.get("calm_count", 0)
    
    if existing_data:
        curr_rx_type = existing_data[0]["reaction_type"]
        if curr_rx_type == reaction_type:
            # Delete/Toggle off
            supabase_client.table("post_reactions").delete().eq("post_id", post_id).eq("user_id", g.user_id).execute()
            if reaction_type == "hugs": hugs = max(0, hugs - 1)
            elif reaction_type == "support": support = max(0, support - 1)
            elif reaction_type == "calm": calm = max(0, calm - 1)
        else:
            # Update existing
            supabase_client.table("post_reactions").update({"reaction_type": reaction_type}).eq("post_id", post_id).eq("user_id", g.user_id).execute()
            # Decrement previous
            if curr_rx_type == "hugs": hugs = max(0, hugs - 1)
            elif curr_rx_type == "support": support = max(0, support - 1)
            elif curr_rx_type == "calm": calm = max(0, calm - 1)
            # Increment new
            if reaction_type == "hugs": hugs += 1
            elif reaction_type == "support": support += 1
            elif reaction_type == "calm": calm += 1
    else:
        # Insert new
        supabase_client.table("post_reactions").insert({
            "post_id": post_id,
            "user_id": g.user_id,
            "reaction_type": reaction_type
        }).execute()
        if reaction_type == "hugs": hugs += 1
        elif reaction_type == "support": support += 1
        elif reaction_type == "calm": calm += 1
        
    # Update post counts
    supabase_client.table("posts").update({
        "hugs_count": hugs,
        "support_count": support,
        "calm_count": calm
    }).eq("id", post_id).execute()
    
    return jsonify({"success": True})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
