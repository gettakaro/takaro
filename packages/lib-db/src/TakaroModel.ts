import Objection, { Model } from 'objection';

export class TakaroModel extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  domain: string;

  static get idColumn() {
    return 'id';
  }

  static get modifiers() {
    return {
      domainScoped(query: Objection.QueryBuilder<Model>, domainId: string) {
        const tableName = query.modelClass().tableName;
        query.where(`${tableName}.domain`, domainId);
      },
    };
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}
