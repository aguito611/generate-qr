import { Injectable } from '@nestjs/common';
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
  AnalyzedDocument,
  DocumentTable,
} from '@azure/ai-form-recognizer';
import { ConfigService } from '@nestjs/config';
import { GeneralPickedInformation } from 'src/types/GeneralPickedInformation';
import { TablePickedInformation } from 'src/types/TablePickedInformation';
import { DocumentPickedInformation } from 'src/types/DocumentPickedInformation';

@Injectable()
export class FormRecognizerService {
  private endpoint = '';
  private apiKey = '';
  private modelID = '';
  private client: DocumentAnalysisClient;

  constructor(private readonly configService: ConfigService) {}

  createClient(modelName: string): void {
    this.apiKey = this.configService.getOrThrow<string>(`${modelName}_API_KEY`);
    this.endpoint = this.configService.getOrThrow<string>(
      `${modelName}_ENDPOINT`,
    );
    this.modelID = this.configService.getOrThrow<string>(
      `${modelName}_MODEL_ID`,
    );

    const client = new DocumentAnalysisClient(
      this.endpoint,
      new AzureKeyCredential(this.apiKey),
    );

    this.client = client;
  }

  async recognizerFromFile(modelName: string, file: Express.Multer.File) {
    this.createClient(modelName);

    const poller = await this.client.beginAnalyzeDocument(
      this.modelID,
      file.buffer,
    );

    const { documents, tables } = await poller.pollUntilDone();

    return this.extractTagData(documents, tables);
  }

  async recognizerFromURL(modelName: string, documentURL: string) {
    this.createClient(modelName);

    const poller = await this.client.beginAnalyzeDocumentFromUrl(
      this.modelID,
      documentURL,
    );

    const { documents, tables } = await poller.pollUntilDone();

    return this.extractTagData(documents, tables);
  }

  extractTagData(
    documents?: AnalyzedDocument[],
    tables?: DocumentTable[],
  ): GeneralPickedInformation {
    const generalPickedInformation: GeneralPickedInformation = {
      documents: [],
      tables: [],
    };

    if (documents) {
      for (const document of documents) {
        const documentPicketInformation: DocumentPickedInformation = {};
        for (const [name, key] of Object.entries(document.fields)) {
          documentPicketInformation[name] = key.content;
        }
        generalPickedInformation.documents.push(documentPicketInformation);
      }
    }

    if (tables) {
      for (const table of tables) {
        const tablePickedInformation: TablePickedInformation = {
          columnCount: table.columnCount,
          rowCount: table.rowCount,
          cells: [],
          boundingRegions: table.boundingRegions,
        };
        for (const {
          content,
          columnIndex,
          rowIndex,
          columnSpan,
          rowSpan,
          kind,
        } of table.cells) {
          tablePickedInformation.cells.push({
            columnIndex,
            content,
            rowIndex,
            columnSpan,
            rowSpan,
            kind,
          });
        }
        generalPickedInformation.tables.push(tablePickedInformation);
      }
    }

    return generalPickedInformation;
  }
}
