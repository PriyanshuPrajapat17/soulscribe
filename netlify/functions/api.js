const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'soulscribe_dev_secret_2024';
const OTP_TTL_MS = 5 * 60 * 1000;

const otpStore = new Map();

// Users seed data
const defaultUserData = {
  "1234567890": {
    "phone": "1234567890",
    "name": "Soulful One",
    "createdAt": "2025-07-01T00:00:00Z",
    "orders": [
      {
        "id": "SS-0042",
        "name": "108 Days with Krishna Journal",
        "img": "https://cdn.shopify.com/s/files/1/0810/5518/7159/files/36.png?v=1772190082",
        "url": "product/108-days-with-krishna.html",
        "price": "₹899",
        "qty": 1,
        "status": "delivered",
        "placedOn": "2025-07-18",
        "deliveredOn": "2025-07-23",
        "trackingId": "SS-DELHVRY-20250718"
      },
      {
        "id": "SS-0051",
        "name": "Thank You Krishna Journal",
        "img": "https://cdn.shopify.com/s/files/1/0810/5518/7159/files/3.png?v=1772213561",
        "url": "product/thankyou-krishna.html",
        "price": "₹799",
        "qty": 1,
        "status": "transit",
        "placedOn": "2025-07-24",
        "estimatedDelivery": "2025-07-30",
        "trackingId": "SS-DELHVRY-20250724",
        "trackingSteps": [
          { "label": "Order Placed", "sub": "24 Jul", "done": true },
          { "label": "Confirmed", "sub": "24 Jul", "done": true },
          { "label": "Packed", "sub": "25 Jul", "done": true },
          { "label": "In Transit", "sub": "On the way!", "done": false, "active": true },
          { "label": "Delivered", "sub": "28–30 Jul", "done": false }
        ]
      },
      {
        "id": "SS-0058",
        "name": "Heart of Virtues Journal",
        "img": "https://cdn.shopify.com/s/files/1/0810/5518/7159/files/14.png?v=1772192437",
        "url": "product/heart-of-virtues.html",
        "price": "₹849",
        "qty": 2,
        "status": "processing",
        "placedOn": "2025-07-26",
        "trackingId": "SS-PENDING-20250726"
      }
    ],
    "masterclass": [
      {
        "id": "mc-1",
        "tag": "✦ EXCLUSIVE FOR YOU",
        "title": "Journaling to Connect with the Divine",
        "desc": "A guided exploration of how to use your Soulscribe journal as a sacred practice. Learn to create rituals, cultivate gratitude, and let your pen become a bridge between your heart and the Divine.",
        "youtubeId": "dQw4w9WgXcQ"
      },
      {
        "id": "mc-2",
        "tag": "BONUS SESSION",
        "title": "The Art of Free Flow Journaling",
        "desc": "Free flow journaling is one of the most powerful tools for clarity, release and self-discovery. In this session, we guide you through writing without judgment — pure, honest expression from the soul.",
        "youtubeId": "dQw4w9WgXcQ"
      }
    ],
    "resources": [
      { "id": "r1", "name": "7-Day Soul Reset Challenge", "type": "PDF · Workbook", "icon": "🌸", "color": "#fef3c7" },
      { "id": "r2", "name": "30 Gratitude Prompts", "type": "PDF · Prompt Sheet", "icon": "✍️", "color": "#e8f8ed" },
      { "id": "r3", "name": "Morning Ritual Guide", "type": "PDF · Guide", "icon": "🌅", "color": "#fff0f6" },
      { "id": "r4", "name": "Soul Affirmations Deck", "type": "PDF · Printable Cards", "icon": "💛", "color": "#eff6ff" },
      { "id": "r5", "name": "Breathwork & Journaling", "type": "PDF · Practice Guide", "icon": "🌿", "color": "#f0fdf4" },
      { "id": "r6", "name": "Nama Japa Practice Sheet", "type": "PDF · Practice Sheet", "icon": "🙏", "color": "#fef9e7" }
    ],
    "suggested": [
      { "name": "Prayers from Within", "img": "https://cdn.shopify.com/s/files/1/0810/5518/7159/files/38.png?v=1772218095", "url": "product/prayers-from-within.html", "price": "₹849" },
      { "name": "Mercy & Meltdowns", "img": "https://cdn.shopify.com/s/files/1/0810/5518/7159/files/37.png?v=1772218028", "url": "product/mercy-and-meltdowns.html", "price": "₹849" },
      { "name": "Heart of Virtues", "img": "https://cdn.shopify.com/s/files/1/0810/5518/7159/files/14.png?v=1772192437", "url": "product/heart-of-virtues.html", "price": "₹799" },
      { "name": "Shravanam to Smaranam", "img": "https://cdn.shopify.com/s/files/1/0810/5518/7159/files/48.png?v=1772218159", "url": "product/shravanam-to-smaranam.html", "price": "₹899" }
    ]
  }
};

const users = { ...defaultUserData };

function getOrCreateUser(phone) {
  if (!users[phone]) {
    users[phone] = {
      phone,
      name: 'Soulful One',
      createdAt: new Date().toISOString(),
      orders: [],
      masterclass: defaultUserData["1234567890"].masterclass,
      resources: defaultUserData["1234567890"].resources,
      suggested: defaultUserData["1234567890"].suggested
    };
  }
  return users[phone];
}

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

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '✦ Soulscribe Netlify API is running' });
});

router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Please provide a valid phone number (at least 10 digits).' });
  }
  const otp = '1234';
  const expires = Date.now() + OTP_TTL_MS;
  otpStore.set(phone, { otp, expires });
  return res.json({
    success: true,
    message: `OTP sent to ${phone}`,
    devOtp: otp,
    devNotice: 'DEV MODE: OTP is shown for testing.'
  });
});

router.post('/verify-otp', (req, res) => {
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
  otpStore.delete(phone);
  const user = getOrCreateUser(phone);
  const token = jwt.sign({ phone, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    success: true,
    token,
    user: { phone: user.phone, name: user.name, createdAt: user.createdAt }
  });
});

router.get('/me', requireAuth, (req, res) => {
  const user = getOrCreateUser(req.user.phone);
  return res.json(user);
});

router.post('/logout', requireAuth, (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Seed testimonials for serverless
let serverlessTestimonials = [
  { id: "jj-1", name: "Priya", date: "24/06/25", practice: "Gratitude journaling", stars: 5, image: "assets/cd286d5956113bc39e40f45956aada9c.jpg", story: "Finally holding Mercy & Meltdowns in my hands! A truly beautiful journaling experience that speaks straight to the soul. Thank you for this masterpiece! 🌸" },
  { id: "jj-2", name: "Sharon", date: "20/06/25", practice: "Daily planning", stars: 5, image: "assets/review-1.jpg", story: "Got the planner… much better than I imagined. I already love using it. Continue your good work 🌼" },
  { id: "jj-3", name: "R.", date: "20/06/25", practice: "Undated planning", stars: 5, image: "", story: "Hey, I have purchased your undated planner. I just got my planner just now… how cute and pretty it is! I just can't wait to use it… thank you ❤️. This planner has my whole heart. Thank you so much for adding those extras like cute stuffs too… I'm loving it 🌟" },
  { id: "jj-4", name: "Isha", date: "20/06/25", practice: "Mindful journaling", stars: 5, image: "assets/review-2.jpg", story: "OMGGGGGG, this is the most beautiful planner I have ever seen! Thank you so much guys! You made my day 💛" },
  { id: "jj-5", name: "Lekha K", date: "20/06/25", practice: "Self reflection", stars: 5, image: "", story: "It's cute, purposeful, and has so many sections to fill. Absolutely loved it. It's aesthetically pleasing, the pages are such that no part of the ink line markers or a squiggle outline seep through the page. So overall a great buy guys!" },
  { id: "jj-6", name: "Ankita Sharma", date: "20/06/25", practice: "Spiritual journaling", stars: 5, image: "assets/review-3.jpg", story: "Got my gorgeous planner this morning 🌞. The planner is so aesthetic and beautiful and so very pretty that I don't even wanna ruin it by writing anything 😍🌸" },
  { id: "jj-7", name: "Konika", date: "20/06/25", practice: "Daily Prioritizer", stars: 5, image: "", story: "Amazinggg pattern looks simple yet so useful. Would always say those huge planners are not me and quite sure I will use it many sections. Thank you!!" },
  { id: "jj-8", name: "Praajal", date: "20/06/25", practice: "Gratitude Companion", stars: 5, image: "", story: "This daily planners too cute to handle 💛💛. The stickers you sent are absolutely adorable and I loved the bookmarks and mini calendars too. Everything is so very thoughtfully packed. Totally made my day 🌼" },
  { id: "jj-9", name: "Sashi", date: "20/06/25", practice: "Morning Pages", stars: 5, image: "assets/review-4.jpg", story: "Simply lovely. Soft pages, gentle prompts and a calming aesthetic. It has become my morning ritual." },
  { id: "jj-10", name: "Devika", date: "21/06/25", practice: "Mindful reflection", stars: 5, image: "", story: "The little nudges every morning are exactly what my routine was missing. Highly recommend." },
  { id: "jj-11", name: "Arvind", date: "22/06/25", practice: "Prayer journaling", stars: 5, image: "assets/review-5.jpg", story: "Beautifully made — the binding lays flat and the paper feels lovely under any pen." },
  { id: "jj-12", name: "Meera", date: "22/06/25", practice: "Pause & Ponder", stars: 5, image: "", story: "A quiet companion for chaotic days. Each section feels intentional and warm." },
  { id: "jj-13", name: "Tanmay", date: "23/06/25", practice: "Soulful Saturdays", stars: 5, image: "", story: "Gift-wrapped beautifully. My sister was over the moon. Thank you for the personal touch!" }
];

let serverlessSubmissions = [];

const DEFAULT_INSTAGRAM_POSTS = [
  { id: "ig-1", url: "https://www.instagram.com/soulscribe.official/", image: "assets/insta%20images/Screenshot%202026-09-25%20221220.png", caption: "To everyone who has walked this road with us" },
  { id: "ig-2", url: "https://www.instagram.com/soulscribe.official/", image: "assets/insta%20images/Screenshot%202026-09-25%20221523.png", caption: "Thankyou Krishna Gratitude Journal" },
  { id: "ig-3", url: "https://www.instagram.com/soulscribe.official/", image: "assets/insta%20images/Screenshot%202026-09-25%20221601.png", caption: "This is your sign to connect with Krishna" },
  { id: "ig-4", url: "https://www.instagram.com/soulscribe.official/", image: "assets/insta%20images/Screenshot%202026-09-25%20221617.png", caption: "Daily Gratitude Journaling" },
  { id: "ig-5", url: "https://www.instagram.com/soulscribe.official/", image: "assets/insta%20images/Screenshot%202026-09-25%20221651.png", caption: "5 Questions That Matter More Than Your Spiritual Achievements" }
];

let cachedNetlifyIgPosts = [...DEFAULT_INSTAGRAM_POSTS];
let lastNetlifyIgFetch = 0;

async function updateNetlifyInstagramFeed() {
  const now = Date.now();
  if (now - lastNetlifyIgFetch < 3600000 && cachedNetlifyIgPosts.length >= 5) {
    return cachedNetlifyIgPosts;
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
        cachedNetlifyIgPosts = edges.slice(0, 5).map((edge, idx) => ({
          id: edge.node.id || `ig-${idx+1}`,
          url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
          image: edge.node.display_url,
          caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || 'Soulscribe Instagram Post'
        }));
        lastNetlifyIgFetch = now;
      }
    }
  } catch (err) {
    // Fall back to cached/default posts
  }
  return cachedNetlifyIgPosts;
}

router.get('/instagram-feed', async (req, res) => {
  const posts = await updateNetlifyInstagramFeed();
  res.json({
    success: true,
    account: 'soulscribe.official',
    posts: posts.slice(0, 5)
  });
});

router.get('/testimonials', (req, res) => {
  res.json({ success: true, count: serverlessTestimonials.length, testimonials: serverlessTestimonials });
});

router.post('/testimonials', (req, res) => {
  const { name, email, practice, story, image, date } = req.body;
  if (!name || !story) return res.status(400).json({ error: 'Name and story required.' });
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
  serverlessTestimonials.unshift(newEntry);
  if (serverlessTestimonials.length > 16) {
    serverlessTestimonials = serverlessTestimonials.slice(0, 16);
  }
  serverlessSubmissions.push({ id: 'sub_' + Date.now(), formType: 'journaling_journey', data: newEntry, submittedAt: new Date().toISOString() });
  return res.json({ success: true, count: serverlessTestimonials.length, entry: newEntry, testimonials: serverlessTestimonials });
});

router.post('/admin/testimonials/reorder', (req, res) => {
  const { testimonials } = req.body;
  if (Array.isArray(testimonials)) {
    serverlessTestimonials = testimonials.slice(0, 16);
  }
  return res.json({ success: true, count: serverlessTestimonials.length, testimonials: serverlessTestimonials });
});

router.delete('/admin/testimonials/:id', (req, res) => {
  serverlessTestimonials = serverlessTestimonials.filter(t => t.id !== req.params.id);
  return res.json({ success: true, count: serverlessTestimonials.length, testimonials: serverlessTestimonials });
});

router.post('/form-submit', (req, res) => {
  const { formType, data } = req.body;
  const entry = { id: 'sub_' + Date.now(), formType: formType || 'generic', data: data || {}, submittedAt: new Date().toISOString() };
  serverlessSubmissions.push(entry);
  return res.json({ success: true, message: 'Submitted successfully', id: entry.id });
});

router.get('/admin/submissions', (req, res) => {
  res.json({ success: true, count: serverlessSubmissions.length, submissions: serverlessSubmissions });
});

router.get('/email-sequence', (req, res) => {
  res.json({
    welcomeEmail: {
      subject: "Your Soulscribe journey begins here",
      body: `Hi there,\n\nThank you for your order.\nWe're truly grateful you've chosen to invite Soulscribe into your journey.\nWe hope what you've received becomes more than just a journal—it becomes a quiet space where you can slow down, reflect, and gently reconnect with yourself and with God.\n\nOver the coming days, don't worry about writing perfectly. Just begin.\nOne honest page is enough.\n\nAs a welcome gift, we'd also love to invite you to our small WhatsApp Circle, where we share:\n• Daily wisdom shots\n• Monthly journaling journeys\n• Gentle reflection activities\n• Early access to new resources and immersions\n\nSimply reply to this email if you'd like to join—we'd be delighted to welcome you.\n\nIf you ever have a question or simply want to share a page that touched your heart, just hit reply. We read every message.\n\nThank you for trusting us with a small part of your spiritual journey.\n\nWith gratitude,\nThe Soulscribe fam:)`
    },
    orderConfirmationEmail: {
      subject: "Order Confirmed — Your Soulscribe companion is on its way 🌸",
      body: `Hi there,\n\nYour order has been confirmed and is being packed with care and intention.\n\nWe craft every order with love and usually ship within 2 working days. Delivery takes 5–7 days within India, and 8–10 days worldwide.\n\nYou can track your order anytime from Your Space dashboard at www.soulscribe.in/dashboard.html.\n\nWith gratitude,\nThe Soulscribe fam:)`
    }
  });
});

app.use('/api', router);
app.use('/.netlify/functions/api/api', router);
app.use('/.netlify/functions/api', router);
app.use('/', router);

module.exports.handler = serverless(app);
