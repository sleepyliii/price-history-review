import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {read,write,utils} from './xlsx.mjs';
import {openPartsFile,readPartsSheet} from './parts-import.js';
const scope=[{PartNo:'DEMO-A',Revision:''},{PartNo:'DEMO-B',Revision:'03'}];
function book(rows=[['PartNo','Revision'],['DEMO-A',''],['DEMO-B','03']],name='Parts'){
 const wb=utils.book_new();utils.book_append_sheet(wb,utils.aoa_to_sheet(rows),name);return wb;
}
const data=(wb,type='xlsx')=>write(wb,{bookType:type,type:'array'});
test('common bilingual aliases, case and separators are recognized',()=>{for(const headers of [['Part No.','Rev'],['Part No','Part Revision'],['Part No','Part Rev'],['Part No','PART_REVISION'],['PART_NUMBER','REVISION'],['零件号','版本'],['Minth Part No','版本号'],['ＰａｒｔＮｏ','Ｒｅｖ']]){const x=openPartsFile(data(book([headers,['DEMO-A',''],['DEMO-B','03']])),'parts.xlsx');assert.deepEqual(readPartsSheet(x.workbook,'Parts'),scope);}});
test('CSV aliases work with reordered columns',()=>{const buffer=new TextEncoder().encode('Rev,Notes,Part No.\r\n,note,DEMO-A\r\n03,note,DEMO-B\r\n').buffer;assert.deepEqual(openPartsFile(buffer,'parts.csv').rows,scope);});
test('ambiguous aliases and unrelated customer part columns are not guessed',()=>{for(const headers of [['PartNo','Rev','Revision'],['PartNo','Part Number','Rev'],['Customer Part No','Rev']]){const x=openPartsFile(data(book([headers,['A','','']])),'parts.xlsx');assert.throws(()=>readPartsSheet(x.workbook,'Parts'),e=>e.code==='listHeaders');}});
test('xlsx imports text identifiers and explicit blank revisions',()=>{const x=openPartsFile(data(book()),'parts.xlsx');assert.deepEqual(x.sheets,['Parts']);assert.deepEqual(readPartsSheet(x.workbook,'Parts'),scope);});
test('legacy Excel .xls imports the same list',()=>{const x=openPartsFile(data(book(),'biff8'),'parts.xls');assert.deepEqual(readPartsSheet(x.workbook,'Parts'),scope);});
test('displayed number formats preserve leading zeros',()=>{const wb=book([['PartNo','Revision'],[123,3]]);wb.Sheets.Parts.A2.z='000000';wb.Sheets.Parts.B2.z='00';const x=openPartsFile(data(wb),'parts.xlsx');assert.deepEqual(readPartsSheet(x.workbook,'Parts'),[{PartNo:'000123',Revision:'03'}]);});
test('multiple worksheets are returned without silently choosing one',()=>{const wb=book();utils.book_append_sheet(wb,utils.aoa_to_sheet([['PartNo','Revision'],['OTHER','02']]),'Other');const x=openPartsFile(data(wb),'multi.xlsx');assert.deepEqual(x.sheets,['Parts','Other']);assert.equal(x.rows,undefined);assert.deepEqual(readPartsSheet(x.workbook,'Other'),[{PartNo:'OTHER',Revision:'02'}]);});
test('missing Revision header requires correction',()=>{const x=openPartsFile(data(book([['PartNo'],['DEMO-A']])),'parts.xlsx');assert.throws(()=>readPartsSheet(x.workbook,'Parts'),e=>e.code==='listHeaders');});
test('duplicate required headers are rejected',()=>{const x=openPartsFile(data(book([['PartNo','Revision','Revision'],['A','','']])),'parts.xlsx');assert.throws(()=>readPartsSheet(x.workbook,'Parts'),e=>e.code==='listHeaders');});
test('blank rows are ignored and headers can have surrounding spaces',()=>{const x=openPartsFile(data(book([[' PartNo ',' Revision '],[],['DEMO-A',''],['',''],['DEMO-B','03']])),'parts.XLSX');assert.deepEqual(readPartsSheet(x.workbook,'Parts'),scope);});
test('CSV remains supported, including BOM and blank revision',()=>{const buffer=new TextEncoder().encode('\uFEFFPartNo,Revision\r\nDEMO-A,\r\nDEMO-B,03\r\n').buffer;assert.deepEqual(openPartsFile(buffer,'parts.csv').rows,scope);});
test('unsupported extensions and empty sheets report a clear error',()=>{assert.throws(()=>openPartsFile(new Uint8Array(),'parts.pdf'),e=>e.code==='partsFormat');const x=openPartsFile(data(book([['PartNo','Revision']])),'parts.xlsx');assert.throws(()=>readPartsSheet(x.workbook,'Parts'),e=>e.code==='emptyParts');});
test('create fictional browser fixtures when requested',async()=>{if(!process.env.PARTS_FIXTURE_DIR)return;const dir=process.env.PARTS_FIXTURE_DIR;await fs.mkdir(dir,{recursive:true});const wb=book([['PartNo','Revision'],['DEMO-A',''],['DEMO-B','']]);utils.book_append_sheet(wb,utils.aoa_to_sheet([['PartNo','Revision'],['DEMO-A','03']]),'Revision03');await fs.writeFile(dir+'/parts-test.xlsx',new Uint8Array(data(wb)));await fs.writeFile(dir+'/parts-test.xls',new Uint8Array(data(book([['PartNo','Revision'],['DEMO-A',''],['DEMO-B','']]),'biff8')));});

