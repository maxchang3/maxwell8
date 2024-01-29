import { SCREEN_HEIGHT, SCREEN_WIDTH, ERRORS } from "./const"
import type { Chip8 } from "./chip8"

const setPixel = (array: Uint8Array, SCREEN_WIDTH: number, x: number, y: number) => {
    const index = y * SCREEN_WIDTH + x
    const byteIndex = index / 8 ^ 0
    const offset = index % 8
    const mask = 0x80 >>> offset
    const byte = array[byteIndex]
    const screenPixel = byte & mask
    if (screenPixel) {
        array[byteIndex] &= (~mask)
    } else {
        array[byteIndex] |= mask
    }
    return !!screenPixel
}

export const getOpCodeMap = (vm: Chip8, opLowByte: number): { [opType: number]: () => void } => ({
    0x0: () => {
        const code = opLowByte & 0xff
        if (code === 0xE0) { // clearScreenn
            vm.SCREEN.fill(0)
        } else if (code == 0xEE) { // Return from a subroutine
            if (vm.SP === 0) throw ERRORS.STACK_OVERFLPW
            vm.PC = vm.STACK[--vm.SP]
        } else if (code == 0x00) {
            // do nothing
        } else {
            throw ERRORS.INVALID_OPCODE
        }
    },
    // 1NNN, Jump to address NNN
    0x1: () => {
        vm.PC = opLowByte
    },
    // 2NNN, Execute subroutine starting at address NNN
    0x2: () => {
        if (vm.SP >= vm.STACK.length) throw ERRORS.STACK_OVERFLPW
        vm.STACK[vm.SP++] = vm.PC
        vm.PC = opLowByte
    },
    // 3XNN, Skip the following instruction if the value of register VX equals NN
    0x3: () => {
        const X = opLowByte >>> 8
        const NN = opLowByte & 0xff
        if (vm.V[X] === NN) vm.PC += 2
    },
    // 4XNN, Skip the following instruction if the value of register VX is not equal to NN
    0x4: () => {
        const X = opLowByte >>> 8
        const NN = opLowByte & 0xff
        if (vm.V[X] !== NN) vm.PC += 2
    },
    // 5XY0, Skip the following instruction if the value of register VX is equal to the value of register VY
    0x5: () => {
        if ((opLowByte & 0xf) !== 0) throw ERRORS.INVALID_OPCODE
        const X = opLowByte >>> 8
        const Y = opLowByte >>> 4 & 0xf
        if (vm.V[X] === vm.V[Y]) vm.PC += 2
    },
    // 6XNN, Store number NN in register VX
    0x6: () => {
        const X = opLowByte >>> 8
        const NN = opLowByte & 0xff
        vm.V[X] = NN
    },
    // 7XNN, Add the value NN to register VX
    0x7: () => {
        const X = opLowByte >>> 8
        const NN = opLowByte & 0xff
        vm.V[X] += NN
    },
    // 8XY_(0-7,E)
    0x8: () => {
        const code = opLowByte & 0xf
        const X = opLowByte >>> 8
        const Y = opLowByte >>> 4 & 0xf
        const instructionMap: { [code: number]: () => void } = { // consider Y equals to 0xf
            // Store the value of register VY in register VX
            0x0: () => { vm.V[X] = vm.V[Y] },
            // Set VX to VX OR VY
            0x1: () => {
                vm.V[X] |= vm.V[Y]
            },
            // Set VX to VX AND VY
            0x2: () => {
                vm.V[X] &= vm.V[Y]
            },
            // Set VX to VX XOR VY
            0x3: () => {
                vm.V[X] ^= vm.V[Y]
            },
            // Add the value of register VY to register VX
            // Set VF to 01 if a carry occurs, to 00 if a carry does not occur
            0x4: () => {
                const result = vm.V[X] + vm.V[Y]
                vm.V[X] = result
                vm.V[0xf] = (result) > 255 ? 0x01 : 0x00
            },
            // Subtract the value of register VY from register VX
            // Set VF to 00 if a borrow occurs, to 01 if a borrow does not occur
            0x5: () => {
                const result = vm.V[X] - vm.V[Y]
                vm.V[X] = result
                vm.V[0xf] = result >= 0 ? 0x01 : 0x00
            },
            // Store the value of register VY shifted right one bit in register VX
            // Set register VF to the least significant bit prior to the shift, VY is unchanged
            0x6: () => {
                const vx = vm.V[X]
                vm.V[X] = vm.V[Y] >>> 1
                vm.V[0xf] = vx & 1
            },
            // Set register VX to the value of VY minus VX
            // Set VF to 00 if a borrow occurs, to 01 if a borrow does not occur
            0x7: () => {
                const result = vm.V[Y] - vm.V[X]
                vm.V[X] = result
                vm.V[0xf] = result >= 0 ? 0x01 : 0x00
            },
            // Store the value of register VY shifted left one bit in register VX
            // Set register VF to the most significant bit prior to the shift, VY is unchanged
            0xE: () => {
                const vx = vm.V[X]
                vm.V[X] = vm.V[Y] << 1
                vm.V[0xF] = (vx >>> 7) & 0x1

            }
        }
        if (!(code in instructionMap)) throw ERRORS.INVALID_OPCODE
        instructionMap[code]()

    },
    // 9XY0, Skip the following instruction if the value of register VX is not equal to the value of register VY
    0x9: () => {
        if ((opLowByte & 0xf) !== 0) throw ERRORS.INVALID_OPCODE
        const X = opLowByte >>> 8
        const Y = opLowByte >>> 4 & 0xf
        if (vm.V[X] !== vm.V[Y]) vm.PC += 2
    },
    // ANNN, Store memory address NNN in register I
    0xA: () => {
        const NNN = opLowByte & 0xfff
        vm.I = NNN
    },
    // BNNN, Jump to address NNN + V0
    0xB: () => {
        const NNN = opLowByte & 0xfff
        vm.PC = NNN + vm.V[0x0]
    },
    // CNNN, Set VX to a random number with a mask of NN
    0xC: () => {
        const X = opLowByte >>> 8
        const NN = opLowByte & 0xff
        vm.V[X] = ((Math.random() * 255) ^ 0) & NN
    },
    // DXYN, Draw a sprite at position VX, VY with N bytes of sprite data starting at the address stored in I
    // Set VF to 01 if any set pixels are changed to unset, and 00 otherwise
    0xD: () => {
        const startX = vm.V[opLowByte >>> 8]
        const startY = vm.V[opLowByte >>> 4 & 0xf]
        const N = opLowByte & 0xf
        const endX = startX + 8
        const endY = startY + N
        vm.V[0xf] = 0
        for (let y = startY; y < endY; y++) {
            const spriteByte = vm.RAM[vm.I + (y - startY)]
            for (let x = startX; x < endX; x++) {
                const spritePixel = spriteByte & (0x80 >>> (x - startX))
                if (!spritePixel) continue
                const unset = setPixel(vm.SCREEN, SCREEN_WIDTH, x % SCREEN_WIDTH, y % SCREEN_HEIGHT)
                if (unset) vm.V[0xf] = 1
            }
        }
    },
    0xE: () => {
        const X = opLowByte >>> 8
        const code = opLowByte & 0xff
        if (code === 0x9E) {
            if (vm.KEYSTATE[vm.V[X]]) vm.PC += 2
        } else if (code === 0xA1) {
            if (!vm.KEYSTATE[vm.V[X]]) vm.PC += 2
        } else {
            throw ERRORS.INVALID_OPCODE
        }
    },
    0xF: () => {
        const X = opLowByte >>> 8
        const code = opLowByte & 0xff
        const instructionMap: { [code: number]: () => void } = {
            // Store the current value of the delay timer in register VX
            0x07: () => { vm.V[X] = vm.DT },
            // Wait for a keypress and store the result in register VX
            0x0A: () => {
                let keyPressed = false
                for (let i = 0; i < vm.KEYSTATE.length; i++) {
                    if (!vm.KEYSTATE[i]) continue
                    keyPressed = true
                    vm.V[X] = +vm.KEYSTATE[i]
                }
                if (!keyPressed) vm.PC -= 2
            },
            // Set the delay timer to the value of register VX
            0x15: () => { vm.DT = vm.V[X] },
            // Set the sound timer to the value of register VX
            0x18: () => { vm.ST = vm.V[X] },
            // Add the value stored in register VX to register I
            0x1E: () => { vm.I += vm.V[X] },
            // Set I to the memory address of the sprite data 
            // corresponding to the hexadecimal digit stored in register VX
            0x29: () => { vm.I = vm.V[X] * 5 },
            // Store the binary-coded decimal equivalent of the value 
            // stored in register VX at addresses I, I + 1, and I + 2
            0x33: () => {
                const value = vm.V[X]
                vm.RAM[vm.I] = value / 100 ^ 0
                vm.RAM[vm.I + 1] = (value / 10) % 10
                vm.RAM[vm.I + 2] = value % 10
            },
            // Store the values of registers V0 to VX inclusive in memory starting at address I
            // I is set to I + X + 1 after operation²
            0x55: () => {
                for (let i = 0; i <= X; i++) {
                    vm.RAM[vm.I + i] = vm.V[i]
                }
                vm.I = vm.I + X + 1
            },
            // Fill registers V0 to VX inclusive with the values stored in memory starting at address I
            // I is set to I + X + 1 after operation²
            0x65: () => {
                for (let i = 0; i <= X; i++) {
                    vm.V[i] = vm.RAM[vm.I + i]
                }
                vm.I = vm.I + X + 1
            },
            // SuperChip 
            0x75: () => {
                for (let i = 0; i <= X; i++) {
                    vm.FLAG[i] = vm.V[i]
                }
            },
            0x85: () => {
                for (let i = 0; i <= X; i++) {
                    vm.V[i] = vm.FLAG[i]
                }
            }
        }
        if (!(code in instructionMap)) throw ERRORS.INVALID_OPCODE
        instructionMap[code]()
    }
})
