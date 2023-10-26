import { Module } from '@nestjs/common';
import { FormRecognizerModule } from './form-recognizer/form-recognizer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    FormRecognizerModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local'],
    }),
  ],
})
export class AppModule {}
