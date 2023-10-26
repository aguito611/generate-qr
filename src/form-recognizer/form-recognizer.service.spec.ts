import { Test, TestingModule } from '@nestjs/testing';
import { FormRecognizerService } from './form-recognizer.service';
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
  AnalyzedDocument,
  DocumentTable,
} from '@azure/ai-form-recognizer';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

const mockGetOrThrow = jest.fn();
const mockEndpoint = 'mock-endpoint';
const mockModelID = 'mock-modelID';
const mockAPIKey = 'mock-api-key';

const mockAnalyzedDocument: AnalyzedDocument = {
  confidence: 0,
  docType: 'mock-doct-type',
  spans: [{ offset: 0, length: 1578 }],
  fields: {
    firstTagName: {
      kind: 'string',
      content: 'mock-first-tag-content',
    },
    secondTagName: {
      kind: 'string',
      content: 'mock-second-tag-content',
    },
    thirdTagName: {
      kind: 'string',
      content: 'mock-third-tag-content',
    },
  },
};

const mockDocumentTable: DocumentTable = {
  cells: [
    {
      columnIndex: 0,
      content: '',
      rowIndex: 0,
      spans: [
        {
          length: 0,
          offset: 0,
        },
      ],
      kind: '',
      rowSpan: 0,
      columnSpan: 0,
      boundingRegions: [
        {
          pageNumber: 0,
          polygon: [
            {
              x: 0,
              y: 0,
            },
          ],
        },
      ],
    },
  ],
  columnCount: 0,
  rowCount: 0,
  spans: [
    {
      length: 0,
      offset: 0,
    },
  ],
  boundingRegions: [
    {
      pageNumber: 0,
      polygon: [
        {
          x: 0,
          y: 0,
        },
      ],
    },
  ],
};

const NOT_IMPLEMENT = 'not implement';

const mockPoller = {
  poll: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  onProgress: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  isDone: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  stopPolling: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  isStopped: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  cancelOperation: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  getOperationState: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  getResult: () => {
    throw new Error(NOT_IMPLEMENT);
  },
  pollUntilDone: jest.fn().mockResolvedValue({
    apiVersion: '2022-08-31',
    content: 'asdasd',
    modelId: 'mock-model-ID',
    documents: [mockAnalyzedDocument],
    tables: [mockDocumentTable],
  }),
};

const mockBeginAnalyzeDocumentFromUrl = jest.fn().mockResolvedValue(mockPoller);
const mockBeginAnalyzeDocument = jest.fn().mockResolvedValue(mockPoller);

jest.mock('@azure/ai-form-recognizer', () => ({
  ...jest.requireActual<object>('@azure/ai-form-recognizer'),
  DocumentAnalysisClient: jest.fn().mockImplementation(() => ({
    beginAnalyzeDocumentFromUrl: mockBeginAnalyzeDocumentFromUrl,
    beginAnalyzeDocument: mockBeginAnalyzeDocument,
  })),
  AzureKeyCredential: jest.fn().mockImplementation(() => ({ API: mockAPIKey })),
}));

describe('FormRecognizerService', () => {
  let service: FormRecognizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormRecognizerService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return { getOrThrow: mockGetOrThrow };
        }
        return {};
      })
      .compile();

    service = module.get<FormRecognizerService>(FormRecognizerService);
  });

  it('should recognizer document from FILE', async () => {
    jest.mocked(mockGetOrThrow).mockReturnValueOnce(mockAPIKey);
    jest.mocked(mockGetOrThrow).mockReturnValueOnce(mockEndpoint);
    jest.mocked(mockGetOrThrow).mockReturnValueOnce(mockModelID);
    jest.spyOn(service, 'extractTagData');
    jest.spyOn(service, 'createClient');

    const mockModelName = 'mock-model-name';
    const mockFile: Express.Multer.File = {
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

    await service.recognizerFromFile(mockModelName, mockFile);

    expect(AzureKeyCredential).toBeCalledWith(mockAPIKey);
    expect(DocumentAnalysisClient).toBeCalledWith(mockEndpoint, {
      API: mockAPIKey,
    });
    expect(mockBeginAnalyzeDocument).toBeCalledWith(
      mockModelID,
      mockFile.buffer,
    );
    expect(mockPoller.pollUntilDone).toBeCalled();
    expect(service.createClient).toBeCalledWith(mockModelName);
    expect(service.extractTagData).toBeCalledWith(
      [mockAnalyzedDocument],
      [mockDocumentTable],
    );
  });

  it('should recognizer document from URL', async () => {
    jest.mocked(mockGetOrThrow).mockReturnValueOnce(mockAPIKey);
    jest.mocked(mockGetOrThrow).mockReturnValueOnce(mockEndpoint);
    jest.mocked(mockGetOrThrow).mockReturnValueOnce(mockModelID);
    jest.spyOn(service, 'extractTagData');
    jest.spyOn(service, 'createClient');

    const mockModelName = 'mock-model-name';
    const mockDocumentURL = 'mock-document-URL';

    await service.recognizerFromURL(mockModelName, mockDocumentURL);

    expect(AzureKeyCredential).toBeCalledWith(mockAPIKey);
    expect(DocumentAnalysisClient).toBeCalledWith(mockEndpoint, {
      API: mockAPIKey,
    });
    expect(mockBeginAnalyzeDocumentFromUrl).toBeCalledWith(
      mockModelID,
      mockDocumentURL,
    );
    expect(mockPoller.pollUntilDone).toBeCalled();
    expect(service.createClient).toBeCalledWith(mockModelName);
    expect(service.extractTagData).toBeCalledWith(
      [mockAnalyzedDocument],
      [mockDocumentTable],
    );
  });

  it('should parse extract tag data ', () => {
    const expectedExtractedTagData = {
      firstTagName: 'mock-first-tag-content',
      secondTagName: 'mock-second-tag-content',
      thirdTagName: 'mock-third-tag-content',
    };

    const expectedExtractedTableData = {
      cells: [
        {
          columnIndex: 0,
          content: '',
          rowIndex: 0,
          columnSpan: 0,
          rowSpan: 0,
          kind: '',
        },
      ],
      columnCount: 0,
      rowCount: 0,
      boundingRegions: [
        {
          pageNumber: 0,
          polygon: [
            {
              x: 0,
              y: 0,
            },
          ],
        },
      ],
    };

    expect(
      service.extractTagData([mockAnalyzedDocument], [mockDocumentTable]),
    ).toStrictEqual({
      documents: [expectedExtractedTagData],
      tables: [expectedExtractedTableData],
    });
  });
});
