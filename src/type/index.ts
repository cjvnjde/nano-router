import type { IncomingMessage, ServerResponse } from "node:http";

export type Params = Record<string, string>;
export type DefaultHandler = (req: IncomingMessage, res: ServerResponse, params: Params) => Promise<unknown> | unknown;
