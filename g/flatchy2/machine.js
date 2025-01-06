/**
 * A generic state machine that can be used to manage state transitions
 * and state-specific behaviors in games and applications.
 */
export class StateMachine {
    constructor(states, initialState) {
        this.states = states;
        this.currentState = initialState;
        this.transitions = new Map();
        this.exitHandlers = new Map();
        this.enterHandlers = new Map();
    }

    /**
     * Add a transition handler for a specific state
     * @param {string} fromState - State to transition from
     * @param {string} toState - State to transition to
     * @param {Function} handler - Handler function to call during transition
     */
    addTransition(fromState, toState, handler) {
        const key = `${fromState}->${toState}`;
        this.transitions.set(key, handler);
    }

    /**
     * Add a handler to be called when exiting a state
     * @param {string} state - State to handle exit for
     * @param {Function} handler - Handler function to call on state exit
     */
    onExit(state, handler) {
        this.exitHandlers.set(state, handler);
    }

    /**
     * Add a handler to be called when entering a state
     * @param {string} state - State to handle entry for
     * @param {Function} handler - Handler function to call on state entry
     */
    onEnter(state, handler) {
        this.enterHandlers.set(state, handler);
    }

    /**
     * Transition to a new state
     * @param {string} newState - State to transition to
     * @param {Object} context - Context object to pass to handlers
     */
    setState(newState) {
        if (!this.states.includes(newState)) {
            console.error(`Invalid state: ${newState}`);
            return;
        }

        const oldState = this.currentState;
        
        // Call exit handler for old state
        const exitHandler = this.exitHandlers.get(oldState);
        if (exitHandler) {
            exitHandler(oldState);
        }

        // Call transition handler if exists
        const transitionKey = `${oldState}->${newState}`;
        const transitionHandler = this.transitions.get(transitionKey);
        if (transitionHandler) {
            transitionHandler(oldState, newState);
        }

        this.currentState = newState;

        // Call enter handler for new state
        const enterHandler = this.enterHandlers.get(newState);
        if (enterHandler) {
            enterHandler(newState);
        }
    }

    /**
     * Check if machine is in a specific state
     * @param {string} state - State to check
     * @returns {boolean} True if in specified state
     */
    isState(state) {
        return this.currentState === state;
    }

    /**
     * Get current state
     * @returns {string} Current state
     */
    getCurrentState() {
        return this.currentState;
    }
} 