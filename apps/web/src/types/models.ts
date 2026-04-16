export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface BoardSummary {
  id: string;
  title: string;
  updatedAt: string;
  _count: { columns: number };
}

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  order: number;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface BoardDetail {
  id: string;
  title: string;
  columns: Column[];
}
