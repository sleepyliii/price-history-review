import {utils,write} from './xlsx.mjs';
import {REPORTS,SCHEMAS,COLUMNS,cell,price4} from './engine.js?v=4.5';

export const SHEET_NAMES={currentPrices:'Current PO 当前价',priceChanges:'Price changes 售价变动',overlaps:'Overlaps 多个有效价',issues:'Needs confirmation 待确认',history:'Price history 价格明细',gmCurrent:'GM current 当前价',gmConsistency:'GM consistency 同价检查'};
const PRICE_FIELDS=new Set(['price','oldPrice','newPrice','commonPrice','difference']);
function value(row,field){
 const text=String(cell(row,field,'en',true));
 if(PRICE_FIELDS.has(field)&&text!==''&&Number.isFinite(Number(text))){
  const number=Number(text),significant=text.replace(/^-|\./g,'').replace(/^0+/,'').length;
  if(significant<=15&&price4(String(number))===price4(text))return {t:'n',v:number,z:'0.0000'};
 }
 // Identifiers and source values are explicit strings, including leading zeros and formula-like text.
 return {t:'s',v:text};
}
export function createReportWorkbook(report,names=REPORTS){
 const workbook=utils.book_new();
 for(const name of names){
  if(!REPORTS.includes(name))throw new Error('Unknown report: '+name);
  const columns=SCHEMAS[name],rows=report[name]||[];
  const data=[columns.map(k=>({t:'s',v:COLUMNS[k].join(' / ')})),...rows.map(r=>columns.map(k=>value(r,k)))];
  const sheet=utils.aoa_to_sheet(data);
  sheet['!cols']=columns.map((k,i)=>({wch:Math.min(60,Math.max(14,...data.slice(0,101).map(r=>String(r[i].v).length+2)))}));
  sheet['!autofilter']={ref:sheet['!ref']};
  utils.book_append_sheet(workbook,sheet,SHEET_NAMES[name]);
 }
 if(names.length>1){
  const summary=Object.entries(report.summary).map(([k,v])=>[k,typeof v==='object'?JSON.stringify(v):String(v??'')]);
  utils.book_append_sheet(workbook,utils.aoa_to_sheet([['Run summary / 运行摘要','Value / 值'],...summary]),'Run summary 运行摘要');
  workbook.Sheets['Run summary 运行摘要']['!cols']=[{wch:28},{wch:90}];
 }
 return workbook;
}
export function exportExcel(report,names=REPORTS){return write(createReportWorkbook(report,names),{bookType:'xlsx',type:'array',compression:true});}
