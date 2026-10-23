import {parseCSV,decodeCSV,analyze} from './engine.js?v=3.7';
self.onmessage=({data})=>{
 try{self.postMessage({stage:'reading'});const parsed=parseCSV(decodeCSV(data.buffer));self.postMessage({stage:'analyzing',rows:parsed.rows.length});const report=analyze(parsed.rows,parsed.headers,data.scope,data.start,data.end,data.source);self.postMessage({report});}
 catch(e){let error;try{error=JSON.parse(e.message);}catch{error={code:'malformedCSV',details:e.message};}self.postMessage({error});}
};


