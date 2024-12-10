"use client";
import { useEffect, useState } from "react";
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  Box,
  Button,
} from "@mui/material";
import TextArea from "../../../components/TextArea";
import { useDialogs } from "@toolpad/core/useDialogs";
import { OrderCreate } from "@/app/interfaces/OrderCreate.interface";

import Grid from "@mui/material/Grid2";
import DialogCreateOrder from "@/app/components/dialogs/CreateOrder";
import CRUDTable from "@/app/components/DataGridCRUD";
import { departmentService } from "@/app/api/departmentService";
import { areaService } from "@/app/api/areaService";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { suppliersService } from "@/app/api/suppliersService";
import { conceptService } from "@/app/api/conceptService";
import { ConceptSelect } from "@/app/interfaces/Concepts.interface";
import { ProductsOrder } from "@/app/interfaces/OrderCreate.interface";
import { a } from "@react-spring/web";

function CreateOrderPage() {
  const dialogs = useDialogs();
  const [departments, setDepartments] = useState<SelectBase[]>([]);
  const [areas, setAreas] = useState<SelectBase[]>([]);
  const [providers, setProviders] = useState<SelectBase[]>([]);
  const [concepts, setConcepts] = useState<ConceptSelect[]>([]);
  const [segment_business, setSegmentBusiness] = useState<string>("");
  const [tableData, setTableData] = useState<ProductsOrder[]>([]);
  const [formValues, setFormValues] = useState<OrderCreate>({
    department: "",
    concept: "",
    segment: "",
    beneficiary: "",
    descriptionPayment: "",
    comments: "",
    observations: "",
    products: [],
  });

  useEffect(() => {
    departmentService.getAll().then((data) => {
      setDepartments(data);
    });

    suppliersService.getAll().then((data) => {
      setProviders(data);
    });
  }, []);

  const handleSelectedArea = (event: SelectChangeEvent<string>) => {
    conceptService.getByArea(parseInt(event.target.value)).then((data) => {
      setConcepts(data);
    });
    setFormValues({
      ...formValues,
      concept: event.target.value,
    });
  };

  const handleSelectedDepartment = (event: SelectChangeEvent<string>) => {
    areaService.getByDepartment(parseInt(event.target.value)).then((data) => {
      setAreas(data);
    });
    setFormValues({
      ...formValues,
      department: event.target.value,
    });
  };

  const handleChange = (
    event:
      | React.ChangeEvent<
          | HTMLInputElement
          | HTMLTextAreaElement
          | { value: unknown; name?: string }
        >
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name as string]: value,
    });
  };

  const handleCleanForm = () => {
    setTableData([]);
    setSegmentBusiness("");
    setFormValues({
      department: "",
      concept: "",
      segment: "",
      beneficiary: "",
      descriptionPayment: "",
      comments: "",
      observations: "",
      products: [],
    });
  };

  const handleProductsChange = (products: OrderCreate["products"]) => {
    setTableData([...products]);

    setFormValues({
      ...formValues,
      products,
    });
  };

  const handleSegmentBusiness = (event: SelectChangeEvent<string>) => {
    const concept = concepts.find((c) => c.id === parseInt(event.target.value));
    setSegmentBusiness(concept?.segment_business.toString() || "");
    setFormValues({
      ...formValues,
      segment: event.target.value,
    });
  };

  const validateForm = () => {
    if (
      formValues.department === "" ||
      formValues.concept === "" ||
      formValues.segment === "" ||
      formValues.beneficiary === "" ||
      formValues.descriptionPayment === "" ||
      formValues.products.length === 0
    ) {
      return false;
    }
    return true;
  };

  const handlePreSubmit = async () => {
    if (!validateForm()) {
      return dialogs.alert("Por favor llene todos los campos");
    }

    const result = await dialogs.open(DialogCreateOrder, formValues);
    alert(result);
    if (result) {
      handleCleanForm();
    }
    
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="departamento-label">Departamento</InputLabel>
            <Select
              labelId="departamento-label"
              id="department"
              name="department"
              value={formValues.department}
              onChange={handleSelectedDepartment}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="area-concepto-label">Áreas</InputLabel>
            <Select
              labelId="area-concepto-label"
              id="concept"
              name="concept"
              value={formValues.concept}
              onChange={handleSelectedArea}
            >
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid container spacing={2} size={{ xs: 12, sm: 6 }}>
          <FormControl sx={{ width: "60%" }}>
            <InputLabel id="concepto-label">Conceptos</InputLabel>
            <Select
              labelId="concepto-label"
              id="segment"
              name="segment"
              value={formValues.segment}
              onChange={handleSegmentBusiness}
              disabled={concepts.length === 0}
            >
              {concepts.map((concept) => (
                <MenuItem key={concept.id} value={concept.id}>
                  {concept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            sx={{ width: "35%" }}
            label="Segmento de Negocio"
            name="segment_business"
            value={segment_business}
            slotProps={{
              input: {
                readOnly: true,
                disabled: true,
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="beneficiario-label">Beneficiario</InputLabel>
            <Select
              labelId="beneficiario-label"
              id="beneficiary"
              name="beneficiary"
              value={formValues.beneficiary}
              onChange={handleChange}
            >
              {providers.map((provider) => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextArea
            name="descriptionPayment"
            value={formValues.descriptionPayment}
            onChange={handleChange}
            maxRows={10}
            placeholder="Descripción del Pago"
            minRows={3}
          />
        </Grid>
      </Grid>
      <Box mt={1}>
        <CRUDTable tableData={tableData} setTableData={handleProductsChange} isSaving={false} />
      </Box>
      <Box mt={2} textAlign={"end"}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handlePreSubmit}
        >
          Crear Orden
        </Button>
      </Box>
    </Container>
  );
}

export default CreateOrderPage;
