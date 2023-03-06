import Objection, { Model } from 'objection';

export class NOT_DOMAIN_SCOPED_TakaroModel extends Model {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    this.createdAt = new Date();
  }

  $beforeUpdate() {
    this.updatedAt = new Date();
  }
}

export class TakaroModel extends NOT_DOMAIN_SCOPED_TakaroModel {
  domain: string;

  static get modifiers() {
    return {
      domainScoped(query: Objection.QueryBuilder<Model>, domainId: string) {
        const tableName = query.modelClass().tableName;
        query.where(`${tableName}.domain`, domainId);
      },
    };
  }
}
