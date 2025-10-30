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
import Viewer from "@/app/components/viewer";
import { orderService } from "@/app/api/orderService";

function CreateOrderPage() {
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;
  const [resetKey, setResetKey] = useState(0);
  const [departments, setDepartments] = useState<SelectBase[]>([]);
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
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los departamentos, " + error.response
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
          "Ha ocurrido un error al traer los tipo de moneda, " + error.response
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
          "Ha ocurrido un error al traer los proveedores, " + error.response
        );
        handleCleanForm();
      });
  };

  useMemo(() => {
    if (token) {
      handleGetDepartments();
      handleGetCurrencies();
      handleGetProviders();
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

  // cambio Subtotal,Total,Taxes
  const handleChangeSTT = (data: any) => {
    const { name, value } = data.target;

    setFormValues((prev) => ({
      ...prev,
      ...value,
    }));
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
    setResetKey((prev) => prev + 1);
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
      iva: 0.0,
      subtotal: 0.0,
      total: 0.0,
      products: [],
      taxes: [],
    });
  };

  const handleProductsChange = (products: OrderCreate["products"]) => {
    setTableData([...products]);

    setFormValues({
      ...formValues,
      products,
    });
  };

  const handleSegmentBusiness = (
    event: React.SyntheticEvent<Element, Event>,
    value: ConceptSelect | null
  ) => {
    setSegmentBusiness(value?.segment_business?.toString() || "");
    setFormValues({
      ...formValues,
      concept: value?.id.toString() || "",
    });
  };

  const validateForm = () => {
    if (
      formValues.department === "" ||
      formValues.concept === "" ||
      formValues.area === "" ||
      formValues.beneficiary === "" ||
      formValues.descriptionPayment === "" ||
      formValues.products.length === 0
    ) {
      return false;
    }
    return true;
  };

  const handleDownloadFile = async (orderId: number): Promise<any> => {
    return orderService
      .downloadPDFOrder(token as string, orderId)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        dialogs.alert("Error al descargar el documento " + error, {
          title: "Error",
        });

        return;
      });
  };

  const openPDFViewer = async (orderId: number) => {
    const response = await handleDownloadFile(orderId);
    let fileName = `orden_${orderId}.pdf`;
    const name = response.headers.get("x-filename");
    if (name) {
      fileName = name;
    }

    const result = await dialogs.open(Viewer, {
      id: orderId,
      file: response.data,
      fileName: fileName,
    });
    return result;
  };

  const handlePreSubmit = async () => {
    if (!isFormValid) {
      dialogs.alert("Por favor completa todos los campos requeridos.");
      scrollToFirstInvalidField();
      return;
    }

    const orderId = await dialogs.open(DialogCreateOrder, formValues);
    if (orderId) {
      await openPDFViewer(orderId);
      handleCleanForm();
    }
  };


  const requiredFields = [
    "department",
    "area",
    "concept",
    "beneficiary",
    "currency",
    "descriptionPayment",
    "invoice",
  ];

  const isFormValid =
    formValues.department &&
    formValues.area &&
    formValues.concept &&
    formValues.beneficiary &&
    formValues.currency &&
    formValues.descriptionPayment &&
    formValues.invoice &&
    formValues.products.length > 0;

  const scrollToFirstInvalidField = () => {
    for (const field of requiredFields) {
      if (!formValues[field as keyof typeof formValues]) {
        const el =
          document.querySelector(`[name="${field}"]`) ||
          document.getElementById(field) ||
          document.querySelector(`[id="${field}-input"]`);

        if (el) {
          (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
          (el as HTMLElement).focus();
        }
        break;
      }
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={!formValues.department}>
            <InputLabel id="departamento-label">Departamento</InputLabel>
            <Select
              labelId="departamento-label"
              id="department"
              name="department"
              value={formValues.department}
              onChange={handleSelectedDepartment}
              disabled={departments.length === 0}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Grid>

        <Grid container spacing={2} size={{ xs: 12, sm: 6 }}>
          <FormControl sx={{ width: "60%" }} required error={!formValues.area}>
            <InputLabel id="area-concepto-label">Áreas</InputLabel>
            <Select
              labelId="area-concepto-label"
              id="area"
              name="area"
              value={formValues.area}
              onChange={handleSelectedArea}
              disabled={areas.length === 0}
            >
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: "35%" }} required error={!formValues.currency}>
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
          <FormControl sx={{ width: "60%" }} required error={!formValues.concept}>
            <Autocomplete
              disablePortal
              onChange={handleSegmentBusiness}
              options={concepts}
              getOptionLabel={(option) => option.name || ""}
              disabled={concepts.length === 0}
              value={
                concepts.find((c) => c.id === parseInt(formValues.concept)) ||
                null
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Concepto" error={!formValues.concept} required />
              )}
            />
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
          <FormControl fullWidth required error={!formValues.beneficiary}>
            <Autocomplete
              disablePortal
              fullWidth
              options={providers}
              onChange={handleChangeProviders}
              getOptionLabel={(option) => option.name || ""}
              value={
                providers.find((p) => p.id === formValues.beneficiary) || null
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Proveedor" error={!formValues.concept} required />
              )}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2} size={{ xs: 12, sm: 6 }} mt={2} mb={2}>
        <FormControl sx={{ width: "70%" }} required error={!formValues.descriptionPayment}>
          <TextArea
            name="descriptionPayment"
            value={formValues.descriptionPayment}
            onChange={handleChange}
            placeholder="Descripción del Pago"
          />
        </FormControl>
        <TextField
          sx={{ width: "28%" }}
          label="Folio de Factura"
          name="invoice"
          required
          error={!formValues.invoice}
          value={formValues.invoice || ""}
          onChange={handleChange}
        />

      </Grid>
      <Box mt={1}>
        <CRUDTable
          key={resetKey}
          tableData={tableData}
          setTableData={handleProductsChange}
          isSaving={false}
          formValues={formValues}
          setFormsValue={handleChangeSTT}
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