import {read,utils} from './xlsx.mjs';
import {parseCSV,decodeCSV} from './engine.js';
export class PartsImportError extends Error {
 constructor(code){super(code);this.code=code;}
}
const aliases={part:new Set(['partno','partnumber','minthpartno','零件号','零件编号']),revision:new Set(['revision','rev','版本','版本号'])};
const normalizeHeader=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[\s_.\-:：]/g,'');
function validateHeaders(headers){
 const normalized=headers.map(normalizeHeader);
 const parts=[],revisions=[];
 normalized.forEach((name,index)=>{if(aliases.part.has(name))parts.push(index);if(aliases.revision.has(name))revisions.push(index);});
 if(parts.length!==1||revisions.length!==1)throw new PartsImportError('listHeaders');
 return [parts[0],revisions[0]];
}
export function openPartsFile(buffer,name){
 const ext=name.toLowerCase().split('.').pop();
 if(ext==='csv'){
  let data;
  try{data=parseCSV(decodeCSV(buffer));}catch{throw new PartsImportError('partsReadError');}
  const [p,r]=validateHeaders(data.headers);
  const rows=data.rows.map(row=>({PartNo:String(row[data.headers[p]]??'').trim(),Revision:String(row[data.headers[r]]??'').trim()})).filter(row=>row.PartNo);
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
