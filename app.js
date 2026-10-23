import {REQUIRED,SCHEMAS,COLUMNS,message,cell,parseCSV,toCSV} from './engine.js?v=3.4';
import {zipFiles} from './zip.js';
const $=id=>document.getElementById(id);
const labels={
 showAll:['Show all','展开全部'],collapseScope:['Collapse','收起'],
 worksheet:['Worksheet','工作表'],selectSheet:['Select a worksheet','请选择工作表'],partsLoading:['Reading part list…','正在读取零件清单…'],partsFormat:['Supported part lists: .xlsx, .xls and .csv.','零件清单支持 .xlsx、.xls 和 .csv。'],partsReadError:['Could not read this list. Check that the file is valid and not password-protected. The current list was not changed.','无法读取清单，请检查文件是否有效、是否受密码保护。原清单未更改。'],emptyParts:['The selected sheet contains no part rows. The current list was not changed.','所选工作表没有零件记录，原清单未更改。'],
 downloadSQL:['Download SQL','下载 SQL'],
 brand:['Customer Price Review','客户售价检查'],brandSub:['Plex CSV workspace','Plex CSV 检查工作台'],local:['Processed on your device','在本机浏览器处理'],eyebrow:['DAILY PRICE CHECK','每日售价检查'],title:['Customer Price Review','客户售价检查'],subtitle:['Select a period, import the customer price export and a part list, then review selling-price details, changes and overlaps.','选择检查期间，导入客户价格底表和待检查零件清单，检查售价明细、价格变动及重叠区间。'],demo:['Load example','加载示例'],inputTitle:['Check settings','检查设置'],exportLabel:['Customer price data (CSV)','客户价格底表（CSV）'],chooseFile:['Choose CSV or drop here','选择或拖入 CSV'],corrected:['Use the corrected price-history SQL export.','请使用售价修正版 SQL 的导出文件。'],privacy:['Your CSV stays in this browser. It is not uploaded or saved on a server.','CSV 仅在当前浏览器中处理，不上传、不保存在服务器。'],scope:['Parts to check','待检查零件清单'],importParts:['Import Excel / CSV','导入 Excel / CSV'],part:['Part No.','零件号'],revision:['Revision','版本'],remove:['Remove','删除'],addPart:['+ Add a part','+ 添加零件'],blankRevision:['Empty Revision matches the blank version only.','版本留空仅匹配系统空白版本。'],start:['Start date','开始日期'],end:['End date','结束日期'],run:['Run price check','开始检查'],running:['Checking…','检查中…'],rules:['Review rules','检查规则'],rulePO:['Blanket with Releases > 0; select the latest PO date.','筛选 Blanket 且 Releases > 0，选择最新 PO 日期。'],ruleTie:['Compare calendar dates only. Tied latest POs require confirmation.','PO 日期只比较年月日；最新日期并列时需要确认。'],rulePrice:['Price comes directly from PR.Price. Component counts do not multiply the price.','售价直接取 PR.Price，不按组件数量重复累加。'],ruleDates:['Only Active prices enter overlap checks. Expiration is inclusive; a blank expiration has no end date.','重叠检查仅纳入 Active 价格；失效日当天有效，失效日为空表示没有截止日期。'],ruleInvalid:['Missing effective dates or reversed date ranges pause the affected group.','缺少生效日或失效早于生效时，暂停受影响组。'],ruleUnit:['pcs and Ea are equivalent; other unconfirmed cases are listed for review.','pcs 与 Ea 视为相同单位；其他未确认情况单列待确认。'],resultsEyebrow:['REVIEW RESULTS','检查结果'],resultTitle:['Results','检查结果'],downloadAll:['Download reports (.zip)','下载全部报告 (.zip)'],emptyTitle:['No results yet','暂无检查结果'],emptyText:['Import price data and a part list, then run the check.','导入底表与零件清单后，点击“开始检查”。'],stepFile:['01 · Choose CSV','01 · 选择 CSV'],stepScope:['02 · Set scope','02 · 指定范围'],stepReview:['03 · Review results','03 · 查看结果'],downloadOne:['Download CSV','下载 CSV'],footnote:['Previous price means the most recent earlier effective-date price, not necessarily the unique executing price. Check the overlap report alongside price changes.','前序价格指更早最近生效日的售价，不一定是系统唯一执行价格。请结合重叠报告核对。'],footer:['Plex customer price review','Plex 客户售价检查'],
 poSelection:['PO selection','PO 筛选'],priceChanges:['Price changes','售价变动'],overlaps:['Overlapping prices','多个有效售价'],coverage:['Processing status','处理状态'],issues:['Needs confirmation','待确认'],history:['Price history','价格明细'],selectedLines:['Selected PO lines','选中 PO 明细'],changes:['Price changes','售价变动'],overlapCount:['Overlap intervals','重叠区间'],issueCount:['Needs confirmation','待确认'],reading:['Reading CSV on your device…','正在本机读取 CSV…'],analyzing:['Checking POs and price history…','正在检查 PO 与价格历史…'],done:['Completed','检查完成'],none:['No records in this report.','此报告没有记录。'],previous:['Previous','上一页'],next:['Next','下一页'],page:['Page','页'],of:['of','/'],records:['records','条记录'],rows:['rows','行'],demoLabel:['Fictional example','虚构样本'],notesPO:['All matched PO lines, including reasons for exclusion.','包含所有匹配 PO 明细及选中、排除的原因。'],notesPrice:['Any amount change is included. Previous prices follow effective-date order, including inactive history.','不设金额门槛；前序价格按生效日期顺序比较，保留 inactive 历史。'],notesOverlap:['Only currently Active prices are included. Distinct prices only; expiration dates are inclusive.','仅纳入当前 Active 的价格，按不同价格去重；失效日当天有效。'],notesCoverage:['Paused groups are not treated as zero changes or normal results.','暂停组不会被视为零调价或正常结果。'],notesIssues:['Items requiring confirmation.','需要确认的事项。'],notesHistory:['Original price keys and units are retained for tracing.','保留原始价格键、单位与 CSV 行号，方便追溯。'],listHeaders:['Could not identify unique part and revision columns. Use PartNo / Part No / 零件号 and Revision / Rev / Part Revision / Part Rev / 版本; remove duplicate matching columns. Blank Revision means the blank version.','首行需有唯一的零件号列（PartNo / Part No / 零件号）和版本列（Revision / Rev / Part Revision / Part Rev / 版本）；请检查缺失或重复列。版本值可留空。'],workerFailed:['The check could not run. Open the tool through its website or local HTTP server, not by double-clicking index.html.','无法运行检查。请通过网站链接或本地 HTTP 服务打开，不要直接双击 index.html。'],encodingError:['Could not read the file. Please choose the original Plex CSV export.','无法读取文件，请选择 Plex 原始导出 CSV。']
};
let lang='en',source=null,report=null,active='poSelection',page=0,worker=null,busy=false,errorState=null,progressKey='';
let partsWorker=null,partsPending=false,partsFilename='',scopeExpanded=false;
function renderScopeSummary(){const count=$('scope-rows').children.length;const folded=count>5&&!scopeExpanded;$('scope-rows').classList.toggle('is-collapsed',folded);$('scope-summary').hidden=count<=5;$('scope-count').textContent=lang==='zh'?'显示 '+(folded?5:count)+' / '+count+' 行':'Showing '+(folded?5:count)+' of '+count+' rows';$('toggle-scope').textContent=t(folded?'showAll':'collapseScope');$('toggle-scope').setAttribute('aria-expanded',String(!folded));}
const t=k=>labels[k]?.[lang==='zh'?1:0]||k;
function element(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function setError(e){errorState=e;$('error').hidden=!e;if(e)$('error').textContent=e.code?message(e.code,e.details||'',lang):t(e.label||'encodingError');}
function clearReport(){report=null;$('empty').hidden=false;$('report').hidden=true;$('stats').hidden=true;$('download-all').disabled=true;$('result-period').textContent='';progressKey='';$('progress').hidden=true;setError(null);}
function addRow(part='',revision=''){
 const row=document.createElement('tr');const partCell=document.createElement('td'),revCell=document.createElement('td'),remove=document.createElement('td');
 for(const [td,value,field]of [[partCell,part,'part'],[revCell,revision,'revision']]){const input=document.createElement('input');input.value=value;input.autocomplete='off';input.spellcheck=false;input.dataset.field=field;input.setAttribute('aria-label',t(field));input.addEventListener('input',clearReport);td.append(input);}
 const button=element('button','×','remove-row');button.type='button';button.setAttribute('aria-label',t('remove'));button.onclick=()=>{row.remove();clearReport();if(!$('scope-rows').children.length)addRow();renderScopeSummary();};remove.append(button);row.append(partCell,revCell,remove);$('scope-rows').append(row);renderScopeSummary();
}
function fileInfo(){const info=$('file-info');info.hidden=!source;if(source)info.textContent=source.demo?t('demoLabel'):source.name+' · '+(source.size/1024/1024).toFixed(1)+' MB';}
function setSource(file,demo=false){source=file;source.demo=demo;clearReport();fileInfo();}
function setLanguage(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.querySelectorAll('[data-i]').forEach(el=>{el.textContent=t(el.dataset.i);});$('language').textContent=lang==='en'?'中文':'English';$('language').setAttribute('aria-label',lang==='en'?'Switch to Chinese':'Switch to English');document.querySelectorAll('[data-field]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.field)));document.querySelectorAll('.remove-row').forEach(el=>el.setAttribute('aria-label',t('remove')));$('run').textContent=t(busy?'running':'run');if($('sheet-select').options[0]?.value==='')$('sheet-select').options[0].textContent=t('selectSheet');if(progressKey)$('progress').textContent=t(progressKey);fileInfo();setError(errorState);if(report)renderResults();renderScopeSummary();}
function scope(){return [...$('scope-rows').children].map(row=>({PartNo:row.querySelector('[data-field=part]').value.trim(),Revision:row.querySelector('[data-field=revision]').value.trim()})).filter(r=>r.PartNo);}
function lock(locked){busy=locked;for(const el of document.querySelectorAll('.inputs input,.inputs button,.inputs select,#demo'))el.disabled=locked;$('run').disabled=locked||partsPending;$('run').textContent=t(locked?'running':'run');}
function progress(key){progressKey=key;$('progress').hidden=false;$('progress').textContent=t(key);}
function run(){
 clearReport();if(partsPending){setError({label:'selectSheet'});return;}if(!source){setError({label:'chooseFile'});return;}const list=scope();if(!list.length){setError({code:'invalidScope'});return;}
 lock(true);progress('reading');
 source.arrayBuffer().then(buffer=>{
  worker?.terminate();worker=new Worker(new URL('./worker.js?v=3.4',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(data.stage)progress(data.stage);if(data.error){setError(data.error);progressKey='';$('progress').hidden=true;lock(false);worker.terminate();}if(data.report){report=data.report;active=report.issues.length?'issues':'poSelection';page=0;lock(false);progress('done');renderResults();worker.terminate();}};
  worker.onerror=()=>{setError({label:'workerFailed'});lock(false);$('progress').hidden=true;worker.terminate();};
  worker.postMessage({buffer,scope:list,start:$('start').value,end:$('end').value,source:source.name},[buffer]);
 }).catch(()=>{setError({label:'encodingError'});lock(false);$('progress').hidden=true;});
}
const tableNotes={poSelection:'notesPO',priceChanges:'notesPrice',overlaps:'notesOverlap',coverage:'notesCoverage',issues:'notesIssues',history:'notesHistory'};
function renderResults(){
 $('empty').hidden=true;$('report').hidden=false;$('stats').hidden=false;$('download-all').disabled=false;
 const s=report.summary;$('result-period').textContent=s.start+' — '+s.end+' · '+s.source+' · '+s.matchedRows+' '+t('rows');
 $('stats').replaceChildren();for(const [label,value]of [['selectedLines',s.selectedLines],['changes',s.changes],['overlapCount',s.overlaps],['issueCount',s.issues]]){const box=element('div',undefined,'stat'+(label==='issueCount'&&value?' attention':''));box.append(element('b',String(value)),element('span',t(label)));$('stats').append(box);}
 $('tabs').replaceChildren();for(const name of Object.keys(SCHEMAS)){const b=element('button',t(name),active===name?'active':'');b.type='button';b.setAttribute('aria-current',active===name?'page':'false');b.append(element('small',String(report[name].length)));b.onclick=()=>{active=name;page=0;renderTable();renderTabsOnly();};$('tabs').append(b);}
 renderTable();
}
function renderTabsOnly(){for(const [index,name]of Object.keys(SCHEMAS).entries()){const button=$('tabs').children[index];button.classList.toggle('active',active===name);button.setAttribute('aria-current',active===name?'page':'false');}}
function renderTable(){
 $('table-title').textContent=t(active);$('table-note').textContent=t(tableNotes[active]);const cols=SCHEMAS[active].filter(k=>!['pcn','partKey','poKey','lineKey'].includes(k));const head=document.createElement('tr');for(const c of cols)head.append(element('th',COLUMNS[c][lang==='zh'?1:0]));$('result-head').replaceChildren(head);$('result-body').replaceChildren();const rows=report[active],size=50,part=rows.slice(page*size,(page+1)*size);
 if(!part.length){const td=element('td',t('none'));td.colSpan=cols.length;const tr=document.createElement('tr');tr.append(td);$('result-body').append(tr);}
 for(const r of part){const tr=document.createElement('tr');for(const c of cols){const td=document.createElement('td');const value=cell(r,c,lang);if(c==='status')td.append(element('span',value,'badge '+r.status));else td.textContent=value;tr.append(td);}$('result-body').append(tr);}
 const total=Math.max(1,Math.ceil(rows.length/size));$('pagination').replaceChildren(element('span',rows.length+' '+t('records')),element('span',t('page')+' '+(page+1)+' '+t('of')+' '+total));for(const [label,offset]of [['previous',-1],['next',1]]){const b=element('button',t(label));b.disabled=page+offset<0||page+offset>=total;b.onclick=()=>{page+=offset;renderTable();};$('pagination').append(b);}
}
function download(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function filename(name){return String(Object.keys(SCHEMAS).indexOf(name)+1).padStart(2,'0')+'_'+name+'.csv';}
$('download-one').onclick=()=>report&&download(new Blob([toCSV(report,active)],{type:'text/csv;charset=utf-8'}),filename(active));
$('download-all').onclick=()=>{if(!report)return;const files=Object.keys(SCHEMAS).map(k=>[filename(k),toCSV(report,k)]);files.push(['run_summary.json',JSON.stringify(report.summary,null,2)]);files.push(['README.txt','Price history review / 售价历史检查\n\nAll CSV headers and explanatory text are bilingual. / CSV 列名与说明均为中英双语。\nOpen CSV using Excel Data > From Text/CSV and keep identifiers as Text. / 请用 Excel“数据→从文本/CSV”导入，零件号、版本、PO 等标识列设为文本。\n\nReview PO selection, processing status and issues before interpreting changes. / 先核对 PO 筛选、处理状态和待确认清单，再查看价格变动。\nBlank revision means blank revision only. / 版本留空仅代表系统空白版本。\n'+report.summary.start+' — '+report.summary.end+'\n']);download(zipFiles(files),'price_review_'+report.summary.start+'_'+report.summary.end+'.zip');};
$('language').onclick=()=>{lang=lang==='en'?'zh':'en';setLanguage();};
$('source').onchange=()=>{if($('source').files[0])setSource($('source').files[0]);};
for(const event of ['dragenter','dragover'])$('drop').addEventListener(event,e=>{e.preventDefault();if(!busy)$('drop').classList.add('drag');});
for(const event of ['dragleave','drop'])$('drop').addEventListener(event,e=>{e.preventDefault();$('drop').classList.remove('drag');if(event==='drop'&&!busy&&e.dataTransfer.files[0])setSource(e.dataTransfer.files[0]);});
$('toggle-scope').onclick=()=>{scopeExpanded=!scopeExpanded;renderScopeSummary();};
$('add-part').onclick=()=>{scopeExpanded=true;addRow();clearReport();};
$('start').oninput=clearReport;$('end').oninput=clearReport;$('run').onclick=run;
$('import-parts').onclick=()=>$('parts-file').click();
function partsFailure(label){partsPending=false;lock(false);progressKey='';$('progress').hidden=true;setError({label});}
$('parts-file').onchange=async()=>{
 const file=$('parts-file').files[0];if(!file)return;clearReport();partsFilename=file.name;partsPending=true;lock(true);progress('partsLoading');$('sheet-picker').hidden=true;$('parts-info').hidden=true;
 try{
  const buffer=await file.arrayBuffer();partsWorker?.terminate();partsWorker=new Worker(new URL('./parts-worker.js?v=3.5',import.meta.url),{type:'module'});
  partsWorker.onmessage=({data})=>{
   if(data.error){partsFailure(data.error);return;}
   if(data.sheets?.length>1){$('sheet-select').replaceChildren(new Option(t('selectSheet'),''),...data.sheets.map(name=>new Option(name,name)));$('sheet-picker').hidden=false;partsPending=true;lock(false);progress('selectSheet');}
   if(data.rows){clearReport();scopeExpanded=false;$('scope-rows').replaceChildren();for(const r of data.rows)addRow(r.PartNo,r.Revision);partsPending=false;lock(false);$('parts-info').textContent=partsFilename+(data.sheet?' · '+data.sheet:'');$('parts-info').hidden=false;}
  };
  partsWorker.onerror=()=>partsFailure('partsReadError');
  partsWorker.postMessage({action:'open',buffer,name:file.name},[buffer]);
 }catch{partsFailure('partsReadError');}finally{$('parts-file').value='';}
};
$('sheet-select').onchange=()=>{if(!$('sheet-select').value){partsPending=true;lock(false);return;}clearReport();partsPending=true;lock(true);progress('partsLoading');partsWorker.postMessage({action:'sheet',name:$('sheet-select').value});};
function makeDemo(){partsPending=false;partsWorker?.terminate();lock(false);$("sheet-picker").hidden=true;$("parts-info").hidden=true;
 const rows=[];const add=(part,customer,po,date,rel,prices)=>{
  for(const [i,p]of prices.entries()){const r=Object.fromEntries(REQUIRED.map(k=>[k,'']));Object.assign(r,{PCN:'269388',Minth_Part_No:part,revision:'',customer_code:customer,po_no:po,po_key:po,part_key:part,po_line_key:po,price_key:po+'-'+i,PO_Date:date,PO_Type_Key:'2500',PO_Type:'Blanket',Releases:String(rel),Price:p[0],Raw_Price:p[0],Price_Active:'1',unit:'Ea',currency_code:'USD',effective_date:p[1],expiration_date:p[2]||'',Component_Count:'1',Component_Needs_Review:'0',customer_part_no:part});rows.push(r);}
 };
 add('DEMO-A','Example customer A','DEMO-PO-101','6/1/2025 12:00:00 AM',100,[['10','2025-01-01'],['12','2026-07-01','2026-09-30'],['12.5','2026-10-01']]);
 add('DEMO-B','Example customer B','DEMO-PO-202','2/3/2020 12:00:00 AM',50,[['1.33','2023-07-01'],['1.32','2025-01-01'],['1.32','2026-07-01']]);
 const q=v=>'"'+v.replaceAll('"','""')+'"';const headers=[...REQUIRED,'Price_Active'];const text=headers.join(',')+'\r\n'+rows.map(r=>headers.map(k=>q(r[k])).join(',')).join('\r\n');
 setSource(new File([text],'fictional_example.csv',{type:'text/csv'}),true);$('scope-rows').replaceChildren();addRow('DEMO-A');addRow('DEMO-B');$('start').value='2026-10-01';$('end').value='2026-10-21';run();
}
$('demo').onclick=makeDemo;
addRow();setLanguage();






