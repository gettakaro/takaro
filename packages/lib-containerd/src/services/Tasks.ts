import type { } from '@grpc/grpc-js';
import path from 'path';
import { CheckpointTaskRequest } from '../generated/types/containerd/services/tasks/v1/CheckpointTaskRequest';
import { CloseIORequest } from '../generated/types/containerd/services/tasks/v1/CloseIORequest';
import { CreateTaskRequest } from '../generated/types/containerd/services/tasks/v1/CreateTaskRequest';
import { DeleteProcessRequest } from '../generated/types/containerd/services/tasks/v1/DeleteProcessRequest';
import { DeleteTaskRequest } from '../generated/types/containerd/services/tasks/v1/DeleteTaskRequest';
import { ExecProcessRequest } from '../generated/types/containerd/services/tasks/v1/ExecProcessRequest';
import { GetRequest } from '../generated/types/containerd/services/tasks/v1/GetRequest';
import { KillRequest } from '../generated/types/containerd/services/tasks/v1/KillRequest';
import { ListPidsRequest } from '../generated/types/containerd/services/tasks/v1/ListPidsRequest';
import { ListTasksRequest } from '../generated/types/containerd/services/tasks/v1/ListTasksRequest';
import { MetricsRequest } from '../generated/types/containerd/services/tasks/v1/MetricsRequest';
import { PauseTaskRequest } from '../generated/types/containerd/services/tasks/v1/PauseTaskRequest';
import { ResizePtyRequest } from '../generated/types/containerd/services/tasks/v1/ResizePtyRequest';
import { ResumeTaskRequest } from '../generated/types/containerd/services/tasks/v1/ResumeTaskRequest';
import { StartRequest } from '../generated/types/containerd/services/tasks/v1/StartRequest';
import { TasksClient } from '../generated/types/containerd/services/tasks/v1/Tasks';
import { UpdateTaskRequest } from '../generated/types/containerd/services/tasks/v1/UpdateTaskRequest';
import { WaitRequest } from '../generated/types/containerd/services/tasks/v1/WaitRequest';
import { ProtoGrpcType } from '../generated/types/tasks';
import { BaseService } from './Service';

function getClientConstructor(proto: ProtoGrpcType) {
  return proto.containerd.services.tasks.v1.Tasks;
}

export class TasksService extends BaseService<ProtoGrpcType, TasksClient> {
  constructor(address: string, namespace: string) {
    super(
      address,
      namespace,
      path.join(__dirname, '../../proto/github.com/containerd/containerd/api/services/tasks/v1/tasks.proto'),
      getClientConstructor,
    );
  }

  async checkpoint(request: CheckpointTaskRequest) {
    return this.call('checkpoint', request);
  }

  async closeIO(request: CloseIORequest) {
    return this.call('closeIo', request);
  }

  async create(request: CreateTaskRequest) {
    return this.call('create', request);
  }

  async delete(request: DeleteTaskRequest) {
    return this.call('delete', request);
  }

  async deleteProcess(request: DeleteProcessRequest) {
    return this.call('deleteProcess', request);
  }

  async exec(request: ExecProcessRequest) {
    return this.call('exec', request);
  }

  async get(request: GetRequest) {
    return this.call('get', request);
  }

  async kill(request: KillRequest) {
    return this.call('kill', request);
  }

  async list(request: ListTasksRequest) {
    return this.call('list', request);
  }

  async listPids(request: ListPidsRequest) {
    return this.call('listPids', request);
  }

  async metrics(request: MetricsRequest) {
    return this.call('metrics', request);
  }

  async pause(request: PauseTaskRequest) {
    return this.call('pause', request);
  }

  async resizePty(request: ResizePtyRequest) {
    return this.call('resizePty', request);
  }

  async resume(request: ResumeTaskRequest) {
    return this.call('resume', request);
  }

  async start(request: StartRequest) {
    return this.call('start', request);
  }

  async update(request: UpdateTaskRequest) {
    return this.call('update', request);
  }

  async wait(request: WaitRequest) {
    return this.call('wait', request);
  }
}