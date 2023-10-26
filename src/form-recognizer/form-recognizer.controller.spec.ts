import { Test, TestingModule } from '@nestjs/testing';
import { FormRecognizerController } from './form-recognizer.controller';
import { FormRecognizerService } from './form-recognizer.service';
import { Readable } from 'stream';

describe('FormRecognizerController', () => {
  let controller: FormRecognizerController;
  const mockRecognizerResult = {
    tagName: 'mock-OCR-tag-value',
  };
  const mockServiceRecognizerFromURL = jest
    .fn()
    .mockResolvedValue(mockRecognizerResult);

  const mockServiceRecognizerFromFile = jest
    .fn()
    .mockResolvedValue(mockRecognizerResult);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormRecognizerController],
    })
      .useMocker((token) => {
        if (token === FormRecognizerService) {
          return {
            recognizerFromURL: mockServiceRecognizerFromURL,
            recognizerFromFile: mockServiceRecognizerFromFile,
          };
        }
        return {};
      })
      .compile();
    controller = module.get<FormRecognizerController>(FormRecognizerController);
  });

  it('should call the service function with URL and modelName and return the OCR data', async () => {
    const mockBodyRequest = {
      modelName: 'mock-documentURL',
      documentURL: 'mock-modelId',
    };
    expect(await controller.recognizerFromURL(mockBodyRequest)).toBe(
      mockRecognizerResult,
    );
    expect(mockServiceRecognizerFromURL).toBeCalledWith(
      mockBodyRequest.modelName,
      mockBodyRequest.documentURL,
    );
  });

  it('should call the service function with FILE and modelName and return the OCR data', async () => {
    const mockBodyRequest = {
      modelName: 'mock-documentURL',
    };

    const mockFile = {
      fieldname: '',
      originalname: '',
      encoding: '',
      mimetype: '',
      size: 0,
      stream: new Readable(),
      buffer: Buffer.from('', 'utf-8'),
      destination: '',
      filename: '',
      path: '',
    };

    expect(await controller.recognizerFromFile(mockBodyRequest, mockFile)).toBe(
      mockRecognizerResult,
    );
    expect(mockServiceRecognizerFromFile).toBeCalledWith(
      mockBodyRequest.modelName,
      mockFile,
    );
  });
});
