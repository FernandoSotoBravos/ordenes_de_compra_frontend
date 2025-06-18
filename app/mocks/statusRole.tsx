// export const StatusRole: Record<number, string | null> = {
//   4: "Creada",
//   2: "Aprobada por Líder",
//   3: "Aprobada por Líder",
//   6: "Aprobada por contralor",
//   7: "Finalizado",
// };

export const StatusRole: Record<number, number | null> = {
  4: 1,
  2: 2,
  3: 2,
  6: 3,
};

// El rol es necesario para saber quien esta autorizando o rechazando la orden de compra
// se utiliza el rolId para obtener el siguiente estatus al cual debe actualizarse
// este se envia al back
