import { readNetworks } from "@/lib/networkObjects";

export type NetworkInfo = {
    ssid: string;
    pos: { x: number; y: number };
};

export async function GET() {
    return Response.json(
        readNetworks().map((net) => {
            return {
                ssid: net.address,
                pos: { x: net.posAverage.x, y: net.posAverage.y },
            };
        }) as NetworkInfo[],
        { status: 200 }
    );
}
