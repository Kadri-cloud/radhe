import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const BLOB_FILE_NAME = 'wishes.json';

// Allow longer timeout for slower regions
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Interface for Wish
interface Wish {
    id: number;
    name: string;
    location: string;
    message: string;
    date: string;
    reply?: string;
    replyDate?: string;
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

// Helper to write complete wishes array to Vercel Blob
async function saveWishes(wishes: Wish[]): Promise<boolean> {
    try {
        if (!checkToken()) return false;

        // Overwrite the existing blob. 
        await put(BLOB_FILE_NAME, JSON.stringify(wishes), {
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

        const currentWishes = await getWishes();
        const updatedWishes = [newWish, ...currentWishes];
        const success = await saveWishes(updatedWishes);

        if (success) {
            return NextResponse.json(newWish, { status: 201 });
        } else {
            return NextResponse.json({ error: "Failed to save wish" }, { status: 500 });
        }

    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ error: "Failed to post wish", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, reply, password } = body;

        // Verify Admin Password
        if (password !== process.env.ADMIN_KEY) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id || !reply) {
            return NextResponse.json({ error: "ID and reply are required" }, { status: 400 });
        }

        const currentWishes = await getWishes();
        const wishIndex = currentWishes.findIndex(w => w.id === id);

        if (wishIndex === -1) {
            return NextResponse.json({ error: "Wish not found" }, { status: 404 });
        }

        // Update the wish
        currentWishes[wishIndex].reply = reply;
        currentWishes[wishIndex].replyDate = new Date().toISOString();

        // Save updated list
        const success = await saveWishes(currentWishes);

        if (success) {
            return NextResponse.json(currentWishes[wishIndex], { status: 200 });
        } else {
            return NextResponse.json({ error: "Failed to update wish" }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Failed to update wish" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id, password } = body;

        // Verify Admin Password
        if (password !== process.env.ADMIN_KEY) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const currentWishes = await getWishes();
        const updatedWishes = currentWishes.filter(w => w.id !== id);

        if (currentWishes.length === updatedWishes.length) {
            return NextResponse.json({ error: "Wish not found" }, { status: 404 });
        }

        // Save updated list
        const success = await saveWishes(updatedWishes);

        if (success) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Failed to delete wish" }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete wish" }, { status: 500 });
    }
}
