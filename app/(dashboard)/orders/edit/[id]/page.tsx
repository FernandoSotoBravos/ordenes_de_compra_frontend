"use client";
import { useParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
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
  Fab,
  Chip,
  ListItem,
  Paper,
} from "@mui/material";
import { green } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import SaveIcon from "@mui/icons-material/Save";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import { orderService } from "@/app/api/orderService";
import {
  Order,
  OrderDetail,
  OrderDocument,
  OrderUpdateHeaders,
  TaxesOrder,
} from "@/app/interfaces/Order.interface";
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
import {
  SelectBase,
  SelectDescription,
} from "@/app/interfaces/SelecteBase.interface";
import { ConceptSelect } from "@/app/interfaces/Concepts.interface";
import { CurrencySelect } from "@/app/interfaces/Currency.interface";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { useSession } from "@toolpad/core";
import { currencyService } from "@/app/api/currencyService";
import { suppliersService } from "@/app/api/suppliersService";
import FileUpload from "@/app/components/fileUpload";
import TextArea from "@/app/components/TextArea";
import { conceptService } from "@/app/api/conceptService";
import { areaService } from "@/app/api/areaService";
import { AddProduct, EditProduct } from "@/app/interfaces/Product.interface";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import TaxIcon from "@/app/components/CustomIcons";
import AddTaxes from "@/app/components/dialogs/AddTaxesOrder";
import { taxService } from "@/app/api/taxService";
import { unitService } from "@/app/api/unitService";
import CurrencyInput from "@/app/components/CurrencyInput";

export default function EditOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState<SelectBase[]>([]);
  const [currencies, setCurrencies] = useState<CurrencySelect[]>([]);
  const [areas, setAreas] = useState<SelectBase[]>([]);
  const [units, setUnits] = useState<SelectDescription[]>([]);
  const [providers, setProviders] = useState<SelectBase[]>([]);
  const [concepts, setConcepts] = useState<ConceptSelect[]>([]);
  const [segment_business, setSegmentBusiness] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const dialogs = useDialogs();
  const router = useRouter();

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      "&:hover": {
        bgcolor: green[700],
      },
    }),
  };

  const fetchUnit = async () => {
    try {
      const response = await unitService.getAll(token as string, 10, 1);
      setUnits(response);
    } catch (error: any) {
      dialogs.alert("Error al cargar el tipo de unidades: " + error.message, {
        title: "Error",
      });
    }
  };

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

  const handleGetCurrencies = async () => {
    await currencyService
      .getAll(token as string)
      .then((data) => {
        setCurrencies(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los tipo de moneda, " +
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

    console.log("departamento actual", currentDepartment);
  };

  const handleSelectedDepartment = (event: SelectChangeEvent<string>) => {
    const selectedDepartment = event.target.value;

    if (order) {
      setOrder({
        ...order,
        department: selectedDepartment,
      });
    }
  };

  const handleSelectArea = (event: SelectChangeEvent<string>) => {
    const selectedArea = event.target.value;

    handleGetConcept(parseInt(selectedArea));

    if (order) {
      setOrder({
        ...order,
        area: selectedArea,
      });
    }
  };

  const handleSelectedConcept = (event: SelectChangeEvent<string>) => {
    const selectedConcept = event.target.value;

    if (order) {
      setOrder({
        ...order,
        concept: selectedConcept,
      });
    }
  };

  const handleGetProviders = async () => {
    await suppliersService
      .getAll(token as string)
      .then((data) => {
        setProviders(data);
      })
      .catch((error) => {
        dialogs.alert(
          "Ha ocurrido un error al traer los proveedores, " +
            error.response.data.detail
        );
      });
  };

  const buildDocuments = () => {
    const documents = Object.entries(order?.documents ?? {}).map(
      ([key, value]) => ({
        name: key,
        folder: value,
      })
    );
    return documents;
  };

  const fetchOrder = async () => {
    await orderService
      .getById(token as string, id as string)
      .then((res) => {
        if (![1, 2, 7].includes(res.status_id)) {
          dialogs.alert(
            "No puedes editar una orden que ya fue aprobada o no esta rechazada",
            {
              title: "Error",
            }
          );

          router.push(`/orders/list/`);
          return;
        }

        if (
          res.created_user?.toLowerCase() !== session?.user?.name?.toLowerCase()
        ) {
          dialogs.alert("No puedes editar una orden que no te pertenece", {
            title: "Error",
          });

          router.push(`/orders/list/`);
          return;
        }

        setOrder(res);
        handleGetAreas(res.department);
        handleGetConcept(res.area);
      })
      .catch((err) => {
        dialogs.alert(`Error al obtener la orden ${err}`);
        console.error("Error al obtener la orden: " + err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateProduct: MRT_TableOptions<OrderDetail>["onCreatingRowSave"] =
    async ({ values, table }) => {
      // Validar y agregar el nuevo producto
      const total = values.quantity * values.unit_price;
      const data: AddProduct = {
        quantity: parseFloat(values.quantity),
        unit_price: parseFloat(values.unit_price),
        description: values.description,
        total: total,
        unit_id: values.unit_id,
      };

      if (!order) {
        dialogs.alert("No hay una orden en curso", {
          title: "Error",
        });
        table.setCreatingRow(null);
        return;
      }

      await orderService
        .addItemToOrder(token as string, order?.id, data)
        .then((response) => {
          dialogs.alert("Se ha actualizado la orden con exito", {
            title: "Actualizacion",
          });
          fetchOrder();
        })
        .catch((err) => {
          dialogs.alert("Ha ocurrido un error al actualizar la orden " + err, {
            title: "Error",
          });
        });

      table.setCreatingRow(null);
    };

  const handleEditProduct: MRT_TableOptions<OrderDetail>["onEditingRowSave"] =
    async ({ values, table }) => {
      console.log("valores", values);

      if (!order) {
        dialogs.alert("No hay una orden en curso", {
          title: "Error",
        });
        table.setEditingRow(null);
        return;
      }

      const total = values.quantity * values.unit_price;
      const data: EditProduct = {
        id: values.id,
        quantity: parseFloat(values.quantity),
        unit_price: parseFloat(values.unit_price),
        description: values.description,
        total: total,
        unit_id: values.unit_id,
      };

      await orderService
        .updateItemOrder(token as string, order?.id, data)
        .then((response) => {
          dialogs.alert("Se ha actualizado la orden con exito", {
            title: "Actualizacion",
          });
          fetchOrder();
        })
        .catch((err) => {
          dialogs.alert("Ha ocurrido un error al actualizar la orden " + err, {
            title: "Error",
          });
        });

      table.setEditingRow(null);
    };

  const handleSaveCancelOrder = async () => {
    setLoadingSave(true);
    setSuccess(false);
    await orderService
      .restoreOrder(token as string, id as string)
      .then((res) => {
        setSuccess(true);
        if (res) {
          router.push(`/orders/list/`);
        }
      })
      .catch((err) => {
        dialogs.alert(`Error al restaurar la orden ${err}`);
        console.error("Error al restaurar la orden: " + err);
        setSuccess(false);
      })
      .finally(() => {
        setLoadingSave(false);
      });
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
      handleGetCurrencies();
      handleGetProviders();
      handleGetDepartments();
      fetchUnit();
    }
  }, [id]);

  const columns: MRT_ColumnDef<OrderDetail>[] = [
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
    {
      accessorKey: "unit_id",
      header: "Unidad de medida",
      editVariant: "select",
      Cell: ({ cell }): ReactNode => {
        const unit = units.find((u) => u.id === cell.getValue());
        // @ts-ignore
        return unit ? unit.description : cell.getValue();
      },
      muiEditTextFieldProps: {
        required: true,
        children: units.map((unit) => (
          <MenuItem key={unit.id} value={unit.id}>
            {unit.description}
          </MenuItem>
        )),
        select: true,
      },
    },
    {
      header: "Precio Unitario",
      accessorKey: "unit_price",
    },
    {
      header: "Total",
      accessorKey: "total",
      enableEditing: false,
    },
  ];

  const openDeleteConfirmModal = async (row: MRT_Row<any>) => {
    const result = await dialogs.confirm(
      "Deseas eliminar el documento de la lista?",
      { title: "Eliminar item" }
    );
    if (result && order) {
      await orderService
        .deleteDocument(token as string, row.original.name, order.id)
        .then((response) => {
          dialogs.alert("Se ha eliminado el documento con exito", {
            title: "Actualizacion",
          });
          fetchOrder();
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

  const openDeleteConfirmModalItem = async (row: MRT_Row<OrderDetail>) => {
    const result = await dialogs.confirm(
      "Deseas eliminar el elemento de la lista?",
      { title: "Eliminar item" }
    );
    if (result && order && row.original.id) {
      await orderService
        .deleteItemInOrder(token as string, row.original.id, order.id!)
        .then((response) => {
          dialogs.alert("Se ha actualizado la orden con exito", {
            title: "Actualizacion",
          });
          fetchOrder();
        })
        .catch((err) => {
          dialogs.alert("Ha ocurrido un error al actualizar la orden " + err, {
            title: "Error",
          });
        });

      return;
    }

    dialogs.alert("No se encotro orden activa ni productos", {
      title: "Error",
    });
  };

  const handleSaveDocuments: MRT_TableOptions<OrderDetail>["onCreatingRowSave"] =
  async ({ values, table }) => {
    if (!files || files.length === 0) {
      dialogs.alert("No has seleccionado ningún documento para subirlo", {
        title: "Alerta",
      });
      return;
    }

    if (!order) {
      dialogs.alert("No existe una orden en curso", { title: "Alerta" });
      return;
    }

    const base64Files = await Promise.all(
      files.map(
        (file) =>
          new Promise<{ filename: string; content: string; content_type: string }>(
            (resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                let base64 = result.includes(",") ? result.split(",")[1] : result;
    

                base64 = base64.replace(/\s/g, "").trim();
    
                resolve({
                  filename: file.name,
                  content: base64,
                  content_type: file.type || "application/octet-stream",
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }
          )
      )
    );
    
    

    try {
      await orderService.addDocument(token as string, order.id, base64Files);
      dialogs.alert("📤 Documentos subidos correctamente", {
        title: "Actualización",
      });
      fetchOrder();
    } catch (err: any) {
      dialogs.alert(
        "Ha ocurrido un error al subir los documentos: " +
          (err.response?.data?.detail || err.message),
        { title: "Error" }
      );
    }

    setFiles([]);
    table.setCreatingRow(null);
  };


  const fetchTaxes = async () => {
    try {
      const response = await taxService.getAll(token as string, 10, 1, 1);
      return response;
    } catch (error: any) {
      dialogs.alert("Error al cargar los ajustes fiscales: " + error.message, {
        title: "Error",
      });
      return [];
    }
  };

  const removeTaxesUsed = (taxesGet: TaxesOrder[], taxes: TaxesOrder[]) => {
    return taxesGet.filter((t) => !taxes.some((d) => t.name === d.name));
  };

  const handlerUpdateTaxes = async () => {
    const taxesList = await fetchTaxes();
    const filteredTaxes = removeTaxesUsed(taxesList, order?.taxes || []);
    // @ts-ignore
    const result = await dialogs.open(AddTaxes, filteredTaxes);
    if (result) {
      handleUpdateTax(result, "add");
    }
  };

  const handleUpdateTax = async (tax: TaxesOrder, type: string) => {
    if (!order) {
      dialogs.alert("No existe una orden en curso", {
        title: "Alerta",
      });

      return;
    }

    setLoading(true);
    orderService
      .updateTax(token as string, order.id, type, tax)
      .then((response) => {
        dialogs.alert("Se ha actualizado la orden correctamente", {
          title: "Actualizacion",
        });
        fetchOrder();
      })
      .catch((err) => {
        dialogs.alert("Ha ocurrido un error al actualizar la orden " + err, {
          title: "Error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSaveHeaders = async () => {
    if (!order || !order.area || !order.department || !order.currency) {
      return;
    }

    const data: OrderUpdateHeaders = {
      comments: order.comments,
      description: order.description,
      concept_id: parseInt(order.concept),
      area_id: parseInt(order.area),
      department_id: parseInt(order.department),
      supplier_id: parseInt(order?.supplier),
      currency_id: parseInt(order.currency),
      invoice: order.invoice || "",
      iva: order.iva,
    };

    await orderService
      .updateHeaders(token as string, order?.id, data)
      .then((response) => {
        dialogs.alert("Se ha actualizado la orden con exito", {
          title: "Actualizacion",
        });
        fetchOrder();
      })
      .catch((err) => {
        dialogs.alert("Ha ocurrido un error al actualizar la orden " + err, {
          title: "Error",
        });
      });
  };

  if (loading) {
    return (
      <Container maxWidth={false}>
        <CircularProgress />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth={false}>
        <Typography variant="h6" color="error">
          No se encontró la orden.
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
              value={order.department}
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
                  value={order.area}
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
                  value={order.concept}
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

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <FormControl sx={{ width: "60%" }}>
              <InputLabel id="beneficiario-label">Beneficiario</InputLabel>
              <Select
                labelId="beneficiario-label"
                value={order.supplier}
                onChange={(e) =>
                  setOrder({ ...order, supplier: e.target.value })
                }
              >
                {providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: "35%" }}>
              <InputLabel id="moneda-label">Moneda</InputLabel>
              <Select
                labelId="moneda-label"
                id="currency"
                value={order.currency}
                onChange={(e) =>
                  setOrder({ ...order, currency: e.target.value })
                }
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="description-label" sx={{ mb: 2 }}>
              Descripcion del pago
            </InputLabel>
            <TextArea
              name="descriptionPayment"
              value={order.description}
              onChange={(e) =>
                setOrder({ ...order, description: e.target.value })
              }
              maxRows={2}
              placeholder="Descripción del Pago"
              minRows={3}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="commentaries-label" sx={{ mb: 2 }}>
              Comentarios
            </InputLabel>
            <TextArea
              name="descriptionPayment"
              value={order.comments}
              onChange={(e) => setOrder({ ...order, comments: e.target.value })}
              maxRows={2}
              placeholder="Comentarios del Pago"
              minRows={3}
            />
          </FormControl>

          <Button
            color="primary"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
            startIcon={<TaxIcon />}
            onClick={handlerUpdateTaxes}
          >
            Agregar ajuste
          </Button>
          <Paper
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              listStyle: "none",
              p: 0.5,
              m: 0,
              mb: 2,
            }}
            component="ul"
          >
            {order?.taxes?.map((tax) => (
              <ListItem key={tax.name}>
                <Chip
                  label={`${tax.name}: ${tax.value}`}
                  onDelete={() => handleUpdateTax(tax, "remove")}
                />
              </ListItem>
            ))}
          </Paper>

          <Grid container spacing={2} sx={{ mb: 2 }} justifyContent="center">
            <Grid sx={{ xs: 12, md: 6, width: "45%" }}>
              <FormControl fullWidth>
                <InputLabel htmlFor="outlined-adornment-amount-iva">
                  IVA
                </InputLabel>
                <CurrencyInput
                  label="IVA"
                  width={"100%"}
                  value={order.iva}
                  onChange={(value) =>
                    setOrder({
                      ...order,
                      iva: value,
                    })
                  }
                />
              </FormControl>
            </Grid>

            <Grid sx={{ xs: 12, md: 6, width: "45%" }}>
              <FormControl fullWidth>
                <InputLabel htmlFor="outlined-adornment-amount">
                  Total
                </InputLabel>
                <OutlinedInput
                  type="money"
                  readOnly
                  id="outlined-adornment-amount"
                  label="Total"
                  value={order.total.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                  disabled
                  inputProps={{
                    style: { textAlign: "right" },
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel htmlFor="outlined-adornment-invoice">Folio de Factura</InputLabel>
            <OutlinedInput
              id="outlined-adornment-invoice"
              label="Folio de Factura"
              value={order.invoice}
              onChange={(e) => setOrder({ ...order, invoice: e.target.value })}
            />
          </FormControl>

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

        <Grid size={{ xs: 12, md: 8 }} sx={{ border: "1px solid #ccc", p: 2 }}>
          <MaterialReactTable
            columns={columns}
            data={order.details}
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
            }) => {
              const filteredComponents = internalEditComponents.filter(
                (component: any) =>
                  component?.props?.cell?.column?.id &&
                  !["id", "total", "product"].includes(
                    component.props.cell.column.id
                  )
              );

              return (
                <>
                  <DialogTitle variant="h6">Agregar producto</DialogTitle>
                  <DialogContent
                    dividers
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      maxHeight: "70vh",
                      overflowY: "auto",
                    }}
                  >
                    {filteredComponents}
                  </DialogContent>
                  <DialogActions>
                    <MRT_EditActionButtons
                      variant="text"
                      table={table}
                      row={row}
                    />
                  </DialogActions>
                </>
              );
            }}
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

        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Documentos adjuntos
          </Typography>

          {/* Aquí puedes crear otro MaterialReactTable para documentos */}
          <MaterialReactTable
            createDisplayMode="modal"
            columns={[
              { header: "Nombre", accessorKey: "name" },
              { header: "Folder", accessorKey: "folder" },
            ]}
            data={buildDocuments() as any}
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
      {order.status_id == 7 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 999,
          }}
        >
          <Fab aria-label="save" sx={buttonSx} onClick={handleSaveCancelOrder}>
            {success ? <CheckIcon /> : <SaveIcon />}
          </Fab>
          {loadingSave && (
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
      )}
    </Container>
  );
}
