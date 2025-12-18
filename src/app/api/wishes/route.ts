import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';

const DB_PATH = path.join(process.cwd(), 'data', 'wishes.json');
const BLOB_FILE_NAME = 'wishes.json';

// Interface for Wish
interface Wish {
    id: number;
    name: string;
    location: string;
    message: string;
    date: string;
}

// Helper to read data (Hybrid: Blob in prod, FS in dev)
async function getWishes(): Promise<Wish[]> {
    try {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Production: Use Vercel Blob
            // List to find the specific file
            const { blobs } = await list({ prefix: BLOB_FILE_NAME, limit: 1 });

            if (blobs.length > 0) {
                // Fetch the content of the blob
                // We trust strictly that the first match is our file due to exact naming if we managed it well, 
                // but list with prefix matches prefixes. Ideally we check blobs[0].pathname === BLOB_FILE_NAME
                const blob = blobs.find(b => b.pathname === BLOB_FILE_NAME);
                if (blob) {
                    const response = await fetch(blob.url);
                    if (response.ok) {
                        return await response.json();
                    }
                }
            }
            return [];
        } else {
            // Development: Use local file system
            if (!fs.existsSync(DB_PATH)) {
                return [];
            }
            const fileData = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(fileData);
        }
    } catch (error) {
        console.error("Error reading database:", error);
        return [];
    }
}

// Helper to write data (Hybrid: Blob in prod, FS in dev)
async function saveWish(newWish: Wish): Promise<boolean> {
    try {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Production: Use Vercel Blob
            const currentWishes = await getWishes();
            const updatedWishes = [newWish, ...currentWishes];

            // Overwrite the existing blob. 
            // addRandomSuffix: false ensures the pathname stays 'wishes.json' allowing us to find it easily again.
            await put(BLOB_FILE_NAME, JSON.stringify(updatedWishes), {
                access: 'public',
                addRandomSuffix: false,
                // Cache control to ensure we fetch fresh data on the client if they hit the url directly,
                // though our code fetches via API usually.
                cacheControlMaxAge: 0,
                allowOverwrite: true // Explicitly allow overwriting the file
            });
            return true;
        } else {
            // Development: Use local file system
            // We use the same getWishes helper which handles the logic
            // Note: If we are in dev but somehow have BLOB token, this would write to blob. 
            // The check above prevents that unless user explicitly set the token locally.
            // If we are here, we are assuming FS usage.

            // actually, getWishes above checks the token. If token is missing, it uses FS.
            // So if we are in saveWish and token is missing, we use FS.

            if (process.env.NODE_ENV === 'production') {
                console.error("CRITICAL: Attempting to save to local filesystem in production. BLOB_READ_WRITE_TOKEN is missing. This will fail with EROFS.");
            }

            if (!fs.existsSync(DB_PATH)) {
                // Ensure directory exists
                const dir = path.dirname(DB_PATH);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            }

            let currentWishes: Wish[] = [];
            if (fs.existsSync(DB_PATH)) {
                const fileData = fs.readFileSync(DB_PATH, 'utf-8');
                try {
                    currentWishes = JSON.parse(fileData);
                } catch (e) {
                    currentWishes = [];
                }
            }

            const updatedWishes = [newWish, ...currentWishes];
            fs.writeFileSync(DB_PATH, JSON.stringify(updatedWishes, null, 2));
            return true;
        }
    } catch (error) {
        console.error("Error writing to database:", error);
        return false;
    }
}

export async function GET() {
    // Prevent caching for real-time updates
    const wishes = await getWishes();
    return NextResponse.json(wishes, {
        headers: {
            'Cache-Control': 'no-store, max-age=0'
        }
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const newWish: Wish = {
            id: Date.now(),
            name: body.name || "Anonymous",
            location: body.location || "Unknown",
            message: body.message,
            date: new Date().toISOString()
        };

        const success = await saveWish(newWish);

        if (success) {
            return NextResponse.json(newWish, { status: 201 });
        } else {
            return NextResponse.json({ error: "Failed to save wish" }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Failed to post wish" }, { status: 500 });
    }
}
