import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class FormRecognizerDto {
  @IsString()
  @IsNotEmpty()
  modelName: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  documentURL: string;
}
