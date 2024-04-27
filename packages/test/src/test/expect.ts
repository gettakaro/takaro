import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(deepEqualInAnyOrder);

export const expect = chai.expect;
