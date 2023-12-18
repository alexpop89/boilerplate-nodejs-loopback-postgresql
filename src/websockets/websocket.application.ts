import {ApplicationConfig} from '@loopback/core';
import {HttpServer} from '@loopback/http-server';
import {RestApplication} from '@loopback/rest';
import {WebSocketServer} from './websocket.server';
import {Constructor} from '@loopback/context';
import {Namespace} from 'socket.io';

export {ApplicationConfig};

export class WebsocketApplication extends RestApplication {
  readonly httpServer: HttpServer;
  readonly wsServer: WebSocketServer;

  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.httpServer = new HttpServer(this.requestHandler, {
      port: options.websocket.port,
    });
    // eslint-disable-next-line
    // @ts-ignore
    this.wsServer = new WebSocketServer(this, this.httpServer, options.websocket);
  }

  public websocketRoute(controllerClass: Constructor<unknown>, namespace?: string | RegExp): Namespace {
    return this.wsServer.route(controllerClass, namespace) as Namespace;
  }

  public async start(): Promise<void> {
    await this.wsServer.start();
    await super.start();
  }

  public async stop(): Promise<void> {
    await this.wsServer.stop();
    await super.stop();
  }
}
