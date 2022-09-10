import { Model } from 'objection';

export class TakaroModel extends Model {
  id!: string;
  createdAt!: string;
  updatedAt!: string;

  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}
