import Objection, { Model } from 'objection';

export class NOT_DOMAIN_SCOPED_TakaroModel extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;

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

export class TakaroModel extends NOT_DOMAIN_SCOPED_TakaroModel {
  domain: string;

  static get modifiers() {
    return {
      domainScoped(query: Objection.QueryBuilder<Model>, domainId: string) {
        const tableName = query.modelClass().tableName;
        if (!domainId) throw new Error('Domain ID is required for domainScoped modifier');
        query.where(`${tableName}.domain`, domainId);
      },
    };
  }
}
