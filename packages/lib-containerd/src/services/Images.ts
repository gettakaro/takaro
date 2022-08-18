import type { } from '@grpc/grpc-js';
import path from 'path';
import { ProtoGrpcType } from '../generated/types/images';
import { BaseService } from './Service';
import { ImagesClient } from '../generated/types/containerd/services/images/v1/Images';
import { promisify } from 'util';
import { ListImagesRequest } from '../generated/types/containerd/services/images/v1/ListImagesRequest';
import { ListImagesResponse } from '../generated/types/containerd/services/images/v1/ListImagesResponse';
import { CreateImageRequest } from '../generated/types/containerd/services/images/v1/CreateImageRequest';
import { CreateImageResponse } from '../generated/types/containerd/services/images/v1/CreateImageResponse';
import { DeleteImageRequest } from '../generated/types/containerd/services/images/v1/DeleteImageRequest';
import { GetImageRequest } from '../generated/types/containerd/services/images/v1/GetImageRequest';
import { GetImageResponse } from '../generated/types/containerd/services/images/v1/GetImageResponse';
import { UpdateImageRequest } from '../generated/types/containerd/services/images/v1/UpdateImageRequest';
import { UpdateImageResponse } from '../generated/types/containerd/services/images/v1/UpdateImageResponse';

function getClientConstructor(proto: ProtoGrpcType) {
  return proto.containerd.services.images.v1.Images;
}

export class ImagesService extends BaseService<ProtoGrpcType, ImagesClient> {
  constructor(address: string, namespace: string) {
    super(
      address,
      namespace,
      path.join(__dirname, '../../proto/github.com/containerd/containerd/api/services/images/v1/images.proto'),
      getClientConstructor,
    );
  }

  async create(request: CreateImageRequest): Promise<CreateImageResponse> {
    return await this.call('create', request);
  }

  async delete(request: DeleteImageRequest): Promise<never> {
    return await this.call('delete', request);
  }

  async get(request: GetImageRequest): Promise<GetImageResponse> {
    return await this.call('get', request);
  }

  async list(request: ListImagesRequest): Promise<ListImagesResponse> {
    const resp = await this.call('list', request);
    return resp;
  }

  async update(request: UpdateImageRequest): Promise<UpdateImageResponse> {
    return await this.call('update', request);
  }

  async promisify(fn: keyof ImagesClient) {
    const client = await this.getClient();
    return promisify(client[fn].bind(client));
  }
}