import { setup } from '../test/CafienneSetup';


export const mochaHooks : Mocha.RootHookObject = {
  beforeAll() {
    setup();
  }
}
