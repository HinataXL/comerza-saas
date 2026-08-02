import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  export interface Request {
    query: Record<string, string | undefined>;
    params: Record<string, string>;
  }
}
