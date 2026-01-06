function floatlerp(a: number, b: number, k: number): number {
    return (b - a) * k + a;
}
export class Position {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    lerp(other: Position, k: number) {
        return new Position(
            floatlerp(this.x, other.x, k),
            floatlerp(this.x, other.x, k)
        );
    }
    toString(): string {
        return "{X:" + this.x.toFixed(1) + ",Y:" + this.y.toFixed(1) + "}";
    }
}
