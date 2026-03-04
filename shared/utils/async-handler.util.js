/**
 * Async handler wrapper to catch errors in async route handlers
 * Wraps async functions to automatically catch errors and pass them to error middleware
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const AsyncHandlerUtil = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
