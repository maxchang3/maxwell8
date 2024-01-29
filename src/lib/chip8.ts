import { isKeyIn } from "./utils"
import { FONT, KEYMAP, ERRORS } from "./const"
import { getOpCodeMap } from "./instruction"

export class Chip8 {
    ENTRY_BASE = 0x200
    ROM_SIZE = -1
    V = new Uint8Array(16)         // Registers
    FLAG = new Uint8Array(16)      // SuperChip 
    RAM = new Uint8Array(4096)
    SCREEN = this.RAM.subarray(0xf00, 0xfff + 1)
    STACK = new Uint16Array(this.RAM.buffer, 0xea0, (0xeff - 0xea0 + 1) / 2)
    SP = 0                         // Stack Pointer
    KEYSTATE: boolean[] = Array(16).fill(false) // Key State
    I = 0                          // Address Register
    PC = this.ENTRY_BASE           // Program Counter
    DT = 0                         // Delay Timer
    ST = 0                         // Sound Timer
    ticks = 0
    FIRST_RUN = true
    constructor() {
        this.RAM.set(FONT)
    }
    init() {
        this.SP = this.I = this.DT = this.ST = this.ticks = 0
        this.V.fill(0)
        this.FLAG.fill(0)
        this.SCREEN.fill(0)
        this.STACK.fill(0)
    }
    loadROM(ROM: Uint8Array) {
        if (!this.FIRST_RUN) this.init()
        if (this.FIRST_RUN) this.FIRST_RUN = false
        this.ROM_SIZE = ROM.length
        if (ROM.length + 0x200 >= 0xf00) {
            console.info(`%c ROM size ${ROM.length} greater than ${0xf00 - 0x200}, \
            an independent screen RAM is created.`)
            this.SCREEN = new Uint8Array(0xff)
            return
        }
        this.RAM.set(ROM, this.ENTRY_BASE)
    }
    getNextOpCode() {
        if (this.ROM_SIZE === -1) throw ERRORS.ROM_UNLOAD
        if (this.PC < this.ENTRY_BASE || this.PC >= this.ENTRY_BASE + this.ROM_SIZE) return -1
        const opCode = (this.RAM[this.PC++] << 8) | (this.RAM[this.PC++])
        // console.log(`0x${toHex(this.PC-2)}    ${toHex(opCode)}`)
        return opCode
    }
    excuteNextOpCode() {
        if (this.ROM_SIZE === -1) throw ERRORS.ROM_UNLOAD
        const opCode = this.getNextOpCode()
        if (opCode === -1) return -1
        const opType = opCode >>> 12
        if (opType === 0x1 && (opCode & 0xfff) === this.PC - 2) return -1 // check dead loop
        const opCodeMap = getOpCodeMap(this, opCode & 0xfff)
        opCodeMap[opType]()
        if (++this.ticks % 6 === 0) { // ST
            let flag = false
            if (this.DT > 0) { this.DT--; flag = true }
            if (this.ST > 0) { this.ST--; flag = true }
            if (flag) this.ticks = 0
        }
        return opCode
    }
}

export const setKeyState = (vm: Chip8, key: string, state: boolean) => {
    const index = isKeyIn(key, KEYMAP) ? KEYMAP[key] : -1
    if (index === -1) return
    vm.KEYSTATE[index] = state
}
