// Jest/jsdom polyfills. CRA's bundled jsdom predates these globals, which
// newer react-router / undici-based deps expect.
import { TextEncoder, TextDecoder } from "util";

if (typeof global.TextEncoder === "undefined") global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === "undefined") global.TextDecoder = TextDecoder;

// React 18 concurrent act() support in the jsdom test environment.
global.IS_REACT_ACT_ENVIRONMENT = true;
