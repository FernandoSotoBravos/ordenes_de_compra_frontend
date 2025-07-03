"use client";
import { useState, useMemo } from "react";
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
  Fab,
} from "@mui/material";
import { green } from "@mui/material/colors";
import TextArea from "../../../components/TextArea";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";
import { useDialogs } from "@toolpad/core/useDialogs";

import Grid from "@mui/material/Grid2";
import DialogCreateOrder from "@/app/components/dialogs/CreateOrder";
import CRUDTable from "@/app/components/TableProductsRequi";
import { departmentService } from "@/app/api/departmentService";
import { areaService } from "@/app/api/areaService";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { conceptService } from "@/app/api/conceptService";
import { ConceptSelect } from "@/app/interfaces/Concepts.interface";
import { useSession } from "@toolpad/core";
import { CustomSession } from "@/app/interfaces/Session.interface";
import {
  ProductsRequisition,
  RequisitionCreate,
  RequisitionCreateProps,
} from "@/app/interfaces/Requisitions.interface";
import FileUpload from "@/app/components/fileUpload";
import { requisitionService } from "@/app/api/requisitionService";

function CreateRequisitionPage() {
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;
  const [departments, setDepartments] = useState<SelectBase[]>([]);
  const [isEnableDepartment, setIsEnableDepartment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEnableArea, setIsEnableArea] = useState(false);
  const [departmentSelected, setDepartmentSelected] = useState("");
  const [areaSelected, setAreaSelected] = useState("");
  const [areas, setAreas] = useState<SelectBase[]>([]);
  const [concepts, setConcepts] = useState<ConceptSelect[]>([]);
  const [segment_business, setSegmentBusiness] = useState<string>("");
  const [tableData, setTableData] = useState<ProductsRequisition[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [formValues, setFormValues] = useState<RequisitionCreate>({
    department: (session?.user?.department as string) || "",
    concept: "",
    area: (session?.user?.area as string) || "",
    segment: "",
    comments: "",
    products: [],
  });

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  const getConcepts = (areaId: number) => {
    conceptService
      .getByArea(token as string, areaId)
      .then((data) => {
        setConcepts(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los conceptos del area, " +
            error.response.data.detail
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
        console.log(session?.user?.area)
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
            error.response.data.detail
        );
        handleCleanForm();
      });
  };

  useMemo(() => {
    if (token) {
      handleGetDepartments();

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

  const handleCleanForm = () => {
    setTableData([]);
    setFiles([]);
    setSegmentBusiness("");
    setFormValues({
      department: "",
      area: "",
      concept: "",
      segment: "",
      comments: "",
      products: [],
    });
    setSuccess(false);
  };

  const handleProductsChange = (products: RequisitionCreate["products"]) => {
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
      formValues.products.length === 0
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return dialogs.alert("Por favor llene todos los campos");
    }

    setLoading(true);
    setSuccess(false);

    try {
      const base64Files = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Crear el payload con archivos en formato Base64
      const data: RequisitionCreateProps = {
        concept_id: parseInt(formValues.concept),
        department_id: parseInt(formValues.department),
        area_id: parseInt(formValues.area),
        comments: formValues.comments,
        created_by: session?.user?.id as string,
        details: formValues.products.map((product) => ({
          product_id: 1,
          description: product.description,
          quantity: product.quantity,
        })),
        documents: base64Files.map((base64File, index) => ({
          filename: files[index].name,
          content_type: files[index].type,
          content: base64File.split(",")[1],
        })),
      };

      requisitionService
        .create(data, session?.user?.access_token as string)
        .then((response) => {
          dialogs.alert(
            `La requisicion ha sido creada con el ID: ${response.requisition}`,
            {
              title: "Success",
            }
          );
          setLoading(false);
          setSuccess(true);
          handleCleanForm();
        })
        .catch((error) => {
          dialogs.alert(
            `Error al generar la requisicion hacia el servidor: ${error}`,
            {
              title: "Error",
            }
          );
          setLoading(false);
          setSuccess(false);
        });
    } catch (error) {
      dialogs.alert(`Erro al generar la requisicion: ${error}`, {
        title: "Error",
      });
      setLoading(false);
      setSuccess(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2, position: "relative" }}>
      <Grid container spacing={2}>
        {/* Lado Izquierdo: Selects y campos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
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
                    {departments.map((department) => (
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

            <Grid size={{ xs: 12 }}>
              {session?.user?.super_user ||
              session?.user?.is_leader_department ? (
                <FormControl fullWidth>
                  <InputLabel id="area-label">Área</InputLabel>
                  <Select
                    labelId="area-label"
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
                  fullWidth
                  id="area"
                  name="area"
                  value={areaSelected}
                  disabled
                />
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 7 }}>
                  <FormControl fullWidth>
                    <InputLabel id="concepto-label">Concepto</InputLabel>
                    <Select
                      labelId="concepto-label"
                      id="concept"
                      name="concept"
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
                </Grid>
                <Grid size={{ xs: 5 }}>
                  <TextField
                    fullWidth
                    label="Segmento"
                    name="segment_business"
                    value={segment_business}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2}>
                <TextArea
                  name="comentaries"
                  value={formValues.comments}
                  onChange={(e) =>
                    setFormValues({ ...formValues, comments: e.target.value })
                  }
                  maxRows={10}
                  placeholder="Comentarios"
                  minRows={3}
                />
                <FileUpload setFiles={setFiles} files={files} multiple={true} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Lado Derecho: Tabla */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CRUDTable
            tableData={tableData}
            setTableData={handleProductsChange}
            isSaving={false}
          />
        </Grid>
      </Grid>

      {/* Botón flotante */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
        }}
      >
        <Fab
          aria-label="save"
          sx={buttonSx}
          onClick={handleSubmit}
        >
          {success ? <CheckIcon /> : <SaveIcon />}
        </Fab>
        {loading && (
          <CircularProgress
            size={68}
            sx={{
              color: green[500],
              position: "absolute",
              top: -6,
              left: -6,
              zIndex: 1,
            }}
          />
        )}
      </Box>
    </Container>
  );
}

export default CreateRequisitionPage;
