/**
 * Caches `rgba()` strings by 8-bit alpha so per-frame drawing never allocates.
 * Canvas alpha is stored in 8 bits, so quantizing to 1/255 is visually lossless.
 */
export class ColorCache {
    private readonly tables = new Map<number, string[]>();

    get(base: number, alpha: number): string {
        const index = Math.max(0, Math.min(255, Math.round(alpha * 255)));

        let table = this.tables.get(base);
        if (!table) {
            table = new Array<string>(256);
            for (let i = 0; i < 256; i++) {
                table[i] = `rgba(${base}, ${base}, ${base}, ${i / 255})`;
            }
            this.tables.set(base, table);
        }

        return table[index];
    }
}
