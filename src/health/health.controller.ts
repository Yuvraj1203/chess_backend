import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { Public } from '../common/decorators';
import { DB, type Database } from '../database/database.module';

@Public()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(@Inject(DB) private readonly db: Database) {}

  /** Liveness: the process is up and serving requests. */
  @Get()
  health() {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /** Readiness: also verifies the database connection. */
  @Get('db')
  async database() {
    const started = Date.now();
    try {
      await this.db.execute(sql`select 1`);
      return { status: 'ok', database: 'up', latencyMs: Date.now() - started };
    } catch (err) {
      return {
        status: 'error',
        database: 'down',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
