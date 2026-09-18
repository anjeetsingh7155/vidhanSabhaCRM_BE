import { createCrudRouter } from "../../common/lib/crudRouter";
import { panchayat } from "../../db/schemas/panchayat";

export default createCrudRouter({
  table: panchayat,
  idColumn: panchayat.id,
  requiredFields: ["mandalId", "name"],
  filterColumn: panchayat.mandalId,
});
