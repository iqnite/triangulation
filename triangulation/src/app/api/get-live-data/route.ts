import { liveClientMap } from "../post-signal-data/route";

export async function GET() {
    return Response.json(liveClientMap, { status: 200 });
}
