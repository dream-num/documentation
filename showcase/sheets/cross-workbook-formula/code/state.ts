import type { Univer } from '@univerjs/presets'

/**
 * State management for the Univer instance.
 * If your project has a more complex state management system, you can replace this with your own implementation.
 */
class State {
  univer: Univer | null = null

  setUniver(univer: Univer) {
    this.univer = univer
  }

  getUniver() {
    return this.univer
  }
}

export const state = new State()
