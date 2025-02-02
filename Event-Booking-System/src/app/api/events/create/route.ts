import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { dbConnect } from "@/utils/database";
import { EventModel } from "@/utils/models";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authConfig } from "@/utils/auth";

interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}


export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authConfig);

    if (session) {
        try {
            const formData = await req.formData();

            // Get form data fields
            const title = formData.get('title')?.toString();
            const description = formData.get('description')?.toString();
            const price = parseFloat(formData.get('price') as string);
            const date = formData.get('date')?.toString();
            const category = formData.get('category')?.toString();
            const availableSeats = parseFloat(formData.get('seats') as string);
            const time = formData.get('time')?.toString();

            // Validate required fields
            if (!title || !description || !date || !time || !location) {
                return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
            }

            const dateString = new Date(date);

            

            // Create new event
            const newEvent = new EventModel({
                title,
                description,
                price: price || 0,
                date: `${dateString.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                })}, ${time}`,
                category,
                availableSeats,
                bookedSeats: 0,
                organizer: session.user.id,
            });

            await newEvent.save();

            return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
        } catch (error) {
            console.error("Error creating event:", error);
            return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
        }
    } else {
        console.error("Error creating event: invalid session");
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}