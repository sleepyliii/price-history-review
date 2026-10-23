/*
Customer price export / 客户价格底表导出
Includes complete price history, PO metadata and current active Releases.
导出完整价格历史、PO信息及当前有效Releases；可用下方前缀参数缩小范围。
Price = PR.Price. Components are retained for review, not summed into the price.
售价直接取PR.Price，组件数量仅供核对。
Keep full price history; choose the reporting period in the review tool.
请保留完整价格历史，在网页工具中选择检查期间。
Blanket type key 2500 is validated for PCN 269388.
*/

DECLARE @BlanketPOTypeKey INT = 2500;
DECLARE @PartFilter VARCHAR(100) = '';
DECLARE @CustomerFilter VARCHAR(100) = '';
DECLARE @CustomerPartFilter VARCHAR(100) = '';
DECLARE @PartStatusFilter VARCHAR(1000) = '';

SET @PartStatusFilter = ',' + @PartStatusFilter + ',';

/* 第一步：每一条PO明细只生成一条Release汇总。
   保留原customer releases query的有效状态过滤，并跨Ship-to汇总。
   此金额/数量是当前状态，不是指定历史期间的快照。
*/
SELECT
    R.po_line_key,
    SUM(R.quantity) AS Releases
INTO #ReleaseByPOLine
FROM sales_v_release AS R
JOIN sales_v_po_line AS POL
    ON POL.po_line_key = R.po_line_key
JOIN sales_v_po AS PO
    ON PO.po_key = POL.po_key
JOIN sales_v_po_status AS POS
    ON POS.po_status_key = PO.po_status_key
JOIN common_v_customer AS C
    ON C.customer_no = PO.customer_no
JOIN common_v_customer_address AS CA
    ON CA.customer_address_no = R.ship_to
JOIN common_v_customer_status AS CS
    ON CS.customer_status = C.customer_status
JOIN sales_v_release_status AS RS1
    ON RS1.release_status_key = R.release_status_key
JOIN part_v_part AS P
    ON P.part_key = POL.part_key
WHERE CS.active = 1
  AND CA.active = 1
  AND POS.active = 1
  AND RS1.active = 1
GROUP BY R.po_line_key;

/* 第二步：计算每条价格关联的非Shipment Price组件行数。
   同样每个price_key只生成一条记录，不使主查询扩行。
*/
SELECT
    PC.price_key,
    COUNT(*) AS Component_Count
INTO #PriceComponentCounts
FROM sales_v_price_component AS PC
JOIN sales_v_price_type AS PT
    ON PT.price_type_key = PC.price_type_key
WHERE PT.price_type NOT IN ('Shipment Price')
GROUP BY PC.price_key;

/* 第三步：价格历史作为输出明细，与已汇总的Release连接。
   不按本月筛掉历史价格：旧价及尚未失效的早期价格也要参与判断。
*/
SELECT
    'CST' AS Seeling_Company,
    PO.PCN AS PCN,
    PO.po_key,
    POL.po_line_key,
    PR.price_key,
    C.customer_code,
    PO.po_no,
    PO.PO_Date AS PO_Date,
    PO.PO_Type_Key AS PO_Type_Key,
    CASE WHEN PO.PO_Type_Key = @BlanketPOTypeKey THEN 'Blanket' ELSE 'Other' END AS PO_Type,
    P.part_key,
    P.part_no AS Minth_Part_No,
    P.name AS Minth_Part_Name,
    P.part_type AS Program,
    P.revision,
    P.part_status,
    CP.customer_part_no,
    CP.customer_part_revision,
    PR.Price AS Price,
    PR.Price AS Raw_Price,
    COALESCE(PCC.Component_Count, 0) AS Component_Count,
    CASE
        WHEN COALESCE(PCC.Component_Count, 0) <> 1 THEN 1
        ELSE 0
    END AS Component_Needs_Review,
    PR.unit,
    CU.currency_code,
    PR.effective_date,
    PR.expiration_date,
    COALESCE(RL.Releases, 0) AS Releases
FROM sales_v_po_line AS POL
JOIN part_v_part AS P
    ON P.part_key = POL.part_key
JOIN part_v_customer_part AS CP
    ON CP.customer_part_key = POL.customer_part_key
JOIN sales_v_po AS PO
    ON PO.po_key = POL.po_key
JOIN sales_v_po_status AS POS
    ON POS.po_status_key = PO.po_status_key
JOIN sales_v_price AS PR
    ON PR.po_line_key = POL.po_line_key
JOIN common_v_currency AS CU
    ON CU.currency_key = PR.currency_key
JOIN common_v_customer AS C
    ON C.customer_no = PO.customer_no
LEFT JOIN #ReleaseByPOLine AS RL
    ON RL.po_line_key = POL.po_line_key
LEFT JOIN #PriceComponentCounts AS PCC
    ON PCC.price_key = PR.price_key
WHERE CP.active = 1
  AND POS.active = 1
  AND POL.active = 1
  AND PO.master_price = 0
  AND C.customer_code LIKE @CustomerFilter + '%'
  AND CP.customer_part_no LIKE @CustomerPartFilter + '%'
  AND P.part_no LIKE @PartFilter + '%'
  AND (
        @PartStatusFilter = ',,'
        OR CHARINDEX(',' + CAST(P.part_status AS VARCHAR(40)) + ',', @PartStatusFilter) > 0
      )
ORDER BY P.part_no, C.customer_code, PO.po_no, POL.po_line_key, PR.effective_date, PR.price_key;

DROP TABLE #PriceComponentCounts;
DROP TABLE #ReleaseByPOLine;
