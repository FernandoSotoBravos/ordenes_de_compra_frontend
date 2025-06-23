"use client";
import { useEffect, useState, useMemo } from "react";
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
  Autocomplete,
} from "@mui/material";
import TextArea from "../../../components/TextArea";
import { useDialogs } from "@toolpad/core/useDialogs";
import { OrderCreate } from "@/app/interfaces/Order.interface";

import Grid from "@mui/material/Grid2";
import DialogCreateOrder from "@/app/components/dialogs/CreateOrder";
import CRUDTable from "@/app/components/TableProductsOrders";
import { departmentService } from "@/app/api/departmentService";
import { areaService } from "@/app/api/areaService";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { suppliersService } from "@/app/api/suppliersService";
import { conceptService } from "@/app/api/conceptService";
import { ConceptSelect } from "@/app/interfaces/Concepts.interface";
import { ProductsOrder } from "@/app/interfaces/Order.interface";
import { useSession } from "@toolpad/core";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { currencyService } from "@/app/api/currencyService";
import { CurrencySelect } from "@/app/interfaces/Currency.interface";

function CreateOrderPage() {
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;
  const [departments, setDepartments] = useState<SelectBase[]>([]);
  const [isEnableDepartment, setIsEnableDepartment] = useState(false);
  const [isEnableArea, setIsEnableArea] = useState(false);
  const [departmentSelected, setDepartmentSelected] = useState("");
  const [areaSelected, setAreaSelected] = useState("");
  const [currencies, setCurrencies] = useState<CurrencySelect[]>([]);
  const [areas, setAreas] = useState<SelectBase[]>([]);
  const [providers, setProviders] = useState<SelectBase[]>([]);
  const [concepts, setConcepts] = useState<ConceptSelect[]>([]);
  const [segment_business, setSegmentBusiness] = useState<string>("");
  const [tableData, setTableData] = useState<ProductsOrder[]>([]);
  const [formValues, setFormValues] = useState<OrderCreate>({
    department: (session?.user?.department as string) || "",
    concept: "",
    area: (session?.user?.area as string) || "",
    segment: "",
    beneficiary: "",
    currency: "",
    descriptionPayment: "",
    comments: "",
    observations: "",
    products: [],
  });

  const getConcepts = (areaId: number) => {
    conceptService
      .getByArea(token as string, areaId)
      .then((data) => {
        setConcepts(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los conceptos del area, " +
            error.response
        );
        handleCleanForm();
      });
  };

  const handleSelectedArea = (event: SelectChangeEvent<string>) => {
    getConcepts(parseInt(event.target.value));
    setFormValues({
      ...formValues,
      area: event.target.value,
    });
  };

  const getAreas = async (departmentId: number) => {
    await areaService
      .getByDepartment(token as string, departmentId)
      .then((data) => {
        setAreas(data);
        if (
          (session?.user && !session?.user?.super_user) ||
          session?.user?.is_leader_department
        ) {
          setFormValues({
            ...formValues,
            area: session?.user?.area as string,
          });

          setAreaSelected(
            data.find((dt: any) => dt.id == session?.user?.area).name
          );
        }
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer las areas del departamento, " +
            error.response
        );
        handleCleanForm();
      });
  };

  const handleSelectedDepartment = (event: SelectChangeEvent<string>) => {
    getAreas(parseInt(event.target.value));
    setFormValues({
      ...formValues,
      department: event.target.value,
    });
  };

  const handleGetDepartments = async () => {
    await departmentService
      .getAll(token as string)
      .then((data) => {
        setDepartments(data);

        if (!session?.user?.super_user) {
          setFormValues({
            ...formValues,
            department: session?.user?.department as string,
          });

          setDepartmentSelected(
            data.find((dt: any) => dt.id == session?.user?.department).name
          );
        }
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los departamentos, " +
            error.response
        );
        handleCleanForm();
      });
  };

  const handleGetCurrencies = async () => {
    await currencyService
      .getAll(token as string)
      .then((data) => {
        setCurrencies(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los tipo de moneda, " +
            error.response
        );
        handleCleanForm();
      });
  };

  const handleGetProviders = async () => {
    await suppliersService
      .getAllSmall(token as string)
      .then((data) => {
        setProviders(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los proveedores, " +
            error.response
        );
        handleCleanForm();
      });
  };

  useMemo(() => {
    if (token) {
      handleGetDepartments();
      handleGetCurrencies();
      handleGetProviders();

      if (session.user?.super_user) {
        setIsEnableDepartment(true);
        setIsEnableArea(true);
        return;
      }

      if (session?.user?.is_leader_department) {
        setIsEnableArea(true);
        getAreas(parseInt(session?.user?.department as string));
      } else {
        getAreas(parseInt(session?.user?.department as string));
        getConcepts(parseInt(session?.user?.area as string));
      }
    }
  }, [token]);

  const handleSelectedCurrency = (event: SelectChangeEvent<string>) => {
    setFormValues({
      ...formValues,
      currency: event.target.value,
    });
  };

  const handleChangeProviders = (event: any, newValue: SelectBase | null) => {
    setFormValues({
      ...formValues,
      beneficiary: newValue?.id || "",
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
      area: "",
      concept: "",
      segment: "",
      beneficiary: "",
      currency: "",
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
      concept: event.target.value,
    });
  };

  const validateForm = () => {
    if (
      formValues.department === "" ||
      formValues.concept === "" ||
      formValues.area === "" ||
      formValues.department === "" ||
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
    if (result) {
      handleCleanForm();
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {session?.user?.super_user ? (
            <FormControl fullWidth>
              <InputLabel id="departamento-label">Departamento</InputLabel>
              <Select
                labelId="departamento-label"
                id="department"
                name="department"
                value={formValues.department}
                onChange={handleSelectedDepartment}
                disabled={!isEnableDepartment}
              >
                {departments.length > 0 &&
                  departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              id="department"
              name="department"
              value={departmentSelected}
              disabled
            />
          )}
        </Grid>

        <Grid container spacing={2} size={{ xs: 12, sm: 6 }}>
          {session?.user?.super_user || session?.user?.is_leader_department ? (
            <FormControl sx={{ width: "60%" }}>
              <InputLabel id="area-concepto-label">Áreas</InputLabel>
              <Select
                labelId="area-concepto-label"
                id="area"
                name="area"
                value={formValues.area}
                onChange={handleSelectedArea}
                disabled={!isEnableArea}
              >
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              sx={{ width: "60%" }}
              id="area"
              name="area"
              value={areaSelected}
              disabled
            />
          )}
          <FormControl sx={{ width: "35%" }}>
            <InputLabel id="area-concepto-moneda">Moneda</InputLabel>
            <Select
              labelId="area-concepto-moneda"
              id="currency"
              name="currency"
              value={formValues.currency}
              onChange={handleSelectedCurrency}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.id} value={currency.id}>
                  {currency.description}
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
              value={formValues.concept}
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
            <Autocomplete
              disablePortal
              fullWidth
              options={providers}
              onChange={handleChangeProviders}
              getOptionLabel={(option) => option.name || ""}
              value={providers.find((p) => p.id === formValues.beneficiary) || null}
              isOptionEqualToValue={(option, value) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <TextField {...params} label="Proveedor" />
              )}
            />
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
        <CRUDTable
          tableData={tableData}
          setTableData={handleProductsChange}
          isSaving={false}
        />
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
