export const toBits = (n: number, base: number = 8) => Array.from({ length: base }).map((_, i) => (n >>> base - i - 1) & 1)
export const toBin = (n: number) => n.toString(2).padStart(8, '0')
export const toHex = (n: number) => n.toString(16).padStart(4, '0').toUpperCase()
export const Uint8Array2Bin = (array: Uint8Array) => Array.from(array).map(toBin)
export const Uint8Array2Hex = (array: Uint8Array) => Array.from(array).map(toHex)

export const repeatExec = (func: (...args: any) => void, n: number) => Array.from({ length: n }).forEach((_) => func())

export const isKeyIn = <T extends object>(key: PropertyKey, obj: T): key is keyof T => key in obj

export const fetchROM = async (path: string) => new Uint8Array(await (await fetch(path)).arrayBuffer())
