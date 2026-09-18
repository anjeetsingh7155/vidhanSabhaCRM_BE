import { createCrudRouter } from "../../common/lib/crudRouter";
import { mandals } from "../../db/schemas/mandal";

export default createCrudRouter({
  table: mandals,
  idColumn: mandals.id,
  requiredFields: ["zoneId", "mandalNo"],
  filterColumn: mandals.zoneId,
});
