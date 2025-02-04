const express = require("express");
const route = express.Router();
const sql = require("mssql");
require("dotenv").config();
const os = require("os");

const hostname = os.hostname();
const DB_HOST = `${hostname}${process.env.DB_HOST}`;

//#region Config for Sql
var config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustedConnection: true,
    trustServerCertificate: true,
  },
};
//#endregion

//Express Router
route.post("/", async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();

    const BarcodeValue = req.body.BarcodeValue;
    await request.query(`use ${process.env.DB_NAME}`);

    const result = await request.query(
      `SELECT im.ItemDescription, im.qbguid, sm.ClosingBalQty, 
    ic.Name AS Product, pm.FieldValue AS MRP, pm.IsTaxInclusive AS MRPTax,
    ic2.Name AS Brand, ic3.Name AS Style, ic4.Name AS Shade, isz.SizeName AS Size, img.ImageFile AS ImageFile,
    um.UnitSymbol, um.DecimalPlaces, um.QBGUID AS UOMGuid
  FROM QbItemMaster AS im
  LEFT OUTER JOIN [VQbStockBalance] AS sm ON im.QBGUID = sm.ItemGuid
  INNER JOIN QbPriceMaster AS pm ON pm.ItemGUID = im.QBGUID AND pm.FieldName = 'ItemPrice1'
  LEFT OUTER JOIN QbItemClass AS ic ON im.Class1GUID = ic.QBGUID
  LEFT OUTER JOIN QbItemSize AS isz ON im.Class5GUID = isz.QBGUID
  LEFT OUTER JOIN QbItemClass AS ic2 ON im.Class2GUID = ic2.QBGUID
  LEFT OUTER JOIN QbItemClass AS ic3 ON im.Class3GUID = ic3.QBGUID
  INNER JOIN QbUnitMeasure AS um ON im.UomGUID = um.QBGUID
  LEFT OUTER JOIN QbItemClass AS ic4 ON im.Class4GUID = ic4.QBGUID
  LEFT OUTER JOIN QbImageMaster AS img ON img.LinkGUID = im.QBGUID
  WHERE ic3.Name = '${BarcodeValue}'`
    );

    if (result.recordset.length > 0) {
      const data = result.recordset.map((item) => {
        if (item.ImageFile) {
          const base64String = Buffer.from(item.ImageFile, "binary").toString(
            "base64"
          );
          const imgUrl = `data:image/png;base64,${base64String}`;
          return {
            ...item,
            ImageFile: imgUrl,
          };
        } else {
          return item;
        }
      });
      res.send(data);
    } else {
      res.send([]);
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

module.exports = route;
