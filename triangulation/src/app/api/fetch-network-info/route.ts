import { networkObjects } from "../post-signal-data/route";

export type NetworkInfo = {
    ssid: string,
    pos: { x: number, y: number }
}

export async function GET(request: Request) {
    return Response.json(networkObjects.map(net => {
        return {
            ssid: net.address,
            pos: { x: net.posAverage.x, y: net.posAverage.y }
        }
    }) as NetworkInfo[], { status: 200 });
}