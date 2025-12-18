import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const BLOB_FILE_NAME = 'wishes.json';

// Interface for Wish
interface Wish {
    id: number;
    name: string;
    location: string;
    message: string;
    date: string;
}

// Ensure Token Exists or Log Error
const checkToken = () => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error("Missing BLOB_READ_WRITE_TOKEN. Vercel Blob operations will fail.");
        return false;
    }
    return true;
};

// Helper to read data from Vercel Blob
async function getWishes(): Promise<Wish[]> {
    try {
        if (!checkToken()) return [];

        // List to find the specific file
        const { blobs } = await list({ prefix: BLOB_FILE_NAME, limit: 1 });

        if (blobs.length > 0) {
            // Fetch the content of the blob
            const blob = blobs.find(b => b.pathname === BLOB_FILE_NAME);
            if (blob) {
                const response = await fetch(blob.url);
                if (response.ok) {
                    return await response.json();
                }
            }
        }
        return [];
    } catch (error) {
        console.error("Error reading from Vercel Blob:", error);
        return [];
    }
}

// Helper to write data to Vercel Blob
async function saveWish(newWish: Wish): Promise<boolean> {
    try {
        if (!checkToken()) return false;

        const currentWishes = await getWishes();
        const updatedWishes = [newWish, ...currentWishes];

        // Overwrite the existing blob. 
        await put(BLOB_FILE_NAME, JSON.stringify(updatedWishes), {
            access: 'public',
            addRandomSuffix: false,
            // Cache control to ensure we fetch fresh data on the client if they hit the url directly
            cacheControlMaxAge: 0,
            allowOverwrite: true
        });
        return true;
    } catch (error) {
        console.error("Error writing to Vercel Blob:", error);
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
