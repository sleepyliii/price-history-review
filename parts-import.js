import {read,utils} from './xlsx.mjs';
import {parseCSV,decodeCSV} from './engine.js';
export class PartsImportError extends Error {
 constructor(code){super(code);this.code=code;}
}
function validateHeaders(headers){
 const p=headers.indexOf('PartNo'),r=headers.indexOf('Revision');
 if(p<0||r<0||headers.filter(x=>x==='PartNo').length!==1||headers.filter(x=>x==='Revision').length!==1)throw new PartsImportError('listHeaders');
 return [p,r];
}
export function openPartsFile(buffer,name){
 const ext=name.toLowerCase().split('.').pop();
 if(ext==='csv'){
  let data;
  try{data=parseCSV(decodeCSV(buffer));}catch{throw new PartsImportError('partsReadError');}
  validateHeaders(data.headers);
  const rows=data.rows.filter(r=>r.PartNo).map(r=>({PartNo:r.PartNo,Revision:r.Revision}));
  if(!rows.length)throw new PartsImportError('emptyParts');
  return {sheets:[],rows};
 }
 if(!['xlsx','xls'].includes(ext))throw new PartsImportError('partsFormat');
 try{
  const workbook=read(buffer,{type:'array',cellText:true,cellNF:true,cellDates:false,bookVBA:false,cellFormula:false});
  if(!workbook.SheetNames.length)throw new PartsImportError('emptyParts');
  return {sheets:workbook.SheetNames,workbook};
 }catch(error){if(error instanceof PartsImportError)throw error;throw new PartsImportError('partsReadError');}
}
export function readPartsSheet(workbook,name){
 if(!workbook.SheetNames.includes(name)||!workbook.Sheets[name])throw new PartsImportError('selectSheet');
 const values=utils.sheet_to_json(workbook.Sheets[name],{header:1,raw:false,defval:'',blankrows:false});
 if(!values.length)throw new PartsImportError('emptyParts');
 const headers=values[0].map(v=>String(v??'').trim());const [p,r]=validateHeaders(headers);
 const rows=values.slice(1).map(v=>({PartNo:String(v[p]??'').trim(),Revision:String(v[r]??'').trim()})).filter(v=>v.PartNo);
 if(!rows.length)throw new PartsImportError('emptyParts');
 return rows;
}
