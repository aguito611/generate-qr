import { Module } from '@nestjs/common';
import { FormRecognizerController } from './form-recognizer.controller';
import { FormRecognizerService } from './form-recognizer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [FormRecognizerService],
  controllers: [FormRecognizerController],
})
export class FormRecognizerModule {}
