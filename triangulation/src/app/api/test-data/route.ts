import { networkObjects } from "../post-signal-data/route";

export async function GET(request: Request) {
    const reply = networkObjects.map(obj =>
        obj.address
        + "\n  - Datapoints: " + obj.datapoints.size
        + "\n  - PositionAV: " + obj.posAverage.toString()
        + "\n  - PositionRT: " + obj.pos.toString()
        + "\n\n"
    ).join("") || "<dataset is currently empty>";

    const response = new Response(reply, {
        status: 200, statusText: "OK", headers: {
            "Reply": "Good-Job"
        }
    });
    return response;
}