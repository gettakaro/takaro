import type { } from '@grpc/grpc-js';
import path from 'path';
import { ContainersClient } from '../generated/types/containerd/services/containers/v1/Containers';
import { CreateContainerRequest } from '../generated/types/containerd/services/containers/v1/CreateContainerRequest';
import { DeleteContainerRequest } from '../generated/types/containerd/services/containers/v1/DeleteContainerRequest';
import { GetContainerRequest } from '../generated/types/containerd/services/containers/v1/GetContainerRequest';
import { ListContainersRequest } from '../generated/types/containerd/services/containers/v1/ListContainersRequest';
import { UpdateContainerRequest } from '../generated/types/containerd/services/containers/v1/UpdateContainerRequest';
import { ProtoGrpcType } from '../generated/types/containers';
import { BaseService } from './Service';

function getClientConstructor(proto: ProtoGrpcType) {
  return proto.containerd.services.containers.v1.Containers;
}

export class ContainersService extends BaseService<ProtoGrpcType, ContainersClient> {
  constructor(address: string, namespace: string) {
    super(
      address,
      namespace,
      path.join(__dirname, '../../proto/github.com/containerd/containerd/api/services/containers/v1/containers.proto'),
      getClientConstructor,
    );
  }

  async create(request: CreateContainerRequest) {
    return this.call('create', request);
  }

  async delete(request: DeleteContainerRequest) {
    return this.call('delete', request);
  }

  async get(request: GetContainerRequest) {
    return this.call('get', request);
  }

  async list(request: ListContainersRequest) {
    return this.call('list', request);
  }

  async listStream(request: ListContainersRequest) {
    const client = await this.getClient();
    return client.listStream(request);
  }

  async update(request: UpdateContainerRequest) {
    return this.call('update', request);
  }
}