import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'wishes.json');

// Helper to read data
function getWishes() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return [];
        }
        const fileData = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error("Error reading database:", error);
        return [];
    }
}

// Helper to write data
function saveWish(newWish: any) {
    try {
        const currentWishes = getWishes();
        const updatedWishes = [newWish, ...currentWishes]; // Add new wish to top
        fs.writeFileSync(DB_PATH, JSON.stringify(updatedWishes, null, 2));
        return true;
    } catch (error) {
        console.error("Error writing to database:", error);
        return false;
    }
}

export async function GET() {
    const wishes = getWishes();
    return NextResponse.json(wishes);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input logic could go here
        if (!body.message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const newWish = {
            id: Date.now(),
            name: body.name || "Anonymous",
            location: body.location || "Unknown",
            message: body.message,
            date: new Date().toISOString()
        };

        const success = saveWish(newWish);

        if (success) {
            return NextResponse.json(newWish, { status: 201 });
        } else {
            return NextResponse.json({ error: "Failed to save wish" }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Failed to post wish" }, { status: 500 });
    }
}
