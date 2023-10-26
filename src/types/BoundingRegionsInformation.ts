import { Point2D } from '@azure/ai-form-recognizer';

export interface BoundingRegionsInformation {
  pageNumber: number;
  polygon?: Point2D[];
}
