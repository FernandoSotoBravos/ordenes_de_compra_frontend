export interface ConceptSelect {
  id: number;
  name: string;
  segment_business: number;
}

export interface Concept {
  id: number;
  name: string;
  area: string;
  area_id: number;
  segment_business: string;
}

export interface createConcept {
  name: string;
  area_id: number;
  segment_business: string;
}

export interface updateConcept extends createConcept {}
