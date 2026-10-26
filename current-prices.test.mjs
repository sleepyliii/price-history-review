import test from 'node:test';
import assert from 'node:assert/strict';
import {analyze,REQUIRED,REPORTS,SCHEMAS,toCSV,cell} from './engine.js';
import {fixture} from './fixture.mjs';
const headers=[...REQUIRED,'Price_Active','Ship_To_Key','Ship_To_Code','Ship_To_Releases','Ship_To_Active'];
function rows(){const rr=fixture().filter(r=>r.Minth_Part_No==='DEMO-A');rr[0].Price_Active='0';rr[0].expiration_date='2026-06-30';return rr;}
const run=(rr=rows(),start='2026-10-01',end='2026-10-21')=>analyze(rr,headers,[{PartNo:'DEMO-A',Revision:''}],start,end);
test('visible/exported report list replaces selection and processing tabs with current prices',()=>{assert.equal(REPORTS[0],'currentPrices');assert.ok(!REPORTS.includes('poSelection'));assert.ok(!REPORTS.includes('coverage'));assert.ok(REPORTS.includes('gmCurrent'));assert.ok(REPORTS.every(k=>SCHEMAS[k]));});
test('current PO price is resolved for a non-GM selected PO at period end',()=>{const r=run();assert.equal(r.currentPrices.length,1);assert.equal(r.currentPrices[0].price,'12.5');assert.equal(r.currentPrices[0].po,'P1');assert.equal(r.currentPrices[0].asOf,'2026-10-21');assert.equal(cell(r.currentPrices[0],'price'),'12.5000');});
test('future effective price is never selected as current',()=>{const rr=rows();rr.push({...rr[2],price_key:'future',Price:'15',Raw_Price:'15',effective_date:'2026-11-01'});assert.equal(run(rr).currentPrices[0].price,'12.5');});

test('current price includes the effective date of its source price',()=>{assert.equal(run().currentPrices[0].effective,'2026-10-01');assert.ok(SCHEMAS.currentPrices.includes('effective'));});

test('multiple different current prices do not choose a price and enter confirmation',()=>{const rr=rows();rr[0].Price_Active='1';rr[0].expiration_date='';const r=run(rr);assert.equal(r.currentPrices[0].price,'');assert.equal(r.currentPrices[0].status,'review');assert.equal(r.issues.filter(x=>x.code==='currentManyPrices').length,1);assert.equal(r.overlaps.length,1);});

test('missing end-date price after earlier valid price enters confirmation',()=>{const rr=rows();rr[2].expiration_date='2026-10-10';assert.equal(run(rr).issues.filter(x=>x.code==='currentNoPrice').length,1);});

test('invalid current dates do not duplicate an existing date issue',()=>{const rr=rows();rr[2].effective_date='';const r=run(rr);assert.equal(r.issues.filter(x=>['missingDate','currentInvalidPrice'].includes(x.code)).length,1);});
test('only the qualified latest PO contributes current rows',()=>{const rr=rows();rr.push(...rr.map(r=>({...r,po_no:'OLD',po_key:'OLD',po_line_key:'OLD',price_key:'OLD'+r.price_key,PO_Date:'1/1/2024'})));assert.deepEqual(run(rr).currentPrices.map(r=>r.po),['P1']);});
test('whole-period no-price POs are omitted but price history is retained',()=>{const rr=rows();rr.forEach(r=>r.Price_Active='0');const r=run(rr);assert.equal(r.currentPrices.length,0);assert.equal(r.history.length,3);});
test('earlier-period-only price remains visible with no invented end-date price',()=>{const rr=rows();rr[2].expiration_date='2026-10-10';const row=run(rr).currentPrices[0];assert.equal(row.status,'review');assert.equal(row.reason,'currentNoPrice');assert.equal(row.price,'');});
test('price valid on the end date is included with inclusive expiration',()=>{const rr=rows();rr[2].expiration_date='2026-10-21';assert.equal(run(rr).currentPrices[0].status,'complete');});
test('multiple equal current amounts after rounding remain one four-decimal price',()=>{const rr=rows();rr[2].Price=rr[2].Raw_Price='12.345641';rr.push({...rr[2],price_key:'other',Price:'12.345649',Raw_Price:'12.345649'});assert.equal(run(rr).currentPrices[0].price,'12.3456');});
test('current-price export is bilingual and retains price-key traceability',()=>{const csv=toCSV(run(),'currentPrices');assert.match(csv,/As-of date \/ 基准日/);assert.match(csv,/12\.5000/);assert.match(csv,/P1-2/);});
