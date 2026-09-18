import { createCrudRouter } from "../../common/lib/crudRouter";
import { zone } from "../../db/schemas/zone";

export default createCrudRouter({
  table: zone,
  idColumn: zone.id,
  requiredFields: ["assemblyNumber", "zoneNo", "zoneName"],
  filterColumn: zone.assemblyNumber,
});
