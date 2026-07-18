import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type Policy, throttlingFactory, transientFactory } from "@kevinmichaelchen/distilled/retry";

export { type Options, type Factory, type Policy, makeDefault, jittered, capped, throttlingOptions, transientOptions, throttlingFactory, transientFactory } from "@kevinmichaelchen/distilled/retry";
export class Retry extends Context.Service<Retry, Policy>()("TmdbRetry") {}
export const policy = (value: Policy) => Effect.provide(Layer.succeed(Retry, value));
export const none = Effect.provide(Layer.succeed(Retry, { while: () => false }));
export const throttling = policy(throttlingFactory);
export const transient = policy(transientFactory);
