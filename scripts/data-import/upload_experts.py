import os
import json
import pandas as pd
import requests
from dotenv import load_dotenv
from io import BytesIO
from pathlib import Path
import re
import random
import glob

load_dotenv()  # loads STRAPI_URL and STRAPI_TOKEN from .env

# STRAPI_URL = os.getenv('STRAPI_URL')
# STRAPI_TOKEN = os.getenv('STRAPI_TOKEN').strip() if os.getenv('STRAPI_TOKEN') else None

# STRAPI_URL = 'https://consult-teligence-backend.onrender.com'
# STRAPI_TOKEN = '0aea1420560a5619f3598c4e479191e14ce881f5268f671dbc2e572425159acf20854b693ece04cc8b56b56d066386b5257d05538170135ba42038885ea09c0b8fc4c6cde992302fe2f03ea718b9731194827b990647b66e6af9c1eddb37048149294b0615abef6de29818bcbcff36984478db81158d4c02b4639c2d913e8a2e'

STRAPI_URL='http://localhost:1337'
STRAPI_TOKEN='a4dab8ced2ecd7baa3e8ac5fcef1e0c5ee54525e01a280c7761f5574dc395e656537ef85721709bc805189dba332db4f759e3f6599179ffbe8ce514cc770ec3f486480b600de1657813603ecd71306170d9c84da0eed837dd9dde38243d0dcc580017175353c02b672769ebc477f507c4a5aaab57544c58773de81b44b5e49fc'

print(STRAPI_URL, STRAPI_TOKEN)

if not STRAPI_URL or not STRAPI_TOKEN:
    print("Error: STRAPI_URL and STRAPI_TOKEN must be set in .env")
    exit(1)

HEADERS_JSON = {
    "Authorization": f"Bearer {STRAPI_TOKEN}",
    "Content-Type": "application/json"
}
HEADERS_FORM = {
    "Authorization": f"Bearer {STRAPI_TOKEN}"
}

# Adjust this to your actual collection name
COLLECTION = 'consultants'  # if your endpoint is /api/experts


# Load Excel
print("Current working directory:", os.getcwd())
SCRIPT_DIR = Path(__file__).resolve().parent
excel_filename = 'expert_profile.xlsx'
excel_path = SCRIPT_DIR.parent.parent / excel_filename
print("Loading Excel from :", excel_path)
if not excel_path.exists():
    print(f"Error: Excel file not found at {excel_path}")
    exit(1)
df = pd.read_excel(excel_path, sheet_name="Import Ready", dtype=str)  # read all as str; empty cells become NaN
df = df.where(pd.notna(df), None)

print("Excel columns:", list(df.columns))

# ---------- IMAGE FOLDER SETUP ----------
# Folder where images live
IMAGES_DIR = SCRIPT_DIR / 'images'  # adjust if needed
print("Looking for images in:", IMAGES_DIR)
if not IMAGES_DIR.is_dir():
    print(f"Warning: images folder {IMAGES_DIR} not found. Media upload for local files will fail.")
# Default avatar filename in that folder
DEFAULT_AVATAR = IMAGES_DIR / 'default-avatar-icon-of-social-media-user-vector.jpg'
if not DEFAULT_AVATAR.exists():
    print(f"Warning: default avatar {DEFAULT_AVATAR} not found. Rows without matching image will skip media.")

# Build a lookup map: normalized name -> file path
# For each file in IMAGES_DIR, strip extension, remove suffix “ProfilePicture” (case-insensitive), remove non-alphanumeric, lowercase
image_map = {}
if IMAGES_DIR.is_dir():
    for f in IMAGES_DIR.iterdir():
        if f.is_file():
            stem = f.stem  # filename without extension
            # remove “ProfilePicture” suffix if present (case-insensitive)
            cleaned = re.sub(r'(?i)profilepicture$', '', stem)
            # remove non-alphanumeric characters
            cleaned = re.sub(r'[^A-Za-z0-9]', '', cleaned)
            key = cleaned.lower()
            if key:
                image_map[key] = f

def find_local_image(firstName, lastName):
    """
    Normalize firstName+lastName and look up in image_map.
    Returns Path if found, else DEFAULT_AVATAR if exists, else None.
    """
    if not firstName or not lastName:
        return None
    combined = f"{firstName}{lastName}"
    # normalize: remove non-alphanumeric, lowercase
    norm = re.sub(r'[^A-Za-z0-9]', '', combined).lower()
    # exact match
    if norm in image_map:
        return image_map[norm]
    # fallback: lastName only
    norm_last = re.sub(r'[^A-Za-z0-9]', '', lastName).lower()
    if norm_last in image_map:
        return image_map[norm_last]
    # no match: use default if available
    if DEFAULT_AVATAR.exists():
        print(f"No local image for {firstName} {lastName}; using default avatar.")
        return DEFAULT_AVATAR
    return None

# Utility: upload media from URL or local Path
def upload_media(path_or_url, ref=None, refId=None, field=None):
    """
    Uploads a file (local or URL) to Strapi.
    If ref/refId/field are provided, the file is linked to that entry:
      - ref:       the model UID, e.g. 'api::expert.expert'
      - refId:     the documentId string of the entry (not the numeric id)
      - field:     the media field name, e.g. 'profileImage'
    Returns the uploaded file's numeric ID on success, or None on failure.
    """
    if not path_or_url:
        return None

    try:
        # Handle local files
        if isinstance(path_or_url, Path) or (isinstance(path_or_url, str) and not path_or_url.lower().startswith(('http://','https://'))):
            file_path = Path(path_or_url)
            if not file_path.exists():
                print(f"⚠️ Local file not found: {file_path}")
                return None
            
            # Read file content
            with open(file_path, 'rb') as f:
                file_content = f.read()
            filename = file_path.name
            
        else:
            # Handle URLs
            url = path_or_url.strip()
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            file_content = resp.content
            filename = os.path.basename(url.split('?')[0])

        # Prepare the files dict - this is the key fix
        files = {'files': (filename, file_content, 'image/jpeg')}  # Added mime type
        
        form_data = {}
        # If linking to an entry, include these fields per “Upload entry files” :contentReference[oaicite:1]{index=1}
        if ref and refId and field:
            form_data['ref']   = ref
            form_data['refId'] = refId
            form_data['field'] = field

        print(f"📤 Uploading {filename} ({len(file_content)} bytes)")

        res = requests.post(
                f"{STRAPI_URL}/api/upload",
                headers=HEADERS_FORM,   # only Authorization
                files=files,
                data=form_data,
                timeout=60
            )

        if not res.ok:
            # print full JSON or text error
            try:
                err = res.json()
            except ValueError:
                err = res.text
            print(f"❌ Upload failed ({res.status_code}): {err}")
            return None

        # on success Strapi returns a list of file objects
        resp = res.json()
        if isinstance(resp, list) and resp:
            return resp[0].get('id')
        if isinstance(resp, dict) and resp.get('data'):
            # fallback for older Strapi formats
            arr = resp['data']
            if isinstance(arr, list) and arr:
                return arr[0].get('id')

        print(f"⚠️ Unexpected upload response: {resp}")
        return None
    
    except Exception as e:
        print(f"❌ Error uploading {path_or_url}: {e}")
        return None


# Utility: check existing by a unique key
def find_existing_expert(email, firstName, lastName):
    """
    Returns dict with 'id' and 'documentId' if found, None otherwise
    """
    params = {}
    if email:
        params[f"filters[contactInfo][Email][$eq]"] = email
    else:
        params[f"filters[firstName][$eq]"] = firstName
        params[f"filters[lastName][$eq]"] = lastName
    try:
        res = requests.get(f"{STRAPI_URL}/api/{COLLECTION}", headers=HEADERS_JSON, params=params, timeout=30)
        res.raise_for_status()
        j = res.json()
        if j.get('data') and isinstance(j['data'], list) and len(j['data']) > 0:
            item = j['data'][0]
            return {
                'id': item.get('id'),
                'documentId': item.get('documentId')
            }
    except Exception as e:
        print(f"Warning: could not query existing expert for '{firstName} {lastName}': {e}")
    return None

# Helper: parse JSON-like cell or comma-separated
def parse_json_field(cell_value):
    if not cell_value:
        return None
    cell_value = cell_value.strip()
    if cell_value.startswith('[') or cell_value.startswith('{'):
        try:
            return json.loads(cell_value)
        except json.JSONDecodeError:
            pass
    parts = [p.strip() for p in cell_value.split(',') if p.strip()]
    return parts

# Validate enumeration value
def validate_enum(field_name, value, allowed_values):
    if value is None:
        return None
    if value not in allowed_values:
        print(f"Warning: enum field '{field_name}' has value '{value}' not in allowed {allowed_values}. Skipping this field.")
        return None
    return value

# Allowed enum options for geographicalExpertise (replace with your actual enum values)
ALLOWED_GEOGRAPHICAL = [
    "North America", "South America", "Asia", "Europe", "Africa", "Oceania", "Middle East"
]

# Random data generators for missing fields
def generate_random_email(firstName, lastName):
    """Generate a random professional email address"""
    domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'consulting.com', 'expert.com']
    patterns = [
        f"{firstName.lower()}.{lastName.lower()}@{random.choice(domains)}",
        f"{firstName.lower()}{lastName.lower()}@{random.choice(domains)}",
        f"{firstName[0].lower()}.{lastName.lower()}@{random.choice(domains)}",
        f"{firstName.lower()}.{lastName[0].lower()}@{random.choice(domains)}"
    ]
    return random.choice(patterns)

def generate_random_phone():
    """Generate a random phone number"""
    formats = [
        f"+1-{random.randint(200,999)}-{random.randint(200,999)}-{random.randint(1000,9999)}",
        f"+44-{random.randint(20,99)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
        f"({random.randint(200,999)}) {random.randint(200,999)}-{random.randint(1000,9999)}"
    ]
    return random.choice(formats)

def generate_random_linkedin(firstName, lastName):
    """Generate a random LinkedIn profile URL"""
    variations = [
        f"https://linkedin.com/in/{firstName.lower()}-{lastName.lower()}",
        f"https://linkedin.com/in/{firstName.lower()}{lastName.lower()}",
        f"https://linkedin.com/in/{firstName.lower()}.{lastName.lower()}",
        f"https://linkedin.com/in/{firstName[0].lower()}{lastName.lower()}"
    ]
    return random.choice(variations)

def generate_random_availability():
    """Generate random availability status"""
    options = [
        "Available immediately",
        "Available within 2-4 weeks",
        "Available for part-time projects",
        "Available for remote work",
        "Available on weekends",
        "Flexible availability",
        "Available with 30 days notice"
    ]
    return random.choice(options)

def generate_random_certifications():
    """Generate random certifications array"""
    cert_pool = [
        "PMP - Project Management Professional",
        "CPA - Certified Public Accountant",
        "MBA - Master of Business Administration",
        "Six Sigma Black Belt",
        "CISSP - Certified Information Systems Security Professional",
        "AWS Certified Solutions Architect",
        "Google Analytics Certified",
        "Salesforce Certified Administrator",
        "Scrum Master Certification",
        "ITIL Foundation Certification",
        "Microsoft Certified Professional",
        "Certified Financial Planner (CFP)",
        "Lean Six Sigma Green Belt",
        "Digital Marketing Certificate"
    ]
    # Generate 1-4 random certifications
    num_certs = random.randint(1, 4)
    return random.sample(cert_pool, num_certs)

def generate_random_languages():
    """Generate random languages array"""
    lang_pool = [
        "English (Native)",
        "Spanish (Fluent)",
        "French (Conversational)",
        "German (Business)",
        "Mandarin (Basic)",
        "Japanese (Conversational)",
        "Portuguese (Fluent)",
        "Italian (Basic)",
        "Arabic (Business)",
        "Dutch (Conversational)",
        "Russian (Basic)",
        "Korean (Basic)"
    ]
    # Generate 1-3 random languages
    num_langs = random.randint(1, 3)
    return random.sample(lang_pool, num_langs)

def generate_random_testimonials():
    """Generate random testimonials array"""
    testimonial_templates = [
        {
            "name": "Sarah Johnson", # Changed from "client"
            "company": "TechCorp",    # Added "company" field
            "text": "Outstanding expertise and professionalism. Delivered results ahead of schedule and exceeded our expectations." # Changed from "testimonial"
        },
        {
            "name": "Michael Chen",
            "company": "Global Solutions",
            "text": "Exceptional analytical skills and strategic thinking. Would definitely work with them again."
        },
        {
            "name": "Emma Rodriguez",
            "company": "StartupXYZ",
            "text": "Brought innovative solutions to complex challenges. Highly recommended for any organization."
        },
        {
            "name": "David Thompson",
            "company": "Enterprise Inc",
            "text": "Professional, reliable, and results-driven. Made a significant impact on our project outcomes."
        }
    ]
    # Generate 1-2 random testimonials
    num_testimonials = random.randint(1, 2)
    return random.sample(testimonial_templates, num_testimonials)

def generate_random_case_studies():
    """Generate random case studies array"""
    case_study_templates = [
        {
            "title": "Digital Transformation Initiative",
            "description": "Led a comprehensive digital transformation project resulting in 40% improved operational efficiency and $2M annual cost savings.",
        },
        {
            "title": "Market Expansion Strategy",
            "description": "Developed and executed market entry strategy for new geographical regions, resulting in 25% revenue growth.",
        },
        {
            "title": "Process Optimization Project",
            "description": "Analyzed and redesigned core business processes, eliminating bottlenecks and improving customer satisfaction.",
        }
    ]
    # Generate 1-2 random case studies
    num_cases = random.randint(1, 2)
    return random.sample(case_study_templates, num_cases)

PROPERTY_TITLES = [
    "Harborview Retail Center",
    "Riverside Office Complex",
    "Dockside Industrial Park",
    "Urban Living Residences",
    "Sunset Plaza",
    "Greenfield Logistics Hub",
    "Central Business Tower",
    "Lakeside Apartments",
    "Innovation Park",
    "Market Square Offices",
    "City Center Mall",
    "Grandview Estates",
    "Tech Valley Campus",
    "Summit Heights",
    "Parkside Villas"
]

def create_property_for_consultant(consultant_id, consultant_doc_id, property_idx=1):
    payload = {
        "title": f"{random.choice(PROPERTY_TITLES)} {random.choice(['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'])} {random.randint(1, 99)}",
        "address": f"{random.randint(1,999)} Example St, City {property_idx}",
        "property_uid": f"pr_{consultant_doc_id}_{property_idx}",
        "property_type": random.choice(["Industrial", "Office", "Retail", "Residential"]),
        "status": random.choice(["Stabilised", "Under Construction", "Exited", "Planning"]),
        "headline_metric": f"{random.randint(4,8)}% cap rate",
        "deal_size": random.randint(1000000, 50000000),
        "irr": round(random.uniform(8, 20), 2),
        "completion_percentage": random.randint(10, 100),
        "owner": consultant_id,  # This links the property to the consultant
        "roles": ", ".join(random.sample(["Developer", "Asset Manager", "Broker", "Investor", "Legal Counsel"], k=random.randint(1,2))),
        "tags": ", ".join(random.sample(["Prime", "Investment", "Luxury", "Affordable", "Green"], k=random.randint(1,2)))
    }
    res = requests.post(f"{STRAPI_URL}/api/properties", headers=HEADERS_JSON, json={"data": payload})
    print("Property creation response:", res.status_code, res.text)
    res.raise_for_status()
    return res.json()["data"]["id"], payload["property_uid"]

def create_timeline_item_for_consultant(consultant_id, property_id, property_uid, idx=1):
    payload = {
        "post_id": f"post_{consultant_id}_{idx}",
        "created_at": pd.Timestamp.now().isoformat(),
        "body_md": f"Timeline post {idx} for consultant {consultant_id} about property {property_uid}.",
        "media_urls": [],
        "post_type": random.choice(["NewListing", "ProgressUpdate", "Insight", "Closing"]),
        "sentiment": random.choice(["Bull", "Neutral", "Bear"]),
        "visibility": random.choice(["Public", "Private", "ProfileSpecific"]),
        "author": consultant_id,
        "property": property_id,
        "property_uid": property_uid
    }
    res = requests.post(f"{STRAPI_URL}/api/timeline-items", headers=HEADERS_JSON, json={"data": payload})
    print("Timeline creation response:", res.status_code, res.text)
    res.raise_for_status()
    return res.json()["data"]["id"]

# Utility to load mock data for a given number
def load_mock_data(n):
    base_dir = SCRIPT_DIR / 'mockData'
    stats_path = base_dir / f"mockPortfolioStats{n}.json"
    properties_path = base_dir / f"mockProperties{n}.json"
    timeline_path = base_dir / f"mockTimelinePosts{n}.json"
    with open(stats_path, 'r', encoding='utf-8') as f:
        stats = json.load(f)
    with open(properties_path, 'r', encoding='utf-8') as f:
        properties = json.load(f)
    with open(timeline_path, 'r', encoding='utf-8') as f:
        timeline = json.load(f)
    return stats, properties, timeline

# Main loop
# Replace this section in your main loop:
for idx_int, (idx, row) in enumerate(df.iterrows(), start=2):
    firstName = row.get('First Name') or ''
    lastName = row.get('Last Name') or ''
    if not firstName or not lastName:
        print(f"Row {idx_int}: missing first or last name; skipping")
        continue
    firstName = firstName.strip()
    lastName = lastName.strip()

    # Pick a random number 1-8 for this consultant
    mock_n = random.randint(1, 8)
    stats, properties, timeline_posts = load_mock_data(mock_n)

    # Simple text fields - FIXED COLUMN NAMES
    location = row.get('locations')
    company = row.get('company_name')
    currentRole = row.get('job_type')

    # JSON fields - FIXED COLUMN NAMES
    functionalExpertise = parse_json_field(row.get('tag'))  # was 'functionalExpertise'
    
    # Generate random data for missing fields
    certifications = generate_random_certifications()  # Generate since column doesn't exist
    languages = generate_random_languages()  # Generate since column doesn't exist

    # Enumeration - FIXED COLUMN NAME
    raw_geo = row.get('geographical_expertise')  # was 'geographicalExpertise'
    geographicalExpertise = validate_enum('geographicalExpertise', raw_geo, ALLOWED_GEOGRAPHICAL)

    # Other fields - FIXED COLUMN NAMES
    countryExpertise = row.get('country_expertise')  # was 'countryExpertise'
    rate = None
    rate_cell = row.get('Rate')  # was 'rate' or 'Rate'
    if rate_cell:
        try:
            # Remove currency symbols and convert to float
            rate_str = str(rate_cell).replace('$', '').replace('£', '').replace(',', '').strip()
            rate = float(rate_str)
        except:
            print(f"Row {idx_int}: cannot parse rate '{rate_cell}'; skipping rate")

    bio = row.get('post_content') or ''  # was 'bio' or 'Bio'
    education = row.get('educational_requirement')
    
    # Generate random availability since column doesn't exist


    # Components: contactInfo - GENERATE RANDOM DATA FOR MISSING COLUMNS
    contact_email = generate_random_email(firstName, lastName)  # Generate since not in Excel
    contact_phone = generate_random_phone()  # Generate since not in Excel
    contact_linkedin = generate_random_linkedin(firstName, lastName)  # Generate since not in Excel
    
    availability = generate_random_availability()
    
    contactInfo = {
        "Email":     contact_email,
        "Phone":     contact_phone,
        "LinkedIn":  contact_linkedin,
}

    # Repeatable components: testimonials - GENERATE RANDOM DATA
    testimonials = generate_random_testimonials()  # Generate since column doesn't exist

    # Repeatable components: caseStudies - GENERATE RANDOM DATA
    caseStudies = generate_random_case_studies()  # Generate since column doesn't exist

    
    # Build payload - UPDATED TO MATCH YOUR ACTUAL DATA + GENERATED DATA
    payload = {}
    payload['firstName'] = firstName
    payload['lastName'] = lastName
    if location:
        payload['location'] = location.strip()
    if company:
        payload['company'] = company.strip()
    if currentRole:
        payload['currentRole'] = currentRole.strip()
    if functionalExpertise is not None:
        payload['functionalExpertise'] = functionalExpertise
    if geographicalExpertise is not None:
        payload['geographicalExpertise'] = geographicalExpertise
    if countryExpertise:
        payload['countryExpertise'] = countryExpertise.strip()
    if rate is not None:
        payload['rate'] = rate
    if bio:
        payload['bio'] = bio
    if education:
        payload['education'] = education.strip()
    if availability:
        payload['availability'] = availability

    # Media: profileImage from local folder
    local_image_path = find_local_image(firstName, lastName)
    print("Match found for local image. Proceedding to upload: ", local_image_path)
    profileImageId = None
    if local_image_path:
        profileImageId = upload_media(local_image_path)
    else:
        # Optionally, if your Excel also has a URL column, attempt that:
        raw_image = row.get('profileImage') or row.get('Profile Image URL')
        if raw_image:
            profileImageId = upload_media(raw_image)
        # else leave as None
        
        # Include generated data fields
    payload['certifications'] = certifications
    payload['languages'] = languages
    payload['contactInfo'] = contactInfo
    payload['testimonials'] = testimonials
    payload['caseStudies'] = caseStudies
    
    # Only include profile image if found locally
    if profileImageId:
        payload['profileImage'] = profileImageId
        
    for field, val in payload.items():
        if isinstance(val, str) and len(val) > 255:
            print(f"⚠️ {field} is {len(val)} chars long")

    # Check existing entry
    email_for_lookup = contact_email.strip() if contact_email else None
    existing = find_existing_expert(email_for_lookup, firstName, lastName)
    if existing:
        existing_id    = existing['id']
        existing_docId = existing.get('documentId')
        print(f"Row {idx_int}: updating existing expert ID {existing_docId}")
        body = {'data': payload}
        res  = requests.put(f"{STRAPI_URL}/api/{COLLECTION}/{existing_docId}",
                            headers=HEADERS_JSON, json=body, timeout=30)
        res.raise_for_status()
        consultant_id = existing_id
        consultant_doc_id = existing_docId
    else:
        existing_id    = None
        existing_docId = None
        print(f"Row {idx_int}: creating new expert {firstName} {lastName}")
        body = {'data': payload}
        print("HEADERS_JSON: ", HEADERS_JSON)
        print("BODY: ", body)
        res  = requests.post(f"{STRAPI_URL}/api/{COLLECTION}",headers=HEADERS_JSON, json=body, timeout=30)
        print("STATUS CODE:", res.status_code)
        print("RESPONSE BODY:", res.text)
        res.raise_for_status()
        consultant_id = res.json()["data"]["id"]
        consultant_doc_id = res.json()["data"]["documentId"]

    # Create properties for this consultant using mock data
    property_ids = []
    property_uids = []
    for prop in properties:
        prop_payload = dict(prop)  # shallow copy
        prop_payload['owner'] = consultant_id
        # Handle images: upload each image URL and collect media IDs
        image_urls = prop_payload.pop('images', None)
        image_ids = []
        if image_urls and isinstance(image_urls, list):
            for img_url in image_urls:
                img_id = upload_media(img_url)
                if img_id:
                    image_ids.append(img_id)
        if image_ids:
            prop_payload['media_urls'] = image_ids
        # Ensure 'roles' and 'tags' are strings
        if isinstance(prop_payload.get('roles'), list):
            prop_payload['roles'] = ', '.join(str(r) for r in prop_payload['roles'])
        if isinstance(prop_payload.get('tags'), list):
            prop_payload['tags'] = ', '.join(str(t) for t in prop_payload['tags'])
        # Make property_uid unique
        orig_uid = prop_payload.get('property_uid', '')
        prop_payload['property_uid'] = f"{orig_uid}_{consultant_doc_id}"
        res = requests.post(f"{STRAPI_URL}/api/properties", headers=HEADERS_JSON, json={"data": prop_payload})
        print("Property creation response:", res.status_code, res.text)
        res.raise_for_status()
        property_id = res.json()["data"]["id"]
        property_uid = prop.get('property_uid')
        property_ids.append(property_id)
        property_uids.append(property_uid)
    # Map property_uid to property_id for timeline linking
    property_uid_to_id = dict(zip(property_uids, property_ids))
    # Create timeline items for each property using mock data
    for post in timeline_posts:
        post_payload = dict(post)
        post_payload['author'] = consultant_id
        # Link property if property_uid is present
        prop_uid = post.get('property_uid')
        if prop_uid and prop_uid in property_uid_to_id:
            post_payload['property'] = property_uid_to_id[prop_uid]
        # Remove fields not in Strapi model if needed
        post_payload.pop('person_id', None)
        # Make post_id unique
        orig_post_id = post_payload.get('post_id', '')
        post_payload['post_id'] = f"{orig_post_id}_{consultant_doc_id}"
        res = requests.post(f"{STRAPI_URL}/api/timeline-items", headers=HEADERS_JSON, json={"data": post_payload})
        print("Timeline creation response:", res.status_code, res.text)
        res.raise_for_status()

print("Done.")
