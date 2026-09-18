import { createCrudRouter } from "../../common/lib/crudRouter";
import { districts } from "../../db/schemas/district";

export default createCrudRouter({
  table: districts,
  idColumn: districts.id,
  requiredFields: ["name", "headquarters", "division"],
});
