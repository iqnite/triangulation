import { NetworkTarget } from "@/lib/peripherals";

export const networkObjects = new Map<string, NetworkTarget>()
export async function POST(request: Request) {
    const body = await request.json();

    if (!networkObjects.has(body.targetId)) {
        networkObjects.set(body.targetId, new NetworkTarget(body.targetId));
    }

    const netTarget = networkObjects.get(body.targetId);
    if (!netTarget) {
        throw new Error("Network targets should exist!");
    }
    netTarget.addSignalData(body.peripheralId, body.signalData);

    const response = new Response(null, {
        status: 200, statusText: "OK", headers: {
            "Reply": "Good-Job"
        }
    });
    return response;
}