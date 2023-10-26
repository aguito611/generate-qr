import { CellPickedInformation } from './CellPickedInformation';
import { BoundingRegionsInformation } from './BoundingRegionsInformation';

export interface TablePickedInformation {
  rowCount: number;
  columnCount: number;
  cells: CellPickedInformation[];
  boundingRegions: BoundingRegionsInformation[];
}
