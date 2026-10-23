# Price History Review / 售价历史检查

Price History Review / 售价历史检查

Static, bilingual price-history review for a corrected Plex CSV export.
中英双语静态网页，用于检查修正版 Plex 价格历史 CSV。

Privacy / 数据处理
CSV parsing and calculations run in a browser Web Worker. Files and reports are not uploaded.
No analytics, third-party scripts, external fonts, API calls, or saved server-side datasets.
Closing or reloading the tab clears the selected file and results.
GitHub serves the website assets. Ordinary website access is still handled by the hosting provider.
CSV 解析与计算在浏览器 Web Worker 中完成，不上传数据或报告。
没有统计脚本、第三方脚本、外部字体、API 请求或服务器数据存储。
关闭或刷新页面会清除所选文件和结果。网站本身由 GitHub 托管。

Use / 使用
1. Choose the corrected SQL CSV export. / 选择售价修正版 SQL 导出 CSV。
2. Enter Part No. and Revision, or import a list with PartNo,Revision headers.
   输入零件号和版本，或导入包含 PartNo、Revision 列的清单。
3. A blank Revision matches only the blank system revision. It does not mean all revisions.
   Revision 留空仅匹配系统空白版本，不代表所有版本。
4. Choose the reporting start and end dates; run the check.
   选择检查起止日期，开始检查。
5. Review PO selection, processing status and items needing confirmation, then changes and overlaps.
   先看 PO 筛选、处理状态与待确认，再看变动与重叠。
6. Download bilingual CSV reports individually or as one ZIP.
   可单独下载中英双语 CSV，也可下载全部报告 ZIP。
When importing CSV into Excel, keep identifiers as Text to preserve leading zeroes.
在 Excel 导入 CSV 时，零件号、版本、PO 等标识列设为文本，防止前导零丢失。

Confirmed rules / 已确认规则
- Only specified part/revision combinations; no automatic latest-revision selection.
- Blanket and Releases > 0; latest calendar PO date wins. Ties require confirmation.
- Selling price is PR.Price, not a sum repeated by component count.
- Compare exact decimals, with no minimum price-change threshold.
- Expiration dates are inclusive; blank expiration continues indefinitely.
- Raw price keys remain in history; equal prices count as one distinct price in overlaps.
- Missing effective dates or expiration before effective date pause the affected group.
- pcs and Ea are equivalent; their spelling difference does not trigger an action.
- Unconfirmed cases are listed for confirmation; no silent conversion or tie-breaking.
- Previous price is the most recent earlier effective-date price, not guaranteed unique execution price.
- Blanket type mapping is validated for PCN 269388 and key 2500. Other PCNs require confirmation.
以上规则与本机 Python 工具一致；新的 edge case 先确认再制定处理规则。

Development / 本机开发
No dependency installation or build is required. / 无需安装依赖或构建。
Run: python -m http.server 8766 --bind 127.0.0.1
Open: http://127.0.0.1:8766
Do not double-click index.html: browsers require HTTP(S) for modules and workers.
不要直接双击 index.html；浏览器模块与 Worker 需要通过 HTTP(S) 访问。
Tests: node --test engine.test.mjs
Demo data is entirely fictional. No real Plex CSV is included in the deployable package.
演示数据全部虚构，可部署包不含真实 Plex CSV。

GitHub Pages deployment / GitHub Pages 部署
Published URL / 网站地址: https://sleepyliii.github.io/price-history-review/
Repository / 仓库: https://github.com/sleepyliii/price-history-review
This release serves static files from main / (root), using GitHub Pages branch publishing.
当前发布使用 main 分支根目录，通过 GitHub Pages 分支发布。
Repository Settings > Pages > Source: Deploy from a branch > main > / (root).
Web files and fictional tests are included. No real Plex CSV or reports are committed.
仓库仅包含网页程序、虚构测试样本和说明，不包含真实 CSV 或报告。
Use the reporting date controls to select a period; refresh the CSV for current Releases.
请在网页选择检查期间，并使用最新导出文件获取当前 Releases。
