from flask import Flask, render_template, request, jsonify
import re
import urllib.parse

app = Flask(__name__)

# ── Routes ──────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/url-detector')
def url_detector():
    return render_template('url_detector.html')

@app.route('/email-detector')
def email_detector():
    return render_template('email_detector.html')

@app.route('/password-checker')
def password_checker():
    return render_template('password_checker.html')

@app.route('/encryption')
def encryption():
    return render_template('encryption.html')

@app.route('/awareness')
def awareness():
    return render_template('awareness.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/password-generator')
def password_generator():
    return render_template('password_generator.html')

@app.route('/image-exif')
def image_exif():
    return render_template('image_exif.html')
# ── API Endpoints ────────────────────────────────────────────────────────────

@app.route('/api/check-url', methods=['POST'])
def check_url():
    data = request.get_json()
    url = data.get('url', '').strip()

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    result = analyze_url(url)
    return jsonify(result)


@app.route('/api/check-password', methods=['POST'])
def check_password():
    data = request.get_json()
    password = data.get('password', '')

    result = analyze_password(password)
    return jsonify(result)


# ── Analysis Functions ───────────────────────────────────────────────────────

PHISHING_KEYWORDS = [
    'login', 'verify', 'account', 'update', 'secure', 'banking',
    'paypal', 'amazon', 'google', 'microsoft', 'apple', 'ebay',
    'signin', 'password', 'confirm', 'suspend', 'urgent', 'free',
    'prize', 'winner', 'click', 'claim', 'limited', 'expire'
]

SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.link']

def analyze_url(url):
    score = 0
    flags = []

    # Check if completely empty
   # Check if completely empty
    if not url or len(url.strip()) < 3:
        return {'status': 'error', 'verdict': 'Invalid URL', 'message': 'Please enter a valid URL'}

    # Check if it looks like a real URL before adding http
    # Must contain a dot and at least 2 chars after dot
    raw = url.replace('http://', '').replace('https://', '').strip()
    if '.' not in raw:
        return {
            'status': 'invalid',
            'verdict': 'Invalid URL — Not a Real Domain',
            'score': 0,
            'flags': ['No valid domain found — a URL must contain a domain like example.com or google.in'],
            'url': url
        }

    # Check plain numbers like 123, 12345 with no dot
    if re.match(r'^\d+$', raw.split('/')[0]):
        return {
            'status': 'invalid',
            'verdict': 'Invalid URL — Numbers Are Not a Valid Domain',
            'score': 0,
            'flags': ['Plain numbers are not valid URLs — enter something like https://example.com'],
            'url': url
        }

          # Ensure scheme only after validation passes
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url

    # Parse the URL
    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    full = url.lower()

    # Validate domain
    if not domain or '.' not in domain:
        return {
            'status': 'invalid',
            'verdict': 'Invalid URL — Not a Real Domain',
            'score': 0,
            'flags': ['No valid domain found'],
            'url': url
        }

    # Domain must have valid TLD (at least 2 chars after last dot)
    parts = domain.split('.')
    if len(parts) < 2 or len(parts[-1]) < 2:
        return {
            'status': 'invalid',
            'verdict': 'Invalid URL — No Valid Domain Extension',
            'score': 0,
            'flags': ['Domain extension is missing or too short'],
            'url': url
        }

    # Allow localhost and local IPs for testing
    local_hosts = ['localhost', '127.0.0.1', '0.0.0.0']
    if any(raw.startswith(lh) for lh in local_hosts):
        return {
            'status': 'invalid',
            'verdict': 'Local Address — Cannot Be Scanned',
            'score': 0,
            'flags': ['This is your own computer\'s local address — enter a real website URL to scan'],
            'url': url
        }
            
    # HTTP (not HTTPS)
    if parsed.scheme == 'http':
        score += 20
        flags.append('No HTTPS encryption detected')

    # IP address instead of domain
    if re.match(r'^\d{1,3}(\.\d{1,3}){3}', domain):
        score += 30
        flags.append('IP address used instead of domain name')

    # Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            score += 25
            flags.append(f'Suspicious top-level domain: {tld}')
            break

    # Too many subdomains
    if domain.count('.') > 3:
        score += 15
        flags.append('Excessive subdomains detected')

    # Phishing keywords in URL
    keyword_hits = [kw for kw in PHISHING_KEYWORDS if kw in full]
    if keyword_hits:
        score += min(len(keyword_hits) * 8, 30)
        flags.append(f'Phishing keywords found: {", ".join(keyword_hits[:3])}')

    # Long URL
    if len(url) > 100:
        score += 10
        flags.append('Unusually long URL')

    # Hyphens in domain
    if domain.count('-') > 2:
        score += 10
        flags.append('Multiple hyphens in domain name')

    # Encoded characters
    if '%' in url:
        score += 10
        flags.append('URL encoded characters detected')

    # Determine risk level
    if score >= 60:
        status = 'danger'
        verdict = 'High Risk — Likely Phishing'
    elif score >= 30:
        status = 'warning'
        verdict = 'Suspicious — Proceed with Caution'
    else:
        status = 'safe'
        verdict = 'Looks Safe'

    return {
        'status': status,
        'verdict': verdict,
        'score': min(score, 100),
        'flags': flags,
        'url': url
    }


def analyze_password(password):
    score = 0
    feedback = []

    length = len(password)

    if length >= 8:
        score += 10
    else:
        feedback.append('Use at least 8 characters')

    if length >= 12:
        score += 15
    elif length >= 10:
        score += 8

    if re.search(r'[A-Z]', password):
        score += 20
    else:
        feedback.append('Add uppercase letters (A-Z)')

    if re.search(r'[a-z]', password):
        score += 20
    else:
        feedback.append('Add lowercase letters (a-z)')

    if re.search(r'\d', password):
        score += 20
    else:
        feedback.append('Add numbers (0-9)')

    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 25
    else:
        feedback.append('Add special characters (!@#$%)')

    # Common patterns penalty
    common = ['password', '123456', 'qwerty', 'abc123', 'admin', 'letmein']
    if password.lower() in common:
        score = max(score - 40, 0)
        feedback.append('Avoid common passwords')

    score = min(score, 100)

    if score >= 80:
        strength = 'Strong'
        color = 'safe'
    elif score >= 50:
        strength = 'Moderate'
        color = 'warning'
    else:
        strength = 'Weak'
        color = 'danger'

    return {
        'score': score,
        'strength': strength,
        'color': color,
        'feedback': feedback
    }




@app.route('/api/check-email', methods=['POST'])
def check_email():
    data    = request.get_json()
    sender  = data.get('sender', '').strip()
    subject = data.get('subject', '').strip()
    body    = data.get('body', '').strip()

    result = analyze_email(sender, subject, body)
    return jsonify(result)




# ── Email Analysis ───────────────────────────────────────────────────────────

URGENCY_WORDS = [
    'urgent', 'immediate', 'action required', 'verify now', 'suspended',
    'limited time', 'expires', 'act now', 'confirm immediately', 'warning',
    'alert', 'unauthorized', 'compromised', 'unusual activity', 'locked',
    '24 hours', '48 hours', 'click here', 'click now', 'validate'
]

REWARD_WORDS = [
    'winner', 'won', 'prize', 'free', 'reward', 'gift', 'congratulations',
    'selected', 'lucky', 'claim', 'bonus', 'lottery', 'inheritance', 'million'
]

CRED_WORDS = [
    'enter your password', 'confirm your password', 'verify your account',
    'update your details', 'submit your credentials', 'log in to confirm',
    'provide your', 'enter your card', 'bank details', 'ssn', 'social security'
]

SUSPICIOUS_SENDER_PATTERNS = [
    r'@gmail\.com$', r'@yahoo\.com$', r'@hotmail\.com$',  # free email for "official" use
    r'\d{4,}@',           # lots of numbers in address
    r'[^\w@.\-]',         # special chars in sender
    r'noreply.*@(?!.*\.(com|org|net|gov|edu))',
]

BRAND_SPOOF_NAMES = [
    'paypal', 'amazon', 'google', 'microsoft', 'apple', 'netflix', 'facebook',
    'instagram', 'bank', 'hdfc', 'sbi', 'icici', 'axis', 'ebay', 'flipkart'
]

URL_PATTERN = re.compile(r'https?://\S+|www\.\S+', re.IGNORECASE)


def analyze_email(sender, subject, body):
    score = 0
    flags = []
    breakdown = []
    combined = (sender + ' ' + subject + ' ' + body).lower()

    # 1. Sender domain check
    sender_ok = True
    if sender:
        domain_match = re.search(r'@([\w.\-]+)', sender.lower())
        if domain_match:
            domain = domain_match.group(1)
            # Free email provider used as official sender
            free_providers = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
            brand_in_sender = any(b in sender.lower() for b in BRAND_SPOOF_NAMES)
            if brand_in_sender and any(p in domain for p in free_providers):
                score += 30
                flags.append(f'Sender impersonates a brand using free email ({domain})')
                sender_ok = False
            # Numbers in local part (spam pattern)
            local = sender.split('@')[0]
            if re.search(r'\d{4,}', local):
                score += 15
                flags.append('Sender address contains many numbers (spam pattern)')
                sender_ok = False
            # Typosquatting check
            for brand in BRAND_SPOOF_NAMES:
                if brand in domain and not domain.startswith(brand + '.'):
                    score += 25
                    flags.append(f'Sender domain may be spoofing "{brand}" ({domain})')
                    sender_ok = False
                    break
        breakdown.append({'check': 'Sender Address', 'ok': sender_ok,
                          'note': 'Looks legitimate' if sender_ok else 'Suspicious sender detected'})
    else:
        breakdown.append({'check': 'Sender Address', 'ok': False, 'note': 'Not provided'})

    # 2. Urgency language
    urgency_hits = [w for w in URGENCY_WORDS if w in combined]
    urgency_ok = len(urgency_hits) == 0
    if urgency_hits:
        score += min(len(urgency_hits) * 8, 30)
        flags.append(f'Urgency/pressure language detected: {", ".join(urgency_hits[:3])}')
    breakdown.append({'check': 'Urgency Language', 'ok': urgency_ok,
                      'note': 'No pressure tactics found' if urgency_ok else f'{len(urgency_hits)} urgency phrase(s) found'})

    # 3. Reward / lottery bait
    reward_hits = [w for w in REWARD_WORDS if w in combined]
    reward_ok = len(reward_hits) == 0
    if reward_hits:
        score += min(len(reward_hits) * 10, 25)
        flags.append(f'Reward/prize bait detected: {", ".join(reward_hits[:3])}')
    breakdown.append({'check': 'Reward Bait', 'ok': reward_ok,
                      'note': 'No reward bait found' if reward_ok else f'{len(reward_hits)} reward phrase(s) found'})

    # 4. Credential harvesting
    cred_hits = [w for w in CRED_WORDS if w in combined]
    cred_ok = len(cred_hits) == 0
    if cred_hits:
        score += min(len(cred_hits) * 12, 30)
        flags.append(f'Credential harvesting phrases detected: {cred_hits[0]}')
    breakdown.append({'check': 'Credential Harvesting', 'ok': cred_ok,
                      'note': 'No credential requests found' if cred_ok else 'Asks for personal/login data'})

    # 5. Suspicious links in body
    urls_found = URL_PATTERN.findall(body)
    link_ok = True
    if urls_found:
        suspicious_links = []
        for u in urls_found:
            u_lower = u.lower()
            if any(tld in u_lower for tld in ['.tk', '.ml', '.ga', '.xyz', '.top', '.click']):
                suspicious_links.append(u)
            elif re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', u):
                suspicious_links.append(u)
        if suspicious_links:
            score += 25
            flags.append(f'Suspicious URL(s) found in email body: {suspicious_links[0][:50]}')
            link_ok = False
    breakdown.append({'check': 'Embedded Links', 'ok': link_ok,
                      'note': 'No suspicious links found' if link_ok else 'Malicious links detected in body'})

    # 6. ALL CAPS subject
    caps_ok = True
    if subject:
        caps_ratio = sum(1 for c in subject if c.isupper()) / max(len(subject), 1)
        if caps_ratio > 0.5 and len(subject) > 5:
            score += 10
            flags.append('Subject line uses excessive CAPS (manipulation tactic)')
            caps_ok = False
    breakdown.append({'check': 'Subject Line', 'ok': caps_ok,
                      'note': 'Subject looks normal' if caps_ok else 'Excessive CAPS or pressure in subject'})

    # Determine verdict
    score = min(score, 100)
    if score >= 60:
        status  = 'danger'
        verdict = 'High Risk — Likely Phishing Email'
    elif score >= 30:
        status  = 'warning'
        verdict = 'Suspicious — Possible Phishing Attempt'
    else:
        status  = 'safe'
        verdict = 'Looks Legitimate'

    return {
        'status':    status,
        'verdict':   verdict,
        'score':     score,
        'flags':     flags,
        'breakdown': breakdown
    }
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
