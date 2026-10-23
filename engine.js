// Browser-local price review. No network requests or external dependencies.
export const VERSION = '3.0.0';
export const REQUIRED = ['PCN','Minth_Part_No','revision','customer_code','po_no','po_key','part_key','po_line_key','price_key','PO_Date','PO_Type_Key','PO_Type','Releases','Price','Raw_Price','unit','currency_code','effective_date','expiration_date','Component_Count','Component_Needs_Review','customer_part_no','customer_part_revision'];
export const messages = {
 selected:['Selected','选中'],excluded:['Excluded','排除'],review:['Needs confirmation','待确认'],paused:['Paused','暂停'],complete:['Completed','已完成'],partial:['Partial results; confirmation required','部分结果待确认'],
 eligible:['Blanket, Releases > 0 and latest PO date','Blanket、Releases > 0 且 PO 日期最新'],notBlanket:['Not Blanket','不是 Blanket'],noReleases:['Releases is not greater than zero','Releases 不大于零'],older:['A newer eligible PO exists','存在日期更新的合格 PO'],tie:['Latest eligible PO dates are tied; no automatic selection','最新合格 PO 日期并列，不自动选择'],
 missingScope:['Part / specified revision not found in export','导出中未找到指定零件及版本'],noPO:['No eligible Blanket PO with Releases > 0','没有 Blanket 且 Releases > 0 的合格 PO'],metadata:['Inconsistent selection fields within one PO line','同一 PO 明细的筛选字段不一致'],duplicate:['Duplicate price_key; confirmation required','price_key 重复，需要确认'],blocked:['PO selection paused because of an unresolved issue','因存在待确认事项，暂停 PO 选择'],
 unknownPCN:['Blanket mapping is not confirmed for this PCN','此 PCN 的 Blanket 类型映射尚未确认'],typeMismatch:['PO type key and label do not match','PO 类型键与标签不一致'],negativeReleases:['Negative Releases; confirmation required','Releases 为负数，需要确认'],invalidNumber:['Missing or invalid numeric value','数字缺失或无效'],badPODate:['Missing or invalid PO date','PO 日期缺失或无效'],
 missingDate:['Missing effective date; this comparison group is paused','缺少生效日期，暂停该比较组'],reverseDate:['Expiration precedes effective date; this comparison group is paused','失效日期早于生效日期，暂停该比较组'],badDate:['Invalid date or non-midnight price timestamp; confirmation required','日期无效或价格日期含非零时分秒，需要确认'],unknownUnit:['Unit has not been confirmed','单位尚未确认'],missingIdentity:['Currency or unit is missing','币种或单位缺失'],priceMismatch:['Price differs from Raw_Price; use the corrected SQL export','Price 与 Raw_Price 不一致，请使用售价修正版 SQL'],
 firstPrice:['No earlier price; cannot determine a price change','没有更早价格，无法判断是否调价'],ambiguousPrice:['Several prices on one effective date; no unique old/new pairing','同一生效日有多个不同售价，无法唯一配对旧价与新价'],comparison:['Compared with the most recent earlier effective-date price; overlaps are listed separately','对比更早最近生效日的售价；有效期重叠另列'],multiCustomers:['Eligible POs span multiple customers; confirmation required','合格 PO 涉及多个客户，需要确认'],
 missingHeaders:['Missing required CSV columns','CSV 缺少必需列'],malformedCSV:['Malformed CSV. Use the original Plex export','CSV 格式无效，请使用 Plex 原始导出'],emptyCSV:['The CSV contains no data','CSV 没有数据'],invalidScope:['Enter at least one part; every row must include a revision field (blank means blank revision)','请填写至少一个零件；每行需有版本字段，留空明确代表空白版本'],invalidPeriod:['Enter valid start and end dates, with start no later than end','请填写有效起止日期，开始日期不能晚于结束日期'],
};
export function message(code,details='',lang='en') { const m=messages[code]||[code,code]; return m[lang==='zh'?1:0]+(details?' · '+details:''); }
export function bilingual(code,details='') { return message(code,details,'en')+' / '+message(code,details,'zh'); }
function fail(code,details='') { throw new Error(JSON.stringify({code,details})); }
export function parseCSV(text) {
 text=text.replace(/^\uFEFF/,''); const all=[]; let row=[],value='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++) {
  const c=text[i];
  if(quoted) { if(c==='"') { if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;} }else value+=c; continue; }
  if(c==='"') { if(value||closed)fail('malformedCSV');quoted=true;continue; }
  if(c===','||c==='\n'||c==='\r') {
   row.push(value);value='';closed=false;
   if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x!==''))all.push(row);row=[];}continue;
  }
  if(closed) { if(c===' '||c==='\t')continue;fail('malformedCSV'); }
  value+=c;
 }
 if(quoted)fail('malformedCSV');
 if(value!==''||closed||row.length){row.push(value);if(row.some(x=>x!==''))all.push(row);}
 if(!all.length)fail('emptyCSV');
 const headers=all.shift().map(x=>x.trim());
 if(new Set(headers).size!==headers.length)fail('malformedCSV','Duplicate headers');
 const rows=all.map((values,index)=>{
  if(values.length!==headers.length)fail('malformedCSV','CSV row '+(index+2));
  return Object.assign(Object.fromEntries(headers.map((h,j)=>[h,values[j].trim()])),{_line:index+2});
 });
 return {headers,rows};
}
export function decodeCSV(buffer) {
 const b=new Uint8Array(buffer);
 if(b[0]===255&&b[1]===254)return new TextDecoder('utf-16le').decode(buffer);
 if(b[0]===254&&b[1]===255)return new TextDecoder('utf-16be').decode(buffer);
 try{return new TextDecoder('utf-8',{fatal:true}).decode(buffer);}catch{return new TextDecoder('gb18030',{fatal:true}).decode(buffer);}
}
// Exact decimal arithmetic: no binary floating-point arithmetic on prices.
export function decimal(s) {
 if(!/^[+-]?\d+(\.\d+)?$/.test(String(s)))fail('invalidNumber',String(s));
 let sign='';s=String(s);if(s[0]==='-'){sign='-';s=s.slice(1);}else if(s[0]==='+')s=s.slice(1);
 let [whole,fraction='']=s.split('.'); whole=whole.replace(/^0+(?=\d)/,'');fraction=fraction.replace(/0+$/,'');
 if(whole==='0'&&!fraction)sign='';return sign+whole+(fraction?'.'+fraction:'');
}
function integerParts(s) {s=decimal(s);const scale=(s.split('.')[1]||'').length;return {n:BigInt(s.replace('.','')),scale};}
export function compare(a,b) {const x=integerParts(a),y=integerParts(b),n=Math.max(x.scale,y.scale);const z=x.n*10n**BigInt(n-x.scale)-y.n*10n**BigInt(n-y.scale);return z<0n?-1:z>0n?1:0;}
export function subtract(a,b) { const x=integerParts(a),y=integerParts(b),scale=Math.max(x.scale,y.scale);let n=x.n*10n**BigInt(scale-x.scale)-y.n*10n**BigInt(scale-y.scale);const negative=n<0n;if(negative)n=-n;let s=n.toString().padStart(scale+1,'0');if(scale)s=s.slice(0,-scale)+'.'+s.slice(-scale);return decimal((negative?'-':'')+s); }
export function parseDate(value,po=false) {
 if(!value)return null;
 let m=value.match(/^(\d{4})-(\d{2})-(\d{2})$/),y,mo,d;
 if(m){[,y,mo,d]=m.map(Number);}else{
  m=value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?: (\d{1,2}):(\d{2}):(\d{2}) (AM|PM))?$/);
  if(!m)fail(po?'badPODate':'badDate',value);
  mo=+m[1];d=+m[2];y=+m[3];if(y<100)y+=y<69?2000:1900;
  if(m[4]&&(+m[4]<1||+m[4]>12||+m[5]>59||+m[6]>59))fail(po?'badPODate':'badDate',value);
  if(!po&&m[4]&&!(m[4]==='12'&&m[5]==='00'&&m[6]==='00'&&m[7]==='AM'))fail('badDate',value);
 }
 const dt=new Date(Date.UTC(y,mo-1,d));
 if(y<1000||y>9998||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d)fail(po?'badPODate':'badDate',value);
 return Math.floor(dt.getTime()/86400000);
}
export const iso=d=>new Date(d*86400000).toISOString().slice(0,10);
const key=(...x)=>JSON.stringify(x);
const groupBy=(rows,fn)=>{const map=new Map();for(const r of rows){const k=fn(r);if(!map.has(k))map.set(k,[]);map.get(k).push(r);}return map;};
const canonicalUnit=u=>u==='pcs'||u==='Ea'?'Ea':u;
function context(r){return {part:r.Minth_Part_No||'',revision:r.revision||'',pcn:r.PCN||'',partKey:r.part_key||'',customer:r.customer_code||'',po:r.po_no||'',poKey:r.po_key||'',lineKey:r.po_line_key||'',currency:r.currency_code||'',unit:canonicalUnit(r.unit||'')};}
const groupKey=r=>key(...Object.values(context(r)));
const sortedPrices=x=>[...x].sort(compare);
function errorInfo(e){try{return JSON.parse(e.message);}catch{return {code:'invalidNumber',details:String(e.message)};}}
export function overlapping(records,start,end){
 const events=new Map();const boundaries=new Set([start,end+1]);
 const event=(day,price,delta)=>{if(!events.has(day))events.set(day,new Map());const m=events.get(day);m.set(price,(m.get(price)||0)+delta);};
 for(const r of records){const a=Math.max(start,r.start),b=Math.min(end,r.end??end);if(a>b)continue;boundaries.add(a);boundaries.add(b+1);event(a,r.price,1);event(b+1,r.price,-1);}
 const days=[...boundaries].sort((a,b)=>a-b),active=new Map(),out=[];
 for(let i=0;i<days.length-1;i++){const day=days[i];for(const [p,n]of events.get(day)||[])active.set(p,(active.get(p)||0)+n);const prices=sortedPrices([...active].filter(([,n])=>n>0).map(([p])=>p));if(prices.length<2)continue;const last=out.at(-1);if(last&&last.end+1===day&&key(last.prices)===key(prices))last.end=days[i+1]-1;else out.push({start:day,end:days[i+1]-1,prices});}
 return out;
}
export function analyze(rows,headers,scope,startText,endText,sourceName='') {
 const missing=REQUIRED.filter(x=>!headers.includes(x));if(missing.length)fail('missingHeaders',missing.join(', '));
 let start,end;try{start=parseDate(startText);end=parseDate(endText);}catch{fail('invalidPeriod');}
 if(start===null||end===null||start>end)fail('invalidPeriod');
 if(!scope.length||scope.some(s=>!s.PartNo||!Object.hasOwn(s,'Revision')))fail('invalidScope');
 scope=[...new Map(scope.map(s=>[key(s.PartNo.trim(),s.Revision.trim()),{PartNo:s.PartNo.trim(),Revision:s.Revision.trim()}])).values()];
 const scopeSet=new Set(scope.map(s=>key(s.PartNo,s.Revision)));
 const matched=rows.filter(r=>scopeSet.has(key(r.Minth_Part_No,r.revision)));
 const report={poSelection:[],priceChanges:[],overlaps:[],coverage:[],issues:[],history:[]};
 const issue=(r,code,details='')=>report.issues.push({...context(r),priceKey:r.price_key||'',sourceRow:r._line||'',code,details});
 for(const s of scope)if(!matched.some(r=>r.Minth_Part_No===s.PartNo&&r.revision===s.Revision))issue({Minth_Part_No:s.PartNo,revision:s.Revision},'missingScope');
 const blocked=new Set();
 for(const rr of groupBy(matched,r=>key(r.PCN,r.price_key)).values())if(rr.length>1)for(const r of rr){blocked.add(key(r.PCN,r.part_key));issue(r,'duplicate');}
 const selected=[];
 for(const [pk,pr]of groupBy(matched,r=>key(r.PCN,r.part_key))){
  const candidates=[];let block=blocked.has(pk);
  for(const rr of groupBy(pr,r=>r.po_line_key).values()){
   const r=rr[0],item={...context(r),poDate:r.PO_Date,type:r.PO_Type,releases:r.Releases,status:'excluded',reason:'',details:''};report.poSelection.push(item);
   const meta=['po_key','PO_Date','PO_Type_Key','PO_Type','Releases','customer_code','Minth_Part_No','revision'];
   if(meta.some(f=>new Set(rr.map(x=>x[f])).size>1)){issue(r,'metadata');block=true;item.status='review';item.reason='metadata';continue;}
   try{
    const rel=decimal(r.Releases);if(compare(rel,'0')<0)fail('negativeReleases');
    if(r.PCN!=='269388')fail('unknownPCN',r.PCN);
    if(r.PO_Type!==(r.PO_Type_Key==='2500'?'Blanket':'Other'))fail('typeMismatch');
    const reasons=[];if(r.PO_Type!=='Blanket')reasons.push('notBlanket');if(compare(rel,'0')<=0)reasons.push('noReleases');
    if(reasons.length){item.reason=reasons.join('|');continue;}
    const day=parseDate(r.PO_Date,true);if(day===null)fail('badPODate');item.poDate=iso(day);candidates.push({day,item,rr});
   }catch(e){const x=errorInfo(e);issue(r,x.code,x.details);block=true;item.status='review';item.reason=x.code;item.details=x.details||'';}
  }
  if(new Set(candidates.map(x=>x.item.customer)).size>1){block=true;issue(pr[0],'multiCustomers');}
  if(block){for(const x of candidates){x.item.status='paused';x.item.reason='blocked';}}
  else if(!candidates.length)issue(pr[0],'noPO');
  else{
   const latest=Math.max(...candidates.map(x=>x.day)),winners=candidates.filter(x=>x.day===latest);
   for(const x of candidates){if(x.day<latest)x.item.reason='older';else if(winners.length>1){x.item.status='review';x.item.reason='tie';}else{x.item.status='selected';x.item.reason='eligible';selected.push(...x.rr);}}
   if(winners.length>1)issue(pr[0],'tie');
  }
 }
 const blockedDates=new Set();
 for(const r of selected){try{const a=parseDate(r.effective_date),b=parseDate(r.expiration_date);if(a===null||(b!==null&&b<a))blockedDates.add(groupKey(r));}catch{blockedDates.add(groupKey(r));}}
 for(const rr of groupBy(selected,r=>key(groupKey(r),r.customer_part_no,r.customer_part_revision)).values()){
  const first=rr[0],base=context(first);let invalid=blockedDates.has(groupKey(first));const dedup=new Map();
  for(const r of rr){
   report.history.push({...context(r),customerPart:r.customer_part_no,customerRevision:r.customer_part_revision,priceKey:r.price_key,price:r.Price,originalUnit:r.unit,effective:r.effective_date,expiration:r.expiration_date,componentCount:r.Component_Count,componentReview:r.Component_Needs_Review,sourceRow:r._line});
   try{
    if(!r.currency_code||!r.unit)fail('missingIdentity');if(!['pcs','Ea'].includes(r.unit))fail('unknownUnit',r.unit);
    const price=decimal(r.Price);if(compare(price,decimal(r.Raw_Price))!==0)fail('priceMismatch');
    const a=parseDate(r.effective_date),b=parseDate(r.expiration_date);if(a===null)fail('missingDate');if(b!==null&&b<a)fail('reverseDate');dedup.set(key(price,a,b),{price,start:a,end:b});
   }catch(e){invalid=true;const x=errorInfo(e);issue(r,x.code,x.details);}
  }
  const rec=[...dedup.values()],coverage={...base,status:invalid?'paused':'complete',rawRows:rr.length,intervals:rec.length,changeCount:'',overlapCount:''};
  if(!invalid){
   const batches=groupBy(rec,r=>r.start);let previous=null,pending=false;const oldChanges=report.priceChanges.length,oldOverlaps=report.overlaps.length;
   for(const day of [...batches.keys()].sort((a,b)=>a-b)){
    const prices=sortedPrices(new Set(batches.get(day).map(r=>r.price)));
    if(day>=start&&day<=end&&(previous===null||key(previous)!==key(prices))){
     if(previous===null){issue(first,'firstPrice',iso(day));pending=true;}
     else if(previous.length!==1||prices.length!==1){issue(first,'ambiguousPrice',iso(day));pending=true;}
     else report.priceChanges.push({...base,effective:iso(day),oldPrice:previous[0],newPrice:prices[0],difference:subtract(prices[0],previous[0]),note:'comparison'});
    }
    previous=prices;
   }
   for(const s of overlapping(rec,start,end))report.overlaps.push({...base,start:iso(s.start),end:iso(s.end),distinctCount:s.prices.length,prices:s.prices.join('; ')});
   coverage.changeCount=report.priceChanges.length-oldChanges;coverage.overlapCount=report.overlaps.length-oldOverlaps;if(pending)coverage.status='partial';
  }
  report.coverage.push(coverage);
 }
 report.summary={version:VERSION,source:sourceName,start:startText,end:endText,scope,sourceRows:rows.length,matchedRows:matched.length,selectedRows:selected.length,selectedLines:report.poSelection.filter(r=>r.status==='selected').length,changes:report.priceChanges.length,overlaps:report.overlaps.length,issues:report.issues.length};
 return report;
}
export const COLUMNS={part:['Part No.','零件号'],revision:['Revision','版本'],pcn:['PCN','PCN'],partKey:['Part key','零件键'],customer:['Customer','客户'],po:['PO','PO'],poKey:['PO key','PO键'],lineKey:['PO line key','PO明细键'],currency:['Currency','币种'],unit:['Comparison unit','比较单位'],poDate:['PO date','PO日期'],type:['PO type','PO类型'],releases:['Releases','Releases数量'],status:['Status','状态'],reason:['Reason','原因'],effective:['Effective date','生效日'],oldPrice:['Previous price','前序价格'],newPrice:['New price','新价格'],difference:['Difference','差额'],note:['Note','说明'],start:['Start date','开始日期'],end:['End date','结束日期'],distinctCount:['Distinct prices','不同售价数量'],prices:['Prices','售价列表'],rawRows:['Source price rows','原始价格行数'],intervals:['Analysis intervals','分析区间数'],changeCount:['Changes','调价事件数'],overlapCount:['Overlap intervals','重叠区间数'],priceKey:['Price key','价格键'],sourceRow:['CSV row','CSV行号'],code:['Issue','问题'],customerPart:['Customer part No.','客户零件号'],customerRevision:['Customer revision','客户版本'],price:['Price','售价'],originalUnit:['Original unit','原始单位'],expiration:['Expiration date','失效日'],componentCount:['Component count','组件数量'],componentReview:['Component review flag','组件核对标记']};
const BASE=['part','revision','customer','po','currency','unit','pcn','partKey','poKey','lineKey'];
const TRACE=['pcn','partKey','poKey','lineKey'];
export const SCHEMAS={poSelection:['part','revision','customer','po','poDate','type','releases','status','reason',...TRACE],priceChanges:['part','revision','customer','po','effective','oldPrice','newPrice','difference','currency','unit','note',...TRACE],overlaps:['part','revision','customer','po','start','end','distinctCount','prices','currency','unit',...TRACE],coverage:['part','revision','customer','po','status','rawRows','intervals','changeCount','overlapCount','currency','unit',...TRACE],issues:['part','revision','customer','po','code','priceKey','sourceRow','currency','unit',...TRACE],history:['part','revision','customer','po','price','effective','expiration','currency','originalUnit','customerPart','customerRevision','priceKey','sourceRow','unit','componentCount','componentReview',...TRACE]};
export function cell(row,field,lang='en',both=false){
 const v=row[field]??'';
 if(['status','reason','note','code'].includes(field)&&v){return String(v).split('|').map(c=>both?bilingual(c,row.details||''):message(c,row.details||'',lang)).join('; ');}
 return v;
}
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
export function toCSV(report,name){
 const columns=SCHEMAS[name];const safe=v=>typeof v==='string'&&/^[=+@]/.test(v)?"'"+v:v;
 return '\uFEFF'+[columns.map(k=>quote(COLUMNS[k][0]+' / '+COLUMNS[k][1])).join(','),...report[name].map(r=>columns.map(k=>quote(safe(cell(r,k,'en',true)))).join(','))].join('\r\n')+'\r\n';
}
