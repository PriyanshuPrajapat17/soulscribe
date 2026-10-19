require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'soulscribe_dev_secret';
const OTP_TTL_MS = (parseInt(process.env.OTP_TTL_MINUTES) || 5) * 60 * 1000;
const IS_DEV = process.env.NODE_ENV !== 'production';

// ─── PATHS ────────────────────────────────────────────────────────────────────
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const STATIC_DIR = path.join(__dirname, '..');

// ─── IN-MEMORY OTP STORE ──────────────────────────────────────────────────────
// { phone: { otp: "1234", expires: <timestamp> } }
const otpStore = new Map();

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function createUserIfNew(phone) {
  const users = readUsers();
  if (!users[phone]) {
    users[phone] = {
      phone,
      name: 'Soulful One',
      createdAt: new Date().toISOString(),
      orders: [],
      masterclass: [
        {
          id: 'mc-1',
          tag: '✦ EXCLUSIVE FOR YOU',
          title: 'Journaling to Connect with the Divine',
          desc: 'A guided exploration of how to use your Soulscribe journal as a sacred practice. Learn to create rituals, cultivate gratitude, and let your pen become a bridge between your heart and the Divine.',
          youtubeId: 'dQw4w9WgXcQ'
        }
      ],
      resources: [
        { id: 'r1', name: '7-Day Soul Reset Challenge', type: 'PDF · Workbook', icon: '🌸', color: '#fef3c7' },
        { id: 'r2', name: '30 Gratitude Prompts', type: 'PDF · Prompt Sheet', icon: '✍️', color: '#e8f8ed' },
        { id: 'r3', name: 'Morning Ritual Guide', type: 'PDF · Guide', icon: '🌅', color: '#fff0f6' },
        { id: 'r4', name: 'Soul Affirmations Deck', type: 'PDF · Printable Cards', icon: '💛', color: '#eff6ff' }
      ],
      suggested: [
        { name: 'Prayers from Within', img: 'https://cdn.shopify.com/s/files/1/0810/5518/7159/files/38.png?v=1772218095', url: 'product/prayers-from-within.html', price: '₹849' },
        { name: 'Mercy & Meltdowns', img: 'https://cdn.shopify.com/s/files/1/0810/5518/7159/files/37.png?v=1772218028', url: 'product/mercy-and-meltdowns.html', price: '₹849' },
        { name: 'Heart of Virtues', img: 'https://cdn.shopify.com/s/files/1/0810/5518/7159/files/14.png?v=1772192437', url: 'product/heart-of-virtues.html', price: '₹799' },
        { name: 'Shravanam to Smaranam', img: 'https://cdn.shopify.com/s/files/1/0810/5518/7159/files/48.png?v=1772218159', url: 'product/shravanam-to-smaranam.html', price: '₹899' }
      ]
    };
    writeUsers(users);
    console.log(`[Auth] New user created: ${phone}`);
  }
  return users[phone];
}

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided. Please login.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
    req.user = decoded;
    next();
  });
}

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static frontend files
app.use(express.static(STATIC_DIR));

// ─── ROUTES ────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '✦ Soulscribe API is running' });
});

// POST /api/send-otp
app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Please provide a valid phone number (at least 10 digits).' });
  }

  const otp = IS_DEV ? '1234' : generateOTP();
  const expires = Date.now() + OTP_TTL_MS;

  otpStore.set(phone, { otp, expires });

  // In dev: log to console. In prod: integrate with SMS provider (Twilio/MSG91).
  if (IS_DEV) {
    console.log(`\n✦ [OTP] Phone: ${phone} | OTP: ${otp} | Expires in: ${process.env.OTP_TTL_MINUTES || 5} min\n`);
  } else {
    // TODO: Integrate SMS provider
    // await sendSMS(phone, `Your Soulscribe OTP is ${otp}. Valid for 5 minutes.`);
    console.log(`[OTP] Sent OTP to ${phone}`);
  }

  return res.json({
    success: true,
    message: `OTP sent to ${phone}`,
    // Only expose OTP in dev mode
    ...(IS_DEV && { devOtp: otp, devNotice: 'DEV MODE: OTP is shown for testing. Remove in production.' })
  });
});

// POST /api/verify-otp
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required.' });
  }

  const record = otpStore.get(phone);

  if (!record) {
    return res.status(400).json({ error: 'No OTP found for this number. Please request a new OTP.' });
  }

  if (Date.now() > record.expires) {
    otpStore.delete(phone);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
  }

  // OTP valid — clear it and issue JWT
  otpStore.delete(phone);
  const user = createUserIfNew(phone);

  const token = jwt.sign(
    { phone, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log(`[Auth] Login successful: ${phone}`);

  return res.json({
    success: true,
    token,
    user: {
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

// GET /api/me — protected
app.get('/api/me', requireAuth, (req, res) => {
  const users = readUsers();
  const user = users[req.user.phone];

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    phone: user.phone,
    name: user.name,
    createdAt: user.createdAt,
    orders: user.orders || [],
    masterclass: user.masterclass || [],
    resources: user.resources || [],
    suggested: user.suggested || []
  });
});

// POST /api/logout (stateless JWT — just a signal; client clears token)
app.post('/api/logout', requireAuth, (req, res) => {
  console.log(`[Auth] Logout: ${req.user.phone}`);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ─── JOURNALING JOURNEY TESTIMONIALS (MAX 16, NEWEST FIRST) ───────────────────
const TESTIMONIALS_FILE = path.join(__dirname, 'data', 'testimonials.json');

function readTestimonials() {
  try {
    const raw = fs.readFileSync(TESTIMONIALS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeTestimonials(data) {
  fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/instagram-feed — Return latest 5 posts for feed showcase with auto-update (no hardcoded posts)
let cachedInstagramPosts = [];
let lastIgFetch = 0;

async function updateInstagramFeed() {
  const now = Date.now();
  if (now - lastIgFetch < 3600000 && cachedInstagramPosts.length >= 5) {
    return cachedInstagramPosts;
  }
  try {
    const res = await fetch('https://www.instagram.com/api/v1/users/web_profile_info/?username=soulscribe.official', {
      headers: {
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || [];
      if (edges.length > 0) {
        cachedInstagramPosts = edges.slice(0, 5).map((edge, idx) => ({
          id: edge.node.id || `ig-${idx+1}`,
          url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
          image: edge.node.display_url,
          caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || 'Soulscribe Instagram Post'
        }));
        lastIgFetch = now;
      }
    }
  } catch (err) {
    // If live fetch fails/rate-limited, smoothly fall back to cached posts
  }
  return cachedInstagramPosts;
}

app.get('/api/instagram-feed', async (req, res) => {
  const posts = await updateInstagramFeed();
  return res.json({
    success: true,
    account: 'soulscribe.official',
    count: posts.length,
    posts: posts.slice(0, 5)
  });
});

// GET /api/testimonials — Load active testimonials
app.get('/api/testimonials', (req, res) => {
  const testimonials = readTestimonials();
  res.json({ success: true, count: testimonials.length, testimonials });
});

// POST /api/testimonials — Add new submission (max 16, FIFO)
app.post('/api/testimonials', (req, res) => {
  const { name, email, practice, story, image, date } = req.body;
  if (!name || !story) {
    return res.status(400).json({ error: 'Name and story are required.' });
  }

  let testimonials = readTestimonials();
  
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateString = date || `${dd}/${mm}/${String(yyyy).slice(-2)}`;

  const newEntry = {
    id: 'jj-' + Date.now(),
    name: name.trim(),
    email: (email || '').trim(),
    practice: (practice || 'Journaling Journey').trim(),
    story: story.trim(),
    image: image || '',
    stars: 5,
    date: dateString,
    createdAt: new Date().toISOString()
  };

  // Prepend newest to top
  testimonials.unshift(newEntry);

  // Maximum 16 Journaling Journeys: when 17th submitted, remove oldest
  if (testimonials.length > 16) {
    testimonials = testimonials.slice(0, 16);
  }

  writeTestimonials(testimonials);

  // Also archive to submissions.json for permanent record
  const submissions = readSubmissions();
  submissions.push({
    id: 'sub_' + Date.now(),
    formType: 'journaling_journey',
    data: newEntry,
    submittedAt: new Date().toISOString()
  });
  writeSubmissions(submissions);

  console.log(`[Journaling Journey] Added new story from ${name}. Total active: ${testimonials.length}`);
  return res.json({ success: true, count: testimonials.length, entry: newEntry, testimonials });
});

// POST /api/admin/testimonials/reorder — Admin reordering
app.post('/api/admin/testimonials/reorder', (req, res) => {
  const { testimonials } = req.body;
  if (!Array.isArray(testimonials)) {
    return res.status(400).json({ error: 'Testimonials array is required.' });
  }
  const clamped = testimonials.slice(0, 16);
  writeTestimonials(clamped);
  return res.json({ success: true, count: clamped.length, testimonials: clamped });
});

// DELETE /api/admin/testimonials/:id — Admin delete
app.delete('/api/admin/testimonials/:id', (req, res) => {
  const { id } = req.params;
  let testimonials = readTestimonials();
  const beforeCount = testimonials.length;
  testimonials = testimonials.filter(t => t.id !== id);
  writeTestimonials(testimonials);
  console.log(`[Admin] Deleted testimonial ${id}. Count: ${beforeCount} -> ${testimonials.length}`);
  return res.json({ success: true, count: testimonials.length, testimonials });
});

// ─── FORM SUBMISSIONS DATA PERSISTENCE ─────────────────────────────────────────
const SUBMISSIONS_FILE = path.join(__dirname, 'data', 'submissions.json');

function readSubmissions() {
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSubmissions(data) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.post('/api/form-submit', (req, res) => {
  const { formType, data } = req.body;
  if (!formType || !data) {
    return res.status(400).json({ error: 'formType and data are required.' });
  }

  const submissions = readSubmissions();
  const entry = {
    id: 'sub_' + Date.now(),
    formType,
    data,
    submittedAt: new Date().toISOString()
  };
  submissions.push(entry);
  writeSubmissions(submissions);

  console.log(`[Form Submit] Received ${formType} submission from ${data.email || data.name || 'user'}`);
  return res.json({ success: true, message: 'Form submitted successfully.', id: entry.id });
});

// GET /api/admin/submissions — Backend dashboard for form data
app.get('/api/admin/submissions', (req, res) => {
  const submissions = readSubmissions();
  res.json({ success: true, count: submissions.length, submissions });
});

// GET /api/admin/orders — Backend dashboard for customer journeys & purchases
app.get('/api/admin/orders', (req, res) => {
  const users = readUsers();
  const allOrders = [];
  Object.values(users).forEach(u => {
    if (u.orders && u.orders.length) {
      u.orders.forEach(o => allOrders.push({ ...o, userPhone: u.phone, userName: u.name }));
    }
  });
  res.json({ success: true, totalOrders: allOrders.length, customersCount: Object.keys(users).length, orders: allOrders });
});

// DELETE /api/admin/journey-entry — Admin moderation for submissions
app.delete('/api/admin/journey-entry/:id', (req, res) => {
  const { id } = req.params;
  const submissions = readSubmissions().filter(s => s.id !== id);
  writeSubmissions(submissions);
  return res.json({ success: true, message: `Submission ${id} removed.` });
});

// GET /api/email-sequence — Post-Purchase and Lifecycle Email Templates
app.get('/api/email-sequence', (req, res) => {
  res.json({
    welcomeEmail: {
      subject: "Your Soulscribe journey begins here",
      body: `Hi there,\n\nThank you for your order.\nWe're truly grateful you've chosen to invite Soulscribe into your journey.\nWe hope what you've received becomes more than just a journal—it becomes a quiet space where you can slow down, reflect, and gently reconnect with yourself and with God.\n\nOver the coming days, don't worry about writing perfectly. Just begin.\nOne honest page is enough.\n\nAs a welcome gift, we'd also love to invite you to our small WhatsApp Circle, where we share:\n• Daily wisdom shots\n• Monthly journaling journeys\n• Gentle reflection activities\n• Early access to new resources and immersions\n\nSimply reply to this email if you'd like to join—we'd be delighted to welcome you.\n\nIf you ever have a question or simply want to share a page that touched your heart, just hit reply. We read every message.\n\nThank you for trusting us with a small part of your spiritual journey.\n\nWith gratitude,\nThe Soulscribe fam:)`
    },
    orderConfirmationEmail: {
      subject: "Order Confirmed — Your Soulscribe companion is on its way 🌸",
      body: `Hi there,\n\nYour order has been confirmed and is being packed with care and intention.\n\nWe craft every order with love and usually ship within 2 working days. Delivery takes 5–7 days within India, and 8–10 days worldwide.\n\nYou can track your order anytime from Your Space dashboard at www.soulscribe.in/dashboard.html.\n\nWith gratitude,\nThe Soulscribe fam:)`
    },
    sequences: [
      { trigger: 'Newsletter Signup', subject: 'Welcome to Soulscribe — Your Journey Begins 🌸', delay: 'Immediate' },
      { trigger: 'Abandoned Cart', subject: 'Your pen is waiting — Return to your Soulscribe cart ✍️', delay: '2 Hours' },
      { trigger: 'Post Purchase Welcome', subject: 'Your Soulscribe journey begins here', delay: 'Immediate' },
      { trigger: 'Order Confirmation & Invoice', subject: 'Order Confirmed — Your Soulscribe companion is on its way 🌸', delay: 'Immediate' },
      { trigger: 'Week 1 Check-in', subject: 'How is your journaling journey unfolding? 💛', delay: '7 Days' },
      { trigger: 'Month 1 Check-in', subject: 'One month of reflection — A gentle look back 🌼', delay: '30 Days' },
      { trigger: 'Monthly Newsletter', subject: 'Nectar for the Soul — Monthly Reflections & Prompts 📖', delay: 'Monthly' }
    ]
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║       ✦  Soulscribe API Server  ✦        ║
  ╠══════════════════════════════════════════╣
  ║  Running on : http://localhost:${PORT}       ║
  ║  Mode       : ${IS_DEV ? 'DEVELOPMENT (OTP shown)  ' : 'PRODUCTION             '} ║
  ║  Static site: http://localhost:${PORT}       ║
  ╚══════════════════════════════════════════╝
  `);
});
