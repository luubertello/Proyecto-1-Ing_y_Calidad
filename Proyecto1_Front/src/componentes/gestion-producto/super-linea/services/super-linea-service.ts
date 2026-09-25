import { createCrudService } from "../../../../utils/crudFactory";
import { FormValues } from "../interfaces/interfaces-validaciones-super-linea";

const baseService = createCrudService<FormValues>("super-linea");

const SuperLineaService = {
  ...baseService,
};

export default SuperLineaService;