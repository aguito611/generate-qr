import { DocumentPickedInformation } from './DocumentPickedInformation';
import { TablePickedInformation } from './TablePickedInformation';

export interface GeneralPickedInformation {
  documents: DocumentPickedInformation[];
  tables: TablePickedInformation[];
}
