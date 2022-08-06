import { Controller, Get } from 'routing-controllers';

@Controller()
export class MetaController {
  @Get('/healthz')
  getHealth() {
    return 'OK!';
  }
}
