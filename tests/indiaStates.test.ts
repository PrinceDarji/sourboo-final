import test from 'node:test';
import assert from 'node:assert/strict';
import {getIndiaStateCode, requireIndiaStateCode, INDIA_STATES} from '../src/lib/address/indiaStates';

test('regression: Andhra Pradesh uses Zoho AD, including the failed order spelling', () => {
  for (const value of ['Andhra pradesh','ANDHRA PRADESH','AP','A.P.',' ap ', 'AD','IN-AP','37','AndhraPradesh']) {
    assert.equal(getIndiaStateCode(value),'AD',value);
  }
});
test('common abbreviations and legacy state names resolve consistently', () => {
  for (const [input,expected] of [['M.H.','MH'],['U P','UP'],['TG','TS'],['Orissa','OD'],['Uttaranchal','UK'],['Jammu & Kashmir','JK'],['Chattisgarh','CG'],['07','DL'],['Pondicherry','PY']]) {
    assert.equal(getIndiaStateCode(input),expected,input);
  }
});
test('unknown states never silently become another tax jurisdiction', () => {
  for (const value of ['XX','NCR','AP typo','99','28','',null,{},'Maharash','constructor','__proto__']) {
    assert.equal(getIndiaStateCode(value),undefined);
    assert.throws(()=>requireIndiaStateCode(value));
  }
});
test('checkout includes all 36 states and union territories and round-trips every option', () => {
  assert.equal(INDIA_STATES.length,36);
  assert.equal(new Set(INDIA_STATES.map(s=>s.code)).size,36);
  for (const state of INDIA_STATES) assert.equal(requireIndiaStateCode(state.name),state.code);
});
