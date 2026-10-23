import {openPartsFile,readPartsSheet} from './parts-import.js';
let workbook=null;
self.onmessage=({data})=>{
 try{
  if(data.action==='open'){
   const opened=openPartsFile(data.buffer,data.name);workbook=opened.workbook||null;
   if(opened.rows)self.postMessage({rows:opened.rows,sheets:[]});
   else if(opened.sheets.length===1)self.postMessage({rows:readPartsSheet(workbook,opened.sheets[0]),sheets:opened.sheets,sheet:opened.sheets[0]});
   else self.postMessage({sheets:opened.sheets});
  }else if(data.action==='sheet')self.postMessage({rows:readPartsSheet(workbook,data.name),sheet:data.name});
 }catch(error){self.postMessage({error:error.code||'partsReadError'});}
};
