export type Params = Record<string, string>;
export type Handler = (req: Request, res: Response, params: Params) => Promise<unknown> | unknown;
