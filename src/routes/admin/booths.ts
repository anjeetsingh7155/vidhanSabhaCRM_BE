import { createCrudRouter } from "../../common/lib/crudRouter";
import { boothRecords } from "../../db/schemas/boothRecord";

export default createCrudRouter({
  table: boothRecords,
  idColumn: boothRecords.id,
  requiredFields: ["panchayatId", "boothNo", "boothName"],
  filterColumn: boothRecords.panchayatId,
});
