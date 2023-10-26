import { Context, HttpRequest } from '@azure/functions';
import { AzureHttpAdapter } from '@nestjs/azure-func-http';
import { INestApplication } from '@nestjs/common';
import { createApp } from '../src/main.azure';

/**
 * Extracted from https://github.com/nestjs/azure-func-http/issues/407
 * Temporal solution to mediate AzureHttpAdapter not correctly translating
 * headers from microservices to serverless function.
 */
function createPsuedoApp(
  createApp: () => Promise<INestApplication>,
): () => Promise<INestApplication> {
  return async (): Promise<any> => {
    const app = await createApp();
    const psuedoApp = {
      getHttpAdapter: () => {
        return {
          getInstance: () => {
            return (req: any, res: any) => {
              const done = req.context.done;
              req.context.done = (err?: string | Error, result?: any) => {
                res.writeHead();
                done(err, result);
              };
              app.getHttpAdapter().getInstance()(req, res);
            };
          },
        };
      },
    };
    return psuedoApp;
  };
}

export default function (context: Context, req: HttpRequest): void {
  AzureHttpAdapter.handle(createPsuedoApp(createApp), context, req);
}
