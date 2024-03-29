import { createKeyMap, strToArray } from "./keymap"

export const SCREEN_WIDTH = 64
export const SCREEN_HEIGHT = 32
export const FONT = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80  // F
]

// const StandardKeyMap = strToArray('123c456d789ea0bf')

const OctoKeyMap = strToArray('x123qweasdzc4rfv')

const ArrowKeyMap = {
    ArrowUp: 'w',
    ArrowDown: 's',
    ArrowLeft: 'a',
    ArrowRight: 'd'
} as const

export const KEYMAP = createKeyMap(OctoKeyMap, ArrowKeyMap)

export const ERRORS = {
    INVALID_OPCODE: new Error("Invalid operation code!"),
    PC_OVERFLOW: new Error("Program counter overflow!"),
    STACK_OVERFLPW: new Error("Stack overflow!"),
    ROM_UNLOAD: new Error("No ROM is loaded!")
}
