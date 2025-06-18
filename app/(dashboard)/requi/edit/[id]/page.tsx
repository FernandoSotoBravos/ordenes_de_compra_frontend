"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import { requisitionService } from "@/app/api/requisitionService";
import {
  DocumentsRequisition,
  Requisition,
  RequisitionDetail,
  RequisitionDocument,
  RequisitionUpdateHeaders,
} from "@/app/interfaces/Requisitions.interface";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_EditActionButtons,
  MRT_Row,
  MRT_TableOptions,
} from "material-react-table";
import dayjs from "dayjs";
import { useDialogs } from "@toolpad/core";
import { departmentService } from "@/app/api/departmentService";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { ConceptSelect } from "@/app/interfaces/Concepts.interface";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { useSession } from "@toolpad/core";
import FileUpload from "@/app/components/fileUpload";
import TextArea from "@/app/components/TextArea";
import { conceptService } from "@/app/api/conceptService";
import { areaService } from "@/app/api/areaService";
import {
  AddProductBase,
  EditProductRequisition,
} from "@/app/interfaces/Product.interface";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import { MRT_Localization_ES } from "material-react-table/locales/es";

export default function EditrequisitionPage() {
  const { id } = useParams();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<SelectBase[]>([]);
  const [areas, setAreas] = useState<SelectBase[]>([]);
  const [concepts, setConcepts] = useState<ConceptSelect[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const dialogs = useDialogs();
  const router = useRouter();

  const handleGetDepartments = async () => {
    await departmentService
      .getAll(token as string)
      .then((data) => {
        setDepartments(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los departamentos, " +
            error.response.data.detail
        );
      });
  };

  const handleGetAreas = (department: number) => {
    areaService
      .getByDepartment(token as string, department)
      .then((data) => {
        setAreas(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer las áreas del departamento, " +
            error.response.data.detail
        );
      });
  };

  const handleGetConcept = (area: number) => {
    conceptService
      .getByArea(token as string, area)
      .then((data) => {
        setConcepts(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los conceptos del area, " +
            error.response.data.detail
        );
      });
  };

  const setCurrentDepartment = () => {
    const currentDepartment = session?.user?.department;
  };

  const handleSelectedDepartment = (event: SelectChangeEvent<string>) => {
    const selectedDepartment = event.target.value;

    if (requisition) {
      setRequisition({
        ...requisition,
        department: selectedDepartment,
      });
    }
  };

  const handleSelectArea = (event: SelectChangeEvent<string>) => {
    const selectedArea = event.target.value;

    handleGetConcept(parseInt(selectedArea));

    if (requisition) {
      setRequisition({
        ...requisition,
        area: selectedArea,
      });
    }
  };

  const handleSelectedConcept = (event: SelectChangeEvent<string>) => {
    const selectedConcept = event.target.value;

    if (requisition) {
      setRequisition({
        ...requisition,
        concept: selectedConcept,
      });
    }
  };

  const buildDocuments: () => DocumentsRequisition[] = () => {
    const documents = Object.entries(requisition?.documents ?? {}).map(
      ([key, value]) => ({
        name: key,
        folder: value,
      })
    );
    return documents;
  };

  const fetchRequisition = async () => {
    await requisitionService
      .getById(token as string, id as string)
      .then((res) => {
        if (![1, 4].includes(res.status_id)) {
          dialogs.alert(
            "No puedes editar una requisicion que ya fue aprobada o no esta rechazada",
            {
              title: "Error",
            }
          );

          router.push(`/requisitions/list/`);
          return;
        }

        if (
          res.created_user?.toLowerCase() !== session?.user?.name?.toLowerCase()
        ) {
          dialogs.alert(
            "No puedes editar una requisicion que no te pertenece",
            {
              title: "Error",
            }
          );

          router.push(`/requisitions/list/`);
          return;
        }

        setRequisition(res);
        handleGetAreas(res.department);
        handleGetConcept(res.area);
      })
      .catch((err) => {
        dialogs.alert(`Error al obtener la requisicion ${err}`);
        console.error("Error al obtener la requisicion: " + err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateProduct: MRT_TableOptions<RequisitionDetail>["onCreatingRowSave"] =
    async ({ values, table }) => {
      // Validar y agregar el nuevo producto
      const total = values.quantity * values.unit_price;
      const data: AddProductBase = {
        quantity: parseFloat(values.quantity),
        description: values.description,
      };

      if (!requisition) {
        dialogs.alert("No hay una requisicion en curso", {
          title: "Error",
        });
        table.setCreatingRow(null);
        return;
      }

      await requisitionService
        .addItemToRequisition(token as string, requisition?.id, data)
        .then((response) => {
          dialogs.alert("Se ha actualizado la requisicion con exito", {
            title: "Actualizacion",
          });
          fetchRequisition();
        })
        .catch((err) => {
          dialogs.alert(
            "Ha ocurrido un error al actualizar la requisicion " + err,
            {
              title: "Error",
            }
          );
        });

      table.setCreatingRow(null);
    };

  const handleEditProduct: MRT_TableOptions<RequisitionDetail>["onEditingRowSave"] =
    async ({ values, table }) => {
      if (!requisition) {
        dialogs.alert("No hay una requisicion en curso", {
          title: "Error",
        });
        table.setEditingRow(null);
        return;
      }

      const total = values.quantity * values.unit_price;
      const data: EditProductRequisition = {
        id: values.id,
        quantity: parseFloat(values.quantity),
        description: values.description,
      };

      await requisitionService
        .updateItemRequisition(token as string, requisition?.id, data)
        .then((response) => {
          dialogs.alert("Se ha actualizado la requisicion con exito", {
            title: "Actualizacion",
          });
          fetchRequisition();
        })
        .catch((err) => {
          dialogs.alert(
            "Ha ocurrido un error al actualizar la requisicion " + err,
            {
              title: "Error",
            }
          );
        });

      table.setEditingRow(null);
    };

  useEffect(() => {
    if (id) {
      fetchRequisition();
      handleGetDepartments();
    }
  }, [id]);

  const columns: MRT_ColumnDef<RequisitionDetail>[] = [
    {
      header: "rowId",
      accessorKey: "id",
      enableEditing: false,
      enableHiding: false,
    },
    {
      header: "Producto",
      accessorKey: "product",
      enableEditing: false,
      enableHiding: false,
    },
    {
      header: "Descripción",
      accessorKey: "description",
    },
    {
      header: "Cantidad",
      accessorKey: "quantity",
    },
  ];

  const columnsDocs: MRT_ColumnDef<DocumentsRequisition>[] = [
    { header: "Nombre", accessorKey: "name" },
    { header: "Folder", accessorKey: "folder" },
  ];

  const openDeleteConfirmModal = async (row: MRT_Row<DocumentsRequisition>) => {
    const result = await dialogs.confirm(
      "Deseas eliminar el documento de la lista?",
      { title: "Eliminar item" }
    );
    if (result && requisition) {
      await requisitionService
        .deleteDocument(token as string, row.original.name, requisition.id)
        .then((response) => {
          dialogs.alert("Se ha eliminado el documento con exito", {
            title: "Actualizacion",
          });
          fetchRequisition();
        })
        .catch((err) => {
          dialogs.alert(
            "Ha ocurrido un error al eliminar el documento " + err,
            {
              title: "Error",
            }
          );
        });

      return;
    }
  };

  const openDeleteConfirmModalItem = async (
    row: MRT_Row<RequisitionDetail>
  ) => {
    const result = await dialogs.confirm(
      "Deseas eliminar el elemento de la lista?",
      { title: "Eliminar item" }
    );
    if (result && requisition && row.original.id) {
      await requisitionService
        .deleteItemInRequisition(
          token as string,
          row.original.id,
          requisition.id!
        )
        .then((response) => {
          dialogs.alert("Se ha actualizado la requisicion con exito", {
            title: "Actualizacion",
          });
          fetchRequisition();
        })
        .catch((err) => {
          dialogs.alert(
            "Ha ocurrido un error al actualizar la requisicion " + err,
            {
              title: "Error",
            }
          );
        });

      return;
    }

    dialogs.alert("No se encotro requisicion activa ni productos", {
      title: "Error",
    });
  };

  const handleSaveDocuments: MRT_TableOptions<DocumentsRequisition>["onCreatingRowSave"] =
    async ({ values, table }) => {
      if (!files) {
        dialogs.alert("No has seleccionado ningun documento para subirlo", {
          title: "Alerta",
        });

        return;
      }

      if (!requisition) {
        dialogs.alert("No existe una requisicion en curso", {
          title: "Alerta",
        });

        return;
      }

      const base64Files = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file); // Convierte el archivo a Base64
          });
        })
      );

      const formatFiles = base64Files.map((base64File, index) => ({
        filename: files[index].name,
        content_type: files[index].type,
        content: base64File.split(",")[1],
      }));

      await requisitionService
        .addDocument(token as string, requisition?.id, formatFiles)
        .then((response) => {
          dialogs.alert("Se ha actualizado los documentos correctamente", {
            title: "Actualizacion",
          });
          fetchRequisition();
        })
        .catch((err) => {
          dialogs.alert(
            "Ha ocurrido un error al actualizar la requisicion " + err,
            {
              title: "Error",
            }
          );
        });

      setFiles([]);
      table.setCreatingRow(null);
    };

  const handleSaveHeaders = async () => {
    if (!requisition || !requisition.area || !requisition.department) {
      return;
    }

    const data: RequisitionUpdateHeaders = {
      comments: requisition.comments,
      concept_id: parseInt(requisition.concept),
      area_id: parseInt(requisition.area),
      department_id: parseInt(requisition.department),
    };

    await requisitionService
      .updateHeaders(token as string, requisition?.id, data)
      .then((response) => {
        dialogs.alert("Se ha actualizado la requisicion con exito", {
          title: "Actualizacion",
        });
        fetchRequisition();
      })
      .catch((err) => {
        dialogs.alert(
          "Ha ocurrido un error al actualizar la requisicion " + err,
          {
            title: "Error",
          }
        );
      });
  };

  if (loading) {
    return (
      <Container maxWidth={false}>
        <CircularProgress />
      </Container>
    );
  }

  if (!requisition) {
    return (
      <Container maxWidth={false}>
        <Typography variant="h6" color="error">
          No se encontró la requisicion.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2}>
        {/* Sección izquierda: Campos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="departamento-label">Departamento</InputLabel>
            <Select
              labelId="department-label"
              value={requisition.department}
              onChange={handleSelectedDepartment}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid sx={{ width: "60%" }}>
              <FormControl fullWidth>
                <InputLabel id="area-label">Áreas</InputLabel>
                <Select
                  labelId="area-label"
                  value={requisition.area}
                  onChange={handleSelectArea}
                >
                  {areas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ width: "35%" }}>
              <FormControl fullWidth>
                <InputLabel id="concepto-label">Conceptos</InputLabel>
                <Select
                  labelId="concepto-label"
                  id="concept"
                  name="concept"
                  value={requisition.concept}
                  onChange={handleSelectedConcept}
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
          </Grid>

          <FormControl fullWidth>
            <InputLabel id="commentaries-label" sx={{ mb: 2 }}>
              Comentarios
            </InputLabel>
            <TextArea
              name="descriptionPayment"
              value={requisition.comments}
              onChange={(e) =>
                setRequisition({ ...requisition, comments: e.target.value })
              }
              maxRows={2}
              placeholder="Comentarios del Pago"
              minRows={3}
            />
          </FormControl>

          {/* // seccion de guardados */}
          <Grid container sx={{ mb: 2, mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={handleSaveHeaders}
              sx={{ mt: 2 }}
            >
              Guardar
            </Button>
          </Grid>
        </Grid>

        {/* Sección derecha: Tabla */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ brequisition: "1px solid #ccc", p: 2 }}
        >
          <MaterialReactTable
            columns={columns}
            data={requisition.details}
            onCreatingRowSave={handleCreateProduct}
            onEditingRowSave={handleEditProduct}
            state={{
              columnVisibility: { product: false, rowId: false },
            }}
            createDisplayMode="modal"
            localization={MRT_Localization_ES}
            editDisplayMode="modal"
            renderCreateRowDialogContent={({
              table,
              row,
              internalEditComponents,
            }) => (
              <>
                <DialogTitle variant="h3">Agregar producto</DialogTitle>
                <DialogContent
                  sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  {internalEditComponents}{" "}
                  {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                  <MRT_EditActionButtons
                    variant="text"
                    table={table}
                    row={row}
                  />
                </DialogActions>
              </>
            )}
            renderEditRowDialogContent={({
              table,
              row,
              internalEditComponents,
            }) => (
              <>
                <DialogTitle variant="h3">Editar producto</DialogTitle>
                <DialogContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {internalEditComponents}{" "}
                  {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                  <MRT_EditActionButtons
                    variant="text"
                    table={table}
                    row={row}
                  />
                </DialogActions>
              </>
            )}
            enableEditing
            enableRowActions
            renderRowActions={({ row, table }) => (
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <Tooltip title="Edit">
                  <IconButton onClick={() => table.setEditingRow(row)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => openDeleteConfirmModalItem(row)}
                  >
                    <DeleteIcon sx={{ color: "#f44336" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            muiTableContainerProps={{
              sx: { maxHeight: "300px", overflowY: "auto", height: "300px" },
            }}
            renderTopToolbarCustomActions={({ table }) => (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  table.setCreatingRow(true);
                }}
              >
                Agregar producto
              </Button>
            )}
          />
        </Grid>

        {/* Sección inferior: Documentos */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Documentos adjuntos
          </Typography>

          <MaterialReactTable<DocumentsRequisition>
            createDisplayMode="modal"
            columns={columnsDocs}
            data={buildDocuments()}
            onCreatingRowSave={handleSaveDocuments}
            enableRowActions
            renderRowActions={({ row }) => (
              <IconButton
                color="error"
                onClick={() => openDeleteConfirmModal(row)}
              >
                <DeleteIcon sx={{ color: "#f44336" }} />
              </IconButton>
            )}
            renderTopToolbarCustomActions={({ table }) => (
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  table.setCreatingRow(true);
                }}
              >
                Agregar
              </Button>
            )}
            renderCreateRowDialogContent={({
              table,
              row,
              internalEditComponents,
            }) => (
              <>
                <DialogTitle variant="h6">Agregar Documento</DialogTitle>
                <DialogContent
                  sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <FileUpload
                    setFiles={setFiles}
                    files={files}
                    multiple={true}
                  />
                </DialogContent>
                <DialogActions>
                  <MRT_EditActionButtons
                    variant="text"
                    table={table}
                    row={row}
                  />
                </DialogActions>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
