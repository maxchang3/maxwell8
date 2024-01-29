import type { Chip8 } from "@/lib/chip8"

export const restoreFlagRegisters = (vm: Chip8) => { // SuperChip 
    const flagRegisters = localStorage.getItem('FLAG')
    if (flagRegisters) vm.FLAG = new Uint8Array(JSON.parse(flagRegisters))
}

export const storeFlagRegister = (vm: Chip8) => {
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('FLAG', `[${vm.FLAG.toString()}]`)
    })
}
