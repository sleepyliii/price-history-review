import {REQUIRED} from './engine.js';
export function fixture(){
 const rows=[];
 function add(part,po,prices,extra={}){for(const [i,p]of prices.entries()){const r=Object.fromEntries(REQUIRED.map(k=>[k,'']));Object.assign(r,{PCN:'269388',Minth_Part_No:part,revision:'',customer_code:'Example',po_no:po,po_key:po,part_key:part,po_line_key:po,price_key:po+'-'+i,PO_Date:'6/1/2025 12:00:00 AM',PO_Type_Key:'2500',PO_Type:'Blanket',Releases:'100',Price:p[0],Raw_Price:p[0],unit:'Ea',currency_code:'USD',effective_date:p[1],expiration_date:p[2]||'',Component_Count:'1',Component_Needs_Review:'0',customer_part_no:part,_line:rows.length+2},extra);rows.push(r);}}
 add('DEMO-A','P1',[['10','2025-01-01'],['12','2026-07-01','2026-09-30'],['12.5','2026-10-01']]);
 add('DEMO-B','P2',[['1.33','2023-07-01'],['1.32','2025-01-01'],['1.32','2026-07-01']]);
 return rows;
}
export const scope=[{PartNo:'DEMO-A',Revision:''},{PartNo:'DEMO-B',Revision:''}];
