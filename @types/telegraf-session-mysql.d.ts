declare module 'telegraf-session-mysql' {
  import { ConnectionConfig } from 'mysql2';
  import { Context, Middleware } from 'telegraf';

  export type MysqlSessionOptions = ConnectionConfig;
  export default class MysqlSession {
    constructor(options: MysqlSessionOptions);
    middleware(): Middleware<Context>;
    connect(): Promise<void>;
  }
}
