import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

// Helper to safely read database
function readDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return null;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading database file:', error);
    return null;
  }
}

// Helper to safely write database
function writeDatabase(data: any) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to database file:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  const db = readDatabase();
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

    const db = readDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    if (action === 'cleanFictional') {
      // Clean up fictional data: keep only the admin and reset other tables
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

      writeDatabase(cleanDb);
      return NextResponse.json({ success: true, message: 'Fictional demo data successfully deleted.', db: cleanDb });
    }

    if (!key) {
      return NextResponse.json({ error: 'Missing parameter: key.' }, { status: 400 });
    }

    db[key] = data;
    const success = writeDatabase(db);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to write to database file.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body or processing error.' }, { status: 400 });
  }
}
