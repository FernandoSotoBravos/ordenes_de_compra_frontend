"use client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Product, ProductDialog } from "@/app/interfaces/Product.interface";
import { useDialogs } from "@toolpad/core";
import DialogProduct from "@/app/components/dialogs/Product";

const initialData: Product[] = [
  {
    img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
    description: "Breakfast",
    productCode: "@bkristastucchio",
    unit_price: 100,
    quantity: 1,
    id: 0,
    warehouse: "base",
  },
  {
    img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
    description: "Burger",
    productCode: "@rollelflex_graphy726",
    unit_price: 100,
    quantity: 1,
    id: 0,
    warehouse: "base",
  },
  {
    img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
    description: "Camera",
    productCode: "@helloimnik",
    unit_price: 100,
    quantity: 1,
    id: 0,
    warehouse: "base",
  },
  {
    img: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
    description: "Coffee",
    productCode: "@nolanissac",
    unit_price: 100,
    quantity: 1,
    id: 0,
    warehouse: "base",
  },
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const dialogs = useDialogs();
  const itemsPerPage = 4;

  const handleOpenCreate = () => {
    const response = dialogs.open(DialogProduct, {
      action: "create",
      payload: {},
    } as ProductDialog);
  };

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
  };

  const paginatedProducts = products.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDelete = (product: Product) => {
    // Simulate API call
  };

  const handleOpenEdit = (product: Product) => {};

  return (
    <Box p={4}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h5">Catálogo de Productos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Agregar Producto
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {paginatedProducts.map((product, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box
              border="1px solid #ccc"
              borderRadius={2}
              overflow="hidden"
              boxShadow={2}
              position="relative"
            >
              <img
                src={product.img}
                alt={product.description}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
              <Box p={2}>
                <Typography variant="subtitle1">
                  {product.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.productCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.quantity} unidades
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} p={1}>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenEdit(product)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(product)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Stack mt={4} alignItems="center">
        <Pagination
          count={Math.ceil(products.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
        />
      </Stack>
    </Box>
  );
};

export default Products;
