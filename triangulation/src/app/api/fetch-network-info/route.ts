import { networkObjects } from "../post-signal-data/route";

export type NetworkInfo = {
    ssid: string,
    pos: { x: number, y: number },
    ready: boolean, //if the network has been located as a coordinate
}

export async function GET(request: Request) {
    return Response.json(networkObjects.map(net => {
        return {
            ssid: net.address,
            pos: { x: net.posAverage.x, y: net.posAverage.y },
            ready: net.ready
        }
    }) as NetworkInfo[], { status: 200 });
}