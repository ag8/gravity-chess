function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));
