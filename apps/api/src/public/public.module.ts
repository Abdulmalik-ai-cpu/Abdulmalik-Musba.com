import { Global, Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { ContactModule } from '../contact/contact.module';

@Global()
@Module({
  imports: [ContactModule],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}