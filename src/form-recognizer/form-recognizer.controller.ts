import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FormRecognizerService } from './form-recognizer.service';
import { FormRecognizerDto } from './dto/form-recognizer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { GeneralPickedInformation } from 'src/types/GeneralPickedInformation';

@Controller('form-recognizer')
export class FormRecognizerController {
  constructor(private readonly formRecognizerService: FormRecognizerService) {}

  @Post('url')
  recognizerFromURL(@Body() body: FormRecognizerDto) {
    return this.formRecognizerService.recognizerFromURL(
      body.modelName,
      body.documentURL,
    );
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  recognizerFromFile(
    @Body() body: { modelName: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GeneralPickedInformation> {
    return this.formRecognizerService.recognizerFromFile(body.modelName, file);
  }
}
