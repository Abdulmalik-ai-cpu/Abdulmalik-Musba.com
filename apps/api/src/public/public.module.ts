import { Global, Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';

@Global()
@Module({
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}