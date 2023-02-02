import { Inject, Injectable } from '@nestjs/common';
import IORedis, { RedisKey, RedisOptions, RedisValue } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: any;

  constructor(@Inject('RedisOptions') options: RedisOptions) {
    this.client = new IORedis(options) as any;
  }

  public getClient(): any {
    return this.client;
  }

  async get(key: RedisKey): Promise<RedisValue | null> {
    return this.client.get(key);
  }

  async set(key: RedisKey, value: RedisValue, ttl?: number): Promise<'OK' | null> {
    const expireTimeFormat = 'EX';

    return ttl ? this.client.set(key, value, expireTimeFormat, ttl) : this.client.set(key, value);
  }

  async delete(key: RedisKey): Promise<number> {
    return this.client.del(key);
  }

  async keys(searchPattern = '*'): Promise<RedisKey[]> {
    return this.client.keys(searchPattern);
  }

  async exists(key: RedisKey): Promise<boolean> {
    const isExists = await this.client.exists(key);

    return !!isExists;
  }

  async setAdd(setName: string, value: RedisKey): Promise<number> {
    return this.client.sadd(setName, value);
  }

  async setRemove(setName: string, value: RedisKey): Promise<number> {
    return this.client.srem(setName, value);
  }

  async setMembers(setName: string): Promise<string[]> {
    return this.client.smembers(setName);
  }

  async incrby(key: RedisKey, number: number): Promise<number> {
    return this.client.incrby(key, number);
  }

  async decrby(key: RedisKey, number: number): Promise<number> {
    return this.client.decrby(key, +number);
  }

  async setKeyTTLMs(key: RedisKey, number: number): Promise<void> {
    await this.client.pexpire(key, number);
  }
}
