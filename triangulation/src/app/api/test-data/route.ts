import { readNetworks } from "@/lib/networkObjects";

export async function GET() {
    return Response.json(readNetworks());
}