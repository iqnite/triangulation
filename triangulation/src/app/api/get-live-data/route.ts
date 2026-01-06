import { readLive } from "@/lib/networkObjects";
import { liveClientMap } from "../post-signal-data/route";

export async function GET() {
    return Response.json(readLive(), { status: 200 });
}
