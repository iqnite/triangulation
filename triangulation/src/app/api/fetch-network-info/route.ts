import { readNetworks } from "@/lib/networkObjects";

export type NetworkInfo = {
    ssid: string;
    pos: { x: number; y: number };
    ready: boolean; //if the network has been located as a coordinate
};

export async function GET() {
    return Response.json(
        readNetworks().map((net) => {
            return {
                ssid: net.address,
                pos: { x: net.posAverage.x, y: net.posAverage.y },
                ready: net.ready,
            };
        }) as NetworkInfo[],
        { status: 200 }
    );
}
