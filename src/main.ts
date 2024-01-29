import "./assets/main.css"
import { Chip8, setKeyState } from "@/lib/chip8"
import { restoreFlagRegisters, storeFlagRegister } from "@/lib/quirks/superchip"
import { fetchROM, repeatExec } from "@/lib/utils"

const vm = new Chip8()
const ROM = await fetchROM('./rom/snake.ch8')


vm.loadROM(ROM)
restoreFlagRegisters(vm)
console.log(vm)

const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d', { alpha: false })!

const step = () => {
  repeatExec(() => {
    const opCode = vm.excuteNextOpCode()
    if (opCode === -1) cancelAnimationFrame(id)
    if (opCode >> 12 !== 0xD) return
    vm.SCREEN.forEach((line, i) => {
      for (let j = 0; j < 8; j++) {
        const bit = (line >> (7 - j)) & 1
        const x = i / 8 ^ 0
        const y = (i % 8) * 8 + j
        ctx.fillStyle = bit ? 'rgb(0, 255, 0)' : 'rgb(0,0,0)'
        ctx.fillRect(y, x, 1, 1)
      }
    })
  }, 20)
  requestAnimationFrame(step)
}

const id = requestAnimationFrame(step)

window.addEventListener('keydown', ({ key }) => setKeyState(vm, key, true))
window.addEventListener('keyup', ({ key }) => setKeyState(vm, key, false))
storeFlagRegister(vm)
