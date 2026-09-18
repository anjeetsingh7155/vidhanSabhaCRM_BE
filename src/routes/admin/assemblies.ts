import { createCrudRouter } from "../../common/lib/crudRouter";
import { assemblies } from "../../db/schemas/assembly";

export default createCrudRouter({
  table: assemblies,
  idColumn: assemblies.id,
  requiredFields: ["id", "name", "reservation", "districtId"],
  filterColumn: assemblies.districtId,
});
