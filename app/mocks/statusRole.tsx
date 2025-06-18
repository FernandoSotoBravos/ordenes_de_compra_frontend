// export const StatusRole: Record<number, string | null> = {
//   4: "Creada" (1),
//   2: "Aprobada por Líder de area" (10),
//   3: "Aprobada por Líder de departamento" (2),
//   6: "Aprobada por contralor" (3),
//   7: "Finalizado" (8),
// };

export const StatusRole: Record<number, number | null> = {
  4: 1,
  2: 10,
  3: 2,
  6: 3,
};

// El rol es necesario para saber quien esta autorizando o rechazando la orden de compra
// se utiliza el rolId para obtener el siguiente estatus al cual debe actualizarse
// este se envia al back
