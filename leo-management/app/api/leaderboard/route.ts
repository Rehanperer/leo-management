import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
        return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    try {
        const scores = await prisma.leaderboardEntry.findMany({
            where: { gameId },
            orderBy: { score: "desc" },
            take: 10,
        });

        return NextResponse.json(scores);
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { gameId, playerName, score } = body;

        if (!gameId || !playerName || score === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newEntry = await prisma.leaderboardEntry.create({
            data: {
                gameId,
                playerName,
                score,
            },
        });

        return NextResponse.json(newEntry);
    } catch (error) {
        console.error("Failed to submit score:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
