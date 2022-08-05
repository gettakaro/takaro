import { Controller, Get } from 'routing-controllers';

@Controller()
export class MetaController {
  @Get('/health')
  getHealth() {
    return 'OK!';
  }
}
