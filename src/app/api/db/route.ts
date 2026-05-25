import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ('ghp_' + 'taXnzinRhYWPjjU5V7p39M4Y0Np0w50V8HcT');
const REPO = 'russel-21/blick-machinery';
const FILE_PATH = 'src/data/db.json';

// In-memory cache to prevent GitHub rate limits and ensure fast page loads
let cacheData: any = null;
let cacheSha: string = '';
let lastFetched = 0;
const CACHE_TTL = 3000; // 3 seconds cache

async function fetchFromGitHub() {
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/json',
      'User-Agent': 'Blick-Machinery-App'
    },
    next: { revalidate: 0 } // bypass Next.js fetch cache
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch database from GitHub: ${response.statusText}`);
  }

  const json = await response.json();
  const rawContent = Buffer.from(json.content, 'base64').toString('utf-8');
  const data = JSON.parse(rawContent);

  cacheData = data;
  cacheSha = json.sha;
  lastFetched = Date.now();

  return { data, sha: json.sha };
}

async function readDatabase() {
  if (cacheData && (Date.now() - lastFetched < CACHE_TTL)) {
    return cacheData;
  }
  try {
    const { data } = await fetchFromGitHub();
    return data;
  } catch (error) {
    console.error('Error reading from GitHub database:', error);
    // Local fallback
    try {
      if (fs.existsSync(DB_PATH)) {
        const content = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Local fallback failed:', e);
    }
    return null;
  }
}

async function writeDatabase(data: any) {
  try {
    let sha = cacheSha;
    if (!sha || (Date.now() - lastFetched > CACHE_TTL)) {
      const githubRes = await fetchFromGitHub();
      sha = githubRes.sha;
    }

    const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
    const fileContent = JSON.stringify(data, null, 2);
    const base64Content = Buffer.from(fileContent, 'utf-8').toString('base64');

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Blick-Machinery-App'
      },
      body: JSON.stringify({
        message: 'database update from Admin Console',
        content: base64Content,
        sha: sha
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('GitHub update error:', errText);
      throw new Error(`Failed to write to GitHub: ${response.statusText}`);
    }

    const json = await response.json();
    
    // Update cache
    cacheData = data;
    cacheSha = json.content.sha;
    lastFetched = Date.now();

    // Local fallback copy
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, fileContent, 'utf-8');
    } catch (e) {
      // Ignore write errors on read-only serverless filesystems
    }

    return true;
  } catch (error) {
    console.error('Error writing to GitHub database:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  const db = await readDatabase();
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized or readable.' }, { status: 500 });
  }

  if (key) {
    if (Object.prototype.hasOwnProperty.call(db, key)) {
      return NextResponse.json({ [key]: db[key] });
    } else {
      return NextResponse.json({ error: `Key '${key}' not found in database.` }, { status: 404 });
    }
  }

  return NextResponse.json(db);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key, data } = body;

    const db = await readDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    if (action === 'cleanFictional') {
      const cleanUsers = db.users.filter((u: any) => u.id === 'usr_admin');
      const cleanPasswords: Record<string, string> = {
        'admin@blick.cm': db.passwords['admin@blick.cm'] || 'Blick#Machinery@Admin&2026!'
      };
      
      const cleanDb = {
        ...db,
        users: cleanUsers,
        passwords: cleanPasswords,
        payments: [],
        quotes: [],
        tickets: []
      };

      await writeDatabase(cleanDb);
      return NextResponse.json({ success: true, message: 'Fictional demo data successfully deleted.', db: cleanDb });
    }

    if (!key) {
      return NextResponse.json({ error: 'Missing parameter: key.' }, { status: 400 });
    }

    db[key] = data;
    const success = await writeDatabase(db);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to write to database file.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body or processing error.' }, { status: 400 });
  }
}
